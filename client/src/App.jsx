import { useState } from 'react'
import './App.css'
import Cover from './components/Cover'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'

const BG = 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 40%, #f3e8ff 75%, #fce7f3 100%)'

function App() {
  const [view, setView] = useState('cover') // 'cover' | 'chat'
  const [docs, setDocs] = useState([])
  const [messages, setMessages] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)

  const newChat = () => {
    setMessages([])
    setMenuOpen(false)
  }

  if (view === 'cover') {
    return (
      <div className="w-full" style={{ background: BG, minHeight: '100dvh' }}>
        <Cover onStart={() => setView('chat')} />
      </div>
    )
  }

  return (
    <div className="flex w-full overflow-hidden" style={{ background: BG, height: '100dvh' }}>
      {/* dark overlay behind the mobile drawer */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* sidebar: slide-in drawer on mobile, fixed column on md+ */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-200 bg-white/90 backdrop-blur-xl md:static md:z-auto md:translate-x-0 md:bg-white/40 md:border-r md:border-white/60 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          docs={docs}
          setDocs={setDocs}
          onNewChat={newChat}
          onHome={() => setView('cover')}
          onClose={() => setMenuOpen(false)}
        />
      </aside>

      <main className="flex-1 min-w-0 h-full">
        <Chat
          hasDocs={docs.length > 0}
          messages={messages}
          setMessages={setMessages}
          onMenu={() => setMenuOpen(true)}
        />
      </main>
    </div>
  )
}

export default App