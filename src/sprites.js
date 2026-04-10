// ============================================================
// AXIOM - Sprite & Animation System (Programmatic Pixel Art)
// Redesigned: Cuter Lux, more enemies, portals, powers
// ============================================================

const SpriteCache = {};

function createSprite(w, h, drawFn) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const cx = c.getContext('2d');
    drawFn(cx, w, h);
    return c;
}

function getCachedSprite(key, w, h, drawFn) {
    if (!SpriteCache[key]) {
        SpriteCache[key] = createSprite(w, h, drawFn);
    }
    return SpriteCache[key];
}

function pixel(cx, x, y, color) {
    cx.fillStyle = color;
    cx.fillRect(x, y, 1, 1);
}

function fillRect(cx, x, y, w, h, color) {
    cx.fillStyle = color;
    cx.fillRect(x, y, w, h);
}

// ---- Color Palettes ----
const PAL = {
    // Lux - cute round scientist with big eyes
    luxHair: '#5533aa',
    luxHairLight: '#7755cc',
    luxSkin: '#ffe0c0',
    luxSkinBlush: '#ffbbaa',
    luxCoat: '#44aadd',
    luxCoatLight: '#66ccff',
    luxCoatDark: '#3388bb',
    luxScarf: '#ff6688',
    luxPants: '#5566aa',
    luxBoots: '#443355',
    luxGoggles: '#ffdd33',
    luxEyeWhite: '#ffffff',
    luxEyeIris: '#3355cc',
    luxEyeShine: '#ffffff',

    // Dr. Entropy
    entHair: '#440044',
    entSkin: '#ddc0a0',
    entCape: '#660066',
    entCapeLight: '#880088',
    entArmor: '#333344',

    // World palettes
    w1Sky: '#88bbee', w1Ground: '#886644', w1Grass: '#55bb55',
    w2Sky: '#110022', w2Rock: '#554466', w2Ground: '#443355',
    w3Sky: '#001122', w3Metal: '#667788', w3Spark: '#00ffff', w3Ground: '#334455',
    w4Sky: '#334466', w4Ice: '#bbddff', w4Snow: '#eef4ff', w4Rock: '#556677',
    w5Sky: '#110000', w5Metal: '#443333', w5Glow: '#ff3300', w5Dark: '#221111', w5Floor: '#332222',
};

