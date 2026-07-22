import { MagnetShapeId } from './types';

export const SHAPE_PRICES: Record<MagnetShapeId, number> = {
  polaroid: 279,
  landscape: 249,
  portrait: 279,
  'portrait-wide': 299,
  cloud: 299,
  arch: 299,
  filmstrip: 349,
  'scalloped-stand': 499,
  grande: 349,
  love: 299,
  circle: 249,
  'circle-bloom': 299,
  hexagon: 299,
  crest: 329,
  oval: 299,
  custom: 399,
};

export const getShapePrice = (shapeId: MagnetShapeId | string) =>
  SHAPE_PRICES[shapeId as MagnetShapeId] ?? SHAPE_PRICES.custom;
