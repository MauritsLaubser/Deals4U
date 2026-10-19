import { useEffect, useRef } from 'react'
import { Captcha } from './pests/HumanCheck'
import { Chatbot } from './pests/Botty'
import { CookieBanner } from './pests/Consent'
import { CursorTrail } from './pests/Glitter'
import { ExitIntent } from './pests/Goodbye'
import { Newsletter } from './pests/Subscribe'
import { Notifications } from './pests/Permission'
import { Paywall } from './pests/ReadingLimit'
import { Popups } from './pests/Windows98'
import { VideoAd } from './pests/Autoplay'
import { GameFrame } from './GameFrame'
import { useGame } from './GameProvider'
import { scrollToGame, Shop } from './Shop'
import { isCleaned, isFixed } from './state'

const LIFE_STORY = [
  "Before we get to the free game, I think it's important that you understand where this game comes from. And to understand the game, you have to understand me.",
  'I was born on a crisp autumn morning in a small village where the internet arrived exactly once, in 1998, and then left. My grandmother, Nonna Pixel, used to say "a website without pop-ups is like a pizza without pineapple." She was a controversial woman.',
  'Every summer we would travel to Tuscany. Not for the food, not for the views, but because the Wi-Fi password at the villa was "password". I remember the golden light on the hills, the smell of rosemary, and the dial-up tone that sounded like a robot falling down the stairs.',
  'It was there, on a sun-warmed terrace, that I first played a browser game. It was beautiful. It was simple. It had no ads. I knew right then that I would spend my life making sure no one ever experienced that again.',
  'But I digress. Let me tell you about the olive trees. There were 47 of them. Each had a name. Gianluca was my favourite; he leaned slightly to the left, as if he too was trying to close a pop-up in the corner of the screen.',
  "Years later, in college, I studied Marketing and Interpretive Dance (minor in Cookie Banners). My professors said I had a gift: I could make any 'Reject' button 40% smaller without anyone noticing. I graduated with honours. Mostly with honours. With some honours.",
  "Anyway, I moved to the city, started this blog, and as you can see, it's been a huge success. 12 million monthly visitors! 11.9 million of them are trying to find the close button.",
  "So that's my story. Thank you for reading it (you scrolled past it, we have analytics). The game is just a little bit further down. Almost there. Keep going. You're doing great. 💖",
]

function Header({ ugly }: { ugly: boolean }) {
  return (
    <header className="site-header">
      {ugly && (
        <div className="marquee" aria-hidden>
          <span>
            🔥🔥 MEGA SALE 🔥🔥 FREE GAMES!!! 🎮 BEST DEALS ON THE WEB SINCE
            1997 💸 CLICK HERE 4 FREE IPOD 🎧 YOU ARE VISITOR #000,847,213 🎉
            SITE UNDER CONSTRUCTION 🚧
          </span>
        </div>
      )}
      <div className="site-brand">
        <span className="site-logo">
          {ugly ? '💥 DEALS4U.biz 💥' : 'deals4u'}
        </span>
        <nav>
          <a href="#game" onClick={(e) => (e.preventDefault(), scrollToGame())}>
            Game
          </a>
          <a href="#story">{ugly ? 'DEALZ!!!' : 'Blog'}</a>
          <a href="#story">{ugly ? 'ABOUT ME 😎' : 'About'}</a>
        </nav>
      </div>
    </header>
  )
}

function SponsoredBox({ index }: { index: number }) {
  const ads = [
    '🧴 SPONSORED: This shampoo makes your hair 4% more hair.',
    '🪑 SPONSORED: Chairs. You sit on them. Buy 12.',
    '🧦 SPONSORED: Socks that remember you.',
    '🍕 SPONSORED: Pineapple pizza. Nonna Pixel approved.',
  ]
  return <div className="nonna-box">{ads[index % ads.length]}</div>
}

export function Site() {
  const { state } = useGame()
  const ugly = !isFixed(state, 'design')
  const cleaned = isCleaned(state)
  const wasCleaned = useRef(cleaned)

  // Celebrate by scrolling to the game the moment the last fix is bought.
  useEffect(() => {
    if (cleaned && !wasCleaned.current) setTimeout(scrollToGame, 400)
    wasCleaned.current = cleaned
  }, [cleaned])

  const classes = [
    'site',
    ugly ? 'ugly' : 'clean',
    !isFixed(state, 'cursor') ? 'cursed' : '',
  ].join(' ')

  return (
    <div className={classes}>
      <Header ugly={ugly} />
      <main className="site-main">
        <article id="story" className="article">
          {cleaned && (
            <div className="cleaned-note">
              ✨ This website no longer sucks. Thank you for your patience. ✨
            </div>
          )}
          <h1>
            {ugly
              ? '🎮 PLAY FREE GAME!!! (SCROLL DOWN) ⬇⬇⬇'
              : 'A free browser game'}
          </h1>
          <p className="byline">
            by WebmasterDave · 47 min read ·{' '}
            {ugly ? '🔥 TRENDING 🔥' : 'Updated today'}
          </p>
          <button className="jump-button" onClick={scrollToGame}>
            {isFixed(state, 'recipe')
              ? 'Jump to game ⬇'
              : 'Jump to game ⬇ (coming soon)'}
          </button>

          {isFixed(state, 'recipe') ? (
            <p className="story-removed">
              (The author's life story has been removed. You're welcome.)
            </p>
          ) : (
            LIFE_STORY.map((paragraph, i) => (
              <div key={i}>
                <p>{paragraph}</p>
                {i % 2 === 1 && !isFixed(state, 'popups') && (
                  <SponsoredBox index={i} />
                )}
              </div>
            ))
          )}
        </article>

        <GameFrame />

        <footer className="site-footer">
          {ugly
            ? '© 1997–2026 DEALS4U.biz · Best viewed in Netscape Navigator at 800×600 · 🚧 Under construction 🚧'
            : '© deals4u'}
        </footer>
      </main>

      <Shop />
      <CursorTrail />
      <Popups />
      <CookieBanner />
      <Notifications />
      <Chatbot />
      <VideoAd />
      <Paywall />
      <Newsletter />
      <ExitIntent />
      <Captcha />
    </div>
  )
}
