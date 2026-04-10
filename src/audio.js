// ============================================================
// AXIOM - 8-Bit Audio Engine (Web Audio API)
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
            this.musicGain.gain.value = 0.3;
            this.musicGain.connect(this.masterGain);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = 0.5;
            this.sfxGain.connect(this.masterGain);
        } catch (e) {
            this.enabled = false;
        }
    },

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    // Play a note with chiptune waveform
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

    // Noise for percussion
    playNoise(duration, volume) {
        if (!this.enabled || !this.ctx) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
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
        this.playNote(250, 0.1, 'square', this.sfxGain, 0.2);
        setTimeout(() => this.playNote(400, 0.1, 'square', this.sfxGain, 0.15), 50);
    },

    sfxLand() {
        this.playNoise(0.05, 0.1);
    },

    sfxCoin() {
        this.playNote(988, 0.08, 'square', this.sfxGain, 0.2);
        setTimeout(() => this.playNote(1319, 0.15, 'square', this.sfxGain, 0.2), 80);
    },

    sfxPowerup() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((n, i) => {
            setTimeout(() => this.playNote(n, 0.15, 'square', this.sfxGain, 0.2), i * 80);
        });
    },

    sfxHurt() {
        this.playNote(200, 0.15, 'sawtooth', this.sfxGain, 0.3);
        setTimeout(() => this.playNote(120, 0.2, 'sawtooth', this.sfxGain, 0.3), 100);
    },

    sfxDie() {
        const notes = [400, 350, 300, 250, 200, 150];
        notes.forEach((n, i) => {
            setTimeout(() => this.playNote(n, 0.15, 'sawtooth', this.sfxGain, 0.25), i * 100);
        });
    },

    sfxEnemyDie() {
        this.playNote(600, 0.05, 'square', this.sfxGain, 0.2);
        setTimeout(() => this.playNote(300, 0.15, 'square', this.sfxGain, 0.15), 50);
        this.playNoise(0.1, 0.1);
    },

    sfxSelect() {
        this.playNote(660, 0.08, 'square', this.sfxGain, 0.15);
    },

    sfxConfirm() {
        this.playNote(523, 0.08, 'square', this.sfxGain, 0.2);
        setTimeout(() => this.playNote(784, 0.12, 'square', this.sfxGain, 0.2), 80);
    },

    sfxDoor() {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => this.playNote(200 + i * 80, 0.1, 'triangle', this.sfxGain, 0.15), i * 60);
        }
    },

    sfxSolve() {
        const melody = [523, 587, 659, 784, 1047];
        melody.forEach((n, i) => {
            setTimeout(() => this.playNote(n, 0.2, 'square', this.sfxGain, 0.2), i * 120);
        });
    },

    sfxLevelClear() {
        const melody = [523, 659, 784, 1047, 784, 1047, 1319];
        melody.forEach((n, i) => {
            setTimeout(() => this.playNote(n, 0.2, 'square', this.sfxGain, 0.25), i * 150);
        });
    },

    sfx1up() {
        const notes = [660, 880, 660, 880, 1100, 880, 1100];
        notes.forEach((n, i) => {
            setTimeout(() => this.playNote(n, 0.1, 'square', this.sfxGain, 0.2), i * 70);
        });
    },

    // ---- Music System ----
    stopMusic() {
        this.musicPlaying = false;
        this.currentTrack = null;
        if (this.musicSequencer) {
            clearInterval(this.musicSequencer);
            this.musicSequencer = null;
        }
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
        const bpm = track.bpm || 140;
        const stepTime = (60 / bpm / 4) * 1000; // 16th notes

        this.musicSequencer = setInterval(() => {
            if (!this.musicPlaying) return;

            // Play each channel
            track.channels.forEach(ch => {
                const noteIdx = step % ch.pattern.length;
                const note = ch.pattern[noteIdx];
                if (note > 0) {
                    const freq = noteToFreq(note);
                    this.playNote(freq, ch.noteLen || 0.1, ch.wave || 'square', this.musicGain, ch.vol || 0.15);
                }
            });

            step++;
            if (step >= (track.length || 64)) step = track.loopPoint || 0;
        }, stepTime);
    }
};

