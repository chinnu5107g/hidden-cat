/**
 * HIDDEN CATS - Audio Manager
 * Procedural Web Audio API sound generator & music synthesizer
 * Works out of the box with zero external dependencies
 */

const AudioManager = (() => {
  let audioCtx = null;
  let sfxEnabled = true;
  let musicEnabled = true;
  let sfxVolume = 0.8;
  let musicVolume = 0.5;
  let musicGainNode = null;
  let musicInterval = null;

  const init = () => {
    // Load preferences
    sfxEnabled = StorageManager.get('sfx_enabled', true);
    musicEnabled = StorageManager.get('music_enabled', true);
    sfxVolume = StorageManager.get('sfx_volume', 0.8);
    musicVolume = StorageManager.get('music_volume', 0.5);

    // AudioContext will resume on first user interaction
    const unlockAudio = () => {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
        }
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      if (musicEnabled && !musicInterval) {
        startAmbientMusic();
      }
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };

    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });
  };

  const getContext = () => {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  };

  // Sound: UI Click
  const playClick = () => {
    if (!sfxEnabled) return;
    const ctx = getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(sfxVolume * 0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  };

  // Sound: Cat Meow & Magical Chime
  const playCatFound = () => {
    if (!sfxEnabled) return;
    const ctx = getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Synthesize Cute Meow
    const meowOsc = ctx.createOscillator();
    const meowGain = ctx.createGain();
    meowOsc.type = 'triangle';
    
    // Meow pitch contour: starts at 520Hz, rises to 780Hz, glides to 440Hz
    meowOsc.frequency.setValueAtTime(520, now);
    meowOsc.frequency.exponentialRampToValueAtTime(780, now + 0.12);
    meowOsc.frequency.exponentialRampToValueAtTime(440, now + 0.38);

    meowGain.gain.setValueAtTime(0.001, now);
    meowGain.gain.linearRampToValueAtTime(sfxVolume * 0.45, now + 0.08);
    meowGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    meowOsc.connect(meowGain);
    meowGain.connect(ctx.destination);
    meowOsc.start(now);
    meowOsc.stop(now + 0.4);

    // 2. Magical Chimes Arpeggio
    const notes = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(sfxVolume * 0.25, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.45);
    });
  };

  // Sound: Wrong / Miss Selection
  const playWrong = () => {
    if (!sfxEnabled) return;
    const ctx = getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.25);

    gain.gain.setValueAtTime(sfxVolume * 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  };

  // Sound: Victory Fanfare
  const playVictory = () => {
    if (!sfxEnabled) return;
    const ctx = getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const chords = [
      { f: [523.25, 659.25, 783.99], t: 0 },       // C
      { f: [587.33, 739.99, 880.00], t: 0.18 },    // D
      { f: [659.25, 830.61, 987.77], t: 0.36 },    // E
      { f: [783.99, 987.77, 1174.66, 1567.98], t: 0.54 } // G with high octave
    ];

    chords.forEach(chord => {
      chord.f.forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + chord.t);

        gain.gain.setValueAtTime(sfxVolume * 0.25, now + chord.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + chord.t + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + chord.t);
        osc.stop(now + chord.t + 0.6);
      });
    });
  };

  // Sound: Defeat / Game Over
  const playGameOver = () => {
    if (!sfxEnabled) return;
    const ctx = getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [392.00, 369.99, 329.63, 293.66, 261.63]; // G4 to C4 descending
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.18);

      gain.gain.setValueAtTime(sfxVolume * 0.3, now + idx * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.18);
      osc.stop(now + idx * 0.18 + 0.4);
    });
  };

  // Sound: Hint Shimmer
  const playHint = () => {
    if (!sfxEnabled) return;
    const ctx = getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200 + i * 200, now + i * 0.05);

      gain.gain.setValueAtTime(sfxVolume * 0.15, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.3);
    }
  };

  // Ambient Fantasy Background Drone/Music
  const startAmbientMusic = () => {
    if (!musicEnabled || musicInterval) return;
    const ctx = getContext();
    if (!ctx) return;

    musicGainNode = ctx.createGain();
    musicGainNode.gain.setValueAtTime(musicVolume * 0.12, ctx.currentTime);
    musicGainNode.connect(ctx.destination);

    const chords = [
      [220.00, 261.63, 329.63], // Am (A3, C4, E4)
      [174.61, 220.00, 261.63], // F (F3, A3, C4)
      [196.00, 246.94, 293.66], // G (G3, B3, D4)
      [164.81, 196.00, 246.94]  // Em (E3, G3, B3)
    ];

    let chordIdx = 0;
    const playChordCycle = () => {
      if (!musicEnabled || !ctx) return;
      const now = ctx.currentTime;
      const currentChord = chords[chordIdx % chords.length];
      chordIdx++;

      currentChord.forEach(freq => {
        const osc = ctx.createOscillator();
        const chordGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        chordGain.gain.setValueAtTime(0.001, now);
        chordGain.gain.linearRampToValueAtTime(0.06, now + 1.2);
        chordGain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

        osc.connect(chordGain);
        chordGain.connect(musicGainNode);

        osc.start(now);
        osc.stop(now + 4.0);
      });
    };

    playChordCycle();
    musicInterval = setInterval(playChordCycle, 4000);
  };

  const stopAmbientMusic = () => {
    if (musicInterval) {
      clearInterval(musicInterval);
      musicInterval = null;
    }
  };

  const setSfxEnabled = (enabled) => {
    sfxEnabled = enabled;
    StorageManager.set('sfx_enabled', enabled);
  };

  const setMusicEnabled = (enabled) => {
    musicEnabled = enabled;
    StorageManager.set('music_enabled', enabled);
    if (enabled) {
      startAmbientMusic();
    } else {
      stopAmbientMusic();
    }
  };

  const setSfxVolume = (vol) => {
    sfxVolume = parseFloat(vol);
    StorageManager.set('sfx_volume', sfxVolume);
  };

  const setMusicVolume = (vol) => {
    musicVolume = parseFloat(vol);
    StorageManager.set('music_volume', musicVolume);
    if (musicGainNode && audioCtx) {
      musicGainNode.gain.setValueAtTime(musicVolume * 0.12, audioCtx.currentTime);
    }
  };

  return {
    init,
    playClick,
    playCatFound,
    playWrong,
    playVictory,
    playGameOver,
    playHint,
    startAmbientMusic,
    stopAmbientMusic,
    setSfxEnabled,
    setMusicEnabled,
    setSfxVolume,
    setMusicVolume,
    getSfxEnabled: () => sfxEnabled,
    getMusicEnabled: () => musicEnabled,
    getSfxVolume: () => sfxVolume,
    getMusicVolume: () => musicVolume
  };
})();
