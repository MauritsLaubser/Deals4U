import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GameProvider } from './GameProvider.tsx'
import { Site } from './Site.tsx'
import './site.css'

createRoot(document.querySelector<HTMLDivElement>('#app')!).render(
  <StrictMode>
    <GameProvider>
      <Site />
    </GameProvider>
  </StrictMode>,
)
