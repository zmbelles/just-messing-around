// Audio file paths
export const SOUNDS = {
  titleMusic: '/music/title_screen_music.mp3',
  careerMusic: '/music/car_building_and_career_screens_music.mp3',
  raceEffect: '/sounds/during_race_effect.mp3',
  purchaseEffect: '/sounds/purchase_effect.mp3',
  failureEffect: '/sounds/thing_failed_effect.mp3',
  hoverEffect: '/sounds/mouse_hover.mp3',
}

class SoundManager {
  constructor() {
    this.currentMusic = null
    this.currentEffect = null
    this.effectVolume = 0.6
    this.musicVolume = 0.4
    this.muted = false
  }

  playMusic(soundPath, loop = true) {
    if (this.muted) return

    // Stop current music if playing
    if (this.currentMusic) {
      this.currentMusic.pause()
      this.currentMusic.currentTime = 0
    }

    const audio = new Audio(soundPath)
    audio.volume = this.musicVolume
    audio.loop = loop
    audio.play().catch(err => console.log('Music playback:', err.message))
    this.currentMusic = audio
  }

  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.pause()
      this.currentMusic.currentTime = 0
      this.currentMusic = null
    }
  }

  playEffect(soundPath) {
    if (this.muted) return

    // Stop current effect if playing
    if (this.currentEffect) {
      this.currentEffect.pause()
      this.currentEffect.currentTime = 0
    }

    const audio = new Audio(soundPath)
    audio.volume = this.effectVolume
    audio.play().catch(err => console.log('Effect playback:', err.message))
    this.currentEffect = audio
  }

  stopEffect() {
    if (this.currentEffect) {
      this.currentEffect.pause()
      this.currentEffect.currentTime = 0
      this.currentEffect = null
    }
  }

  setMuted(muted) {
    this.muted = muted
    if (muted && this.currentMusic) {
      this.currentMusic.pause()
    } else if (!muted && this.currentMusic) {
      this.currentMusic.play()
    }
  }
}

export const soundManager = new SoundManager()
