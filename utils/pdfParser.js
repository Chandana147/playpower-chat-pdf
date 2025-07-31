const fs = require("fs");
const pdf = require("pdf-parse");

async function parsePdf(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdf(buffer);

  // naive splitting: break into chunks every N characters
  const chunkSize = 1000; // adjust for your case
  const chunks = [];

  for (let i = 0; i < data.text.length; i += chunkSize) {
    chunks.push({
      page: Math.floor(i / chunkSize) + 1, // fake page number
      text: data.text.slice(i, i + chunkSize).trim(),
    });
  }

  return chunks;
}

module.exports = { parsePdf };
