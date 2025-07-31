// utils/similarity.js
const cosineSimilarity = (a, b) =>
  a.reduce((sum, ai, i) => sum + ai * b[i], 0) /
  (Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0)) *
   Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0)));

function findRelevantChunks(queryEmbedding, chunks, topK = 3) {
  const scored = chunks.map(chunk => ({
    ...chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  return scored.sort((a, b) => b.score - a.score).slice(0, topK);
}

module.exports = { findRelevantChunks };
