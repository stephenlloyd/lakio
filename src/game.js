// ============================================================
// AXIOM - Main Game Logic (v2: softer, Zelda-inspired, portals, powers)
// ============================================================

const Game = {
    state: 'loading',
    lives: 3,
    maxLives: 5,
    coins: 0,
    score: 0,
    currentWorld: 0,
    currentLevel: 0,
    worldsUnlocked: 1,
    levelsCompleted: [],
    keys: 0,
    // Powers: dash, shield, float
    power: null,
    powerTimer: 0,
    powerCooldown: 0,
    // Invincibility
    starPower: false,
    starTimer: 0,
    invincibleTimer: 0,
    checkpointX: -1,
    checkpointY: -1,
    storyScene: null,
    storyIndex: 0,
    menuSelection: 0,
    worldMapSelection: 0,
    frame: 0,
    shakeTimer: 0,
    shakeIntensity: 0,
    hintTimer: 0,
    hintText: '',
    scienceShown: [],
    bossHP: 0,
    bossMaxHP: 0,
    bossPhase: 0,
    comboCount: 0,
    comboTimer: 0,
    // Plane system (foreground/background)
    currentPlane: 0, // 0=main, 1=back
    // Transition locks
    levelCompleting: false,
    _levelClearTransitioning: false,

    miniGameType: null,
    miniGameState: null,

    init() {
        this.levelsCompleted = WorldData.map(w => w.levels.map(() => false));
        Input.init();
        Audio8.init();
        this.state = 'title';
        document.getElementById('loading').style.display = 'none';
        this.loop();
    },

    reset() {
        this.lives = 3; this.coins = 0; this.score = 0;
        this.currentWorld = 0; this.currentLevel = 0;
        this.worldsUnlocked = 1;
        this.levelsCompleted = WorldData.map(w => w.levels.map(() => false));
        this.keys = 0; this.power = null;
        this.checkpointX = -1; this.checkpointY = -1;
        this.levelCompleting = false;
    },

    loop() {
        this.frame++;
        Input.update();

        if (this.comboTimer > 0) { this.comboTimer--; if (this.comboTimer <= 0) this.comboCount = 0; }

        switch (this.state) {
            case 'title': this.updateTitle(); this.drawTitle(); break;
            case 'story': this.updateStory(); this.drawStory(); break;
            case 'worldmap': this.updateWorldMap(); this.drawWorldMap(); break;
            case 'science': this.updateScience(); this.drawScience(); break;
            case 'playing': this.updatePlaying(); this.drawPlaying(); break;
            case 'paused': this.updatePaused(); this.drawPaused(); break;
            case 'gameover': this.updateGameOver(); this.drawGameOver(); break;
            case 'victory': this.updateVictory(); this.drawVictory(); break;
            case 'minigame': this.updateMiniGame(); this.drawMiniGame(); break;
            case 'levelclear': this.updateLevelClear(); this.drawLevelClear(); break;
        }

        Transition.update();
        Transition.draw(ctx);
        requestAnimationFrame(() => this.loop());
    },

    // ================================================================
    // TITLE
    // ================================================================
    updateTitle() {
        Audio8.resume();
        Audio8.playMusic('title');
        if (Input.jumpJust || Input.actionJust) {
            Audio8.sfxConfirm();
            Transition.start(() => { this.reset(); this.state = 'story'; this.storyScene = 'intro'; this.storyIndex = 0; });
        }
    },
    drawTitle() {
        ctx.fillStyle = '#000011';
        ctx.fillRect(0, 0, GAME_W, GAME_H);
        for (let i = 0; i < 50; i++) {
            const sx = (i * 37 + this.frame * 0.15) % GAME_W;
            const sy = (i * 53 + Math.sin(i + this.frame * 0.01) * 15) % GAME_H;
            ctx.fillStyle = i % 5 === 0 ? '#8888ff' : i % 3 === 0 ? '#ffff88' : '#ffffff44';
            ctx.fillRect(sx, sy, 1, 1);
        }
        const titleY = 35 + Math.sin(this.frame * 0.02) * 5;
        drawText(ctx, 'AXIOM', GAME_W / 2, titleY, '#00ffff', 4, 'center');
        drawText(ctx, 'A SCIENCE ADVENTURE', GAME_W / 2, titleY + 38, '#88aacc', 1, 'center');
        const luxSprite = LuxSprites.idleR(this.frame);
        ctx.drawImage(luxSprite, GAME_W / 2 - 8, 105 + Math.sin(this.frame * 0.03) * 4);
        if (this.frame % 80 < 50) drawText(ctx, 'PRESS SPACE OR TAP', GAME_W / 2, 155, '#ffffff', 1, 'center');
        drawText(ctx, 'ARROWS/WASD  SPACE/Z JUMP', GAME_W / 2, 185, '#556677', 1, 'center');
        drawText(ctx, 'X/SHIFT PHOTON BLASTER', GAME_W / 2, 197, '#556677', 1, 'center');
        drawText(ctx, 'UP+X SPECIAL  ESC PAUSE', GAME_W / 2, 209, '#445566', 1, 'center');
        drawText(ctx, '2026 AXIOM LABS', GAME_W / 2, 226, '#334455', 1, 'center');
    },

    // ================================================================
    // STORY
    // ================================================================
    updateStory() {
        if (Input.jumpJust || Input.actionJust) {
            Audio8.sfxSelect();
            const scenes = StoryScenes[this.storyScene];
            if (scenes && this.storyIndex < scenes.length - 1) {
                this.storyIndex++;
            } else {
                Transition.start(() => {
                    if (this.storyScene === 'intro') { this.state = 'worldmap'; Audio8.stopMusic(); }
                    else if (this.storyScene === 'victory') { this.state = 'victory'; }
                    else {
                        const worldIdx = parseInt(this.storyScene.replace('world', '').replace('_intro', '')) - 1;
                        if (!this.scienceShown[worldIdx]) { this.scienceShown[worldIdx] = true; this.state = 'science'; }
                        else { this.state = 'playing'; this.startLevel(); }
                    }
                });
            }
        }
    },
    drawStory() {
        ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, GAME_W, GAME_H);
        const scenes = StoryScenes[this.storyScene]; if (!scenes) return;
        const scene = scenes[this.storyIndex]; if (!scene) return;
        let c = '#00ccff';
        if (scene.speaker === 'DR. ENTROPY') c = '#ff0066';
        else if (scene.speaker === 'PROF. HELIX') c = '#00ff88';
        else if (scene.speaker === 'NARRATOR') c = '#888888';
        ctx.fillStyle = c; ctx.fillRect(10, 10, GAME_W - 20, 2); ctx.fillRect(10, GAME_H - 12, GAME_W - 20, 2);
        ctx.fillRect(10, 10, 2, GAME_H - 22); ctx.fillRect(GAME_W - 12, 10, 2, GAME_H - 22);
        drawText(ctx, scene.speaker, 20, 24, c, 2);
        scene.text.split('\n').forEach((line, i) => drawText(ctx, line, 20, 55 + i * 16, '#ffffff', 1));
        if (this.frame % 50 < 30) drawText(ctx, 'PRESS SPACE', GAME_W / 2, GAME_H - 30, '#555555', 1, 'center');
        const total = scenes.length;
        for (let i = 0; i < total; i++) {
            ctx.fillStyle = i === this.storyIndex ? '#ffffff' : '#333333';
            ctx.fillRect(GAME_W / 2 - total * 4 + i * 8, GAME_H - 18, 4, 4);
        }
    },

    // ================================================================
    // SCIENCE
    // ================================================================
    updateScience() {
        if (Input.jumpJust || Input.actionJust) {
            Audio8.sfxConfirm();
            Transition.start(() => { this.state = 'playing'; this.startLevel(); });
        }
    },
    drawScience() {
        ctx.fillStyle = '#001122'; ctx.fillRect(0, 0, GAME_W, GAME_H);
        const world = WorldData[this.currentWorld];
        drawText(ctx, 'SCIENCE LESSON', GAME_W / 2, 15, '#ffcc00', 2, 'center');
        drawText(ctx, world.scienceConcept, GAME_W / 2, 40, '#00ffff', 2, 'center');
        ctx.fillStyle = '#334455'; ctx.fillRect(20, 55, GAME_W - 40, 1);
        world.scienceLesson.split('\n').forEach((line, i) => drawText(ctx, line, GAME_W / 2, 70 + i * 18, '#ffffff', 1, 'center'));
        if (this.frame % 50 < 30) drawText(ctx, 'PRESS SPACE TO START', GAME_W / 2, GAME_H - 25, '#888888', 1, 'center');
    },

    // ================================================================
    // WORLD MAP
    // ================================================================
    updateWorldMap() {
        Audio8.playMusic('worldmap');
        if (Input.right && !this._wmCd) { this.worldMapSelection = Math.min(this.worldMapSelection + 1, this.worldsUnlocked - 1); Audio8.sfxSelect(); this._wmCd = 12; }
        if (Input.left && !this._wmCd) { this.worldMapSelection = Math.max(this.worldMapSelection - 1, 0); Audio8.sfxSelect(); this._wmCd = 12; }
        if (this._wmCd > 0) this._wmCd--;
        if (Input.jumpJust || Input.actionJust) {
            Audio8.sfxConfirm();
            this.currentWorld = this.worldMapSelection;
            this.currentLevel = 0;
            for (let i = 0; i < WorldData[this.currentWorld].levels.length; i++) {
                if (!this.levelsCompleted[this.currentWorld][i]) { this.currentLevel = i; break; }
            }
            const sceneKey = 'world' + (this.currentWorld + 1) + '_intro';
            if (StoryScenes[sceneKey] && !this.scienceShown[this.currentWorld]) {
                Transition.start(() => { this.state = 'story'; this.storyScene = sceneKey; this.storyIndex = 0; Audio8.stopMusic(); });
            } else {
                Transition.start(() => { this.state = 'playing'; this.startLevel(); Audio8.stopMusic(); });
            }
        }
    },
    drawWorldMap() {
        ctx.fillStyle = '#111122'; ctx.fillRect(0, 0, GAME_W, GAME_H);
        drawText(ctx, 'SELECT WORLD', GAME_W / 2, 8, '#ffffff', 2, 'center');
        // World nodes - moved up
        const nodeY = 40;
        for (let i = 0; i < WorldData.length; i++) {
            const nodeX = 30 + i * 46;
            const unlocked = i < this.worldsUnlocked;
            const selected = i === this.worldMapSelection;
            const color = unlocked ? ['#ff6666', '#bb66ff', '#ffdd44', '#66ddff', '#ff6633'][i] : '#333333';
            ctx.fillStyle = selected ? '#ffffff' : '#000000';
            ctx.fillRect(nodeX - 2, nodeY - 2, 24, 24);
            ctx.fillStyle = color; ctx.fillRect(nodeX, nodeY, 20, 20);
            drawText(ctx, '' + (i + 1), nodeX + 6, nodeY + 6, selected ? '#000000' : '#ffffff', 1);
            if (i < WorldData.length - 1) { ctx.fillStyle = i + 1 < this.worldsUnlocked ? '#444444' : '#222222'; ctx.fillRect(nodeX + 22, nodeY + 9, 24, 2); }
            if (selected) { drawText(ctx, 'V', nodeX + 6, nodeY - 14 + Math.sin(this.frame * 0.08) * 3, '#ffffff', 1); }
        }
        if (this.worldMapSelection < WorldData.length) {
            const w = WorldData[this.worldMapSelection];
            drawText(ctx, w.name, GAME_W / 2, 80, '#ffffff', 2, 'center');
            drawText(ctx, w.subtitle, GAME_W / 2, 100, '#aaaaaa', 1, 'center');
            // Level dots
            const levels = w.levels;
            for (let i = 0; i < levels.length; i++) {
                const done = this.levelsCompleted[this.worldMapSelection][i];
                const lx = GAME_W / 2 - (levels.length * 20) / 2 + i * 20;
                ctx.fillStyle = done ? '#00ff00' : '#444444';
                ctx.fillRect(lx, 118, 12, 12);
                drawText(ctx, '' + (i + 1), lx + 2, 121, done ? '#000' : '#888', 1);
            }
            // Description - plenty of room now
            w.description.split('\n').forEach((line, i) => drawText(ctx, line, GAME_W / 2, 142 + i * 12, '#778899', 1, 'center'));
        }
        // Stats bar with dark background - clearly separated
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, GAME_H - 16, GAME_W, 16);
        drawText(ctx, 'LIVES:' + this.lives, 8, GAME_H - 11, '#ff4444', 1);
        drawText(ctx, 'COINS:' + this.coins, 80, GAME_H - 11, '#ffcc00', 1);
        drawText(ctx, 'SCORE:' + this.score, 160, GAME_H - 11, '#ffffff', 1);
    },

    // ================================================================
    // GAMEPLAY
    // ================================================================
    player: null,
    levelEntities: [],
    levelTiles: [],
    levelW: 0, levelH: 0,
    switchesActive: [],
    gatesOpen: [],

    startLevel() {
        const world = WorldData[this.currentWorld];
        const level = world.levels[this.currentLevel];
        this.levelW = level.width * TILE;
        this.levelH = level.height * TILE;
        this.levelTiles = [];
        this.levelEntities = [];
        this.switchesActive = [];
        this.gatesOpen = [];
        this.levelCompleting = false;
        this._levelClearTransitioning = false;
        this.bossHP = 0;
        this.bossMaxHP = 0;
        this.bossPhase = 0;
        this.timeSlowTimer = 0;
        this.currentPlane = 0;
        Particles.clear();

        // Parse map
        for (let y = 0; y < level.height; y++) {
            this.levelTiles[y] = [];
            for (let x = 0; x < level.width; x++) {
                const ch = (level.map[y] && level.map[y][x]) || '0';
                let tile = 0;
                if (ch >= '0' && ch <= '9') tile = parseInt(ch);
                else {
                    tile = 0;
                    // Special chars -> entities
                    switch(ch) {
                        case 'P': case 'Q': case 'R':
                            // Portals handled from level.portals
                            break;
                        case 'D':
                            this.levelEntities.push({ type: 'powerOrb', powerType: 'dash', x: x*TILE, y: y*TILE, w: 16, h: 16, collected: false });
                            break;
                        case 'S':
                            this.levelEntities.push({ type: 'powerOrb', powerType: 'shield', x: x*TILE, y: y*TILE, w: 16, h: 16, collected: false });
                            break;
                        case 'F':
                            this.levelEntities.push({ type: 'powerOrb', powerType: 'float', x: x*TILE, y: y*TILE, w: 16, h: 16, collected: false });
                            break;
                        case 'M':
                            this.levelEntities.push({ type: 'powerOrb', powerType: 'magnet', x: x*TILE, y: y*TILE, w: 16, h: 16, collected: false });
                            break;
                        case 'Z':
                            this.levelEntities.push({ type: 'powerOrb', powerType: 'timeslow', x: x*TILE, y: y*TILE, w: 16, h: 16, collected: false });
                            break;
                        case 'V':
                            tile = 40; // vine
                            break;
                        case 'W':
                            tile = 41; // water
                            break;
                        case 'B':
                            tile = 42; // breakable
                            break;
                        case 'T':
                            this.levelEntities.push({ type: 'trapDoor', x: x*TILE, y: y*TILE, w: 16, h: 8, timer: 0, falling: false, originalY: y*TILE });
                            tile = 2; // acts as platform until triggered
                            break;
                        case '!':
                            tile = 43; // sign
                            break;
                    }
                }
                this.levelTiles[y][x] = tile;

                // Spawn entities from number tiles
                if (tile === 4) { this.levelEntities.push({ type: 'coin', x: x*TILE, y: y*TILE, w: 16, h: 16, collected: false, bobOffset: Math.random()*Math.PI*2 }); this.levelTiles[y][x] = 0; }
                else if (tile === 6) { this.levelEntities.push({ type: 'spring', x: x*TILE, y: y*TILE, w: 16, h: 16, activated: 0 }); this.levelTiles[y][x] = 0; }
                else if (tile === 8) { this.levelEntities.push({ type: 'heart', x: x*TILE, y: y*TILE, w: 16, h: 16, collected: false }); this.levelTiles[y][x] = 0; }
                else if (tile === 9) { this.levelEntities.push({ type: 'key', x: x*TILE, y: y*TILE, w: 16, h: 16, collected: false }); this.levelTiles[y][x] = 0; }
                else if (tile === 7) { this.levelEntities.push({ type: 'checkpoint', x: x*TILE, y: y*TILE, w: 16, h: 16, activated: false }); this.levelTiles[y][x] = 0; }
                else if (tile === 29) { this.levelEntities.push({ type: 'star', x: x*TILE, y: y*TILE, w: 16, h: 16, collected: false }); this.levelTiles[y][x] = 0; }
            }
        }

        // Portals
        if (level.portals) {
            level.portals.forEach(p => {
                this.levelEntities.push({
                    type: 'portal', id: p.id, x: p.x * TILE, y: p.y * TILE,
                    w: 16, h: 16, color: p.color, targetId: p.target, cooldown: 0
                });
            });
        }

        // Enemies with proper collision
        if (level.enemies) {
            level.enemies.forEach(e => {
                this.levelEntities.push({
                    type: 'enemy', enemyType: e.type,
                    x: e.x * TILE, y: e.y * TILE,
                    w: 14, h: 14, vx: 0.4, vy: 0,
                    dir: 1, patrolDist: (e.patrol || 3) * TILE,
                    startX: e.x * TILE, alive: true,
                    frame: Math.floor(Math.random() * 100),
                    flying: e.flying || false,
                    bounce: e.bounce || false,
                    bounceTimer: 0
                });
            });
        }

        // Circuits
        if (level.circuits) {
            level.circuits.forEach((c, ci) => {
                this.switchesActive[ci] = c.switches.map(() => false);
                this.gatesOpen[ci] = false;
                c.switches.forEach((sw, si) => {
                    this.levelEntities.push({ type: 'switch', x: sw[0]*TILE, y: sw[1]*TILE, w: 16, h: 16, circuitIdx: ci, switchIdx: si, active: false });
                });
                if (c.gate) this.levelTiles[c.gate[1]][c.gate[0]] = 21;
            });
        }

        // Boss
        if (level.isBoss) {
            this.bossHP = 10; this.bossMaxHP = 10; this.bossPhase = 1;
            this.levelEntities.push({
                type: 'boss', enemyType: level.bossType || 'entropy',
                x: this.levelW / 2 - 16, y: 8 * TILE,
                w: 28, h: 30, vx: 0.8, vy: 0,
                dir: -1, alive: true, frame: 0,
                attackTimer: 150, pattern: 0, hurtTimer: 0
            });

            // Prism puzzle setup
            if (level.bossPuzzle && level.bossPuzzle.type === 'prism') {
                this.bossPuzzle = {
                    active: true,
                    round: 1,
                    roundsToWin: level.bossPuzzle.roundsToWin || 3,
                    carrying: null, // which prism color the player is carrying
                    beamTimer: 0,   // countdown for the light beam attack
                    beamActive: false,
                    pedestalsDef: level.bossPuzzle.pedestals.map(p => ({ ...p })),
                    prismsDef: level.bossPuzzle.prisms.map(p => ({ ...p })),
                };
                this.spawnPrismRound();
            } else {
                this.bossPuzzle = null;
            }
        } else {
            this.bossPuzzle = null;
        }

        // Player
        const px = this.checkpointX >= 0 ? this.checkpointX : level.playerStart[0] * TILE;
        const py = this.checkpointY >= 0 ? this.checkpointY : level.playerStart[1] * TILE;
        this.player = {
            x: px, y: py, w: 12, h: 15,
            vx: 0, vy: 0, dir: 1,
            grounded: false, onVine: false, wallSliding: false,
            coyoteTimer: 0, jumpBufferTimer: 0,
            airJumps: 0,
            animFrame: 0, animTimer: 0,
            state: 'idle', hurtTimer: 0, dead: false,
            dashTimer: 0, shieldTimer: 0, floatTimer: 0, magnetTimer: 0,
            dropHoldTimer: 0, droppingThrough: false,
            shootTimer: 0
        };
        this.checkpointX = -1; this.checkpointY = -1;
        this.invincibleTimer = 90;
        this.hintTimer = 360; this.hintText = level.hint || '';
        this.shakeTimer = 0;

        Camera.reset(px - GAME_W / 2, py - GAME_H / 2);
        Audio8.playMusic(level.isBoss ? 'boss' : world.musicTrack);
    },

    // Spawn prisms and pedestals for the current boss round
    spawnPrismRound() {
        const bp = this.bossPuzzle;
        if (!bp) return;
        // Remove old prisms/pedestals
        this.levelEntities = this.levelEntities.filter(e => e.type !== 'prism' && e.type !== 'pedestal');
        bp.carrying = null;
        bp.beamActive = false;
        bp.beamTimer = 0;

        // Spawn prisms at slightly randomized positions each round
        const offset = (bp.round - 1) * 2;
        bp.prismsDef.forEach(pd => {
            this.levelEntities.push({
                type: 'prism', color: pd.color,
                x: (pd.x + ((bp.round * 3) % 5) - 2) * TILE,
                y: (pd.y - Math.floor(bp.round / 2)) * TILE,
                w: 16, h: 16, collected: false
            });
        });

        // Spawn pedestals
        bp.pedestalsDef.forEach(pd => {
            this.levelEntities.push({
                type: 'pedestal',
                x: pd.x * TILE, y: pd.y * TILE,
                w: 16, h: 16, color: null, filled: false
            });
        });
    },

    updatePlaying() {
        if (Transition.active) return;
        const p = this.player;
        if (!p) return;

        if (Input.pauseJust) { this.state = 'paused'; this.menuSelection = 0; Audio8.sfxSelect(); return; }

        const world = WorldData[this.currentWorld];
        const level = world.levels[this.currentLevel];
        const isIce = level.icePhysics;

        if (this.hintTimer > 0) this.hintTimer--;
        if (this.shakeTimer > 0) this.shakeTimer--;
        if (this.invincibleTimer > 0) this.invincibleTimer--;
        if (this.starTimer > 0) { this.starTimer--; if (this.starTimer <= 0) this.starPower = false; }
        if (this.powerCooldown > 0) this.powerCooldown--;
        if (this.timeSlowTimer > 0) this.timeSlowTimer--;
        if (p.shieldTimer > 0) p.shieldTimer--;
        if (p.magnetTimer > 0) p.magnetTimer--;
        if (p.floatTimer > 0 && p.grounded) p.floatTimer = 0;

        // Dead player floats away
        if (p.dead) {
            p.vy += GRAVITY * 0.5; // slower fall when dead (softer)
            p.y += p.vy;
            if (p.y > this.levelH + 80) this.playerDie();
            Particles.update();
            return;
        }

        if (p.hurtTimer > 0) {
            p.hurtTimer--;
            p.vx *= 0.92;
            p.vy += GRAVITY;
            p.y += p.vy; p.x += p.vx;
            this.collideWithLevel(p);
            Particles.update();
            return;
        }

        // Dashing
        if (p.dashTimer > 0) {
            p.dashTimer--;
            p.vx = p.dir * 4;
            p.vy = 0;
            p.x += p.vx;
            this.collideWithLevelH(p);
            Particles.update();
            if (this.frame % 2 === 0) Particles.emit(p.x + 6, p.y + 8, 2, ['#88ccff', '#ffffff'], 1.5, 12, 1);
            this.updateEntities();
            Camera.follow(p, this.levelW, this.levelH);
            return;
        }

        // ---- Movement (softer) ----
        const speed = Input.run ? PLAYER_RUN_SPEED : PLAYER_SPEED;
        const fric = isIce && p.grounded ? 0.96 : FRICTION;

        if (Input.left) {
            p.vx = isIce ? Math.max(p.vx - 0.15, -speed) : lerp(p.vx, -speed, 0.3);
            p.dir = -1;
        } else if (Input.right) {
            p.vx = isIce ? Math.min(p.vx + 0.15, speed) : lerp(p.vx, speed, 0.3);
            p.dir = 1;
        } else {
            p.vx *= fric;
            if (Math.abs(p.vx) < 0.05) p.vx = 0;
        }

        // Vine climbing
        const pcx = Math.floor((p.x + p.w/2) / TILE);
        const pcy = Math.floor((p.y + p.h/2) / TILE);
        p.onVine = this.getTile(pcx, pcy) === 40;

        if (p.onVine) {
            p.vy = 0;
            if (Input.up) p.vy = -1.2;
            if (Input.down) p.vy = 1.0;
            if (Input.jumpJust) { p.vy = JUMP_FORCE; p.onVine = false; Audio8.sfxJump(); }
            p.grounded = false;
        }

        // Gravity zones
        let grav = GRAVITY;
        if (level.gravityZones) {
            for (const gz of level.gravityZones) {
                const gzPx = { x: gz.x * TILE, y: gz.y * TILE, w: gz.w * TILE, h: gz.h * TILE };
                if (rectOverlap({ x: p.x, y: p.y, w: p.w, h: p.h }, gzPx)) { grav = gz.gravity; break; }
            }
        }

        // Float power - reduced gravity
        if (p.floatTimer > 0) {
            p.floatTimer--;
            grav *= 0.3;
            if (this.frame % 3 === 0) Particles.emit(p.x + 6, p.y + 16, 1, ['#aa44ff', '#cc66ff'], 1, 15, 1);
        }

        // Coyote time & jump buffer
        if (p.grounded) { p.coyoteTimer = COYOTE_TIME; p.airJumps = 0; p.droppingThrough = false; }
        else p.coyoteTimer = Math.max(0, p.coyoteTimer - 1);
        if (Input.jumpJust) p.jumpBufferTimer = JUMP_BUFFER;
        else p.jumpBufferTimer = Math.max(0, p.jumpBufferTimer - 1);

        // Drop-through: hold DOWN for 3 seconds on any elevated surface
        // Works on platforms (tile 2) AND ground (tile 1) as long as there's
        // air somewhere below — i.e. you're not on the actual floor.
        if (Input.down && p.grounded) {
            const feetY = Math.floor((p.y + p.h) / TILE);
            const feetX1 = Math.floor(p.x / TILE);
            const feetX2 = Math.floor((p.x + p.w - 1) / TILE);
            const standingOnSomething = this.isPlatform(feetX1, feetY) || this.isPlatform(feetX2, feetY)
                || this.isSolid(feetX1, feetY) || this.isSolid(feetX2, feetY);

            // Check if there's open air within 5 tiles below us — if so, this is
            // an elevated surface, not the bottom floor, so we can drop through it.
            let hasAirBelow = false;
            if (standingOnSomething) {
                for (let dy = 1; dy <= 5; dy++) {
                    const checkY = feetY + dy;
                    if (checkY >= this.levelTiles.length) break;
                    if (!this.isSolid(feetX1, checkY) && !this.isPlatform(feetX1, checkY)) {
                        hasAirBelow = true;
                        break;
                    }
                }
            }

            if (standingOnSomething && hasAirBelow) {
                p.dropHoldTimer++;
                if (p.dropHoldTimer >= DROP_THROUGH_HOLD) {
                    p.droppingThrough = true;
                    p.grounded = false;
                    p.y += 6; // nudge past the surface
                    p.vy = 0.5; // gentle downward push
                    p.dropHoldTimer = 0;
                    Audio8.playNote(180, 0.08, 'triangle', Audio8.sfxGain, 0.1);
                    Particles.emit(p.x + 6, p.y, 5, ['#ffffff44', '#aaaaaa44'], 1.2, 12, 1);
                }
            } else {
                p.dropHoldTimer = 0;
            }
        } else {
            p.dropHoldTimer = 0;
        }

        // Jump - ground jump OR double jump (air jump)
        if (!p.onVine && p.jumpBufferTimer > 0) {
            const jumpMult = grav < 0 ? -0.6 : (grav < 0.15 ? 1.4 : 1);
            if (p.coyoteTimer > 0) {
                // Normal ground jump
                p.vy = JUMP_FORCE * jumpMult;
                p.grounded = false; p.coyoteTimer = 0; p.jumpBufferTimer = 0;
                Audio8.sfxJump();
                Particles.emit(p.x + 6, p.y + 15, 4, ['#ffffff44', '#cccccc44'], 1.5, 12, 1);
            } else if (p.airJumps < MAX_AIR_JUMPS) {
                // Double jump (air jump)
                p.airJumps++;
                p.vy = JUMP_FORCE * 0.85 * jumpMult; // slightly weaker than ground jump
                p.jumpBufferTimer = 0;
                Audio8.sfxJump();
                // Distinctive double-jump particles (ring burst)
                Particles.emit(p.x + 6, p.y + 10, 8, ['#88ccff', '#aaddff', '#ffffff'], 2.5, 15, 1);
            }
        }

        // Variable jump (softer release)
        if (!Input.jump && p.vy < -1 && grav > 0) p.vy *= 0.8;
        if (!Input.jump && p.vy > 1 && grav < 0) p.vy *= 0.8;

        // Apply gravity (softer)
        if (!p.onVine) {
            p.vy += grav;
            if (grav >= 0) p.vy = Math.min(p.vy, MAX_FALL);
            else p.vy = Math.max(p.vy, -MAX_FALL);
        }

        // ---- Photon Blaster (action button = shoot) ----
        if (p.shootTimer > 0) p.shootTimer--;
        if (Input.actionJust && p.shootTimer <= 0) {
            // Special power takes priority if available and off cooldown
            if (this.power && this.powerCooldown <= 0 && Input.up) {
                // Hold UP + action = use special power
                if (this.power === 'dash') {
                    p.dashTimer = 12; this.powerCooldown = 90; Audio8.sfxJump();
                } else if (this.power === 'shield') {
                    p.shieldTimer = 180; this.invincibleTimer = 180;
                    this.powerCooldown = 300; Audio8.sfxPowerup();
                } else if (this.power === 'float') {
                    p.floatTimer = 180; this.powerCooldown = 180; Audio8.sfxPowerup();
                } else if (this.power === 'magnet') {
                    p.magnetTimer = 300; this.powerCooldown = 300; Audio8.sfxPowerup();
                } else if (this.power === 'timeslow') {
                    this.timeSlowTimer = 240; this.powerCooldown = 360; Audio8.sfxPowerup();
                }
            } else {
                // Shoot photon blaster!
                p.shootTimer = 18; // cooldown between shots
                const shotSpeed = 3.5;
                const shotX = p.dir > 0 ? p.x + p.w + 2 : p.x - 10;
                this.levelEntities.push({
                    type: 'photon',
                    x: shotX, y: p.y + 5,
                    w: 8, h: 6,
                    vx: shotSpeed * p.dir, vy: 0,
                    life: 60,
                    fromPlayer: true
                });
                Audio8.playNote(800, 0.06, 'square', Audio8.sfxGain, 0.15);
                setTimeout(() => Audio8.playNote(1200, 0.04, 'square', Audio8.sfxGain, 0.1), 30);
                Particles.emit(shotX + 4, p.y + 8, 3, ['#00ccff', '#88eeff'], 1.5, 8, 1);
                p.state = 'shoot';
            }
        }

        // Move & collide
        p.x += p.vx;
        this.collideWithLevelH(p);
        if (!p.onVine) {
            p.y += p.vy;
            p.grounded = false;
            this.collideWithLevelV(p, grav);
        } else {
            p.y += p.vy;
            const vBot = Math.floor((p.y + p.h) / TILE);
            if (this.isSolid(pcx, vBot + 1) && p.vy > 0) { p.y = (vBot + 1) * TILE - p.h; p.vy = 0; }
        }

        p.x = clamp(p.x, 0, this.levelW - p.w);

        // ---- Wall Slide & Wall Jump ----
        p.wallSliding = false;
        if (!p.grounded && !p.onVine && p.vy > 0) {
            // Check if pressing into a wall
            const wallCheckDir = Input.right ? 1 : (Input.left ? -1 : 0);
            if (wallCheckDir !== 0) {
                const wallCol = wallCheckDir > 0 ?
                    Math.floor((p.x + p.w + 1) / TILE) :
                    Math.floor((p.x - 1) / TILE);
                const topRow = Math.floor(p.y / TILE);
                const botRow = Math.floor((p.y + p.h - 1) / TILE);
                let touchingWall = false;
                for (let r = topRow; r <= botRow; r++) {
                    if (this.isSolid(wallCol, r)) { touchingWall = true; break; }
                }
                if (touchingWall) {
                    p.wallSliding = true;
                    p.vy = Math.min(p.vy, 1.0); // slow slide down wall
                    p.dir = -wallCheckDir; // face away from wall
                    p.airJumps = Math.min(p.airJumps, 1); // restore 1 jump
                    // Wall jump
                    if (Input.jumpJust) {
                        p.vy = JUMP_FORCE * 0.9;
                        p.vx = -wallCheckDir * 2.5; // push away from wall
                        p.wallSliding = false;
                        p.airJumps = 1;
                        Audio8.sfxJump();
                        Particles.emit(p.x + (wallCheckDir > 0 ? p.w : 0), p.y + 8, 6,
                            ['#ffffff44', '#cccccc44'], 2, 12, 1);
                    }
                }
            }
        }

        // Soft landing particles
        if (p.grounded && p._wasFalling) {
            Particles.emit(p.x + 6, p.y + p.h, 3, ['#ffffff33', '#cccccc33'], 1.5, 10, 1);
        }
        p._wasFalling = p.vy > 2;

        // Safety: cancel drop-through after passing through (max ~3 tiles worth)
        if (p.droppingThrough) {
            p._dropDistance = (p._dropDistance || 0) + Math.abs(p.vy);
            if (p._dropDistance > TILE * 4) {
                p.droppingThrough = false;
                p._dropDistance = 0;
            }
        } else {
            p._dropDistance = 0;
        }

        // Wall stuck prevention: if embedded in a solid tile, push out
        const checkCx = Math.floor((p.x + p.w / 2) / TILE);
        const checkCy = Math.floor((p.y + p.h / 2) / TILE);
        if (this.isSolid(checkCx, checkCy)) {
            // Push up first, then try sides
            p.y = checkCy * TILE - p.h;
            p.vy = 0;
            p.grounded = true;
        }

        // Fall death (with more margin)
        if (p.y > this.levelH + 48) {
            p.dead = true; p.vy = JUMP_FORCE * 0.6;
            Audio8.sfxDie(); this.shakeTimer = 10; this.shakeIntensity = 2;
        }

        // Animation
        p.animTimer++;
        if (p.animTimer >= 6) { p.animTimer = 0; p.animFrame++; }
        if (p.wallSliding) p.state = 'wallSlide';
        else if (p.onVine) p.state = 'walk';
        else if (p.shootTimer > 14) p.state = 'shoot'; // brief shoot pose
        else if (p.grounded && Math.abs(p.vx) > 0.3) p.state = 'walk';
        else if (p.grounded) p.state = 'idle';
        else if (p.vy < -0.5) p.state = 'jump';
        else if (p.vy > 0.5) p.state = 'fall';
        else p.state = 'idle';

        if (p.dashTimer > 0) p.state = 'dash';
        if (p.floatTimer > 0 && !p.grounded) p.state = 'float';

        // Wall slide particles
        if (p.wallSliding && this.frame % 4 === 0) {
            Particles.emit(p.x + (p.dir < 0 ? 0 : p.w), p.y + 4, 1, ['#ffffff22'], 0.5, 8, 1);
        }

        this.updateEntities();
        Particles.update();
        Camera.follow(p, this.levelW, this.levelH);
    },

    updateEntities() {
        const p = this.player;
        if (!p || p.dead) return;
        const pRect = { x: p.x, y: p.y, w: p.w, h: p.h };

        for (let i = this.levelEntities.length - 1; i >= 0; i--) {
            const e = this.levelEntities[i];

            // Coins
            if (e.type === 'coin' && !e.collected) {
                // Magnet pull: attract coins toward player
                if (p.magnetTimer > 0) {
                    const dx = p.x - e.x, dy = p.y - e.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 80) {
                        e.x += (dx / dist) * 2;
                        e.y += (dy / dist) * 2;
                        if (this.frame % 6 === 0) Particles.emit(e.x + 8, e.y + 8, 1, ['#ffcc0044'], 0.5, 8, 1);
                    }
                }
                if (rectOverlap(pRect, e)) {
                    e.collected = true; this.coins++; this.score += 10;
                    Audio8.sfxCoin();
                    Particles.emit(e.x + 8, e.y + 8, 6, ['#ffcc00', '#ffee66', '#ffffff'], 2, 20);
                    if (this.coins % 50 === 0 && this.lives < this.maxLives) { this.lives++; Audio8.sfx1up(); }
                }
            }

            if (e.type === 'heart' && !e.collected) {
                if (rectOverlap(pRect, e)) {
                    e.collected = true;
                    if (this.lives < this.maxLives) { this.lives++; Audio8.sfx1up(); }
                    this.score += 100;
                    Particles.emit(e.x + 8, e.y + 8, 10, ['#ff5555', '#ff8888', '#ffffff'], 3, 25);
                }
            }

            if (e.type === 'key' && !e.collected) {
                if (rectOverlap(pRect, e)) {
                    e.collected = true; this.keys++;
                    Audio8.sfxPowerup();
                    Particles.emit(e.x + 8, e.y + 8, 8, ['#FFD700', '#ffee88'], 2, 20);
                }
            }

            if (e.type === 'star' && !e.collected) {
                if (rectOverlap(pRect, e)) {
                    e.collected = true; this.starPower = true; this.starTimer = 600; this.invincibleTimer = 600;
                    Audio8.sfxPowerup();
                    Particles.emit(e.x + 8, e.y + 8, 12, ['#ffff00', '#ff8800', '#ffffff'], 4, 30);
                }
            }

            // Power orbs
            if (e.type === 'powerOrb' && !e.collected) {
                if (rectOverlap(pRect, e)) {
                    e.collected = true;
                    this.power = e.powerType;
                    this.powerCooldown = 0;
                    Audio8.sfxPowerup();
                    Particles.emit(e.x + 8, e.y + 8, 12, ['#ffffff', '#ffcc88', '#88ccff'], 4, 30);
                }
            }

            // Springs (softer bounce)
            if (e.type === 'spring') {
                if (e.activated > 0) e.activated--;
                if (rectOverlap(pRect, e) && p.vy > 0) {
                    p.vy = JUMP_FORCE * 1.6;
                    p.grounded = false; e.activated = 15;
                    Audio8.sfxJump();
                    Particles.emit(e.x + 8, e.y, 5, ['#ff8800', '#ffaa44'], 2, 15);
                }
            }

            if (e.type === 'checkpoint' && !e.activated) {
                if (rectOverlap(pRect, e)) {
                    e.activated = true; this.checkpointX = e.x; this.checkpointY = e.y - 1;
                    Audio8.sfxSolve();
                    Particles.emit(e.x + 8, e.y + 8, 8, ['#00ff00', '#44ff44', '#ffffff'], 3, 25);
                }
            }

            // Portals
            if (e.type === 'portal') {
                if (e.cooldown > 0) e.cooldown--;
                if (rectOverlap(pRect, e) && e.cooldown <= 0) {
                    // Find target portal
                    const target = this.levelEntities.find(t => t.type === 'portal' && t.id === e.targetId);
                    if (target) {
                        p.x = target.x; p.y = target.y;
                        target.cooldown = 60; e.cooldown = 60;
                        Audio8.sfxDoor();
                        Particles.emit(e.x + 8, e.y + 8, 10, ['#4488ff', '#88bbff', '#ffffff'], 4, 20);
                        Particles.emit(target.x + 8, target.y + 8, 10, ['#ff8844', '#ffbb88', '#ffffff'], 4, 20);
                        this.shakeTimer = 5; this.shakeIntensity = 2;
                    }
                }
            }

            // Switches
            if (e.type === 'switch' && !e.active) {
                if (rectOverlap(pRect, e)) {
                    e.active = true;
                    this.switchesActive[e.circuitIdx][e.switchIdx] = true;
                    Audio8.sfxSolve();
                    Particles.emit(e.x + 8, e.y + 8, 6, ['#ffcc00', '#00ffff'], 2, 20);
                    if (this.switchesActive[e.circuitIdx].every(s => s)) {
                        this.gatesOpen[e.circuitIdx] = true;
                        Audio8.sfxDoor();
                        const level = WorldData[this.currentWorld].levels[this.currentLevel];
                        if (level.circuits && level.circuits[e.circuitIdx]) {
                            const gate = level.circuits[e.circuitIdx].gate;
                            if (gate) this.levelTiles[gate[1]][gate[0]] = 0;
                        }
                    }
                }
            }

            // Trap doors
            if (e.type === 'trapDoor') {
                if (e.falling) {
                    e.timer++;
                    if (e.timer > 20) {
                        const tx = Math.floor(e.x / TILE);
                        const ty = Math.floor(e.originalY / TILE);
                        this.levelTiles[ty][tx] = 0; // remove platform tile
                        this.levelEntities.splice(i, 1);
                        Particles.emit(e.x + 8, e.originalY + 4, 6, ['#aa9977', '#887766'], 2, 15);
                        continue;
                    }
                } else if (rectOverlap(pRect, { x: e.x, y: e.originalY - 4, w: 16, h: 12 })) {
                    e.falling = true; e.timer = 0;
                }
            }

            // Enemies with PROPER wall collision
            if (e.type === 'enemy' && e.alive) {
                e.frame++;

                // Movement (affected by timeslow)
                const tsMult = this.timeSlowTimer > 0 ? 0.3 : 1;
                const oldX = e.x;
                e.x += e.vx * e.dir * tsMult;

                // Wall collision for enemies
                const eLeft = Math.floor(e.x / TILE);
                const eRight = Math.floor((e.x + e.w) / TILE);
                const eTop = Math.floor(e.y / TILE);
                const eBot = Math.floor((e.y + e.h - 1) / TILE);

                let hitWall = false;
                if (e.dir > 0) {
                    for (let r = eTop; r <= eBot; r++) { if (this.isSolid(eRight, r)) { hitWall = true; break; } }
                } else {
                    for (let r = eTop; r <= eBot; r++) { if (this.isSolid(eLeft, r)) { hitWall = true; break; } }
                }
                if (hitWall) { e.x = oldX; e.dir *= -1; }

                // Patrol bounds
                if (Math.abs(e.x - e.startX) > e.patrolDist) e.dir *= -1;

                // Edge detection - don't walk off cliffs
                if (!e.flying && !e.bounce) {
                    const checkX = e.dir > 0 ? Math.floor((e.x + e.w) / TILE) : Math.floor(e.x / TILE);
                    const checkY = Math.floor((e.y + e.h) / TILE) + 1;
                    if (!this.isSolid(checkX, checkY) && !this.isPlatform(checkX, checkY)) {
                        e.dir *= -1;
                    }
                }

                // Gravity for non-flying enemies
                if (!e.flying) {
                    e.vy = (e.vy || 0) + GRAVITY * 0.6;
                    if (e.vy > MAX_FALL) e.vy = MAX_FALL;
                    e.y += e.vy;
                    // Ground collision
                    const groundRow = Math.floor((e.y + e.h) / TILE);
                    const eL = Math.floor(e.x / TILE);
                    const eR = Math.floor((e.x + e.w - 1) / TILE);
                    for (let c = eL; c <= eR; c++) {
                        if (this.isSolid(c, groundRow) || this.isPlatform(c, groundRow)) {
                            e.y = groundRow * TILE - e.h;
                            e.vy = 0;
                            break;
                        }
                    }
                } else if (e.enemyType === 'orbiter') {
                    // Orbiter: circles around its start point
                    const orbitRadius = (e.patrolDist || 48);
                    const orbitSpeed = 0.025;
                    const angle = this.frame * orbitSpeed + e.startX * 0.1;
                    e.x = e.startX + Math.cos(angle) * orbitRadius;
                    e.y = (e._startY || e.y) + Math.sin(angle) * orbitRadius;
                    if (!e._startY) e._startY = e.y;
                } else if (e.enemyType === 'spinner') {
                    // Spinner: stays in place, shoots in 4 directions periodically
                    e._shootTimer = (e._shootTimer || 0) + 1;
                    if (e._shootTimer >= 120) {
                        e._shootTimer = 0;
                        const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
                        dirs.forEach(d => {
                            this.levelEntities.push({
                                type: 'projectile', x: e.x + 4, y: e.y + 4,
                                w: 6, h: 6, vx: d[0] * 1.5, vy: d[1] * 1.5,
                                life: 90, color: '#cc66bb'
                            });
                        });
                        Audio8.playNote(300, 0.06, 'square', Audio8.sfxGain, 0.1);
                    }
                } else {
                    // Other flying enemies bob gently
                    e.y += Math.sin(this.frame * 0.03 + e.startX) * 0.3;
                }

                // Bouncing enemies
                if (e.bounce) {
                    e.bounceTimer++;
                    if (e.bounceTimer % 60 === 0 && e.vy === 0) {
                        e.vy = JUMP_FORCE * 0.6;
                    }
                }

                // Player collision
                if (p.hurtTimer <= 0 && rectOverlap(pRect, e)) {
                    if (p.vy > 0 && p.y + p.h - e.y < 12) {
                        // Stomp
                        e.alive = false;
                        p.vy = JUMP_FORCE * 0.5; // gentler bounce
                        this.comboCount++; this.comboTimer = 60;
                        this.score += 100 * this.comboCount;
                        Audio8.sfxEnemyDie();
                        Particles.emit(e.x + 7, e.y + 7, 8, ['#ff4444', '#ffaa00', '#ffffff'], 3, 20);
                    } else if (this.invincibleTimer <= 0) {
                        this.playerHurt(e);
                    } else if (this.starPower) {
                        e.alive = false; this.score += 200;
                        Audio8.sfxEnemyDie();
                        Particles.emit(e.x + 7, e.y + 7, 10, ['#ffff00', '#ff8800'], 4, 25);
                    }
                }
            }

            // Boss
            if (e.type === 'boss' && e.alive) {
                e.frame++;
                if (e.hurtTimer > 0) e.hurtTimer--;

                e.attackTimer--;
                if (e.attackTimer <= 0) {
                    e.attackTimer = Math.max(60, 120 - this.bossPhase * 20);
                    const dx = p.x - e.x, dy = p.y - e.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    this.levelEntities.push({
                        type: 'projectile', x: e.x + 14, y: e.y + 14,
                        w: 8, h: 8, vx: (dx / dist) * 1.8, vy: (dy / dist) * 1.8,
                        life: 200, color: '#ff3300'
                    });
                    Audio8.playNote(150, 0.12, 'sawtooth', Audio8.sfxGain, 0.15);
                }

                e.x += e.vx * e.dir;
                if (e.x < TILE * 12 || e.x > this.levelW - TILE * 6) e.dir *= -1;
                e.y = 8 * TILE + Math.sin(this.frame * 0.02) * 25;

                if (p.hurtTimer <= 0 && rectOverlap(pRect, e)) {
                    if (this.bossPuzzle && this.bossPuzzle.active) {
                        // Prism puzzle boss: can't stomp — just bounce off head, otherwise hurt
                        if (p.vy > 0 && p.y + p.h - e.y < 14) {
                            p.vy = JUMP_FORCE * 0.5; // bounce off
                            Audio8.playNote(200, 0.08, 'square', Audio8.sfxGain, 0.1);
                        } else if (this.invincibleTimer <= 0 && e.hurtTimer <= 0) {
                            this.playerHurt(e);
                        }
                    } else {
                        // Standard boss: stomp to damage
                        if (p.vy > 0 && p.y + p.h - e.y < 14 && e.hurtTimer <= 0) {
                            this.bossHP--;
                            e.hurtTimer = 40; p.vy = JUMP_FORCE * 0.6;
                            this.score += 500;
                            Audio8.sfxEnemyDie();
                            this.shakeTimer = 8; this.shakeIntensity = 2;
                            Particles.emit(e.x + 14, e.y + 14, 12, ['#ff3300', '#ff6600', '#ffcc00'], 4, 25);
                            if (this.bossHP <= this.bossMaxHP * 0.5 && this.bossPhase < 2) { this.bossPhase = 2; e.vx *= 1.3; }
                            if (this.bossHP <= 0) {
                                e.alive = false; this.score += 5000;
                                Audio8.sfxLevelClear();
                                this.shakeTimer = 20; this.shakeIntensity = 3;
                                Particles.emit(e.x + 14, e.y + 14, 30, ['#ff3300', '#ff6600', '#ffcc00', '#ffffff'], 6, 50);
                                setTimeout(() => { if (!this.levelCompleting) this.completeLevel(); }, 2500);
                            }
                        } else if (this.invincibleTimer <= 0 && e.hurtTimer <= 0) {
                            this.playerHurt(e);
                        }
                    }
                }
            }

            // Enemy projectiles (boss fireballs) — affected by timeslow
            if (e.type === 'projectile') {
                const tsm = this.timeSlowTimer > 0 ? 0.3 : 1;
                e.x += e.vx * tsm; e.y += e.vy * tsm; e.life--;
                if (e.life <= 0) { this.levelEntities.splice(i, 1); continue; }
                if (p.hurtTimer <= 0 && this.invincibleTimer <= 0 && p.shieldTimer <= 0 && rectOverlap(pRect, e)) {
                    this.playerHurt(e); this.levelEntities.splice(i, 1); continue;
                }
                const tx = Math.floor(e.x / TILE), ty = Math.floor(e.y / TILE);
                if (this.isSolid(tx, ty)) {
                    Particles.emit(e.x, e.y, 4, [e.color || '#ff3300'], 1.5, 10, 1);
                    this.levelEntities.splice(i, 1);
                }
            }

            // Player photon blasts
            if (e.type === 'photon') {
                e.x += e.vx; e.y += e.vy; e.life--;
                if (e.life <= 0) { this.levelEntities.splice(i, 1); continue; }
                // Hit wall
                const ptx = Math.floor(e.x / TILE), pty = Math.floor(e.y / TILE);
                if (this.isSolid(ptx, pty)) {
                    Particles.emit(e.x + 4, e.y + 3, 5, ['#00ccff', '#88eeff', '#ffffff'], 2, 12, 1);
                    Audio8.playNote(400, 0.04, 'square', Audio8.sfxGain, 0.08);
                    this.levelEntities.splice(i, 1); continue;
                }
                // Hit enemy
                for (let j = this.levelEntities.length - 1; j >= 0; j--) {
                    const target = this.levelEntities[j];
                    if (target.type === 'enemy' && target.alive && rectOverlap(e, target)) {
                        target.alive = false;
                        this.score += 150;
                        this.comboCount++; this.comboTimer = 60;
                        Audio8.sfxEnemyDie();
                        Particles.emit(target.x + 7, target.y + 7, 10,
                            ['#00ccff', '#ffffff', '#ffcc00'], 3, 20);
                        this.levelEntities.splice(i, 1);
                        break;
                    }
                }
            }
        }

        // ---- Prism Puzzle Logic ----
        const bp = this.bossPuzzle;
        if (bp && bp.active) {
            // Collect prisms
            for (const e of this.levelEntities) {
                if (e.type === 'prism' && !e.collected && !bp.carrying) {
                    if (rectOverlap(pRect, e)) {
                        e.collected = true;
                        bp.carrying = e.color;
                        Audio8.sfxCoin();
                        Particles.emit(e.x + 8, e.y + 8, 8, [
                            e.color === 'red' ? '#ff4444' : e.color === 'green' ? '#44ff44' : '#4488ff',
                            '#ffffff'
                        ], 3, 20);
                    }
                }
            }

            // Place prism on pedestal
            if (bp.carrying) {
                for (const e of this.levelEntities) {
                    if (e.type === 'pedestal' && !e.filled && rectOverlap(pRect, e)) {
                        if (Input.actionJust || Input.down) {
                            e.filled = true;
                            e.color = bp.carrying;
                            bp.carrying = null;
                            Audio8.sfxSolve();
                            Particles.emit(e.x + 8, e.y + 4, 10, [
                                e.color === 'red' ? '#ff4444' : e.color === 'green' ? '#44ff44' : '#4488ff',
                                '#ffffff', '#ffff88'
                            ], 3, 25);

                            // Check if all pedestals filled
                            const allFilled = this.levelEntities.filter(pe => pe.type === 'pedestal').every(pe => pe.filled);
                            if (allFilled) {
                                // FIRE THE BEAM!
                                bp.beamTimer = 120;
                                bp.beamActive = true;
                                Audio8.sfxLevelClear();
                                this.shakeTimer = 30;
                                this.shakeIntensity = 3;
                            }
                        }
                    }
                }
            }

            // Beam damages boss
            if (bp.beamActive) {
                bp.beamTimer--;
                // Big particle show
                if (this.frame % 2 === 0) {
                    Particles.emit(randInt(20 * TILE, 54 * TILE), randInt(16 * TILE, 20 * TILE),
                        3, ['#ff4444', '#44ff44', '#4488ff', '#ffffff', '#ffff44'], 4, 20);
                }
                // Damage boss continuously
                if (bp.beamTimer % 20 === 0) {
                    const boss = this.levelEntities.find(e => e.type === 'boss' && e.alive);
                    if (boss) {
                        this.bossHP -= 1;
                        boss.hurtTimer = 15;
                        this.shakeTimer = 5;
                        this.shakeIntensity = 2;
                        Particles.emit(boss.x + 14, boss.y + 14, 8,
                            ['#ff3300', '#ffcc00', '#ffffff'], 4, 20);
                    }
                }

                if (bp.beamTimer <= 0) {
                    bp.beamActive = false;
                    // Check if boss is dead
                    if (this.bossHP <= 0) {
                        const boss = this.levelEntities.find(e => e.type === 'boss');
                        if (boss) {
                            boss.alive = false;
                            this.score += 5000;
                            Audio8.sfxLevelClear();
                            this.shakeTimer = 25;
                            this.shakeIntensity = 4;
                            Particles.emit(boss.x + 14, boss.y + 14, 40,
                                ['#ff3300', '#ff6600', '#ffcc00', '#ffffff'], 7, 60);
                            setTimeout(() => { if (!this.levelCompleting) this.completeLevel(); }, 2500);
                        }
                    } else {
                        // Next round!
                        bp.round++;
                        this.bossPhase = Math.min(3, bp.round);
                        // Speed up boss
                        const boss = this.levelEntities.find(e => e.type === 'boss' && e.alive);
                        if (boss) boss.vx = Math.min(2, boss.vx + 0.3);
                        this.spawnPrismRound();
                    }
                }
            }
        }

        // Door check
        const px = Math.floor((p.x + p.w / 2) / TILE);
        const py = Math.floor((p.y + p.h / 2) / TILE);
        if ((this.getTile(px, py) === 5 || this.getTile(px, py - 1) === 5) && !this.levelCompleting) {
            this.completeLevel();
        }

        // Spike check
        for (let cx = Math.floor(p.x / TILE); cx <= Math.floor((p.x + p.w) / TILE); cx++) {
            for (let cy = Math.floor(p.y / TILE); cy <= Math.floor((p.y + p.h) / TILE); cy++) {
                if (this.getTile(cx, cy) === 3 && this.invincibleTimer <= 0 && p.hurtTimer <= 0) {
                    this.playerHurt({ x: cx * TILE, y: cy * TILE });
                }
            }
        }

        // Breakable blocks (hit from below)
        if (p.vy < -1) {
            const headX1 = Math.floor(p.x / TILE);
            const headX2 = Math.floor((p.x + p.w) / TILE);
            const headY = Math.floor(p.y / TILE);
            for (let bx = headX1; bx <= headX2; bx++) {
                if (this.getTile(bx, headY) === 42) {
                    this.levelTiles[headY][bx] = 0;
                    Particles.emit(bx * TILE + 8, headY * TILE + 8, 8, ['#aa9977', '#887766', '#ccbb99'], 3, 20);
                    Audio8.playNote(200, 0.1, 'square', Audio8.sfxGain, 0.15);
                    this.score += 10;
                }
            }
        }
    },

    playerHurt(source) {
        const p = this.player;
        if (this.starPower || p.shieldTimer > 0) return;
        p.hurtTimer = 50;
        this.invincibleTimer = 120;
        p.vy = JUMP_FORCE * 0.4; // gentler knockback
        p.vx = (p.x < source.x) ? -2 : 2; // less aggressive
        this.lives--;
        Audio8.sfxHurt();
        this.shakeTimer = 8; this.shakeIntensity = 2;
        Particles.emit(p.x + 6, p.y + 8, 6, ['#ff0000', '#ff4444'], 2, 20);
        if (this.lives <= 0) {
            p.dead = true; p.vy = JUMP_FORCE * 0.5;
            Audio8.sfxDie(); Audio8.stopMusic();
        }
    },

    playerDie() {
        if (this.lives <= 0) {
            Transition.start(() => { this.state = 'gameover'; Audio8.playMusic('gameover'); });
        } else {
            Transition.start(() => this.startLevel());
        }
    },

    completeLevel() {
        if (this.levelCompleting) return;
        this.levelCompleting = true;
        this.levelsCompleted[this.currentWorld][this.currentLevel] = true;
        this.score += 1000;
        Audio8.stopMusic();
        Audio8.sfxLevelClear();
        this.state = 'levelclear';
        this._levelClearTimer = 200;
    },

    updateLevelClear() {
        if (this._levelClearTimer > 0) {
            this._levelClearTimer--;
        }
        Particles.update();
        // Wait for timer AND allow player to skip with a press after 1 second
        const canAdvance = this._levelClearTimer <= 0 || (this._levelClearTimer < 140 && (Input.jumpJust || Input.actionJust));
        if (canAdvance && !this._levelClearTransitioning) {
            this._levelClearTransitioning = true;
            Transition.start(() => {
                this._levelClearTransitioning = false;
                this.levelCompleting = false;
                const world = WorldData[this.currentWorld];
                if (this.currentLevel < world.levels.length - 1) {
                    this.currentLevel++;
                    this.checkpointX = -1; this.checkpointY = -1;
                    this.state = 'playing';
                    this.startLevel();
                } else {
                    if (this.currentWorld < WorldData.length - 1) {
                        this.worldsUnlocked = Math.max(this.worldsUnlocked, this.currentWorld + 2);
                        this.state = 'worldmap';
                        Audio8.stopMusic();
                    } else {
                        this.state = 'story'; this.storyScene = 'victory'; this.storyIndex = 0;
                    }
                }
            });
        }
    },

    drawLevelClear() {
        this.drawPlaying();
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, GAME_W, GAME_H);
        const level = WorldData[this.currentWorld].levels[this.currentLevel];
        drawText(ctx, 'LEVEL CLEAR!', GAME_W / 2, 60, '#ffcc00', 3, 'center');
        drawText(ctx, level.name, GAME_W / 2, 100, '#ffffff', 1, 'center');
        drawText(ctx, 'SCORE: ' + this.score, GAME_W / 2, 125, '#00ffff', 2, 'center');
        drawText(ctx, 'COINS: ' + this.coins, GAME_W / 2, 155, '#ffcc00', 1, 'center');
        // Show prompt once skippable
        if (this._levelClearTimer < 140 && this.frame % 50 < 30) {
            drawText(ctx, 'PRESS SPACE TO CONTINUE', GAME_W / 2, 185, '#888888', 1, 'center');
        }
        if (this.frame % 12 === 0) {
            Particles.emit(randInt(30, GAME_W - 30), randInt(30, GAME_H - 30), 4, ['#ff3333', '#ffcc00', '#00ff00', '#00ccff', '#ff66ff'], 3, 35);
        }
        Particles.draw(ctx, 0, 0);
    },

    // ---- Collision ----
    getTile(x, y) {
        if (y < 0 || y >= this.levelTiles.length) return 0;
        if (x < 0 || x >= (this.levelTiles[0] || []).length) return 0;
        return this.levelTiles[y][x];
    },
    isSolid(x, y) {
        const t = this.getTile(x, y);
        return t === 1 || t === 10 || t === 21 || t === 42;
    },
    isPlatform(x, y) { return this.getTile(x, y) === 2; },

    collideWithLevel(entity) { this.collideWithLevelH(entity); this.collideWithLevelV(entity, GRAVITY); },

    collideWithLevelH(entity) {
        const e = entity;
        const top = Math.floor(e.y / TILE);
        const bot = Math.floor((e.y + e.h - 1) / TILE);
        if (e.vx > 0) {
            const col = Math.floor((e.x + e.w) / TILE);
            for (let r = top; r <= bot; r++) { if (this.isSolid(col, r)) { e.x = col * TILE - e.w; e.vx = 0; break; } }
        } else if (e.vx < 0) {
            const col = Math.floor(e.x / TILE);
            for (let r = top; r <= bot; r++) { if (this.isSolid(col, r)) { e.x = (col + 1) * TILE; e.vx = 0; break; } }
        }
    },
    collideWithLevelV(entity, grav) {
        const e = entity;
        const left = Math.floor(e.x / TILE);
        const right = Math.floor((e.x + e.w - 1) / TILE);
        const isPlayer = (e === this.player);
        const dropping = isPlayer && e.droppingThrough;

        if (e.vy > 0 || (grav !== undefined && grav < 0 && e.vy > 0)) {
            const row = Math.floor((e.y + e.h) / TILE);
            for (let c = left; c <= right; c++) {
                const solid = this.isSolid(c, row);
                const plat = this.isPlatform(c, row);
                if (dropping) {
                    // While dropping through, skip ALL tiles — we phase through
                    // The drop distance safety limit in updatePlaying() will cancel
                    // the drop state after ~3 tiles, at which point we collide normally
                    continue;
                }
                if (solid || plat) {
                    e.y = row * TILE - e.h;
                    e.vy = 0; e.grounded = true;
                    break;
                }
            }
        } else if (e.vy < 0) {
            const row = Math.floor(e.y / TILE);
            for (let c = left; c <= right; c++) {
                if (this.isSolid(c, row)) { e.y = (row + 1) * TILE; e.vy = 0; break; }
            }
        }
    },

    // ================================================================
    // DRAW
    // ================================================================
    drawPlaying() {
        const world = WorldData[this.currentWorld];
        const level = world.levels[this.currentLevel];
        const p = this.player; if (!p) return;
        let cx = Camera.x, cy = Camera.y;
        if (this.shakeTimer > 0) { cx += randInt(-this.shakeIntensity, this.shakeIntensity); cy += randInt(-this.shakeIntensity, this.shakeIntensity); }

        this.drawBackground(world, level, cx, cy);

        // Gravity zones
        if (level.gravityZones) {
            for (const gz of level.gravityZones) {
                const gx = gz.x * TILE - cx, gy = gz.y * TILE - cy;
                const gw = gz.w * TILE, gh = gz.h * TILE;
                ctx.globalAlpha = 0.1 + Math.sin(this.frame * 0.03) * 0.03;
                ctx.fillStyle = gz.gravity < 0 ? '#ff000044' : '#8844ff';
                ctx.fillRect(gx, gy, gw, gh);
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = gz.gravity < 0 ? '#ff0000' : '#8844ff';
                for (let i = 0; i < gw; i += 12) {
                    if ((Math.floor(i / 12) + Math.floor(this.frame / 10)) % 3 === 0) {
                        ctx.fillRect(gx + i, gy, 4, 1);
                        ctx.fillRect(gx + i, gy + gh - 1, 4, 1);
                    }
                }
                ctx.globalAlpha = 1;
            }
        }

        // Tiles
        const startCol = Math.max(0, Math.floor(cx / TILE));
        const endCol = Math.min((this.levelTiles[0] || []).length, Math.ceil((cx + GAME_W) / TILE) + 1);
        const startRow = Math.max(0, Math.floor(cy / TILE));
        const endRow = Math.min(this.levelTiles.length, Math.ceil((cy + GAME_H) / TILE) + 1);

        for (let r = startRow; r < endRow; r++) {
            for (let c = startCol; c < endCol; c++) {
                const tile = this.getTile(c, r);
                if (tile) this.drawTile(tile, c * TILE - cx, r * TILE - cy, c, r, world);
            }
        }

        // Entities
        for (const e of this.levelEntities) {
            const ex = e.x - cx, ey = e.y - cy;
            if (ex < -20 || ex > GAME_W + 20 || ey < -20 || ey > GAME_H + 20) continue;

            if (e.type === 'coin' && !e.collected) ctx.drawImage(TileSprites.coin(this.frame), ex, ey);
            else if (e.type === 'heart' && !e.collected) ctx.drawImage(TileSprites.heart(), ex, ey);
            else if (e.type === 'key' && !e.collected) ctx.drawImage(TileSprites.key(this.frame), ex, ey);
            else if (e.type === 'star' && !e.collected) ctx.drawImage(TileSprites.star(this.frame), ex, ey);
            else if (e.type === 'powerOrb' && !e.collected) ctx.drawImage(TileSprites.powerOrb(this.frame, e.powerType), ex, ey);
            else if (e.type === 'spring') ctx.drawImage(TileSprites.spring(e.activated > 0 ? 1 : 0), ex, ey);
            else if (e.type === 'checkpoint') ctx.drawImage(TileSprites.checkpoint(this.frame, e.activated), ex, ey);
            else if (e.type === 'portal') ctx.drawImage(TileSprites.portal(this.frame, e.color), ex, ey);
            else if (e.type === 'prism' && !e.collected) ctx.drawImage(BossSprites.prismItem(this.frame, e.color), ex, ey);
            else if (e.type === 'pedestal') ctx.drawImage(BossSprites.pedestal(this.frame, e.color), ex, ey);
            else if (e.type === 'switch') {
                ctx.fillStyle = e.active ? '#00ff00' : '#ff4400';
                ctx.fillRect(ex + 3, ey + 4, 10, 8);
                ctx.fillStyle = e.active ? '#44ff44' : '#ff6633';
                ctx.fillRect(ex + 4, ey + 5, 8, 6);
            }
            else if (e.type === 'enemy' && e.alive) this.drawEnemy(e, ex, ey);
            else if (e.type === 'boss' && e.alive) {
                if (e.hurtTimer > 0 && e.hurtTimer % 6 < 3) continue;
                ctx.drawImage(EnemySprites.entropy(e.frame, this.bossPhase), ex - 2, ey - 1);
            }
            else if (e.type === 'projectile') {
                ctx.fillStyle = e.color || '#ff3300';
                ctx.fillRect(ex, ey, e.w, e.h);
                ctx.fillStyle = '#ffcc00';
                ctx.fillRect(ex + 2, ey + 2, e.w - 4, e.h - 4);
            }
            else if (e.type === 'photon') {
                ctx.drawImage(TileSprites.photon(this.frame), ex, ey);
            }
        }

        // Player
        if (p && (!p.dead || p.y < this.levelH + 50)) {
            const px = Math.round(p.x - cx), py = Math.round(p.y - cy);
            if (this.invincibleTimer > 0 && this.invincibleTimer % 6 < 3 && !this.starPower) {
                // flash
            } else {
                // Drop-through charge indicator
                if (p.dropHoldTimer > 0) {
                    const progress = p.dropHoldTimer / DROP_THROUGH_HOLD;
                    ctx.globalAlpha = 0.4 * progress;
                    ctx.fillStyle = '#ffaa44';
                    // Ring around feet that fills up
                    const barW = Math.floor(p.w * progress);
                    ctx.fillRect(px + (p.w - barW) / 2, py + p.h + 1, barW, 2);
                    ctx.globalAlpha = 1;
                    // Downward arrow particles when close to dropping
                    if (progress > 0.7 && this.frame % 4 === 0) {
                        Particles.emit(p.x + 6, p.y + p.h, 1, ['#ffaa4466'], 0.5, 8, 1);
                    }
                }
                // Shield glow
                if (p.shieldTimer > 0) {
                    ctx.globalAlpha = 0.25 + Math.sin(this.frame * 0.15) * 0.1;
                    ctx.fillStyle = '#44aaff';
                    ctx.fillRect(px - 4, py - 4, p.w + 8, p.h + 8);
                    ctx.globalAlpha = 1;
                }
                // Star glow
                if (this.starPower) {
                    ctx.globalAlpha = 0.2 + Math.sin(this.frame * 0.15) * 0.1;
                    ctx.fillStyle = '#ffff00';
                    ctx.fillRect(px - 3, py - 3, p.w + 6, p.h + 6);
                    ctx.globalAlpha = 1;
                }

                let sprite;
                const flip = p.dir < 0;
                if (p.hurtTimer > 0) sprite = LuxSprites.hurt();
                else if (p.state === 'wallSlide') sprite = LuxSprites.wallSlide(this.frame);
                else if (p.state === 'shoot') sprite = LuxSprites.shootR(p.animFrame);
                else if (p.state === 'dash') sprite = LuxSprites.dashR(p.animFrame);
                else if (p.state === 'float') sprite = LuxSprites.floatR(this.frame);
                else if (p.state === 'jump') sprite = LuxSprites.jumpR();
                else if (p.state === 'fall') sprite = LuxSprites.fallR();
                else if (p.state === 'walk') sprite = LuxSprites.walkR(p.animFrame);
                else sprite = LuxSprites.idleR(this.frame);

                if (flip) { ctx.save(); ctx.scale(-1, 1); ctx.drawImage(sprite, -px - 16, py); ctx.restore(); }
                else ctx.drawImage(sprite, px - 2, py);
            }
        }

        Particles.draw(ctx, cx, cy);
        this.drawHUD();

        // Hint
        if (this.hintTimer > 0) {
            const alpha = this.hintTimer < 80 ? this.hintTimer / 80 : (this.hintTimer > 300 ? (360 - this.hintTimer) / 60 : 1);
            ctx.globalAlpha = alpha * 0.85;
            ctx.fillStyle = '#00000088';
            const lines = this.hintText.split('\n');
            const hh = lines.length * 12 + 12;
            ctx.fillRect(12, GAME_H - hh - 22, GAME_W - 24, hh);
            ctx.globalAlpha = alpha;
            lines.forEach((l, i) => drawText(ctx, l, GAME_W / 2, GAME_H - hh - 14 + i * 12, '#88ddff', 1, 'center'));
            ctx.globalAlpha = 1;
        }

        // Boss HP
        if (this.bossHP > 0) {
            ctx.fillStyle = '#000000'; ctx.fillRect(GAME_W / 2 - 52, 20, 104, 12);
            ctx.fillStyle = '#ff0000'; ctx.fillRect(GAME_W / 2 - 50, 22, (this.bossHP / this.bossMaxHP) * 100, 8);
            drawText(ctx, 'DR. ENTROPY', GAME_W / 2, 14, '#ff4444', 1, 'center');
        }

        // Prism puzzle HUD
        if (this.bossPuzzle && this.bossPuzzle.active && this.bossHP > 0) {
            const bp = this.bossPuzzle;
            // Show which prism you're carrying
            if (bp.carrying) {
                const colors = { red: '#ff4444', green: '#44ff44', blue: '#4488ff' };
                drawText(ctx, 'CARRYING: ' + bp.carrying.toUpperCase() + ' PRISM', GAME_W / 2, 36, colors[bp.carrying], 1, 'center');
                drawText(ctx, 'BRING TO A PEDESTAL!', GAME_W / 2, 46, '#aaaaaa', 1, 'center');
            } else if (!bp.beamActive) {
                // Show which prisms still need collecting
                const uncollected = this.levelEntities.filter(e => e.type === 'prism' && !e.collected);
                const unfilled = this.levelEntities.filter(e => e.type === 'pedestal' && !e.filled);
                if (uncollected.length > 0) {
                    drawText(ctx, 'COLLECT PRISMS: ' + uncollected.map(e => e.color[0].toUpperCase()).join(' '),
                        GAME_W / 2, 36, '#ffcc00', 1, 'center');
                } else if (unfilled.length > 0) {
                    drawText(ctx, 'ALL PRISMS ON PEDESTALS!', GAME_W / 2, 36, '#ffcc00', 1, 'center');
                }
            }
            // Round indicator
            drawText(ctx, 'ROUND ' + bp.round + '/' + bp.roundsToWin, GAME_W - 4, 36, '#888888', 1, 'right');

            // Light beam effect
            if (bp.beamActive) {
                ctx.globalAlpha = 0.6 + Math.sin(this.frame * 0.3) * 0.2;
                // Draw rainbow beam across the arena
                const beamY = 17 * TILE - Camera.y;
                ctx.drawImage(BossSprites.lightBeam(this.frame), 0, beamY - 4);
                ctx.globalAlpha = 1;
                drawText(ctx, 'WHITE LIGHT!', GAME_W / 2, 54, '#ffffff', 2, 'center');
            }
        }

        // Time slow effect
        if (this.timeSlowTimer > 0) {
            ctx.globalAlpha = 0.1;
            ctx.fillStyle = '#44ffaa';
            ctx.fillRect(0, 0, GAME_W, GAME_H);
            ctx.globalAlpha = 1;
            if (this.timeSlowTimer < 60 && this.frame % 8 < 4) {
                // Flashing when about to expire
            } else {
                drawText(ctx, 'TIME SLOW', GAME_W - 4, 46, '#44ffaa', 1, 'right');
            }
        }

        // Magnet active indicator
        if (this.player && this.player.magnetTimer > 0) {
            drawText(ctx, 'MAGNET', GAME_W - 4, 56, '#ffcc00', 1, 'right');
        }

        // Combo
        if (this.comboCount > 1 && this.comboTimer > 0) {
            ctx.globalAlpha = this.comboTimer / 60;
            drawText(ctx, this.comboCount + 'x COMBO!', GAME_W / 2, 58, '#ffcc00', 2, 'center');
            ctx.globalAlpha = 1;
        }
    },

    drawBackground(world, level, cx, cy) {
        const grd = ctx.createLinearGradient(0, 0, 0, GAME_H);
        grd.addColorStop(0, world.bgColor); grd.addColorStop(1, world.bgColor2);
        ctx.fillStyle = grd; ctx.fillRect(0, 0, GAME_W, GAME_H);

        const wi = this.currentWorld;
        if (wi === 0) {
            for (let i = 0; i < 6; i++) {
                const cloudX = ((i * 60 - cx * 0.1 + 200) % (GAME_W + 80)) - 40;
                ctx.fillStyle = '#ffffff22';
                ctx.fillRect(cloudX, 20 + i * 20, 35, 6);
                ctx.fillRect(cloudX + 8, 16 + i * 20, 20, 4);
            }
            // Mountains
            for (let i = 0; i < 4; i++) {
                const mx = ((i * 80 - cx * 0.05 + 100) % (GAME_W + 60)) - 30;
                ctx.fillStyle = '#5577aa22';
                ctx.fillRect(mx, GAME_H - 60, 50, 60);
                ctx.fillRect(mx + 10, GAME_H - 80, 30, 20);
                ctx.fillRect(mx + 18, GAME_H - 90, 14, 10);
            }
        } else if (wi === 1) {
            for (let i = 0; i < 40; i++) {
                const sx = ((i * 43 - cx * 0.05 + 500) % GAME_W);
                const sy = ((i * 67 - cy * 0.03 + 300) % GAME_H);
                ctx.fillStyle = i % 7 === 0 ? '#8888ff' : '#ffffff33';
                ctx.fillRect(sx, sy, 1, 1);
            }
        } else if (wi === 2) {
            for (let i = 0; i < 5; i++) {
                const tx = ((i * 70 - cx * 0.08) % (GAME_W + 40)) - 20;
                ctx.fillStyle = '#112233';
                ctx.fillRect(tx, 80, 4, 160);
                ctx.fillRect(tx - 8, 80, 20, 3);
                ctx.fillStyle = '#ffcc0011';
                ctx.fillRect(tx + 12, 81, 58, 1);
            }
        } else if (wi === 3) {
            for (let i = 0; i < 10; i++) {
                const ix = ((i * 35 - cx * 0.06) % GAME_W);
                ctx.fillStyle = '#88ccee08';
                ctx.fillRect(ix, 0, 2, 25 + (i * 7) % 20);
            }
        } else if (wi === 4) {
            ctx.fillStyle = '#ff220008';
            ctx.fillRect(0, GAME_H - 30, GAME_W, 30);
            for (let i = 0; i < 8; i++) {
                const ex = (i * 33 + this.frame * 0.3) % GAME_W;
                const ey = GAME_H - (this.frame * 0.2 + i * 35) % GAME_H;
                ctx.fillStyle = '#ff660022';
                ctx.fillRect(ex, ey, 2, 2);
            }
        }
    },

    drawTile(tile, tx, ty, col, row, world) {
        let sprite;
        switch (tile) {
            case 1: {
                const above = this.getTile(col, row - 1);
                sprite = (above === 0 || above === 2 || above === 4 || above === 5 || above === 7 || above === 40)
                    ? TileSprites[world.tileGround]() : (TileSprites[world.tileDirt] ? TileSprites[world.tileDirt]() : TileSprites[world.tileGround]());
                break;
            }
            case 2: sprite = TileSprites[world.tilePlatform] ? TileSprites[world.tilePlatform](this.frame) : TileSprites.platform_w1(); break;
            case 3: sprite = TileSprites.spike(); break;
            case 5: sprite = TileSprites.door(this.frame); break;
            case 10: sprite = TileSprites.lockedDoor(); break;
            case 21:
                ctx.fillStyle = '#ff440066'; ctx.fillRect(tx, ty, TILE, TILE);
                ctx.fillStyle = '#ff880033'; ctx.fillRect(tx + 2, ty + 2, TILE - 4, TILE - 4);
                if (this.frame % 8 < 4) { ctx.fillStyle = '#ffcc00'; ctx.fillRect(tx + 4, ty + (this.frame % TILE), 8, 2); }
                return;
            case 40: sprite = TileSprites.vine(); break;
            case 41: sprite = TileSprites.water(this.frame); break;
            case 42: sprite = TileSprites.breakable(); break;
            case 43: sprite = TileSprites.sign(); break;
            default:
                ctx.fillStyle = '#44444444'; ctx.fillRect(tx, ty, TILE, TILE); return;
        }
        if (sprite) ctx.drawImage(sprite, tx, ty);
    },

    drawEnemy(e, ex, ey) {
        let sprite;
        switch (e.enemyType) {
            case 'glowbug': sprite = EnemySprites.glowbug(e.frame, e.dir); break;
            case 'mushroom': sprite = EnemySprites.mushroom(e.frame, e.dir); break;
            case 'thornball': sprite = EnemySprites.thornball(e.frame); break;
            case 'rockroller': sprite = EnemySprites.rockroller(e.frame); break;
            case 'astro': sprite = EnemySprites.astro(e.frame, e.dir); break;
            case 'spark': sprite = EnemySprites.spark(e.frame); break;
            case 'coilbot': sprite = EnemySprites.coilbot(e.frame, e.dir); break;
            case 'frostGhost': sprite = EnemySprites.frostGhost(e.frame, e.dir); break;
            case 'iceBat': sprite = EnemySprites.iceBat(e.frame, e.dir); break;
            case 'drone': sprite = EnemySprites.drone(e.frame); break;
            case 'chaosOrb': sprite = EnemySprites.chaosOrb(e.frame); break;
            case 'orbiter': sprite = EnemySprites.orbiter(e.frame, e.dir); break;
            case 'spinner': sprite = EnemySprites.spinner(e.frame); break;
            default: ctx.fillStyle = '#ff0000'; ctx.fillRect(ex, ey, e.w, e.h); return;
        }
        if (sprite) ctx.drawImage(sprite, ex, ey);
    },

    drawHUD() {
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, GAME_W, 14);
        for (let i = 0; i < this.maxLives; i++) {
            ctx.drawImage(i < this.lives ? HUDSprites.heartSmall() : HUDSprites.heartEmpty(), 4 + i * 10, 3);
        }
        ctx.drawImage(HUDSprites.coinSmall(), 60, 3);
        drawText(ctx, 'x' + this.coins, 70, 4, '#ffcc00', 1);
        if (this.keys > 0) drawText(ctx, 'KEY:' + this.keys, 108, 4, '#FFD700', 1);
        // Power indicator
        if (this.power) {
            ctx.drawImage(HUDSprites.powerIcon(this.power), 140, 3);
            if (this.powerCooldown > 0) {
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = '#000000';
                ctx.fillRect(140, 3, 8, Math.floor((this.powerCooldown / 300) * 8));
                ctx.globalAlpha = 1;
            }
        }
        drawText(ctx, '' + this.score, GAME_W - 4, 4, '#ffffff', 1, 'right');
        drawText(ctx, (this.currentWorld + 1) + '-' + (this.currentLevel + 1), GAME_W / 2, 4, '#666666', 1, 'center');
    },

    // ================================================================
    // PAUSE
    // ================================================================
    updatePaused() {
        if (Input.pauseJust) { this.state = 'playing'; Audio8.sfxSelect(); return; }
        if (Input.up && !this._pCd) { this.menuSelection = Math.max(0, this.menuSelection - 1); Audio8.sfxSelect(); this._pCd = 12; }
        if (Input.down && !this._pCd) { this.menuSelection = Math.min(2, this.menuSelection + 1); Audio8.sfxSelect(); this._pCd = 12; }
        if (this._pCd > 0) this._pCd--;
        if (Input.jumpJust || Input.actionJust) {
            Audio8.sfxConfirm();
            if (this.menuSelection === 0) this.state = 'playing';
            else if (this.menuSelection === 1) Transition.start(() => { this.checkpointX = -1; this.checkpointY = -1; this.state = 'playing'; this.startLevel(); });
            else Transition.start(() => { this.state = 'worldmap'; Audio8.stopMusic(); });
        }
    },
    drawPaused() {
        this.drawPlaying();
        ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(0, 0, GAME_W, GAME_H);
        drawText(ctx, 'PAUSED', GAME_W / 2, 60, '#ffffff', 3, 'center');
        ['RESUME', 'RESTART LEVEL', 'QUIT TO MAP'].forEach((opt, i) => {
            drawText(ctx, (i === this.menuSelection ? '> ' : '  ') + opt, GAME_W / 2, 110 + i * 22, i === this.menuSelection ? '#ffcc00' : '#888888', 1, 'center');
        });
        if (this.power) drawText(ctx, 'POWER: ' + this.power.toUpperCase(), GAME_W / 2, 185, '#88ccff', 1, 'center');
        drawText(ctx, 'ESC/P TO RESUME', GAME_W / 2, 210, '#444444', 1, 'center');
    },

    // ================================================================
    // GAME OVER / VICTORY
    // ================================================================
    updateGameOver() {
        if (Input.jumpJust || Input.actionJust) {
            Audio8.sfxConfirm();
            Transition.start(() => { Audio8.stopMusic(); this.reset(); this.state = 'title'; });
        }
    },
    drawGameOver() {
        ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, GAME_W, GAME_H);
        drawText(ctx, 'GAME OVER', GAME_W / 2, 60, '#ff4444', 3, 'center');
        ctx.drawImage(LuxSprites.hurt(), GAME_W / 2 - 8, 100);
        drawText(ctx, 'SCORE: ' + this.score, GAME_W / 2, 140, '#ffffff', 1, 'center');
        drawText(ctx, 'COINS: ' + this.coins, GAME_W / 2, 158, '#ffcc00', 1, 'center');
        if (this.frame % 50 < 30) drawText(ctx, 'PRESS SPACE', GAME_W / 2, 200, '#888888', 1, 'center');
    },

    updateVictory() {
        Audio8.playMusic('victory');
        if (Input.jumpJust || Input.actionJust) Transition.start(() => { Audio8.stopMusic(); this.reset(); this.state = 'title'; });
        if (this.frame % 10 === 0) Particles.emit(randInt(20, GAME_W - 20), randInt(20, GAME_H - 20), 3, ['#ff3333', '#ffcc00', '#00ff00', '#00ccff', '#ff66ff'], 2.5, 40);
        Particles.update();
    },
    drawVictory() {
        ctx.fillStyle = '#000022'; ctx.fillRect(0, 0, GAME_W, GAME_H);
        Particles.draw(ctx, 0, 0);
        drawText(ctx, 'CONGRATULATIONS!', GAME_W / 2, 30, '#ffcc00', 2, 'center');
        drawText(ctx, 'PROFESSOR HELIX IS SAVED!', GAME_W / 2, 55, '#ffffff', 1, 'center');
        ctx.drawImage(LuxSprites.idleR(this.frame), GAME_W / 2 - 8, 80);
        drawText(ctx, 'FINAL SCORE', GAME_W / 2, 115, '#888888', 1, 'center');
        drawText(ctx, '' + this.score, GAME_W / 2, 132, '#00ffff', 3, 'center');
        ['OPTICS', 'GRAVITY', 'ELECTRICITY', 'THERMO', 'ENTROPY'].forEach((s, i) => {
            drawText(ctx, '* ' + s, 25 + (i % 3) * 78, 175 + Math.floor(i / 3) * 14, '#00ff88', 1);
        });
        if (this.frame % 50 < 30) drawText(ctx, 'PRESS SPACE', GAME_W / 2, GAME_H - 15, '#555555', 1, 'center');
    },

    // ================================================================
    // MINI GAME
    // ================================================================
    startMiniGame(type) {
        this.state = 'minigame'; this.miniGameType = type;
        if (type === 'quiz') {
            this.miniGameState = { questions: [...MiniGames.scienceQuiz.questions].sort(() => Math.random() - 0.5).slice(0, 5), currentQ: 0, selected: 0, score: 0, answered: false, answerTimer: 0, complete: false };
        }
    },
    updateMiniGame() {
        if (!this.miniGameState) return;
        const s = this.miniGameState;
        if (s.complete) { if (Input.jumpJust || Input.actionJust) { this.score += s.score * 100; this.state = 'playing'; } return; }
        if (s.answered) { s.answerTimer--; if (s.answerTimer <= 0) { s.currentQ++; s.selected = 0; s.answered = false; if (s.currentQ >= s.questions.length) s.complete = true; } return; }
        if (Input.up && !this._mgCd) { s.selected = Math.max(0, s.selected - 1); Audio8.sfxSelect(); this._mgCd = 10; }
        if (Input.down && !this._mgCd) { s.selected = Math.min(3, s.selected + 1); Audio8.sfxSelect(); this._mgCd = 10; }
        if (this._mgCd > 0) this._mgCd--;
        if (Input.jumpJust || Input.actionJust) {
            s.answered = true; s.answerTimer = 60;
            if (s.selected === s.questions[s.currentQ].correct) { s.score++; Audio8.sfxCoin(); } else Audio8.sfxHurt();
        }
    },
    drawMiniGame() {
        ctx.fillStyle = '#001122'; ctx.fillRect(0, 0, GAME_W, GAME_H);
        if (!this.miniGameState) return;
        const s = this.miniGameState;
        drawText(ctx, 'SCIENCE QUIZ', GAME_W / 2, 10, '#ffcc00', 2, 'center');
        drawText(ctx, (s.currentQ + 1) + '/' + s.questions.length, GAME_W / 2, 30, '#888888', 1, 'center');
        if (s.complete) {
            drawText(ctx, 'COMPLETE!', GAME_W / 2, 80, '#00ff00', 2, 'center');
            drawText(ctx, s.score + '/' + s.questions.length, GAME_W / 2, 110, '#ffffff', 1, 'center');
            if (this.frame % 50 < 30) drawText(ctx, 'PRESS SPACE', GAME_W / 2, 160, '#888888', 1, 'center');
            return;
        }
        const q = s.questions[s.currentQ];
        q.q.split('\n').forEach((l, i) => drawText(ctx, l, GAME_W / 2, 50 + i * 14, '#ffffff', 1, 'center'));
        q.answers.forEach((a, i) => {
            const c = s.answered ? (i === q.correct ? '#00ff00' : (i === s.selected ? '#ff0000' : '#444444')) : (i === s.selected ? '#ffcc00' : '#888888');
            drawText(ctx, (i === s.selected ? '> ' : '  ') + a, 40, 100 + i * 22, c, 1);
        });
    }
};

// ---- Boot ----
window.addEventListener('load', () => Game.init());
['click', 'touchstart', 'keydown'].forEach(evt => document.addEventListener(evt, () => Audio8.resume(), { once: false }));
