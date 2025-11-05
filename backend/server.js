import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Interaction from './models/Interaction.js';
import JobOffer from './models/JobOffer.js';
import Candidate from './models/Candidate.js';

// Import routes
import jobOffersRoutes from './routes/jobOffers.js';
import candidatesRoutes from './routes/candidates.js';
import surveysRoutes from './routes/surveys.js';
import autoReplyRoutes from './routes/autoReply.js';
import settingsRoutes from './routes/settings.js';

// Import services
import autoReplyService from './services/autoReplyService.js';
import nlpService from './services/nlpService.js';
import publishingService from './services/publishingService.js';
import instagramService from './services/instagramService.js';
import webhookHandler from './services/webhookHandler.js';

// Load environment variables
const envResult = dotenv.config();

if (envResult.error) {
  console.warn('⚠️ Warning loading .env file:', envResult.error.message);
} else {
  console.log('✅ Environment variables loaded from .env');
}

const app = express();

// Configuration from .env (lines 7-15)
// Line 8-9: Server Configuration
const PORT = process.env.PORT || 5000;

// Line 11-12: CORS Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Instagram Webhook Secret (legacy name, kept for compatibility)
const INSTAGRAM_WEBHOOK_SECRET = process.env.INSTAGRAM_WEBHOOK_SECRET;

// Verify Token for webhook verification (preferred)
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// MongoDB and other configurations
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/axtronet-instagram';

// Instagram Page Access Token (optional, for sending messages)
const INSTAGRAM_PAGE_ACCESS_TOKEN = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;

// Auto Reply Configuration
const AUTO_REPLY_ENABLED = process.env.AUTO_REPLY_ENABLED !== 'false';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
  });

// Health Check Endpoint
app.get('/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongodb: isConnected ? 'connected' : 'disconnected'
  });
});

// Get all interactions endpoint with filters
app.get('/api/interactions', async (req, res) => {
  try {
    const { 
      type, 
      source, 
      sentiment, 
      postId,
      limit = 100 
    } = req.query;
    
    const query = {};
    
    if (type) query.type = type;
    if (source) query.source = source;
    if (sentiment) query.sentiment = sentiment;
    if (postId) query.postId = postId;
    
    const interactions = await Interaction.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: interactions.length,
      data: interactions
    });
  } catch (error) {
    console.error('Error fetching interactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching interactions',
      error: error.message
    });
  }
});

// Reply to interaction
app.post('/api/interactions/:id/reply', async (req, res) => {
  try {
    const { message, moveToDM } = req.body;
    const interaction = await Interaction.findById(req.params.id);
    
    if (!interaction) {
      return res.status(404).json({
        success: false,
        message: 'Interaction not found'
      });
    }
    
    interaction.replied = true;
    interaction.replyMessage = message;
    interaction.movedToDM = moveToDM || false;
    
    await interaction.save();
    
    // Create or update candidate
    const candidate = await Candidate.findOne({ 
      instagramHandle: interaction.user.toLowerCase() 
    });
    
    if (candidate) {
      candidate.conversations.push({
        message: message,
        type: moveToDM ? 'dm' : 'reply',
        timestamp: new Date(),
        sentiment: interaction.sentiment
      });
      candidate.engagementScore = Math.min(100, candidate.engagementScore + 1);
      await candidate.save();
    }
    
    res.json({
      success: true,
      data: interaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error replying to interaction',
      error: error.message
    });
  }
});

