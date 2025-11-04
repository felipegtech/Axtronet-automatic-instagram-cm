import express from 'express';
import AutoReplyTemplate from '../models/AutoReplyTemplate.js';

const router = express.Router();

// Get all templates
router.get('/templates', async (req, res) => {
  try {
    const templates = await AutoReplyTemplate.find()
      .sort({ isDefault: -1, createdAt: -1 });
    
    res.json({
      success: true,
      count: templates.length,
      data: templates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching templates',
      error: error.message
    });
  }
});

// Get single template
router.get('/templates/:id', async (req, res) => {
  try {
    const template = await AutoReplyTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching template',
      error: error.message
    });
  }
});

// Create template
router.post('/templates', async (req, res) => {
  try {
    const template = new AutoReplyTemplate(req.body);
    await template.save();
    
    res.status(201).json({
      success: true,
      data: template
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating template',
      error: error.message
    });
  }
});

// Update template
router.put('/templates/:id', async (req, res) => {
  try {
    const template = await AutoReplyTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating template',
      error: error.message
    });
  }
});

// Delete template
router.delete('/templates/:id', async (req, res) => {
  try {
    const template = await AutoReplyTemplate.findByIdAndDelete(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting template',
      error: error.message
    });
  }
});

// Preview template with variables
router.post('/templates/:id/preview', async (req, res) => {
  try {
    const template = await AutoReplyTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    const { username, post_title, sentiment, company_name } = req.body;
    
    let preview = template.template;
    preview = preview.replace(/{username}/g, username || '@username');
    preview = preview.replace(/{post_title}/g, post_title || 'Post Title');
    preview = preview.replace(/{sentiment}/g, sentiment || 'neutral');
    preview = preview.replace(/{company_name}/g, company_name || 'Company');
    
    res.json({
      success: true,
      data: {
        original: template.template,
        preview
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating preview',
      error: error.message
    });
  }
});

// Get active templates
router.get('/templates/active', async (req, res) => {
  try {
    const templates = await AutoReplyTemplate.find({ isActive: true })
      .sort({ isDefault: -1, createdAt: -1 });
    
    res.json({
      success: true,
      count: templates.length,
      data: templates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching active templates',
      error: error.message
    });
  }
});

export default router;