// ============================================================
// LUX - Cute Redesign (16x16) - bigger head, huge eyes, round
// ============================================================
const LuxSprites = {
    idleR: (frame) => getCachedSprite('lux_idleR_' + (Math.floor(frame/30) % 4), 16, 16, (cx) => {
        const breathe = Math.sin(frame * 0.08) * 0.5;
        const blink = (frame % 120) < 3;
        // Boots (tiny, cute)
        fillRect(cx, 4, 14, 3, 2, PAL.luxBoots);
        fillRect(cx, 9, 14, 3, 2, PAL.luxBoots);
        // Legs
        fillRect(cx, 5, 12, 2, 2, PAL.luxPants);
        fillRect(cx, 9, 12, 2, 2, PAL.luxPants);
        // Body (small, coat)
        fillRect(cx, 4, 8, 8, 4, PAL.luxCoat);
        fillRect(cx, 5, 8, 6, 4, PAL.luxCoatLight);
        // Scarf (cute accessory)
        fillRect(cx, 4, 7, 8, 2, PAL.luxScarf);
        pixel(cx, 11, 9, PAL.luxScarf); // scarf tail
        pixel(cx, 12, 10, PAL.luxScarf);
        // Arms (tiny)
        fillRect(cx, 3, 9, 1, 3, PAL.luxCoat);
        fillRect(cx, 12, 9, 1, 3, PAL.luxCoat);
        // Head (BIG and round - takes up top half)
        fillRect(cx, 3, 1, 10, 7, PAL.luxSkin);
        fillRect(cx, 4, 0, 8, 1, PAL.luxSkin);
        fillRect(cx, 4, 8, 8, 1, PAL.luxSkin);
        // Hair (fluffy on top)
        fillRect(cx, 3, 0, 10, 3, PAL.luxHair);
        fillRect(cx, 2, 1, 1, 3, PAL.luxHair);
        fillRect(cx, 13, 1, 1, 3, PAL.luxHair);
        pixel(cx, 4, 0, PAL.luxHairLight);
        pixel(cx, 6, 0, PAL.luxHairLight);
        pixel(cx, 8, 0, PAL.luxHairLight);
        // Ahoge (cute hair strand sticking up)
        pixel(cx, 7, -1 < 0 ? 0 : 0, PAL.luxHair);
        // Goggles on forehead
        fillRect(cx, 4, 2, 3, 1, '#888888');
        fillRect(cx, 9, 2, 3, 1, '#888888');
        fillRect(cx, 5, 2, 1, 1, PAL.luxGoggles);
        fillRect(cx, 10, 2, 1, 1, PAL.luxGoggles);
        // BIG cute eyes
        if (!blink) {
            // Eye whites (large)
            fillRect(cx, 4, 4, 3, 3, PAL.luxEyeWhite);
            fillRect(cx, 9, 4, 3, 3, PAL.luxEyeWhite);
            // Irises
            fillRect(cx, 5, 4, 2, 3, PAL.luxEyeIris);
            fillRect(cx, 10, 4, 2, 3, PAL.luxEyeIris);
            // Pupils
            pixel(cx, 6, 5, '#111133');
            pixel(cx, 11, 5, '#111133');
            // Sparkle/shine (makes eyes look alive)
            pixel(cx, 5, 4, PAL.luxEyeShine);
            pixel(cx, 10, 4, PAL.luxEyeShine);
        } else {
            // Blink - happy curved lines
            fillRect(cx, 4, 5, 3, 1, PAL.luxEyeIris);
            fillRect(cx, 9, 5, 3, 1, PAL.luxEyeIris);
        }
        // Rosy cheeks
        pixel(cx, 3, 6, PAL.luxSkinBlush);
        pixel(cx, 12, 6, PAL.luxSkinBlush);
        // Little smile
        pixel(cx, 7, 6, '#dd8877');
        pixel(cx, 8, 6, '#dd8877');
        pixel(cx, 7, 7, '#cc7766');
    }),

    walkR: (frame) => getCachedSprite('lux_walkR_' + (frame % 8), 16, 16, (cx) => {
        const f = frame % 8;
        const bounce = [0, -1, 0, 0, 0, -1, 0, 0][f];
        const legOff = [0, 1, 1, 0, 0, -1, -1, 0][f];
        // Boots animated
        fillRect(cx, 4 + legOff, 14, 3, 2, PAL.luxBoots);
        fillRect(cx, 9 - legOff, 14, 3, 2, PAL.luxBoots);
        // Legs
        fillRect(cx, 5, 12, 2, 2, PAL.luxPants);
        fillRect(cx, 9, 12, 2, 2, PAL.luxPants);
        // Body
        fillRect(cx, 4, 8 + bounce, 8, 4, PAL.luxCoat);
        fillRect(cx, 5, 8 + bounce, 6, 4, PAL.luxCoatLight);
        // Scarf bounces
        fillRect(cx, 4, 7 + bounce, 8, 2, PAL.luxScarf);
        pixel(cx, 11, 9 + bounce, PAL.luxScarf);
        pixel(cx, 12, 10, PAL.luxScarf);
        pixel(cx, 12, 11, PAL.luxScarf); // scarf trails behind
        // Arms swing
        const armOff = [0, 1, 0, -1, 0, 1, 0, -1][f];
        fillRect(cx, 3, 9 + armOff + bounce, 1, 3, PAL.luxCoat);
        fillRect(cx, 12, 9 - armOff + bounce, 1, 3, PAL.luxCoat);
        // Head (bounces gently)
        fillRect(cx, 3, 1 + bounce, 10, 7, PAL.luxSkin);
        fillRect(cx, 4, 0 + bounce, 8, 1, PAL.luxSkin);
        fillRect(cx, 4, 8 + bounce, 8, 1, PAL.luxSkin);
        // Hair
        fillRect(cx, 3, 0 + bounce, 10, 3, PAL.luxHair);
        fillRect(cx, 2, 1 + bounce, 1, 3, PAL.luxHair);
        fillRect(cx, 13, 1 + bounce, 1, 3, PAL.luxHair);
        pixel(cx, 4, 0 + bounce, PAL.luxHairLight);
        pixel(cx, 6, 0 + bounce, PAL.luxHairLight);
        // Goggles
        fillRect(cx, 4, 2 + bounce, 3, 1, '#888888');
        fillRect(cx, 9, 2 + bounce, 3, 1, '#888888');
        fillRect(cx, 5, 2 + bounce, 1, 1, PAL.luxGoggles);
        fillRect(cx, 10, 2 + bounce, 1, 1, PAL.luxGoggles);
        // Eyes (happy, determined)
        fillRect(cx, 4, 4 + bounce, 3, 3, PAL.luxEyeWhite);
        fillRect(cx, 9, 4 + bounce, 3, 3, PAL.luxEyeWhite);
        fillRect(cx, 5, 4 + bounce, 2, 3, PAL.luxEyeIris);
        fillRect(cx, 10, 4 + bounce, 2, 3, PAL.luxEyeIris);
        pixel(cx, 6, 5 + bounce, '#111133');
        pixel(cx, 11, 5 + bounce, '#111133');
        pixel(cx, 5, 4 + bounce, PAL.luxEyeShine);
        pixel(cx, 10, 4 + bounce, PAL.luxEyeShine);
        // Cheeks
        pixel(cx, 3, 6 + bounce, PAL.luxSkinBlush);
        pixel(cx, 12, 6 + bounce, PAL.luxSkinBlush);
        // Open smile
        pixel(cx, 7, 6 + bounce, '#dd8877');
        pixel(cx, 8, 6 + bounce, '#dd8877');
    }),

    jumpR: () => getCachedSprite('lux_jumpR', 16, 16, (cx) => {
        // Boots apart
        fillRect(cx, 3, 14, 3, 2, PAL.luxBoots);
        fillRect(cx, 10, 13, 3, 2, PAL.luxBoots);
        // Legs spread
        fillRect(cx, 4, 12, 2, 2, PAL.luxPants);
        fillRect(cx, 10, 11, 2, 2, PAL.luxPants);
        // Body
        fillRect(cx, 4, 7, 8, 4, PAL.luxCoat);
        fillRect(cx, 5, 7, 6, 4, PAL.luxCoatLight);
        // Scarf flies up
        fillRect(cx, 4, 6, 8, 2, PAL.luxScarf);
        pixel(cx, 12, 7, PAL.luxScarf);
        pixel(cx, 13, 8, PAL.luxScarf);
        pixel(cx, 13, 9, PAL.luxScarf);
        // Arms up (excited!)
        fillRect(cx, 2, 5, 2, 2, PAL.luxCoat);
        fillRect(cx, 12, 5, 2, 2, PAL.luxCoat);
        // Head
        fillRect(cx, 3, 0, 10, 7, PAL.luxSkin);
        fillRect(cx, 4, -1, 8, 1, PAL.luxSkin);
        // Hair
        fillRect(cx, 3, -1, 10, 3, PAL.luxHair);
        fillRect(cx, 2, 0, 1, 3, PAL.luxHair);
        fillRect(cx, 13, 0, 1, 3, PAL.luxHair);
        pixel(cx, 4, -1, PAL.luxHairLight);
        // Goggles
        fillRect(cx, 4, 1, 3, 1, '#888888');
        fillRect(cx, 9, 1, 3, 1, '#888888');
        fillRect(cx, 5, 1, 1, 1, PAL.luxGoggles);
        fillRect(cx, 10, 1, 1, 1, PAL.luxGoggles);
        // Wide excited eyes
        fillRect(cx, 4, 3, 3, 3, PAL.luxEyeWhite);
        fillRect(cx, 9, 3, 3, 3, PAL.luxEyeWhite);
        fillRect(cx, 5, 3, 2, 3, PAL.luxEyeIris);
        fillRect(cx, 10, 3, 2, 3, PAL.luxEyeIris);
        pixel(cx, 5, 3, PAL.luxEyeShine);
        pixel(cx, 10, 3, PAL.luxEyeShine);
        // Cheeks
        pixel(cx, 3, 5, PAL.luxSkinBlush);
        pixel(cx, 12, 5, PAL.luxSkinBlush);
        // Open mouth (o shape)
        pixel(cx, 7, 5, '#dd8877');
        pixel(cx, 8, 5, '#dd8877');
        pixel(cx, 7, 6, '#cc7766');
        pixel(cx, 8, 6, '#cc7766');
    }),

    fallR: () => getCachedSprite('lux_fallR', 16, 16, (cx) => {
        // Boots dangling
        fillRect(cx, 4, 14, 3, 2, PAL.luxBoots);
        fillRect(cx, 9, 14, 3, 2, PAL.luxBoots);
        // Legs
        fillRect(cx, 5, 12, 2, 2, PAL.luxPants);
        fillRect(cx, 9, 12, 2, 2, PAL.luxPants);
        // Body
        fillRect(cx, 4, 8, 8, 4, PAL.luxCoat);
        fillRect(cx, 5, 8, 6, 4, PAL.luxCoatLight);
        // Scarf flies way up
        fillRect(cx, 4, 7, 8, 2, PAL.luxScarf);
        pixel(cx, 12, 6, PAL.luxScarf);
        pixel(cx, 13, 5, PAL.luxScarf);
        pixel(cx, 13, 4, PAL.luxScarf);
        // Arms flailing
        fillRect(cx, 2, 6, 2, 3, PAL.luxCoat);
        fillRect(cx, 12, 6, 2, 3, PAL.luxCoat);
        // Head
        fillRect(cx, 3, 1, 10, 7, PAL.luxSkin);
        fillRect(cx, 4, 0, 8, 1, PAL.luxSkin);
        // Hair (wind blown)
        fillRect(cx, 3, -1, 10, 3, PAL.luxHair);
        fillRect(cx, 2, 0, 1, 3, PAL.luxHair);
        fillRect(cx, 13, 0, 1, 2, PAL.luxHair);
        // Goggles
        fillRect(cx, 4, 1, 3, 1, '#888888');
        fillRect(cx, 9, 1, 3, 1, '#888888');
        fillRect(cx, 5, 1, 1, 1, PAL.luxGoggles);
        fillRect(cx, 10, 1, 1, 1, PAL.luxGoggles);
        // Worried eyes
        fillRect(cx, 4, 4, 3, 3, PAL.luxEyeWhite);
        fillRect(cx, 9, 4, 3, 3, PAL.luxEyeWhite);
        fillRect(cx, 5, 4, 2, 2, PAL.luxEyeIris);
        fillRect(cx, 10, 4, 2, 2, PAL.luxEyeIris);
        pixel(cx, 5, 4, PAL.luxEyeShine);
        pixel(cx, 10, 4, PAL.luxEyeShine);
        // Cheeks
        pixel(cx, 3, 6, PAL.luxSkinBlush);
        pixel(cx, 12, 6, PAL.luxSkinBlush);
        // Worried mouth
        pixel(cx, 7, 7, '#cc7766');
        pixel(cx, 8, 7, '#cc7766');
    }),

    hurt: () => getCachedSprite('lux_hurt', 16, 16, (cx) => {
        fillRect(cx, 4, 14, 3, 2, PAL.luxBoots);
        fillRect(cx, 9, 14, 3, 2, PAL.luxBoots);
        fillRect(cx, 5, 12, 2, 2, PAL.luxPants);
        fillRect(cx, 9, 12, 2, 2, PAL.luxPants);
        fillRect(cx, 4, 8, 8, 4, PAL.luxCoat);
        fillRect(cx, 4, 7, 8, 2, PAL.luxScarf);
        // Arms out
        fillRect(cx, 1, 7, 3, 2, PAL.luxCoat);
        fillRect(cx, 12, 7, 3, 2, PAL.luxCoat);
        // Head
        fillRect(cx, 3, 1, 10, 7, PAL.luxSkin);
        fillRect(cx, 4, 0, 8, 1, PAL.luxSkin);
        fillRect(cx, 3, 0, 10, 3, PAL.luxHair);
        fillRect(cx, 2, 1, 1, 3, PAL.luxHair);
        fillRect(cx, 13, 1, 1, 3, PAL.luxHair);
        // Goggles askew
        fillRect(cx, 3, 2, 3, 1, '#888888');
        fillRect(cx, 9, 2, 3, 1, '#888888');
        // Dizzy eyes (spirals)
        pixel(cx, 5, 4, '#aa88cc'); pixel(cx, 6, 4, '#aa88cc');
        pixel(cx, 4, 5, '#aa88cc'); pixel(cx, 6, 5, '#aa88cc');
        pixel(cx, 5, 6, '#aa88cc');
        pixel(cx, 10, 4, '#aa88cc'); pixel(cx, 11, 4, '#aa88cc');
        pixel(cx, 9, 5, '#aa88cc'); pixel(cx, 11, 5, '#aa88cc');
        pixel(cx, 10, 6, '#aa88cc');
        // Sad mouth
        pixel(cx, 7, 7, '#cc7766');
        pixel(cx, 8, 7, '#cc7766');
        pixel(cx, 6, 6, '#cc7766');
        pixel(cx, 9, 6, '#cc7766');
    }),

    // Special power animations
    dashR: (frame) => getCachedSprite('lux_dashR_' + (frame % 4), 16, 16, (cx) => {
        // Streaked dash pose
        fillRect(cx, 6, 14, 3, 2, PAL.luxBoots);
        fillRect(cx, 7, 12, 2, 2, PAL.luxPants);
        fillRect(cx, 5, 8, 8, 4, PAL.luxCoat);
        fillRect(cx, 6, 8, 6, 4, PAL.luxCoatLight);
        fillRect(cx, 5, 7, 8, 2, PAL.luxScarf);
        // Scarf trails far behind
        fillRect(cx, 0, 7, 5, 1, PAL.luxScarf);
        fillRect(cx, 0, 8, 3, 1, PAL.luxScarf);
        // Arms forward
        fillRect(cx, 13, 8, 3, 2, PAL.luxCoat);
        // Head
        fillRect(cx, 4, 1, 10, 7, PAL.luxSkin);
        fillRect(cx, 5, 0, 8, 1, PAL.luxSkin);
        fillRect(cx, 4, 0, 10, 3, PAL.luxHair);
        fillRect(cx, 3, 1, 1, 3, PAL.luxHair);
        // Determined eyes
        fillRect(cx, 6, 4, 3, 2, PAL.luxEyeWhite);
        fillRect(cx, 11, 4, 3, 2, PAL.luxEyeWhite);
        fillRect(cx, 7, 4, 2, 2, PAL.luxEyeIris);
        fillRect(cx, 12, 4, 2, 2, PAL.luxEyeIris);
        pixel(cx, 7, 4, PAL.luxEyeShine);
        pixel(cx, 12, 4, PAL.luxEyeShine);
        // Speed lines
        const f = frame % 4;
        ctx.globalAlpha = 0.5;
        fillRect(cx, 0, 4 + f, 3, 1, '#88ccff');
        fillRect(cx, 0, 10 - f, 4, 1, '#88ccff');
        ctx.globalAlpha = 1;
    }),

    floatR: (frame) => getCachedSprite('lux_floatR_' + (frame % 8), 16, 16, (cx) => {
        const f = frame % 8;
        const hover = Math.sin(f * 0.8) * 1;
        // Same as idle but with sparkles and hover
        fillRect(cx, 4, 13 + hover, 3, 2, PAL.luxBoots);
        fillRect(cx, 9, 13 + hover, 3, 2, PAL.luxBoots);
        fillRect(cx, 5, 11 + hover, 2, 2, PAL.luxPants);
        fillRect(cx, 9, 11 + hover, 2, 2, PAL.luxPants);
        fillRect(cx, 4, 7 + hover, 8, 4, PAL.luxCoat);
        fillRect(cx, 5, 7 + hover, 6, 4, PAL.luxCoatLight);
        fillRect(cx, 4, 6 + hover, 8, 2, PAL.luxScarf);
        fillRect(cx, 3, 8 + hover, 1, 3, PAL.luxCoat);
        fillRect(cx, 12, 8 + hover, 1, 3, PAL.luxCoat);
        fillRect(cx, 3, 0 + hover, 10, 7, PAL.luxSkin);
        fillRect(cx, 4, -1 + hover, 8, 1, PAL.luxSkin);
        fillRect(cx, 3, -1 + hover, 10, 3, PAL.luxHair);
        fillRect(cx, 4, 3 + hover, 3, 3, PAL.luxEyeWhite);
        fillRect(cx, 9, 3 + hover, 3, 3, PAL.luxEyeWhite);
        fillRect(cx, 5, 3 + hover, 2, 3, PAL.luxEyeIris);
        fillRect(cx, 10, 3 + hover, 2, 3, PAL.luxEyeIris);
        pixel(cx, 5, 3 + hover, PAL.luxEyeShine);
        pixel(cx, 10, 3 + hover, PAL.luxEyeShine);
        // Sparkles around
        const sparkles = [[1, 3], [14, 5], [0, 10], [15, 8], [7, -1]];
        sparkles.forEach((s, i) => {
            if ((f + i) % 3 === 0) pixel(cx, s[0], s[1] + hover, '#ffff88');
        });
    }),

    // Shooting pose
    shootR: (frame) => getCachedSprite('lux_shootR_' + (frame % 4), 16, 16, (cx) => {
        const f = frame % 4;
        // Same body as idle but arm extended forward
        fillRect(cx, 4, 14, 3, 2, PAL.luxBoots);
        fillRect(cx, 9, 14, 3, 2, PAL.luxBoots);
        fillRect(cx, 5, 12, 2, 2, PAL.luxPants);
        fillRect(cx, 9, 12, 2, 2, PAL.luxPants);
        fillRect(cx, 4, 8, 8, 4, PAL.luxCoat);
        fillRect(cx, 5, 8, 6, 4, PAL.luxCoatLight);
        fillRect(cx, 4, 7, 8, 2, PAL.luxScarf);
        // Back arm
        fillRect(cx, 3, 9, 1, 3, PAL.luxCoat);
        // Extended arm with blaster
        fillRect(cx, 12, 8, 3, 2, PAL.luxCoat);
        fillRect(cx, 14, 7, 2, 3, '#888899'); // blaster
        pixel(cx, 15, 8, f < 2 ? '#00ffff' : '#88eeff'); // muzzle glow
        // Head
        fillRect(cx, 3, 1, 10, 7, PAL.luxSkin);
        fillRect(cx, 4, 0, 8, 1, PAL.luxSkin);
        fillRect(cx, 3, 0, 10, 3, PAL.luxHair);
        fillRect(cx, 2, 1, 1, 3, PAL.luxHair);
        fillRect(cx, 13, 1, 1, 3, PAL.luxHair);
        fillRect(cx, 4, 2, 3, 1, '#888888');
        fillRect(cx, 9, 2, 3, 1, '#888888');
        fillRect(cx, 5, 2, 1, 1, PAL.luxGoggles);
        fillRect(cx, 10, 2, 1, 1, PAL.luxGoggles);
        // Determined eyes
        fillRect(cx, 4, 4, 3, 3, PAL.luxEyeWhite);
        fillRect(cx, 9, 4, 3, 3, PAL.luxEyeWhite);
        fillRect(cx, 5, 4, 2, 3, PAL.luxEyeIris);
        fillRect(cx, 10, 4, 2, 3, PAL.luxEyeIris);
        pixel(cx, 5, 4, PAL.luxEyeShine);
        pixel(cx, 10, 4, PAL.luxEyeShine);
        pixel(cx, 3, 6, PAL.luxSkinBlush);
        pixel(cx, 12, 6, PAL.luxSkinBlush);
        pixel(cx, 7, 6, '#dd8877');
        pixel(cx, 8, 6, '#dd8877');
    }),

    // Wall slide
    wallSlide: (frame) => getCachedSprite('lux_wallSlide_' + (frame % 4), 16, 16, (cx) => {
        const f = frame % 4;
        // Pressed against wall, sliding down
        fillRect(cx, 5, 14, 3, 2, PAL.luxBoots);
        fillRect(cx, 9, 13, 3, 2, PAL.luxBoots);
        fillRect(cx, 6, 12, 2, 2, PAL.luxPants);
        fillRect(cx, 9, 11, 2, 2, PAL.luxPants);
        fillRect(cx, 5, 8, 7, 4, PAL.luxCoat);
        fillRect(cx, 6, 8, 5, 4, PAL.luxCoatLight);
        fillRect(cx, 5, 7, 7, 2, PAL.luxScarf);
        pixel(cx, 4, 8, PAL.luxScarf);
        pixel(cx, 3, 9, PAL.luxScarf);
        // Arms reaching toward wall
        fillRect(cx, 12, 7, 2, 2, PAL.luxCoat);
        fillRect(cx, 13, 6, 1, 2, PAL.luxSkin);
        // Head
        fillRect(cx, 4, 1, 9, 7, PAL.luxSkin);
        fillRect(cx, 5, 0, 7, 1, PAL.luxSkin);
        fillRect(cx, 4, 0, 9, 3, PAL.luxHair);
        fillRect(cx, 3, 1, 1, 3, PAL.luxHair);
        // Eyes looking at wall
        fillRect(cx, 6, 4, 3, 2, PAL.luxEyeWhite);
        fillRect(cx, 10, 4, 2, 2, PAL.luxEyeWhite);
        fillRect(cx, 7, 4, 2, 2, PAL.luxEyeIris);
        fillRect(cx, 10, 4, 2, 2, PAL.luxEyeIris);
        pixel(cx, 7, 4, PAL.luxEyeShine);
        // Slide particles
        if (f % 2 === 0) {
            pixel(cx, 13, 4, '#ffffff44');
            pixel(cx, 14, 7, '#ffffff44');
        }
    })
};

