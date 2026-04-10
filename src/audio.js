// ============================================================
// AXIOM - 8-Bit Audio Engine (Lo-fi Chill Edition)
// ============================================================

const Audio8 = {
    ctx: null,
    masterGain: null,
    musicGain: null,
    sfxGain: null,
    enabled: true,
    musicPlaying: false,
    currentTrack: null,
    musicTimer: null,
    musicSequencer: null,

    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.4;
            this.masterGain.connect(this.ctx.destination);
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.25;
            this.musicGain.connect(this.masterGain);
            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = 0.5;
            this.sfxGain.connect(this.masterGain);
        } catch (e) { this.enabled = false; }
    },

    resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },

    playNote(freq, duration, type, gainNode, volume, detune) {
        if (!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type || 'square';
        osc.frequency.value = freq;
        if (detune) osc.detune.value = detune;
        gain.gain.value = volume || 0.3;
        gain.gain.setValueAtTime(volume || 0.3, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(gainNode || this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    playNoise(duration, volume) {
        if (!this.enabled || !this.ctx) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.value = volume || 0.15;
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);
        source.connect(gain);
        gain.connect(this.sfxGain);
        source.start();
    },

    // ---- Sound Effects ----
    sfxJump() {
        this.playNote(250, 0.1, 'square', this.sfxGain, 0.15);
        setTimeout(() => this.playNote(400, 0.1, 'square', this.sfxGain, 0.1), 50);
    },
    sfxLand() { this.playNoise(0.04, 0.08); },
    sfxCoin() {
        this.playNote(988, 0.08, 'square', this.sfxGain, 0.15);
        setTimeout(() => this.playNote(1319, 0.12, 'square', this.sfxGain, 0.15), 80);
    },
    sfxPowerup() {
        [523, 659, 784, 1047].forEach((n, i) => setTimeout(() => this.playNote(n, 0.15, 'triangle', this.sfxGain, 0.15), i * 100));
    },
    sfxHurt() {
        this.playNote(200, 0.12, 'sawtooth', this.sfxGain, 0.2);
        setTimeout(() => this.playNote(120, 0.15, 'sawtooth', this.sfxGain, 0.2), 80);
    },
    sfxDie() {
        [400, 350, 300, 250, 200, 150].forEach((n, i) => setTimeout(() => this.playNote(n, 0.12, 'sawtooth', this.sfxGain, 0.18), i * 100));
    },
    sfxEnemyDie() {
        this.playNote(600, 0.04, 'square', this.sfxGain, 0.15);
        setTimeout(() => this.playNote(300, 0.1, 'square', this.sfxGain, 0.1), 40);
    },
    sfxSelect() { this.playNote(660, 0.06, 'triangle', this.sfxGain, 0.12); },
    sfxConfirm() {
        this.playNote(523, 0.06, 'triangle', this.sfxGain, 0.15);
        setTimeout(() => this.playNote(784, 0.1, 'triangle', this.sfxGain, 0.15), 60);
    },
    sfxDoor() { for (let i = 0; i < 5; i++) setTimeout(() => this.playNote(200 + i * 80, 0.1, 'triangle', this.sfxGain, 0.12), i * 60); },
    sfxSolve() { [523, 587, 659, 784, 1047].forEach((n, i) => setTimeout(() => this.playNote(n, 0.18, 'triangle', this.sfxGain, 0.15), i * 120)); },
    sfxLevelClear() { [523, 659, 784, 1047, 784, 1047, 1319].forEach((n, i) => setTimeout(() => this.playNote(n, 0.2, 'triangle', this.sfxGain, 0.18), i * 160)); },
    sfx1up() { [660, 880, 660, 880, 1100].forEach((n, i) => setTimeout(() => this.playNote(n, 0.1, 'triangle', this.sfxGain, 0.15), i * 80)); },

    // ---- Music ----
    stopMusic() {
        this.musicPlaying = false; this.currentTrack = null;
        if (this.musicSequencer) { clearInterval(this.musicSequencer); this.musicSequencer = null; }
    },

    playMusic(trackName) {
        if (!this.enabled) return;
        if (this.currentTrack === trackName) return;
        this.stopMusic();
        this.currentTrack = trackName;
        this.musicPlaying = true;
        const track = MusicTracks[trackName];
        if (!track) return;
        let step = 0;
        const bpm = track.bpm || 80;
        const stepTime = (60 / bpm / 4) * 1000;
        this.musicSequencer = setInterval(() => {
            if (!this.musicPlaying) return;
            track.channels.forEach(ch => {
                const noteIdx = step % ch.pattern.length;
                const note = ch.pattern[noteIdx];
                if (note > 0) this.playNote(noteToFreq(note), ch.noteLen || 0.2, ch.wave || 'triangle', this.musicGain, ch.vol || 0.1);
            });
            step++;
            if (step >= (track.length || 64)) step = track.loopPoint || 0;
        }, stepTime);
    }
};

function noteToFreq(n) { return 440 * Math.pow(2, (n - 69) / 12); }

const N = {
    C3:48,D3:50,E3:52,F3:53,G3:55,A3:57,B3:59,
    C4:60,D4:62,E4:64,F4:65,G4:67,A4:69,B4:71,
    C5:72,D5:74,E5:76,F5:77,G5:79,A5:81,B5:83,C6:84,
    _:0
};

// ============================================================
// LO-FI CHILL MUSIC TRACKS (75-85 BPM, relaxed, atmospheric)
// ============================================================
const MusicTracks = {
    // Title - dreamy, inviting
    title: {
        bpm: 78, length: 64, loopPoint: 0,
        channels: [
            { wave: 'triangle', vol: 0.10, noteLen: 0.28,
              pattern: [
                N.E4,N._,N._,N._,N.G4,N._,N._,N._,
                N.A4,N._,N._,N._,N.G4,N._,N._,N._,
                N.E4,N._,N._,N.D4,N._,N._,N.C4,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N.C4,N._,N._,N._,N.E4,N._,N._,N._,
                N.G4,N._,N._,N._,N.A4,N._,N._,N._,
                N.G4,N._,N._,N.E4,N._,N._,N.D4,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
              ]},
            { wave: 'triangle', vol: 0.12, noteLen: 0.35,
              pattern: [
                N.A3,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N.C3,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N.F3,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N.G3,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
              ]},
            { wave: 'sine', vol: 0.06, noteLen: 0.4,
              pattern: [
                N.E5,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N.C5,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N.A4,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N.G4,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
              ]}
        ]
    },

    // World 1 - Prism Peaks: gentle, curious, exploring
    world1: {
        bpm: 82, length: 64, loopPoint: 0,
        channels: [
            { wave: 'triangle', vol: 0.09, noteLen: 0.25,
              pattern: [
                N.C4,N._,N._,N._,N.E4,N._,N._,N._,
                N.G4,N._,N._,N.E4,N._,N._,N._,N._,
                N.A4,N._,N._,N._,N.G4,N._,N._,N._,
                N.E4,N._,N._,N._,N._,N._,N._,N._,
                N.D4,N._,N._,N._,N.F4,N._,N._,N._,
                N.A4,N._,N._,N.G4,N._,N._,N._,N._,
                N.E4,N._,N._,N._,N.D4,N._,N._,N._,
                N.C4,N._,N._,N._,N._,N._,N._,N._,
              ]},
            { wave: 'triangle', vol: 0.11, noteLen: 0.35,
              pattern: [
                N.C3,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N.G3,N._,N._,N._,
                N.F3,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N.C3,N._,N._,N._,
                N.D3,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N.A3,N._,N._,N._,
                N.G3,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N.C3,N._,N._,N._,
              ]},
            { wave: 'sine', vol: 0.05, noteLen: 0.3,
              pattern: [
                N._,N._,N._,N._,N._,N._,N._,N._,
                N.E5,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N.C5,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N.A4,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
              ]}
        ]
    },

    // World 2 - Gravity Gorge: spacey, ambient, floating
    world2: {
        bpm: 72, length: 64, loopPoint: 0,
        channels: [
            { wave: 'sine', vol: 0.10, noteLen: 0.4,
              pattern: [
                N.E4,N._,N._,N._,N._,N._,N._,N._,
                N.G4,N._,N._,N._,N._,N._,N._,N._,
                N.B4,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N.A4,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N.G4,N._,N._,N._,N._,N._,N._,N._,
                N.E4,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
              ]},
            { wave: 'triangle', vol: 0.08, noteLen: 0.5,
              pattern: [
                N.E3,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N.D3,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
              ]}
        ]
    },

    // World 3 - Volt Valley: minimal, electronic, pulsing
    world3: {
        bpm: 80, length: 64, loopPoint: 0,
        channels: [
            { wave: 'square', vol: 0.06, noteLen: 0.2,
              pattern: [
                N.A4,N._,N._,N._,N._,N._,N.C5,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N.E4,N._,N._,N._,N._,N._,N.A4,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N.G4,N._,N._,N._,N._,N._,N.B4,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N.A4,N._,N._,N._,N._,N._,N.E4,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
              ]},
            { wave: 'triangle', vol: 0.10, noteLen: 0.3,
              pattern: [
                N.A3,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N.A3,N._,N._,N._,
                N.E3,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N.E3,N._,N._,N._,
                N.G3,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N.G3,N._,N._,N._,
                N.A3,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
              ]}
        ]
    },

    // World 4 - Cryo Caverns: cold, crystalline, ethereal
    world4: {
        bpm: 70, length: 64, loopPoint: 0,
        channels: [
            { wave: 'sine', vol: 0.12, noteLen: 0.45,
              pattern: [
                N.E5,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N.D5,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N.C5,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N.B4,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N.A4,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
              ]},
            { wave: 'triangle', vol: 0.08, noteLen: 0.5,
              pattern: [
                N.A3,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N.F3,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N.E3,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
              ]}
        ]
    },

    // World 5 - Entropy's Fortress: dark, ominous, but still chill
    world5: {
        bpm: 78, length: 64, loopPoint: 0,
        channels: [
            { wave: 'sawtooth', vol: 0.05, noteLen: 0.25,
              pattern: [
                N.A4,N._,N._,N._,N._,N._,N._,N._,
                N.C5,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N.E4,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N.B4,N._,N._,N._,N._,N._,N._,N._,
                N.A4,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N.G4,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
              ]},
            { wave: 'triangle', vol: 0.10, noteLen: 0.4,
              pattern: [
                N.A3,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N.E3,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N.B3,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N.A3,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
              ]}
        ]
    },

    // Boss - tense but measured, not frantic
    boss: {
        bpm: 85, length: 32, loopPoint: 0,
        channels: [
            { wave: 'sawtooth', vol: 0.07, noteLen: 0.18,
              pattern: [
                N.E4,N._,N._,N.E4,N._,N._,N._,N._,
                N.G4,N._,N._,N._,N.E4,N._,N._,N._,
                N.A4,N._,N._,N.A4,N._,N._,N._,N._,
                N.G4,N._,N._,N._,N._,N._,N._,N._,
              ]},
            { wave: 'triangle', vol: 0.12, noteLen: 0.25,
              pattern: [
                N.E3,N._,N._,N._,N.E3,N._,N._,N._,
                N._,N._,N.G3,N._,N._,N._,N.A3,N._,
                N.A3,N._,N._,N._,N.A3,N._,N._,N._,
                N._,N._,N.G3,N._,N._,N._,N.E3,N._,
              ]}
        ]
    },

    // Victory - gentle triumph
    victory: {
        bpm: 80, length: 32, loopPoint: 16,
        channels: [
            { wave: 'triangle', vol: 0.10, noteLen: 0.3,
              pattern: [
                N.C4,N._,N._,N._,N.E4,N._,N._,N._,
                N.G4,N._,N._,N._,N.C5,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
              ]},
            { wave: 'triangle', vol: 0.10, noteLen: 0.4,
              pattern: [
                N.C3,N._,N._,N._,N._,N._,N._,N._,
                N.G3,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
              ]}
        ]
    },

    // Game over - slow, melancholy
    gameover: {
        bpm: 60, length: 16, loopPoint: 16,
        channels: [
            { wave: 'triangle', vol: 0.12, noteLen: 0.4,
              pattern: [
                N.E4,N._,N._,N._,N.D4,N._,N._,N._,
                N.C4,N._,N._,N._,N._,N._,N._,N._,
              ]}
        ]
    },

    // World map - peaceful, inviting
    worldmap: {
        bpm: 75, length: 64, loopPoint: 0,
        channels: [
            { wave: 'triangle', vol: 0.08, noteLen: 0.3,
              pattern: [
                N.C4,N._,N._,N._,N.E4,N._,N._,N._,
                N.G4,N._,N._,N._,N._,N._,N._,N._,
                N.E4,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N.F4,N._,N._,N._,N.A4,N._,N._,N._,
                N.G4,N._,N._,N._,N._,N._,N._,N._,
                N.E4,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
              ]},
            { wave: 'triangle', vol: 0.10, noteLen: 0.4,
              pattern: [
                N.C3,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N.G3,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N.F3,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
                N.C3,N._,N._,N._,N._,N._,N._,N._,
                N._,N._,N._,N._,N._,N._,N._,N._,
              ]}
        ]
    }
};
