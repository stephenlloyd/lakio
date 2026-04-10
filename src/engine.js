// ============================================================
// AXIOM ENGINE - Core game engine
// ============================================================

// ---- Constants ----
const GAME_W = 256;
const GAME_H = 240;
const TILE = 16;
const COLS = GAME_W / TILE; // 16
const ROWS = GAME_H / TILE; // 15
const GRAVITY = 0.18;
const MAX_FALL = 3.8;
const FRICTION = 0.75;
const JUMP_FORCE = -4.6;
const PLAYER_SPEED = 1.2;
const PLAYER_RUN_SPEED = 1.7;
const COYOTE_TIME = 10;
const JUMP_BUFFER = 10;
const MAX_AIR_JUMPS = 2;
const DROP_THROUGH_HOLD = 180; // 3 seconds at 60fps
const FPS = 60;

// ---- Canvas Setup ----
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = GAME_W;
canvas.height = GAME_H;

function resizeCanvas() {
    const scaleX = window.innerWidth / GAME_W;
    const scaleY = window.innerHeight / GAME_H;
    const scale = Math.min(scaleX, scaleY);
    canvas.style.width = (GAME_W * scale) + 'px';
    canvas.style.height = (GAME_H * scale) + 'px';
    canvas.style.marginTop = ((window.innerHeight - GAME_H * scale) / 2) + 'px';
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ---- Input System ----
const Input = {
    keys: {},
    justPressed: {},
    touches: {},
    touchStart: null,
    touchCurrent: null,
    gamepad: null,
    gpButtons: {},
    gpJustPressed: {},
    swipe: null,

    // Virtual buttons for unified input
    left: false, right: false, up: false, down: false,
    jump: false, action: false, run: false, pause: false,
    jumpJust: false, actionJust: false, pauseJust: false,

    init() {
        window.addEventListener('keydown', e => {
            if (!this.keys[e.code]) this.justPressed[e.code] = true;
            this.keys[e.code] = true;
            e.preventDefault();
        });
        window.addEventListener('keyup', e => {
            this.keys[e.code] = false;
            e.preventDefault();
        });

        // Touch controls
        canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            for (const t of e.changedTouches) {
                this.touches[t.identifier] = { x: t.clientX, y: t.clientY, sx: t.clientX, sy: t.clientY };
            }
            if (!this.touchStart) {
                this.touchStart = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY, t: Date.now() };
                this.touchCurrent = { ...this.touchStart };
            }
        }, { passive: false });

        canvas.addEventListener('touchmove', e => {
            e.preventDefault();
            for (const t of e.changedTouches) {
                if (this.touches[t.identifier]) {
                    this.touches[t.identifier].x = t.clientX;
                    this.touches[t.identifier].y = t.clientY;
                }
            }
            if (this.touchStart) {
                this.touchCurrent = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
            }
        }, { passive: false });

        canvas.addEventListener('touchend', e => {
            e.preventDefault();
            for (const t of e.changedTouches) {
                const touch = this.touches[t.identifier];
                if (touch) {
                    const dx = t.clientX - touch.sx;
                    const dy = t.clientY - touch.sy;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const elapsed = Date.now() - (this.touchStart ? this.touchStart.t : 0);
                    if (dist < 20 && elapsed < 300) {
                        // Tap - determine region
                        const rect = canvas.getBoundingClientRect();
                        const rx = (t.clientX - rect.left) / rect.width;
                        const ry = (t.clientY - rect.top) / rect.height;
                        if (ry < 0.3) {
                            this._touchAction = true;
                        } else {
                            this._touchJump = true;
                        }
                    }
                    delete this.touches[t.identifier];
                }
            }
            if (Object.keys(this.touches).length === 0) {
                this.touchStart = null;
                this.touchCurrent = null;
            }
        }, { passive: false });

        // Gamepad
        window.addEventListener('gamepadconnected', e => {
            this.gamepad = e.gamepad.index;
        });
        window.addEventListener('gamepaddisconnected', () => {
            this.gamepad = null;
        });
    },

    update() {
        // Reset just-pressed
        this.jumpJust = false;
        this.actionJust = false;
        this.pauseJust = false;

        // Keyboard mapping
        this.left = this.keys['ArrowLeft'] || this.keys['KeyA'];
        this.right = this.keys['ArrowRight'] || this.keys['KeyD'];
        this.up = this.keys['ArrowUp'] || this.keys['KeyW'];
        this.down = this.keys['ArrowDown'] || this.keys['KeyS'];
        this.jump = this.keys['Space'] || this.keys['KeyZ'];
        this.action = this.keys['KeyX'] || this.keys['ShiftLeft'] || this.keys['Enter'];
        this.run = this.keys['ShiftRight'] || this.keys['KeyC'];
        this.pause = false;

        this.jumpJust = this.justPressed['Space'] || this.justPressed['KeyZ'];
        this.actionJust = this.justPressed['KeyX'] || this.justPressed['ShiftLeft'] || this.justPressed['Enter'];
        this.pauseJust = this.justPressed['Escape'] || this.justPressed['KeyP'];

        // Touch mapping - virtual dpad from drag
        if (this.touchStart && this.touchCurrent) {
            const dx = this.touchCurrent.x - this.touchStart.x;
            const dy = this.touchCurrent.y - this.touchStart.y;
            const deadzone = 15;
            if (dx < -deadzone) this.left = true;
            if (dx > deadzone) this.right = true;
            if (dy < -deadzone * 1.5) { this.jump = true; this.jumpJust = true; }
            if (dy > deadzone) this.down = true;
        }
        if (this._touchJump) { this.jump = true; this.jumpJust = true; this._touchJump = false; }
        if (this._touchAction) { this.action = true; this.actionJust = true; this._touchAction = false; }

        // Gamepad mapping
        if (this.gamepad !== null) {
            const gp = navigator.getGamepads()[this.gamepad];
            if (gp) {
                const deadzone = 0.3;
                if (gp.axes[0] < -deadzone) this.left = true;
                if (gp.axes[0] > deadzone) this.right = true;
                if (gp.axes[1] < -deadzone) this.up = true;
                if (gp.axes[1] > deadzone) this.down = true;

                // A=jump, B/X=action, Start=pause
                const btnJump = gp.buttons[0] && gp.buttons[0].pressed;
                const btnAction = gp.buttons[1] && gp.buttons[1].pressed || gp.buttons[2] && gp.buttons[2].pressed;
                const btnPause = gp.buttons[9] && gp.buttons[9].pressed;
                const btnRun = gp.buttons[5] && gp.buttons[5].pressed;

                if (btnJump) { this.jump = true; if (!this.gpButtons.jump) this.jumpJust = true; }
                if (btnAction) { this.action = true; if (!this.gpButtons.action) this.actionJust = true; }
                if (btnPause && !this.gpButtons.pause) this.pauseJust = true;
                if (btnRun) this.run = true;

                this.gpButtons = { jump: btnJump, action: btnAction, pause: btnPause, run: btnRun };

                // D-pad
                if (gp.buttons[14] && gp.buttons[14].pressed) this.left = true;
                if (gp.buttons[15] && gp.buttons[15].pressed) this.right = true;
                if (gp.buttons[12] && gp.buttons[12].pressed) this.up = true;
                if (gp.buttons[13] && gp.buttons[13].pressed) this.down = true;
            }
        }

        this.justPressed = {};
    }
};

