import { MagnetShapeId } from '../types';

export const SHAPE_SAMPLE_IMAGES: Record<MagnetShapeId, string> = {
  arch: '/images/shape_arch_magnet_1779653475722.png',
  cloud: '/images/shape_cloud_magnet_1780939383548.png',
  circle: '/images/shape_circle_family_dog.jpg',
  polaroid: '/images/shape_polaroid_magnet_1780939416510.png',
  love: '/images/shape_heart_wedding_couple.png',
  filmstrip: '/images/shape_filmstrip_magnet_1780939443747.png',
  custom: '/images/shape_custom_silhouette_1780939456213.png',
  landscape: '/images/scenic_landscape_sample_1782458156606.jpg',
  portrait: '/images/couple_portrait_sample_1782458143228.jpg',
  'portrait-wide': '/images/architectural_detail_sample_1782458171090.jpg',
  grande: '/images/couple_portrait_sample_1782458143228.jpg',
  'circle-bloom': '/images/scenic_landscape_sample_1782458156606.jpg',
  hexagon: '/images/architectural_detail_sample_1782458171090.jpg',
  crest: '/images/couple_portrait_sample_1782458143228.jpg',
  oval: '/images/couple_portrait_sample_1782458143228.jpg',
  'scalloped-stand': '/images/scalloped_stand_product_preview_1782458429878.jpg',
};

export function getShapeOuterClass(id: string): string {
  switch (id) {
    case 'arch':
      return 'shape-arch aspect-[3/4] w-[min(58vw,16rem)]';
    case 'cloud':
      return 'shape-cloud aspect-[1.4/1] w-[min(72vw,20rem)]';
    case 'circle':
      return 'rounded-full aspect-square w-[min(58vw,16rem)]';
    case 'circle-bloom':
      return 'shape-circle-cloud aspect-square w-[min(58vw,16rem)]';
    case 'landscape':
      return 'rounded-2xl aspect-[1.4/1] w-[min(72vw,20rem)]';
    case 'portrait':
      return 'rounded-2xl aspect-[3/4] w-[min(58vw,16rem)]';
    case 'portrait-wide':
      return 'rounded-2xl aspect-[3.5/4.25] w-[min(56vw,15.5rem)]';
    case 'grande':
      return 'rounded-[32px] aspect-[2/3] w-[min(54vw,15rem)]';
    case 'hexagon':
      return 'shape-hexagon aspect-[1.15/1] w-[min(58vw,16rem)]';
    case 'crest':
      return 'shape-crest aspect-square w-[min(58vw,16rem)]';
    case 'oval':
      return 'shape-oval aspect-[2/3] w-[min(54vw,15rem)]';
    case 'scalloped-stand':
      return 'shape-scalloped border-[6px] border-red-900 bg-white p-3 w-[min(58vw,16rem)] aspect-[3/4]';
    case 'polaroid':
      return 'shape-polaroid bg-white pb-12 pt-2.5 px-2.5 shadow-2xl w-[min(54vw,15rem)] aspect-[4/5] border border-neutral-200';
    case 'love':
      return 'shape-heart aspect-square w-[min(58vw,16rem)]';
    case 'filmstrip':
      return 'bg-zinc-950 p-[3px] rounded-lg aspect-[1/3] w-[min(28vw,9rem)]';
    default:
      return 'rounded-3xl aspect-[4/5] w-[min(58vw,16rem)]';
  }
}

export function getShapeClipClass(id: string): string {
  switch (id) {
    case 'love':
      return 'shape-heart';
    case 'hexagon':
      return 'shape-hexagon';
    case 'arch':
      return 'shape-arch';
    case 'cloud':
      return 'shape-cloud';
    case 'circle-bloom':
      return 'shape-circle-cloud';
    case 'crest':
      return 'shape-crest';
    case 'oval':
      return 'shape-oval';
    case 'scalloped-stand':
      return 'rounded-lg';
    case 'circle':
      return 'rounded-full';
    default:
      return 'rounded-md';
  }
}