// ============================================================
// TILE SPRITES
// ============================================================
const TileSprites = {
    ground_w1: () => getCachedSprite('tile_ground_w1', 16, 16, (cx) => {
        fillRect(cx, 0, 0, 16, 16, '#886644');
        fillRect(cx, 0, 0, 16, 4, '#55bb55');
        fillRect(cx, 0, 0, 16, 2, '#66cc66');
        // Grass blades
        pixel(cx, 2, 0, '#77dd77'); pixel(cx, 5, 0, '#77dd77');
        pixel(cx, 9, 0, '#77dd77'); pixel(cx, 13, 0, '#77dd77');
        // Dirt detail
        pixel(cx, 3, 7, '#775533'); pixel(cx, 9, 9, '#775533');
        pixel(cx, 13, 6, '#997755'); pixel(cx, 6, 12, '#775533');
    }),

    dirt_w1: () => getCachedSprite('tile_dirt_w1', 16, 16, (cx) => {
        fillRect(cx, 0, 0, 16, 16, '#886644');
        pixel(cx, 3, 3, '#775533'); pixel(cx, 9, 5, '#775533');
        pixel(cx, 13, 2, '#997755'); pixel(cx, 6, 10, '#775533');
        pixel(cx, 1, 8, '#997755'); pixel(cx, 11, 13, '#775533');
    }),

    ground_w2: () => getCachedSprite('tile_ground_w2', 16, 16, (cx) => {
        fillRect(cx, 0, 0, 16, 16, PAL.w2Ground);
        fillRect(cx, 0, 0, 16, 2, '#665577');
        pixel(cx, 3, 4, '#332244'); pixel(cx, 10, 7, '#332244');
        pixel(cx, 7, 11, '#554466');
    }),

    float_w2: (frame) => getCachedSprite('tile_float_w2_' + (Math.floor(frame/4) % 4), 16, 16, (cx) => {
        fillRect(cx, 0, 2, 16, 12, '#7755aa');
        fillRect(cx, 1, 1, 14, 1, '#8866bb');
        fillRect(cx, 1, 14, 14, 1, '#665599');
        fillRect(cx, 0, 2, 16, 2, '#8866bb');
        if ((Math.floor(frame/4)) % 4 < 2) {
            pixel(cx, 2, 4, '#aa88cc');
            pixel(cx, 12, 8, '#aa88cc');
        }
    }),

    ground_w3: () => getCachedSprite('tile_ground_w3', 16, 16, (cx) => {
        fillRect(cx, 0, 0, 16, 16, PAL.w3Ground);
        fillRect(cx, 0, 0, 16, 2, PAL.w3Metal);
        pixel(cx, 3, 4, '#889999'); pixel(cx, 12, 8, '#889999');
    }),

    metal_w3: () => getCachedSprite('tile_metal_w3', 16, 16, (cx) => {
        fillRect(cx, 0, 0, 16, 16, PAL.w3Metal);
        fillRect(cx, 0, 0, 16, 1, '#778899');
        fillRect(cx, 0, 15, 16, 1, '#556677');
        pixel(cx, 2, 2, '#889999'); pixel(cx, 13, 2, '#889999');
        pixel(cx, 2, 13, '#889999'); pixel(cx, 13, 13, '#889999');
    }),

    ground_w4: () => getCachedSprite('tile_ground_w4', 16, 16, (cx) => {
        fillRect(cx, 0, 0, 16, 16, PAL.w4Rock);
        fillRect(cx, 0, 0, 16, 4, PAL.w4Snow);
        fillRect(cx, 0, 0, 16, 2, '#ffffff');
        pixel(cx, 2, 4, PAL.w4Snow); pixel(cx, 8, 4, PAL.w4Snow);
        pixel(cx, 5, 8, '#445566');
    }),

    ice_w4: () => getCachedSprite('tile_ice_w4', 16, 16, (cx) => {
        fillRect(cx, 0, 0, 16, 16, PAL.w4Ice);
        fillRect(cx, 0, 0, 16, 1, '#ddeeff');
        pixel(cx, 3, 4, '#ffffff'); pixel(cx, 10, 8, '#ffffff');
    }),

    ground_w5: () => getCachedSprite('tile_ground_w5', 16, 16, (cx) => {
        fillRect(cx, 0, 0, 16, 16, PAL.w5Floor);
        fillRect(cx, 0, 0, 16, 2, PAL.w5Metal);
        pixel(cx, 4, 6, '#221111'); pixel(cx, 11, 9, '#221111');
    }),

    dark_w5: () => getCachedSprite('tile_dark_w5', 16, 16, (cx) => {
        fillRect(cx, 0, 0, 16, 16, PAL.w5Dark);
        pixel(cx, 4, 4, '#331111'); pixel(cx, 11, 11, '#331111');
    }),

    platform_w1: () => getCachedSprite('tile_platform_w1', 16, 16, (cx) => {
        fillRect(cx, 0, 0, 16, 6, '#aa8855');
        fillRect(cx, 0, 0, 16, 2, '#ccaa66');
        fillRect(cx, 0, 6, 16, 2, '#886633');
        pixel(cx, 2, 3, '#ccaa66');
        pixel(cx, 13, 3, '#ccaa66');
    }),

    spike: () => getCachedSprite('tile_spike', 16, 16, (cx) => {
        fillRect(cx, 0, 12, 16, 4, '#888888');
        for (let i = 0; i < 4; i++) {
            const bx = i * 4;
            fillRect(cx, bx + 1, 8, 2, 4, '#aaaaaa');
            pixel(cx, bx + 1, 7, '#cccccc');
            pixel(cx, bx + 2, 6, '#cccccc');
        }
    }),

    coin: (frame) => getCachedSprite('tile_coin_' + (Math.floor(frame/4) % 8), 16, 16, (cx) => {
        const w = [6, 5, 4, 3, 4, 5, 6, 6][Math.floor(frame/4) % 8];
        const ox = (16 - w) / 2;
        fillRect(cx, ox, 3, w, 10, '#ffcc00');
        fillRect(cx, ox + 1, 2, w - 2, 1, '#ffcc00');
        fillRect(cx, ox + 1, 13, w - 2, 1, '#ffcc00');
        if (w > 3) {
            fillRect(cx, ox + 1, 4, 1, 8, '#ffee66');
        }
    }),

    heart: () => getCachedSprite('tile_heart', 16, 16, (cx) => {
        fillRect(cx, 3, 4, 4, 4, '#ff5555');
        fillRect(cx, 9, 4, 4, 4, '#ff5555');
        fillRect(cx, 5, 3, 2, 1, '#ff5555');
        fillRect(cx, 9, 3, 2, 1, '#ff5555');
        fillRect(cx, 2, 5, 12, 4, '#ff5555');
        fillRect(cx, 3, 9, 10, 2, '#ff5555');
        fillRect(cx, 5, 11, 6, 1, '#ff5555');
        fillRect(cx, 7, 12, 2, 1, '#ff5555');
        pixel(cx, 4, 4, '#ff8888');
        pixel(cx, 5, 4, '#ffaaaa');
    }),

    spring: (frame) => getCachedSprite('tile_spring_' + frame, 16, 16, (cx) => {
        fillRect(cx, 2, 12, 12, 4, '#ff8800');
        fillRect(cx, 3, 11, 10, 1, '#ffaa44');
        if (!frame) {
            fillRect(cx, 4, 8, 8, 2, '#cccccc');
            fillRect(cx, 5, 6, 6, 2, '#cccccc');
            fillRect(cx, 4, 10, 8, 2, '#aaaaaa');
        } else {
            fillRect(cx, 3, 10, 10, 2, '#cccccc');
        }
    }),

    door: (frame) => getCachedSprite('tile_door_' + (Math.floor(frame/8) % 4), 16, 16, (cx) => {
        fillRect(cx, 2, 0, 12, 16, '#8B4513');
        fillRect(cx, 3, 1, 10, 14, '#A0522D');
        fillRect(cx, 2, 0, 12, 1, '#6B3410');
        fillRect(cx, 4, 1, 8, 2, '#6B3410');
        fillRect(cx, 10, 7, 2, 2, '#FFD700');
        if ((Math.floor(frame/8)) % 4 < 2) pixel(cx, 10, 7, '#FFFFFF');
    }),

    checkpoint: (frame, active) => getCachedSprite('tile_cp_' + active + '_' + (Math.floor(frame/8) % 4), 16, 16, (cx) => {
        fillRect(cx, 7, 0, 2, 16, '#888888');
        fillRect(cx, 7, 14, 4, 2, '#666666');
        if (active) {
            fillRect(cx, 9, 1, 6, 5, '#44ff44');
            fillRect(cx, 9, 1, 6, 1, '#66ff66');
        } else {
            fillRect(cx, 9, 1, 6, 5, '#cc0000');
        }
    }),

    key: (frame) => getCachedSprite('tile_key_' + (Math.floor(frame/4) % 8), 16, 16, (cx) => {
        const bob = Math.sin(frame * 0.1) * 2;
        const y = 4 + bob;
        fillRect(cx, 5, y, 4, 4, '#FFD700');
        fillRect(cx, 6, y + 1, 2, 2, '#000000');
        fillRect(cx, 9, y + 1, 4, 2, '#FFD700');
        pixel(cx, 12, y + 3, '#FFD700');
        pixel(cx, 11, y + 3, '#FFD700');
    }),

    star: (frame) => getCachedSprite('tile_star_' + (Math.floor(frame/4) % 8), 16, 16, (cx) => {
        const bob = Math.sin(frame * 0.08) * 1.5;
        const y = 3 + bob;
        const colors = ['#ffff00', '#ffcc00', '#ffff44', '#ffee00'];
        const c = colors[Math.floor(frame/4) % 4];
        pixel(cx, 8, y, c);
        fillRect(cx, 6, y + 1, 5, 1, c);
        fillRect(cx, 4, y + 2, 9, 2, c);
        fillRect(cx, 5, y + 4, 7, 1, c);
        fillRect(cx, 6, y + 5, 2, 2, c);
        fillRect(cx, 9, y + 5, 2, 2, c);
        pixel(cx, 7, y + 1, '#ffffff');
    }),

    lockedDoor: () => getCachedSprite('tile_lockedDoor', 16, 16, (cx) => {
        fillRect(cx, 2, 0, 12, 16, '#666688');
        fillRect(cx, 3, 1, 10, 14, '#555577');
        fillRect(cx, 6, 5, 4, 4, '#FFD700');
        fillRect(cx, 7, 3, 2, 3, '#FFD700');
        pixel(cx, 7, 8, '#cc9900');
    }),

    lava_w5: (frame) => getCachedSprite('tile_lava_w5_' + (Math.floor(frame/4) % 8), 16, 16, (cx) => {
        const f = Math.floor(frame/4) % 8;
        fillRect(cx, 0, 0, 16, 16, '#cc2200');
        const y1 = 2 + Math.sin(f * 0.8) * 2;
        const y2 = 6 + Math.cos(f * 0.6) * 2;
        fillRect(cx, 0, y1, 16, 3, '#ff4400');
        fillRect(cx, 0, y2, 16, 2, '#ffaa00');
        pixel(cx, 7, f % 4, '#ffcc00');
    }),

    // PORTALS (new!)
    portal: (frame, color) => getCachedSprite('tile_portal_' + color + '_' + (Math.floor(frame/3) % 8), 16, 16, (cx) => {
        const f = Math.floor(frame/3) % 8;
        const c1 = color === 'blue' ? '#4488ff' : color === 'orange' ? '#ff8844' : '#44ff88';
        const c2 = color === 'blue' ? '#88bbff' : color === 'orange' ? '#ffbb88' : '#88ffbb';
        const c3 = color === 'blue' ? '#2244aa' : color === 'orange' ? '#cc5522' : '#228855';
        // Oval portal shape
        fillRect(cx, 5, 1, 6, 14, c3);
        fillRect(cx, 4, 2, 8, 12, c1);
        fillRect(cx, 5, 1, 6, 1, c1);
        fillRect(cx, 5, 14, 6, 1, c1);
        // Inner glow
        fillRect(cx, 6, 3, 4, 10, c2);
        // Swirl effect
        const swirl = f;
        pixel(cx, 6 + (swirl % 4), 3 + swirl, '#ffffff');
        pixel(cx, 9 - (swirl % 3), 12 - swirl, '#ffffff');
        // Sparkle
        if (f % 3 === 0) pixel(cx, 7, 5, '#ffffff');
        if (f % 3 === 1) pixel(cx, 8, 9, '#ffffff');
    }),

    // POWER ORB (new!)
    powerOrb: (frame, type) => getCachedSprite('tile_powerorb_' + type + '_' + (Math.floor(frame/4) % 8), 16, 16, (cx) => {
        const f = Math.floor(frame/4) % 8;
        const bob = Math.sin(frame * 0.08) * 2;
        const y = 3 + bob;
        const colors = {
            dash: ['#ff6644', '#ff8866', '#ffaa88'],
            shield: ['#44aaff', '#66ccff', '#88eeff'],
            float: ['#aa44ff', '#cc66ff', '#ee88ff'],
            magnet: ['#ffcc00', '#ffdd44', '#ffee88'],
            timeslow: ['#44ffaa', '#88ffcc', '#bbffee'],
        };
        const c = colors[type] || colors.dash;
        // Glowing orb
        fillRect(cx, 5, y + 1, 6, 6, c[0]);
        fillRect(cx, 6, y, 4, 1, c[0]);
        fillRect(cx, 6, y + 7, 4, 1, c[0]);
        fillRect(cx, 4, y + 2, 1, 4, c[0]);
        fillRect(cx, 11, y + 2, 1, 4, c[0]);
        // Inner glow
        fillRect(cx, 6, y + 2, 4, 4, c[1]);
        fillRect(cx, 7, y + 1, 2, 1, c[1]);
        // Highlight
        pixel(cx, 6, y + 2, c[2]);
        pixel(cx, 7, y + 1, '#ffffff');
        // Icon inside
        if (type === 'dash') {
            // Arrow >
            pixel(cx, 7, y + 3, '#ffffff');
            pixel(cx, 8, y + 4, '#ffffff');
            pixel(cx, 7, y + 5, '#ffffff');
        } else if (type === 'shield') {
            // Shield shape
            fillRect(cx, 7, y + 2, 2, 3, '#ffffff');
            pixel(cx, 7, y + 5, '#ffffff');
        } else if (type === 'float') {
            // Wing
            pixel(cx, 6, y + 3, '#ffffff');
            pixel(cx, 7, y + 2, '#ffffff');
            pixel(cx, 8, y + 2, '#ffffff');
            pixel(cx, 9, y + 3, '#ffffff');
        }
        // Orbiting sparkles
        const angle = frame * 0.15;
        const sx = 8 + Math.cos(angle) * 6;
        const sy = y + 4 + Math.sin(angle) * 4;
        if (sx >= 0 && sx < 16 && sy >= 0 && sy < 16) pixel(cx, Math.round(sx), Math.round(sy), '#ffffff');
    }),

    // Breakable block (new!)
    breakable: () => getCachedSprite('tile_breakable', 16, 16, (cx) => {
        fillRect(cx, 0, 0, 16, 16, '#aa9977');
        fillRect(cx, 0, 0, 16, 1, '#bbaa88');
        fillRect(cx, 0, 15, 16, 1, '#887766');
        // Crack pattern
        pixel(cx, 4, 4, '#776655');
        pixel(cx, 5, 5, '#776655');
        pixel(cx, 6, 4, '#776655');
        pixel(cx, 10, 8, '#776655');
        pixel(cx, 11, 9, '#776655');
        pixel(cx, 9, 9, '#776655');
        pixel(cx, 3, 11, '#776655');
        // X marks
        pixel(cx, 7, 7, '#887766');
        pixel(cx, 8, 8, '#887766');
    }),

    // Moving platform
    movPlatform: () => getCachedSprite('tile_movplat', 32, 8, (cx) => {
        fillRect(cx, 0, 0, 32, 8, '#aa8855');
        fillRect(cx, 0, 0, 32, 2, '#ccaa66');
        fillRect(cx, 0, 6, 32, 2, '#886633');
        pixel(cx, 4, 3, '#ccaa66');
        pixel(cx, 15, 3, '#ccaa66');
        pixel(cx, 27, 3, '#ccaa66');
    }),

    // Sign post (for hints)
    sign: () => getCachedSprite('tile_sign', 16, 16, (cx) => {
        fillRect(cx, 7, 8, 2, 8, '#8B4513');
        fillRect(cx, 2, 2, 12, 7, '#DEB887');
        fillRect(cx, 2, 2, 12, 1, '#C4A66A');
        fillRect(cx, 2, 8, 12, 1, '#A08050');
        pixel(cx, 5, 5, '#8B4513');
        pixel(cx, 6, 5, '#8B4513');
        pixel(cx, 8, 5, '#8B4513');
    }),

    // Vine/ladder
    vine: () => getCachedSprite('tile_vine', 16, 16, (cx) => {
        fillRect(cx, 6, 0, 4, 16, '#338833');
        fillRect(cx, 7, 0, 2, 16, '#44aa44');
        // Leaves
        fillRect(cx, 3, 3, 3, 2, '#55bb55');
        fillRect(cx, 10, 8, 3, 2, '#55bb55');
        fillRect(cx, 3, 13, 3, 2, '#55bb55');
    }),

    // Water
    water: (frame) => getCachedSprite('tile_water_' + (Math.floor(frame/6) % 4), 16, 16, (cx) => {
        const f = Math.floor(frame/6) % 4;
        fillRect(cx, 0, 0, 16, 16, '#2244aa55');
        // Surface wave
        const waveY = [0, 1, 0, -1][f];
        fillRect(cx, 0, waveY, 8, 2, '#4466cc44');
        fillRect(cx, 8, -waveY, 8, 2, '#4466cc44');
        // Bubbles
        if (f === 0) pixel(cx, 4, 8, '#88aaff');
        if (f === 2) pixel(cx, 11, 5, '#88aaff');
    }),

    // Photon blaster projectile
    photon: (frame) => getCachedSprite('tile_photon_' + (Math.floor(frame/2) % 4), 8, 6, (cx) => {
        const f = Math.floor(frame/2) % 4;
        // Glowing cyan-white energy bolt
        fillRect(cx, 1, 1, 6, 4, '#00ccff');
        fillRect(cx, 2, 0, 4, 1, '#00ccff');
        fillRect(cx, 2, 5, 4, 1, '#00ccff');
        fillRect(cx, 3, 2, 3, 2, '#ffffff');
        // Trailing glow
        fillRect(cx, 0, 2, 2, 2, f < 2 ? '#0088cc' : '#00aadd');
        pixel(cx, 6, 2, f < 2 ? '#88eeff' : '#ffffff');
    }),
};

