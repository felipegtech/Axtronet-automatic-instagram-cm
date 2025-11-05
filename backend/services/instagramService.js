import axios from 'axios';

const INSTAGRAM_API_URL = 'https://graph.instagram.com';

class InstagramService {
  // Obtener el token de acceso desde Settings o .env
  async getAccessToken() {
    try {
      // Primero intentar desde Settings (MongoDB)
      const Settings = (await import('../models/Settings.js')).default;
      const settings = await Settings.getSettings();
      
      if (settings.instagram?.pageAccessToken) {
        console.log('   ✅ Token obtenido desde Settings (MongoDB)');
        return settings.instagram.pageAccessToken;
      }
      
      // Si no está en Settings, usar .env
      const tokenFromEnv = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;
      if (tokenFromEnv) {
        console.log('   ✅ Token obtenido desde .env');
        return tokenFromEnv;
      }
      
      // Si no está en ningún lado
      console.error('   ❌ Token no encontrado en Settings ni en .env');
      return null;
    } catch (error) {
      console.error('   ⚠️ Error obteniendo token:', error.message);
      // Fallback a .env
      return process.env.INSTAGRAM_PAGE_ACCESS_TOKEN || null;
    }
  }
  // Simular publicación de post
  async publishPost(imageUrl, caption, hashtags = []) {
    try {
      // En producción, esto usaría la API real de Instagram
      // Por ahora simulamos la respuesta
      const hashtagsString = hashtags.map(tag => `#${tag}`).join(' ');
      const fullCaption = `${caption}\n\n${hashtagsString}`;
      
      const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('📤 Publishing post to Instagram:', {
        postId,
        caption: fullCaption,
        imageUrl
      });
      
      return {
        success: true,
        postId,
        permalink: `https://www.instagram.com/p/${postId}/`,
        caption: fullCaption
      };
    } catch (error) {
      console.error('Error publishing post:', error);
      throw error;
    }
  }

  // Simular publicación de story
  async publishStory(imageUrl, stickerData = null) {
    try {
      const storyId = `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('📱 Publishing story to Instagram:', {
        storyId,
        imageUrl,
        stickerData
      });
      
      return {
        success: true,
        storyId,
        imageUrl
      };
    } catch (error) {
      console.error('Error publishing story:', error);
      throw error;
    }
  }

  // Obtener Instagram Business Account ID
  async getInstagramBusinessAccountId() {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        throw new Error('Access token no disponible');
      }

      // Obtener la página de Facebook asociada
      const pageResponse = await axios.get(`https://graph.facebook.com/v18.0/me/accounts`, {
        params: {
          access_token: accessToken,
          fields: 'instagram_business_account'
        }
      });

      if (pageResponse.data.data && pageResponse.data.data.length > 0) {
        const page = pageResponse.data.data[0];
        if (page.instagram_business_account) {
          return page.instagram_business_account.id;
        }
      }

      // Si no se encuentra, intentar obtener directamente desde el token
      const meResponse = await axios.get(`https://graph.facebook.com/v18.0/me`, {
        params: {
          access_token: accessToken,
          fields: 'instagram_business_account'
        }
      });

      if (meResponse.data.instagram_business_account?.id) {
        return meResponse.data.instagram_business_account.id;
      }

