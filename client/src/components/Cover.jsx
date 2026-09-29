import { ArrowRight, FileText, Quote } from 'lucide-react'
import Orb from './Orb'

export default function Cover({ onStart }) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-10 text-center">
      <Orb size={140} />

      <h1 className="mt-8 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900">
        Chat with <span className="text-indigo-600">Bot</span>
      </h1>
      <p className="mt-4 max-w-md text-base sm:text-lg text-slate-600">
        Upload your documents and ask questions about them in plain language.
      </p>

      <button
        onClick={onStart}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-7 py-3 text-white font-medium shadow-lg shadow-indigo-300/60 hover:bg-indigo-700 transition cursor-pointer"
      >
        Get started <ArrowRight size={18} />
      </button>

      <div className="mt-10 flex flex-wrap justify-center gap-3 text-sm text-slate-600">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 backdrop-blur">
          <FileText size={16} className="text-indigo-500" /> PDF, DOCX &amp; TXT
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 backdrop-blur">
          <Quote size={16} className="text-indigo-500" /> Answers cite their sources
        </span>
      </div>
    </div>
  )
}