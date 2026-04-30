import { useState, useEffect } from 'react'
import styles from './TitleScreen.module.css'
import { soundManager, SOUNDS } from '../utils/soundManager'

import birel   from '../images/birel-4stroke-removebg.png'
import tonyKart from '../images/tony-kart-4stroke-removebg.png'
import coyote  from '../images/coyote-4stroke-removebg.png'
import ignite  from '../images/ignite-4stroke-removebg.png'

const KARTS = [
  { src: birel,    alt: 'Birel Art'  },
  { src: tonyKart, alt: 'Tony Kart'  },
  { src: coyote,   alt: 'Coyote'     },
  { src: ignite,   alt: 'Ignite'     },
]

const MENU_ITEMS = [
  { id: 'new',     label: 'New Career',  desc: 'Start fresh — build your team from nothing' },
  { id: 'options', label: 'Options',     desc: 'Audio, display, and game settings' },
  { id: 'credits', label: 'Credits',     desc: 'The people behind the wheel' },
]

export default function TitleScreen({ onNavigate }) {
  const [selected, setSelected] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    soundManager.playMusic(SOUNDS.titleMusic)
    const id = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'ArrowUp')   setSelected(s => (s - 1 + MENU_ITEMS.length) % MENU_ITEMS.length)
      if (e.key === 'ArrowDown') setSelected(s => (s + 1) % MENU_ITEMS.length)
      if (e.key === 'Enter')     onNavigate?.(MENU_ITEMS[selected].id)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selected, onNavigate])

  return (
    <div className={`${styles.screen} ${visible ? styles.visible : ''}`}>
      <div className={styles.bgGlow} />

      <header className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.titleMain}>Kart Team </span>
          <span className={styles.titleAccent}>Manager</span>
        </h1>
        <p className={styles.tagline}>Build the squad. Call the shots. Win the season.</p>
      </header>

      <div className={styles.kartsRow}>
        {KARTS.map((kart, i) => (
          <div
            key={kart.alt}
            className={styles.kartWrapper}
            style={{ '--delay': `${i * 80}ms` }}
          >
            <img src={kart.src} alt={kart.alt} className={styles.kartImg} draggable={false} />
          </div>
        ))}
        <div className={styles.kartsGradientLeft} />
        <div className={styles.kartsGradientRight} />
      </div>

      <nav className={styles.menu}>
        {MENU_ITEMS.map((item, i) => (
          <button
            key={item.id}
            className={`${styles.menuItem} ${i === selected ? styles.active : ''}`}
            onMouseEnter={() => setSelected(i)}
            onClick={() => onNavigate?.(item.id)}
          >
            <span className={styles.itemLabel}>{item.label}</span>
            <span className={styles.itemDesc}>{item.desc}</span>
            <span className={styles.itemArrow}>→</span>
          </button>
        ))}
      </nav>

      <footer className={styles.footer}>
        <span>v0.1.1</span>
        <span>↑ ↓ navigate · Enter select</span>
      </footer>
    </div>
  )
}
