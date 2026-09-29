import { SquarePen, X, Library } from 'lucide-react'
import Orb from './Orb'
import FileUpload from './FileUpload'

export default function Sidebar({ docs, setDocs, onNewChat, onHome, onClose }) {
  return (
    <div className="h-full flex flex-col p-4 gap-4">
      <div className="flex items-center justify-between">
        <button onClick={onHome} className="flex items-center gap-2 cursor-pointer">
          <Orb size={34} float={false} />
          <span className="text-xl font-bold tracking-wide text-slate-900">DocChat</span>
        </button>
        <button onClick={onClose} className="md:hidden text-slate-500 cursor-pointer">
          <X size={22} />
        </button>
      </div>

      <button
        onClick={onNewChat}
        className="flex items-center gap-3 rounded-full bg-white/70 hover:bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition cursor-pointer"
      >
        <SquarePen size={18} className="text-indigo-600" /> New Chat
      </button>

      <div className="flex items-center gap-2 px-1 text-sm font-semibold text-slate-700">
        <Library size={16} className="text-indigo-600" /> Library
      </div>

      <div className="flex-1 overflow-y-auto -mr-1 pr-1">
        <FileUpload docs={docs} setDocs={setDocs} />
      </div>
    </div>
  )
}