// Note number to frequency (MIDI-ish)
function noteToFreq(n) {
    return 440 * Math.pow(2, (n - 69) / 12);
}

// Shorthand note names to MIDI numbers
const N = {
    C3:48,D3:50,E3:52,F3:53,G3:55,A3:57,B3:59,
    C4:60,D4:62,E4:64,F4:65,G4:67,A4:69,B4:71,
    C5:72,D5:74,E5:76,F5:77,G5:79,A5:81,B5:83,
    C6:84,
    _:0 // rest
};

// ---- Music Tracks ----
const MusicTracks = {
    title: {
        bpm: 130,
        length: 64,
        loopPoint: 0,
        channels: [
            { // Melody
                wave: 'square', vol: 0.12, noteLen: 0.12,
                pattern: [
                    N.E4,N._,N.G4,N._,N.A4,N._,N.B4,N._,
                    N.C5,N._,N.B4,N._,N.A4,N._,N.G4,N._,
                    N.E4,N._,N.G4,N._,N.A4,N._,N.E5,N._,
                    N.D5,N._,N.C5,N._,N.B4,N._,N.A4,N._,
                    N.C5,N._,N.E5,N._,N.D5,N._,N.C5,N._,
                    N.B4,N._,N.A4,N._,N.G4,N._,N.E4,N._,
                    N.A4,N._,N.B4,N._,N.C5,N._,N.D5,N._,
                    N.E5,N._,N._,N._,N.E5,N._,N._,N._,
                ]
            },
            { // Bass
                wave: 'triangle', vol: 0.18, noteLen: 0.15,
                pattern: [
                    N.A3,N._,N._,N.A3,N._,N._,N.A3,N._,
                    N.E3,N._,N._,N.E3,N._,N._,N.E3,N._,
                    N.A3,N._,N._,N.A3,N._,N._,N.A3,N._,
                    N.G3,N._,N._,N.G3,N._,N._,N.G3,N._,
                    N.F3,N._,N._,N.F3,N._,N._,N.F3,N._,
                    N.E3,N._,N._,N.E3,N._,N._,N.E3,N._,
                    N.F3,N._,N._,N.F3,N._,N.G3,N._,N._,
                    N.A3,N._,N._,N._,N.A3,N._,N._,N._,
                ]
            },
            { // Arpeggio
                wave: 'square', vol: 0.06, noteLen: 0.05,
                pattern: [
                    N.A4,N.C5,N.E5,N.A4,N.C5,N.E5,N.A4,N.C5,
                    N.E4,N.G4,N.B4,N.E4,N.G4,N.B4,N.E4,N.G4,
                    N.A4,N.C5,N.E5,N.A4,N.C5,N.E5,N.A4,N.C5,
                    N.G4,N.B4,N.D5,N.G4,N.B4,N.D5,N.G4,N.B4,
                    N.F4,N.A4,N.C5,N.F4,N.A4,N.C5,N.F4,N.A4,
                    N.E4,N.G4,N.B4,N.E4,N.G4,N.B4,N.E4,N.G4,
                    N.F4,N.A4,N.C5,N.F4,N.A4,N.G4,N.B4,N.D5,
                    N.A4,N.C5,N.E5,N._,N.A4,N.C5,N.E5,N._,
                ]
            }
        ]
    },

    world1: {
        bpm: 150,
        length: 64,
        loopPoint: 0,
        channels: [
            { // Melody - bright, adventurous
                wave: 'square', vol: 0.11, noteLen: 0.1,
                pattern: [
                    N.C5,N._,N.E5,N._,N.G5,N._,N.E5,N._,
                    N.F5,N._,N.D5,N._,N.E5,N._,N.C5,N._,
                    N.D5,N._,N.F5,N._,N.A5,N._,N.G5,N._,
                    N.E5,N._,N.D5,N._,N.C5,N._,N._,N._,
                    N.C5,N._,N.E5,N._,N.G5,N._,N.C6,N._,
                    N.B5,N._,N.A5,N._,N.G5,N._,N.F5,N._,
                    N.E5,N._,N.G5,N._,N.F5,N._,N.D5,N._,
                    N.C5,N._,N._,N._,N.C5,N._,N._,N._,
                ]
            },
            { // Bass
                wave: 'triangle', vol: 0.18, noteLen: 0.14,
                pattern: [
                    N.C3,N._,N._,N.C3,N._,N._,N.C3,N._,
                    N.F3,N._,N._,N.F3,N._,N._,N.F3,N._,
                    N.G3,N._,N._,N.G3,N._,N._,N.G3,N._,
                    N.C3,N._,N._,N.C3,N._,N._,N.C3,N._,
                    N.C3,N._,N._,N.C3,N._,N._,N.E3,N._,
                    N.F3,N._,N._,N.F3,N._,N._,N.D3,N._,
                    N.E3,N._,N._,N.G3,N._,N._,N.G3,N._,
                    N.C3,N._,N._,N._,N.C3,N._,N._,N._,
                ]
            }
        ]
    },

    world2: {
        bpm: 120,
        length: 64,
        loopPoint: 0,
        channels: [
            { // Melody - mysterious, spacey
                wave: 'triangle', vol: 0.14, noteLen: 0.18,
                pattern: [
                    N.E4,N._,N._,N.G4,N._,N._,N.B4,N._,
                    N._,N.A4,N._,N._,N.G4,N._,N._,N._,
                    N.D4,N._,N._,N.F4,N._,N._,N.A4,N._,
                    N._,N.G4,N._,N._,N.E4,N._,N._,N._,
                    N.E4,N._,N._,N.G4,N._,N._,N.C5,N._,
                    N._,N.B4,N._,N._,N.A4,N._,N._,N._,
                    N.G4,N._,N._,N.B4,N._,N._,N.A4,N._,
                    N._,N._,N.E4,N._,N._,N._,N._,N._,
                ]
            },
            { // Bass
                wave: 'triangle', vol: 0.16, noteLen: 0.2,
                pattern: [
                    N.E3,N._,N._,N._,N._,N._,N.E3,N._,
                    N._,N._,N._,N._,N.E3,N._,N._,N._,
                    N.D3,N._,N._,N._,N._,N._,N.D3,N._,
                    N._,N._,N._,N._,N.D3,N._,N._,N._,
                    N.E3,N._,N._,N._,N._,N._,N.C3,N._,
                    N._,N._,N._,N._,N.C3,N._,N._,N._,
                    N.G3,N._,N._,N._,N._,N._,N.A3,N._,
                    N._,N._,N.E3,N._,N._,N._,N._,N._,
                ]
            }
        ]
    },

    world3: {
        bpm: 160,
        length: 64,
        loopPoint: 0,
        channels: [
            { // Melody - electric, energetic
                wave: 'sawtooth', vol: 0.08, noteLen: 0.08,
                pattern: [
                    N.A4,N.A4,N._,N.C5,N._,N.E5,N._,N.A4,
                    N._,N.B4,N._,N.D5,N._,N.E5,N._,N._,
                    N.A4,N.A4,N._,N.C5,N._,N.E5,N._,N.G5,
                    N._,N.E5,N._,N.D5,N._,N.C5,N._,N._,
                    N.F4,N.F4,N._,N.A4,N._,N.C5,N._,N.F4,
                    N._,N.G4,N._,N.B4,N._,N.D5,N._,N._,
                    N.E4,N._,N.G4,N._,N.B4,N._,N.E5,N._,
                    N.D5,N._,N.C5,N._,N.B4,N._,N.A4,N._,
                ]
            },
            { // Bass - driving
                wave: 'square', vol: 0.12, noteLen: 0.06,
                pattern: [
                    N.A3,N._,N.A3,N._,N.A3,N._,N.A3,N._,
                    N.G3,N._,N.G3,N._,N.G3,N._,N.G3,N._,
                    N.A3,N._,N.A3,N._,N.A3,N._,N.A3,N._,
                    N.E3,N._,N.E3,N._,N.E3,N._,N.E3,N._,
                    N.F3,N._,N.F3,N._,N.F3,N._,N.F3,N._,
                    N.G3,N._,N.G3,N._,N.G3,N._,N.G3,N._,
                    N.E3,N._,N.E3,N._,N.E3,N._,N.E3,N._,
                    N.A3,N._,N._,N._,N.A3,N._,N._,N._,
                ]
            }
        ]
    },

    world4: {
        bpm: 110,
        length: 64,
        loopPoint: 0,
        channels: [
            { // Melody - cold, crystalline
                wave: 'sine', vol: 0.18, noteLen: 0.22,
                pattern: [
                    N.E5,N._,N._,N._,N.D5,N._,N._,N._,
                    N.C5,N._,N._,N._,N.B4,N._,N._,N._,
                    N.A4,N._,N._,N._,N.G4,N._,N._,N._,
                    N.A4,N._,N._,N._,N.B4,N._,N._,N._,
                    N.C5,N._,N._,N._,N.E5,N._,N._,N._,
                    N.D5,N._,N._,N._,N.C5,N._,N._,N._,
                    N.B4,N._,N._,N._,N.A4,N._,N._,N._,
                    N.E4,N._,N._,N._,N._,N._,N._,N._,
                ]
            },
            { // Pad
                wave: 'triangle', vol: 0.1, noteLen: 0.3,
                pattern: [
                    N.A3,N._,N._,N._,N._,N._,N._,N._,
                    N._,N._,N._,N._,N._,N._,N._,N._,
                    N.F3,N._,N._,N._,N._,N._,N._,N._,
                    N._,N._,N._,N._,N._,N._,N._,N._,
                    N.C3,N._,N._,N._,N._,N._,N._,N._,
                    N._,N._,N._,N._,N._,N._,N._,N._,
                    N.E3,N._,N._,N._,N._,N._,N._,N._,
                    N._,N._,N._,N._,N._,N._,N._,N._,
                ]
            }
        ]
    },

    world5: {
        bpm: 170,
        length: 64,
        loopPoint: 0,
        channels: [
            { // Melody - intense, chaotic
                wave: 'sawtooth', vol: 0.09, noteLen: 0.08,
                pattern: [
                    N.A4,N._,N.C5,N._,N.E5,N._,N.A5,N._,
                    N.G5,N._,N.E5,N._,N.C5,N._,N.A4,N._,
                    N.B4,N._,N.D5,N._,N.F5,N._,N.B5,N._,
                    N.A5,N._,N.F5,N._,N.D5,N._,N.B4,N._,
                    N.C5,N._,N.E5,N._,N.G5,N._,N.C6,N._,
                    N.B5,N._,N.G5,N._,N.E5,N._,N.C5,N._,
                    N.A4,N._,N.E5,N._,N.A4,N._,N.C5,N._,
                    N.E5,N._,N.A5,N._,N.E5,N._,N._,N._,
                ]
            },
            { // Bass - ominous
                wave: 'square', vol: 0.14, noteLen: 0.08,
                pattern: [
                    N.A3,N.A3,N._,N._,N.A3,N._,N._,N.A3,
                    N._,N._,N.A3,N._,N._,N.A3,N.A3,N._,
                    N.B3,N.B3,N._,N._,N.B3,N._,N._,N.B3,
                    N._,N._,N.B3,N._,N._,N.B3,N.B3,N._,
                    N.C3,N.C3,N._,N._,N.C3,N._,N._,N.C3,
                    N._,N._,N.C3,N._,N._,N.C3,N.C3,N._,
                    N.A3,N._,N.E3,N._,N.A3,N._,N.E3,N._,
                    N.A3,N._,N._,N._,N.A3,N._,N._,N._,
                ]
            }
        ]
    },

    boss: {
        bpm: 180,
        length: 32,
        loopPoint: 0,
        channels: [
            {
                wave: 'sawtooth', vol: 0.1, noteLen: 0.06,
                pattern: [
                    N.E4,N.E4,N._,N.E4,N._,N.G4,N._,N.E4,
                    N._,N.B4,N._,N._,N.A4,N._,N.G4,N._,
                    N.F4,N.F4,N._,N.F4,N._,N.A4,N._,N.F4,
                    N._,N.C5,N._,N._,N.B4,N._,N.A4,N._,
                ]
            },
            {
                wave: 'square', vol: 0.14, noteLen: 0.06,
                pattern: [
                    N.E3,N._,N.E3,N._,N.E3,N._,N.E3,N._,
                    N.E3,N._,N.E3,N._,N.G3,N._,N.A3,N._,
                    N.F3,N._,N.F3,N._,N.F3,N._,N.F3,N._,
                    N.F3,N._,N.F3,N._,N.A3,N._,N.B3,N._,
                ]
            }
        ]
    },

    victory: {
        bpm: 140,
        length: 32,
        loopPoint: 16,
        channels: [
            {
                wave: 'square', vol: 0.12, noteLen: 0.15,
                pattern: [
                    N.C5,N._,N.E5,N._,N.G5,N._,N.C6,N._,
                    N.G5,N._,N.C6,N._,N.E5,N._,N.G5,N._,
                    N.C5,N._,N.E5,N._,N.G5,N._,N.C6,N._,
                    N._,N._,N._,N._,N._,N._,N._,N._,
                ]
            },
            {
                wave: 'triangle', vol: 0.15, noteLen: 0.2,
                pattern: [
                    N.C3,N._,N._,N._,N.G3,N._,N._,N._,
                    N.E3,N._,N._,N._,N.C3,N._,N._,N._,
                    N.C3,N._,N._,N._,N.G3,N._,N._,N._,
                    N._,N._,N._,N._,N._,N._,N._,N._,
                ]
            }
        ]
    },

    gameover: {
        bpm: 80,
        length: 16,
        loopPoint: 16, // doesn't loop
        channels: [
            {
                wave: 'triangle', vol: 0.15, noteLen: 0.25,
                pattern: [
                    N.E4,N._,N._,N.D4,N._,N._,N.C4,N._,
                    N._,N._,N.B3,N._,N._,N._,N._,N._,
                ]
            }
        ]
    },

    worldmap: {
        bpm: 120,
        length: 64,
        loopPoint: 0,
        channels: [
            {
                wave: 'triangle', vol: 0.1, noteLen: 0.15,
                pattern: [
                    N.C4,N._,N.E4,N._,N.G4,N._,N.E4,N._,
                    N.F4,N._,N.A4,N._,N.G4,N._,N.E4,N._,
                    N.D4,N._,N.F4,N._,N.A4,N._,N.F4,N._,
                    N.G4,N._,N.B4,N._,N.A4,N._,N.G4,N._,
                    N.C4,N._,N.E4,N._,N.G4,N._,N.C5,N._,
                    N.B4,N._,N.G4,N._,N.E4,N._,N.C4,N._,
                    N.D4,N._,N.G4,N._,N.F4,N._,N.E4,N._,
                    N.C4,N._,N._,N._,N.C4,N._,N._,N._,
                ]
            },
            {
                wave: 'triangle', vol: 0.12, noteLen: 0.18,
                pattern: [
                    N.C3,N._,N._,N._,N.C3,N._,N._,N._,
                    N.F3,N._,N._,N._,N.C3,N._,N._,N._,
                    N.D3,N._,N._,N._,N.D3,N._,N._,N._,
                    N.G3,N._,N._,N._,N.G3,N._,N._,N._,
                    N.C3,N._,N._,N._,N.E3,N._,N._,N._,
                    N.G3,N._,N._,N._,N.C3,N._,N._,N._,
                    N.D3,N._,N._,N._,N.G3,N._,N._,N._,
                    N.C3,N._,N._,N._,N.C3,N._,N._,N._,
                ]
            }
        ]
    }
};
