// Optimal kart setup per track, applied when the player buys a coaching session.
// Values stay within the adjustable ranges: rear 52-58", front 43-47", shims 0-6.
// dryFront/dryRear and wetFront/wetRear are sprocket teeth (for any chain pitch).
export const COACHING_SETUPS = {
  'Norway Motorsports Park':       { rearTrackWidth: 53.0, frontTrackWidth: 44.0, frontShims: 4, dryFront: 14, dryRear: 74, wetFront: 13, wetRear: 78 },
  '61 Kartway':                    { rearTrackWidth: 55.0, frontTrackWidth: 45.0, frontShims: 5, dryFront: 12, dryRear: 84, wetFront: 11, wetRear: 88 },
  'Kart Circuit Autobahn':         { rearTrackWidth: 57.0, frontTrackWidth: 46.0, frontShims: 6, dryFront: 12, dryRear: 82, wetFront: 11, wetRear: 86 },
  'Mid-State Kart Club':           { rearTrackWidth: 54.5, frontTrackWidth: 44.5, frontShims: 5, dryFront: 12, dryRear: 85, wetFront: 11, wetRear: 89 },
  'Gateway Kartplex':              { rearTrackWidth: 53.5, frontTrackWidth: 44.0, frontShims: 4, dryFront: 13, dryRear: 80, wetFront: 12, wetRear: 84 },
  'New Castle Motorsports Park':   { rearTrackWidth: 57.0, frontTrackWidth: 46.5, frontShims: 6, dryFront: 12, dryRear: 88, wetFront: 11, wetRear: 92 },
  'Mill-Rite Raceway':             { rearTrackWidth: 54.0, frontTrackWidth: 44.5, frontShims: 5, dryFront: 13, dryRear: 80, wetFront: 12, wetRear: 84 },
  'Briggs and Stratton Motorplex': { rearTrackWidth: 55.5, frontTrackWidth: 45.0, frontShims: 5, dryFront: 12, dryRear: 86, wetFront: 11, wetRear: 90 },
}

export function getCoachingSetup(trackName) {
  return COACHING_SETUPS[trackName] ?? { rearTrackWidth: 55.0, frontTrackWidth: 45.0, frontShims: 3, dryFront: 12, dryRear: 84, wetFront: 11, wetRear: 88 }
}