// Get interaction statistics
app.get('/api/stats', async (req, res) => {
  try {
    const totalInteractions = await Interaction.countDocuments();
    const comments = await Interaction.countDocuments({ type: 'comment' });
    const reactions = await Interaction.countDocuments({ type: 'reaction' });
    
    // Get interactions from last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const recentInteractions = await Interaction.countDocuments({
      timestamp: { $gte: yesterday }
    });
    
    // Sentiment analysis
    const positive = await Interaction.countDocuments({ sentiment: 'positive' });
    const neutral = await Interaction.countDocuments({ sentiment: 'neutral' });
    const negative = await Interaction.countDocuments({ sentiment: 'negative' });
    
    // DMs sent (simulated - would be actual count from Instagram API)
    const dmsSent = await Candidate.countDocuments({ 
      'conversations.type': 'dm' 
    });
    
    res.json({
      success: true,
      data: {
        total: totalInteractions,
        comments,
        reactions,
        last24Hours: recentInteractions,
        sentiment: {
          positive,
          neutral,
          negative
        },
        dmsSent
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// Webhook endpoint for Instagram
app.post('/webhook', async (req, res) => {
  try {
    console.log('📥 Webhook received:', req.body);
    
    // Handle different types of Instagram interactions
    const { object, entry } = req.body;
    
    if (object === 'instagram' && entry) {
      for (const item of entry) {
        if (item.messaging) {
          // Handle direct messaging (DMs entrantes)
          console.log('\n📩 ========== PROCESANDO MENSAJES DIRECTOS ==========');
          for (const event of item.messaging) {
            if (event.message) {
              try {
                // Ensure timestamp is always a valid date
                const timestamp = event.timestamp 
                  ? new Date(event.timestamp * 1000)  // Instagram usa timestamp en segundos
                  : new Date();
                
                const senderId = event.sender?.id || 'unknown';
                const messageText = event.message.text || 'Media message';
                const messageId = event.message.mid || `msg_${Date.now()}`;
                
                console.log(`   📩 DM recibido:`);
                console.log(`      De: ${senderId}`);
                console.log(`      Mensaje: "${messageText.substring(0, 50)}..."`);
                console.log(`      Message ID: ${messageId}`);
                
                // Validación: verificar que tenemos datos mínimos
                if (!senderId || senderId === 'unknown') {
                  console.warn('   ⚠️ Mensaje ignorado: remitente desconocido');
                  continue;
                }
                
                // Buscar candidato por sender ID o crear uno nuevo
                const Candidate = (await import('./models/Candidate.js')).default;
                let candidate = await Candidate.findOne({ 
                  $or: [
                    { instagramHandle: senderId.toLowerCase() },
                    { 'metadata.instagramUserId': senderId }
                  ]
                });
                
                if (!candidate) {
                  // Crear nuevo candidato desde el DM
                  candidate = new Candidate({
                    instagramHandle: senderId.toLowerCase(),
                    name: senderId,
                    engagementScore: 5, // DM = mayor engagement
                    conversations: [{
                      message: messageText,
                      type: 'dm',
                      timestamp: timestamp,
                      sentiment: 'neutral'
                    }],
                    status: 'active',
                    metadata: {
                      instagramUserId: senderId,
                      lastDMReceived: timestamp
                    }
                  });
                  await candidate.save();
                  console.log(`   ✅ Nuevo candidato creado desde DM: ${candidate._id}`);
                } else {
                  // Agregar DM a conversación existente
                  candidate.conversations.push({
                    message: messageText,
                    type: 'dm',
                    timestamp: timestamp,
                    sentiment: 'neutral'
                  });
                  candidate.engagementScore = Math.min(100, candidate.engagementScore + 5);
                  candidate.metadata = {
                    ...candidate.metadata,
                    instagramUserId: senderId,
                    lastDMReceived: timestamp
                  };
                  await candidate.save();
                  console.log(`   ✅ DM agregado a conversación de candidato: ${candidate._id}`);
                }
                
                // Crear interacción para el dashboard
                const interaction = new Interaction({
                  type: 'comment', // Usamos 'comment' para DMs también en el dashboard
                  message: messageText,
                  user: senderId,
                  timestamp: timestamp,
                  source: 'dm',
                  metadata: {
                    messageId: messageId,
                    senderId: senderId,
                    isDM: true
                  }
                });
                
                await interaction.save();
                
                // Validación segura antes de acceder a _id
                if (interaction && interaction._id) {
                  console.log(`   💾 Interacción guardada: ${interaction._id}`);
                } else {
                  console.warn('   ⚠️ Interacción guardada pero sin _id válido');
                }
                
                console.log(`   ✅ DM procesado exitosamente`);
              } catch (error) {
                console.error(`   ❌ Error procesando mensaje directo:`, error);
                console.error(`   Mensaje:`, error.message);
                console.error(`   Stack:`, error.stack);
                // Continuar procesando otros eventos
              }
            }
          }
          console.log(`📩 ========== FIN PROCESAMIENTO DMs ==========\n`);
        }
        
        if (item.changes) {
          // Handle changes (comments, reactions, etc.)
          for (const change of item.changes) {
            const { field, value } = change;
            
            if (field === 'comments') {
              // Usar el webhook handler especializado para procesar comentarios
              try {
                const interaction = await webhookHandler.processComment(
                  value,
                  value.media?.id || 'unknown'
                );
                
                // Validación segura: verificar que interaction existe y no es null
                // IMPORTANTE: processComment puede retornar null cuando ignora comentarios
                if (!interaction) {
                  // Comentario ignorado por filtros (loop, duplicado, respuesta del bot)
                  console.log(`ℹ️ Comentario ignorado (evitando loop, duplicado o respuesta del bot)`);
                  // Continuar con el siguiente evento sin error - NO acceder a _id
                  continue;
                }
                
                // Ahora sabemos que interaction existe, pero aún verificamos _id de forma segura
                if (interaction && interaction._id) {
                  console.log(`💾 Comentario procesado y guardado: ${interaction._id}`);
                } else if (interaction) {
                  // Interaction existe pero no tiene _id (caso raro)
                  console.warn(`⚠️ Comentario procesado pero sin _id válido`);
                } else {
                  // Doble verificación (aunque ya debería estar cubierto arriba)
                  console.warn(`⚠️ Interaction es null/undefined después de verificación`);
                }
              } catch (error) {
                console.error(`❌ Error procesando comentario:`, error);
                console.error(`   Mensaje:`, error.message);
                console.error(`   Stack:`, error.stack);
                // Continuar procesando otros eventos sin romper el webhook
              }
            }
            
            if (field === 'reactions') {
              try {
                // Ensure timestamp is always a valid date
                const timestamp = value.created_time 
                  ? new Date(value.created_time * 1000) 
                  : new Date();
                
                const username = value.user?.username || value.user?.id || 'unknown';
                
                // Validación: verificar que tenemos datos mínimos
                if (!username || username === 'unknown') {
                  console.warn('⚠️ Reacción ignorada: usuario desconocido');
                  continue;
                }
                
                const interaction = new Interaction({
                  type: 'reaction',
                  message: `Reaction: ${value.reaction_type}`,
                  user: username,
                  postId: value.media?.id || 'unknown',
                  reactionType: value.reaction_type,
                  timestamp: timestamp,
                  sentiment: 'neutral',
                  source: 'post'
                });
                
                await interaction.save();
                
                // Validación segura antes de acceder a _id
                if (interaction && interaction._id) {
                  console.log('💾 Saved reaction:', interaction._id);
                } else {
                  console.warn('⚠️ Reacción guardada pero sin _id válido');
                }
                
                // Create or update candidate
                await createOrUpdateCandidate(username, `Reaction: ${value.reaction_type}`, 'neutral', 'reaction', value.reaction_type);
              } catch (error) {
                console.error(`❌ Error procesando reacción:`, error);
                console.error(`   Stack:`, error.stack);
                // Continuar procesando otros eventos
              }
            }
          }
        }
      }
    }
    
    // Send 200 OK to Instagram to acknowledge receipt
    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing webhook',
      error: error.message
    });
  }
});

// Webhook verification endpoint (for Instagram webhook setup)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  // Use VERIFY_TOKEN from environment (preferred) or fallback to INSTAGRAM_WEBHOOK_SECRET
  const verifyToken = VERIFY_TOKEN || INSTAGRAM_WEBHOOK_SECRET;
  
  console.log('\n🔍 === WEBHOOK VERIFICATION REQUEST ===');
  console.log('  Mode:', mode);
  console.log('  Received token (hub.verify_token):', token || 'NOT PROVIDED');
  console.log('  Expected token (VERIFY_TOKEN):', verifyToken || 'NOT SET IN .env');
  console.log('  Challenge:', challenge || 'NOT PROVIDED');
  console.log('  Tokens match?', token === verifyToken);
  console.log('=========================================\n');
  
  if (!verifyToken) {
    console.error('❌ ERROR: VERIFY_TOKEN or INSTAGRAM_WEBHOOK_SECRET not set in .env file!');
    console.error('   Please add to .env: VERIFY_TOKEN=your_token');
    return res.status(500).send('Server configuration error');
  }
  
  if (!mode || !token || !challenge) {
    console.warn('⚠️ Missing required parameters');
    console.warn('   Mode:', mode || 'MISSING');
    console.warn('   Token:', token || 'MISSING');
    console.warn('   Challenge:', challenge || 'MISSING');
    return res.status(400).send('Missing required parameters');
  }
  
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ Webhook verified successfully!');
    res.status(200).send(challenge);
  } else {
    console.warn('⚠️ Webhook verification FAILED');
    if (mode !== 'subscribe') {
      console.warn('   Reason: Invalid mode. Expected "subscribe", got:', mode);
    }
    if (token !== verifyToken) {
      console.warn('   Reason: Token mismatch');
      console.warn('   Received:', token);
      console.warn('   Expected:', verifyToken);
    }
    res.sendStatus(403);
  }
});

