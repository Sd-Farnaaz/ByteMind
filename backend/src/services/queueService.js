const Queue = require('bull');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const messageQueue = new Queue('ai messages', {
  redis: {
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: 3
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    timeout: 30000
  }
});

messageQueue.process(async (job) => {
  const { messages, systemPrompt } = job.data;
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ],
    temperature: 0.7,
    max_tokens: 1000
  });
  
  return completion.choices[0].message.content;
});

module.exports = { messageQueue };