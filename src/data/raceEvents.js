// ─────────────────────────────────────────────────────────────
//  Race Events — good, neutral, and bad paddock events.
//
//  Event shape:
//    id             — unique string
//    tier           — 'good' | 'neutral' | 'bad'
//    title          — short display title
//    description    — narrative text shown to player
//    sessionFilter  — null (any) | array of session names that can trigger this
//    oneTimeOnly    — if true, never repeats in the same career (default false)
//    choices        — null for auto-apply, or array of choice objects:
//                       { id, label, requireCash?, effects[] }
//    effects        — for auto-apply events (no choices); array of effect objects
//
//  Effect shapes:
//    { type: 'cash',              amount }            add/subtract cash
//    { type: 'cashRandom',        min, max }          random cash in range
//    { type: 'reputation',        amount }            add/subtract rep
//    { type: 'experience',        amount }            add/subtract exp
//    { type: 'consumable',        key, amount }       modify consumable qty
//    { type: 'addTires' }                             add 1 set of equipped/standard tires
//    { type: 'removeRandomParts', count }             remove N random parts from inventory
//    { type: 'dnf' }                                  set DNF for current session
//    { type: 'unlockDmitri' }                         set dmitriUnlocked = true
//    { type: 'addDmitriEngine' }                      add Dmitri engine to parts inventory
// ─────────────────────────────────────────────────────────────

// ── Good Events ───────────────────────────────────────────────
export const GOOD_EVENTS = [
  {
    id: 'free-tires-raffle',
    tier: 'good',
    title: 'Tire Raffle',
    description: 'Your pit number was drawn in the tire raffle. You win a free set of tires!',
    sessionFilter: null,
    choices: null,
    effects: [{ type: 'addTires' }],
  },
  {
    id: '50-50-raffle-club',
    tier: 'good',
    title: '50/50 Raffle',
    description: 'You won the 50/50 raffle! The cashbox splits right down the middle.',
    sessionFilter: null,
    championshipFilter: ['norway'],
    choices: null,
    effects: [{ type: 'cashRandom', min: 457, max: 654 }],
  },
  {
    id: '50-50-raffle-open',
    tier: 'good',
    title: '50/50 Raffle',
    description: 'You won the 50/50 raffle! Prize money at this level is nothing to sneeze at.',
    sessionFilter: null,
    championshipFilter: ['route66', 'ignite-challenge'],
    choices: null,
    effects: [{ type: 'cashRandom', min: 1313, max: 3000 }],
  },
  {
    id: 'leslie-tent',
    tier: 'good',
    title: 'Leslie Racing',
    description: 'You wander over to the Leslie Racing tent between sessions. Their crew spots something in your driving and gives you some honest pointers.',
    sessionFilter: null,
    choices: null,
    effects: [
      { type: 'reputation', amount: 1.25 },
      { type: 'experience', amount: 0.5 },
    ],
  },
  {
    id: 'mychron-review',
    tier: 'good',
    title: 'Data Review',
    description: 'You pull up your MyChron data and spot a consistent brake point you\'ve been leaving time on.',
    sessionFilter: null,
    choices: null,
    effects: [{ type: 'experience', amount: 0.25 }],
  },
  {
    id: 'lost-cadet',
    tier: 'good',
    title: 'Lost Kid',
    description: 'A cadet driver is wandering the paddock looking for his mom. You spend ten minutes tracking her down — grateful, she hands you some cash.',
    sessionFilter: null,
    choices: null,
    effects: [
      { type: 'reputation', amount: 1.0 },
      { type: 'cash', amount: 100 },
    ],
  },
  {
    id: 'driver-friendship',
    tier: 'good',
    title: 'Good Battle',
    description: 'You and another driver traded paint for three laps. Afterward you share a laugh about it — a rival becomes a friend.',
    sessionFilter: ['Heat', 'Heat 1', 'Heat 2', 'Feature', 'Final'],
    choices: null,
    effects: [
      { type: 'reputation', amount: 2.5 },
      { type: 'experience', amount: 1.25 },
    ],
  },
  {
    id: 'found-console',
    tier: 'good',
    title: 'Found Something',
    description: 'You spot something on the ground near the concession stand — a brand-new gaming device, still in the box. Someone definitely dropped it.',
    sessionFilter: null,
    choices: [
      {
        id: 'return',
        label: 'Find the owner',
        effects: [
          { type: 'cash', amount: 100 },
          { type: 'reputation', amount: 5.0 },
        ],
      },
      {
        id: 'keep',
        label: 'Keep it and resell it',
        effects: [{ type: 'cash', amount: 500 }],
      },
    ],
  },
  {
    id: 'birthday-card',
    tier: 'good',
    title: 'Birthday Card',
    description: 'You check your phone between sessions. Mom sent a birthday card — with a little something extra tucked inside.',
    sessionFilter: null,
    choices: null,
    effects: [{ type: 'cash', amount: 250 }],
  },
  {
    id: 'sponsor-visit',
    tier: 'good',
    title: 'Sponsor Stops By',
    description: 'Your sponsor came out to watch you run today. They like what they see and slip you some extra cash for fuel.',
    sessionFilter: null,
    choices: null,
    effects: [
      { type: 'cash', amount: 200 },
      { type: 'reputation', amount: 1.5 },
    ],
  },
  {
    id: 'local-media',
    tier: 'good',
    title: 'Local Coverage',
    description: 'A local newspaper is doing a feature on regional karting. They stop to photograph your kart and get your name.',
    sessionFilter: null,
    choices: null,
    effects: [{ type: 'reputation', amount: 2.0 }],
  },
  {
    id: 'practice-starts',
    tier: 'good',
    title: 'Practice Starts',
    description: 'A faster team invites you to run practice starts with them on the back straight. You learn a lot watching their technique up close.',
    sessionFilter: ['Practice 1', 'Practice 2', 'Practice Happy Hour', 'Practice Warm-up'],
    choices: null,
    effects: [{ type: 'experience', amount: 0.75 }],
  },
  {
    id: 'found-hardware',
    tier: 'good',
    title: 'Spare Hardware',
    description: 'Somebody left a full zip-lock bag of M6 nuts and bolts on top of the parts trailer. It\'s got no name on it.',
    sessionFilter: null,
    choices: null,
    effects: [{ type: 'consumable', key: 'nutsAndBolts', amount: 15 }],
  },
]