// ============================================================
// ENEMIES - More variety per world
// ============================================================
const EnemySprites = {
    // World 1: Glowbug (flying), Mushroom (walking), Thornball (bouncing)
    glowbug: (frame, dir) => getCachedSprite('e_glowbug_' + (Math.floor(frame/4) % 4) + '_' + dir, 16, 16, (cx) => {
        const f = Math.floor(frame/4) % 4;
        const wingUp = f < 2;
        fillRect(cx, 5, 7, 6, 5, '#cc55cc');
        fillRect(cx, 6, 6, 4, 1, '#cc55cc');
        fillRect(cx, 6, 12, 4, 1, '#cc55cc');
        if (wingUp) {
            fillRect(cx, 1, 3, 5, 4, '#ee88ee55');
            fillRect(cx, 10, 3, 5, 4, '#ee88ee55');
        } else {
            fillRect(cx, 2, 7, 4, 3, '#ee88ee55');
            fillRect(cx, 10, 7, 4, 3, '#ee88ee55');
        }
        // Cute face
        const ex = dir > 0 ? 1 : 0;
        pixel(cx, 6 + ex, 8, '#ffffff');
        pixel(cx, 9 + ex, 8, '#ffffff');
        pixel(cx, 7 + ex, 8, '#440044');
        pixel(cx, 10 + ex, 8, '#440044');
        // Glow
        fillRect(cx, 6, 10, 4, 2, '#ffff44');
        pixel(cx, 7, 12, '#ffff8844');
    }),

    mushroom: (frame, dir) => getCachedSprite('e_mush_' + (Math.floor(frame/6) % 4) + '_' + dir, 16, 16, (cx) => {
        const f = Math.floor(frame/6) % 4;
        const walk = [0, 1, 0, -1][f];
        // Cap
        fillRect(cx, 2, 3, 12, 6, '#dd4444');
        fillRect(cx, 3, 2, 10, 1, '#dd4444');
        fillRect(cx, 3, 9, 10, 1, '#dd4444');
        // Spots
        pixel(cx, 4, 4, '#ffffff'); pixel(cx, 5, 4, '#ffffff');
        pixel(cx, 9, 5, '#ffffff'); pixel(cx, 10, 5, '#ffffff');
        pixel(cx, 6, 6, '#ffffff');
        // Stem / face
        fillRect(cx, 5, 9, 6, 4, '#ffeecc');
        fillRect(cx, 6, 13, 4, 1, '#ffeecc');
        // Cute angry eyes
        pixel(cx, 6, 10, '#222222');
        pixel(cx, 9, 10, '#222222');
        // Frown
        pixel(cx, 7, 12, '#cc8877');
        pixel(cx, 8, 12, '#cc8877');
        // Feet
        fillRect(cx, 4 + walk, 14, 3, 2, '#884422');
        fillRect(cx, 9 - walk, 14, 3, 2, '#884422');
    }),

    thornball: (frame) => getCachedSprite('e_thorn_' + (Math.floor(frame/3) % 4), 16, 16, (cx) => {
        const f = Math.floor(frame/3) % 4;
        // Spiky ball
        fillRect(cx, 4, 4, 8, 8, '#88aa44');
        fillRect(cx, 5, 3, 6, 1, '#88aa44');
        fillRect(cx, 5, 12, 6, 1, '#88aa44');
        fillRect(cx, 3, 5, 1, 6, '#88aa44');
        fillRect(cx, 12, 5, 1, 6, '#88aa44');
        // Spikes rotate
        const spikes = [[7, 1], [12, 5], [8, 13], [2, 8], [3, 2], [12, 12], [2, 12], [13, 3]];
        spikes.forEach((s, i) => {
            if ((i + f) % 2 === 0) pixel(cx, s[0], s[1], '#aabb55');
        });
        // Face
        pixel(cx, 6, 7, '#222200');
        pixel(cx, 9, 7, '#222200');
        pixel(cx, 7, 9, '#667733');
        pixel(cx, 8, 9, '#667733');
    }),

    // World 2: Rockroller (rolling), Astro (floating space enemy)
    rockroller: (frame) => getCachedSprite('e_rock_' + (Math.floor(frame/4) % 4), 16, 16, (cx) => {
        const f = Math.floor(frame/4) % 4;
        fillRect(cx, 3, 3, 10, 10, '#887766');
        fillRect(cx, 4, 2, 8, 1, '#887766');
        fillRect(cx, 4, 13, 8, 1, '#887766');
        fillRect(cx, 2, 4, 1, 8, '#887766');
        fillRect(cx, 13, 4, 1, 8, '#887766');
        pixel(cx, 5, 6, '#ff4444');
        pixel(cx, 10, 6, '#ff4444');
        fillRect(cx, 6, 9, 4, 1, '#ff4444');
        const off = f;
        pixel(cx, 3 + off, 3, '#776655');
        pixel(cx, 11 - off, 12, '#776655');
    }),

    astro: (frame, dir) => getCachedSprite('e_astro_' + (Math.floor(frame/5) % 4) + '_' + dir, 16, 16, (cx) => {
        const f = Math.floor(frame/5) % 4;
        const hover = Math.sin(f * 1.5) * 1;
        // Helmet
        fillRect(cx, 3, 2 + hover, 10, 8, '#aaaacc');
        fillRect(cx, 4, 1 + hover, 8, 1, '#aaaacc');
        fillRect(cx, 4, 10 + hover, 8, 1, '#aaaacc');
        // Visor
        fillRect(cx, 5, 4 + hover, 6, 4, '#223355');
        // Eyes in visor
        pixel(cx, 6, 5 + hover, '#ff4444');
        pixel(cx, 9, 5 + hover, '#ff4444');
        // Body
        fillRect(cx, 5, 11 + hover, 6, 3, '#888899');
        // Jetpack flames
        if (f % 2 === 0) {
            pixel(cx, 5, 14 + hover, '#ff8800');
            pixel(cx, 10, 14 + hover, '#ff8800');
            pixel(cx, 6, 15, '#ff4400');
            pixel(cx, 9, 15, '#ff4400');
        }
    }),

    // World 3: Spark (electric), Coilbot (patrol robot)
    spark: (frame) => getCachedSprite('e_spark_' + (Math.floor(frame/3) % 6), 16, 16, (cx) => {
        const f = Math.floor(frame/3) % 6;
        const colors = ['#00ffff', '#0088ff', '#00ccff'];
        const c = colors[f % 3];
        fillRect(cx, 5, 5, 6, 6, c);
        fillRect(cx, 6, 4, 4, 1, c);
        fillRect(cx, 6, 11, 4, 1, c);
        fillRect(cx, 4, 6, 1, 4, c);
        fillRect(cx, 11, 6, 1, 4, c);
        if (f < 3) {
            pixel(cx, 3, 3, '#ffffff');
            pixel(cx, 12, 11, '#ffffff');
        } else {
            pixel(cx, 12, 3, '#ffffff');
            pixel(cx, 3, 11, '#ffffff');
        }
        pixel(cx, 6, 7, '#000044');
        pixel(cx, 9, 7, '#000044');
    }),

    coilbot: (frame, dir) => getCachedSprite('e_coilbot_' + (Math.floor(frame/5) % 4) + '_' + dir, 16, 16, (cx) => {
        const f = Math.floor(frame/5) % 4;
        // Body
        fillRect(cx, 4, 4, 8, 8, '#667788');
        fillRect(cx, 5, 3, 6, 1, '#778899');
        // Eye
        fillRect(cx, 6, 6, 4, 3, '#ff0000');
        pixel(cx, 7, 7, '#ffffff');
        // Antenna
        fillRect(cx, 7, 1, 2, 2, '#888888');
        pixel(cx, 7, 0, f % 2 === 0 ? '#ff0000' : '#ff6600');
        // Legs
        fillRect(cx, 4, 12, 2, 2, '#556677');
        fillRect(cx, 10, 12, 2, 2, '#556677');
        fillRect(cx, 3 + (f % 2), 14, 3, 2, '#445566');
        fillRect(cx, 10 - (f % 2), 14, 3, 2, '#445566');
    }),

    // World 4: Frost Ghost, Ice Bat
    frostGhost: (frame, dir) => getCachedSprite('e_fghost_' + (Math.floor(frame/5) % 4) + '_' + dir, 16, 16, (cx) => {
        const f = Math.floor(frame/5) % 4;
        fillRect(cx, 4, 3, 8, 9, '#bbddff');
        fillRect(cx, 5, 2, 6, 1, '#bbddff');
        fillRect(cx, 3, 5, 1, 5, '#bbddff');
        fillRect(cx, 12, 5, 1, 5, '#bbddff');
        for (let i = 0; i < 4; i++) {
            const h = ((i + f) % 2) ? 2 : 1;
            fillRect(cx, 4 + i * 2, 12, 2, h, '#bbddff');
        }
        const ex = dir > 0 ? 1 : 0;
        pixel(cx, 6 + ex, 6, '#0044aa');
        pixel(cx, 9 + ex, 6, '#0044aa');
        if (f % 2 === 0) {
            pixel(cx, 2, 4, '#88ccee');
            pixel(cx, 13, 8, '#88ccee');
        }
    }),

    iceBat: (frame, dir) => getCachedSprite('e_icebat_' + (Math.floor(frame/3) % 4) + '_' + dir, 16, 16, (cx) => {
        const f = Math.floor(frame/3) % 4;
        const wingUp = f < 2;
        // Body
        fillRect(cx, 6, 6, 4, 4, '#6688aa');
        // Wings
        if (wingUp) {
            fillRect(cx, 1, 3, 5, 3, '#88aacc');
            fillRect(cx, 10, 3, 5, 3, '#88aacc');
        } else {
            fillRect(cx, 1, 7, 5, 3, '#88aacc');
            fillRect(cx, 10, 7, 5, 3, '#88aacc');
        }
        // Eyes
        pixel(cx, 7, 7, '#ff4444');
        pixel(cx, 8, 7, '#ff4444');
        // Fangs
        pixel(cx, 7, 10, '#ffffff');
        pixel(cx, 8, 10, '#ffffff');
    }),

    // World 5: Drone, Chaos Orb
    drone: (frame) => getCachedSprite('e_drone_' + (Math.floor(frame/4) % 4), 16, 16, (cx) => {
        const f = Math.floor(frame/4) % 4;
        fillRect(cx, 4, 5, 8, 6, '#553333');
        fillRect(cx, 5, 4, 6, 1, '#553333');
        fillRect(cx, 5, 11, 6, 1, '#553333');
        fillRect(cx, 6, 6, 4, 4, '#ff0000');
        fillRect(cx, 7, 7, 2, 2, '#ff4444');
        if (f < 2) pixel(cx, 7, 7, '#ffffff');
        if (f % 2 === 0) {
            fillRect(cx, 1, 3, 5, 1, '#777777');
            fillRect(cx, 10, 3, 5, 1, '#777777');
        } else {
            fillRect(cx, 2, 3, 3, 1, '#777777');
            fillRect(cx, 11, 3, 3, 1, '#777777');
        }
        pixel(cx, 7, 12 + (f % 2), '#ff4400');
        pixel(cx, 8, 13 + (f % 2), '#ff6600');
    }),

    chaosOrb: (frame) => getCachedSprite('e_chaosOrb_' + (Math.floor(frame/2) % 8), 16, 16, (cx) => {
        const f = Math.floor(frame/2) % 8;
        // Pulsing dark orb
        const r = 4 + Math.sin(f * 0.8) * 1;
        const cx2 = 8, cy2 = 8;
        fillRect(cx, cx2 - r, cy2 - r, r * 2, r * 2, '#440022');
        fillRect(cx, cx2 - r + 1, cy2 - r + 1, r * 2 - 2, r * 2 - 2, '#660033');
        // Chaos sparks
        const sparks = [[2, 2], [13, 3], [3, 12], [12, 13], [1, 7], [14, 8]];
        sparks.forEach((s, i) => {
            if ((i + f) % 3 === 0) pixel(cx, s[0], s[1], '#ff3366');
        });
        // Eye
        fillRect(cx, 7, 7, 2, 2, '#ff0044');
        pixel(cx, 7, 7, '#ffffff');
    }),

    // Orbiter - rotates around a center point (glowing orb with trail)
    orbiter: (frame, dir) => getCachedSprite('e_orbiter_' + (Math.floor(frame/2) % 8), 16, 16, (cx) => {
        const f = Math.floor(frame/2) % 8;
        // Glowing core
        fillRect(cx, 5, 5, 6, 6, '#ff8844');
        fillRect(cx, 6, 4, 4, 1, '#ff8844');
        fillRect(cx, 6, 11, 4, 1, '#ff8844');
        fillRect(cx, 4, 6, 1, 4, '#ff8844');
        fillRect(cx, 11, 6, 1, 4, '#ff8844');
        // Inner white-hot
        fillRect(cx, 6, 6, 4, 4, '#ffcc44');
        fillRect(cx, 7, 7, 2, 2, '#ffffff');
        // Rotating flame trail
        const trails = [[2,3],[12,3],[2,11],[12,11],[7,1],[7,13],[1,7],[13,7]];
        trails.forEach((t, i) => {
            if ((i + f) % 3 === 0) pixel(cx, t[0], t[1], '#ff660088');
        });
    }),

    // Spinner - spins in place, shoots in 4 directions periodically
    spinner: (frame) => getCachedSprite('e_spinner_' + (Math.floor(frame/3) % 8), 16, 16, (cx) => {
        const f = Math.floor(frame/3) % 8;
        const angle = f * 0.8;
        // Central body
        fillRect(cx, 5, 5, 6, 6, '#aa5599');
        fillRect(cx, 6, 4, 4, 8, '#aa5599');
        fillRect(cx, 4, 6, 8, 4, '#aa5599');
        // Rotating blades
        const bladePositions = [
            [3 + Math.cos(angle) * 4, 3 + Math.sin(angle) * 4],
            [3 - Math.cos(angle) * 4, 3 - Math.sin(angle) * 4],
            [3 + Math.sin(angle) * 4, 3 - Math.cos(angle) * 4],
            [3 - Math.sin(angle) * 4, 3 + Math.cos(angle) * 4],
        ];
        bladePositions.forEach(b => {
            const bx = Math.round(5 + b[0]), by = Math.round(5 + b[1]);
            if (bx >= 0 && bx < 14 && by >= 0 && by < 14) {
                fillRect(cx, bx, by, 3, 3, '#cc66bb');
            }
        });
        // Eye
        fillRect(cx, 7, 7, 2, 2, '#ffffff');
        pixel(cx, 7, 7, '#440044');
    }),

    // Boss - Dr. Entropy (32x32)
    entropy: (frame, phase) => getCachedSprite('boss_entropy_' + (Math.floor(frame/4) % 8) + '_' + phase, 32, 32, (cx) => {
        const f = Math.floor(frame/4) % 8;
        fillRect(cx, 6, 10, 20, 18, PAL.entCape);
        fillRect(cx, 5, 12, 1, 14, PAL.entCapeLight);
        fillRect(cx, 26, 12, 1, 14, PAL.entCapeLight);
        for (let i = 0; i < 4; i++) {
            const h = ((i + f) % 2) ? 2 : 1;
            fillRect(cx, 7 + i * 5, 28, 4, h, PAL.entCape);
        }
        fillRect(cx, 9, 12, 14, 12, PAL.entArmor);
        fillRect(cx, 10, 11, 12, 1, PAL.entArmor);
        fillRect(cx, 13, 15, 6, 1, '#ff3300');
        fillRect(cx, 14, 16, 4, 1, '#ff3300');
        fillRect(cx, 15, 17, 2, 1, '#ff3300');
        fillRect(cx, 6, 13, 3, 8, PAL.entArmor);
        fillRect(cx, 23, 13, 3, 8, PAL.entArmor);
        fillRect(cx, 5, 20, 3, 3, PAL.entSkin);
        fillRect(cx, 24, 20, 3, 3, PAL.entSkin);
        fillRect(cx, 11, 24, 4, 6, PAL.entArmor);
        fillRect(cx, 17, 24, 4, 6, PAL.entArmor);
        fillRect(cx, 10, 28, 5, 2, '#222222');
        fillRect(cx, 17, 28, 5, 2, '#222222');
        fillRect(cx, 11, 4, 10, 8, PAL.entSkin);
        fillRect(cx, 12, 3, 8, 1, PAL.entSkin);
        fillRect(cx, 11, 2, 10, 3, PAL.entHair);
        fillRect(cx, 10, 3, 1, 3, PAL.entHair);
        fillRect(cx, 21, 3, 1, 3, PAL.entHair);
        const eyeColor = phase > 1 ? '#ff0000' : '#cc00cc';
        fillRect(cx, 13, 7, 2, 2, eyeColor);
        fillRect(cx, 17, 7, 2, 2, eyeColor);
        if (f < 4) {
            pixel(cx, 13, 7, '#ffffff');
            pixel(cx, 17, 7, '#ffffff');
        }
        fillRect(cx, 14, 10, 4, 1, '#880000');
        if (phase >= 2) {
            const px = 3 + (f * 4) % 28;
            const py = 2 + (f * 3) % 10;
            pixel(cx, px, py, '#ff3300');
            pixel(cx, 28 - px, 28 - py, '#ff0066');
        }
    })
};

