const axios = require('axios');

// Dummy function — replace with actual embedding API call
async function getEmbedding(text) {
  if (!text || typeof text !== 'string') return [];

  // TODO: Replace with Groq-compatible embedding endpoint
  // Simulate embedding
  return Array.from({ length: 768 }, () => Math.random());
}

module.exports = { getEmbedding };
