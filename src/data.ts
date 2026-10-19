// Static game data: the annoyances you can fix, the coping upgrades you can
// level up, and the buildings of the game hidden at the bottom of the page.

export type FixId =
  | 'cookie'
  | 'newsletter'
  | 'cursor'
  | 'notifications'
  | 'chatbot'
  | 'video'
  | 'leave'
  | 'design'
  | 'captcha'
  | 'paywall'
  | 'recipe'
  | 'popups'
  | 'adblock'

export type Fix = {
  id: FixId
  name: string
  description: string
  cost: number
  icon: string
}

export const FIXES: Fix[] = [
  {
    id: 'cookie',
    name: "I Don't Care About Cookies",
    description: 'Browser extension that eats the cookie banner.',
    cost: 15,
    icon: '🍪',
  },
  {
    id: 'newsletter',
    name: 'Unsubscribe From Everything',
    description: 'No more "Join 2 million deal hunters!" modals.',
    cost: 50,
    icon: '📧',
  },
  {
    id: 'cursor',
    name: 'Normal Cursor™',
    description: 'Removes the glitter trail. Your eyes thank you.',
    cost: 120,
    icon: '✨',
  },
  {
    id: 'notifications',
    name: 'Block Notifications',
    description: 'Permanently answer "Block" to that permission prompt.',
    cost: 250,
    icon: '🔔',
  },
  {
    id: 'chatbot',
    name: 'Fire Botty',
    description: 'The chatbot is let go. It did not see this coming.',
    cost: 500,
    icon: '🤖',
  },
  {
    id: 'video',
    name: 'Disable Autoplay',
    description: 'The floating video ad stops following you around.',
    cost: 1000,
    icon: '📺',
  },
  {
    id: 'leave',
    name: 'Let Me Leave',
    description: 'Removes the "WAIT! DON\'T GO!" exit popups.',
    cost: 2000,
    icon: '🚪',
  },
  {
    id: 'design',
    name: 'Hire a Real Designer',
    description: 'Goodbye Comic Sans, marquees and rainbow backgrounds.',
    cost: 4000,
    icon: '🎨',
  },
  {
    id: 'captcha',
    name: 'Prove Humanity Forever',
    description: 'One final CAPTCHA to end all CAPTCHAs.',
    cost: 8000,
    icon: '🚦',
  },
  {
    id: 'paywall',
    name: 'Clear Cookies (Again)',
    description: 'The "3 of 3 free articles" paywall forgets you exist.',
    cost: 12000,
    icon: '💸',
  },
  {
    id: 'recipe',
    name: 'Jump to Game',
    description: "Deletes the author's 4,000-word life story.",
    cost: 22000,
    icon: '📜',
  },
  {
    id: 'popups',
    name: 'Real Pop-up Blocker',
    description: 'No more pop-up ads. Ever. (Your main income, careful!)',
    cost: 40000,
    icon: '🪟',
  },
  {
    id: 'adblock',
    name: 'Whitelist This Site (sigh)',
    description: 'Finally gets rid of the "AdBlock detected" wall on the game.',
    cost: 70000,
    icon: '🛡️',
  },
]

export type LevelId = 'skin' | 'breath' | 'intern'

export type LevelUpgrade = {
  id: LevelId
  name: string
  description: string
  icon: string
  baseCost: number
  growth: number
  max?: number
}

export const LEVEL_UPGRADES: LevelUpgrade[] = [
  {
    id: 'skin',
    name: 'Thicker Skin',
    description: '+1 patience every time you close something.',
    icon: '🦏',
    baseCost: 10,
    growth: 1.55,
  },
  {
    id: 'breath',
    name: 'Deep Breaths',
    description: '+0.75 patience per second, passively.',
    icon: '🧘',
    baseCost: 15,
    growth: 1.3,
  },
  {
    id: 'intern',
    name: 'Pop-up Intern',
    description: 'Closes pop-up ads for you (at half the patience).',
    icon: '🧑‍💼',
    baseCost: 75,
    growth: 2.2,
    max: 8,
  },
]