// Helper function for sentiment analysis
function analyzeSentiment(text) {
  const positiveWords = ['gracias', 'excelente', 'bueno', 'genial', 'perfecto', 'me encanta', 'interesado', 'vacante', 'empleo'];
  const negativeWords = ['malo', 'horrible', 'no', 'rechazo', 'problema', 'error'];
  
  const lowerText = text.toLowerCase();
  let score = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) score++;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) score--;
  });
  
  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}

// Helper function to create or update candidate
async function createOrUpdateCandidate(username, message, sentiment, type, reactionType = null, analysis = null) {
  try {
    // Validación: verificar que username es válido
    if (!username || username === 'unknown') {
      console.warn('⚠️ No se puede crear/actualizar candidato: username inválido');
      return null;
    }
    
    let candidate = await Candidate.findOne({ instagramHandle: username.toLowerCase() });
    
    if (!candidate) {
      candidate = new Candidate({
        instagramHandle: username.toLowerCase(),
        name: username,
        engagementScore: 1,
        conversations: [{
          message: message,
          type: type,
          timestamp: new Date(),
          sentiment: sentiment
        }]
      });

      // Agregar información demográfica si está disponible
      if (analysis && analysis.demographic) {
        candidate.interestAreas = analysis.jobKeywords || [];
        candidate.metadata = {
          ...candidate.metadata,
          location: analysis.demographic.location,
          age: analysis.demographic.age,
          experience: analysis.demographic.experience
        };
      }
    } else {
      candidate.conversations.push({
        message: message,
        type: type,
        timestamp: new Date(),
        sentiment: sentiment
      });
      candidate.engagementScore = Math.min(100, candidate.engagementScore + 1);

      // Actualizar información demográfica
      if (analysis && analysis.demographic) {
        if (analysis.jobKeywords && analysis.jobKeywords.length > 0) {
          candidate.interestAreas = [...new Set([...candidate.interestAreas, ...analysis.jobKeywords])];
        }
        if (analysis.demographic.location && !candidate.metadata.location) {
          candidate.metadata = {
            ...candidate.metadata,
            location: analysis.demographic.location
          };
        }
      }
    }
    
    if (reactionType) {
      candidate.reactions.push({
        reactionType: reactionType,
        timestamp: new Date()
      });
    }
    
    await candidate.save();
    
    // Validación segura: verificar que candidate se guardó correctamente
    if (candidate && candidate._id) {
      return candidate;
    } else {
      console.warn('⚠️ Candidato guardado pero sin _id válido');
      return candidate;
    }
  } catch (error) {
    console.error('❌ Error creating/updating candidate:', error);
    console.error('   Stack:', error.stack);
    // No lanzar el error para que el proceso continúe
    return null;
  }
}

