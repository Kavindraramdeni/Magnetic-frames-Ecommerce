import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BASE_SHAPES, PRESET_PHOTOS } from '../data';
import { MagnetShapeId, CustomOrder, CartItem } from '../types';
import BrandLogo from './BrandLogo';
import { 
  Upload, Sparkles, MessageSquare, RotateCcw, 
  ZoomIn, ArrowRight, Share2, HelpCircle, 
  Trash2, ShoppingBag, Plus, Minus, Check, Image, Info, ChevronDown, ChevronLeft, ChevronRight,
  CreditCard, Truck, Lock, ShieldCheck, Activity, X, AlertTriangle, Layers, Maximize2, Move
} from 'lucide-react';

export interface PhotoPoolItem {
  id: string;
  url: string;
  name: string;
  scale: number;
  panX: number;
  panY: number;
  assignedShapeId: MagnetShapeId;
  captionText?: string;
}

interface CustomizerProps {
  initialShapeId?: MagnetShapeId;
  initialPhotoUrl?: string;
  initialPhotoName?: string;
  initialScale?: number;
  initialPanX?: number;
  initialPanY?: number;
  cart?: CartItem[];
  setCart?: React.Dispatch<React.SetStateAction<CartItem[]>>;
  isCheckoutOpen?: boolean;
  setIsCheckoutOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenCart?: () => void;
}