export const levelCost = (upgrade: LevelUpgrade, level: number) =>
  Math.ceil(upgrade.baseCost * upgrade.growth ** level)

// Every fix calms you down a bit more, multiplying all patience gains.
export const FIX_MULTIPLIER = 1.5
export const BREATH_PER_LEVEL = 0.75
export const INTERN_AUTO_WEIGHT = 0.5
export const internInterval = (level: number) => 7 / level

// ---- Webmaster Tycoon (the game at the bottom of the page) ----

export type Building = {
  name: string
  icon: string
  description: string
  baseCost: number
  income: number
}

export const BUILDINGS: Building[] = [
  {
    name: 'Blinking Banner',
    icon: '🌈',
    description: 'CLICK HERE!!! It blinks. Visitors look. You get paid.',
    baseCost: 22,
    income: 0.5,
  },
  {
    name: 'Cookie Banner',
    icon: '🍪',
    description:
      '"Accept all" is big and green. "Reject" is a tiny grey rumour.',
    baseCost: 150,
    income: 4,
  },
  {
    name: 'Newsletter Modal',
    icon: '📧',
    description: '"No thanks, I hate saving money."',
    baseCost: 1200,
    income: 25,
  },
  {
    name: 'Autoplay Video',
    icon: '📺',
    description: 'Follows the visitor around the page. At full volume.',
    baseCost: 9000,
    income: 150,
  },
  {
    name: 'Chatbot',
    icon: '🤖',
    description: '"It looks like you\'re trying to leave. Can I help?"',
    baseCost: 70000,
    income: 900,
  },
  {
    name: 'Impossible CAPTCHA',
    icon: '🚦',
    description: 'Is the pole of the traffic light part of the traffic light?',
    baseCost: 525000,
    income: 5500,
  },
  {
    name: 'Paywall',
    icon: '💸',
    description: '"You have read 0 of 0 free articles this month."',
    baseCost: 4.5e6,
    income: 35000,
  },
  {
    name: 'Recipe Life Story',
    icon: '📜',
    description: 'Before the recipe: 40,000 words about a summer in Tuscany.',
    baseCost: 37.5e6,
    income: 220000,
  },
]

export const BUILDING_GROWTH = 1.15
export const buildingCost = (building: Building, owned: number) =>
  Math.ceil(building.baseCost * BUILDING_GROWTH ** owned)

// Each building gets ×2 upgrades once you own this many of it...
export const UPGRADE_THRESHOLDS = [10, 25, 50, 100]
// ...costing this many times the building's base cost.
export const UPGRADE_COST_FACTORS = [25, 150, 1500, 15000]
export const UPGRADE_NAMES = [
  'More Blinking',
  'Bigger Font',
  'Dark Patterns',
  'Legally Questionable',
]

export const clickUpgradeCost = (level: number) => 25 * 10 ** level
export const CLICK_UPGRADE_MAX = 8

export const TYCOON_GOAL = 1e9
// Leftover patience carries over into the tycoon game, up to this much.
export const SEED_MONEY_CAP = 25
export const SPONSOR_BOOST_SECONDS = 15
export const SPONSOR_BOOST_MULTIPLIER = 2

// Hype: every click fills the meter a little. When it's full you go viral
// for a while. It drains if you stop clicking.
export const HYPE_PER_CLICK = 0.012
export const HYPE_DRAIN_DELAY = 2
export const HYPE_DRAIN_PER_SECOND = 0.1
export const VIRAL_SECONDS = 10
export const VIRAL_CLICK_MULTIPLIER = 3
export const VIRAL_INCOME_MULTIPLIER = 1.5

// Escaping visitors: catch one before they reach the ✕ for a bounty worth
// this many seconds of income.
export const ESCAPE_BOUNTY_SECONDS = 8
export const ESCAPE_BOUNTY_MIN = 15
export const ESCAPE_WINDOW_SECONDS = 4
export const ESCAPE_MIN_DELAY = 25
export const ESCAPE_MAX_DELAY = 55
