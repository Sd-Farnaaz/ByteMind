require('dotenv').config();
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function testGroq() {
  try {
    console.log('Testing Groq API...');
    const model = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
    console.log('Using model:', model);

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: 'What is ByteMind AI in one sentence?'
        }
      ],
      model: model,
      temperature: 0.7,
    });

    console.log('✅ Success!');
    console.log('Response:', completion.choices[0]?.message?.content);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testGroq();
