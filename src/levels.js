// ============================================================
// AXIOM - Level Data & World Definitions
// Redesigned: 5x bigger, Zelda exploration, portals, powers
// ============================================================

// Tile types:
// 0=air, 1=ground, 2=platform(one-way), 3=spike, 4=coin, 5=door(exit)
// 6=spring, 7=checkpoint, 8=heart(1up), 9=key, 10=locked_door
// P=portal_blue, Q=portal_orange, R=portal_green
// D=power_dash, S=power_shield, F=power_float
// B=breakable_block, V=vine/ladder, W=water
// !=sign(hint), T=trap_door(falls when stepped on)
// 21=circuit_gate
// Enemies defined separately

// Helper: generate a row string of given length filled with a char
function row(len, ch) { return ch.repeat(len); }

// Helper: place a pattern within a row
function placeInRow(base, col, pattern) {
    const arr = base.split('');
    for (let i = 0; i < pattern.length && col + i < arr.length; i++) {
        arr[col + i] = pattern[i];
    }
    return arr.join('');
}

const WorldData = [
    // ======== WORLD 1: PRISM PEAKS (Optics & Light) ========
    {
        name: 'PRISM PEAKS',
        subtitle: 'The Science of Light',
        description: 'Light has gone haywire! Learn about\nrefraction and color to restore\nthe spectrum.',
        bgColor: '#88bbee',
        bgColor2: '#5588cc',
        musicTrack: 'world1',
        tileGround: 'ground_w1',
        tileDirt: 'dirt_w1',
        tilePlatform: 'platform_w1',
        scienceConcept: 'OPTICS',
        scienceLesson: 'Light refracts - it bends through\ndifferent materials. Crystals here\nblock paths. Find hidden portals\nthat link like light through a prism.\nExplore caves - light reveals secrets!',
        levels: [
            // Level 1-1: Big exploration level
            {
                name: '1-1: FIRST LIGHT',
                width: 80, height: 30,
                playerStart: [2, 26],
                map: (function() {
                    const W = 80, H = 30;
                    const m = [];
                    for (let y = 0; y < H; y++) m[y] = row(W, '0');
                    // Ground floor
                    for (let y = 27; y < H; y++) for (let x = 0; x < W; x++) m[y] = placeInRow(m[y], x, '1');
                    // Starting area - gentle platforms
                    m[26] = placeInRow(m[26], 0, '11111111');
                    m[24] = placeInRow(m[24], 6, '0004000');
                    m[23] = placeInRow(m[23], 10, '22222');
                    m[22] = placeInRow(m[22], 5, '00400');
                    // First platforms section
                    m[26] = placeInRow(m[26], 10, '11111');
                    m[24] = placeInRow(m[24], 16, '222');
                    m[22] = placeInRow(m[22], 13, '00040');
                    m[26] = placeInRow(m[26], 18, '111111111');
                    // Cave area with vine
                    m[26] = placeInRow(m[26], 28, '1111111111');
                    m[25] = placeInRow(m[25], 28, '1000000001');
                    m[24] = placeInRow(m[24], 28, '1000400001');
                    m[23] = placeInRow(m[23], 28, '10V0000001');
                    m[22] = placeInRow(m[22], 28, '10V0000091');
                    m[21] = placeInRow(m[21], 28, '10V0222001');
                    m[20] = placeInRow(m[20], 28, '10V0000001');
                    m[19] = placeInRow(m[19], 28, '1111111111');
                    // Upper route with coins
                    m[20] = placeInRow(m[20], 14, '2222');
                    m[18] = placeInRow(m[18], 18, '0440');
                    m[17] = placeInRow(m[17], 17, '222222');
                    m[15] = placeInRow(m[15], 22, '0440');
                    m[14] = placeInRow(m[14], 21, '222222');
                    m[12] = placeInRow(m[12], 25, '0040');
                    m[11] = placeInRow(m[11], 26, '222');
                    // Portal area (upper path)
                    m[10] = placeInRow(m[10], 28, '000P00');
                    m[9] = placeInRow(m[9], 27, '11111111');
                    // Middle section - mushroom garden
                    m[26] = placeInRow(m[26], 40, '111111111111111111');
                    m[24] = placeInRow(m[24], 42, '222');
                    m[24] = placeInRow(m[24], 48, '222');
                    m[22] = placeInRow(m[22], 45, '040');
                    m[22] = placeInRow(m[22], 50, '222');
                    m[20] = placeInRow(m[20], 44, '04040');
                    m[19] = placeInRow(m[19], 42, '111111111');
                    // Checkpoint
                    m[25] = placeInRow(m[25], 52, '7');
                    // Tricky platforming section
                    m[26] = placeInRow(m[26], 55, '111');
                    m[24] = placeInRow(m[24], 56, '0T0');
                    m[23] = placeInRow(m[23], 58, '222');
                    m[22] = placeInRow(m[22], 60, '040');
                    m[21] = placeInRow(m[21], 61, '222');
                    m[20] = placeInRow(m[20], 55, '00000060000');
                    m[19] = placeInRow(m[19], 55, '11111111111');
                    m[26] = placeInRow(m[26], 60, '1111111111111111');
                    // Spring jump section
                    m[25] = placeInRow(m[25], 64, '6');
                    m[16] = placeInRow(m[16], 62, '04440');
                    m[15] = placeInRow(m[15], 62, '11111');
                    // Upper path with power orb
                    m[13] = placeInRow(m[13], 64, '22222');
                    m[11] = placeInRow(m[11], 66, '0D0');
                    m[10] = placeInRow(m[10], 65, '11111');
                    // Portal exit (connects to upper portal)
                    m[10] = placeInRow(m[10], 60, '0Q000');
                    m[9] = placeInRow(m[9], 59, '1111111');
                    // Final section - locked door puzzle
                    m[26] = placeInRow(m[26], 70, '1111111111');
                    m[25] = placeInRow(m[25], 73, '00040');
                    m[24] = placeInRow(m[24], 72, '222222');
                    m[22] = placeInRow(m[22], 74, '040');
                    m[21] = placeInRow(m[21], 73, '11111');
                    // Exit door
                    m[25] = placeInRow(m[25], 78, '5');
                    m[26] = placeInRow(m[26], 77, '111');
                    return m;
                })(),
                enemies: [
                    { type: 'mushroom', x: 14, y: 25, patrol: 3 },
                    { type: 'glowbug', x: 20, y: 20, patrol: 5 },
                    { type: 'mushroom', x: 42, y: 25, patrol: 4 },
                    { type: 'mushroom', x: 48, y: 25, patrol: 3 },
                    { type: 'glowbug', x: 44, y: 18, patrol: 4 },
                    { type: 'thornball', x: 56, y: 18, patrol: 3, bounce: true },
                    { type: 'mushroom', x: 62, y: 25, patrol: 4 },
                    { type: 'glowbug', x: 66, y: 14, patrol: 3 },
                    { type: 'mushroom', x: 72, y: 25, patrol: 3 },
                    { type: 'thornball', x: 75, y: 25, patrol: 2, bounce: true },
                ],
                portals: [
                    { id: 'A', x: 31, y: 10, color: 'blue', target: 'B' },
                    { id: 'B', x: 60, y: 10, color: 'orange', target: 'A' },
                ],
                hint: 'X = PHOTON BLASTER to zap enemies!\nJUMP twice in the air. WALL SLIDE\nby pressing into walls. Explore!',
            },
            // Level 1-2
            {
                name: '1-2: CRYSTAL CAVES',
                width: 100, height: 30,
                playerStart: [2, 26],
                map: (function() {
                    const W = 100, H = 30;
                    const m = [];
                    for (let y = 0; y < H; y++) m[y] = row(W, '0');
                    // Ground
                    for (let y = 27; y < H; y++) for (let x = 0; x < W; x++) m[y] = placeInRow(m[y], x, '1');
                    // Starting
                    m[26] = placeInRow(m[26], 0, '111111111111');
                    m[24] = placeInRow(m[24], 4, '044');
                    m[23] = placeInRow(m[23], 8, '22222');
                    // Open field with enemies
                    m[26] = placeInRow(m[26], 14, '11111111111111111');
                    m[24] = placeInRow(m[24], 18, '0440');
                    m[22] = placeInRow(m[22], 16, '222');
                    m[22] = placeInRow(m[22], 22, '222');
                    m[20] = placeInRow(m[20], 19, '040');
                    // Cave entrance (go down)
                    m[26] = placeInRow(m[26], 30, '10000000001');
                    m[25] = placeInRow(m[25], 30, '10000000001');
                    for (let y = 19; y < 26; y++) {
                        m[y] = placeInRow(m[y], 30, '1');
                        m[y] = placeInRow(m[y], 40, '1');
                    }
                    m[19] = placeInRow(m[19], 30, '11111111111');
                    // Inside cave
                    m[25] = placeInRow(m[25], 31, 'V');
                    m[24] = placeInRow(m[24], 31, 'V');
                    m[23] = placeInRow(m[23], 31, 'V');
                    m[22] = placeInRow(m[22], 31, 'V');
                    m[21] = placeInRow(m[21], 31, 'V');
                    m[20] = placeInRow(m[20], 31, 'V');
                    m[22] = placeInRow(m[22], 33, '04040');
                    m[24] = placeInRow(m[24], 35, '0080');
                    m[21] = placeInRow(m[21], 35, '22222');
                    // Upper cave path
                    m[20] = placeInRow(m[20], 33, '0000P00');
                    // Continue right
                    m[26] = placeInRow(m[26], 42, '11111111111111111111');
                    m[24] = placeInRow(m[24], 44, '222');
                    m[24] = placeInRow(m[24], 50, '222');
                    m[22] = placeInRow(m[22], 47, '0440');
                    m[22] = placeInRow(m[22], 53, '22222');
                    m[20] = placeInRow(m[20], 50, '040');
                    // Checkpoint
                    m[25] = placeInRow(m[25], 55, '7');
                    // Breakable blocks hiding path
                    m[26] = placeInRow(m[26], 58, 'BBBBB');
                    m[25] = placeInRow(m[25], 58, 'B000B');
                    m[24] = placeInRow(m[24], 58, 'B0F0B');
                    m[23] = placeInRow(m[23], 58, 'BBBBB');
                    // Big platforming section
                    m[26] = placeInRow(m[26], 64, '1111111111111111111111111111111111111');
                    m[24] = placeInRow(m[24], 66, '222');
                    m[22] = placeInRow(m[22], 70, '040');
                    m[21] = placeInRow(m[21], 69, '22222');
                    m[19] = placeInRow(m[19], 73, '040');
                    m[18] = placeInRow(m[18], 72, '22222');
                    m[16] = placeInRow(m[16], 76, '04040');
                    m[15] = placeInRow(m[15], 75, '1111111');
                    // Portal from cave
                    m[15] = placeInRow(m[15], 84, '0Q0');
                    m[14] = placeInRow(m[14], 83, '11111');
                    // Spring section
                    m[25] = placeInRow(m[25], 82, '6');
                    m[25] = placeInRow(m[25], 88, '6');
                    m[17] = placeInRow(m[17], 82, '04440');
                    m[16] = placeInRow(m[16], 82, '11111');
                    m[15] = placeInRow(m[15], 88, '04440');
                    m[14] = placeInRow(m[14], 88, '11111');
                    // Final puzzle - keys and locked door
                    m[26] = placeInRow(m[26], 92, '11111111');
                    m[24] = placeInRow(m[24], 94, '040');
                    m[23] = placeInRow(m[23], 93, '11111');
                    m[22] = placeInRow(m[22], 95, '9');
                    // Exit
                    m[25] = placeInRow(m[25], 98, '5');
                    return m;
                })(),
                enemies: [
                    { type: 'mushroom', x: 16, y: 25, patrol: 4 },
                    { type: 'mushroom', x: 22, y: 25, patrol: 3 },
                    { type: 'glowbug', x: 20, y: 19, patrol: 5 },
                    { type: 'thornball', x: 35, y: 23, patrol: 2, bounce: true },
                    { type: 'orbiter', x: 40, y: 20, patrol: 3, flying: true },
                    { type: 'mushroom', x: 44, y: 25, patrol: 4 },
                    { type: 'glowbug', x: 50, y: 20, patrol: 4 },
                    { type: 'spinner', x: 58, y: 22, patrol: 0, flying: true },
                    { type: 'mushroom', x: 54, y: 25, patrol: 3 },
                    { type: 'thornball', x: 66, y: 25, patrol: 5, bounce: true },
                    { type: 'orbiter', x: 70, y: 18, patrol: 4, flying: true },
                    { type: 'mushroom', x: 72, y: 25, patrol: 3 },
                    { type: 'glowbug', x: 76, y: 16, patrol: 4 },
                    { type: 'spinner', x: 80, y: 20, patrol: 0, flying: true },
                    { type: 'mushroom', x: 84, y: 25, patrol: 4 },
                    { type: 'glowbug', x: 90, y: 22, patrol: 3 },
                    { type: 'mushroom', x: 94, y: 25, patrol: 2 },
                ],
                portals: [
                    { id: 'A', x: 37, y: 20, color: 'blue', target: 'B' },
                    { id: 'B', x: 85, y: 15, color: 'orange', target: 'A' },
                ],
                hint: 'Explore caves for secrets!\nBreak brown blocks from below.',
            },
            // Level 1-3
            {
                name: '1-3: SPECTRUM GUARDIAN',
                width: 60, height: 30,
                playerStart: [2, 26],
                map: (function() {
                    const W = 60, H = 30;
                    const m = [];
                    for (let y = 0; y < H; y++) m[y] = row(W, '0');
                    for (let y = 27; y < H; y++) for (let x = 0; x < W; x++) m[y] = placeInRow(m[y], x, '1');
                    // Approach area
                    m[26] = placeInRow(m[26], 0, '11111111111111111111');
                    m[24] = placeInRow(m[24], 4, '2222');
                    m[22] = placeInRow(m[22], 8, '040');
                    m[24] = placeInRow(m[24], 14, '0S0');
                    m[23] = placeInRow(m[23], 13, '11111');
                    m[25] = placeInRow(m[25], 18, '7');
                    // Boss arena - open entrance on left side
                    m[26] = placeInRow(m[26], 20, '11111111111111111111111111111111111');
                    // Left wall with entrance gap (rows 24-26 open for walking in)
                    for (let y = 15; y < 24; y++) {
                        m[y] = placeInRow(m[y], 20, '1');
                    }
                    // Right wall solid + exit door
                    for (let y = 15; y < 27; y++) {
                        m[y] = placeInRow(m[y], 54, '1');
                    }
                    m[15] = placeInRow(m[15], 20, '11111111111111111111111111111111111');
                    // Arena platforms — prisms sit ON these
                    // Ground level
                    m[24] = placeInRow(m[24], 23, '22222');   // RED prism here
                    m[24] = placeInRow(m[24], 33, '222222');  // pedestals below
                    m[24] = placeInRow(m[24], 45, '22222');
                    // Mid level
                    m[22] = placeInRow(m[22], 26, '2222');
                    m[22] = placeInRow(m[22], 35, '22222');
                    m[22] = placeInRow(m[22], 42, '22222');   // GREEN prism here
                    // Upper level
                    m[20] = placeInRow(m[20], 29, '2222');    // BLUE prism here
                    m[20] = placeInRow(m[20], 38, '2222');
                    // Top platforms
                    m[18] = placeInRow(m[18], 32, '222222');
                    // Exit
                    m[25] = placeInRow(m[25], 53, '5');
                    return m;
                })(),
                isBoss: true,
                bossType: 'entropy',
                bossPuzzle: {
                    type: 'prism',
                    prisms: [
                        { color: 'red', x: 25, y: 23 },   // on row 24 platform
                        { color: 'green', x: 44, y: 21 }, // on row 22 platform
                        { color: 'blue', x: 31, y: 19 },  // on row 20 platform
                    ],
                    pedestals: [
                        { x: 35, y: 25, color: null },
                        { x: 37, y: 25, color: null },
                        { x: 39, y: 25, color: null },
                    ],
                    roundsToWin: 3,
                },
                enemies: [
                    { type: 'orbiter', x: 30, y: 22, patrol: 3, flying: true },
                    { type: 'orbiter', x: 44, y: 20, patrol: 3, flying: true },
                ],
                hint: 'Collect R, G, B PRISMS from platforms.\nPlace on pedestals to make WHITE LIGHT!\nShoot enemies with X. 3 rounds to win!',
            }
        ]
    },

    // ======== WORLD 2: GRAVITY GORGE ========
    {
        name: 'GRAVITY GORGE',
        subtitle: 'The Science of Motion',
        description: 'Gravity is unstable! Master momentum\nand motion. Purple zones = low gravity.\nRed zones = reverse gravity!',
        bgColor: '#110022',
        bgColor2: '#220044',
        musicTrack: 'world2',
        tileGround: 'ground_w2',
        tileDirt: 'dirt_w1',
        tilePlatform: 'float_w2',
        scienceConcept: 'GRAVITY & MOMENTUM',
        scienceLesson: 'Gravity pulls at 9.8m/s2 on Earth.\nPurple zones here have LOW gravity -\nyou jump higher but drift more!\nRed zones REVERSE gravity - you\nfall UP! Use momentum to cross gaps.',
        levels: [
            {
                name: '2-1: ZERO POINT',
                width: 80, height: 30,
                playerStart: [2, 26],
                gravityZones: [
                    { x: 20, y: 5, w: 15, h: 22, gravity: 0.08 },
                    { x: 50, y: 5, w: 10, h: 22, gravity: -0.15 },
                ],
                map: (function() {
                    const W = 80, H = 30;
                    const m = [];
                    for (let y = 0; y < H; y++) m[y] = row(W, '0');
                    for (let y = 27; y < H; y++) for (let x = 0; x < W; x++) m[y] = placeInRow(m[y], x, '1');
                    // Starting area - connected ground, gentle steps
                    m[26] = placeInRow(m[26], 0, '11111111111111111111');
                    m[24] = placeInRow(m[24], 4, '04440');
                    m[23] = placeInRow(m[23], 7, '2222222');
                    m[22] = placeInRow(m[22], 11, '040');
                    m[25] = placeInRow(m[25], 15, '2222');
                    // Low gravity zone (big open area) - ground connects
                    m[26] = placeInRow(m[26], 20, '111111111111111');
                    m[5] = placeInRow(m[5], 20, '111111111111111');
                    m[22] = placeInRow(m[22], 20, '222');
                    m[18] = placeInRow(m[18], 22, '2222');
                    m[15] = placeInRow(m[15], 24, '2222');
                    m[12] = placeInRow(m[12], 26, '04040');
                    m[11] = placeInRow(m[11], 25, '2222222');
                    m[20] = placeInRow(m[20], 24, '222');
                    m[9] = placeInRow(m[9], 28, '2222');
                    m[7] = placeInRow(m[7], 30, '0M0');
                    m[6] = placeInRow(m[6], 29, '11111');
                    // Bridge to normal section - stepping stones
                    m[26] = placeInRow(m[26], 35, '1111111111111111');
                    m[24] = placeInRow(m[24], 36, '2222');
                    m[25] = placeInRow(m[25], 42, '7');
                    m[22] = placeInRow(m[22], 40, '2222');
                    m[20] = placeInRow(m[20], 44, '0440');
                    m[19] = placeInRow(m[19], 43, '111111');
                    // Reverse gravity zone - with more platforms
                    m[26] = placeInRow(m[26], 50, '1111111111');
                    m[5] = placeInRow(m[5], 50, '1111111111');
                    m[22] = placeInRow(m[22], 51, '222');
                    m[16] = placeInRow(m[16], 52, '22222');
                    m[12] = placeInRow(m[12], 53, '22222');
                    m[20] = placeInRow(m[20], 54, '222');
                    m[8] = placeInRow(m[8], 55, '0440');
                    // Exit area - more stepping stones
                    m[26] = placeInRow(m[26], 62, '111111111111111111');
                    m[24] = placeInRow(m[24], 63, '2222');
                    m[22] = placeInRow(m[22], 66, '04040');
                    m[21] = placeInRow(m[21], 65, '2222222');
                    m[19] = placeInRow(m[19], 70, '0440');
                    m[18] = placeInRow(m[18], 69, '111111');
                    m[25] = placeInRow(m[25], 78, '5');
                    return m;
                })(),
                enemies: [
                    { type: 'astro', x: 24, y: 18, patrol: 5, flying: true },
                    { type: 'rockroller', x: 26, y: 25, patrol: 4 },
                    { type: 'astro', x: 30, y: 12, patrol: 4, flying: true },
                    { type: 'rockroller', x: 40, y: 25, patrol: 3 },
                    { type: 'astro', x: 54, y: 10, patrol: 5, flying: true },
                    { type: 'rockroller', x: 66, y: 25, patrol: 4 },
                    { type: 'astro', x: 70, y: 18, patrol: 3, flying: true },
                ],
                hint: 'Purple zones = LOW gravity!\nRed zones = REVERSE gravity!\nUse momentum wisely.',
            },
            {
                name: '2-2: FREEFALL',
                width: 90, height: 30,
                playerStart: [2, 26],
                gravityZones: [
                    { x: 25, y: 0, w: 10, h: 30, gravity: 0.06 },
                    { x: 50, y: 0, w: 12, h: 30, gravity: -0.12 },
                ],
                map: (function() {
                    const W = 90, H = 30;
                    const m = [];
                    for (let y = 0; y < H; y++) m[y] = row(W, '0');
                    for (let y = 27; y < H; y++) for (let x = 0; x < W; x++) m[y] = placeInRow(m[y], x, '1');
                    m[26] = placeInRow(m[26], 0, '11111111111111111111111111');
                    m[24] = placeInRow(m[24], 4, '222');
                    m[22] = placeInRow(m[22], 8, '0440');
                    m[21] = placeInRow(m[21], 12, '22222');
                    m[19] = placeInRow(m[19], 16, '040');
                    m[18] = placeInRow(m[18], 18, '22222');
                    // Low-G zone
                    m[26] = placeInRow(m[26], 25, '1111111111');
                    m[4] = placeInRow(m[4], 25, '1111111111');
                    m[15] = placeInRow(m[15], 27, '222');
                    m[10] = placeInRow(m[10], 29, '04040');
                    m[9] = placeInRow(m[9], 28, '22222');
                    m[20] = placeInRow(m[20], 30, '222');
                    m[7] = placeInRow(m[7], 31, 'P');
                    m[6] = placeInRow(m[6], 30, '111');
                    // Mid section
                    m[26] = placeInRow(m[26], 36, '11111111111111');
                    m[25] = placeInRow(m[25], 42, '7');
                    m[24] = placeInRow(m[24], 38, '222');
                    m[22] = placeInRow(m[22], 42, '222');
                    m[20] = placeInRow(m[20], 46, '040');
                    // Reverse-G zone
                    m[26] = placeInRow(m[26], 50, '111111111111');
                    m[4] = placeInRow(m[4], 50, '111111111111');
                    m[12] = placeInRow(m[12], 52, '22222');
                    m[20] = placeInRow(m[20], 54, '040');
                    m[8] = placeInRow(m[8], 56, '0440');
                    m[16] = placeInRow(m[16], 53, '222');
                    // Exit section
                    m[26] = placeInRow(m[26], 64, '11111111111111111111111111');
                    m[24] = placeInRow(m[24], 66, '222');
                    m[22] = placeInRow(m[22], 70, '04040');
                    m[21] = placeInRow(m[21], 69, '2222222');
                    m[19] = placeInRow(m[19], 74, '040');
                    m[18] = placeInRow(m[18], 73, '11111');
                    m[17] = placeInRow(m[17], 78, 'Q');
                    m[16] = placeInRow(m[16], 77, '111');
                    m[25] = placeInRow(m[25], 88, '5');
                    return m;
                })(),
                enemies: [
                    { type: 'astro', x: 28, y: 20, patrol: 4, flying: true },
                    { type: 'rockroller', x: 38, y: 25, patrol: 4 },
                    { type: 'astro', x: 54, y: 10, patrol: 6, flying: true },
                    { type: 'rockroller', x: 44, y: 25, patrol: 3 },
                    { type: 'astro', x: 68, y: 20, patrol: 4, flying: true },
                    { type: 'rockroller', x: 74, y: 25, patrol: 3 },
                ],
                portals: [
                    { id: 'A', x: 31, y: 7, color: 'blue', target: 'B' },
                    { id: 'B', x: 78, y: 17, color: 'orange', target: 'A' },
                ],
                hint: 'Portals teleport you!\nBlue and orange are linked.',
            },
            {
                name: '2-3: ORBITAL MECHANICS',
                width: 60, height: 30,
                playerStart: [2, 26],
                gravityZones: [
                    { x: 15, y: 5, w: 30, h: 20, gravity: 0.06 },
                ],
                isBoss: false,
                map: (function() {
                    const W = 60, H = 30;
                    const m = [];
                    for (let y = 0; y < H; y++) m[y] = row(W, '0');
                    for (let y = 27; y < H; y++) for (let x = 0; x < W; x++) m[y] = placeInRow(m[y], x, '1');
                    m[26] = placeInRow(m[26], 0, '111111111111111');
                    m[24] = placeInRow(m[24], 4, '222');
                    m[22] = placeInRow(m[22], 8, '040');
                    // Big low-G playground
                    m[26] = placeInRow(m[26], 15, '111111111111111111111111111111');
                    m[5] = placeInRow(m[5], 15, '111111111111111111111111111111');
                    m[15] = placeInRow(m[15], 20, '222');
                    m[15] = placeInRow(m[15], 30, '222');
                    m[15] = placeInRow(m[15], 38, '222');
                    m[10] = placeInRow(m[10], 25, '222');
                    m[10] = placeInRow(m[10], 35, '222');
                    m[20] = placeInRow(m[20], 22, '222');
                    m[20] = placeInRow(m[20], 32, '222');
                    m[12] = placeInRow(m[12], 28, '04040');
                    m[18] = placeInRow(m[18], 26, '040');
                    m[18] = placeInRow(m[18], 36, '040');
                    m[8] = placeInRow(m[8], 30, '0D0');
                    m[7] = placeInRow(m[7], 29, '11111');
                    // Checkpoint
                    m[25] = placeInRow(m[25], 40, '7');
                    // Exit
                    m[26] = placeInRow(m[26], 46, '11111111111111');
                    m[25] = placeInRow(m[25], 58, '5');
                    return m;
                })(),
                enemies: [
                    { type: 'astro', x: 22, y: 18, patrol: 6, flying: true },
                    { type: 'astro', x: 30, y: 12, patrol: 5, flying: true },
                    { type: 'astro', x: 36, y: 8, patrol: 4, flying: true },
                    { type: 'rockroller', x: 48, y: 25, patrol: 4 },
                    { type: 'astro', x: 40, y: 15, patrol: 5, flying: true },
                ],
                hint: 'Float through the zero-G zone!\nUse platforms as stepping stones.',
            }
        ]
    },

    // ======== WORLD 3: VOLT VALLEY ========
    {
        name: 'VOLT VALLEY',
        subtitle: 'The Science of Electricity',
        description: 'The power grid is down! Step on\nswitches to complete circuits\nand open blocked paths.',
        bgColor: '#001122',
        bgColor2: '#002244',
        musicTrack: 'world3',
        tileGround: 'ground_w3',
        tileDirt: 'metal_w3',
        tilePlatform: 'platform_w1',
        scienceConcept: 'ELECTRICITY',
        scienceLesson: 'Electricity needs a COMPLETE circuit\nto flow! Step on ALL switches in a\ncircuit to power the gate open.\nSome gates need 2 switches - find\nboth to complete the circuit!',
        levels: [
            {
                name: '3-1: CIRCUIT BREAKER',
                width: 80, height: 30,
                playerStart: [2, 26],
                circuits: [
                    { switches: [[25, 24]], gate: [45, 26] },
                    { switches: [[55, 20], [65, 24]], gate: [72, 26] },
                ],
                map: (function() {
                    const W = 80, H = 30;
                    const m = [];
                    for (let y = 0; y < H; y++) m[y] = row(W, '0');
                    for (let y = 27; y < H; y++) for (let x = 0; x < W; x++) m[y] = placeInRow(m[y], x, '1');
                    m[26] = placeInRow(m[26], 0, '1111111111111111111111111111');
                    m[24] = placeInRow(m[24], 4, '222');
                    m[22] = placeInRow(m[22], 8, '0440');
                    m[21] = placeInRow(m[21], 12, '22222');
                    m[19] = placeInRow(m[19], 16, '040');
                    m[18] = placeInRow(m[18], 15, '11111');
                    // First switch area
                    m[24] = placeInRow(m[24], 22, '22222');
                    // Gate blocks path
                    m[26] = placeInRow(m[26], 30, '111111111111111111');
                    m[25] = placeInRow(m[25], 35, '7');
                    m[24] = placeInRow(m[24], 32, '222');
                    m[22] = placeInRow(m[22], 36, '0440');
                    m[21] = placeInRow(m[21], 38, '22222');
                    m[19] = placeInRow(m[19], 42, '040');
                    // Second switch puzzle
                    m[26] = placeInRow(m[26], 48, '111111111111111111');
                    m[24] = placeInRow(m[24], 50, '222');
                    m[22] = placeInRow(m[22], 53, '222');
                    m[20] = placeInRow(m[20], 52, '11111');
                    m[24] = placeInRow(m[24], 60, '22222');
                    m[22] = placeInRow(m[22], 64, '040');
                    m[21] = placeInRow(m[21], 63, '22222');
                    // Exit
                    m[26] = placeInRow(m[26], 68, '111111111111');
                    m[25] = placeInRow(m[25], 78, '5');
                    return m;
                })(),
                enemies: [
                    { type: 'spark', x: 14, y: 25, patrol: 3 },
                    { type: 'coilbot', x: 20, y: 25, patrol: 4 },
                    { type: 'spinner', x: 28, y: 20, patrol: 0, flying: true },
                    { type: 'spark', x: 34, y: 25, patrol: 5 },
                    { type: 'coilbot', x: 42, y: 25, patrol: 3 },
                    { type: 'orbiter', x: 48, y: 20, patrol: 3, flying: true },
                    { type: 'spark', x: 52, y: 25, patrol: 4 },
                    { type: 'coilbot', x: 60, y: 25, patrol: 3 },
                    { type: 'spinner', x: 66, y: 20, patrol: 0, flying: true },
                    { type: 'spark', x: 70, y: 25, patrol: 4 },
                ],
                hint: 'Step on SWITCHES to open gates!\nShoot SPINNERS before they fire!',
            },
            {
                name: '3-2: CONDUCTOR',
                width: 90, height: 30,
                playerStart: [2, 26],
                circuits: [
                    { switches: [[20, 24], [40, 20]], gate: [55, 26] },
                    { switches: [[70, 24]], gate: [80, 26] },
                ],
                map: (function() {
                    const W = 90, H = 30;
                    const m = [];
                    for (let y = 0; y < H; y++) m[y] = row(W, '0');
                    for (let y = 27; y < H; y++) for (let x = 0; x < W; x++) m[y] = placeInRow(m[y], x, '1');
                    m[26] = placeInRow(m[26], 0, '11111111111111111111111111');
                    m[24] = placeInRow(m[24], 6, '222');
                    m[22] = placeInRow(m[22], 10, '0440');
                    m[21] = placeInRow(m[21], 14, '22222');
                    // Switch 1
                    m[24] = placeInRow(m[24], 18, '22222');
                    m[26] = placeInRow(m[26], 26, '11111111111111111111');
                    m[25] = placeInRow(m[25], 30, '7');
                    m[24] = placeInRow(m[24], 28, '222');
                    m[22] = placeInRow(m[22], 32, '0440');
                    m[21] = placeInRow(m[21], 34, '22222');
                    m[20] = placeInRow(m[20], 38, '11111');
                    // Switch 2 upper
                    m[18] = placeInRow(m[18], 36, '04Z40');
                    m[17] = placeInRow(m[17], 35, '2222222');
                    // Continue
                    m[26] = placeInRow(m[26], 46, '111111111111111111111111');
                    m[24] = placeInRow(m[24], 48, '222');
                    m[22] = placeInRow(m[22], 52, '040');
                    m[24] = placeInRow(m[24], 58, '222');
                    m[22] = placeInRow(m[22], 62, '0440');
                    m[21] = placeInRow(m[21], 64, '22222');
                    // Switch 3
                    m[24] = placeInRow(m[24], 68, '22222');
                    m[26] = placeInRow(m[26], 74, '1111111111111111');
                    m[24] = placeInRow(m[24], 76, '222');
                    m[22] = placeInRow(m[22], 80, '040');
                    // Exit
                    m[25] = placeInRow(m[25], 88, '5');
                    return m;
                })(),
                enemies: [
                    { type: 'spark', x: 12, y: 25, patrol: 4 },
                    { type: 'coilbot', x: 22, y: 25, patrol: 3 },
                    { type: 'spark', x: 32, y: 25, patrol: 5 },
                    { type: 'coilbot', x: 44, y: 25, patrol: 4 },
                    { type: 'spark', x: 54, y: 25, patrol: 3 },
                    { type: 'coilbot', x: 62, y: 25, patrol: 4 },
                    { type: 'spark', x: 72, y: 25, patrol: 3 },
                    { type: 'coilbot', x: 82, y: 25, patrol: 4 },
                ],
                hint: 'Find BOTH switches to open\nthe first gate!',
            },
            {
                name: '3-3: OVERLOAD',
                width: 60, height: 30,
                playerStart: [2, 26],
                circuits: [
                    { switches: [[20, 24]], gate: [30, 26] },
                ],
                isBoss: false,
                map: (function() {
                    const W = 60, H = 30;
                    const m = [];
                    for (let y = 0; y < H; y++) m[y] = row(W, '0');
                    for (let y = 27; y < H; y++) for (let x = 0; x < W; x++) m[y] = placeInRow(m[y], x, '1');
                    m[26] = placeInRow(m[26], 0, '111111111111111111111111');
                    m[24] = placeInRow(m[24], 4, '222');
                    m[22] = placeInRow(m[22], 8, '0440');
                    m[21] = placeInRow(m[21], 12, '22222');
                    m[24] = placeInRow(m[24], 18, '22222');
                    m[26] = placeInRow(m[26], 26, '1111111111111111111111111111111111');
                    m[25] = placeInRow(m[25], 32, '7');
                    m[24] = placeInRow(m[24], 28, '222');
                    m[22] = placeInRow(m[22], 34, '0440');
                    m[21] = placeInRow(m[21], 36, '22222');
                    m[19] = placeInRow(m[19], 40, '040');
                    m[18] = placeInRow(m[18], 39, '11111');
                    m[24] = placeInRow(m[24], 44, '222');
                    m[22] = placeInRow(m[22], 48, '040');
                    m[21] = placeInRow(m[21], 47, '22222');
                    m[25] = placeInRow(m[25], 58, '5');
                    return m;
                })(),
                enemies: [
                    { type: 'spark', x: 10, y: 25, patrol: 4 },
                    { type: 'coilbot', x: 18, y: 25, patrol: 3 },
                    { type: 'spark', x: 28, y: 25, patrol: 5 },
                    { type: 'coilbot', x: 36, y: 25, patrol: 4 },
                    { type: 'spark', x: 44, y: 25, patrol: 3 },
                    { type: 'coilbot', x: 50, y: 25, patrol: 4 },
                ],
                hint: 'Almost through Volt Valley!\nWatch for spark patterns.',
            }
        ]
    },

    // ======== WORLD 4: CRYO CAVERNS ========
    {
        name: 'CRYO CAVERNS',
        subtitle: 'The Science of Heat',
        description: 'Everything is frozen!\nIcy surfaces are slippery.\nLearn about heat and phase changes.',
        bgColor: '#334466',
        bgColor2: '#112233',
        musicTrack: 'world4',
        tileGround: 'ground_w4',
        tileDirt: 'ice_w4',
        tilePlatform: 'platform_w1',
        scienceConcept: 'THERMODYNAMICS',
        scienceLesson: 'Ice is slippery because a thin\nlayer melts under pressure!\nYou will SLIDE on icy ground here.\nBe careful near edges - friction\nis low so you cannot stop quickly!',
        levels: [
            {
                name: '4-1: COLD FRONT',
                width: 80, height: 30,
                playerStart: [2, 26],
                icePhysics: true,
                map: (function() {
                    const W = 80, H = 30;
                    const m = [];
                    for (let y = 0; y < H; y++) m[y] = row(W, '0');
                    for (let y = 27; y < H; y++) for (let x = 0; x < W; x++) m[y] = placeInRow(m[y], x, '1');
                    m[26] = placeInRow(m[26], 0, '1111111111111111111');
                    m[24] = placeInRow(m[24], 4, '222');
                    m[22] = placeInRow(m[22], 8, '0440');
                    m[21] = placeInRow(m[21], 12, '22222');
                    m[19] = placeInRow(m[19], 16, '040');
                    m[26] = placeInRow(m[26], 20, '1111111111111111111111111');
                    m[25] = placeInRow(m[25], 25, '7');
                    m[24] = placeInRow(m[24], 22, '222');
                    m[22] = placeInRow(m[22], 26, '0440');
                    m[21] = placeInRow(m[21], 28, '22222');
                    m[19] = placeInRow(m[19], 32, '040');
                    m[18] = placeInRow(m[18], 31, '11111');
                    m[26] = placeInRow(m[26], 38, '1111111111111111111111111');
                    m[24] = placeInRow(m[24], 40, '222');
                    m[22] = placeInRow(m[22], 44, '04040');
                    m[21] = placeInRow(m[21], 46, '22222');
                    m[25] = placeInRow(m[25], 50, '6');
                    m[17] = placeInRow(m[17], 48, '0F0');
                    m[16] = placeInRow(m[16], 47, '11111');
                    m[26] = placeInRow(m[26], 56, '111111111111111111111111');
                    m[24] = placeInRow(m[24], 58, '222');
                    m[22] = placeInRow(m[22], 62, '0440');
                    m[21] = placeInRow(m[21], 64, '22222');
                    m[19] = placeInRow(m[19], 68, '040');
                    m[18] = placeInRow(m[18], 67, '11111');
                    m[25] = placeInRow(m[25], 78, '5');
                    return m;
                })(),
                enemies: [
                    { type: 'frostGhost', x: 14, y: 20, patrol: 4, flying: true },
                    { type: 'iceBat', x: 22, y: 18, patrol: 5, flying: true },
                    { type: 'frostGhost', x: 30, y: 22, patrol: 4, flying: true },
                    { type: 'iceBat', x: 40, y: 16, patrol: 5, flying: true },
                    { type: 'frostGhost', x: 50, y: 20, patrol: 3, flying: true },
                    { type: 'iceBat', x: 60, y: 18, patrol: 4, flying: true },
                    { type: 'frostGhost', x: 70, y: 22, patrol: 4, flying: true },
                ],
                hint: 'ICE is slippery! You slide\nfarther. Be careful near edges!',
            },
            {
                name: '4-2: PHASE SHIFT',
                width: 90, height: 30,
                playerStart: [2, 26],
                icePhysics: true,
                map: (function() {
                    const W = 90, H = 30;
                    const m = [];
                    for (let y = 0; y < H; y++) m[y] = row(W, '0');
                    for (let y = 27; y < H; y++) for (let x = 0; x < W; x++) m[y] = placeInRow(m[y], x, '1');
                    m[26] = placeInRow(m[26], 0, '11111111111111111111');
                    m[24] = placeInRow(m[24], 4, '222');
                    m[22] = placeInRow(m[22], 8, '0440');
                    m[21] = placeInRow(m[21], 12, '22222');
                    m[26] = placeInRow(m[26], 22, '11111111111111111111');
                    m[25] = placeInRow(m[25], 28, '7');
                    m[24] = placeInRow(m[24], 24, '222');
                    m[22] = placeInRow(m[22], 28, '0440');
                    m[21] = placeInRow(m[21], 32, '22222');
                    m[19] = placeInRow(m[19], 36, '040');
                    m[18] = placeInRow(m[18], 35, '11111');
                    m[26] = placeInRow(m[26], 42, '11111111111111111111');
                    m[24] = placeInRow(m[24], 44, '222');
                    m[22] = placeInRow(m[22], 48, '04040');
                    m[21] = placeInRow(m[21], 50, '22222');
                    m[19] = placeInRow(m[19], 54, '040');
                    m[26] = placeInRow(m[26], 62, '1111111111111111111111111111');
                    m[25] = placeInRow(m[25], 65, '6');
                    m[17] = placeInRow(m[17], 63, '04440');
                    m[16] = placeInRow(m[16], 62, '1111111');
                    m[24] = placeInRow(m[24], 70, '222');
                    m[22] = placeInRow(m[22], 74, '0440');
                    m[21] = placeInRow(m[21], 76, '22222');
                    m[19] = placeInRow(m[19], 80, '040');
                    m[18] = placeInRow(m[18], 79, '11111');
                    m[25] = placeInRow(m[25], 88, '5');
                    return m;
                })(),
                enemies: [
                    { type: 'frostGhost', x: 12, y: 20, patrol: 5, flying: true },
                    { type: 'iceBat', x: 20, y: 16, patrol: 4, flying: true },
                    { type: 'frostGhost', x: 30, y: 22, patrol: 4, flying: true },
                    { type: 'iceBat', x: 40, y: 18, patrol: 5, flying: true },
                    { type: 'frostGhost', x: 50, y: 20, patrol: 3, flying: true },
                    { type: 'iceBat', x: 60, y: 16, patrol: 4, flying: true },
                    { type: 'frostGhost', x: 70, y: 22, patrol: 4, flying: true },
                    { type: 'iceBat', x: 80, y: 18, patrol: 3, flying: true },
                ],
                hint: 'Springs launch you high!\nUse them to reach secrets.',
            },
            {
                name: '4-3: ABSOLUTE ZERO',
                width: 60, height: 30,
                playerStart: [2, 26],
                icePhysics: true,
                map: (function() {
                    const W = 60, H = 30;
                    const m = [];
                    for (let y = 0; y < H; y++) m[y] = row(W, '0');
                    for (let y = 27; y < H; y++) for (let x = 0; x < W; x++) m[y] = placeInRow(m[y], x, '1');
                    m[26] = placeInRow(m[26], 0, '111111111111111');
                    m[24] = placeInRow(m[24], 4, '222');
                    m[22] = placeInRow(m[22], 8, '0440');
                    m[21] = placeInRow(m[21], 10, '22222');
                    m[26] = placeInRow(m[26], 16, '111111111111111111');
                    m[25] = placeInRow(m[25], 20, '7');
                    m[24] = placeInRow(m[24], 18, '222');
                    m[22] = placeInRow(m[22], 22, '04040');
                    m[21] = placeInRow(m[21], 24, '22222');
                    m[26] = placeInRow(m[26], 34, '11111111111111111111111111');
                    m[24] = placeInRow(m[24], 36, '222');
                    m[22] = placeInRow(m[22], 40, '0440');
                    m[21] = placeInRow(m[21], 42, '22222');
                    m[19] = placeInRow(m[19], 46, '040');
                    m[18] = placeInRow(m[18], 45, '11111');
                    m[25] = placeInRow(m[25], 58, '5');
                    return m;
                })(),
                enemies: [
                    { type: 'frostGhost', x: 10, y: 20, patrol: 4, flying: true },
                    { type: 'iceBat', x: 18, y: 16, patrol: 5, flying: true },
                    { type: 'frostGhost', x: 26, y: 22, patrol: 3, flying: true },
                    { type: 'iceBat', x: 34, y: 18, patrol: 4, flying: true },
                    { type: 'frostGhost', x: 42, y: 20, patrol: 4, flying: true },
                    { type: 'iceBat', x: 50, y: 16, patrol: 3, flying: true },
                ],
                hint: 'The deepest caves are the\ncoldest. Stay focused!',
            }
        ]
    },

    // ======== WORLD 5: ENTROPY'S FORTRESS ========
    {
        name: "ENTROPY'S FORTRESS",
        subtitle: 'The Science of Energy',
        description: "Dr. Entropy's lair! Use everything\nyou've learned to save Professor Helix!",
        bgColor: '#110000',
        bgColor2: '#220000',
        musicTrack: 'world5',
        tileGround: 'ground_w5',
        tileDirt: 'dark_w5',
        tilePlatform: 'platform_w1',
        scienceConcept: 'ENTROPY & ENERGY',
        scienceLesson: 'Energy cannot be created or destroyed\n- only transformed! This fortress\ncombines ALL science: gravity zones,\nicy floors, and circuits. Use every\nskill you have learned to survive!',
        levels: [
            {
                name: '5-1: DARK CORRIDOR',
                width: 80, height: 30,
                playerStart: [2, 26],
                map: (function() {
                    const W = 80, H = 30;
                    const m = [];
                    for (let y = 0; y < H; y++) m[y] = row(W, '0');
                    for (let y = 27; y < H; y++) for (let x = 0; x < W; x++) m[y] = placeInRow(m[y], x, '1');
                    m[26] = placeInRow(m[26], 0, '11111111111111111111');
                    m[24] = placeInRow(m[24], 4, '222');
                    m[22] = placeInRow(m[22], 8, '0440');
                    m[21] = placeInRow(m[21], 12, '22222');
                    m[26] = placeInRow(m[26], 22, '111111111111111111');
                    m[25] = placeInRow(m[25], 28, '7');
                    m[24] = placeInRow(m[24], 24, '222');
                    m[22] = placeInRow(m[22], 28, '0330');
                    m[21] = placeInRow(m[21], 30, '22222');
                    m[19] = placeInRow(m[19], 34, '040');
                    m[18] = placeInRow(m[18], 33, '11111');
                    m[26] = placeInRow(m[26], 40, '111111111111111111');
                    m[24] = placeInRow(m[24], 42, '222');
                    m[22] = placeInRow(m[22], 46, '04040');
                    m[21] = placeInRow(m[21], 48, '22222');
                    m[19] = placeInRow(m[19], 52, '040');
                    m[18] = placeInRow(m[18], 51, '11111');
                    m[26] = placeInRow(m[26], 58, '1111111111111111111111');
                    m[24] = placeInRow(m[24], 60, '222');
                    m[22] = placeInRow(m[22], 64, '0440');
                    m[21] = placeInRow(m[21], 66, '22222');
                    m[25] = placeInRow(m[25], 78, '5');
                    return m;
                })(),
                enemies: [
                    { type: 'drone', x: 10, y: 20, patrol: 5, flying: true },
                    { type: 'chaosOrb', x: 20, y: 18, patrol: 4, flying: true },
                    { type: 'drone', x: 30, y: 22, patrol: 4, flying: true },
                    { type: 'chaosOrb', x: 40, y: 16, patrol: 5, flying: true },
                    { type: 'drone', x: 50, y: 20, patrol: 3, flying: true },
                    { type: 'chaosOrb', x: 60, y: 18, patrol: 4, flying: true },
                    { type: 'drone', x: 70, y: 22, patrol: 4, flying: true },
                ],
                hint: 'The fortress is dangerous!\nUse all your skills.',
            },
            {
                name: '5-2: CHAOS ENGINE',
                width: 90, height: 30,
                playerStart: [2, 26],
                gravityZones: [
                    { x: 30, y: 5, w: 15, h: 20, gravity: 0.08 },
                ],
                map: (function() {
                    const W = 90, H = 30;
                    const m = [];
                    for (let y = 0; y < H; y++) m[y] = row(W, '0');
                    for (let y = 27; y < H; y++) for (let x = 0; x < W; x++) m[y] = placeInRow(m[y], x, '1');
                    m[26] = placeInRow(m[26], 0, '1111111111111111111111111111111');
                    m[24] = placeInRow(m[24], 4, '222');
                    m[22] = placeInRow(m[22], 8, '0440');
                    m[21] = placeInRow(m[21], 12, '22222');
                    m[19] = placeInRow(m[19], 16, '040');
                    m[18] = placeInRow(m[18], 15, '11111');
                    m[25] = placeInRow(m[25], 22, '7');
                    // Low-G zone
                    m[26] = placeInRow(m[26], 30, '111111111111111');
                    m[5] = placeInRow(m[5], 30, '111111111111111');
                    m[15] = placeInRow(m[15], 32, '222');
                    m[10] = placeInRow(m[10], 36, '04040');
                    m[9] = placeInRow(m[9], 35, '2222222');
                    m[20] = placeInRow(m[20], 34, '222');
                    // Continue
                    m[26] = placeInRow(m[26], 46, '111111111111111111111111111111111');
                    m[25] = placeInRow(m[25], 55, '7');
                    m[24] = placeInRow(m[24], 48, '222');
                    m[22] = placeInRow(m[22], 52, '0440');
                    m[21] = placeInRow(m[21], 56, '22222');
                    m[19] = placeInRow(m[19], 60, '040');
                    m[18] = placeInRow(m[18], 59, '11111');
                    m[24] = placeInRow(m[24], 66, '222');
                    m[22] = placeInRow(m[22], 70, '04040');
                    m[21] = placeInRow(m[21], 72, '22222');
                    m[19] = placeInRow(m[19], 76, '040');
                    m[18] = placeInRow(m[18], 75, '11111');
                    m[25] = placeInRow(m[25], 88, '5');
                    return m;
                })(),
                enemies: [
                    { type: 'drone', x: 12, y: 20, patrol: 5, flying: true },
                    { type: 'chaosOrb', x: 20, y: 16, patrol: 4, flying: true },
                    { type: 'drone', x: 34, y: 12, patrol: 6, flying: true },
                    { type: 'chaosOrb', x: 40, y: 18, patrol: 5, flying: true },
                    { type: 'drone', x: 52, y: 20, patrol: 4, flying: true },
                    { type: 'chaosOrb', x: 62, y: 16, patrol: 5, flying: true },
                    { type: 'drone', x: 72, y: 22, patrol: 4, flying: true },
                    { type: 'chaosOrb', x: 80, y: 18, patrol: 3, flying: true },
                ],
                hint: 'Low gravity even here!\nEntropy warps everything.',
            },
            {
                name: '5-3: DR. ENTROPY',
                width: 50, height: 30,
                playerStart: [2, 26],
                isBoss: true,
                bossType: 'entropy',
                map: (function() {
                    const W = 50, H = 30;
                    const m = [];
                    for (let y = 0; y < H; y++) m[y] = row(W, '0');
                    for (let y = 27; y < H; y++) for (let x = 0; x < W; x++) m[y] = placeInRow(m[y], x, '1');
                    m[26] = placeInRow(m[26], 0, '11111111');
                    m[24] = placeInRow(m[24], 4, '0S0');
                    m[23] = placeInRow(m[23], 3, '11111');
                    // Boss arena
                    m[26] = placeInRow(m[26], 10, '1111111111111111111111111111111111111111');
                    for (let y = 10; y < 27; y++) {
                        m[y] = placeInRow(m[y], 10, '1');
                        m[y] = placeInRow(m[y], 45, '1');
                    }
                    m[10] = placeInRow(m[10], 10, '111111111111111111111111111111111111');
                    // Arena platforms
                    m[22] = placeInRow(m[22], 14, '2222');
                    m[22] = placeInRow(m[22], 36, '2222');
                    m[18] = placeInRow(m[18], 24, '22222222');
                    m[14] = placeInRow(m[14], 18, '2222');
                    m[14] = placeInRow(m[14], 32, '2222');
                    // Exit (after boss)
                    m[25] = placeInRow(m[25], 44, '5');
                    return m;
                })(),
                enemies: [],
                hint: 'This is it! Defeat Dr. Entropy\nand save Professor Helix!',
            }
        ]
    }
];

