import { useEffect } from 'react'
import styles from './CreditsScreen.module.css'

export default function CreditsScreen({ onBack }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onBack?.()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onBack])

  const credits = [
    { role: 'Game Design', name: 'Zachary Belles' },
    { role: 'Programming', name: 'Zachary Belles' },
    { role: 'Art Direction', name: 'Zachary Belles' },
    { role: 'UI/UX Design', name: 'Zachary Belles' },
    { role: 'Graphics & Animation', name: 'Zachary Belles' },
    { role: 'Music Composition', name: 'Zachary Belles' },
    { role: 'Physics Simulation', name: 'Zachary Belles' },
    { role: 'Race Engine Development', name: 'Zachary Belles' },
    { role: 'Chassis Tuning System', name: 'Zachary Belles' },
    { role: 'AI Drivers', name: 'Zachary Belles' },
    { role: 'Track Design', name: 'Zachary Belles' },
    { role: 'Vehicle Models', name: 'Zachary Belles' },
    { role: 'Tire Simulation', name: 'Zachary Belles' },
    { role: 'Engine Physics', name: 'Zachary Belles' },
    { role: 'Career Mode', name: 'Zachary Belles' },
    { role: 'Championship System', name: 'Zachary Belles' },
    { role: 'Damage System', name: 'Zachary Belles' },
    { role: 'Parts Management', name: 'Zachary Belles' },
    { role: 'Save System', name: 'Zachary Belles' },
    { role: 'Database Design', name: 'Zachary Belles' },
    { role: 'Quality Assurance', name: 'Zachary Belles' },
    { role: 'Testing', name: 'Zachary Belles' },
    { role: 'Bug Fixes', name: 'Zachary Belles' },
    { role: 'Performance Optimization', name: 'Zachary Belles' },
    { role: 'Documentation', name: 'Zachary Belles' },
    { role: 'Writing', name: 'Zachary Belles' },
    { role: 'Dialogue', name: 'Zachary Belles' },
    { role: 'Narrative Design', name: 'Zachary Belles' },
    { role: 'Story', name: 'Zachary Belles' },
    { role: 'Character Development', name: 'Zachary Belles' },
    { role: 'World Building', name: 'Zachary Belles' },
    { role: 'Event Design', name: 'Zachary Belles' },
    { role: 'Dialogue Trees', name: 'Zachary Belles' },
    { role: 'Marketing', name: 'Zachary Belles' },
    { role: 'Community Management', name: 'Zachary Belles' },
    { role: 'Public Relations', name: 'Zachary Belles' },
    { role: 'Creative Direction', name: 'Zachary Belles' },
    { role: 'Executive Producer', name: 'Zachary Belles' },
    { role: 'Producer', name: 'Zachary Belles' },
    { role: 'Director', name: 'Zachary Belles' },
  ]

  return (
    <div className={styles.screen}>
      <div className={styles.content}>
        <h1 className={styles.title}>Credits</h1>

        <div className={styles.creditsContainer}>
          {credits.map((credit, idx) => (
            <div key={idx} className={styles.creditLine}>
              <span className={styles.role}>{credit.role}</span>
              <span className={styles.name}>{credit.name}</span>
            </div>
          ))}
        </div>

        <p className={styles.footer}>Press ESC or click back to return</p>
      </div>

      <button className={styles.backBtn} onClick={onBack}>
        ← Back
      </button>
    </div>
  )
}
