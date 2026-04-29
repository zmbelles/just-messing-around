import styles from './ChampionshipResultsScreen.module.css'

function ordinal(n) {
  const j = n % 10, k = n % 100
  if (j === 1 && k !== 11) return n + 'st'
  if (j === 2 && k !== 12) return n + 'nd'
  if (j === 3 && k !== 13) return n + 'rd'
  return n + 'th'
}

export default function ChampionshipResultsScreen({ gameState, onComplete }) {
  const { championship, championshipPoints, roundHistory } = gameState
  const prizePool = { 'norway': 2500, 'ignite-challenge': 5000, 'route66': 10000 }
  const total = prizePool[championship.id] ?? 2500
  const distribution = [0.30, 0.20, 0.15, 0.12, 0.10, 0.08, 0.05]
  const playerRow = championshipPoints.find(row => row.isPlayer)
  const playerFinish = (playerRow?.pos ?? 10) - 1
  const playerPrize = playerFinish < distribution.length ? Math.round(total * distribution[playerFinish]) : 0

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <h1 className={styles.title}>{championship.name}</h1>
        <p className={styles.subtitle}>Championship Complete</p>
      </div>

      <div className={styles.standingsWrapper}>
        <table className={styles.standings}>
          <thead>
            <tr>
              <th className={styles.thPos}>Pos</th>
              <th className={styles.thName}>Driver</th>
              <th className={styles.thPoints}>Points</th>
              <th className={styles.thPrize}>Prize</th>
            </tr>
          </thead>
          <tbody>
            {championshipPoints.map((driver, idx) => {
              const prize = idx < distribution.length ? Math.round(total * distribution[idx]) : 0
              const isPlayer = driver.isPlayer
              return (
                <tr key={`${driver.name}-${driver.kart}`} className={`${styles.tr} ${isPlayer ? styles.trPlayer : ''}`}>
                  <td className={styles.tdPos}>{driver.pos}</td>
                  <td className={styles.tdName}>
                    {isPlayer ? <strong>{driver.name}</strong> : driver.name}
                  </td>
                  <td className={styles.tdPoints}>{driver.points}</td>
                  <td className={styles.tdPrize}>${prize}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryBox}>
          <p className={styles.summaryLabel}>Your Finish</p>
          <p className={styles.summaryValue}>{ordinal(playerFinish + 1)} Place</p>
        </div>
        <div className={styles.summaryBox}>
          <p className={styles.summaryLabel}>Prize Earnings</p>
          <p className={styles.summaryValue}>${playerPrize}</p>
        </div>
      </div>

      <button className={styles.continueBtn} onClick={onComplete}>
        Continue →
      </button>
    </div>
  )
}
