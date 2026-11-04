const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function createDimensionImage({ baseImagePath, widthInches, heightInches, outputPath }) {
  const base = sharp(baseImagePath);
  const meta = await base.metadata();
  const W = meta.width || 1200;
  const H = meta.height || 1200;

  // Frame bounding box inside the canvas
  const frameX = Math.round(W * 0.16);
  const frameY = Math.round(H * 0.14);
  const frameW = Math.round(W * 0.74);
  const frameH = Math.round(H * 0.76);

  // Top dimension bar
  const topBarY = Math.round(H * 0.07);
  const topTickY1 = topBarY - 12;
  const topTickY2 = topBarY + 12;
  const topText = `${widthInches} in`;

  // Left dimension bar
  const leftBarX = Math.round(W * 0.07);
  const leftTickX1 = leftBarX - 12;
  const leftTickX2 = leftBarX + 12;
  const leftText = `${heightInches} in`;

  const fontSize = Math.round(W * 0.040);

  const svgOverlay = `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <style>
      .dim-line { stroke: #1E1B18; stroke-width: 3; stroke-linecap: square; }
      .dim-text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; font-size: ${fontSize}px; font-weight: 700; fill: #1E1B18; text-anchor: middle; dominant-baseline: middle; }
    </style>

    <!-- TOP DIMENSION BAR -->
    <line x1="${frameX}" y1="${topTickY1}" x2="${frameX}" y2="${topTickY2}" class="dim-line" />
    <line x1="${frameX}" y1="${topBarY}" x2="${frameX + frameW * 0.36}" y2="${topBarY}" class="dim-line" />
    <text x="${frameX + frameW * 0.5}" y="${topBarY}" class="dim-text">${topText}</text>
    <line x1="${frameX + frameW * 0.64}" y1="${topBarY}" x2="${frameX + frameW}" y2="${topBarY}" class="dim-line" />
    <line x1="${frameX + frameW}" y1="${topTickY1}" x2="${frameX + frameW}" y2="${topTickY2}" class="dim-line" />

    <!-- LEFT DIMENSION BAR -->
    <line x1="${leftTickX1}" y1="${frameY}" x2="${leftTickX2}" y2="${frameY}" class="dim-line" />
    <line x1="${leftBarX}" y1="${frameY}" x2="${leftBarX}" y2="${frameY + frameH * 0.36}" class="dim-line" />
    <text x="${leftBarX}" y="${frameY + frameH * 0.5}" class="dim-text" transform="rotate(-90 ${leftBarX} ${frameY + frameH * 0.5})">${leftText}</text>
    <line x1="${leftBarX}" y1="${frameY + frameH * 0.64}" x2="${leftBarX}" y2="${frameY + frameH}" class="dim-line" />
    <line x1="${leftTickX1}" y1="${frameY + frameH}" x2="${leftTickX2}" y2="${frameY + frameH}" class="dim-line" />
  </svg>
  `;

  await sharp(baseImagePath)
    .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
    .toFile(outputPath);

  console.log(`Generated: ${outputPath}`);
}

async function run() {
  const tasks = [
    // Square
    { baseImagePath: 'public/images/dimension_preview_square.jpg', widthInches: 2, heightInches: 2, outputPath: 'public/images/dimension_preview_square_2x2.jpg' },
    { baseImagePath: 'public/images/dimension_preview_square.jpg', widthInches: 3, heightInches: 3, outputPath: 'public/images/dimension_preview_square_3x3.jpg' },
    { baseImagePath: 'public/images/dimension_preview_square.jpg', widthInches: 4, heightInches: 4, outputPath: 'public/images/dimension_preview_square_4x4.jpg' },

    // Circle
    { baseImagePath: 'public/images/shape_circle_family_furry_friend.png', widthInches: 2, heightInches: 2, outputPath: 'public/images/dimension_preview_circle_2x2.png' },
    { baseImagePath: 'public/images/shape_circle_family_furry_friend.png', widthInches: 3, heightInches: 3, outputPath: 'public/images/dimension_preview_circle_3x3.png' },
    { baseImagePath: 'public/images/shape_circle_family_furry_friend.png', widthInches: 4, heightInches: 4, outputPath: 'public/images/dimension_preview_circle_4x4.png' },

    // Heart
    { baseImagePath: 'public/images/shape_heart_romantic_wedding.png', widthInches: 2, heightInches: 2, outputPath: 'public/images/dimension_preview_heart_2x2.png' },
    { baseImagePath: 'public/images/shape_heart_romantic_wedding.png', widthInches: 3, heightInches: 3, outputPath: 'public/images/dimension_preview_heart_3x3.png' },
    { baseImagePath: 'public/images/shape_heart_romantic_wedding.png', widthInches: 4, heightInches: 4, outputPath: 'public/images/dimension_preview_heart_4x4.png' },
  ];

  for (const t of tasks) {
    await createDimensionImage(t);
  }
  console.log('All dimension images created successfully!');
}

run().catch(console.error);
