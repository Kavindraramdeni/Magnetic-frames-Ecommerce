const sharp = require('sharp');

async function patchDimensionText(inputPath, outputPath, newText) {
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

  // SVG text placed exactly at the center of the original text
  // Top center: x = (484+552)/2 = 518, y = (91+121)/2 = 106
  // Left text: was not rotated, it was vertical or horizontal! Notice y: 499..530, x: 41..99 -> it is horizontal!
  // Width is 58px, height is 31px! It was NOT rotated in the original image!
  // In the original, "3 in" on left is written horizontally: "3 in" with "3" on left and "in" on right or vertically stacked!
  // Let's check original text layout on left.
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
    </style>
    <!-- Top text -->
    <text x="518" y="106" class="dim-text">${newText}</text>
    <!-- Left text -->
    <text x="68" y="513" class="dim-text">${newText}</text>
  </svg>
  `;

  await sharp(inputPath)
    .composite([
      { input: topPatch, left: 475, top: 85 },
      { input: leftPatch, left: 35, top: 490 },
      { input: Buffer.from(svgText), left: 0, top: 0 }
    ])
    .toFile(outputPath);

  console.log(`Generated seamless patch: ${outputPath}`);
}

async function main() {
  await patchDimensionText(
    'public/images/dimension_preview_square_3x3_official.jpg',
    'public/images/dimension_preview_square_2x2.jpg',
    '2 in'
  );
  await patchDimensionText(
    'public/images/dimension_preview_square_3x3_official.jpg',
    'public/images/dimension_preview_square_4x4.jpg',
    '4 in'
  );

  await patchDimensionText(
    'public/images/dimension_preview_heart_3x3_official.jpg',
    'public/images/dimension_preview_heart_2x2.png',
    '2 in'
  );
  await patchDimensionText(
    'public/images/dimension_preview_heart_3x3_official.jpg',
    'public/images/dimension_preview_heart_4x4.png',
    '4 in'
  );

  console.log('Done seamless patching!');
}

main().catch(console.error);
