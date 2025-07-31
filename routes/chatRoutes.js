const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { parsePdf } = require("../utils/pdfParser");
const { getEmbedding } = require("../utils/embeddingUtils");
const { getChatCompletion } = require("../utils/groq");
const { findRelevantChunks } = require("../utils/chunkUtils");

const router = express.Router();

// 📁 Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 📦 Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/**
 * 📥 Upload PDF endpoint
 * Parses the uploaded PDF and returns chunked text (with optional embeddings)
 */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path; // ✅ define filePath before using it

    const parsed = await parsePdf(filePath);
    if (!Array.isArray(parsed)) {
      return res.status(500).json({ error: "Failed to parse PDF" });
    }

    const rawChunks = (await parsePdf(filePath)).filter(
      (c) => c.text && c.text.trim().length > 20
    );


    const chunks = await Promise.all(
      rawChunks.map(async (chunk) => {
        const embedding = await getEmbedding(chunk.text || "");
        return { ...chunk, embedding };
      })
    );

    res.status(200).json({
      message: "File uploaded successfully",
      filename: req.file.filename,
      pages: chunks.length,
      chunks,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});


/**
 * 💬 Chat endpoint
 * Receives user question and PDF chunks, then returns a response using Groq
 */
router.post("/", async (req, res) => {
  try {
    const { message, chunks } = req.body;

    if (!message || !Array.isArray(chunks) || chunks.length === 0) {
      return res.status(400).json({ error: "Missing message or chunks" });
    }

    const queryEmbedding = await getEmbedding(message);
    const topChunks = findRelevantChunks(queryEmbedding, chunks);

    const context = topChunks.map((c) => c.text).join("\n\n");
    const prompt = `You are an assistant helping with questions about a document. Use the context below to answer the user’s question as accurately as possible.\n\nContext:\n${context}\n\nQuestion: ${message}`;

    const response = await getChatCompletion(prompt);

    const uniquePages = [...new Set(topChunks.map((c) => c.page))].sort((a, b) => a - b);
    const citationText = `Referenced page${uniquePages.length > 1 ? "s" : ""}: ${uniquePages.join(", ")}`;

    res.json({
      answer: response,
      citations: uniquePages,
      citationText,
    });
  } catch (err) {
    console.error("Chat error:", err.response?.data || err.message);
    res.status(500).json({ error: "Chat failed" });
  }
});


module.exports = router;
