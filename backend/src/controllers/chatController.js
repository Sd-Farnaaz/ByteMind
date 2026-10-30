const Groq = require('groq-sdk');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { SYSTEM_PROMPT } = require('../config/prompts');

// Initialize Groq with error handling
let groq = null;
try {
  if (process.env.GROQ_API_KEY) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
    console.log('✅ Groq API client initialized');
  } else {
    console.warn('⚠️ GROQ_API_KEY is not defined in environment variables');
  }
} catch (error) {
  console.error('❌ Groq initialization failed:', error.message);
}

const generateImage = async (req, res) => {
  try {
    const { prompt, conversationId: tempConvId } = req.body;
    const userId = req.user.id;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required for image generation.'
      });
    }

    const cleanPrompt = prompt.trim();
    console.log(`🎨 Generating image for user ${userId}: "${cleanPrompt}"`);

    // Find or create conversation
    let conversation = null;
    if (tempConvId) {
      conversation = await Conversation.findOne({ userId, conversationId: tempConvId });
    }

    if (!conversation) {
      conversation = await Conversation.create({
        userId,
        conversationId: `conv_${Date.now()}`,
        title: `🎨 ${cleanPrompt.slice(0, 40)}`,
        messages: []
      });

      await User.findByIdAndUpdate(userId, {
        $push: {
          conversations: {
            conversationId: conversation.conversationId,
            title: conversation.title,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
      });
    }

    // Add user prompt to conversation history
    conversation.messages.push({
      role: 'user',
      content: cleanPrompt.startsWith('/image') ? cleanPrompt : `/image ${cleanPrompt}`,
      type: 'text',
      timestamp: new Date()
    });

    // Generate Pollinations Flux image URL
    const seed = Math.floor(Math.random() * 10000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt.replace(/^\/(image|imagine)\s+/i, ''))}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;

    // Add assistant response with image
    const assistantMessage = {
      role: 'assistant',
      content: `🎨 Generated image for: "${cleanPrompt.replace(/^\/(image|imagine)\s+/i, '')}"`,
      type: 'image',
      imageUrl: imageUrl,
      timestamp: new Date()
    };
    conversation.messages.push(assistantMessage);

    conversation.updatedAt = new Date();
    await conversation.save();

    console.log(`✅ Image generated and saved for user ${userId}`);

    return res.json({
      success: true,
      message: assistantMessage.content,
      type: 'image',
      imageUrl: imageUrl,
      conversationId: conversation.conversationId,
      timestamp: assistantMessage.timestamp.toISOString()
    });
  } catch (error) {
    console.error('❌ Error generating image:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate image',
      conversationId: req.body.conversationId || `conv_${Date.now()}`
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { message, conversationId: tempConvId, attachedImage } = req.body;
    const userId = req.user.id;

    if ((!message || !message.trim()) && !attachedImage) {
      return res.status(400).json({
        success: false,
        message: 'Message content or an attached image is required.'
      });
    }

    const trimmedMessage = (message || '').trim();

    // Check if user requested image generation via slash command
    if (/^\/(image|imagine)\s+/i.test(trimmedMessage)) {
      req.body.prompt = trimmedMessage.replace(/^\/(image|imagine)\s+/i, '').trim();
      return generateImage(req, res);
    }

    console.log(`📨 Received message from user ${userId}`);

    // Find or create conversation
    let conversation = null;

    if (tempConvId) {
      conversation = await Conversation.findOne({ 
        userId, 
        conversationId: tempConvId 
      });
    }

    if (!conversation) {
      conversation = await Conversation.create({
        userId,
        conversationId: `conv_${Date.now()}`,
        title: trimmedMessage ? trimmedMessage.slice(0, 50) : 'Attached Screenshot',
        messages: []
      });

      await User.findByIdAndUpdate(userId, {
        $push: {
          conversations: {
            conversationId: conversation.conversationId,
            title: conversation.title,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
      });
    }

    // Add user message to conversation history (with attachedImage if provided)
    conversation.messages.push({
      role: 'user',
      content: trimmedMessage || 'Shared an image',
      type: 'text',
      attachedImage: attachedImage || null,
      timestamp: new Date()
    });

    // Prepare messages for AI (last 10 turns context)
    const chatHistory = conversation.messages.slice(-10).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.attachedImage
        ? `${msg.content}\n[Note: User attached an image/screenshot with this message]`
        : (msg.content || '')
    }));

    if (!groq) {
      conversation.updatedAt = new Date();
      await conversation.save();

      return res.status(500).json({
        success: false,
        message: 'Groq AI service is not initialized on server. Please check your GROQ_API_KEY in Render Dashboard Environment.',
        conversationId: conversation.conversationId
      });
    }

    // Candidate models to attempt in order if a specific model is missing or deprecated
    const requestedModel = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
    const candidateModels = [
      requestedModel,
      'openai/gpt-oss-20b',
      'qwen/qwen3.8-27b',
      'allam-2-7b',
      'llama-3.1-8b-instant'
    ];
    const uniqueModels = [...new Set(candidateModels)];

    let aiResponse = null;
    let lastError = null;

    for (const modelToTry of uniqueModels) {
      try {
        console.log(`🔄 Calling Groq API (${modelToTry})...`);

        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: SYSTEM_PROMPT || 'You are ByteMind AI, a helpful, friendly, and knowledgeable assistant.'
            },
            ...chatHistory
          ],
          model: modelToTry,
          temperature: 0.7,
          max_tokens: 1000,
        });

        aiResponse = completion.choices[0]?.message?.content;
        console.log(`✅ Groq API response received using model: ${modelToTry}`);
        break; // Success, exit loop
      } catch (err) {
        lastError = err;
        console.warn(`⚠️ Model ${modelToTry} failed: ${err.message}`);
        // If 401 unauthorized (key invalid), do not retry other models as key is invalid for all
        if (err.status === 401) {
          break;
        }
      }
    }

    if (!aiResponse) {
      console.error('❌ All Groq attempts failed:', lastError?.message, 'Status:', lastError?.status);

      // Save user message to database even when API fails
      conversation.updatedAt = new Date();
      await conversation.save();

      const isKeyError = lastError?.status === 401;
      const errorMsg = isKeyError
        ? 'Invalid or expired Groq API Key. Please update your GROQ_API_KEY in Render Dashboard -> Environment.'
        : (lastError?.message || 'AI service encountered an error generating response.');

      return res.status(502).json({
        success: false,
        message: errorMsg,
        conversationId: conversation.conversationId
      });
    }

    // Add AI response to history
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    });

    conversation.updatedAt = new Date();
    await conversation.save();

    console.log(`✅ Response sent to user ${userId}`);

    res.json({
      success: true,
      message: aiResponse,
      conversationId: conversation.conversationId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ General Error in sendMessage:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while processing your request',
      conversationId: req.body.conversationId || `conv_${Date.now()}`,
      timestamp: new Date().toISOString()
    });
  }
};

