import sharp from 'sharp';

export interface CropSpec {
  scale?: number;
  panX?: number;
  panY?: number;
  aspectRatio?: number;
}

/**
 * Server-side high-resolution image crop generator using sharp.
 * Applies the customer's scale and pan coordinates to produce a print-ready asset.
 */
export async function renderAdjustedImage(
  inputBuffer: Buffer,
  cropSpec?: CropSpec,
  targetWidth = 1200,
  targetHeight = 1200
): Promise<Buffer> {
  const metadata = await sharp(inputBuffer).metadata();
  const imgWidth = metadata.width || targetWidth;
  const imgHeight = metadata.height || targetHeight;

  const scale = Math.max(1.0, Math.min(3.0, Number(cropSpec?.scale) || 1.0));
  const panX = Math.max(-100, Math.min(100, Number(cropSpec?.panX) || 0));
  const panY = Math.max(-100, Math.min(100, Number(cropSpec?.panY) || 0));

  // Determine viewport dimensions on the source image based on zoom (scale)
  const viewWidth = Math.round(imgWidth / scale);
  const viewHeight = Math.round(imgHeight / scale);

  // Center coordinate offset adjusted by pan percentages (-100% to +100%)
  const maxOffsetX = (imgWidth - viewWidth) / 2;
  const maxOffsetY = (imgHeight - viewHeight) / 2;

  const centerX = imgWidth / 2 + (panX / 100) * maxOffsetX;
  const centerY = imgHeight / 2 + (panY / 100) * maxOffsetY;

  let left = Math.round(centerX - viewWidth / 2);
  let top = Math.round(centerY - viewHeight / 2);

  // Clamp within image bounds
  left = Math.max(0, Math.min(imgWidth - viewWidth, left));
  top = Math.max(0, Math.min(imgHeight - viewHeight, top));

  return await sharp(inputBuffer)
    .extract({
      left,
      top,
      width: Math.min(viewWidth, imgWidth - left),
      height: Math.min(viewHeight, imgHeight - top)
    })
    .resize(targetWidth, targetHeight, { fit: 'cover' })
    .png({ quality: 100 })
    .toBuffer();
}
