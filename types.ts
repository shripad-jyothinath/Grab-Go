export enum UserRole {
  STUDENT = 'STUDENT',
  RESTAURANT = 'RESTAURANT',
  ADMIN = 'ADMIN'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  password?: string; // In real app, never store plain text
  securityQuestion?: string;
  securityAnswer?: string;
  restaurantId?: string; // If role is RESTAURANT
}

export interface Restaurant {
  id: string;
  name: string;
  ownerId: string;
  description: string;
  cuisine: string[];
  imageUrl: string;
  isOpen: boolean;
  upiId?: string;
  hours?: string; // Opening/Closing hours
  razorpayKey?: string;
  verified: boolean;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  imageUrl?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  pickupCode: string;
  createdAt: string; // ISO String
  transactionRef?: string; // For UPI
}

export interface Stats {
  totalRevenue: number;
  totalOrders: number;
  activeRestaurants: number;
}