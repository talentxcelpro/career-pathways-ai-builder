// Apple messaging ringtone functionality
export const playAppleMessageTone = () => {
  // Create Apple-like message tone using Web Audio API
  const playMessageTone = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create two oscillators for the classic Apple message tone
    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    
    // Create gain nodes for volume control
    const gain1 = audioContext.createGain();
    const gain2 = audioContext.createGain();
    
    // Connect oscillators to gain nodes and then to destination
    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(audioContext.destination);
    gain2.connect(audioContext.destination);
    
    // Set frequencies for the classic Apple message tone (two-tone ping)
    osc1.frequency.setValueAtTime(1000, audioContext.currentTime); // 1kHz
    osc2.frequency.setValueAtTime(800, audioContext.currentTime);  // 800Hz
    
    // Set wave types
    osc1.type = 'sine';
    osc2.type = 'sine';
    
    // Set volume envelope (quick fade out)
    const now = audioContext.currentTime;
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    gain2.gain.setValueAtTime(0.2, now);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    // Start and stop the tones
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.3);
  };

  // Check if audio context is supported
  if (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined') {
    try {
      playMessageTone();
    } catch (error) {
      console.warn('Could not play notification sound:', error);
      // Fallback to system notification sound
      fallbackNotificationSound();
    }
  } else {
    // Fallback for browsers that don't support Web Audio API
    fallbackNotificationSound();
  }
};

const fallbackNotificationSound = () => {
  // Create a short beep as fallback
  const audio = new Audio();
  audio.src = 'data:audio/wav;base64,UklGRvgAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAB/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/';
  audio.volume = 0.3;
  audio.play().catch(() => {
    // Ignore audio play errors
  });
};