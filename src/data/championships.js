import norwayLogo     from '../images/Norway_logo.png'
import igniteChalLogo from '../images/ignite_challenge_logo.jpeg'
import route66Logo    from '../images/route66_logo.png'

export const CHAMPIONSHIPS = [
  {
    id: 'norway',
    name: 'Norway Motorsports Park Club Championship',
    subtitle: 'Norway Motorsports Park',
    difficulty: 'Easy',
    logo: norwayLogo,
    logoBg: false,
    margayWarning: false,
    totalRaces: 4,
    tracks: [
      'Norway Motorsports Park',
    ],
  },
  {
    id: 'ignite-challenge',
    name: 'Ignite Challenge',
    subtitle: '61 Kartway · Norway · Autobahn · Mid-State · Gateway',
    difficulty: 'Hard',
    logo: igniteChalLogo,
    logoBg: true,
    margayWarning: false,
    margayOnly: true,
    totalRaces: 5,
    tracks: [
      '61 Kartway',
      'Norway Motorsports Park',
      'Kart Circuit Autobahn',
      'Mid-State Kart Club',
      'Gateway Kartplex',
    ],
  },
  {
    id: 'route66',
    name: 'Route 66 Sprint Series',
    subtitle: 'New Castle · Norway · Mill-Rite · Briggs & Stratton',
    difficulty: 'Impossible',
    logo: route66Logo,
    logoBg: true,
    margayWarning: true,
    totalRaces: 4,
    tracks: [
      'New Castle Motorsports Park',
      'Norway Motorsports Park',
      'Mill-Rite Raceway',
      'Briggs and Stratton Motorplex',
    ],
  },
]
