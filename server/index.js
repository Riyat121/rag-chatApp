import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import crypto from "crypto";
import pdf from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";
import { pipeline } from "@xenova/transformers";
 import Groq from "groq-sdk";
   const groq = new Groq(); // GROQ_API_KEY .env se lega
   const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || '*' }))

app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });


const STORE_FILE = "./store.json";

// ---------- tiny vector store (JSON file) ----------
let store = fs.existsSync(STORE_FILE)
  ? JSON.parse(fs.readFileSync(STORE_FILE, "utf8"))
  : []; // [{ id, docId, filename, text, embedding }]

const saveStore = () => fs.writeFileSync(STORE_FILE, JSON.stringify(store));

// ---------- embeddings (local, free) ----------
let extractorPromise;
async function embed(text) {
  extractorPromise ??= pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  const extractor = await extractorPromise;
  const out = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(out.data);
}

// vectors are normalized, so dot product == cosine similarity
const dot = (a, b) => a.reduce((sum, v, i) => sum + v * b[i], 0);

// ---------- parsing + chunking ----------
async function extractText(file) {
  const name = file.originalname.toLowerCase();
  if (name.endsWith(".pdf")) return (await pdf(file.buffer)).text;
  if (name.endsWith(".docx"))
    return (await mammoth.extractRawText({ buffer: file.buffer })).value;
  return file.buffer.toString("utf8"); // txt, md, csv, code...
}

function chunkText(text, size = 1000, overlap = 200) {
  const clean = text.replace(/\s+/g, " ").trim();
  const chunks = [];
  for (let i = 0; i < clean.length; i += size - overlap) {
    chunks.push(clean.slice(i, i + size));
    if (i + size >= clean.length) break;
  }
  return chunks;
}

// ---------- routes ----------
app.post("/upload", upload.array("files"), async (req, res) => {
  try {
    const added = [];
    for (const file of req.files || []) {
      const text = await extractText(file);
      const chunks = chunkText(text);
      const docId = crypto.randomUUID();
      for (const chunk of chunks) {
        store.push({
          id: crypto.randomUUID(),
          docId,
          filename: file.originalname,
          text: chunk,
          embedding: await embed(chunk),
        });
      }
      added.push({ docId, filename: file.originalname, chunks: chunks.length });
    }
    saveStore();
    res.json({ added });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
app.get('/', (req, res) => res.send('ok')) // health check

app.get("/documents", (req, res) => {
  const docs = {};
  for (const c of store) {
    docs[c.docId] ??= { docId: c.docId, filename: c.filename, chunks: 0 };
    docs[c.docId].chunks++;
  }
  res.json(Object.values(docs));
});

app.delete("/documents/:docId", (req, res) => {
  store = store.filter((c) => c.docId !== req.params.docId);
  saveStore();
  res.json({ ok: true });
});

app.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body; // history: [{role, content}]
    if (!message) return res.status(400).json({ error: "message required" });

    // 1. retrieve top matching chunks
    const queryVec = await embed(message);
    const top = store
      .map((c) => ({ ...c, score: dot(queryVec, c.embedding) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const context = top
      .map((c, i) => `[${i + 1}] (${c.filename})\n${c.text}`)
      .join("\n\n");

    // 2. ask Claude, grounded in the retrieved context
      const response = await groq.chat.completions.create({
     model: MODEL,
     max_tokens: 1000,
     messages: [
       {
         role: "system",
         content:
           "You answer questions about the user's uploaded documents. " +
           "Use only the provided context. Cite sources by filename. " +
           "If the answer isn't in the context, say you couldn't find it in the documents.",
       },
       ...history.slice(-6), // sirf last 6 messages, token limit ke liye
       {
         role: "user",
         content: `Context:\n${context || "(no documents uploaded)"}\n\nQuestion: ${message}`,
       },
     ],
   });

   res.json({
     answer: response.choices[0].message.content,
     sources: [...new Set(top.map((c) => c.filename))],
   });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`RAG backend running on port ${PORT}`))