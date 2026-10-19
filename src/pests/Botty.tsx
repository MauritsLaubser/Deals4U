import { useEffect, useState } from 'react'
import { useGame } from '../GameProvider'
import { isFixed } from '../state'
import { pick, useRecurring } from '../useRecurring'

const OPENERS = [
  "Hi!! 👋 It looks like you're trying to play a game. Would you like help with that?",
  "Hey there! I noticed you've been on this page for a while. Are you lost? 🥺",
  'Psst. Did you know we have a newsletter? 📬',
  "Hello! I'm Botty, your personal shopping assistant! Ask me anything!*\n\n*except questions",
  'Are you still there? I get lonely when you scroll.',
]

const REPLIES = [
  "I'm sorry, I didn't understand that. Would you like to subscribe to our newsletter?",
  'Great question! Let me transfer you to another bot. 🤖➡️🤖',
  'I have escalated your issue to the void. Expected response time: 3–5 business decades.',
  "Did you mean: 'Buy more stuff'?",
  'Have you tried turning the website off and on again?',
]

type Message = { from: 'bot' | 'you'; text: string }

export function Chatbot() {
  const { state, dismiss } = useGame()
  const active = !isFixed(state, 'chatbot')
  const [open, hide] = useRecurring(active, 25, 40, 8)
  const [messages, setMessages] = useState<Message[]>([])
  const [typing, setTyping] = useState(false)

  useEffect(() => {
    if (!open) return
    setMessages([])
    setTyping(true)
    const timer = setTimeout(() => {
      setTyping(false)
      setMessages([{ from: 'bot', text: pick(OPENERS) }])
    }, 1200)
    return () => clearTimeout(timer)
  }, [open])

  if (!active) return null

  const answer = (text: string) => {
    setMessages((list) => [...list, { from: 'you', text }])
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages((list) => [...list, { from: 'bot', text: pick(REPLIES) }])
    }, 900)
  }

  return (
    <div className="botty">
      {open && (
        <div
          className="botty-window"
          role="dialog"
          aria-label="Chat with Botty"
        >
          <div className="botty-header">
            <span>🤖 Botty · online (always)</span>
            <button
              aria-label="Close chat"
              onClick={(e) => {
                dismiss(3, e)
                hide()
              }}
            >
              ✕
            </button>
          </div>
          <div className="botty-messages">
            {messages.map((m, i) => (
              <div key={i} className={`botty-msg ${m.from}`}>
                {m.text}
              </div>
            ))}
            {typing && <div className="botty-msg bot typing">• • •</div>}
          </div>
          <div className="botty-actions">
            <button onClick={() => answer('Yes please')}>Yes please</button>
            <button onClick={() => answer('No. Go away.')}>No. Go away.</button>
          </div>
        </div>
      )}
      <div className="botty-bubble" aria-hidden>
        🤖{!open && <span className="botty-badge">1</span>}
      </div>
    </div>
  )
}
