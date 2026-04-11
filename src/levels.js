// ============================================================
// AXIOM - Level Data v3: buildLevel system, bigger levels
// ============================================================

// buildLevel: generates map array from compact config
function buildLevel(cfg) {
    const W = cfg.width, H = cfg.height;
    const m = [];
    for (let y = 0; y < H; y++) m[y] = '0'.repeat(W);

    // Helper: place chars into row
    function put(row, col, str) {
        if (row < 0 || row >= H) return;
        const a = m[row].split('');
        for (let i = 0; i < str.length && col + i < W; i++) {
            if (col + i >= 0) a[col + i] = str[i];
        }
        m[row] = a.join('');
    }

    // Helper: fill rect with a tile char
    function fill(x, y, w, h, ch) {
        for (let r = y; r < y + h && r < H; r++) put(r, x, ch.repeat(w));
    }

    // Auto ground floor
    fill(0, H - 3, W, 3, '1');

    // Terrain blocks
    if (cfg.terrain) cfg.terrain.forEach(t => fill(t.x, t.y, t.w, t.h || 1, t.ch || '1'));

    // Platforms (one-way, tile 2)
    if (cfg.platforms) cfg.platforms.forEach(p => put(p.y, p.x, '2'.repeat(p.w)));

    // Rooms: stamp predefined patterns
    if (cfg.rooms) cfg.rooms.forEach(r => {
        const tmpl = RoomTemplates[r.type];
        if (!tmpl) return;
        for (let ry = 0; ry < tmpl.length; ry++) {
            put(r.y + ry, r.x, tmpl[ry]);
        }
    });

    // Items placed directly
    if (cfg.items) cfg.items.forEach(i => put(i.y, i.x, i.ch));

    return m;
}

// Reusable room templates (small tile patterns)
const RoomTemplates = {
    // Cave: enclosed room with vine access from above, coins inside
    cave_small: [
        '1111111111',
        '1000004001',
        '10V0000001',
        '10V0040001',
        '10V0000081',
        '1111111111',
    ],
    // Treasure room: hidden goodies
    treasure: [
        '1111111111',
        '1004040041',
        '1000000001',
        '1040040401',
        '1000080001',
        '1111111111',
    ],
    // Spring tower: vertical shaft with springs
    spring_tower: [
        '100001',
        '100001',
        '100601',
        '100001',
        '100001',
        '100601',
        '100001',
        '111111',
    ],
    // Corridor: horizontal passage
    corridor: [
        '1111111111111111',
        '1000000000000001',
        '1004000400040001',
        '1000000000000001',
        '1111111111111111',
    ],
    // Puzzle chamber: open room with platforms
    puzzle_chamber: [
        '1000000000000001',
        '1000000000000001',
        '1000022200000001',
        '1000000000000001',
        '1002220000222001',
        '1000000000000001',
        '1000000000000001',
        '1111111111111111',
    ],
};