// API Routes
app.use('/api/job-offers', jobOffersRoutes);
app.use('/api/candidates', candidatesRoutes);
app.use('/api/surveys', surveysRoutes);
app.use('/api/auto-reply', autoReplyRoutes);
app.use('/api/settings', settingsRoutes);

// New endpoints for full functionality

// Publicar oferta laboral (post o story)
app.post('/api/job-offers/:id/publish-instagram', async (req, res) => {
  try {
    const { type = 'post' } = req.body; // 'post' or 'story'
    const result = await publishingService.publishJobOffer(req.params.id, type);
    
    // Identificar candidatos interesados automáticamente después de publicar
    setTimeout(async () => {
      try {
        await publishingService.identifyInterestedCandidates(result.jobOffer.instagramPostId);
      } catch (error) {
        console.error('Error identifying candidates:', error);
      }
    }, 5000); // Esperar 5 segundos para que haya interacciones
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error publishing job offer',
      error: error.message
    });
  }
});

// Publicar encuesta (post o story)
app.post('/api/surveys/:id/publish-instagram', async (req, res) => {
  try {
    const { type = 'post' } = req.body;
    const result = await publishingService.publishSurvey(req.params.id, type);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error publishing survey',
      error: error.message
    });
  }
});

// Continuar conversación por DM
app.post('/api/candidates/:id/continue-dm', async (req, res) => {
  try {
    const { message } = req.body;
    const candidate = await Candidate.findById(req.params.id);
    
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    const result = await instagramService.sendDirectMessage(
      candidate.instagramHandle,
      message
    );

    // Agregar a historial de conversación
    candidate.conversations.push({
      message: message,
      type: 'dm',
      timestamp: new Date(),
      sentiment: 'neutral'
    });

    candidate.status = 'contacted';
    await candidate.save();

    res.json({
      success: true,
      ...result,
      candidate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending DM',
      error: error.message
    });
  }
});

