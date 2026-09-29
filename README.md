# DocChat: Chat with your documents

A RAG (Retrieval-Augmented Generation) chatbot. Upload PDF, DOCX or TXT files and ask questions about them in plain language. Answers are grounded in your documents and cite the source files.

**Live demo:** [your-app.vercel.app](https://chatapp-pi-ruby.vercel.app/)


> The backend runs on Render's free tier, so the first request after a period of inactivity can take up to a minute while the service wakes up.

<!-- Add a screenshot or GIF here, e.g. ![DocChat screenshot](./docs/screenshot.png) -->

## Features

- Upload multiple files at once (PDF, DOCX, TXT, MD), with drag and drop
- Ask questions in a chat interface with conversation memory for follow-ups
- Answers are based only on your documents, with source filenames shown
- Document library with delete support
- Markdown-rendered answers (lists, bold text, tables)
- Responsive layout: sidebar becomes a slide-in drawer on mobile
- Cover page and suggestion chips for quick starts

## How it works

```
Upload:  file -> extract text -> split into chunks -> embed each chunk -> store vectors
Ask:     question -> embed -> find top 5 similar chunks -> send chunks + question to LLM -> answer
```

1. **Extract:** `pdf-parse` (PDF), `mammoth` (DOCX), or plain text.
2. **Chunk:** text is split into ~1000 character pieces with 200 characters of overlap.
3. **Embed:** each chunk is converted to a vector locally with `all-MiniLM-L6-v2` (via `@xenova/transformers`), so no embedding API or key is needed.
4. **Store:** vectors are kept in a JSON file and searched with cosine similarity.
5. **Generate:** the 5 most relevant chunks are sent to an LLM on Groq, which is instructed to answer only from that context and cite filenames.

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React, Vite, Tailwind CSS, lucide-react, react-markdown |
| Backend | Node.js, Express, Multer |
| Embeddings | `@xenova/transformers` (`Xenova/all-MiniLM-L6-v2`, runs locally in Node) |
| LLM | Groq API (default model: `openai/gpt-oss-120b`) |
| Deployment | Vercel (frontend), Render (backend) |

## Project structure

```
chatbot.ai/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── App.jsx
│       ├── config.js       # API base URL
│       └── components/
│           ├── Cover.jsx
│           ├── Sidebar.jsx
│           ├── FileUpload.jsx
│           ├── Chat.jsx
│           └── Orb.jsx
└── server/                 # Express backend
    └── index.js            # upload, chat and document routes
```

## Run locally

**Prerequisites:** Node.js 20+ and a free [Groq API key](https://console.groq.com/keys).

### 1. Backend

```bash
cd server
npm install
```

Create `server/.env`:

```
GROQ_API_KEY=your-key-here
# optional
# GROQ_MODEL=openai/gpt-oss-120b
# CLIENT_URL=http://localhost:5173
```

Start it:

```bash
npm run dev
```

The API runs on `http://localhost:5000`. The first upload downloads the embedding model (about 25 MB), so it takes a little longer.

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`.

## Environment variables

| Variable | Where | Description |
|---|---|---|
| `GROQ_API_KEY` | server | Groq API key (required) |
| `GROQ_MODEL` | server | Override the default LLM (optional) |
| `CLIENT_URL` | server | Allowed frontend origin for CORS, no trailing slash (optional locally) |
| `PORT` | server | Set automatically by Render |
| `VITE_API_URL` | client | Backend URL; defaults to `http://localhost:5000` |

## API endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/upload` | Upload files as `multipart/form-data` with the field name `files` |
| `GET` | `/documents` | List uploaded documents |
| `DELETE` | `/documents/:docId` | Remove a document and its chunks |
| `POST` | `/chat` | Body: `{ message, history }`. Returns `{ answer, sources }` |

## Deployment

- **Backend (Render):** Web Service, root directory `server`, build command `npm install`, start command `npm start`. Add `GROQ_API_KEY` and `CLIENT_URL` as environment variables.
- **Frontend (Vercel):** root directory `client`, framework preset Vite. Add `VITE_API_URL` pointing to the Render URL, then redeploy whenever it changes (Vite reads it at build time).

## Known limitations

- **No persistent storage on the free tier:** the vector store is a JSON file on Render's ephemeral disk, so uploaded documents are lost when the service restarts or redeploys.
- **Shared document pool:** there are no user accounts, so everyone using the app sees the same documents.
- **Scanned PDFs are not supported:** text extraction does not include OCR.
- **In-memory search:** every query scans all chunks, which is fine for small collections but does not scale.
- **Free-tier rate limits:** Groq's free plan limits requests and tokens per minute and per day.

## Roadmap

- [ ] Move the vector store to MongoDB Atlas Vector Search for persistence
- [ ] User authentication and per-user document collections
- [ ] Streaming responses
- [ ] Saved chat history
- [ ] OCR for scanned PDFs
- [ ] Dark mode
