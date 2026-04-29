import styles from './ChampionshipCompleteModal.module.css'

export default function ChampionshipCompleteModal({ playerFinish, isWin, onContinue, onMainMenu }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {isWin ? (
          <>
            <h2 className={styles.title}>Championship Won!</h2>
            <p className={styles.message}>You've made your sponsors proud.</p>
            <div className={styles.buttons}>
              <button className={styles.btnPrimary} onClick={onContinue}>
                Continue to Next Season →
              </button>
              <button className={styles.btnSecondary} onClick={onMainMenu}>
                Main Menu
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className={styles.title}>Championship Over</h2>
            <p className={styles.message}>You didn't meet manufacturer requirements.</p>
            <div className={styles.buttons}>
              <button className={styles.btnPrimary} onClick={onMainMenu}>
                Main Menu
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