// ============================================================
// BOSS PUZZLE - Prisms & Pedestals
// ============================================================
const BossSprites = {
    // Colored prism collectible (floats, glows)
    prismItem: (frame, color) => getCachedSprite('boss_prism_' + color + '_' + (Math.floor(frame/4) % 8), 16, 16, (cx) => {
        const f = Math.floor(frame/4) % 8;
        const bob = Math.sin(frame * 0.08) * 2;
        const y = 2 + bob;
        const colors = { red: ['#ff4444','#ff8888','#cc2222'], green: ['#44ff44','#88ff88','#22cc22'], blue: ['#4488ff','#88bbff','#2244cc'] };
        const c = colors[color] || colors.red;
        // Triangle prism shape
        fillRect(cx, 6, y + 1, 4, 8, c[0]);
        fillRect(cx, 5, y + 3, 6, 4, c[0]);
        fillRect(cx, 7, y, 2, 1, c[0]);
        fillRect(cx, 7, y + 9, 2, 1, c[0]);
        // Inner glow
        fillRect(cx, 7, y + 2, 2, 5, c[1]);
        // Highlight
        pixel(cx, 6, y + 2, '#ffffff');
        pixel(cx, 7, y + 1, '#ffffff');
        // Orbiting sparkle
        const angle = frame * 0.12;
        const sx = 8 + Math.cos(angle) * 6;
        const sy = y + 5 + Math.sin(angle) * 4;
        if (sx >= 0 && sx < 16 && sy >= 0 && sy < 16) pixel(cx, Math.round(sx), Math.round(sy), c[1]);
    }),

    // Pedestal (empty or holding a prism)
    pedestal: (frame, color) => getCachedSprite('boss_pedestal_' + (color || 'empty') + '_' + (Math.floor(frame/8) % 4), 16, 16, (cx) => {
        // Stone base
        fillRect(cx, 2, 10, 12, 6, '#888899');
        fillRect(cx, 3, 9, 10, 1, '#9999aa');
        fillRect(cx, 4, 8, 8, 1, '#aaaabb');
        // Slot
        fillRect(cx, 6, 8, 4, 2, '#333344');
        if (color) {
            const colors = { red: '#ff4444', green: '#44ff44', blue: '#4488ff' };
            const c = colors[color] || '#ffffff';
            // Prism sitting in pedestal
            fillRect(cx, 6, 4, 4, 5, c);
            fillRect(cx, 7, 3, 2, 1, c);
            // Glow
            const f = Math.floor(frame/8) % 4;
            if (f < 2) {
                pixel(cx, 5, 5, c);
                pixel(cx, 10, 5, c);
            }
            pixel(cx, 7, 4, '#ffffff');
        }
    }),

    // White light beam (when all 3 prisms placed)
    lightBeam: (frame) => getCachedSprite('boss_beam_' + (Math.floor(frame/2) % 8), 256, 16, (cx) => {
        const f = Math.floor(frame/2) % 8;
        // Rainbow beam across screen
        const colors = ['#ff4444', '#ff8844', '#ffff44', '#44ff44', '#44ffff', '#4444ff', '#ff44ff'];
        for (let x = 0; x < 256; x += 2) {
            const ci = (x + f * 4) % colors.length;
            fillRect(cx, x, 4, 2, 8, colors[ci]);
            fillRect(cx, x, 3, 2, 1, colors[Math.floor(ci + 1) % colors.length] + '88');
            fillRect(cx, x, 12, 2, 1, colors[Math.floor(ci + 2) % colors.length] + '88');
        }
        // Core white center
        fillRect(cx, 0, 6, 256, 4, '#ffffff88');
        fillRect(cx, 0, 7, 256, 2, '#ffffffcc');
    }),
};

