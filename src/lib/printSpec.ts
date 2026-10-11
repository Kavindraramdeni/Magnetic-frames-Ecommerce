/**
 * Physical Manufacturing & Print Specifications
 * Standard target print resolution: 300 DPI (dots per inch)
 * 1 inch = 300 pixels at 300 DPI
 * Bleed margin: 0.125 inch (37.5 px at 300 DPI) on all sides for laser cutting tolerance
 */

import { MagnetShapeId } from './types';

export interface PhysicalPrintSpec {
  shapeId: MagnetShapeId;
  name: string;
  widthInches: number;
  heightInches: number;
  bleedInches: number; // typically 0.125 in (3.175 mm)
  safeMarginInches: number; // inner safe zone for content
  // At 300 DPI:
  widthPixels: number;
  heightPixels: number;
  bleedPixels: number;
  totalCanvasWidthPx: number; // widthPixels + (2 * bleedPixels)
  totalCanvasHeightPx: number; // heightPixels + (2 * bleedPixels)
  cutlineType: 'heart' | 'circle' | 'arch' | 'rect' | 'hexagon' | 'oval' | 'custom';
}

export const PHYSICAL_PRINT_SPECS: Record<MagnetShapeId, PhysicalPrintSpec> = {
  love: {
    shapeId: 'love',
    name: 'Sculpted Heart',
    widthInches: 3.0,
    heightInches: 3.0,
    bleedInches: 0.125,
    safeMarginInches: 0.125,
    widthPixels: 900,
    heightPixels: 900,
    bleedPixels: 38,
    totalCanvasWidthPx: 976,
    totalCanvasHeightPx: 976,
    cutlineType: 'heart'
  },
  circle: {
    shapeId: 'circle',
    name: 'Minimal Circle',
    widthInches: 3.0,
    heightInches: 3.0,
    bleedInches: 0.125,
    safeMarginInches: 0.125,
    widthPixels: 900,
    heightPixels: 900,
    bleedPixels: 38,
    totalCanvasWidthPx: 976,
    totalCanvasHeightPx: 976,
    cutlineType: 'circle'
  },
  'circle-bloom': {
    shapeId: 'circle-bloom',
    name: 'Circle Bloom',
    widthInches: 3.0,
    heightInches: 3.0,
    bleedInches: 0.125,
    safeMarginInches: 0.125,
    widthPixels: 900,
    heightPixels: 900,
    bleedPixels: 38,
    totalCanvasWidthPx: 976,
    totalCanvasHeightPx: 976,
    cutlineType: 'circle'
  },
  polaroid: {
    shapeId: 'polaroid',
    name: 'Classic Polaroid',
    widthInches: 3.0,
    heightInches: 4.0,
    bleedInches: 0.125,
    safeMarginInches: 0.125,
    widthPixels: 900,
    heightPixels: 1200,
    bleedPixels: 38,
    totalCanvasWidthPx: 976,
    totalCanvasHeightPx: 1276,
    cutlineType: 'rect'
  },
  arch: {
    shapeId: 'arch',
    name: 'The Arch Frame',
    widthInches: 3.0,
    heightInches: 4.0,
    bleedInches: 0.125,
    safeMarginInches: 0.125,
    widthPixels: 900,
    heightPixels: 1200,
    bleedPixels: 38,
    totalCanvasWidthPx: 976,
    totalCanvasHeightPx: 1276,
    cutlineType: 'arch'
  },
  landscape: {
    shapeId: 'landscape',
    name: 'Horizontal Snapshot',
    widthInches: 4.0,
    heightInches: 3.0,
    bleedInches: 0.125,
    safeMarginInches: 0.125,
    widthPixels: 1200,
    heightPixels: 900,
    bleedPixels: 38,
    totalCanvasWidthPx: 1276,
    totalCanvasHeightPx: 976,
    cutlineType: 'rect'
  },
  portrait: {
    shapeId: 'portrait',
    name: 'Vertical Snapshot',
    widthInches: 3.0,
    heightInches: 4.0,
    bleedInches: 0.125,
    safeMarginInches: 0.125,
    widthPixels: 900,
    heightPixels: 1200,
    bleedPixels: 38,
    totalCanvasWidthPx: 976,
    totalCanvasHeightPx: 1276,
    cutlineType: 'rect'
  },
  'portrait-wide': {
    shapeId: 'portrait-wide',
    name: 'Wide Portrait',
    widthInches: 3.5,
    heightInches: 4.5,
    bleedInches: 0.125,
    safeMarginInches: 0.125,
    widthPixels: 1050,
    heightPixels: 1350,
    bleedPixels: 38,
    totalCanvasWidthPx: 1126,
    totalCanvasHeightPx: 1426,
    cutlineType: 'rect'
  },
  grande: {
    shapeId: 'grande',
    name: 'Grande Frame',
    widthInches: 4.0,
    heightInches: 6.0,
    bleedInches: 0.125,
    safeMarginInches: 0.125,
    widthPixels: 1200,
    heightPixels: 1800,
    bleedPixels: 38,
    totalCanvasWidthPx: 1276,
    totalCanvasHeightPx: 1876,
    cutlineType: 'rect'
  },
  'scalloped-stand': {
    shapeId: 'scalloped-stand',
    name: 'Premium Scalloped Stand',
    widthInches: 5.0,
    heightInches: 7.0,
    bleedInches: 0.125,
    safeMarginInches: 0.125,
    widthPixels: 1500,
    heightPixels: 2100,
    bleedPixels: 38,
    totalCanvasWidthPx: 1576,
    totalCanvasHeightPx: 2176,
    cutlineType: 'rect'
  },
  cloud: {
    shapeId: 'cloud',
    name: 'Cloud Silhouette',
    widthInches: 4.0,
    heightInches: 3.0,
    bleedInches: 0.125,
    safeMarginInches: 0.125,
    widthPixels: 1200,
    heightPixels: 900,
    bleedPixels: 38,
    totalCanvasWidthPx: 1276,
    totalCanvasHeightPx: 976,
    cutlineType: 'custom'
  },
  filmstrip: {
    shapeId: 'filmstrip',
    name: 'Vintage Filmstrip',
    widthInches: 2.5,
    heightInches: 6.0,
    bleedInches: 0.125,
    safeMarginInches: 0.125,
    widthPixels: 750,
    heightPixels: 1800,
    bleedPixels: 38,
    totalCanvasWidthPx: 826,
    totalCanvasHeightPx: 1876,
    cutlineType: 'rect'
  },
  hexagon: {
    shapeId: 'hexagon',
    name: 'Modern Hexagon',
    widthInches: 3.5,
    heightInches: 3.5,
    bleedInches: 0.125,
    safeMarginInches: 0.125,
    widthPixels: 1050,
    heightPixels: 1050,
    bleedPixels: 38,
    totalCanvasWidthPx: 1126,
    totalCanvasHeightPx: 1126,
    cutlineType: 'hexagon'
  },
  crest: {
    shapeId: 'crest',
    name: 'Royal Crest',
    widthInches: 3.5,
    heightInches: 4.5,
    bleedInches: 0.125,
    safeMarginInches: 0.125,
    widthPixels: 1050,
    heightPixels: 1350,
    bleedPixels: 38,
    totalCanvasWidthPx: 1126,
    totalCanvasHeightPx: 1426,
    cutlineType: 'custom'
  },
  oval: {
    shapeId: 'oval',
    name: 'Cameo Oval',
    widthInches: 3.0,
    heightInches: 4.0,
    bleedInches: 0.125,
    safeMarginInches: 0.125,
    widthPixels: 900,
    heightPixels: 1200,
    bleedPixels: 38,
    totalCanvasWidthPx: 976,
    totalCanvasHeightPx: 1276,
    cutlineType: 'oval'
  },
  custom: {
    shapeId: 'custom',
    name: 'Custom Shape',
    widthInches: 3.5,
    heightInches: 3.5,
    bleedInches: 0.125,
    safeMarginInches: 0.125,
    widthPixels: 1050,
    heightPixels: 1050,
    bleedPixels: 38,
    totalCanvasWidthPx: 1126,
    totalCanvasHeightPx: 1126,
    cutlineType: 'custom'
  }
};