// Identificar candidatos interesados en un post específico
app.post('/api/job-offers/:id/identify-candidates', async (req, res) => {
  try {
    const jobOffer = await JobOffer.findById(req.params.id);
    
    if (!jobOffer || !jobOffer.instagramPostId) {
      return res.status(404).json({
        success: false,
        message: 'Job offer not found or not published'
      });
    }

    const result = await publishingService.identifyInterestedCandidates(
      jobOffer.instagramPostId
    );

    // Actualizar analytics de la oferta
    jobOffer.analytics.interestedCandidates = result.count;
    await jobOffer.save();

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error identifying candidates',
      error: error.message
    });
  }
});

// Recolectar información demográfica
app.get('/api/analytics/demographics', async (req, res) => {
  try {
    const demographics = await publishingService.collectDemographicData();
    res.json({
      success: true,
      data: demographics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error collecting demographic data',
      error: error.message
    });
  }
});

// Procesar auto-reply manualmente para una interacción
app.post('/api/interactions/:id/process-auto-reply', async (req, res) => {
  try {
    const interaction = await Interaction.findById(req.params.id);
    
    if (!interaction) {
      return res.status(404).json({
        success: false,
        message: 'Interaction not found'
      });
    }

    const result = await autoReplyService.processInteraction(interaction);
    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing auto-reply',
      error: error.message
    });
  }
});