// ============================================================
// WORLD DATA
// ============================================================
const WorldData = [
    // ======== WORLD 1: PRISM PEAKS ========
    {
        name: 'PRISM PEAKS',
        subtitle: 'The Science of Light',
        description: 'Light has gone haywire!\nRedirect beams with mirrors\nand restore the spectrum.',
        bgColor: '#88bbee', bgColor2: '#5588cc',
        musicTrack: 'world1',
        tileGround: 'ground_w1', tileDirt: 'dirt_w1', tilePlatform: 'platform_w1',
        scienceConcept: 'OPTICS',
        scienceLesson: 'Light refracts through materials.\nFind portals that link like light\nthrough prisms. Explore caves.\nCollect prisms to defeat bosses!',
        levels: [
            {
                name: '1-1: FIRST LIGHT',
                width: 200, height: 30,
                playerStart: [2, 24],
                map: buildLevel({
                    width: 200, height: 30,
                    terrain: [
                        // Ground with gaps for exploration
                        {x:0,y:26,w:40,h:1},{x:0,y:25,w:8,h:1},
                        {x:44,y:26,w:30,h:1},
                        {x:78,y:26,w:35,h:1},
                        {x:118,y:26,w:40,h:1},
                        {x:162,y:26,w:38,h:1},
                        // Elevated sections
                        {x:15,y:22,w:6,h:1},{x:25,y:20,w:5,h:1},
                        {x:50,y:22,w:8,h:1},{x:62,y:20,w:5,h:1},
                        {x:85,y:22,w:6,h:1},{x:95,y:20,w:5,h:1},
                        {x:125,y:22,w:8,h:1},{x:138,y:20,w:5,h:1},{x:145,y:18,w:4,h:1},
                        {x:170,y:22,w:6,h:1},{x:180,y:20,w:5,h:1},
                    ],
                    platforms: [
                        {x:10,y:24,w:4},{x:18,y:22,w:3},{x:23,y:20,w:3},
                        {x:35,y:24,w:4},{x:42,y:22,w:3},
                        {x:55,y:24,w:4},{x:60,y:22,w:3},{x:68,y:24,w:4},
                        {x:90,y:24,w:4},{x:100,y:22,w:4},
                        {x:108,y:24,w:4},{x:115,y:22,w:3},
                        {x:130,y:24,w:4},{x:136,y:22,w:3},{x:142,y:20,w:3},
                        {x:155,y:24,w:4},{x:160,y:22,w:3},
                        {x:175,y:24,w:4},{x:185,y:22,w:3},
                        {x:192,y:24,w:4},
                    ],
                    rooms: [
                        {type:'cave_small', x:30, y:20},
                        {type:'treasure', x:100, y:20},
                        {type:'spring_tower', x:150, y:18},
                    ],
                    items: [
                        {x:5,y:25,ch:'4'},{x:7,y:25,ch:'4'},{x:12,y:23,ch:'4'},{x:14,y:23,ch:'4'},
                        {x:20,y:21,ch:'4'},{x:22,y:21,ch:'4'},{x:27,y:19,ch:'4'},
                        {x:48,y:25,ch:'4'},{x:50,y:25,ch:'4'},{x:57,y:23,ch:'4'},
                        {x:65,y:19,ch:'4'},{x:67,y:19,ch:'4'},
                        {x:80,y:25,ch:'4'},{x:82,y:25,ch:'4'},{x:88,y:21,ch:'4'},
                        {x:110,y:23,ch:'4'},{x:112,y:23,ch:'4'},
                        {x:128,y:21,ch:'4'},{x:130,y:23,ch:'4'},
                        {x:165,y:25,ch:'4'},{x:167,y:25,ch:'4'},{x:172,y:21,ch:'4'},
                        {x:55,y:25,ch:'7'}, // checkpoint
                        {x:120,y:25,ch:'7'}, // checkpoint
                        {x:45,y:21,ch:'D'}, // dash power
                        {x:197,y:25,ch:'5'}, // exit door
                    ],
                }),
                enemies: [
                    {type:'mushroom',x:12,y:25,patrol:4},
                    {type:'mushroom',x:22,y:25,patrol:3},
                    {type:'glowbug',x:18,y:18,patrol:5,flying:true},
                    {type:'mushroom',x:48,y:25,patrol:4},
                    {type:'thornball',x:56,y:25,patrol:3,bounce:true},
                    {type:'glowbug',x:62,y:18,patrol:4,flying:true},
                    {type:'mushroom',x:72,y:25,patrol:4},
                    {type:'orbiter',x:80,y:20,patrol:3,flying:true},
                    {type:'mushroom',x:90,y:25,patrol:3},
                    {type:'glowbug',x:100,y:18,patrol:5,flying:true},
                    {type:'mushroom',x:120,y:25,patrol:4},
                    {type:'thornball',x:130,y:25,patrol:4,bounce:true},
                    {type:'spinner',x:140,y:20,patrol:0,flying:true},
                    {type:'mushroom',x:155,y:25,patrol:3},
                    {type:'orbiter',x:165,y:18,patrol:4,flying:true},
                    {type:'mushroom',x:175,y:25,patrol:3},
                    {type:'glowbug',x:185,y:18,patrol:4,flying:true},
                    {type:'mushroom',x:190,y:25,patrol:3},
                ],
                portals: [
                    {id:'A',x:35,y:21,color:'blue',target:'B'},
                    {id:'B',x:145,y:17,color:'orange',target:'A'},
                ],
                hintZones: [
                    {x:30,y:20,radius:40,text:'A hidden CAVE! Climb the vine\ninside to find treasure.'},
                    {x:100,y:20,radius:40,text:'SECRET room! Coins and a\n1-UP heart inside.'},
                    {x:150,y:18,radius:40,text:'SPRING TOWER: bounce your\nway up to reach the portal!'},
                ],
                hint: 'X = PHOTON BLASTER to zap enemies!\nDouble jump in air. Wall-slide walls.\nH = hints. Explore everything!',
            },
            {
                name: '1-2: CRYSTAL CAVES',
                width: 250, height: 30,
                playerStart: [2, 24],
                map: buildLevel({
                    width: 250, height: 30,
                    terrain: [
                        {x:0,y:26,w:50,h:1},{x:0,y:25,w:8,h:1},
                        {x:55,y:26,w:40,h:1},
                        {x:100,y:26,w:40,h:1},
                        {x:145,y:26,w:40,h:1},
                        {x:190,y:26,w:60,h:1},
                        // Elevated terrain
                        {x:20,y:22,w:6,h:1},{x:30,y:20,w:5,h:1},
                        {x:60,y:22,w:8,h:1},{x:75,y:20,w:5,h:1},
                        {x:110,y:22,w:8,h:1},{x:125,y:20,w:5,h:1},{x:132,y:18,w:4,h:1},
                        {x:155,y:22,w:6,h:1},{x:168,y:20,w:5,h:1},{x:175,y:18,w:4,h:1},
                        {x:200,y:22,w:8,h:1},{x:215,y:20,w:5,h:1},{x:225,y:18,w:4,h:1},
                    ],
                    platforms: [
                        {x:10,y:24,w:4},{x:16,y:22,w:3},{x:24,y:20,w:3},
                        {x:38,y:24,w:4},{x:45,y:22,w:3},
                        {x:58,y:24,w:4},{x:66,y:22,w:3},{x:72,y:20,w:3},
                        {x:82,y:24,w:4},{x:88,y:22,w:3},{x:95,y:24,w:4},
                        {x:105,y:24,w:4},{x:115,y:22,w:3},{x:122,y:20,w:3},
                        {x:140,y:24,w:4},{x:148,y:22,w:3},{x:155,y:20,w:3},
                        {x:162,y:24,w:4},{x:170,y:22,w:3},{x:178,y:20,w:3},
                        {x:195,y:24,w:4},{x:205,y:22,w:3},{x:212,y:20,w:3},
                        {x:230,y:24,w:4},{x:238,y:22,w:3},{x:245,y:24,w:3},
                    ],
                    rooms: [
                        {type:'cave_small', x:40, y:20},
                        {type:'corridor', x:85, y:21},
                        {type:'treasure', x:135, y:20},
                        {type:'puzzle_chamber', x:180, y:18},
                        {type:'spring_tower', x:220, y:18},
                    ],
                    items: [
                        {x:5,y:25,ch:'4'},{x:8,y:25,ch:'4'},{x:12,y:23,ch:'4'},
                        {x:22,y:21,ch:'4'},{x:25,y:21,ch:'4'},{x:32,y:19,ch:'4'},
                        {x:56,y:25,ch:'4'},{x:58,y:25,ch:'4'},{x:62,y:21,ch:'4'},
                        {x:108,y:23,ch:'4'},{x:112,y:23,ch:'4'},{x:127,y:19,ch:'4'},
                        {x:157,y:21,ch:'4'},{x:160,y:21,ch:'4'},
                        {x:202,y:21,ch:'4'},{x:205,y:21,ch:'4'},
                        {x:50,y:25,ch:'7'}, // checkpoint
                        {x:110,y:25,ch:'7'}, // checkpoint
                        {x:180,y:25,ch:'7'}, // checkpoint
                        {x:75,y:19,ch:'F'}, // float power
                        {x:132,y:17,ch:'S'}, // shield power
                        {x:248,y:25,ch:'5'}, // exit
                    ],
                }),
                enemies: [
                    {type:'mushroom',x:15,y:25,patrol:4},
                    {type:'glowbug',x:20,y:18,patrol:5,flying:true},
                    {type:'mushroom',x:35,y:25,patrol:3},
                    {type:'thornball',x:48,y:25,patrol:3,bounce:true},
                    {type:'orbiter',x:55,y:18,patrol:4,flying:true},
                    {type:'mushroom',x:65,y:25,patrol:4},
                    {type:'spinner',x:78,y:18,patrol:0,flying:true},
                    {type:'mushroom',x:88,y:25,patrol:3},
                    {type:'glowbug',x:95,y:18,patrol:5,flying:true},
                    {type:'mushroom',x:105,y:25,patrol:4},
                    {type:'orbiter',x:115,y:18,patrol:4,flying:true},
                    {type:'thornball',x:125,y:25,patrol:4,bounce:true},
                    {type:'mushroom',x:148,y:25,patrol:3},
                    {type:'spinner',x:160,y:18,patrol:0,flying:true},
                    {type:'glowbug',x:170,y:18,patrol:5,flying:true},
                    {type:'mushroom',x:195,y:25,patrol:4},
                    {type:'orbiter',x:210,y:18,patrol:4,flying:true},
                    {type:'mushroom',x:230,y:25,patrol:3},
                    {type:'glowbug',x:240,y:18,patrol:4,flying:true},
                ],
                portals: [
                    {id:'A',x:42,y:21,color:'blue',target:'B'},
                    {id:'B',x:222,y:19,color:'orange',target:'A'},
                ],
                hintZones: [
                    {x:85,y:21,radius:50,text:'A hidden CORRIDOR with coins!\nExplore inside carefully.'},
                    {x:135,y:20,radius:40,text:'TREASURE room! Look for\nthe 1-UP heart.'},
                    {x:180,y:18,radius:50,text:'PUZZLE CHAMBER: use the\nplatforms to reach the top.'},
                ],
                hint: 'Bigger caves to explore!\nBreak brown blocks from below.\nPortals link distant areas.',
            },
            {
                name: '1-3: SPECTRUM GUARDIAN',
                width: 80, height: 30,
                playerStart: [2, 24],
                map: buildLevel({
                    width: 80, height: 30,
                    terrain: [
                        // Approach
                        {x:0,y:26,w:22,h:1},{x:0,y:25,w:8,h:1},
                        // Arena floor
                        {x:22,y:26,w:35,h:1},
                        // Arena walls - left with entrance gap (only top part)
                        {x:22,y:15,w:1,h:9}, // rows 15-23 (open at 24-26)
                        // Arena walls - right solid
                        {x:56,y:15,w:1,h:12}, // rows 15-26
                        // Arena ceiling
                        {x:22,y:15,w:35,h:1},
                        // After arena
                        {x:57,y:26,w:23,h:1},
                    ],
                    platforms: [
                        // Approach platforms
                        {x:8,y:24,w:4},{x:14,y:22,w:4},
                        // Arena platforms - layered, max 2 tile gaps
                        {x:25,y:24,w:5},{x:35,y:24,w:6},{x:47,y:24,w:5},
                        {x:28,y:22,w:4},{x:37,y:22,w:5},{x:45,y:22,w:4},
                        {x:31,y:20,w:4},{x:40,y:20,w:4},
                        {x:34,y:18,w:6},
                    ],
                    items: [
                        {x:16,y:21,ch:'S'}, // shield before boss
                        {x:20,y:25,ch:'7'}, // checkpoint
                        {x:55,y:25,ch:'5'}, // exit after boss
                    ],
                }),
                isBoss: true, bossType: 'entropy',
                bossPuzzle: {
                    type: 'prism',
                    prisms: [
                        {color:'red',x:27,y:23},
                        {color:'green',x:46,y:21},
                        {color:'blue',x:33,y:19},
                    ],
                    pedestals: [
                        {x:36,y:25,color:null},
                        {x:38,y:25,color:null},
                        {x:40,y:25,color:null},
                    ],
                    roundsToWin: 3,
                },
                enemies: [
                    {type:'orbiter',x:32,y:20,patrol:3,flying:true},
                    {type:'orbiter',x:46,y:20,patrol:3,flying:true},
                ],
                hint: 'Collect R, G, B PRISMS from platforms.\nPlace on pedestals to make WHITE LIGHT!\nShoot enemies with X. 3 rounds to win!',
            },
        ]
    },

    // ======== WORLD 2: GRAVITY GORGE ========
    {
        name: 'GRAVITY GORGE',
        subtitle: 'The Science of Motion',
        description: 'Gravity is unstable!\nPurple zones = low gravity.\nRed zones = reverse gravity!',
        bgColor: '#110022', bgColor2: '#220044',
        musicTrack: 'world2',
        tileGround: 'ground_w2', tileDirt: 'dirt_w1', tilePlatform: 'float_w2',
        scienceConcept: 'GRAVITY & MOMENTUM',
        scienceLesson: 'Gravity pulls at 9.8m/s2 on Earth.\nPurple zones = LOW gravity, jump\nhigher! Red zones = REVERSE, you\nfall UP! Use momentum to cross gaps.',
        levels: [
            {
                name: '2-1: ZERO POINT',
                width: 180, height: 30,
                playerStart: [2, 24],
                gravityZones: [
                    {x:40,y:5,w:25,h:20,gravity:0.06},
                    {x:100,y:5,w:20,h:20,gravity:-0.12},
                ],
                map: buildLevel({
                    width: 180, height: 30,
                    terrain: [
                        {x:0,y:26,w:38,h:1},{x:0,y:25,w:8,h:1},
                        {x:40,y:26,w:25,h:1},{x:40,y:5,w:25,h:1},
                        {x:68,y:26,w:30,h:1},
                        {x:100,y:26,w:20,h:1},{x:100,y:5,w:20,h:1},
                        {x:122,y:26,w:58,h:1},
                        {x:15,y:22,w:5,h:1},{x:25,y:20,w:5,h:1},
                        {x:75,y:22,w:5,h:1},{x:85,y:20,w:5,h:1},
                        {x:130,y:22,w:6,h:1},{x:145,y:20,w:5,h:1},{x:160,y:22,w:5,h:1},
                    ],
                    platforms: [
                        {x:10,y:24,w:4},{x:20,y:22,w:3},{x:30,y:24,w:4},
                        // Inside low-G zone
                        {x:45,y:22,w:4},{x:50,y:18,w:4},{x:55,y:14,w:4},{x:48,y:10,w:4},{x:58,y:8,w:3},
                        {x:70,y:24,w:4},{x:78,y:22,w:3},{x:88,y:24,w:4},{x:95,y:22,w:3},
                        // Inside reverse-G zone
                        {x:105,y:22,w:4},{x:110,y:16,w:4},{x:105,y:10,w:4},{x:115,y:8,w:3},
                        {x:128,y:24,w:4},{x:135,y:22,w:3},{x:142,y:20,w:3},
                        {x:150,y:24,w:4},{x:158,y:22,w:3},{x:165,y:24,w:4},{x:172,y:22,w:3},
                    ],
                    rooms: [
                        {type:'treasure',x:52,y:6},
                    ],
                    items: [
                        {x:5,y:25,ch:'4'},{x:12,y:23,ch:'4'},{x:22,y:21,ch:'4'},
                        {x:47,y:21,ch:'4'},{x:52,y:17,ch:'4'},{x:57,y:13,ch:'4'},
                        {x:72,y:25,ch:'4'},{x:80,y:21,ch:'4'},
                        {x:107,y:21,ch:'4'},{x:112,y:15,ch:'4'},
                        {x:132,y:21,ch:'4'},{x:147,y:19,ch:'4'},{x:162,y:21,ch:'4'},
                        {x:36,y:25,ch:'7'},{x:96,y:25,ch:'7'},{x:155,y:25,ch:'7'},
                        {x:56,y:7,ch:'M'}, // magnet power in low-G treasure room
                        {x:178,y:25,ch:'5'},
                    ],
                }),
                enemies: [
                    {type:'rockroller',x:15,y:25,patrol:4},
                    {type:'astro',x:48,y:18,patrol:5,flying:true},
                    {type:'astro',x:55,y:12,patrol:4,flying:true},
                    {type:'rockroller',x:75,y:25,patrol:4},
                    {type:'astro',x:108,y:14,patrol:5,flying:true},
                    {type:'rockroller',x:130,y:25,patrol:4},
                    {type:'orbiter',x:150,y:18,patrol:4,flying:true},
                    {type:'rockroller',x:168,y:25,patrol:3},
                ],
                portals: [
                    {id:'A',x:60,y:7,color:'blue',target:'B'},
                    {id:'B',x:170,y:21,color:'orange',target:'A'},
                ],
                hint: 'Purple zones = LOW gravity!\nRed zones = REVERSE gravity!\nUse momentum wisely. H for hints.',
            },
            {
                name: '2-2: FREEFALL',
                width: 200, height: 30,
                playerStart: [2, 24],
                gravityZones: [
                    {x:50,y:5,w:20,h:20,gravity:0.05},
                    {x:110,y:5,w:25,h:20,gravity:-0.10},
                ],
                map: buildLevel({
                    width: 200, height: 30,
                    terrain: [
                        {x:0,y:26,w:48,h:1},{x:0,y:25,w:8,h:1},
                        {x:50,y:26,w:20,h:1},{x:50,y:5,w:20,h:1},
                        {x:74,y:26,w:34,h:1},
                        {x:110,y:26,w:25,h:1},{x:110,y:5,w:25,h:1},
                        {x:138,y:26,w:62,h:1},
                        {x:20,y:22,w:5,h:1},{x:35,y:20,w:5,h:1},
                        {x:80,y:22,w:6,h:1},{x:95,y:20,w:5,h:1},
                        {x:150,y:22,w:6,h:1},{x:165,y:20,w:5,h:1},{x:180,y:22,w:5,h:1},
                    ],
                    platforms: [
                        {x:10,y:24,w:4},{x:18,y:22,w:3},{x:28,y:24,w:4},{x:38,y:22,w:3},
                        {x:55,y:20,w:4},{x:60,y:14,w:4},{x:55,y:8,w:4},{x:65,y:10,w:3},
                        {x:78,y:24,w:4},{x:86,y:22,w:3},{x:92,y:20,w:3},{x:100,y:24,w:4},
                        {x:115,y:20,w:4},{x:120,y:14,w:4},{x:115,y:8,w:4},{x:128,y:12,w:3},
                        {x:145,y:24,w:4},{x:155,y:22,w:3},{x:162,y:20,w:3},
                        {x:172,y:24,w:4},{x:182,y:22,w:3},{x:190,y:24,w:4},
                    ],
                    items: [
                        {x:5,y:25,ch:'4'},{x:15,y:23,ch:'4'},{x:25,y:21,ch:'4'},
                        {x:57,y:19,ch:'4'},{x:62,y:13,ch:'4'},
                        {x:82,y:21,ch:'4'},{x:95,y:19,ch:'4'},
                        {x:117,y:19,ch:'4'},{x:122,y:13,ch:'4'},
                        {x:152,y:21,ch:'4'},{x:167,y:19,ch:'4'},
                        {x:45,y:25,ch:'7'},{x:105,y:25,ch:'7'},{x:170,y:25,ch:'7'},
                        {x:63,y:9,ch:'Z'}, // timeslow power
                        {x:198,y:25,ch:'5'},
                    ],
                }),
                enemies: [
                    {type:'rockroller',x:20,y:25,patrol:4},
                    {type:'astro',x:58,y:16,patrol:5,flying:true},
                    {type:'astro',x:62,y:10,patrol:4,flying:true},
                    {type:'rockroller',x:85,y:25,patrol:4},
                    {type:'astro',x:118,y:14,patrol:5,flying:true},
                    {type:'orbiter',x:125,y:10,patrol:4,flying:true},
                    {type:'rockroller',x:150,y:25,patrol:4},
                    {type:'astro',x:175,y:18,patrol:4,flying:true},
                    {type:'rockroller',x:188,y:25,patrol:3},
                ],
                portals: [
                    {id:'A',x:57,y:7,color:'blue',target:'B'},
                    {id:'B',x:185,y:21,color:'orange',target:'A'},
                ],
                hint: 'Low-G zones let you soar!\nReverse-G: you fall UP.\nPortals link distant areas.',
            },
            {
                name: '2-3: ORBITAL MECHANICS',
                width: 160, height: 30,
                playerStart: [2, 24],
                gravityZones: [
                    {x:30,y:5,w:40,h:20,gravity:0.05},
                ],
                map: buildLevel({
                    width: 160, height: 30,
                    terrain: [
                        {x:0,y:26,w:28,h:1},{x:0,y:25,w:8,h:1},
                        {x:30,y:26,w:40,h:1},{x:30,y:5,w:40,h:1},
                        {x:74,y:26,w:86,h:1},
                        {x:15,y:22,w:5,h:1},
                        {x:80,y:22,w:6,h:1},{x:95,y:20,w:5,h:1},
                        {x:110,y:22,w:5,h:1},{x:125,y:20,w:5,h:1},{x:140,y:22,w:5,h:1},
                    ],
                    platforms: [
                        {x:10,y:24,w:4},{x:20,y:22,w:3},
                        {x:35,y:22,w:4},{x:42,y:18,w:4},{x:50,y:14,w:4},{x:45,y:10,w:4},{x:55,y:8,w:3},{x:60,y:12,w:3},{x:58,y:18,w:4},{x:65,y:22,w:3},
                        {x:78,y:24,w:4},{x:88,y:22,w:3},{x:98,y:24,w:4},
                        {x:108,y:24,w:4},{x:118,y:22,w:3},{x:128,y:24,w:4},
                        {x:138,y:24,w:4},{x:148,y:22,w:3},{x:155,y:24,w:3},
                    ],
                    items: [
                        {x:5,y:25,ch:'4'},{x:12,y:23,ch:'4'},
                        {x:37,y:21,ch:'4'},{x:44,y:17,ch:'4'},{x:52,y:13,ch:'4'},{x:48,y:9,ch:'4'},
                        {x:82,y:21,ch:'4'},{x:97,y:19,ch:'4'},
                        {x:115,y:21,ch:'4'},{x:130,y:19,ch:'4'},{x:145,y:21,ch:'4'},
                        {x:25,y:25,ch:'7'},{x:100,y:25,ch:'7'},
                        {x:57,y:7,ch:'D'}, // dash power at top of low-G
                        {x:158,y:25,ch:'5'},
                    ],
                }),
                enemies: [
                    {type:'rockroller',x:12,y:25,patrol:3},
                    {type:'astro',x:40,y:18,patrol:6,flying:true},
                    {type:'astro',x:52,y:12,patrol:5,flying:true},
                    {type:'orbiter',x:48,y:8,patrol:4,flying:true},
                    {type:'rockroller',x:82,y:25,patrol:4},
                    {type:'astro',x:95,y:18,patrol:4,flying:true},
                    {type:'rockroller',x:115,y:25,patrol:3},
                    {type:'orbiter',x:135,y:18,patrol:4,flying:true},
                    {type:'rockroller',x:148,y:25,patrol:3},
                ],
                hint: 'Massive low-G zone! Float up\nthrough the platforms. Dash power\nawaits at the top!',
            },
        ]
    },

    // ======== WORLD 3: VOLT VALLEY ========
    {
        name: 'VOLT VALLEY',
        subtitle: 'The Science of Electricity',
        description: 'The power grid is down!\nStep on ALL switches to\ncomplete circuits and open gates.',
        bgColor: '#001122', bgColor2: '#002244',
        musicTrack: 'world3',
        tileGround: 'ground_w3', tileDirt: 'metal_w3', tilePlatform: 'platform_w1',
        scienceConcept: 'ELECTRICITY',
        scienceLesson: 'Electricity needs a COMPLETE circuit!\nStep on ALL switches in a circuit\nto power the gate open. Some gates\nneed 2 switches - find both!',
        levels: [
            {
                name: '3-1: CIRCUIT BREAKER',
                width: 180, height: 30, playerStart: [2, 24],
                circuits: [{switches:[[50,24]],gate:[80,26]},{switches:[[120,24],[140,20]],gate:[165,26]}],
                map: buildLevel({
                    width: 180, height: 30,
                    terrain: [
                        {x:0,y:26,w:78,h:1},{x:0,y:25,w:8,h:1},
                        {x:80,y:26,w:83,h:1},{x:165,y:26,w:15,h:1},
                        {x:20,y:22,w:5,h:1},{x:35,y:20,w:5,h:1},
                        {x:60,y:22,w:6,h:1},{x:75,y:20,w:5,h:1},
                        {x:90,y:22,w:6,h:1},{x:105,y:20,w:5,h:1},
                        {x:130,y:22,w:5,h:1},{x:145,y:18,w:5,h:1},
                    ],
                    platforms: [
                        {x:10,y:24,w:4},{x:18,y:22,w:3},{x:28,y:24,w:4},{x:38,y:22,w:3},
                        {x:48,y:24,w:4},{x:55,y:22,w:3},{x:65,y:24,w:4},{x:72,y:22,w:3},
                        {x:85,y:24,w:4},{x:95,y:22,w:3},{x:108,y:24,w:4},{x:115,y:22,w:3},
                        {x:118,y:24,w:4},{x:128,y:22,w:3},{x:135,y:20,w:3},{x:142,y:18,w:3},
                        {x:155,y:24,w:4},{x:162,y:22,w:3},{x:170,y:24,w:4},
                    ],
                    items: [
                        {x:5,y:25,ch:'4'},{x:15,y:23,ch:'4'},{x:30,y:23,ch:'4'},
                        {x:52,y:21,ch:'4'},{x:68,y:23,ch:'4'},
                        {x:92,y:21,ch:'4'},{x:110,y:23,ch:'4'},
                        {x:133,y:21,ch:'4'},{x:148,y:17,ch:'4'},
                        {x:40,y:25,ch:'7'},{x:100,y:25,ch:'7'},{x:155,y:25,ch:'7'},
                        {x:75,y:19,ch:'Z'}, // timeslow
                        {x:178,y:25,ch:'5'},
                    ],
                }),
                enemies: [
                    {type:'spark',x:15,y:25,patrol:4},{type:'coilbot',x:28,y:25,patrol:3},
                    {type:'spinner',x:45,y:18,patrol:0,flying:true},
                    {type:'spark',x:60,y:25,patrol:4},{type:'coilbot',x:72,y:25,patrol:3},
                    {type:'spark',x:90,y:25,patrol:4},{type:'orbiter',x:105,y:18,patrol:4,flying:true},
                    {type:'coilbot',x:125,y:25,patrol:3},{type:'spark',x:140,y:25,patrol:4},
                    {type:'spinner',x:155,y:18,patrol:0,flying:true},{type:'coilbot',x:168,y:25,patrol:3},
                ],
                hint: 'Step on SWITCHES to open gates!\nFirst gate needs 1 switch.\nSecond gate needs 2 switches!',
            },
            {
                name: '3-2: CONDUCTOR',
                width: 180, height: 30, playerStart: [2, 24],
                circuits: [{switches:[[45,24],[85,20]],gate:[120,26]}],
                map: buildLevel({
                    width: 180, height: 30,
                    terrain: [
                        {x:0,y:26,w:118,h:1},{x:0,y:25,w:8,h:1},
                        {x:120,y:26,w:60,h:1},
                        {x:20,y:22,w:5,h:1},{x:35,y:20,w:5,h:1},
                        {x:55,y:22,w:6,h:1},{x:70,y:20,w:5,h:1},
                        {x:90,y:18,w:6,h:1},
                        {x:130,y:22,w:6,h:1},{x:150,y:20,w:5,h:1},
                    ],
                    platforms: [
                        {x:10,y:24,w:4},{x:18,y:22,w:3},{x:28,y:24,w:4},{x:38,y:22,w:3},
                        {x:43,y:24,w:4},{x:52,y:22,w:3},{x:60,y:24,w:4},{x:68,y:22,w:3},
                        {x:78,y:24,w:4},{x:82,y:20,w:4},{x:95,y:22,w:3},
                        {x:105,y:24,w:4},{x:112,y:22,w:3},
                        {x:125,y:24,w:4},{x:135,y:22,w:3},{x:145,y:24,w:4},{x:155,y:22,w:3},
                        {x:165,y:24,w:4},{x:172,y:22,w:3},
                    ],
                    items: [
                        {x:5,y:25,ch:'4'},{x:15,y:23,ch:'4'},{x:30,y:23,ch:'4'},
                        {x:57,y:21,ch:'4'},{x:72,y:19,ch:'4'},
                        {x:92,y:17,ch:'4'},{x:107,y:23,ch:'4'},
                        {x:137,y:21,ch:'4'},{x:152,y:19,ch:'4'},
                        {x:50,y:25,ch:'7'},{x:100,y:25,ch:'7'},{x:150,y:25,ch:'7'},
                        {x:92,y:17,ch:'M'}, // magnet power
                        {x:178,y:25,ch:'5'},
                    ],
                }),
                enemies: [
                    {type:'spark',x:18,y:25,patrol:4},{type:'coilbot',x:30,y:25,patrol:3},
                    {type:'spinner',x:48,y:18,patrol:0,flying:true},
                    {type:'spark',x:62,y:25,patrol:4},{type:'orbiter',x:75,y:16,patrol:4,flying:true},
                    {type:'coilbot',x:88,y:25,patrol:3},{type:'spark',x:105,y:25,patrol:4},
                    {type:'spinner',x:115,y:18,patrol:0,flying:true},
                    {type:'coilbot',x:135,y:25,patrol:3},{type:'spark',x:158,y:25,patrol:4},
                    {type:'orbiter',x:168,y:18,patrol:4,flying:true},
                ],
                hint: 'Both switches needed for the gate!\nOne is high up - wall-jump to reach it.',
            },
            {
                name: '3-3: OVERLOAD',
                width: 120, height: 30, playerStart: [2, 24],
                circuits: [{switches:[[35,24]],gate:[55,26]},{switches:[[80,24]],gate:[100,26]}],
                map: buildLevel({
                    width: 120, height: 30,
                    terrain: [
                        {x:0,y:26,w:53,h:1},{x:0,y:25,w:8,h:1},
                        {x:55,y:26,w:43,h:1},{x:100,y:26,w:20,h:1},
                        {x:15,y:22,w:5,h:1},{x:30,y:20,w:5,h:1},
                        {x:60,y:22,w:5,h:1},{x:75,y:20,w:5,h:1},
                    ],
                    platforms: [
                        {x:10,y:24,w:4},{x:18,y:22,w:3},{x:25,y:24,w:4},
                        {x:33,y:24,w:4},{x:42,y:22,w:3},{x:48,y:24,w:4},
                        {x:58,y:24,w:4},{x:65,y:22,w:3},{x:72,y:24,w:4},
                        {x:78,y:24,w:4},{x:88,y:22,w:3},{x:95,y:24,w:4},
                        {x:105,y:24,w:4},{x:112,y:22,w:3},
                    ],
                    items: [
                        {x:5,y:25,ch:'4'},{x:20,y:21,ch:'4'},{x:35,y:19,ch:'4'},
                        {x:62,y:21,ch:'4'},{x:78,y:19,ch:'4'},
                        {x:108,y:23,ch:'4'},
                        {x:25,y:25,ch:'7'},{x:70,y:25,ch:'7'},
                        {x:118,y:25,ch:'5'},
                    ],
                }),
                enemies: [
                    {type:'spark',x:15,y:25,patrol:3},{type:'coilbot',x:25,y:25,patrol:3},
                    {type:'spinner',x:40,y:18,patrol:0,flying:true},
                    {type:'spark',x:55,y:25,patrol:4},{type:'coilbot',x:65,y:25,patrol:3},
                    {type:'orbiter',x:72,y:16,patrol:3,flying:true},
                    {type:'spark',x:85,y:25,patrol:4},{type:'coilbot',x:95,y:25,patrol:3},
                    {type:'spinner',x:108,y:18,patrol:0,flying:true},
                ],
                hint: 'Two gates, two switches.\nWatch for spinners shooting!',
            },
        ]
    },

    // ======== WORLD 4: CRYO CAVERNS ========
    {
        name: 'CRYO CAVERNS',
        subtitle: 'The Science of Heat',
        description: 'Everything is frozen!\nIcy surfaces are slippery.\nBe careful near edges!',
        bgColor: '#334466', bgColor2: '#112233',
        musicTrack: 'world4',
        tileGround: 'ground_w4', tileDirt: 'ice_w4', tilePlatform: 'platform_w1',
        scienceConcept: 'THERMODYNAMICS',
        scienceLesson: 'Ice is slippery because a thin\nlayer melts under pressure!\nYou SLIDE on icy ground here.\nBe careful - low friction!',
        levels: [
            {
                name: '4-1: COLD FRONT',
                width: 180, height: 30, playerStart: [2, 24], icePhysics: true,
                map: buildLevel({
                    width: 180, height: 30,
                    terrain: [
                        {x:0,y:26,w:45,h:1},{x:0,y:25,w:8,h:1},
                        {x:48,y:26,w:40,h:1},{x:92,y:26,w:40,h:1},{x:135,y:26,w:45,h:1},
                        {x:20,y:22,w:5,h:1},{x:55,y:22,w:5,h:1},{x:100,y:22,w:6,h:1},
                        {x:145,y:22,w:5,h:1},{x:165,y:20,w:5,h:1},
                    ],
                    platforms: [
                        {x:10,y:24,w:4},{x:18,y:22,w:3},{x:28,y:24,w:4},{x:38,y:22,w:3},
                        {x:50,y:24,w:4},{x:58,y:22,w:3},{x:65,y:24,w:4},{x:72,y:22,w:3},{x:80,y:24,w:4},
                        {x:95,y:24,w:4},{x:105,y:22,w:3},{x:112,y:24,w:4},{x:120,y:22,w:3},{x:128,y:24,w:4},
                        {x:140,y:24,w:4},{x:150,y:22,w:3},{x:158,y:24,w:4},{x:168,y:22,w:3},
                    ],
                    rooms: [{type:'treasure',x:85,y:20}],
                    items: [
                        {x:5,y:25,ch:'4'},{x:15,y:23,ch:'4'},{x:25,y:21,ch:'4'},
                        {x:52,y:23,ch:'4'},{x:60,y:21,ch:'4'},{x:70,y:23,ch:'4'},
                        {x:98,y:23,ch:'4'},{x:108,y:21,ch:'4'},
                        {x:142,y:23,ch:'4'},{x:155,y:21,ch:'4'},{x:170,y:19,ch:'4'},
                        {x:42,y:25,ch:'7'},{x:90,y:25,ch:'7'},{x:140,y:25,ch:'7'},
                        {x:165,y:19,ch:'F'}, // float power
                        {x:178,y:25,ch:'5'},
                    ],
                }),
                enemies: [
                    {type:'frostGhost',x:20,y:18,patrol:5,flying:true},
                    {type:'iceBat',x:35,y:16,patrol:4,flying:true},
                    {type:'frostGhost',x:55,y:18,patrol:4,flying:true},
                    {type:'iceBat',x:70,y:16,patrol:5,flying:true},
                    {type:'frostGhost',x:100,y:18,patrol:4,flying:true},
                    {type:'iceBat',x:118,y:16,patrol:4,flying:true},
                    {type:'orbiter',x:130,y:18,patrol:3,flying:true},
                    {type:'frostGhost',x:150,y:18,patrol:4,flying:true},
                    {type:'iceBat',x:165,y:16,patrol:3,flying:true},
                ],
                hint: 'ICE is slippery! You slide far.\nBe careful near edges.\nH for hints near puzzles.',
            },
            {
                name: '4-2: PHASE SHIFT',
                width: 180, height: 30, playerStart: [2, 24], icePhysics: true,
                map: buildLevel({
                    width: 180, height: 30,
                    terrain: [
                        {x:0,y:26,w:45,h:1},{x:0,y:25,w:8,h:1},
                        {x:48,y:26,w:40,h:1},{x:92,y:26,w:40,h:1},{x:135,y:26,w:45,h:1},
                        {x:20,y:22,w:5,h:1},{x:55,y:22,w:5,h:1},{x:100,y:22,w:6,h:1},
                        {x:145,y:22,w:5,h:1},{x:160,y:20,w:5,h:1},
                    ],
                    platforms: [
                        {x:10,y:24,w:4},{x:18,y:22,w:3},{x:28,y:24,w:4},{x:38,y:22,w:3},
                        {x:50,y:24,w:4},{x:58,y:22,w:3},{x:65,y:24,w:4},{x:72,y:22,w:3},{x:80,y:24,w:4},
                        {x:95,y:24,w:4},{x:105,y:22,w:3},{x:112,y:24,w:4},{x:120,y:22,w:3},{x:128,y:24,w:4},
                        {x:140,y:24,w:4},{x:150,y:22,w:3},{x:158,y:24,w:4},{x:168,y:22,w:3},
                    ],
                    items: [
                        {x:5,y:25,ch:'4'},{x:15,y:23,ch:'4'},{x:52,y:23,ch:'4'},{x:68,y:23,ch:'4'},
                        {x:98,y:23,ch:'4'},{x:115,y:23,ch:'4'},{x:148,y:23,ch:'4'},{x:162,y:19,ch:'4'},
                        {x:42,y:25,ch:'7'},{x:90,y:25,ch:'7'},{x:140,y:25,ch:'7'},
                        {x:178,y:25,ch:'5'},
                    ],
                }),
                enemies: [
                    {type:'frostGhost',x:18,y:18,patrol:5,flying:true},{type:'iceBat',x:32,y:16,patrol:4,flying:true},
                    {type:'frostGhost',x:52,y:18,patrol:4,flying:true},{type:'iceBat',x:68,y:16,patrol:5,flying:true},
                    {type:'spinner',x:80,y:18,patrol:0,flying:true},
                    {type:'frostGhost',x:102,y:18,patrol:4,flying:true},{type:'iceBat',x:122,y:16,patrol:4,flying:true},
                    {type:'orbiter',x:135,y:18,patrol:3,flying:true},
                    {type:'frostGhost',x:155,y:18,patrol:4,flying:true},{type:'iceBat',x:170,y:16,patrol:3,flying:true},
                ],
                hint: 'Spinners shoot in 4 directions!\nUse photon blaster to take them out.',
            },
            {
                name: '4-3: ABSOLUTE ZERO',
                width: 120, height: 30, playerStart: [2, 24], icePhysics: true,
                map: buildLevel({
                    width: 120, height: 30,
                    terrain: [
                        {x:0,y:26,w:30,h:1},{x:0,y:25,w:8,h:1},
                        {x:34,y:26,w:30,h:1},{x:68,y:26,w:52,h:1},
                        {x:15,y:22,w:5,h:1},{x:40,y:22,w:5,h:1},{x:75,y:22,w:5,h:1},{x:100,y:20,w:5,h:1},
                    ],
                    platforms: [
                        {x:8,y:24,w:4},{x:18,y:22,w:3},{x:25,y:24,w:4},
                        {x:36,y:24,w:4},{x:45,y:22,w:3},{x:52,y:24,w:4},{x:60,y:22,w:3},
                        {x:72,y:24,w:4},{x:80,y:22,w:3},{x:88,y:24,w:4},{x:95,y:22,w:3},
                        {x:105,y:24,w:4},{x:112,y:22,w:3},
                    ],
                    items: [
                        {x:5,y:25,ch:'4'},{x:20,y:21,ch:'4'},{x:42,y:21,ch:'4'},
                        {x:77,y:21,ch:'4'},{x:102,y:19,ch:'4'},
                        {x:28,y:25,ch:'7'},{x:65,y:25,ch:'7'},
                        {x:118,y:25,ch:'5'},
                    ],
                }),
                enemies: [
                    {type:'frostGhost',x:15,y:18,patrol:4,flying:true},{type:'iceBat',x:25,y:16,patrol:3,flying:true},
                    {type:'frostGhost',x:42,y:18,patrol:4,flying:true},{type:'spinner',x:55,y:18,patrol:0,flying:true},
                    {type:'iceBat',x:65,y:16,patrol:4,flying:true},{type:'orbiter',x:80,y:16,patrol:3,flying:true},
                    {type:'frostGhost',x:92,y:18,patrol:4,flying:true},{type:'iceBat',x:108,y:16,patrol:3,flying:true},
                ],
                hint: 'The deepest caverns!\nWatch for orbiters circling.',
            },
        ]
    },

    // ======== WORLD 5: ENTROPY'S FORTRESS ========
    {
        name: "ENTROPY'S FORTRESS",
        subtitle: 'The Science of Energy',
        description: "Dr. Entropy's lair! Use\neverything you've learned\nto save Professor Helix!",
        bgColor: '#110000', bgColor2: '#220000',
        musicTrack: 'world5',
        tileGround: 'ground_w5', tileDirt: 'dark_w5', tilePlatform: 'platform_w1',
        scienceConcept: 'ENTROPY & ENERGY',
        scienceLesson: 'Energy cannot be created or destroyed\n- only transformed! This fortress\ncombines ALL science. Use every\nskill you have learned!',
        levels: [
            {
                name: '5-1: DARK CORRIDOR',
                width: 180, height: 30, playerStart: [2, 24],
                map: buildLevel({
                    width: 180, height: 30,
                    terrain: [
                        {x:0,y:26,w:45,h:1},{x:0,y:25,w:8,h:1},
                        {x:48,y:26,w:40,h:1},{x:92,y:26,w:40,h:1},{x:135,y:26,w:45,h:1},
                        {x:20,y:22,w:5,h:1},{x:55,y:22,w:6,h:1},{x:100,y:22,w:6,h:1},
                        {x:145,y:22,w:5,h:1},{x:165,y:20,w:5,h:1},
                    ],
                    platforms: [
                        {x:10,y:24,w:4},{x:18,y:22,w:3},{x:28,y:24,w:4},{x:38,y:22,w:3},
                        {x:50,y:24,w:4},{x:58,y:22,w:3},{x:65,y:24,w:4},{x:72,y:22,w:3},{x:80,y:24,w:4},
                        {x:95,y:24,w:4},{x:105,y:22,w:3},{x:112,y:24,w:4},{x:120,y:22,w:3},{x:128,y:24,w:4},
                        {x:140,y:24,w:4},{x:150,y:22,w:3},{x:158,y:24,w:4},{x:168,y:22,w:3},
                    ],
                    rooms: [{type:'treasure',x:85,y:20}],
                    items: [
                        {x:5,y:25,ch:'4'},{x:15,y:23,ch:'4'},{x:30,y:23,ch:'4'},
                        {x:52,y:23,ch:'4'},{x:68,y:23,ch:'4'},{x:82,y:23,ch:'4'},
                        {x:98,y:23,ch:'4'},{x:118,y:23,ch:'4'},
                        {x:148,y:23,ch:'4'},{x:170,y:19,ch:'4'},
                        {x:42,y:25,ch:'7'},{x:90,y:25,ch:'7'},{x:140,y:25,ch:'7'},
                        {x:165,y:19,ch:'S'}, // shield
                        {x:178,y:25,ch:'5'},
                    ],
                }),
                enemies: [
                    {type:'drone',x:18,y:18,patrol:5,flying:true},{type:'chaosOrb',x:32,y:16,patrol:4,flying:true},
                    {type:'drone',x:55,y:18,patrol:4,flying:true},{type:'chaosOrb',x:72,y:16,patrol:5,flying:true},
                    {type:'spinner',x:82,y:18,patrol:0,flying:true},
                    {type:'drone',x:102,y:18,patrol:4,flying:true},{type:'chaosOrb',x:122,y:16,patrol:4,flying:true},
                    {type:'orbiter',x:135,y:18,patrol:3,flying:true},
                    {type:'drone',x:155,y:18,patrol:4,flying:true},{type:'chaosOrb',x:170,y:16,patrol:3,flying:true},
                ],
                hint: 'The fortress is dangerous!\nUse photon blaster on drones.\nChaos orbs are unpredictable.',
            },
            {
                name: '5-2: CHAOS ENGINE',
                width: 200, height: 30, playerStart: [2, 24],
                gravityZones: [{x:60,y:5,w:25,h:20,gravity:0.06}],
                map: buildLevel({
                    width: 200, height: 30,
                    terrain: [
                        {x:0,y:26,w:58,h:1},{x:0,y:25,w:8,h:1},
                        {x:60,y:26,w:25,h:1},{x:60,y:5,w:25,h:1},
                        {x:88,y:26,w:112,h:1},
                        {x:20,y:22,w:5,h:1},{x:40,y:20,w:5,h:1},
                        {x:100,y:22,w:6,h:1},{x:120,y:20,w:5,h:1},{x:140,y:22,w:5,h:1},
                        {x:160,y:20,w:5,h:1},{x:180,y:22,w:5,h:1},
                    ],
                    platforms: [
                        {x:10,y:24,w:4},{x:18,y:22,w:3},{x:28,y:24,w:4},{x:38,y:22,w:3},{x:48,y:24,w:4},
                        {x:65,y:20,w:4},{x:72,y:14,w:4},{x:65,y:8,w:4},{x:78,y:10,w:3},
                        {x:92,y:24,w:4},{x:102,y:22,w:3},{x:112,y:24,w:4},{x:122,y:22,w:3},
                        {x:132,y:24,w:4},{x:142,y:22,w:3},{x:152,y:24,w:4},{x:162,y:22,w:3},
                        {x:172,y:24,w:4},{x:182,y:22,w:3},{x:192,y:24,w:4},
                    ],
                    items: [
                        {x:5,y:25,ch:'4'},{x:22,y:21,ch:'4'},{x:42,y:19,ch:'4'},
                        {x:67,y:19,ch:'4'},{x:74,y:13,ch:'4'},{x:67,y:7,ch:'4'},
                        {x:95,y:23,ch:'4'},{x:115,y:23,ch:'4'},{x:145,y:23,ch:'4'},{x:175,y:23,ch:'4'},
                        {x:50,y:25,ch:'7'},{x:110,y:25,ch:'7'},{x:165,y:25,ch:'7'},
                        {x:80,y:9,ch:'Z'}, // timeslow at top of gravity zone
                        {x:198,y:25,ch:'5'},
                    ],
                }),
                enemies: [
                    {type:'drone',x:20,y:18,patrol:5,flying:true},{type:'chaosOrb',x:38,y:16,patrol:4,flying:true},
                    {type:'drone',x:68,y:14,patrol:5,flying:true},{type:'orbiter',x:75,y:8,patrol:3,flying:true},
                    {type:'drone',x:100,y:18,patrol:4,flying:true},{type:'chaosOrb',x:125,y:16,patrol:5,flying:true},
                    {type:'spinner',x:138,y:18,patrol:0,flying:true},
                    {type:'drone',x:158,y:18,patrol:4,flying:true},{type:'chaosOrb',x:178,y:16,patrol:3,flying:true},
                    {type:'orbiter',x:190,y:18,patrol:3,flying:true},
                ],
                hint: 'Low gravity zone ahead!\nTimeslow power awaits at the\ntop if you can reach it.',
            },
            {
                name: '5-3: DR. ENTROPY',
                width: 80, height: 30, playerStart: [2, 24],
                isBoss: true, bossType: 'entropy',
                map: buildLevel({
                    width: 80, height: 30,
                    terrain: [
                        {x:0,y:26,w:22,h:1},{x:0,y:25,w:8,h:1},
                        {x:22,y:26,w:35,h:1},
                        {x:22,y:15,w:1,h:9},{x:56,y:15,w:1,h:12},{x:22,y:15,w:35,h:1},
                        {x:57,y:26,w:23,h:1},
                    ],
                    platforms: [
                        {x:8,y:24,w:4},{x:14,y:22,w:4},
                        {x:25,y:24,w:5},{x:35,y:24,w:6},{x:47,y:24,w:5},
                        {x:28,y:22,w:4},{x:37,y:22,w:5},{x:45,y:22,w:4},
                        {x:31,y:20,w:4},{x:40,y:20,w:4},
                        {x:34,y:18,w:6},
                    ],
                    items: [
                        {x:16,y:21,ch:'S'},{x:20,y:25,ch:'7'},{x:55,y:25,ch:'5'},
                    ],
                }),
                bossPuzzle: {
                    type:'prism',
                    prisms:[{color:'red',x:27,y:23},{color:'green',x:46,y:21},{color:'blue',x:33,y:19}],
                    pedestals:[{x:36,y:25,color:null},{x:38,y:25,color:null},{x:40,y:25,color:null}],
                    roundsToWin:3,
                },
                enemies: [
                    {type:'orbiter',x:32,y:20,patrol:3,flying:true},
                    {type:'orbiter',x:46,y:20,patrol:3,flying:true},
                ],
                hint: 'Final battle! Collect R,G,B prisms.\nPlace on pedestals for WHITE LIGHT!\n3 rounds to defeat Dr. Entropy!',
            },
        ]
    },
];

