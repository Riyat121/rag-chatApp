import { useEffect, useRef, useState } from 'react'
import { Upload, FileText, Trash2, Loader2 } from 'lucide-react'
import { API } from '../config'

function FileUpload({ docs, setDocs }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')

  const loadDocs = async () => {
    try {
      const res = await fetch(`${API}/documents`)
      setDocs(await res.json())
    } catch {
      setError('Cannot reach the server. Is the backend running?')
    }
  }

  useEffect(() => {
    loadDocs()
  }, [])

  const uploadFiles = async (files) => {
    if (files.length === 0) return
    const formData = new FormData()
    files.forEach((f) => formData.append('files', f)) // field name must be "files"

    setUploading(true)
    setError('')
    try {
      const res = await fetch(`${API}/upload`, { method: 'POST', body: formData })
      if (!res.ok) throw new Error((await res.json()).error || 'Upload failed')
      await loadDocs()
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const onPick = (e) => {
    uploadFiles(Array.from(e.target.files || []))
    e.target.value = '' // allow re-uploading the same file
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    uploadFiles(Array.from(e.dataTransfer.files || []))
  }

  const removeDoc = async (docId) => {
    await fetch(`${API}/documents/${docId}`, { method: 'DELETE' })
    loadDocs()
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.txt,.md"
        className="hidden"
        onChange={onPick}
      />

      <button
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        disabled={uploading}
        className={`w-full rounded-2xl border-2 border-dashed px-4 py-5 flex flex-col items-center gap-1 text-sm transition cursor-pointer disabled:opacity-60 ${
          dragging
            ? 'border-indigo-500 bg-indigo-100/70'
            : 'border-indigo-300 bg-white/50 hover:bg-white/80'
        }`}
      >
        {uploading ? (
          <>
            <Loader2 className="animate-spin text-indigo-600" size={22} />
            <span className="text-slate-600">Processing...</span>
          </>
        ) : (
          <>
            <Upload className="text-indigo-600" size={22} />
            <span className="font-medium text-slate-700">Upload files</span>
            <span className="text-xs text-slate-500">or drag &amp; drop</span>
          </>
        )}
      </button>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <ul className="mt-4 space-y-2">
        {docs.length === 0 && (
          <li className="text-xs text-slate-500 px-1">No documents yet.</li>
        )}
        {docs.map((d) => (
          <li
            key={d.docId}
            className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 shadow-sm"
          >
            <FileText size={16} className="shrink-0 text-indigo-500" />
            <span className="flex-1 truncate text-sm text-slate-700">{d.filename}</span>
            <button
              onClick={() => removeDoc(d.docId)}
              className="text-slate-400 hover:text-red-500 cursor-pointer"
              title="Remove"
            >
              <Trash2 size={15} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default FileUpload