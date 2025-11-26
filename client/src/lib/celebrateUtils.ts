import confetti from 'canvas-confetti';

interface CelebrationOptions {
  particleCount?: number;
  spread?: number;
  origin?: { x?: number; y?: number };
  colors?: string[];
}

/**
 * Triggers confetti celebration with sound and vibration effects
 * Respects device mute settings and gracefully degrades
 */
export async function celebrate(options: CelebrationOptions = {}) {
  const {
    particleCount = 100,
    spread = 70,
    origin = { y: 0.5 },
    colors
  } = options;

  // Trigger confetti
  confetti({
    particleCount,
    spread,
    origin: origin as any,
    ...(colors && { colors })
  });

  // Play popping sound
  playPopSound();

  // Trigger vibration if device supports it
  triggerVibration();
}

/**
 * Play a popping sound using Web Audio API
 * Falls back gracefully if audio is unavailable
 */
function playPopSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create oscillator for a quick "pop" sound
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    
    // Pop sound: quick pitch sweep down
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.1);
    
    // Quick volume envelope
    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    // Silently fail if audio context is not available
    // This handles muted devices and unsupported browsers
  }
}

/**
 * Trigger device vibration if supported
 * Most modern phones and tablets support this
 */
function triggerVibration() {
  try {
    // Vibration pattern: 20ms vibration, 10ms pause, 20ms vibration
    if (navigator.vibrate) {
      navigator.vibrate([20, 10, 20]);
    }
  } catch (error) {
    // Silently fail if vibration is not available
    // Desktop browsers and some devices don't support this
  }
}

/**
 * Enhanced version for high-score celebrations with multiple bursts
 */
export async function celebrateHighScore(options: CelebrationOptions = {}) {
  const duration = 3000;
  const animationEnd = Date.now() + duration;

  const randomInRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  };

  const firework = () => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) return;

    // Multiple celebratory pops
    playPopSound();
    triggerVibration();

    confetti({
      particleCount: options.particleCount || 50,
      spread: randomInRange(50, 100),
      origin: { x: randomInRange(0.3, 0.7), y: 0.5 },
      colors: options.colors || ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff']
    });

    if (timeLeft > 0) {
      requestAnimationFrame(firework);
    }
  };

  firework();
}