// ── Neutral Events ────────────────────────────────────────────
export const NEUTRAL_EVENTS = [
  {
    id: 'dmitri-engine',
    tier: 'neutral',
    title: 'Suspicious Offer',
    description: 'A man with a thick Eastern European accent pulls you aside between sessions. "I have engine," he says. "I guarantee you cross finish line first every time." He taps his nose. "Eighteen hundred. Or your money back." He hands you a greasy business card that just reads "Dmitri."',
    sessionFilter: ['Practice 1'],
    oneTimeOnly: true,
    choices: [
      {
        id: 'yes',
        label: 'Buy it — $1,800',
        requireCash: 1800,
        effects: [
          { type: 'cash', amount: -1800 },
          { type: 'unlockDmitri' },
          { type: 'addDmitriEngine' },
        ],
      },
      {
        id: 'no',
        label: 'Walk away',
        effects: [{ type: 'unlockDmitri' }],
      },
    ],
  },
  {
    id: 'watch-kidkarts',
    tier: 'neutral',
    title: 'Kid Kart Race',
    description: 'The kid kart final is running on track. You lean on the fence and watch for a while. Reminds you why you started.',
    sessionFilter: null,
    choices: null,
    effects: [],
  },
  {
    id: 'friend-call',
    tier: 'neutral',
    title: 'Phone Call',
    description: 'Your phone buzzes — it\'s an old friend calling to catch up. You chat for twenty minutes while waiting for the track to hot up.',
    sessionFilter: null,
    choices: null,
    effects: [],
  },
  {
    id: 'team-lunch',
    tier: 'neutral',
    title: 'Lunch Break',
    description: 'You make a big pot of food for the team in the awning. Everyone eats, nobody talks about lap times for a few minutes.',
    sessionFilter: null,
    choices: null,
    effects: [],
  },
  {
    id: 'scales-broken',
    tier: 'neutral',
    title: 'Scales Down',
    description: 'Tech scales malfunctioned for 20 minutes after qualifying. Officials sorted it quickly — no results affected.',
    sessionFilter: null,
    choices: null,
    effects: [],
  },
  {
    id: 'announcer-name',
    tier: 'neutral',
    title: 'Wrong Name',
    description: 'The track announcer mangles your team name over the PA. Twice. You\'ve heard worse.',
    sessionFilter: null,
    choices: null,
    effects: [],
  },
  {
    id: 'good-camping-spot',
    tier: 'neutral',
    title: 'Prime Spot',
    description: 'You snagged a great paddock spot right next to the outlet, under the shade canopy. Small wins.',
    sessionFilter: null,
    choices: null,
    effects: [],
  },
  {
    id: 'rival-chat',
    tier: 'neutral',
    title: 'Paddock Talk',
    description: 'You run into your closest championship rival at the coffee cart. You both pretend to be relaxed about it.',
    sessionFilter: null,
    choices: null,
    effects: [],
  },
  {
    id: 'carb-jet-check',
    tier: 'neutral',
    title: 'Tech Check',
    description: 'Tech pulls you in for a carb check. Everything is sealed and within spec. You\'re back in the pits in five minutes.',
    sessionFilter: null,
    choices: null,
    effects: [],
  },
]

