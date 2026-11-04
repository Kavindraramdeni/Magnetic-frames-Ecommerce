import React from 'react';
import WholesaleInquiriesPage from './WholesaleInquiriesPage';
import { CartItem } from '../types';

interface WholesaleB2BPageProps {
  onBackToHome: () => void;
  onAddToCart?: (item: CartItem) => void;
  onOpenCart?: () => void;
  cartCount?: number;
}

export default function WholesaleB2BPage(props: WholesaleB2BPageProps) {
  return <WholesaleInquiriesPage {...props} />;
}
