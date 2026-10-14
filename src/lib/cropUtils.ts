export interface CropSpec {
  scale?: number;
  panX?: number;
  panY?: number;
  aspectRatio?: number;
  cropMode?: 'fill' | 'fit';
}

let sharpLib: any = null;
async function getSharpInstance() {
  if (sharpLib) return sharpLib;
  try {
    const mod = await import('sharp');
    sharpLib = mod.default || mod;
    return sharpLib;
  } catch (e) {
    console.warn("Notice: sharp native binary not loaded in serverless environment, using original image fallback:", e);
    return null;
  }
}

/**
 * Shape to target aspect ratio and physical print dimensions mapping (300 DPI)
 */
export const SHAPE_PRINT_DIMENSIONS: Record<string, { width: number; height: number; aspectRatio: number }> = {
  polaroid: { width: 900, height: 1200, aspectRatio: 0.75 }, // 3x4 inch
  arch: { width: 900, height: 1200, aspectRatio: 0.75 },     // 3x4 inch
  landscape: { width: 1200, height: 900, aspectRatio: 1.333 }, // 4x3 inch
  portrait: { width: 900, height: 1200, aspectRatio: 0.75 },
  'portrait-wide': { width: 1000, height: 1200, aspectRatio: 0.833 },
  love: { width: 900, height: 900, aspectRatio: 1.0 },       // 3x3 inch
  circle: { width: 900, height: 900, aspectRatio: 1.0 },     // 3x3 inch
  'circle-bloom': { width: 900, height: 900, aspectRatio: 1.0 },
  hexagon: { width: 900, height: 900, aspectRatio: 1.0 },
  'scalloped-stand': { width: 1500, height: 2000, aspectRatio: 0.75 }, // 5x7 ratio (3:4 photo area)
  grande: { width: 1200, height: 1800, aspectRatio: 0.667 }, // 4x6 inch
  oval: { width: 800, height: 1200, aspectRatio: 0.667 },    // 2:3 ratio
  filmstrip: { width: 600, height: 1800, aspectRatio: 0.333 }, // 1:3 ratio
  cloud: { width: 1000, height: 1000, aspectRatio: 1.0 },
  crest: { width: 900, height: 1100, aspectRatio: 0.818 },
  custom: { width: 1200, height: 1200, aspectRatio: 1.0 },
};

/**
 * Server-side high-resolution image crop generator using sharp.
 * Applies the customer's scale, pan coordinates, and frame aspect ratio to produce an accurate print-ready asset.
 */
export async function renderAdjustedImage(
  inputBuffer: Buffer,
  cropSpec?: CropSpec,
  customWidth?: number,
  customHeight?: number
): Promise<Buffer> {
  const sharp = await getSharpInstance();
  if (!sharp) {
    return inputBuffer;
  }
  const metadata = await sharp(inputBuffer).metadata();
  const imgWidth = metadata.width || 1200;
  const imgHeight = metadata.height || 1200;

  const scale = Math.max(1.0, Math.min(3.0, Number(cropSpec?.scale) || 1.0));
  const panX = Math.max(-100, Math.min(100, Number(cropSpec?.panX) || 0));
  const panY = Math.max(-100, Math.min(100, Number(cropSpec?.panY) || 0));
  const targetAspect = Number(cropSpec?.aspectRatio) > 0 ? Number(cropSpec?.aspectRatio) : 1.0;

  // Determine target pixel output dimensions preserving target aspect ratio
  let targetWidth = customWidth || 1200;
  let targetHeight = customHeight || Math.round(targetWidth / targetAspect);

  if (customWidth && customHeight) {
    targetWidth = customWidth;
    targetHeight = customHeight;
  }

  // If customer selected 'fit' (Full Photo, No Cutoff), fit entire photo without extracting/cutting off faces
  if (cropSpec?.cropMode === 'fit') {
    return await sharp(inputBuffer)
      .resize(targetWidth, targetHeight, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png({ quality: 100 })
      .toBuffer();
  }

  // Calculate base unzoomed crop frame inside source image fitting target aspect ratio
  let baseCropWidth = imgWidth;
  let baseCropHeight = Math.round(imgWidth / targetAspect);

  if (baseCropHeight > imgHeight) {
    baseCropHeight = imgHeight;
    baseCropWidth = Math.round(imgHeight * targetAspect);
  }

  // Apply user zoom (scale): higher scale means smaller viewport into source image
  const viewWidth = Math.max(10, Math.round(baseCropWidth / scale));
  const viewHeight = Math.max(10, Math.round(baseCropHeight / scale));

  // Center coordinate offset adjusted by pan percentages (-100% to +100%)
  const maxOffsetX = (imgWidth - viewWidth) / 2;
  const maxOffsetY = (imgHeight - viewHeight) / 2;

  const centerX = imgWidth / 2 + (panX / 100) * maxOffsetX;
  const centerY = imgHeight / 2 + (panY / 100) * maxOffsetY;

  let left = Math.round(centerX - viewWidth / 2);
  let top = Math.round(centerY - viewHeight / 2);

  // Clamp strictly within image bounds
  left = Math.max(0, Math.min(imgWidth - viewWidth, left));
  top = Math.max(0, Math.min(imgHeight - viewHeight, top));

  const extractWidth = Math.min(viewWidth, imgWidth - left);
  const extractHeight = Math.min(viewHeight, imgHeight - top);

  return await sharp(inputBuffer)
    .extract({
      left,
      top,
      width: extractWidth,
      height: extractHeight
    })
    .resize(targetWidth, targetHeight, { fit: 'fill' })
    .png({ quality: 100 })
    .toBuffer();
}