// ── Bad Events ────────────────────────────────────────────────
export const BAD_EVENTS = [
  {
    id: 'tent-blew-away',
    tier: 'bad',
    title: 'Tent Gone',
    description: 'A gust hit your ez-up just right. It\'s halfway across the paddock, bent beyond saving. You\'re racing in the sun for the rest of the day.',
    sessionFilter: null,
    choices: null,
    effects: [{ type: 'cash', amount: -200 }],
  },
  {
    id: 'chain-came-undone',
    tier: 'bad',
    title: 'Chain Off',
    description: 'Coming out of the hairpin the chain jumped and wrapped around the axle. You coasted in on the grass. DNF.',
    sessionFilter: ['Heat', 'Heat 1', 'Heat 2', 'Feature', 'Final'],
    choices: null,
    effects: [{ type: 'dnf' }],
  },
  {
    id: 'wheel-came-off',
    tier: 'bad',
    title: 'Wheel Off',
    description: 'The right rear wheel sheared a hub bolt under load and came off through turn four. You brought it back — somehow.',
    sessionFilter: null,
    choices: null,
    effects: [{ type: 'dnf' }],
  },
  {
    id: 'lost-cool',
    tier: 'bad',
    title: 'Lost Your Temper',
    description: 'A 206 Jr driver cut you off in the hot pits and you said something you shouldn\'t have. His parents definitely heard.',
    sessionFilter: null,
    choices: null,
    effects: [{ type: 'reputation', amount: -2.0 }],
  },
  {
    id: 'truck-accident',
    tier: 'bad',
    title: 'Hauler Incident',
    description: 'Your equipment truck got clipped on the highway coming in. Everything is okay, but the parts bin bounced around and you lost some inventory.',
    sessionFilter: null,
    oneTimeOnly: false,
    choices: null,
    effects: [
      { type: 'consumable', key: 'nutsAndBolts', amount: -10 },
      { type: 'removeRandomParts', count: 3 },
    ],
  },
  {
    id: 'air-filter-clogged',
    tier: 'bad',
    title: 'Clogged Filter',
    description: 'You find your air filter completely packed with dust from the dirt section in the back paddock. Running restricted all session.',
    sessionFilter: ['Practice 1', 'Practice 2'],
    choices: null,
    effects: [{ type: 'experience', amount: -0.25 }],
  },
  {
    id: 'cadet-hits-kart',
    tier: 'bad',
    title: 'Paddock Ding',
    description: 'A runaway cadet kart rolled into yours while you were getting food. Side pod is cracked.',
    sessionFilter: null,
    choices: null,
    effects: [{ type: 'cash', amount: -52 }],
  },
  {
    id: 'miss-registration',
    tier: 'bad',
    title: 'Almost Late',
    description: 'You misread the schedule board and almost missed your practice registration window. You made it, but the rush rattled you.',
    sessionFilter: ['Practice 1', 'Practice 2', 'Practice Happy Hour', 'Practice Warm-up'],
    choices: null,
    effects: [{ type: 'experience', amount: -0.5 }],
  },
  {
    id: 'dropped-fuel-jug',
    tier: 'bad',
    title: 'Spilled Fuel',
    description: 'You knocked a fuel jug off the stand and lost most of it before you got the cap back on.',
    sessionFilter: null,
    choices: null,
    effects: [{ type: 'consumable', key: 'fuel', amount: -1 }],
  },
  {
    id: 'forgot-helmet',
    tier: 'bad',
    title: 'Forgot Helmet',
    description: 'You left your helmet in the other vehicle. You\'re borrowing one from another team — everyone in the paddock knows.',
    sessionFilter: null,
    choices: null,
    effects: [{ type: 'reputation', amount: -1.0 }],
  },
]

// ── Helpers ───────────────────────────────────────────────────

export const ALL_EVENTS = [...GOOD_EVENTS, ...NEUTRAL_EVENTS, ...BAD_EVENTS]

// Returns events valid for the given session name and championship.
export function getEligibleEvents(tier, sessionName, championship, triggeredIds = []) {
  const pool = tier === 'good' ? GOOD_EVENTS : tier === 'neutral' ? NEUTRAL_EVENTS : BAD_EVENTS
  return pool.filter(ev => {
    if (ev.oneTimeOnly && triggeredIds.includes(ev.id)) return false
    if (ev.sessionFilter && !ev.sessionFilter.includes(sessionName)) return false
    if (ev.championshipFilter && !ev.championshipFilter.includes(championship.id)) return false
    return true
  })
}

// Pick one random event from a pool.
export function pickEvent(pool) {
  if (!pool.length) return null
  return pool[Math.floor(Math.random() * pool.length)]
}
