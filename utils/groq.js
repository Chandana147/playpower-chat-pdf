const axios = require('axios');

async function getChatCompletion(prompt) {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192', // use supported model
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Groq API error:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { getChatCompletion }; // ✅ This line is critical