/**
 * Gang Sheet Specification (12 x 18 inches at 300 DPI)
 * Dimensions: 3600 x 5400 pixels
 */
export const GANG_SHEET_SPEC = {
  name: 'Standard 12x18 UV Print Bed',
  widthInches: 12.0,
  heightInches: 18.0,
  widthPixels: 3600,
  heightPixels: 5400,
  marginInches: 0.5,
  marginPixels: 150,
  usableWidthPx: 3300,
  usableHeightPx: 5100
};

/**
 * Image Quality Evaluation
 * Checks if customer uploaded image resolution provides at least 150 DPI for physical frame.
 * (300 DPI = optimal, 150-299 DPI = acceptable, < 150 DPI = low resolution flag)
 */
export function evaluatePrintQuality(
  imageWidthPx: number,
  imageHeightPx: number,
  shapeId: MagnetShapeId
): { effectiveDpi: number; quality: 'OPTIMAL' | 'ACCEPTABLE' | 'LOW_RESOLUTION'; warning?: string } {
  const spec = PHYSICAL_PRINT_SPECS[shapeId] || PHYSICAL_PRINT_SPECS.custom;
  const dpiX = imageWidthPx / spec.widthInches;
  const dpiY = imageHeightPx / spec.heightInches;
  const effectiveDpi = Math.round(Math.min(dpiX, dpiY));

  if (effectiveDpi >= 300) {
    return { effectiveDpi, quality: 'OPTIMAL' };
  } else if (effectiveDpi >= 150) {
    return {
      effectiveDpi,
      quality: 'ACCEPTABLE',
      warning: `Good quality (~${effectiveDpi} DPI). Output will be clear for standard display.`
    };
  } else {
    return {
      effectiveDpi,
      quality: 'LOW_RESOLUTION',
      warning: `Low resolution (~${effectiveDpi} DPI). Image may appear slightly pixelated when printed.`
    };
  }
}
