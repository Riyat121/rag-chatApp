import { useEffect, useRef, useState } from 'react'
import { Send, Loader2, Menu } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { API } from '../config'
import Orb from './Orb'

const suggestions = [
  'Summarize the document',
  'List the key points',
  'What are the main topics?',
  'Explain it in simple words',
]

// Tailwind styling for rendered markdown
const mdComponents = {
  p: (props) => <p className="mb-2 last:mb-0" {...props} />,
  ul: (props) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
  ol: (props) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
  h1: (props) => <h3 className="font-semibold text-base mb-1" {...props} />,
  h2: (props) => <h3 className="font-semibold text-base mb-1" {...props} />,
  h3: (props) => <h4 className="font-semibold mb-1" {...props} />,
  strong: (props) => <strong className="font-semibold" {...props} />,
  a: (props) => <a className="text-indigo-600 underline" target="_blank" {...props} />,
  code: (props) => <code className="bg-slate-100 rounded px-1 text-xs" {...props} />,
  table: (props) => (
    <div className="overflow-x-auto mb-2">
      <table className="text-xs border-collapse" {...props} />
    </div>
  ),
  th: (props) => <th className="border px-2 py-1 bg-slate-100 text-left" {...props} />,
  td: (props) => <td className="border px-2 py-1 align-top" {...props} />,
}

// remove stray citation markers like 【2†L1-L4】 and <br> tags
const clean = (text) =>
  text.replace(/【[^】]*】/g, '').replace(/<br\s*\/?>/gi, '\n')

function Chat({ hasDocs, messages, setMessages, onMenu }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const isEmpty = messages.length === 0

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (override) => {
    const text = (override ?? input).trim()
    if (!text || loading) return

    // history = previous turns only, as plain {role, content}
    const history = messages.map(({ role, content }) => ({ role, content }))

    setMessages((m) => [...m, { role: 'user', content: text }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: data.answer, sources: data.sources },
      ])
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', content: `Error: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  const inputBar = (
    <div className="w-full max-w-2xl mx-auto flex items-center gap-2 rounded-full bg-white/85 backdrop-blur p-2 pl-5 shadow-lg shadow-indigo-200/60">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && send()}
        placeholder="Ask something about your files..."
        className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
      />
      <button
        onClick={() => send()}
        disabled={loading || !input.trim()}
        className="h-10 w-10 shrink-0 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white flex items-center justify-center cursor-pointer transition"
      >
        <Send size={17} />
      </button>
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      {/* mobile top bar */}
      <div className="md:hidden flex items-center gap-3 px-4 py-3">
        <button onClick={onMenu} className="text-slate-700 cursor-pointer">
          <Menu size={24} />
        </button>
        <span className="font-semibold text-slate-800">DocChat</span>
      </div>

      {isEmpty ? (
        // ---------- empty state: hero + centered input ----------
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-4 pb-10 text-center">
          <Orb size={110} />
          <h2 className="mt-6 mb-8 text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
            How can I help you today?
          </h2>
          {inputBar}
          <p className="mt-3 text-xs text-slate-500">
            {hasDocs
              ? 'Ask anything about your uploaded files.'
              : 'Upload a file from the library first, then ask away.'}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2 max-w-2xl">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full bg-white/70 hover:bg-white px-4 py-2 text-xs sm:text-sm text-slate-700 shadow-sm transition cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        // ---------- conversation ----------
        <>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] sm:max-w-[80%] px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      m.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-2xl rounded-br-md whitespace-pre-wrap'
                        : 'bg-white/90 text-slate-800 rounded-2xl rounded-bl-md'
                    }`}
                  >
                    {m.role === 'assistant' ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                        {clean(m.content)}
                      </ReactMarkdown>
                    ) : (
                      m.content
                    )}
                    {m.sources?.length > 0 && (
                      <p className="mt-2 text-xs text-slate-500">
                        Sources: {m.sources.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Loader2 size={16} className="animate-spin" /> Thinking...
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="px-4 pb-4 pt-2">{inputBar}</div>
        </>
      )}
    </div>
  )
}

export default Chat