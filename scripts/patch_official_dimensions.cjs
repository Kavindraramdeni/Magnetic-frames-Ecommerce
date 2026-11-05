const sharp = require('sharp');
const fs = require('fs');

const mag4mmPath = 'C:/Users/Kavin/.gemini/antigravity/brain/fd9d1f7d-98d5-4658-84fa-1180770e3f05/.user_uploaded/media_1793862677137_641c3f4b.jpg';
const mag6mmPath = 'C:/Users/Kavin/.gemini/antigravity/brain/fd9d1f7d-98d5-4658-84fa-1180770e3f05/.user_uploaded/media_1793862623072_3916a0bb.jpg';

async function createCardWithDashedLine(magPath, width, isSquare) {
  const cardImg = await sharp(magPath).resize(width).toBuffer();
  const meta = await sharp(cardImg).metadata();
  return { buffer: cardImg, width: meta.width, height: meta.height };
}

async function patchDimensionAndMagnet(inputPath, outputPath, newText, is6mm, isSquare) {
  // Top text: x 484..552, y 91..121.
  // Extract clean background patch from x: 350, y: 85, width: 90, height: 45
  const topPatch = await sharp(inputPath)
    .extract({ left: 350, top: 85, width: 90, height: 45 })
    .toBuffer();

  // Left text: x 41..99, y 499..530.
  // Extract clean background patch from x: 25, y: 350, width: 75, height: 50
  const leftPatch = await sharp(inputPath)
    .extract({ left: 25, top: 350, width: 75, height: 50 })
    .toBuffer();

  const svgText = `
  <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
    <style>
      .dim-text {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        font-size: 34px;
        font-weight: 700;
        fill: #111111;
        text-anchor: middle;
        dominant-baseline: central;
      }
      .pointer-line {
        stroke: #333333;
        stroke-width: 1.5;
        stroke-dasharray: 4,4;
        fill: none;
      }
    </style>
    <!-- Top text -->
    <text x="518" y="106" class="dim-text">${newText}</text>
    <!-- Left text -->
    <text x="68" y="513" class="dim-text">${newText}</text>
  </svg>
  `;

  // Magnet card placement:
  // Card at top-right: x: 775, y: 30
  const cardWidth = 210;
  const magPath = is6mm ? mag6mmPath : mag4mmPath;
  const { buffer: cardBuf, width: cw, height: ch } = await createCardWithDashedLine(magPath, cardWidth, isSquare);

  const cardX = 775;
  const cardY = 32;

  // Let's composite!
  await sharp(inputPath)
    .composite([
      { input: topPatch, left: 475, top: 85 },
      { input: leftPatch, left: 35, top: 490 },
      { input: Buffer.from(svgText), left: 0, top: 0 },
      { input: cardBuf, left: cardX, top: cardY }
    ])
    .toFile(outputPath);

  console.log(`Generated: ${outputPath} with ${is6mm ? '6x2mm' : '4x2mm'} magnet spec`);
}

async function main() {
  // Square
  await patchDimensionAndMagnet(
    'public/images/dimension_preview_square_3x3_official.jpg',
    'public/images/dimension_preview_square_2x2.jpg',
    '2 in',
    false, // 4mm
    true
  );
  await patchDimensionAndMagnet(
    'public/images/dimension_preview_square_3x3_official.jpg',
    'public/images/dimension_preview_square_3x3.jpg',
    '3 in',
    false, // 4mm
    true
  );
  await patchDimensionAndMagnet(
    'public/images/dimension_preview_square_3x3_official.jpg',
    'public/images/dimension_preview_square_4x4.jpg',
    '4 in',
    true, // 6mm
    true
  );

  // Heart
  await patchDimensionAndMagnet(
    'public/images/dimension_preview_heart_3x3_official.jpg',
    'public/images/dimension_preview_heart_2x2.png',
    '2 in',
    false, // 4mm
    false
  );
  await patchDimensionAndMagnet(
    'public/images/dimension_preview_heart_3x3_official.jpg',
    'public/images/dimension_preview_heart_3x3.png',
    '3 in',
    false, // 4mm
    false
  );
  await patchDimensionAndMagnet(
    'public/images/dimension_preview_heart_3x3_official.jpg',
    'public/images/dimension_preview_heart_4x4.png',
    '4 in',
    true, // 6mm
    false
  );

  console.log('All dimension preview images updated with magnet specs!');
}

main().catch(console.error);
