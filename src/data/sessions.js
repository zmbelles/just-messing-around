export function getSessions(championship) {
  if (championship.id === 'route66') {
    return [
      { day: 'Fri', name: 'Practice 1' },
      { day: 'Fri', name: 'Practice 2' },
      { day: 'Sat', name: 'Practice Happy Hour' },
      { day: 'Sat', name: 'Quali' },
      { day: 'Sat', name: 'Heat 1' },
      { day: 'Sun', name: 'Practice Warm-up' },
      { day: 'Sun', name: 'Heat 2' },
      { day: 'Sun', name: 'Final' },
    ]
  }
  // Norway Club Championship and Ignite Challenge share the same schedule
  return [
    { day: 'Sat', name: 'Practice 1' },
    { day: 'Sat', name: 'Practice 2' },
    { day: 'Sat', name: 'Quali' },
    { day: 'Sat', name: 'Heat' },
    { day: 'Sat', name: 'Feature' },
  ]
}
