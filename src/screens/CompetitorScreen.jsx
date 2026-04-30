import { useState } from 'react'
import GameHeader from '../components/GameHeader'
import { getCompetitors } from '../data/competitors'
import styles from './CompetitorScreen.module.css'

function getOrdinalSuffix(n) {
  if (n % 100 >= 11 && n % 100 <= 13) return 'th'
  switch (n % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

function formatOrdinal(n) {
  return n + getOrdinalSuffix(n)
}

export default function CompetitorScreen({ gameState, onBack }) {
  const { championship, championshipPoints = [] } = gameState
  const competitors = getCompetitors(championship)
  const [selectedCompetitor, setSelectedCompetitor] = useState(null)

  const points = championshipPoints.sort((a, b) => (a.pos ?? 999) - (b.pos ?? 999))

  return (
    <div className={styles.screen}>
      <GameHeader gameState={gameState} />

      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={onBack}>← Hub</button>
        <h1 className={styles.title}>Championship Standings</h1>
      </div>

      <div className={styles.standingsTable}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thPos}>Pos</th>
              <th className={styles.thNum}>#</th>
              <th className={styles.thName}>Driver</th>
              <th className={styles.thTeam}>Team</th>
              <th className={styles.thPoints}>Points</th>
            </tr>
          </thead>
          <tbody>
            {points.map(row => {
              const competitor = competitors.find(c => c.kart === row.kart)
              return (
                <tr
                  key={`${row.kart}-${row.name}`}
                  className={`${styles.tr} ${row.isPlayer ? styles.trPlayer : ''}`}
                  onClick={() => setSelectedCompetitor(competitor)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className={styles.tdPos}>{row.pos}</td>
                  <td className={styles.tdNum}>{row.kart}</td>
                  <td className={styles.tdName}>
                    {row.name}
                    {row.isPlayer && <span className={styles.playerBadge}>YOU</span>}
                  </td>
                  <td className={styles.tdTeam}>{competitor?.team ?? '—'}</td>
                  <td className={styles.tdPoints}><strong>{row.points}</strong></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selectedCompetitor && (
        <div className={styles.modalOverlay} onClick={() => setSelectedCompetitor(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setSelectedCompetitor(null)}>×</button>

            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalName}>{selectedCompetitor.name}</h2>
                <p className={styles.modalTeam}>{selectedCompetitor.team}</p>
              </div>
              <span className={styles.modalKart}>#{selectedCompetitor.kart}</span>
            </div>

            <div className={styles.modalBody}>
              {(() => {
                const row = points.find(p => p.kart === selectedCompetitor.kart)
                return (
                  <>
                    {row && (
                      <div className={styles.modalRow}>
                        <span className={styles.modalLabel}>Position:</span>
                        <span className={styles.modalValue}>{formatOrdinal(row.pos)} / {points.length}</span>
                      </div>
                    )}
                    {row && (
                      <div className={styles.modalRow}>
                        <span className={styles.modalLabel}>Points:</span>
                        <span className={styles.modalValue}>{row.points}</span>
                      </div>
                    )}
                    <div className={styles.modalRow}>
                      <span className={styles.modalLabel}>Chassis:</span>
                      <span className={styles.modalValue}>{selectedCompetitor.chassis || '—'}</span>
                    </div>
                    <div className={styles.modalRow}>
                      <span className={styles.modalLabel}>Skill Level:</span>
                      <span className={styles.modalValue}>{selectedCompetitor.skill}/100</span>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