      return null;
    } catch (error) {
      console.error('Error obteniendo Instagram Business Account ID:', error.response?.data || error.message);
      return null;
    }
  }

  // Obtener ID de usuario desde username (requiere que el usuario haya iniciado conversación)
  async getUserIdFromUsername(username) {
    try {
      // Nota: Instagram Graph API no permite buscar usuarios por username directamente
      // Solo podemos obtener IDs de usuarios que ya han iniciado conversación con nosotros
      // Por ahora retornamos el username como está y usaremos el endpoint de mensajes
      return username;
    } catch (error) {
      console.error('Error obteniendo user ID:', error);
      return username;
    }
  }

  // Enviar mensaje directo (DM) usando Instagram Graph API
  async sendDirectMessage(recipientIdOrUsername, message) {
    try {
      console.log('\n   📩 [SEND-DM] Iniciando envío de mensaje directo...');
      console.log(`   Destinatario: ${recipientIdOrUsername}`);
      console.log(`   Mensaje: "${message.substring(0, 50)}..."`);

      const accessToken = await this.getAccessToken();
      
      if (!accessToken) {
        console.error('❌ INSTAGRAM_PAGE_ACCESS_TOKEN no está configurado');
        throw new Error('Instagram Page Access Token no configurado. Por favor, configúralo en Settings → Instagram API.');
      }

      // Obtener Instagram Business Account ID
      const igBusinessAccountId = await this.getInstagramBusinessAccountId();
      
      if (!igBusinessAccountId) {
        console.warn('⚠️ No se pudo obtener Instagram Business Account ID');
        console.warn('   Esto puede ser normal si el token no tiene permisos o la cuenta no está vinculada');
        console.warn('   Intentando enviar DM de todas formas...');
      }

      // Instagram Graph API endpoint para enviar DMs
      // POST https://graph.facebook.com/v18.0/{ig-user-id}/messages
      // Requiere: recipient (objeto con id), message (objeto con text)
      
      // IMPORTANTE: Para enviar DMs, necesitamos:
      // 1. El usuario debe haber iniciado conversación primero (Instagram no permite iniciar DMs)
      // 2. O usar el ID de Instagram del usuario (no username)
      
      // Intentar enviar usando el endpoint de mensajes
      let url;
      if (igBusinessAccountId) {
        url = `https://graph.facebook.com/v18.0/${igBusinessAccountId}/messages`;
      } else {
        // Fallback: intentar con el token directamente
        url = `https://graph.facebook.com/v18.0/me/messages`;
      }

      console.log(`   📤 URL: ${url}`);
      console.log(`   Intentando enviar DM...`);

      // Formato requerido por Instagram Graph API para mensajes
      const messageData = {
        recipient: {
          // Si es un ID numérico, usarlo; si no, intentar como username
          id: recipientIdOrUsername.match(/^\d+$/) ? recipientIdOrUsername : recipientIdOrUsername
        },
        message: {
          text: message
        }
      };

      let response;
      try {
        const formData = new URLSearchParams();
        formData.append('recipient', JSON.stringify(messageData.recipient));
        formData.append('message', JSON.stringify(messageData.message));
        formData.append('access_token', accessToken);

        response = await axios.post(url, formData.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

        console.log(`   ✅ DM enviado exitosamente!`);
        console.log(`   Message ID: ${response.data.message_id || 'N/A'}`);
        
        return {
          success: true,
          messageId: response.data.message_id || `msg_${Date.now()}`,
          recipientId: recipientIdOrUsername,
          message,
          timestamp: new Date(),
          instagramResponse: response.data
        };
      } catch (error) {
        // Si falla, puede ser porque:
        // 1. El usuario no ha iniciado conversación
        // 2. Necesitamos el ID numérico del usuario
        // 3. El token no tiene permisos para enviar DMs
        
        console.error('   ❌ Error enviando DM:', error.response?.data || error.message);
        
        if (error.response) {
          console.error('   Status:', error.response.status);
          console.error('   Data:', JSON.stringify(error.response.data, null, 2));
          
          // Mensajes de error específicos
          if (error.response.status === 400) {
            const errorData = error.response.data;
            if (errorData.error?.message?.includes('recipient')) {
              console.error('   💡 El usuario no ha iniciado conversación con tu cuenta');
              console.error('   💡 Instagram requiere que el usuario envíe el primer mensaje');
              throw new Error('No se puede enviar DM: El usuario debe iniciar la conversación primero. Instagram solo permite responder a mensajes existentes.');
            }
          } else if (error.response.status === 403) {
            console.error('   💡 El token no tiene permisos para enviar DMs');
            console.error('   💡 Necesitas permisos: instagram_manage_messages, pages_messaging');
            throw new Error('No tienes permisos para enviar DMs. Verifica los permisos del token en Facebook Developers.');
          }
        }

        // Si falla completamente, registrar pero no lanzar error crítico
        console.warn('   ⚠️ No se pudo enviar DM, pero el sistema continuará funcionando');
        
        // Retornar respuesta simulada para que el sistema no se rompa
        return {
          success: false,
          messageId: `msg_sim_${Date.now()}`,
          recipientId: recipientIdOrUsername,
          message,
          timestamp: new Date(),
          warning: 'DM no enviado: El usuario debe iniciar conversación primero o verifica permisos del token',
          error: error.response?.data?.error?.message || error.message
        };
      }
    } catch (error) {
      console.error('❌ Error crítico enviando DM:', error.message);
      throw error;
    }
  }

  // Responder a comentario usando Instagram Graph API
  async replyToComment(commentId, message) {
    try {
      console.log('   🔑 Obteniendo token de acceso...');
      
      // Obtener token desde Settings o .env
      const accessToken = await this.getAccessToken();
      
      if (!accessToken) {
        console.error('❌ INSTAGRAM_PAGE_ACCESS_TOKEN no está configurado');
        console.error('   💡 Configura el token en:');
        console.error('      1. Settings → Instagram API → Page Access Token');
        console.error('      2. O en el archivo .env como INSTAGRAM_PAGE_ACCESS_TOKEN');
        throw new Error('Instagram Page Access Token no configurado. Por favor, configúralo en Settings → Instagram API.');
      }

      if (!commentId) {
        throw new Error('Comment ID es requerido');
      }

      // Instagram Graph API endpoint para responder a comentarios
      // POST https://graph.instagram.com/{comment-id}/replies
      const url = `${INSTAGRAM_API_URL}/${commentId}/replies`;
      
      console.log('   💬 Enviando respuesta automática a comentario:');
      console.log(`      Comment ID: ${commentId}`);
      console.log(`      Mensaje: "${message.substring(0, 50)}..."`);
      console.log(`      URL: ${url}`);

      // Instagram Graph API - formato correcto para responder a comentarios
      // Endpoint: POST https://graph.instagram.com/{comment-id}/replies
      // Parámetros: message (texto) y access_token
      
      // Intentar primero con body (método más común)
      let response;
      try {
        const formData = new URLSearchParams();
        formData.append('message', message);
        formData.append('access_token', accessToken);
        
        console.log('   📤 Intentando con form-data...');
        response = await axios.post(url, formData.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
      } catch (error) {
        // Si falla con form data, intentar con query string
        console.log('   ⚠️ Form-data falló, intentando con query string...');
        const urlWithParams = `${url}?message=${encodeURIComponent(message)}&access_token=${accessToken}`;
        
        response = await axios.post(urlWithParams);
      }

      console.log(`   ✅ Respuesta automática enviada exitosamente a Instagram!`);
      console.log(`   Comment ID: ${commentId}`);
      console.log(`   Reply ID: ${response.data.id || 'N/A'}`);
      console.log(`   Mensaje: "${message.substring(0, 50)}..."`);

      return {
        success: true,
        commentId,
        replyId: response.data.id,
        message,
        timestamp: new Date(),
        instagramResponse: response.data
      };
    } catch (error) {
      console.error('   ❌ Error replying to comment:', error.response?.data || error.message);
      
      // Si es un error de la API, loguear más detalles
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', JSON.stringify(error.response.data, null, 2));
        
        // Mensajes de error más claros
        if (error.response.status === 401) {
          console.error('   💡 El token de acceso es inválido o ha expirado');
        } else if (error.response.status === 403) {
          console.error('   💡 No tienes permisos para responder a este comentario');
        }
      }
      
      throw error;
    }
  }

  // Obtener información del usuario
  async getUserInfo(username) {
    try {
      // Simulado - en producción usaría la API real
      return {
        success: true,
        username,
        profilePicture: null,
        followers: 0,
        following: 0
      };
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  }
}

export default new InstagramService();

