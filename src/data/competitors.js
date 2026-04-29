// skill: base 1–100; simulation adds ±3–4 random jitter on use.
// Route 66 skills derived from end-of-season standings lap times.
// Marc Stehle (#596) is flagged as the field's best despite P10 standing.

// ── Route 66 Sprint Series ────────────────────────────────────
const COMPETITORS_ROUTE66 = [
  { kart: 501, name: 'Declan Conklin',      skill: 69 },
  { kart: 502, name: 'Eric A. McMillian',   skill: 56 },
  { kart: 503, name: 'Zach Belles',         skill: 71 },
  { kart: 504, name: 'Tyler Katra',         skill: 44 },
  { kart: 505, name: 'Louis Palmisano',     skill: 58 },
  { kart: 506, name: 'Levi Wilbur',         skill: 65 },
  { kart: 507, name: 'Michael Smith',       skill: 59 },
  { kart: 508, name: 'Cale Zimmermann',     skill: 92 },
  { kart: 509, name: 'Brayden Zirves',      skill: 83 },
  { kart: 510, name: 'Logan Pollock',       skill: 69 },
  { kart: 511, name: 'Alex Koleczek',       skill: 62 },
  { kart: 512, name: 'Charles Oszlanszky',  skill: 66 },
  { kart: 513, name: 'Leo Rojas',           skill: 67 },
  { kart: 514, name: 'Jesus Garza',         skill: 64 },
  { kart: 515, name: 'Michael Powers',      skill: 65 },
  { kart: 516, name: 'Brody Strong',        skill: 78 },
  { kart: 520, name: 'Jacey Mueller',       skill: 57 },
  { kart: 522, name: 'Blake Carlson',       skill: 57 },
  { kart: 524, name: 'Shane Ready',         skill: 80 },
  { kart: 525, name: 'Layton Mull',         skill: 79 },
  { kart: 528, name: 'Dane Underwood',      skill: 70 },
  { kart: 530, name: 'Vincent Fritz',       skill: 71 },
  { kart: 534, name: 'Owen Smith',          skill: 61 },
  { kart: 536, name: 'Connor Fasching',     skill: 82 },
  { kart: 541, name: 'Wyatt Leslie',        skill: 89 },
  { kart: 544, name: 'Tommy Boyce',         skill: 60 },
  { kart: 548, name: 'Owen Mahle',          skill: 73 },
  { kart: 555, name: 'River Carlson',       skill: 68 },
  { kart: 564, name: 'Brady Schad',         skill: 75 },
  { kart: 565, name: 'Joseph Wilson',       skill: 67 },
  { kart: 575, name: 'Isaac Malcuit',       skill: 77 },
  { kart: 577, name: 'James Recendez',      skill: 63 },
  { kart: 578, name: 'Adam Maxwell',        skill: 64 },
  { kart: 579, name: 'Quinten McPherson',   skill: 90 },
  { kart: 581, name: 'Jack Fieber',         skill: 86 },
  { kart: 588, name: 'Carter Riddle',       skill: 88 },
  { kart: 590, name: 'Thomas Shereck',      skill: 64 },
  { kart: 591, name: 'Ben Lyda',            skill: 84 },
  { kart: 596, name: 'Marc Stehle',         skill: 96 },
  { kart: 597, name: 'Eli Warren',          skill: 61 },
  { kart: 598, name: 'Sam Tutwiler',        skill: 81 },
  { kart: 599, name: 'Lane Mayer',          skill: 83 },
]

// ── Norway Motorsports Park Club Championship ─────────────────
// Duplicates (entries 26–27 in source) removed.
// Three drivers legitimately share kart #54 in real club data.
const COMPETITORS_CLUB = [
  { kart: '777', name: 'James Recendez',    skill: 72 },
  { kart: '33',  name: 'Jeremy Jr Colley',  skill: 70 },
  { kart: '11',  name: 'Nathan Levenhagen', skill: 73 },
  { kart: '88',  name: 'Colin Cox',         skill: 69 },
  { kart: '09',  name: 'Mike Stephenson',   skill: 67 },
  { kart: '57',  name: 'Matthew Hartsell',  skill: 70 },
  { kart: '9',   name: 'Dillon Willis',     skill: 64 },
  { kart: '98',  name: 'Justice Buttala',   skill: 62 },
  { kart: '17',  name: 'Mike Evans',        skill: 66 },
  { kart: '29',  name: 'Max Cramer',        skill: 69 },
  { kart: '22',  name: 'Jack Mohr',         skill: 67 },
  { kart: '517', name: 'Logan Matusik',     skill: 71 },
  { kart: '6',   name: 'Chad Carlson',      skill: 68 },
  { kart: '27',  name: 'Aidan Liber',       skill: 65 },
  { kart: '19',  name: 'Sawyer Schwab',     skill: 63 },
  { kart: '324', name: 'Dylan Turnbull',    skill: 67 },
  { kart: '26',  name: 'Noah Nelson',       skill: 64 },
  { kart: '05',  name: 'Louis Palmisano',   skill: 61 },
  { kart: '54',  name: 'Jacob Magnowski',   skill: 62 },
  { kart: '1',   name: 'Declan Conklin',    skill: 72 },
  { kart: '54',  name: 'Dave Holzner',      skill: 59 },
  { kart: '55',  name: 'Kevin Holzner',     skill: 70 },
  { kart: '5',   name: 'Scott Cramer',      skill: 74 },
  { kart: '54',  name: 'David Francis',     skill: 61 },
  { kart: '38',  name: 'Dalton Mcconnell',  skill: 59 },
]

