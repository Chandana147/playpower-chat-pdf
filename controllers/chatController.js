const fs = require('fs');
const pdfParse = require('pdf-parse');
const { askQuestion } = require('../utils/openai');

let pdfText = '';

exports.uploadPdf = async (req, res) => {
  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(dataBuffer);
    pdfText = data.text;
    res.json({ message: 'PDF uploaded and parsed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to parse PDF' });
  }
};

exports.chatWithPdf = async (req, res) => {
  const { question } = req.body;
  try {
    const answer = await askQuestion(question, pdfText);
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ error: 'Error generating response' });
  }
};