// Story scenes
const StoryScenes = {
    intro: [
        { speaker: 'NARRATOR', text: 'In a world where science governs\nall natural laws...' },
        { speaker: 'NARRATOR', text: 'Professor Helix, the greatest\nscientist alive, kept balance.' },
        { speaker: 'DR. ENTROPY', text: 'The laws of physics are MINE\nto control! Chaos will reign!' },
        { speaker: 'NARRATOR', text: 'Dr. Entropy kidnapped the\nProfessor and broke the laws\nof science across 5 worlds!' },
        { speaker: 'LUX', text: "I'm Lux, the Professor's\napprentice. I have to save\nhim and restore science!" },
        { speaker: 'NARRATOR', text: 'Use your knowledge of science\nto overcome each world!' },
    ],
    world1_intro: [
        { speaker: 'LUX', text: 'Prism Peaks... the light here\nis all wrong. Colors are\nsplit apart!' },
        { speaker: 'LUX', text: 'Professor taught me about\noptics. I can fix this!' },
    ],
    world2_intro: [
        { speaker: 'LUX', text: "Gravity Gorge! Everything is\nfloating... or falling the\nwrong way!" },
        { speaker: 'LUX', text: 'I need to use momentum and\nunderstand gravity to navigate.' },
    ],
    world3_intro: [
        { speaker: 'LUX', text: 'Volt Valley... the power is\nout everywhere. Circuits are\nbroken!' },
        { speaker: 'LUX', text: 'If I complete the circuits,\nI can open new paths!' },
    ],
    world4_intro: [
        { speaker: 'LUX', text: "Cryo Caverns! It's freezing!\nEverything is covered in ice." },
        { speaker: 'LUX', text: 'Heat transfer and phase\nchanges... I can work with this!' },
    ],
    world5_intro: [
        { speaker: 'LUX', text: "This is it. Entropy's\nFortress. The Professor\nmust be inside!" },
        { speaker: 'DR. ENTROPY', text: 'You made it this far?\nNo matter. Chaos always\nwins in the end!' },
        { speaker: 'LUX', text: "Not today! Energy can't be\ndestroyed, and neither can\nmy determination!" },
    ],
    victory: [
        { speaker: 'DR. ENTROPY', text: 'Impossible! My entropy\nmachines... destroyed!' },
        { speaker: 'LUX', text: 'Professor Helix! Are you\nalright?' },
        { speaker: 'PROF. HELIX', text: 'Lux! You used science to\novercome every challenge.\nI am so proud!' },
        { speaker: 'LUX', text: "I couldn't have done it\nwithout your teachings!" },
        { speaker: 'NARRATOR', text: 'And so, the laws of science\nwere restored. Knowledge\ntriumphed over chaos!' },
        { speaker: 'NARRATOR', text: 'CONGRATULATIONS!\n\nTHE END' },
    ]
};

const MiniGames = {
    scienceQuiz: {
        name: 'SCIENCE QUIZ',
        questions: [
            { q: 'What splits white light\ninto colors?', answers: ['PRISM', 'MIRROR', 'LENS', 'MAGNET'], correct: 0 },
            { q: 'What is the unit of\nelectric current?', answers: ['VOLT', 'AMPERE', 'WATT', 'OHM'], correct: 1 },
            { q: 'At what Celsius does\nwater freeze?', answers: ['32', '0', '-10', '100'], correct: 1 },
            { q: 'What force pulls objects\ntoward Earth?', answers: ['MAGNETISM', 'FRICTION', 'GRAVITY', 'TENSION'], correct: 2 },
            { q: 'Momentum equals mass\ntimes what?', answers: ['SPEED', 'VELOCITY', 'FORCE', 'TIME'], correct: 1 },
            { q: 'Light travels fastest\nthrough what?', answers: ['WATER', 'GLASS', 'VACUUM', 'AIR'], correct: 2 },
        ]
    },
    reflexChallenge: {
        name: 'REFLEX TEST',
        description: 'Hit ACTION when the\nlight turns GREEN!',
        rounds: 5,
    }
};
