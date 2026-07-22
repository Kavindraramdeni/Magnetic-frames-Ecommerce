export type MagnetShapeId = 'cloud' | 'circle' | 'arch' | 'polaroid' | 'filmstrip' | 'love' | 'custom' | 'landscape' | 'portrait' | 'portrait-wide' | 'grande' | 'circle-bloom' | 'hexagon' | 'crest' | 'oval' | 'scalloped-stand';

export interface MagnetShape {
  id: MagnetShapeId;
  name: string;
  price: number;
  originalPrice?: number;
  dimensions: string;
  description: string;
  shapeClass: string; // Tailwind border-radius or custom styling
  frameRatio: string; // aspect-ratio class like aspect-[4/5]
  tagline: string;
  isCustomSilhouette?: boolean;
  isTrending?: boolean;
}

export interface CustomOrder {
  shapeId: MagnetShapeId;
  quantity: number;
  photoUrl: string; // Data URL or template preloaded placeholder image
  photoName?: string;
  photoScale: number; // 1 to 2 coefficient for zoom
  photoPanX: number; // offset X percentage
  photoPanY: number; // offset Y percentage
}

export interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  comment: string;
  date: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface LifestyleItem {
  id: number;
  title: string;
  imageUrl: string;
  category: string;
}

export interface CartItem {
  id: string;
  shapeId: MagnetShapeId;
  shapeName: string;
  quantity: number;
  previewUrl: string;
  photoName: string;
  captionText: string;
  photoScale: number;
  photoPanX: number;
  photoPanY: number;
  customText?: string;
  objectKey?: string;
  price: number;
}