// Analizar interacción con NLP
app.post('/api/interactions/:id/analyze', async (req, res) => {
  try {
    const interaction = await Interaction.findById(req.params.id);
    
    if (!interaction) {
      return res.status(404).json({
        success: false,
        message: 'Interaction not found'
      });
    }

    const analysis = nlpService.analyzeInteraction(interaction);
    
    // Actualizar interacción con análisis
    interaction.metadata = {
      ...interaction.metadata,
      jobInterest: analysis.jobInterest,
      topics: analysis.topics,
      jobKeywords: analysis.jobKeywords,
      demographic: analysis.demographic,
      priority: analysis.priority
    };
    await interaction.save();

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error analyzing interaction',
      error: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// Initialize default template on startup
async function initializeDefaultTemplate() {
  try {
    const AutoReplyTemplate = (await import('./models/AutoReplyTemplate.js')).default;
    const Settings = (await import('./models/Settings.js')).default;
    
    // Crear template por defecto si no existe
    let defaultTemplate = await AutoReplyTemplate.findOne({ isDefault: true });
    if (!defaultTemplate) {
      defaultTemplate = new AutoReplyTemplate({
        name: 'Respuesta General por Defecto',
        template: '¡Gracias por comentar! 😊',
        category: 'general',
        isActive: true,
        isDefault: true,
        smartRules: {
          keywords: [],
          sentiment: 'any',
          triggerOn: 'always'
        }
      });
      await defaultTemplate.save();
      console.log('✅ Template de auto-reply por defecto creado');
    } else {
      console.log('✅ Template de auto-reply por defecto ya existe');
    }
    
    // HABILITAR auto-reply por defecto SIEMPRE si no está configurado o está deshabilitado
    const settings = await Settings.getSettings();
    const shouldEnable = settings.autoReply?.enabled === undefined || 
                         settings.autoReply?.enabled === null || 
                         settings.autoReply?.enabled === false;
    
    if (shouldEnable) {
      // Validación segura: verificar que defaultTemplate existe antes de acceder a _id
      if (defaultTemplate && defaultTemplate._id) {
        settings.autoReply = {
          enabled: true,  // FORZAR habilitado
          defaultTemplate: defaultTemplate._id
        };
      } else {
        console.warn('⚠️ Template por defecto no tiene _id, habilitando auto-reply sin template');
        settings.autoReply = {
          enabled: true,
          defaultTemplate: null
        };
      }
      await settings.save();
      console.log('✅ Auto-reply HABILITADO automáticamente por defecto');
      console.log(`   Estado guardado: enabled = ${settings.autoReply.enabled}`);
    } else {
      console.log(`ℹ️ Auto-reply ya está configurado: enabled = ${settings.autoReply?.enabled}`);
    }
  } catch (error) {
    console.error('⚠️ Error inicializando template por defecto:', error.message);
    console.error('   Stack:', error.stack);
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🪝 Webhook endpoint: http://localhost:${PORT}/webhook`);
  console.log(`\n📝 Environment variables (from .env lines 7-15):`);
  console.log(`   PORT (line 9): ${PORT}`);
  console.log(`   FRONTEND_URL (line 12): ${FRONTEND_URL}`);
  console.log(`   VERIFY_TOKEN: ${VERIFY_TOKEN ? '✅ Set (' + VERIFY_TOKEN + ')' : '❌ Missing'}`);
  console.log(`   INSTAGRAM_WEBHOOK_SECRET (legacy): ${INSTAGRAM_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing'}`);
  console.log(`\n📝 Other environment variables:`);
  console.log(`   MONGODB_URI: ${MONGODB_URI ? '✅ Set' : '❌ Missing'}`);
  console.log(`   INSTAGRAM_PAGE_ACCESS_TOKEN: ${INSTAGRAM_PAGE_ACCESS_TOKEN ? '✅ Set' : '❌ Missing'}`);
  console.log(`   AUTO_REPLY_ENABLED: ${AUTO_REPLY_ENABLED}`);
  console.log('');
  
  // Initialize default template
  await initializeDefaultTemplate();
});

export default app;