// ---- Camera ----
const Camera = {
    x: 0, y: 0,
    targetX: 0, targetY: 0,
    levelW: 0, levelH: 0,
    smoothing: 0.06,

    follow(entity, levelW, levelH) {
        this.levelW = levelW;
        this.levelH = levelH;
        this.targetX = entity.x + entity.w / 2 - GAME_W / 2;
        this.targetY = entity.y + entity.h / 2 - GAME_H / 2;
        this.x += (this.targetX - this.x) * this.smoothing;
        this.y += (this.targetY - this.y) * this.smoothing;
        this.x = Math.max(0, Math.min(this.x, levelW - GAME_W));
        this.y = Math.max(0, Math.min(this.y, levelH - GAME_H));
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
    },

    reset(x, y) {
        this.x = x; this.y = y;
        this.targetX = x; this.targetY = y;
    }
};

// ---- Particle System ----
class Particle {
    constructor(x, y, vx, vy, color, life, size) {
        this.x = x; this.y = y; this.vx = vx; this.vy = vy;
        this.color = color; this.life = life; this.maxLife = life;
        this.size = size || 2;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1;
        this.life--;
    }
    draw(ctx, cx, cy) {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(Math.round(this.x - cx), Math.round(this.y - cy), this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

const Particles = {
    list: [],
    emit(x, y, count, colors, spread, life, size) {
        for (let i = 0; i < count; i++) {
            const vx = (Math.random() - 0.5) * spread;
            const vy = (Math.random() - 0.8) * spread;
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.list.push(new Particle(x, y, vx, vy, color, life || 30, size || 2));
        }
    },
    update() {
        for (let i = this.list.length - 1; i >= 0; i--) {
            this.list[i].update();
            if (this.list[i].life <= 0) this.list.splice(i, 1);
        }
    },
    draw(ctx, cx, cy) {
        this.list.forEach(p => p.draw(ctx, cx, cy));
    },
    clear() { this.list = []; }
};

// ---- Screen Transition ----
const Transition = {
    active: false,
    phase: 0, // 0=fade out, 1=callback, 2=fade in
    timer: 0,
    duration: 35,
    callback: null,
    color: '#000',

    start(callback, color) {
        this.active = true;
        this.phase = 0;
        this.timer = 0;
        this.callback = callback;
        this.color = color || '#000';
    },

    update() {
        if (!this.active) return;
        this.timer++;
        if (this.phase === 0 && this.timer >= this.duration) {
            this.phase = 1;
            if (this.callback) this.callback();
            this.timer = 0;
        } else if (this.phase === 1) {
            this.phase = 2;
            this.timer = 0;
        } else if (this.phase === 2 && this.timer >= this.duration) {
            this.active = false;
        }
    },

    draw(ctx) {
        if (!this.active) return;
        let alpha = 0;
        if (this.phase === 0) alpha = this.timer / this.duration;
        else if (this.phase === 1) alpha = 1;
        else if (this.phase === 2) alpha = 1 - this.timer / this.duration;
        ctx.globalAlpha = Math.min(1, Math.max(0, alpha));
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, GAME_W, GAME_H);
        ctx.globalAlpha = 1;
    }
};

// ---- Pixel Text Renderer ----
const FONT_CHARS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!?.,;:\'"-+=/\\@#$%^&*()[]{}|<>~`_';
let fontCanvas = null;
let fontCtx = null;

function initFont() {
    fontCanvas = document.createElement('canvas');
    fontCtx = fontCanvas.getContext('2d');
}

function drawText(ctx, text, x, y, color, scale, align) {
    color = color || '#fff';
    scale = scale || 1;
    const charW = 5 * scale;
    const charH = 7 * scale;
    let startX = x;
    if (align === 'center') startX = x - (text.length * (charW + scale)) / 2;
    else if (align === 'right') startX = x - text.length * (charW + scale);

    ctx.fillStyle = color;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        const cx = startX + i * (charW + scale);
        drawChar(ctx, ch, cx, y, color, scale);
    }
}

function drawChar(ctx, ch, x, y, color, scale) {
    const patterns = getCharPattern(ch);
    if (!patterns) return;
    ctx.fillStyle = color;
    for (let row = 0; row < patterns.length; row++) {
        for (let col = 0; col < 5; col++) {
            if (patterns[row] & (1 << (4 - col))) {
                ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
            }
        }
    }
}

function getCharPattern(ch) {
    const font = {
        ' ': [0,0,0,0,0,0,0],
        'A': [0b01110,0b10001,0b10001,0b11111,0b10001,0b10001,0b10001],
        'B': [0b11110,0b10001,0b10001,0b11110,0b10001,0b10001,0b11110],
        'C': [0b01110,0b10001,0b10000,0b10000,0b10000,0b10001,0b01110],
        'D': [0b11100,0b10010,0b10001,0b10001,0b10001,0b10010,0b11100],
        'E': [0b11111,0b10000,0b10000,0b11110,0b10000,0b10000,0b11111],
        'F': [0b11111,0b10000,0b10000,0b11110,0b10000,0b10000,0b10000],
        'G': [0b01110,0b10001,0b10000,0b10111,0b10001,0b10001,0b01110],
        'H': [0b10001,0b10001,0b10001,0b11111,0b10001,0b10001,0b10001],
        'I': [0b01110,0b00100,0b00100,0b00100,0b00100,0b00100,0b01110],
        'J': [0b00111,0b00010,0b00010,0b00010,0b00010,0b10010,0b01100],
        'K': [0b10001,0b10010,0b10100,0b11000,0b10100,0b10010,0b10001],
        'L': [0b10000,0b10000,0b10000,0b10000,0b10000,0b10000,0b11111],
        'M': [0b10001,0b11011,0b10101,0b10101,0b10001,0b10001,0b10001],
        'N': [0b10001,0b10001,0b11001,0b10101,0b10011,0b10001,0b10001],
        'O': [0b01110,0b10001,0b10001,0b10001,0b10001,0b10001,0b01110],
        'P': [0b11110,0b10001,0b10001,0b11110,0b10000,0b10000,0b10000],
        'Q': [0b01110,0b10001,0b10001,0b10001,0b10101,0b10010,0b01101],
        'R': [0b11110,0b10001,0b10001,0b11110,0b10100,0b10010,0b10001],
        'S': [0b01111,0b10000,0b10000,0b01110,0b00001,0b00001,0b11110],
        'T': [0b11111,0b00100,0b00100,0b00100,0b00100,0b00100,0b00100],
        'U': [0b10001,0b10001,0b10001,0b10001,0b10001,0b10001,0b01110],
        'V': [0b10001,0b10001,0b10001,0b10001,0b10001,0b01010,0b00100],
        'W': [0b10001,0b10001,0b10001,0b10101,0b10101,0b10101,0b01010],
        'X': [0b10001,0b10001,0b01010,0b00100,0b01010,0b10001,0b10001],
        'Y': [0b10001,0b10001,0b01010,0b00100,0b00100,0b00100,0b00100],
        'Z': [0b11111,0b00001,0b00010,0b00100,0b01000,0b10000,0b11111],
        '0': [0b01110,0b10011,0b10101,0b10101,0b10101,0b11001,0b01110],
        '1': [0b00100,0b01100,0b00100,0b00100,0b00100,0b00100,0b01110],
        '2': [0b01110,0b10001,0b00001,0b00110,0b01000,0b10000,0b11111],
        '3': [0b01110,0b10001,0b00001,0b00110,0b00001,0b10001,0b01110],
        '4': [0b00010,0b00110,0b01010,0b10010,0b11111,0b00010,0b00010],
        '5': [0b11111,0b10000,0b11110,0b00001,0b00001,0b10001,0b01110],
        '6': [0b00110,0b01000,0b10000,0b11110,0b10001,0b10001,0b01110],
        '7': [0b11111,0b00001,0b00010,0b00100,0b01000,0b01000,0b01000],
        '8': [0b01110,0b10001,0b10001,0b01110,0b10001,0b10001,0b01110],
        '9': [0b01110,0b10001,0b10001,0b01111,0b00001,0b00010,0b01100],
        '!': [0b00100,0b00100,0b00100,0b00100,0b00100,0b00000,0b00100],
        '?': [0b01110,0b10001,0b00001,0b00110,0b00100,0b00000,0b00100],
        '.': [0b00000,0b00000,0b00000,0b00000,0b00000,0b00000,0b00100],
        ',': [0b00000,0b00000,0b00000,0b00000,0b00000,0b00100,0b01000],
        ':': [0b00000,0b00100,0b00000,0b00000,0b00000,0b00100,0b00000],
        '-': [0b00000,0b00000,0b00000,0b11111,0b00000,0b00000,0b00000],
        '+': [0b00000,0b00100,0b00100,0b11111,0b00100,0b00100,0b00000],
        '/': [0b00001,0b00010,0b00010,0b00100,0b01000,0b01000,0b10000],
        '*': [0b00000,0b10101,0b01110,0b11111,0b01110,0b10101,0b00000],
        '\'': [0b00100,0b00100,0b01000,0b00000,0b00000,0b00000,0b00000],
        '"': [0b01010,0b01010,0b10100,0b00000,0b00000,0b00000,0b00000],
        '(': [0b00010,0b00100,0b01000,0b01000,0b01000,0b00100,0b00010],
        ')': [0b01000,0b00100,0b00010,0b00010,0b00010,0b00100,0b01000],
        ';': [0b00000,0b00100,0b00000,0b00000,0b00000,0b00100,0b01000],
        '=': [0b00000,0b00000,0b11111,0b00000,0b11111,0b00000,0b00000],
        '>': [0b01000,0b00100,0b00010,0b00001,0b00010,0b00100,0b01000],
        '<': [0b00010,0b00100,0b01000,0b10000,0b01000,0b00100,0b00010],
        '#': [0b01010,0b01010,0b11111,0b01010,0b11111,0b01010,0b01010],
        '%': [0b11001,0b11010,0b00010,0b00100,0b01000,0b01011,0b10011],
        '_': [0b00000,0b00000,0b00000,0b00000,0b00000,0b00000,0b11111],
        '@': [0b01110,0b10001,0b10111,0b10101,0b10111,0b10000,0b01110],
    };
    // Lowercase maps to uppercase
    const upper = ch.toUpperCase();
    return font[ch] || font[upper] || font['?'];
}

function textWidth(text, scale) {
    scale = scale || 1;
    return text.length * (5 * scale + scale);
}

// ---- Utility ----
function rectOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }
function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function randFloat(a, b) { return Math.random() * (b - a) + a; }

initFont();