// ── Ignite Challenge ──────────────────────────────────────────
const COMPETITORS_IGNITE = [
  { kart: '05',  name: 'Louis Palmisano',     skill: 60 },
  { kart: '777', name: 'James Recendez',      skill: 71 },
  { kart: '15',  name: 'Jake Walsh',          skill: 68 },
  { kart: '590', name: 'Thomas Shereck',      skill: 65 },
  { kart: '1',   name: 'Declan Conklin',      skill: 72 },
  { kart: '7',   name: 'Sterling Layman',     skill: 74 },
  { kart: '11',  name: 'Nathan Levenhagen',   skill: 73 },
  { kart: '10',  name: 'Joe Dombrosky',       skill: 67 },
  { kart: '12',  name: 'Christian Breyer',    skill: 66 },
  { kart: '26',  name: 'Noah Nelson',         skill: 64 },
  { kart: '14',  name: 'Ken Williams',        skill: 69 },
  { kart: '16',  name: 'Jaiden Beckman',      skill: 65 },
  { kart: '18',  name: 'Jaxson Miller',       skill: 62 },
  { kart: '27',  name: 'Aidan Liber',         skill: 66 },
  { kart: '20',  name: 'Brady Tyler',         skill: 68 },
  { kart: '88',  name: 'Colin Cox',           skill: 70 },
  { kart: '21',  name: 'Adam Crepin',         skill: 63 },
  { kart: '33',  name: 'Jeremy Colley',       skill: 71 },
  { kart: '23',  name: 'Ashton Wheeler',      skill: 64 },
  { kart: '516', name: 'Brody Strong',        skill: 78 },
  { kart: '24',  name: 'Patrick Bernatowicz', skill: 67 },
  { kart: '25',  name: 'Race Beckman',        skill: 72 },
  { kart: '28',  name: 'Matthew Pyatt',       skill: 61 },
  { kart: '30',  name: 'Leonardo Malavet',    skill: 63 },
  { kart: '31',  name: 'James Mann',          skill: 62 },
  { kart: '32',  name: 'Nicholas Albers',     skill: 64 },
  { kart: '34',  name: 'Nehemiah De Sousa',   skill: 60 },
  { kart: '35',  name: 'Ethan Pogue',         skill: 65 },
  { kart: '36',  name: 'Christian Hughes',    skill: 62 },
  { kart: '37',  name: 'Isaac Wells',         skill: 60 },
  { kart: '29',  name: 'Max Cramer',          skill: 70 },
  { kart: '39',  name: 'Logan Nealis',        skill: 67 },
  { kart: '40',  name: 'Anton Faizov',        skill: 68 },
  { kart: '22',  name: 'Jack Mohr',           skill: 68 },
  { kart: '41',  name: 'RJ Hetge',            skill: 64 },
  { kart: '42',  name: 'Liam Fugatt',         skill: 61 },
  { kart: '09',  name: 'Mike Stephenson',     skill: 67 },
  { kart: '43',  name: 'Eli Stevens',         skill: 63 },
  { kart: '57',  name: 'Matthew Hartsell',    skill: 71 },
  { kart: '44',  name: 'Trevor Knepper',      skill: 65 },
  { kart: '45',  name: 'Avery Scott',         skill: 62 },
  { kart: '46',  name: 'Jeff Scott',          skill: 60 },
  { kart: '47',  name: 'Drew Mayton',         skill: 64 },
  { kart: '48',  name: 'Robert Sawrey',       skill: 61 },
  { kart: '55',  name: 'Kevin Holzner',       skill: 70 },
  { kart: '49',  name: 'Owen Neisel',         skill: 63 },
  { kart: '50',  name: 'Christopher James',   skill: 60 },
  { kart: '51',  name: 'Aaron Snyder',        skill: 62 },
  { kart: '52',  name: 'Eli Dysart',          skill: 65 },
  { kart: '53',  name: 'Cayden Carlson',      skill: 68 },
  { kart: '56',  name: 'Nick Ksobiech',       skill: 64 },
  { kart: '58',  name: 'Riley Scott',         skill: 61 },
]

export function getCompetitors(championship) {
  if (championship.id === 'route66')          return COMPETITORS_ROUTE66
  if (championship.id === 'norway')           return COMPETITORS_CLUB
  if (championship.id === 'ignite-challenge') return COMPETITORS_IGNITE
  return COMPETITORS_ROUTE66
}

// player: { name, kart } — injected at end with isPlayer:true.
// If a competitor already has the same kart number, they are replaced.
export function buildBlankStandings(championship, player) {
  const competitors = getCompetitors(championship)
  const filtered    = player
    ? competitors.filter(c => String(c.kart) !== String(player.kart))
    : competitors
  const rows = filtered.map((c, i) => ({
    pos:       i + 1,
    kart:      c.kart,
    name:      c.name,
    skill:     c.skill,
    diff:      null,
    laps:      0,
    bestLap:   null,
    bestLapNo: null,
    bestSpeed: null,
    isPlayer:  false,
  }))
  if (player) {
    rows.push({
      pos:       rows.length + 1,
      kart:      player.kart,
      name:      player.name,
      skill:     null,
      diff:      null,
      laps:      0,
      bestLap:   null,
      bestLapNo: null,
      bestSpeed: null,
      isPlayer:  true,
    })
  }
  return rows
}

export function buildBlankChampionshipPoints(championship, player) {
  const competitors = getCompetitors(championship)
  const filtered    = player
    ? competitors.filter(c => String(c.kart) !== String(player.kart))
    : competitors
  const rows = filtered.map((c, i) => ({
    pos:      i + 1,
    kart:     c.kart,
    name:     c.name,
    skill:    c.skill,
    points:   0,
    isPlayer: false,
  }))
  if (player) {
    rows.push({
      pos:      rows.length + 1,
      kart:     player.kart,
      name:     player.name,
      skill:    null,
      points:   0,
      isPlayer: true,
    })
  }
  return rows
}