export default function Customizer({ 
  initialShapeId = 'arch',
  initialPhotoUrl,
  initialPhotoName,
  initialScale = 1,
  initialPanX = 0,
  initialPanY = 0,
  cart: passedCart,
  setCart: passedSetCart,
  isCheckoutOpen: passedCheckoutOpen,
  setIsCheckoutOpen: passedSetCheckoutOpen,
  onOpenCart
}: CustomizerProps) {
  // Primary shape selection
  const [selectedShapeId, setSelectedShapeId] = useState<MagnetShapeId>(initialShapeId);
  const [isShapeDropdownOpen, setIsShapeDropdownOpen] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [customCaption, setCustomCaption] = useState<string>('Precious Moments');

  const handlePrevShape = () => {
    const currentIndex = BASE_SHAPES.findIndex(s => s.id === selectedShapeId);
    const prevIndex = (currentIndex - 1 + BASE_SHAPES.length) % BASE_SHAPES.length;
    setSelectedShapeId(BASE_SHAPES[prevIndex].id);
  };

  const handleNextShape = () => {
    const currentIndex = BASE_SHAPES.findIndex(s => s.id === selectedShapeId);
    const nextIndex = (currentIndex + 1) % BASE_SHAPES.length;
    setSelectedShapeId(BASE_SHAPES[nextIndex].id);
  };
  
  // Workspace Photo Adjustment States
  const [photoUrl, setPhotoUrl] = useState<string>(initialPhotoUrl || PRESET_PHOTOS[0].url);
  const [photoName, setPhotoName] = useState<string>(initialPhotoName || PRESET_PHOTOS[0].name);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [photoScale, setPhotoScale] = useState<number>(initialScale);
  const [photoPanX, setPhotoPanX] = useState<number>(initialPanX);
  const [photoPanY, setPhotoPanY] = useState<number>(initialPanY);
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);

  // --- MULTI-PHOTO GALLERY POOL (Upload multiple photos & assign shapes individually) ---
  const [photoPool, setPhotoPool] = useState<PhotoPoolItem[]>([
    {
      id: 'pool-1',
      url: initialPhotoUrl || PRESET_PHOTOS[0].url,
      name: initialPhotoName || PRESET_PHOTOS[0].name,
      scale: initialScale || 1.0,
      panX: initialPanX || 0,
      panY: initialPanY || 0,
      assignedShapeId: 'arch',
      captionText: 'Precious Moments'
    },
    {
      id: 'pool-2',
      url: PRESET_PHOTOS[1].url,
      name: PRESET_PHOTOS[1].name,
      scale: 1.0,
      panX: 0,
      panY: 0,
      assignedShapeId: 'circle',
      captionText: 'Sunny Memories'
    },
    {
      id: 'pool-3',
      url: PRESET_PHOTOS[2].url,
      name: PRESET_PHOTOS[2].name,
      scale: 1.05,
      panX: 0,
      panY: 0,
      assignedShapeId: 'polaroid',
      captionText: 'Retro Times'
    }
  ]);
  const [activePhotoId, setActivePhotoId] = useState<string>('pool-1');

  // Synchronize workspace adjustments back into active item in photoPool
  useEffect(() => {
    setPhotoPool(prev => prev.map(item => {
      if (item.id === activePhotoId) {
        return {
          ...item,
          url: photoUrl,
          name: photoName,
          scale: photoScale,
          panX: photoPanX,
          panY: photoPanY,
          assignedShapeId: selectedShapeId,
          captionText: customCaption
        };
      }
      return item;
    }));
  }, [photoScale, photoPanX, photoPanY, selectedShapeId, photoUrl, photoName, customCaption, activePhotoId]);

  // Select photo from pool to edit
  const handleSelectPhotoFromPool = (photo: PhotoPoolItem) => {
    setActivePhotoId(photo.id);
    setPhotoUrl(photo.url);
    setPhotoName(photo.name);
    setPhotoScale(photo.scale);
    setPhotoPanX(photo.panX);
    setPhotoPanY(photo.panY);
    setSelectedShapeId(photo.assignedShapeId);
    if (photo.captionText) {
      setCustomCaption(photo.captionText);
    }
  };

  // Remove photo from pool
  const handleRemovePhotoFromPool = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (photoPool.length <= 1) {
      alert('You need at least 1 photo in your pool.');
      return;
    }
    const updated = photoPool.filter(p => p.id !== id);
    setPhotoPool(updated);
    if (activePhotoId === id) {
      handleSelectPhotoFromPool(updated[0]);
    }
  };

  // Multiple File Upload Handler
  const handleMultipleFileUpload = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      alert('Please select valid image files (JPG, PNG, WEBP).');
      return;
    }

    setIsUploading(true);
    const newItems: PhotoPoolItem[] = [];
    let processed = 0;

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          const dataUrl = e.target.result;
          const img = new window.Image();
          img.onload = () => {
            const newItem: PhotoPoolItem = {
              id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              url: dataUrl,
              name: file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name,
              scale: 1.0,
              panX: 0,
              panY: 0,
              assignedShapeId: selectedShapeId || 'circle',
              captionText: 'Custom Moment'
            };
            newItems.push(newItem);
            processed++;

            if (processed === fileArray.length) {
              setPhotoPool(prev => [...prev, ...newItems]);
              // Activate the first newly uploaded photo
              const firstNew = newItems[0];
              setActivePhotoId(firstNew.id);
              setPhotoUrl(firstNew.url);
              setPhotoName(firstNew.name);
              setPhotoScale(firstNew.scale);
              setPhotoPanX(firstNew.panX);
              setPhotoPanY(firstNew.panY);
              if (firstNew.assignedShapeId) {
                setSelectedShapeId(firstNew.assignedShapeId);
              }
              setIsUploading(false);
            }
          };
          img.src = dataUrl;
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Add all pool photos to tray at once
  const handleAddAllPoolPhotosToCart = () => {
    const itemsToAdd = photoPool.map(item => {
      const shapeObj = BASE_SHAPES.find(s => s.id === item.assignedShapeId) || BASE_SHAPES[0];
      return {
        id: `pool-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        shapeId: item.assignedShapeId,
        shapeName: shapeObj.name,
        quantity: 1,
        previewUrl: item.url,
        photoName: item.name,
        captionText: item.assignedShapeId === 'polaroid' ? (item.captionText || customCaption) : '',
        photoScale: item.scale,
        photoPanX: item.panX,
        photoPanY: item.panY,
        price: shapeObj.price
      };
    });

    setCart(prev => [...prev, ...itemsToAdd]);
  };

  // Cart State Management
  const [localCart, localSetCart] = useState<CartItem[]>([]);
  const cart = passedCart !== undefined ? passedCart : localCart;
  const setCart = passedSetCart !== undefined ? passedSetCart : localSetCart;

  // Full-Stack Direct Checkout Modal States
  const [localCheckoutOpen, localSetCheckoutOpen] = useState(false);
  const isCheckoutOpen = passedCheckoutOpen !== undefined ? passedCheckoutOpen : localCheckoutOpen;
  const setIsCheckoutOpen = passedSetCheckoutOpen !== undefined ? passedSetCheckoutOpen : localSetCheckoutOpen;

  const [checkoutStep, setCheckoutStep] = useState<'details' | 'success'>('details');
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Shipping & Shiprocket Details
  const [shippingDetails, setShippingDetails] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [isPincodeChecking, setIsPincodeChecking] = useState(false);
  const [serviceabilityResult, setServiceabilityResult] = useState<{
    serviceable: boolean;
    courierName?: string;
    estimatedDays?: number;
    pincode?: string;
  } | null>(null);

  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const [showSimulatedGateway, setShowSimulatedGateway] = useState(false);
  const [razorpayOrderData, setRazorpayOrderData] = useState<any>(null);
  const [placedOrderDetails, setPlacedOrderDetails] = useState<any>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsShapeDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderMiniShapeIcon = (shapeId: MagnetShapeId) => {
    switch (shapeId) {
      case 'circle':
        return <div className="w-5 h-5 rounded-full border border-neutral-400 bg-neutral-50 shrink-0" />;
      case 'cloud':
        return <div className="w-5 h-5 shape-cloud border border-neutral-400 bg-neutral-100 shrink-0 scale-90" />;
      case 'arch':
        return <div className="w-4 h-5 rounded-t-full border border-neutral-400 bg-neutral-50 shrink-0" />;
      case 'polaroid':
        return (
          <div className="w-5 h-6 border border-neutral-400 bg-white p-[2.5px] flex flex-col justify-between shrink-0 rounded-sm">
            <div className="w-full h-3.5 bg-neutral-100 border border-neutral-200" />
            <div className="h-[2px]" />
          </div>
        );
      case 'love':
        return <div className="w-5 h-5 shape-heart border border-neutral-400 bg-neutral-100 shrink-0 scale-90" />;
      case 'filmstrip':
        return (
          <div className="w-4.5 h-6 border border-neutral-400 bg-neutral-50 flex flex-col justify-between p-[1px] shrink-0 rounded-sm">
            <div className="w-full h-1 bg-neutral-200" />
            <div className="w-full h-1 bg-neutral-200" />
            <div className="w-full h-1 bg-neutral-200" />
          </div>
        );
      case 'custom':
        return <Sparkles className="h-4 w-4 text-neutral-500 shrink-0" />;
      case 'landscape':
        return <div className="w-6 h-4.5 rounded border border-neutral-400 bg-neutral-50 shrink-0" />;
      case 'portrait':
        return <div className="w-4 h-5.5 rounded border border-neutral-400 bg-neutral-50 shrink-0" />;
      case 'portrait-wide':
        return <div className="w-5 h-5.5 rounded border border-neutral-400 bg-neutral-50 shrink-0" />;
      case 'grande':
        return <div className="w-4 h-6 rounded-md border border-neutral-400 bg-neutral-50 shrink-0" />;
      case 'circle-bloom':
        return <div className="w-5 h-5 shape-circle-cloud border border-neutral-400 bg-neutral-100 shrink-0 scale-90" />;
      case 'hexagon':
        return <div className="w-5 h-5 shape-hexagon border border-neutral-400 bg-neutral-100 shrink-0 scale-90" />;
      case 'crest':
        return <div className="w-5 h-5 shape-crest border border-neutral-400 bg-neutral-100 shrink-0 scale-90" />;
      case 'oval':
        return <div className="w-4 h-5.5 rounded-[50%] border border-neutral-400 bg-neutral-50 shrink-0" />;
      case 'scalloped-stand':
        return (
          <div className="w-5 h-6 flex flex-col items-center gap-0.5">
            <div className="w-5 h-5 shape-scalloped border border-red-800 bg-red-100 rounded-sm shrink-0" />
            <div className="w-3 h-1 bg-neutral-300 rounded-full" />
          </div>
        );
      default:
        return <div className="w-5 h-5 rounded border border-neutral-400 bg-neutral-50 shrink-0" />;
    }
  };

  // Direct Click-and-Drag / Finger Pan & Touch Zoom on Photo Canvas
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsPanning(true);
    setPanStart({ x: e.clientX - photoPanX, y: e.clientY - photoPanY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    const deltaX = e.clientX - panStart.x;
    const deltaY = e.clientY - panStart.y;
    setPhotoPanX(Math.min(150, Math.max(-150, Math.round(deltaX))));
    setPhotoPanY(Math.min(150, Math.max(-150, Math.round(deltaY))));
  };

  const handleMouseUpOrLeave = () => {
    setIsPanning(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      setIsPanning(true);
      setPanStart({ 
        x: e.touches[0].clientX - photoPanX, 
        y: e.touches[0].clientY - photoPanY 
      });
      setLastTouchDistance(null);
    } else if (e.touches.length === 2) {
      setIsPanning(false);
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setLastTouchDistance(distance);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && isPanning) {
      if (e.cancelable) e.preventDefault();
      const deltaX = e.touches[0].clientX - panStart.x;
      const deltaY = e.touches[0].clientY - panStart.y;
      setPhotoPanX(Math.min(150, Math.max(-150, Math.round(deltaX))));
      setPhotoPanY(Math.min(150, Math.max(-150, Math.round(deltaY))));
    } else if (e.touches.length === 2 && lastTouchDistance !== null) {
      if (e.cancelable) e.preventDefault();
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = distance - lastTouchDistance;
      const zoomStep = delta * 0.005;
      const newScale = photoScale + zoomStep;
      setPhotoScale(Math.min(2.5, Math.max(0.1, parseFloat(newScale.toFixed(2)))));
      setLastTouchDistance(distance);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const zoomStep = 0.05;
    const newScale = photoScale + (e.deltaY < 0 ? zoomStep : -zoomStep);
    setPhotoScale(Math.min(2.5, Math.max(0.1, parseFloat(newScale.toFixed(2)))));
  };

  const getShapeInches = (id: string) => {
    switch (id) {
      case 'polaroid': return '2.75" × 2.75"';
      case 'landscape': return '3.5" × 2.5"';
      case 'portrait': return '3.0" × 4.0"';
      case 'portrait-wide': return '3.5" × 4.25"';
      case 'cloud': return '4.2" × 5.0"';
      case 'arch': return '3.0" × 4.0"';
      case 'filmstrip': return '2.25" × 6.0"';
      case 'grande': return '4.0" × 6.0"';
      case 'love': return '4.0" × 4.0"';
      case 'circle': return '3.0" Diameter';
      case 'circle-bloom': return '4.0" Circle Cloud';
      case 'hexagon': return '4.0" × 3.4"';
      case 'crest': return '4.0" × 4.0"';
      case 'oval': return '3.0" × 4.2"';
      case 'scalloped-stand': return '5.0" × 7.0" (Stand)';
      default: return 'Fits up to 4.0" × 6.0"';
    }
  };
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Native non-passive wheel handler to prevent entire page/screen zooming on laptops when scrolling over photo preview
  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const zoomStep = 0.05;
      setPhotoScale((prev) =>
        Math.min(2.5, Math.max(0.1, parseFloat((prev + (e.deltaY < 0 ? zoomStep : -zoomStep)).toFixed(2))))
      );
    };

    container.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => container.removeEventListener('wheel', handleWheelNative);
  }, []);

  const activeShape = BASE_SHAPES.find((s) => s.id === selectedShapeId) || BASE_SHAPES[0];
  const currentShapeIndex = BASE_SHAPES.findIndex(s => s.id === selectedShapeId);
  const prevShapeIndex = (currentShapeIndex - 1 + BASE_SHAPES.length) % BASE_SHAPES.length;
  const nextShapeIndex = (currentShapeIndex + 1) % BASE_SHAPES.length;
  const prevShape = BASE_SHAPES[prevShapeIndex];
  const nextShape = BASE_SHAPES[nextShapeIndex];

  const baseShapePrice = activeShape.price;
  const currentItemSubtotal = baseShapePrice * quantity;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleMultipleFileUpload(e.target.files);
    }
  };

  const selectPreset = (url: string, name: string) => {
    const newPoolItem: PhotoPoolItem = {
      id: `preset-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      url,
      name,
      scale: 1.0,
      panX: 0,
      panY: 0,
      assignedShapeId: selectedShapeId || 'circle',
      captionText: 'Preset Memory'
    };
    setPhotoPool(prev => [...prev, newPoolItem]);
    handleSelectPhotoFromPool(newPoolItem);
  };

  const [addedFeedback, setAddedFeedback] = useState(false);

  const handleResetAdjustments = () => {
    setPhotoScale(1.0);
    setPhotoPanX(0);
    setPhotoPanY(0);
  };

  // Add current workspace design to cart without interrupting user flow with modals or drawers
  const handleAddToOrder = () => {
    const newCartItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      shapeId: activeShape.id,
      shapeName: activeShape.name,
      quantity,
      previewUrl: photoUrl,
      photoName,
      captionText: activeShape.id === 'polaroid' ? customCaption : '',
      photoScale,
      photoPanX,
      photoPanY,
      price: activeShape.price
    };

    setCart((prev) => [...prev, newCartItem]);
    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
    }, 2200);
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => prev.filter(item => item.id !== id));
  };

  // Cart pricing math
  const cartItemCount = cart.reduce((acc, x) => acc + x.quantity, 0);
  const cartSubtotal = cart.reduce((acc, x) => acc + (x.price * x.quantity), 0);
  const bulkDiscount = 0;
  const deliveryCharge = cartSubtotal === 0 ? 0 : (cartSubtotal >= 699 ? 0 : 60);
  const grandTotal = cartSubtotal + deliveryCharge;

  // Shiprocket Pincode Check
  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pin = e.target.value.replace(/\D/g, '');
    setShippingDetails({ ...shippingDetails, pincode: pin });

    if (pin.length === 6) {
      setIsPincodeChecking(true);
      try {
        const res = await fetch('/api/shiprocket/check-serviceability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pincode: pin, orderValue: grandTotal, weight: 0.25 * (cart.length || 1) })
        });
        const data = await res.json();
        setServiceabilityResult({
          serviceable: data.serviceable ?? true,
          courierName: data.courierName || 'Delhivery Express Surface',
          estimatedDays: data.estimatedDays || 3,
          pincode: pin
        });
      } catch (err) {
        setServiceabilityResult({
          serviceable: true,
          courierName: 'Delhivery Surface Express',
          estimatedDays: 3,
          pincode: pin
        });
      } finally {
        setIsPincodeChecking(false);
      }
    } else {
      setServiceabilityResult(null);
    }
  };

  const handleOpenCheckoutModal = () => {
    setCheckoutError(null);
    setIsCheckoutOpen(true);
  };

  // Razorpay Order Creation & Flow
  const handleInitiatePayment = async () => {
    if (!shippingDetails.fullName || !shippingDetails.phone || !shippingDetails.address || !shippingDetails.pincode) {
      setCheckoutError('Please fill in all delivery details (Name, Phone, Address, Pincode).');
      return;
    }

    if (!acceptedPolicies) {
      setCheckoutError('Please accept the studio policies before completing order.');
      return;
    }

    setIsPaymentLoading(true);
    setCheckoutError(null);

    const itemsToPay = cart.length > 0 ? cart : [{
      id: 'single-custom-item',
      shapeId: activeShape.id,
      shapeName: activeShape.name,
      quantity,
      previewUrl: photoUrl,
      photoName,
      captionText: activeShape.id === 'polaroid' ? customCaption : '',
      photoScale,
      photoPanX,
      photoPanY,
      price: activeShape.price
    }];

    const finalSubtotal = cart.length > 0 ? cartSubtotal : currentItemSubtotal;
    const finalDelivery = finalSubtotal >= 699 ? 0 : 60;
    const finalGrandTotal = finalSubtotal + finalDelivery;

    try {
      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: itemsToPay,
          shippingDetails,
          acceptedPolicies
        })
      });

      const orderRes = await response.json();

      if (!response.ok) {
        setCheckoutError(orderRes.error || 'Failed to initialize payment gateway.');
        return;
      }

      setRazorpayOrderData({
        orderId: orderRes.orderId,
        key: orderRes.razorpayKeyId,
        amount: orderRes.amount,
        currency: orderRes.currency,
        grandTotal: orderRes.grandTotal
      });

      if (orderRes.isMock || !orderRes.razorpayKeyId) {
        setShowSimulatedGateway(true);
      } else {
        // Initialize Razorpay SDK
        const options = {
          key: orderRes.razorpayKeyId,
          amount: orderRes.amount,
          currency: orderRes.currency,
          name: "KRIA Studio Acrylics",
          description: "Custom Laser-Cut Acrylic Magnet Order",
          order_id: orderRes.orderId,
          handler: function (response: any) {
            handlePaymentSuccess(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
          },
          prefill: {
            name: shippingDetails.fullName,
            email: shippingDetails.email,
            contact: shippingDetails.phone
          },
          theme: { color: "#111111" }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      setCheckoutError('Connection error. Please check your internet connection and try again.');
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handleSimulatePaymentResponse = (success: boolean) => {
    setShowSimulatedGateway(false);
    if (success) {
      handlePaymentSuccess(`PAY-${Date.now()}`, razorpayOrderData?.orderId || `ORD-${Date.now()}`, 'SIMULATED_SIG');
    } else {
      setCheckoutError('Payment attempt declined. Please retry or choose alternative method.');
    }
  };

  const handlePaymentSuccess = async (paymentId: string, orderId: string, signature: string) => {
    setIsPaymentLoading(true);
    const itemsToBook = cart.length > 0 ? cart : [{
      id: 'single-custom-item',
      shapeId: activeShape.id,
      shapeName: activeShape.name,
      quantity,
      previewUrl: photoUrl,
      photoName,
      captionText: activeShape.id === 'polaroid' ? customCaption : '',
      photoScale,
      photoPanX,
      photoPanY,
      price: activeShape.price
    }];

    try {
      const isMockPayment = orderId.startsWith('ORD-') || orderId.startsWith('order_mock_');
      const res = await fetch('/api/checkout/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          razorpay_signature: signature,
          cart: itemsToBook,
          shippingDetails,
          acceptedPolicies,
          isMock: isMockPayment
        })
      });

      const confirmData = await res.json();

      if (!res.ok) {
        setCheckoutError(confirmData.error || 'Order confirmation failed. Please contact support.');
        return;
      }

      setPlacedOrderDetails({
        orderId: confirmData.transactionId || orderId,
        trackingNumber: confirmData.trackingNumber || `SRW-${Math.floor(100000000 + Math.random() * 900000000)}`,
        courierName: confirmData.courierName || serviceabilityResult?.courierName || 'Delhivery Express Surface',
        deliveryEstimate: confirmData.deliveryEstimate || (serviceabilityResult?.estimatedDays ? `${serviceabilityResult.estimatedDays} Business Days` : '3-4 Business Days')
      });

      setCheckoutStep('success');
      setCart([]);
    } catch (err) {
      // Fallback: show success even if confirmation call fails (payment already captured)
      setPlacedOrderDetails({
        orderId,
        trackingNumber: `SRW-${Math.floor(100000000 + Math.random() * 900000000)}`,
        courierName: 'Delhivery Surface Express',
        deliveryEstimate: '3-4 Business Days'
      });
      setCheckoutStep('success');
      setCart([]);
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handleWhatsappCheckout = () => {
    const itemsText = cart.map(item => `- ${item.shapeName} (Qty: ${item.quantity}, Price: ₹${item.price * item.quantity})`).join('\n');
    const message = `Hello Kria Studio! I want to place a custom magnet set order:\n\n*Order Summary:*\n${itemsText}\n\n*Total Amount:* ₹${grandTotal}\n*Delivery Address:* ${shippingDetails.fullName || 'Customer'}, ${shippingDetails.city || 'India'}\n\nPlease confirm print files and payment details!`;
    const whatsappUrl = `https://wa.me/919392576792?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section id="customizer-section" className="select-none py-6 sm:py-12 relative">
      <div className="absolute top-[10%] right-[-10%] w-72 h-72 rounded-full bg-[#E8DCCF]/20 blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* Header Title */}
        <div className="text-center max-w-xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#111111] tracking-tight">
            Customize <span className="italic font-serif font-medium">Your Photo Set</span>
          </h2>
          <p className="font-sans text-xs text-neutral-500 mt-1 font-light">
            Upload multiple photos, choose acrylic shapes for each, and fine-tune zoom & position directly with your mouse cursor or finger.
          </p>
        </div>

        {/* 1. UPLOAD YOUR PHOTOS (Refactored to match exact image: Numbered badge + Dashed Square upload button + Thumbnails side by side) */}
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex items-center gap-3 px-1">
            <div className="w-7 h-7 rounded-full bg-[#6B1D2F] text-white font-sans font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              1
            </div>
            <h3 className="font-sans font-bold text-base sm:text-lg text-[#111111] tracking-tight">
              Upload your photos
            </h3>
          </div>
          
          <div className="w-full bg-[#FAF8F5] border border-neutral-200/80 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />

            {/* Horizontal Row: Upload Button + Uploaded Photos Thumbnails */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Dashed Square "+ Add photo" Upload Box */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-dashed border-[#D3C5B5] bg-white hover:bg-[#F5EFE8] hover:border-[#6B1D2F] transition-all flex flex-col items-center justify-center gap-1 cursor-pointer text-neutral-400 hover:text-neutral-700 shrink-0 group/upload"
              >
                {isUploading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-600 border-t-transparent" />
                ) : (
                  <>
                    <Plus className="h-6 w-6 stroke-[1.5] text-neutral-400 group-hover/upload:scale-110 transition-transform" />
                    <span className="font-sans text-xs font-medium text-neutral-600">Add photo</span>
                  </>
                )}
              </button>

              {/* Uploaded Photos Thumbnails Side-by-Side */}
              {photoPool.map((photo) => {
                const isActive = activePhotoId === photo.id;
                return (
                  <div
                    key={photo.id}
                    onClick={() => handleSelectPhotoFromPool(photo)}
                    className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer group shrink-0 bg-neutral-100 ${
                      isActive 
                        ? 'border-neutral-900 ring-2 ring-neutral-900/10 shadow-md scale-[1.02]' 
                        : 'border-neutral-200/90 hover:border-neutral-400'
                    }`}
                  >
                    <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                    
                    {/* Delete Photo Button */}
                    {photoPool.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleRemovePhotoFromPool(photo.id, e)}
                        className="absolute top-1.5 right-1.5 bg-neutral-900/80 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        title="Remove photo"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}

                    {isActive && (
                      <div className="absolute bottom-1 left-1 right-1 bg-neutral-900/90 text-white text-[9px] font-mono font-bold py-0.5 px-1 rounded text-center truncate">
                        Active
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Helper footer bar */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200/50 text-[11px] font-sans text-neutral-500">
              <span>Click any photo above to select & edit its acrylic shape and crop in the workspace below.</span>
              <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-wider">Supports Multiple Uploads</span>
            </div>
          </div>
        </div>

        {/* 2. LIVE SHAPE MULTI-PREVIEW (Instant photo rendering across all acrylic shapes) */}
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#6B1D2F] text-white font-sans font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                2
              </div>
              <h3 className="font-sans font-bold text-base sm:text-lg text-[#111111] tracking-tight">
                Choose Shape for Active Photo
              </h3>
              <span className="bg-[#E8DCCF] text-neutral-900 font-mono text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Live Preview
              </span>
            </div>
            <span className="font-sans text-[11px] text-neutral-500 font-light">
              Click any acrylic shape to switch frame style.
            </span>
          </div>

          <div className="w-full flex gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 px-1 scrollbar-thin">
            {BASE_SHAPES.map((shape) => {
              const isSelected = selectedShapeId === shape.id;
              return (
                <button
                  key={shape.id}
                  type="button"
                  onClick={() => {
                    setSelectedShapeId(shape.id);
                    handleResetAdjustments();
                  }}
                  className={`flex-none w-32 sm:w-36 bg-[#FAF8F5] border rounded-2xl p-3 flex flex-col items-center gap-2.5 transition-all duration-300 group/shape cursor-pointer relative ${
                    isSelected 
                      ? 'border-neutral-900 bg-white shadow-md scale-[1.02] ring-2 ring-neutral-900/10' 
                      : 'border-neutral-200/80 hover:border-neutral-400 hover:shadow-xs'
                  }`}
                >
                  {/* Miniature Shape Preview */}
                  <div className="w-18 h-18 sm:w-22 sm:h-22 flex items-center justify-center relative">
                    <div className={`relative overflow-hidden bg-neutral-100 border border-neutral-300/60 shadow-xs flex items-center justify-center ${
                      shape.id === 'arch' ? 'shape-arch aspect-[3/4] !w-[44px] !h-[58px] sm:!w-[50px] sm:!h-[66px]' :
                      shape.id === 'cloud' ? 'shape-cloud aspect-[1.4/1] !w-[60px] !h-[42px] sm:!w-[70px] sm:!h-[50px]' :
                      shape.id === 'circle' ? 'rounded-full aspect-square !w-[48px] !h-[48px] sm:!w-[58px] sm:!h-[58px]' :
                      shape.id === 'circle-bloom' ? 'shape-circle-cloud aspect-square !w-[48px] !h-[48px] sm:!w-[58px] sm:!h-[58px]' :
                      shape.id === 'landscape' ? 'rounded-lg aspect-[1.4/1] !w-[60px] !h-[42px] sm:!w-[70px] sm:!h-[50px]' :
                      shape.id === 'portrait' ? 'rounded-lg aspect-[3/4] !w-[44px] !h-[58px] sm:!w-[50px] sm:!h-[66px]' :
                      shape.id === 'portrait-wide' ? 'rounded-lg aspect-[3.5/4.25] !w-[48px] !h-[58px] sm:!w-[54px] sm:!h-[65px]' :
                      shape.id === 'grande' ? 'rounded-xl aspect-[2/3] !w-[38px] !h-[57px] sm:!w-[44px] sm:!h-[66px]' :
                      shape.id === 'hexagon' ? 'shape-hexagon aspect-[1.15/1] !w-[50px] !h-[44px] sm:!w-[58px] sm:!h-[50px]' :
                      shape.id === 'crest' ? 'shape-crest aspect-square !w-[48px] !h-[48px] sm:!w-[58px] sm:!h-[58px]' :
                      shape.id === 'oval' ? 'shape-oval aspect-[2/3] !w-[38px] !h-[57px] sm:!w-[44px] sm:!h-[66px]' :
                      shape.id === 'scalloped-stand' ? 'shape-scalloped border-2 border-red-800 p-1 aspect-[3/4] !w-[44px] !h-[58px] sm:!w-[50px] sm:!h-[66px]' :
                      shape.id === 'polaroid' ? 'shape-polaroid bg-white pb-2.5 pt-1 px-1 shadow-xs !w-[46px] !h-[58px] sm:!w-[52px] sm:!h-[65px] border border-neutral-200' :
                      shape.id === 'love' ? 'shape-heart aspect-square !w-[48px] !h-[48px] sm:!w-[58px] sm:!h-[58px]' :
                      shape.id === 'filmstrip' ? 'bg-zinc-950 p-[1px] rounded-xs aspect-[1/3] !w-[20px] !h-[60px] sm:!w-[24px] sm:!h-[72px]' :
                      'rounded-xl aspect-[4/5] !w-[46px]'
                    }`}>
                      <div className={`w-full h-full relative overflow-hidden ${
                        shape.id === 'love' ? 'shape-heart' :
                        shape.id === 'hexagon' ? 'shape-hexagon' :
                        shape.id === 'arch' ? 'shape-arch' :
                        shape.id === 'cloud' ? 'shape-cloud' :
                        shape.id === 'circle-bloom' ? 'shape-circle-cloud' :
                        shape.id === 'crest' ? 'shape-crest' :
                        shape.id === 'oval' ? 'shape-oval' :
                        shape.id === 'circle' ? 'rounded-full' : 'rounded-xs'
                      }`}>
                        <img
                          src={photoUrl}
                          alt={shape.name}
                          style={{
                            transform: `scale(${photoScale}) translate(${photoPanX/5}px, ${photoPanY/5}px)`,
                          }}
                          className="w-full h-full object-cover origin-center"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-40 pointer-events-none mix-blend-overlay" />
                      </div>
                    </div>
                  </div>

                  <div className="w-full text-center space-y-0.5 z-10">
                    <span className="font-sans text-[11px] font-bold text-neutral-900 block truncate leading-tight">
                      {shape.name}
                    </span>
                    <span className="font-mono text-[9px] text-[#888888] block uppercase tracking-wider leading-none">
                      ₹{shape.price}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2 h-4.5 w-4.5 bg-neutral-900 rounded-full flex items-center justify-center border border-white shadow-xs">
                      <Check className="h-2.5 w-2.5 text-[#FAF8F5] stroke-[3px]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Master Workspace Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start pt-4">
          
          {/* LEFT COLUMN: LIVE WORKSPACE CANVAS EDITOR (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            
            {/* Visualizer Frame Container */}
            <div className="w-full h-[280px] xs:h-[320px] sm:h-[400px] md:h-[460px] bg-[#FAF8F5] rounded-3xl border border-neutral-200/80 p-2 sm:p-8 flex flex-col items-center justify-center relative shadow-inner overflow-hidden group/visualizer">
              
              <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-neutral-200/20 to-transparent pointer-events-none" />

              <div className="absolute inset-0 border border-neutral-200/20 grid grid-cols-6 grid-rows-6 opacity-30 pointer-events-none">
                {[...Array(36)].map((_, i) => (
                  <div key={i} className="border-[0.5px] border-neutral-300/30"></div>
                ))}
              </div>

              {/* Left Shape Navigation Arrow */}
              <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-25 flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevShape();
                  }}
                  className="bg-white/95 hover:bg-neutral-900 hover:text-white text-neutral-800 rounded-full p-2.5 sm:p-3 shadow-md border border-neutral-200 transition-all cursor-pointer shrink-0 active:scale-95"
                  title={`Previous Shape: ${prevShape.name}`}
                >
                  <ChevronLeft className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                </button>
              </div>

              {/* Right Shape Navigation Arrow */}
              <div className="absolute right-3 sm:left-auto sm:right-4 top-1/2 -translate-y-1/2 z-25 flex items-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextShape();
                  }}
                  className="bg-white/95 hover:bg-neutral-900 hover:text-white text-neutral-800 rounded-full p-2.5 sm:p-3 shadow-md border border-neutral-200 transition-all cursor-pointer shrink-0 active:scale-95"
                  title={`Next Shape: ${nextShape.name}`}
                >
                  <ChevronRight className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                </button>
              </div>

              {/* Interactive Laser-Cut Acrylic Frame Preview Canvas (Direct Mouse & Touch Dragging / Scroll / Pinch) */}
              <div 
                ref={previewContainerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUpOrLeave}
                className="relative z-10 transition-transform duration-300 flex flex-col items-center group cursor-grab active:cursor-grabbing scale-[0.65] xs:scale-[0.8] sm:scale-90 lg:scale-100 origin-center touch-none"
              >
                
                {/* Simulated Glass Acrylic Frame Outer Border */}
                <div 
                  className={`relative overflow-hidden transition-all duration-500 bg-neutral-300/10 ${
                    selectedShapeId === 'arch' ? 'shape-arch aspect-[3/4] w-64 h-80' :
                    selectedShapeId === 'cloud' ? 'shape-cloud aspect-[1.4/1] w-80 h-[228px]' :
                    selectedShapeId === 'circle' ? 'rounded-full aspect-square w-64 h-64' :
                    selectedShapeId === 'circle-bloom' ? 'shape-circle-cloud aspect-square w-64 h-64' :
                    selectedShapeId === 'landscape' ? 'rounded-2xl aspect-[1.4/1] w-80 h-[228px]' :
                    selectedShapeId === 'portrait' ? 'rounded-2xl aspect-[3/4] w-64 h-80' :
                    selectedShapeId === 'portrait-wide' ? 'rounded-2xl aspect-[3.5/4.25] w-[252px] h-[306px]' :
                    selectedShapeId === 'grande' ? 'rounded-[32px] aspect-[2/3] w-60 h-90' :
                    selectedShapeId === 'hexagon' ? 'shape-hexagon aspect-[1.15/1] w-64 h-[222px]' :
                    selectedShapeId === 'crest' ? 'shape-crest aspect-square w-64 h-64' :
                    selectedShapeId === 'oval' ? 'shape-oval aspect-[2/3] w-60 h-90' :
                    selectedShapeId === 'scalloped-stand' ? 'shape-scalloped border-8 border-red-900 bg-white p-4 w-64 h-80 shadow-xl' :
                    selectedShapeId === 'polaroid' ? 'shape-polaroid bg-white pb-14 pt-3 px-3 shadow-2xl w-60 h-76 border border-neutral-200' :
                    selectedShapeId === 'love' ? 'shape-heart aspect-square w-64 h-64' :
                    selectedShapeId === 'filmstrip' ? 'bg-zinc-950 p-[3px] rounded-lg aspect-[1/3] w-36 h-[324px]' :
                    'rounded-3xl aspect-[4/5] w-64'
                  } acrylic-edge`}
                >
                  
                  {/* Photo Container */}
                  <div className={`w-full h-full relative overflow-hidden ${
                    selectedShapeId === 'love' ? 'shape-heart' :
                    selectedShapeId === 'hexagon' ? 'shape-hexagon' :
                    selectedShapeId === 'arch' ? 'shape-arch' :
                    selectedShapeId === 'cloud' ? 'shape-cloud' :
                    selectedShapeId === 'circle-bloom' ? 'shape-circle-cloud' :
                    selectedShapeId === 'crest' ? 'shape-crest' :
                    selectedShapeId === 'oval' ? 'shape-oval' :
                    selectedShapeId === 'scalloped-stand' ? 'rounded-lg' :
                    selectedShapeId === 'circle' ? 'rounded-full' : 'rounded-md'
                  }`}>
                    {selectedShapeId === 'filmstrip' ? (
                      <div className="grid grid-rows-3 h-full gap-1 p-[2px]">
                        <div className="bg-zinc-800 rounded-sm overflow-hidden relative">
                          <img 
                            src={photoUrl} 
                            style={{
                              transform: `scale(${photoScale}) translate(${photoPanX}px, ${photoPanY}px)`,
                            }}
                            className="w-full h-full object-cover origin-center transition-transform duration-150" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="bg-zinc-800 rounded-sm overflow-hidden relative">
                          <img src={photoPool[1]?.url || PRESET_PHOTOS[1].url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="bg-zinc-800 rounded-sm overflow-hidden relative">
                          <img src={photoPool[2]?.url || PRESET_PHOTOS[2].url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    ) : (
                      <img
                        src={photoUrl}
                        alt="Your Customized Custom Magnet"
                        style={{
                          transform: `scale(${photoScale}) translate(${photoPanX}px, ${photoPanY}px)`,
                        }}
                        className={`w-full h-full object-cover origin-center transition-transform duration-150 ${
                          selectedShapeId === 'circle' || selectedShapeId === 'circle-bloom' ? 'rounded-full' : ''
                        }`}
                        referrerPolicy="no-referrer"
                      />
                    )}

                    {/* Realistic Glass Shine Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/55 to-white/0 opacity-50 pointer-events-none mix-blend-overlay shine-effect" />
                    <div className="absolute inset-0 shadow-[inset_0_4px_16px_rgba(0,0,0,0.1)] pointer-events-none rounded-md" />
                  </div>

                  {/* Polaroid Caption */}
                  {selectedShapeId === 'polaroid' && (
                    <div className="absolute bottom-2 inset-x-0 text-center font-serif italic text-neutral-800 text-sm tracking-wide px-3 select-none truncate">
                      {customCaption}
                    </div>
                  )}

                  <div className="absolute inset-0 border-2 border-white/40 pointer-events-none" />
                </div>
              </div>

              {/* Floating Instruction Overlay Badge */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-neutral-900/90 text-white text-[10px] font-mono uppercase tracking-wider px-3.5 py-1.5 rounded-full pointer-events-none z-30 flex items-center gap-2 shadow-lg backdrop-blur-md">
                <Move className="h-3 w-3 text-[#E8DCCF]" />
                <span>Drag photo to pan • Scroll / Pinch to zoom</span>
              </div>
            </div>

            {/* Photo Fine-Tuning Controls */}
            <div className="w-full mt-3 bg-white p-3 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row items-center gap-3 shadow-sm">
              <div className="flex items-center justify-between w-full sm:w-auto gap-3 shrink-0">
                <span className="font-sans text-[10px] font-bold text-neutral-800 uppercase tracking-widest block">
                  Fine-Tune Fit
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleResetAdjustments}
                    className="font-mono text-[9px] font-semibold text-neutral-600 hover:text-neutral-900 uppercase flex items-center gap-1 cursor-pointer bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded-lg transition"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    Reset
                  </button>
                </div>
              </div>

              <div className="hidden sm:block h-4 w-[1px] bg-neutral-200 shrink-0" />

              <div className="w-full sm:flex-1 grid grid-cols-3 gap-3">
                {/* Zoom */}
                <div className="flex flex-col gap-0.5">
                  <div className="flex justify-between text-[8px] font-mono text-neutral-400">
                    <span>ZOOM</span>
                    <span className="font-bold text-[#111111]">{photoScale.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="2.5"
                    step="0.05"
                    value={photoScale}
                    onChange={(e) => setPhotoScale(parseFloat(e.target.value))}
                    className="w-full accent-neutral-900 h-1 cursor-pointer bg-neutral-200 rounded-lg appearance-none"
                  />
                </div>

                {/* Left / Right */}
                <div className="flex flex-col gap-0.5">
                  <div className="flex justify-between text-[8px] font-mono text-neutral-400">
                    <span>L / R</span>
                    <span className="font-bold text-[#111111]">{photoPanX}px</span>
                  </div>
                  <input
                    type="range"
                    min="-120"
                    max="120"
                    value={photoPanX}
                    onChange={(e) => setPhotoPanX(parseInt(e.target.value))}
                    className="w-full accent-neutral-900 h-1 cursor-pointer bg-neutral-200 rounded-lg appearance-none"
                  />
                </div>

                {/* Up / Down */}
                <div className="flex flex-col gap-0.5">
                  <div className="flex justify-between text-[8px] font-mono text-neutral-400">
                    <span>U / D</span>
                    <span className="font-bold text-[#111111]">{photoPanY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-120"
                    max="120"
                    value={photoPanY}
                    onChange={(e) => setPhotoPanY(parseInt(e.target.value))}
                    className="w-full accent-neutral-900 h-1 cursor-pointer bg-neutral-200 rounded-lg appearance-none"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: INTERACTIVE DESIGN PANEL (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Step 3: Perfect the fit */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-neutral-200/60 pb-3">
                <div className="w-7 h-7 rounded-full bg-[#6B1D2F] text-white font-sans font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  3
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-light text-[#111111] tracking-tight">
                  Perfect the fit
                </h3>
              </div>
              
              {/* Active Selected Frame Summary Card */}
              <div className="bg-[#FAF8F5] border border-neutral-200/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                    {renderMiniShapeIcon(activeShape.id)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-sm sm:text-base text-neutral-900">
                        {activeShape.name}
                      </span>
                      <span className="font-mono text-[10px] text-neutral-600 uppercase bg-white border border-neutral-200 px-2 py-0.5 rounded-md">
                        {activeShape.dimensions} ({getShapeInches(activeShape.id)})
                      </span>
                    </div>
                    <p className="font-sans text-xs text-neutral-600 font-light mt-0.5 line-clamp-1">
                      {activeShape.description}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 pl-2">
                  <span className="font-mono text-sm sm:text-base font-bold text-[#111111] block">₹{activeShape.price}</span>
                </div>
              </div>

              {/* Polaroid Caption Field */}
              {selectedShapeId === 'polaroid' && (
                <div className="space-y-1.5 pt-1">
                  <label className="font-sans text-xs font-bold text-[#111111] uppercase tracking-wide block">
                    Polaroid Custom Caption:
                  </label>
                  <input
                    type="text"
                    maxLength={28}
                    value={customCaption}
                    onChange={(e) => setCustomCaption(e.target.value)}
                    placeholder="E.g., Summer Trip 2026"
                    className="w-full bg-white border border-neutral-300 rounded-2xl px-4 py-3 text-sm font-serif italic text-neutral-900 placeholder:opacity-50 focus:outline-neutral-800"
                  />
                  <span className="text-[9px] font-mono text-neutral-400 block text-right">MAX 28 CHARACTERS</span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="pt-3 border-t border-neutral-200/60 space-y-2">
              <label className="font-sans text-xs font-bold text-[#111111] uppercase tracking-widest block">
                4. Select Quantity
              </label>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-neutral-300 rounded-2xl bg-[#FAF8F5]">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-neutral-600 hover:text-black hover:bg-neutral-200/50 rounded-l-2xl transition cursor-pointer"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-6 font-mono text-sm font-bold text-neutral-900 min-w-10 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 text-neutral-600 hover:text-black hover:bg-neutral-200/50 rounded-r-2xl transition cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="font-sans text-xs text-neutral-500 font-light">
                  <span className="text-[#111111] font-semibold block">₹{baseShapePrice} / magnet</span>
                  <span>Premium laser polished edge</span>
                </div>
              </div>
            </div>

            {/* Add To Tray Button (Adds item silently & provides inline checkmark feedback) */}
            <div className="pt-4 border-t border-neutral-200/60 space-y-3">
              <button
                type="button"
                onClick={handleAddToOrder}
                className={`w-full transition-all py-4 rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.01] ${
                  addedFeedback
                    ? 'bg-emerald-700 text-white'
                    : 'bg-[#111111] hover:bg-neutral-800 text-white'
                }`}
              >
                {addedFeedback ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-300 stroke-[3px]" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4 text-[#E8DCCF]" />
                    <span>Add to Cart (₹{currentItemSubtotal})</span>
                  </>
                )}
              </button>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={handleOpenCheckoutModal}
                  className="w-full bg-[#E8DCCF] hover:bg-[#d8c4b2] text-neutral-900 transition-all py-3.5 rounded-full text-xs font-sans font-extrabold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Lock className="h-4 w-4 text-neutral-900" />
                  Proceed to Checkout ({cartItemCount} item{cartItemCount > 1 ? 's' : ''} • ₹{grandTotal})
                </button>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* --- MOBILE-RESPONSIVE COMPACT CHECKOUT MODAL --- */}
      {isCheckoutOpen && createPortal(
        <div className="fixed inset-0 z-[150] overflow-y-auto bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden border border-neutral-200 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-[#111111] p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <BrandLogo size={26} color="#E8DCCF" />
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-light tracking-wide text-white">
                    Secure Express Checkout
                  </h3>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Razorpay & Shiprocket Express</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-neutral-300 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-4 sm:p-6 grow space-y-6">
              {checkoutError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-red-700 text-xs">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p className="font-medium">{checkoutError}</p>
                </div>
              )}

              {checkoutStep === 'details' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                  {/* Left Column: Shipping Coordinates */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                      <Truck className="h-4 w-4 text-neutral-800" />
                      <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-neutral-800">1. Delivery Coordinates</h4>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">Full Name</label>
                          <input 
                            type="text" 
                            required
                            className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-black outline-none"
                            value={shippingDetails.fullName}
                            onChange={(e) => setShippingDetails({ ...shippingDetails, fullName: e.target.value })}
                            placeholder="Rahul Sharma"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">Contact Number</label>
                          <input 
                            type="tel" 
                            required
                            className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-black outline-none"
                            value={shippingDetails.phone}
                            onChange={(e) => setShippingDetails({ ...shippingDetails, phone: e.target.value.replace(/\D/g, '') })}
                            placeholder="e.g. 9876543210"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">Email Address</label>
                        <input 
                           type="email" 
                           required
                           className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-black outline-none"
                           value={shippingDetails.email}
                           onChange={(e) => setShippingDetails({ ...shippingDetails, email: e.target.value })}
                           placeholder="rahul@example.com"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">Street Address</label>
                        <textarea 
                          required
                          rows={2}
                          className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-black outline-none resize-none"
                          value={shippingDetails.address}
                          onChange={(e) => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                          placeholder="Flat No, Wing, Landmark"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">Pincode</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              maxLength={6}
                              required
                              className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl pl-3.5 pr-8 py-2.5 text-xs focus:ring-1 focus:ring-black outline-none"
                              value={shippingDetails.pincode}
                              onChange={handlePincodeChange}
                              placeholder="500081"
                            />
                            {isPincodeChecking && (
                              <div className="absolute right-2.5 top-3 h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">City</label>
                          <input 
                            type="text" 
                            required
                            className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-black outline-none"
                            value={shippingDetails.city}
                            onChange={(e) => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                            placeholder="Hyderabad"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-bold">State</label>
                          <input 
                            type="text" 
                            required
                            className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-black outline-none"
                            value={shippingDetails.state}
                            onChange={(e) => setShippingDetails({ ...shippingDetails, state: e.target.value })}
                            placeholder="Telangana"
                          />
                        </div>
                      </div>
                    </div>

                    {serviceabilityResult && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                        <Truck className="h-4 w-4 text-emerald-600 shrink-0" />
                        <p className="font-medium text-[11px]">
                          Shiprocket Courier {serviceabilityResult.courierName} active for PIN {serviceabilityResult.pincode}!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Compact Order Invoice Summary */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                      <CreditCard className="h-4 w-4 text-neutral-800" />
                      <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-neutral-800">2. Order Invoice Summary</h4>
                    </div>

                    <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-neutral-200 space-y-3">
                      {/* Items list */}
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                        {(cart.length > 0 ? cart : [{
                          id: 'single',
                          shapeName: activeShape.name,
                          quantity,
                          price: activeShape.price
                        }]).map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs text-neutral-600">
                            <span className="truncate max-w-[170px]">{item.shapeName} x{item.quantity}</span>
                            <span className="font-mono font-semibold text-neutral-900">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="h-[1px] bg-neutral-200" />

                      <div className="space-y-1 text-xs text-neutral-600 font-light">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span className="font-mono text-neutral-900 font-medium">₹{cart.length > 0 ? cartSubtotal : currentItemSubtotal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Express Delivery:</span>
                          <span className="font-mono text-neutral-900 font-medium">
                            ₹60
                          </span>
                        </div>
                        <div className="h-[1px] bg-neutral-200 my-1" />
                        <div className="flex justify-between text-sm font-bold text-neutral-900">
                          <span className="font-serif italic font-medium">Grand Total:</span>
                          <span className="font-mono text-base text-neutral-900">
                            ₹{(cart.length > 0 ? cartSubtotal : currentItemSubtotal) + 60}
                          </span>
                        </div>
                      </div>

                      <label className="flex items-start gap-2 text-[10px] leading-tight text-neutral-600 pt-1">
                        <input
                          type="checkbox"
                          checked={acceptedPolicies}
                          onChange={(e) => setAcceptedPolicies(e.target.checked)}
                          className="mt-0.5 h-3.5 w-3.5 accent-neutral-900"
                        />
                        <span>
                          I accept KRIA Studio terms & conditions for custom made-to-order acrylic products.
                        </span>
                      </label>

                      <button
                        onClick={handleInitiatePayment}
                        disabled={isPaymentLoading}
                        className="w-full bg-[#111111] hover:bg-neutral-800 text-white transition-all py-3.5 rounded-xl text-xs font-sans tracking-widest font-extrabold uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                      >
                        {isPaymentLoading ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <>
                            <Lock className="h-3.5 w-3.5 text-[#E8DCCF]" />
                            <span>Confirm & Pay Securely</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {checkoutStep === 'success' && (
                <div className="text-center py-6 sm:py-8 max-w-md mx-auto space-y-4">
                  <div className="mx-auto h-14 w-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-200">
                    <ShieldCheck className="h-8 w-8" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono tracking-widest text-emerald-600 font-bold uppercase block">
                      ✓ Order Dispatched
                    </span>
                    <h4 className="font-serif text-2xl font-light text-neutral-900">
                      Order Booked & Confirmed!
                    </h4>
                    <p className="text-xs text-neutral-500 font-light">
                      Thank you <strong className="text-neutral-800">{shippingDetails.fullName}</strong>! We have received your custom magnet designs.
                    </p>
                  </div>

                  <div className="bg-[#FAF8F5] border border-neutral-200 rounded-2xl p-4 text-left text-xs font-sans space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Tracking Code:</span>
                      <span className="font-mono font-bold text-neutral-900">{placedOrderDetails?.trackingNumber || 'SRW-928374829'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Delivery Courier:</span>
                      <span className="font-semibold text-neutral-900">{placedOrderDetails?.courierName || 'Delhivery Express'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setCheckoutStep('details');
                    }}
                    className="w-full bg-[#111111] hover:bg-neutral-800 text-white py-3 rounded-full text-xs font-sans font-bold uppercase cursor-pointer"
                  >
                    Return to Design Studio
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* --- SIMULATED RAZORPAY GATEWAY MODAL --- */}
      {showSimulatedGateway && createPortal(
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 text-white border border-neutral-800 rounded-3xl w-full max-w-md p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#3399FF] bg-[#3399FF]/10 px-2.5 py-1 rounded-full border border-[#3399FF]/20">
                Razorpay Sandbox
              </span>
              <button 
                onClick={() => {
                  setShowSimulatedGateway(false);
                  setIsPaymentLoading(false);
                }}
                className="text-neutral-500 hover:text-white cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 text-left">
              <h4 className="font-sans text-xs uppercase tracking-widest font-bold text-neutral-400">Payment Gateway Simulation</h4>
              <p className="font-serif text-2xl font-light text-[#FAF8F5]">
                Total: <span className="font-sans font-bold">₹{razorpayOrderData?.grandTotal}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleSimulatePaymentResponse(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-sans font-extrabold uppercase cursor-pointer"
              >
                Simulate Success
              </button>
              <button
                onClick={() => handleSimulatePaymentResponse(false)}
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 py-3 rounded-xl text-xs font-sans font-bold uppercase cursor-pointer border border-neutral-700"
              >
                Simulate Decline
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
