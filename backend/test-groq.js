require('dotenv').config();
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function testGroq() {
  try {
    console.log('Testing Groq API...');
    console.log('API Key:', process.env.GROQ_API_KEY?.substring(0, 10) + '...');
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: 'What is Java?'
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
    });
    
    console.log('✅ Success!');
    console.log('Response:', completion.choices[0]?.message?.content);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

testGroq();