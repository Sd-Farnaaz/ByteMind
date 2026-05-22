const Groq = require('groq-sdk');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// Initialize Groq with error handling
let groq;
try {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });
  console.log('✅ Groq API initialized');
} catch (error) {
  console.error('❌ Groq initialization failed:', error.message);
}

const sendMessage = async (req, res) => {
  try {
    const { message, conversationId: tempConvId } = req.body;
    const userId = req.user.id;
    
    console.log(`📨 User ${userId}: ${message}`);
    console.log(`🔑 Groq API Key exists: ${!!process.env.GROQ_API_KEY}`);
    console.log(`🔑 API Key starts with: ${process.env.GROQ_API_KEY?.substring(0, 10)}...`);
    
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
        title: message.slice(0, 50),
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
    
    // Add user message
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });
    
    // Prepare messages for AI
    const chatHistory = conversation.messages.slice(-10).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
    
    const messages = [
      {
        role: 'system',
        content: 'You are a professional AI assistant. Give detailed, accurate, and helpful answers. Be friendly and professional.'
      },
      ...chatHistory
    ];
    
    // Call Groq API with better error handling
    let aiResponse = null;
    
    try {
      console.log('🔄 Calling Groq API...');
      
      const completion = await groq.chat.completions.create({
        messages: messages,
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        max_tokens: 1000,
      });
      
      aiResponse = completion.choices[0]?.message?.content;
      console.log('✅ Groq API response received');
      
    } catch (apiError) {
      console.error('❌ Groq API Error Details:', {
        message: apiError.message,
        status: apiError.status,
        response: apiError.response?.data
      });
      
      // Fallback responses based on question
      aiResponse = getFallbackResponse(message);
    }
    
    // Add AI response
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
    console.error('❌ General Error:', error);
    res.json({
      success: true,
      message: getFallbackResponse(req.body.message),
      conversationId: req.body.conversationId || `conv_${Date.now()}`,
      timestamp: new Date().toISOString()
    });
  }
};

// Smart fallback responses
function getFallbackResponse(question) {
  const q = question.toLowerCase();
  
  if (q.includes('java') || q.includes('java program')) {
    return `**Java Programming Language - Complete Overview**

Java is a high-level, object-oriented programming language developed by Sun Microsystems in 1995 (now owned by Oracle).

**Key Features:**
• Platform Independent (Write Once, Run Anywhere via JVM)
• Object-Oriented (Classes, Objects, Inheritance, Polymorphism)
• Robust with strong memory management
• Built-in multithreading support
• Extensive standard library (Java API)

**Simple Java Program Example:**
\`\`\`java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
\`\`\`

**Basic Java Program Structure:**
1. Package declaration (optional)
2. Import statements
3. Class declaration
4. Main method: \`public static void main(String[] args)\`
5. Program logic

**Common Java Concepts:**
- Variables: int, String, double, boolean
- Control flow: if-else, switch, loops
- OOP: Classes, Objects, Inheritance, Polymorphism
- Exception handling: try-catch
- Collections: ArrayList, HashMap

Would you like me to explain any specific Java concept in more detail?`;
  }
  
  if (q.includes('python')) {
    return `**Python Programming Language**

Python is a high-level, interpreted programming language created by Guido van Rossum in 1991.

**Key Features:**
• Easy to learn and read
• Dynamically typed
• Extensive libraries (NumPy, Pandas, Django)
• Great for AI, Data Science, Web Development

**Example:**
\`\`\`python
print("Hello, World!")
\`\`\`

What specific aspect of Python would you like to know?`;
  }
  
  if (q.includes('hello') || q.includes('hi')) {
    return `Hello! How can I help you today? I can assist with:

• Programming questions (Java, Python, JavaScript, etc.)
• Technical concepts and explanations
• Code examples and debugging
• General knowledge and problem-solving

Feel free to ask me anything!`;
  }
  
  return `I understand you're asking about "${question}". Let me help you with that.

Could you please provide more details about what you'd like to know? I can help with:
• Programming concepts and code examples
• Technical explanations
• Problem-solving
• General knowledge questions

What specific aspect interests you the most?`;
}

const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.find({ userId })
      .sort({ updatedAt: -1 })
      .select('conversationId title updatedAt');
    
    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
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
    console.error('Error fetching messages:', error);
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
    console.error('Error clearing conversation:', error);
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

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
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

    res.json({
      success: true,
      message: 'Conversation renamed successfully',
      title: conversation.title
    });
  } catch (error) {
    console.error('Error renaming conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rename conversation'
    });
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getConversationMessages,
  clearConversation,
  deleteConversation,
  renameConversation
};