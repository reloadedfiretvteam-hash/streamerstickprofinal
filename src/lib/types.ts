// Shared type definitions for the application

export interface PremiumPackage {
  id: string;
  name: string;
  requests: number;
  price: number;
  pricePerRequest: number;
  popular: boolean;
  badge: string;
  features: string[];
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  type: 'firestick' | 'iptv';
  image: string;
  badge: string;
  popular: boolean;
  period?: string;
  savings?: string;
  features: string[];
}

// Constants for premium package cart conversion
export const PREMIUM_PACKAGE_DEFAULTS = {
  STOCK_QUANTITY: 999,
  RATING: 5,
  CATEGORY: 'Premium Requests'
} as const;
