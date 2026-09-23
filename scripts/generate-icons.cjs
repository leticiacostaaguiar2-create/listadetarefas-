/**
 * Script to generate high quality compliant PNG and SVG icons for PWA
 */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function createPNG(width, height, drawFn) {
  const bytesPerPixel = 4;
  const rowSize = width * bytesPerPixel;
  const rawData = Buffer.alloc(height * (1 + rowSize));

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  function crc32(buf) {
    let c;
    let crcTable = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      crcTable[n] = c;
    }
    let crc = 0 ^ (-1);
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, "ascii");
    const crcBuf = Buffer.alloc(4);
    const combined = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(combined), 0);
    return Buffer.concat([len, combined, crcBuf]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    signature,
    makeChunk("IHDR", ihdr),
    makeChunk("IDAT", deflated),
    makeChunk("IEND", Buffer.alloc(0))
  ]);
}

// Distance to line segment
function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

function renderIcon(x, y, w, h, isMaskable) {
  const nx = x / w;
  const ny = y / h;

  // Background gradient: Indigo (#4f46e5) to Violet (#7c3aed)
  const bgR = Math.round(79 + (124 - 79) * ny);
  const bgG = Math.round(70 + (58 - 70) * ny);
  const bgB = Math.round(229 + (237 - 229) * ny);

  // If not maskable, rounded rect corner radius
  if (!isMaskable) {
    const cornerR = 0.22;
    const dx = Math.max(Math.abs(nx - 0.5) - (0.5 - cornerR), 0);
    const dy = Math.max(Math.abs(ny - 0.5) - (0.5 - cornerR), 0);
    const d = Math.hypot(dx, dy);
    if (d > cornerR) {
      return [0, 0, 0, 0]; // Transparent outside
    }
  }

  // Draw icon graphics in center (scale according to maskable safe zone)
  const scale = isMaskable ? 0.72 : 0.85;
  const cx = 0.5;
  const cy = 0.5;
  const lx = (nx - cx) / scale + cx;
  const ly = (ny - cy) / scale + cy;

  // Clipboard / card body: [0.26, 0.22] to [0.74, 0.78], radius 0.08
  const cardLeft = 0.26, cardRight = 0.74, cardTop = 0.24, cardBottom = 0.80, cRad = 0.06;
  const inCardX = lx >= cardLeft && lx <= cardRight;
  const inCardY = ly >= cardTop && ly <= cardBottom;
  
  let isCard = false;
  if (inCardX && inCardY) {
    const cdx = Math.max(Math.abs(lx - (cardLeft + cardRight) / 2) - ((cardRight - cardLeft) / 2 - cRad), 0);
    const cdy = Math.max(Math.abs(ly - (cardTop + cardBottom) / 2) - ((cardBottom - cardTop) / 2 - cRad), 0);
    if (Math.hypot(cdx, cdy) <= cRad) {
      isCard = true;
    }
  }

  if (isCard) {
    // Card background: Clean crisp white
    let cr = 255, cg = 255, cb = 255;

    // Checkmark circle badge: center at [0.39, 0.40], radius 0.065 (Emerald #10b981)
    const checkDist = Math.hypot(lx - 0.38, ly - 0.40);
    if (checkDist <= 0.065) {
      // Emerald circle
      cr = 16; cg = 185; cb = 129;
      // White check inside
      const d1 = distToSegment(lx, ly, 0.35, 0.40, 0.375, 0.43);
      const d2 = distToSegment(lx, ly, 0.375, 0.43, 0.415, 0.37);
      if (Math.min(d1, d2) < 0.012) {
        cr = 255; cg = 255; cb = 255;
      }
      return [cr, cg, cb, 255];
    }

    // Line 1 next to check: from x=0.48 to 0.67, y=0.40, height 0.02
    const l1d = distToSegment(lx, ly, 0.48, 0.40, 0.65, 0.40);
    if (l1d < 0.015) {
      return [100, 116, 139, 255]; // slate-500
    }

    // Checkmark 2 circle: center at [0.38, 0.58], radius 0.065 (Indigo #6366f1)
    const check2Dist = Math.hypot(lx - 0.38, ly - 0.58);
    if (check2Dist <= 0.065) {
      cr = 99; cg = 102; cb = 241;
      const d1 = distToSegment(lx, ly, 0.35, 0.58, 0.375, 0.61);
      const d2 = distToSegment(lx, ly, 0.375, 0.61, 0.415, 0.55);
      if (Math.min(d1, d2) < 0.012) {
        cr = 255; cg = 255; cb = 255;
      }
      return [cr, cg, cb, 255];
    }

    // Line 2 next to check: from x=0.48 to 0.65, y=0.58
    const l2d = distToSegment(lx, ly, 0.48, 0.58, 0.65, 0.58);
    if (l2d < 0.015) {
      return [100, 116, 139, 255];
    }

    // Top clip badge: centered at [0.50, 0.24], width 0.16, height 0.05
    if (Math.abs(lx - 0.50) < 0.08 && Math.abs(ly - 0.24) < 0.035) {
      return [79, 70, 229, 255]; // Indigo-600
    }

    return [255, 255, 255, 255];
  }

  // Clip ring above card
  if (Math.abs(lx - 0.50) < 0.05 && Math.abs(ly - 0.20) < 0.03) {
    const ringDist = Math.hypot(lx - 0.50, ly - 0.20);
    if (ringDist <= 0.035 && ringDist >= 0.02) {
      return [255, 255, 255, 220];
    }
  }

  return [bgR, bgG, bgB, 255];
}

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating 192x192 icon...');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, (x, y, w, h) => renderIcon(x, y, w, h, false)));

console.log('Generating 512x512 icon...');
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, (x, y, w, h) => renderIcon(x, y, w, h, false)));

console.log('Generating 512x512 maskable icon...');
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, (x, y, w, h) => renderIcon(x, y, w, h, true)));

console.log('Generating 180x180 apple touch icon...');
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, (x, y, w, h) => renderIcon(x, y, w, h, false)));

console.log('All PNG icons generated successfully!');