const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.find({ userId })
      .sort({ updatedAt: -1 })
      .select('conversationId title updatedAt createdAt');

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
};

const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findOne({ 
      userId, 
      conversationId 
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      messages: conversation.messages,
      title: conversation.title
    });
  } catch (error) {
    console.error('Error fetching messages:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

const clearConversation = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const userId = req.user.id;

    const conversation = await Conversation.findOne({ userId, conversationId });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    conversation.messages = [];
    conversation.updatedAt = new Date();
    await conversation.save();

    res.json({
      success: true,
      message: 'Conversation cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing conversation:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to clear conversation'
    });
  }
};

const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const userId = req.user.id;

    const deleted = await Conversation.findOneAndDelete({ userId, conversationId });
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Also remove from user conversations array
    await User.findByIdAndUpdate(userId, {
      $pull: { conversations: { conversationId } }
    });

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting conversation:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete conversation'
    });
  }
};

const renameConversation = async (req, res) => {
  try {
    const { conversationId, title } = req.body;
    const userId = req.user.id;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A valid title is required.'
      });
    }

    const conversation = await Conversation.findOne({ userId, conversationId });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    conversation.title = title.trim();
    conversation.updatedAt = new Date();
    await conversation.save();

    // Also update in user.conversations array
    await User.updateOne(
      { _id: userId, 'conversations.conversationId': conversationId },
      { $set: { 'conversations.$.title': title.trim(), 'conversations.$.updatedAt': new Date() } }
    );

    res.json({
      success: true,
      message: 'Conversation renamed successfully',
      title: conversation.title
    });
  } catch (error) {
    console.error('Error renaming conversation:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to rename conversation'
    });
  }
};

module.exports = {
  sendMessage,
  generateImage,
  getConversations,
  getConversationMessages,
  clearConversation,
  deleteConversation,
  renameConversation
};