// ============================================================
// HUD
// ============================================================
const HUDSprites = {
    heartSmall: () => getCachedSprite('hud_heart', 8, 8, (cx) => {
        pixel(cx, 1, 1, '#ff4455'); pixel(cx, 2, 1, '#ff4455');
        pixel(cx, 4, 1, '#ff4455'); pixel(cx, 5, 1, '#ff4455');
        fillRect(cx, 0, 2, 7, 2, '#ff4455');
        fillRect(cx, 1, 4, 5, 1, '#ff4455');
        fillRect(cx, 2, 5, 3, 1, '#ff4455');
        pixel(cx, 3, 6, '#ff4455');
        pixel(cx, 1, 1, '#ff8899');
    }),

    heartEmpty: () => getCachedSprite('hud_heart_e', 8, 8, (cx) => {
        pixel(cx, 1, 1, '#552222'); pixel(cx, 2, 1, '#552222');
        pixel(cx, 4, 1, '#552222'); pixel(cx, 5, 1, '#552222');
        fillRect(cx, 0, 2, 7, 2, '#552222');
        fillRect(cx, 1, 4, 5, 1, '#552222');
        fillRect(cx, 2, 5, 3, 1, '#552222');
        pixel(cx, 3, 6, '#552222');
    }),

    coinSmall: () => getCachedSprite('hud_coin', 8, 8, (cx) => {
        fillRect(cx, 2, 1, 4, 6, '#ffcc00');
        pixel(cx, 1, 2, '#ffcc00'); pixel(cx, 6, 2, '#ffcc00');
        pixel(cx, 1, 5, '#ffcc00'); pixel(cx, 6, 5, '#ffcc00');
        pixel(cx, 3, 3, '#cc9900');
    }),

    powerIcon: (type) => getCachedSprite('hud_power_' + type, 8, 8, (cx) => {
        const colors = { dash: '#ff6644', shield: '#44aaff', float: '#aa44ff', star: '#ffff00', magnet: '#ffcc00', timeslow: '#44ffaa' };
        const c = colors[type] || '#ffffff';
        fillRect(cx, 1, 1, 6, 6, c);
        fillRect(cx, 2, 0, 4, 1, c);
        fillRect(cx, 2, 7, 4, 1, c);
        pixel(cx, 2, 2, '#ffffff');
    })
};