// ============================================================
// STORY & MINI-GAMES (unchanged)
// ============================================================
const StoryScenes = {
    intro: [
        {speaker:'NARRATOR',text:'In a world where science governs\nall natural laws...'},
        {speaker:'NARRATOR',text:'Professor Helix, the greatest\nscientist alive, kept balance.'},
        {speaker:'DR. ENTROPY',text:'The laws of physics are MINE\nto control! Chaos will reign!'},
        {speaker:'NARRATOR',text:'Dr. Entropy kidnapped the\nProfessor and broke the laws\nof science across 5 worlds!'},
        {speaker:'LUX',text:"I'm Lux, the Professor's\napprentice. I have to save\nhim and restore science!"},
        {speaker:'NARRATOR',text:'Use your knowledge of science\nto overcome each world!'},
    ],
    world1_intro: [
        {speaker:'LUX',text:'Prism Peaks... the light here\nis all wrong. Colors are\nsplit apart!'},
        {speaker:'LUX',text:'Professor taught me about\noptics. I can fix this!'},
    ],
    world2_intro: [
        {speaker:'LUX',text:"Gravity Gorge! Everything is\nfloating... or falling the\nwrong way!"},
        {speaker:'LUX',text:'I need to use momentum and\nunderstand gravity to navigate.'},
    ],
    world3_intro: [
        {speaker:'LUX',text:'Volt Valley... the power is\nout everywhere. Circuits are\nbroken!'},
        {speaker:'LUX',text:'If I complete the circuits,\nI can open new paths!'},
    ],
    world4_intro: [
        {speaker:'LUX',text:"Cryo Caverns! It's freezing!\nEverything is covered in ice."},
        {speaker:'LUX',text:'Heat transfer and phase\nchanges... I can work with this!'},
    ],
    world5_intro: [
        {speaker:'LUX',text:"This is it. Entropy's\nFortress. The Professor\nmust be inside!"},
        {speaker:'DR. ENTROPY',text:'You made it this far?\nNo matter. Chaos always\nwins in the end!'},
        {speaker:'LUX',text:"Not today! Energy can't be\ndestroyed, and neither can\nmy determination!"},
    ],
    victory: [
        {speaker:'DR. ENTROPY',text:'Impossible! My entropy\nmachines... destroyed!'},
        {speaker:'LUX',text:'Professor Helix! Are you\nalright?'},
        {speaker:'PROF. HELIX',text:'Lux! You used science to\novercome every challenge.\nI am so proud!'},
        {speaker:'LUX',text:"I couldn't have done it\nwithout your teachings!"},
        {speaker:'NARRATOR',text:'And so, the laws of science\nwere restored. Knowledge\ntriumphed over chaos!'},
        {speaker:'NARRATOR',text:'CONGRATULATIONS!\n\nTHE END'},
    ]
};

const MiniGames = {
    scienceQuiz: {
        name:'SCIENCE QUIZ',
        questions: [
            {q:'What splits white light\ninto colors?',answers:['PRISM','MIRROR','LENS','MAGNET'],correct:0},
            {q:'What is the unit of\nelectric current?',answers:['VOLT','AMPERE','WATT','OHM'],correct:1},
            {q:'At what Celsius does\nwater freeze?',answers:['32','0','-10','100'],correct:1},
            {q:'What force pulls objects\ntoward Earth?',answers:['MAGNETISM','FRICTION','GRAVITY','TENSION'],correct:2},
            {q:'Momentum equals mass\ntimes what?',answers:['SPEED','VELOCITY','FORCE','TIME'],correct:1},
            {q:'Light travels fastest\nthrough what?',answers:['WATER','GLASS','VACUUM','AIR'],correct:2},
        ]
    },
    reflexChallenge: {name:'REFLEX TEST',description:'Hit ACTION when the\nlight turns GREEN!',rounds:5}
};
