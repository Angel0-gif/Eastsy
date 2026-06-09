/**
 * EATSY — TypeScript Models
 * Shared interfaces matching Django serializer fields
 */

// ── AUTH ──────────────────────────────
export interface LoginRequest {
  email:    string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email:     string;
  phone:     string;
  password:  string;
  password2: string;
}

export interface AuthResponse {
  access:  string;
  refresh: string;
  user:    User;
}

// ── USER ──────────────────────────────
export interface User {
  id:             number;
  full_name:      string;
  email:          string;
  phone:          string;
  loyalty_points: number;
  tier:           'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  is_verified:    boolean;
}

// ── MENU ──────────────────────────────
export type MenuCategory = 'starter' | 'main' | 'dessert' | 'drinks' | 'special';

export interface MenuItem {
  id:          number;
  name:        string;
  description: string;
  price:       number;
  category:    MenuCategory;
  emoji:       string;
  tags:        string[];
  allergens:   string;
  calories:    number;
  is_available: boolean;
  image?:      string;
}

// ── CART ──────────────────────────────
export interface CartItem {
  menu_item: MenuItem;
  quantity:  number;
}

// ── TABLE ─────────────────────────────
export type TableStatus = 'available' | 'occupied' | 'reserved';

export interface Table {
  id:     number;
  number: number;
  seats:  number;
  status: TableStatus;
}

// ── RESERVATION ───────────────────────
export interface ReservationRequest {
  date:             string;   // 'YYYY-MM-DD'
  time:             string;   // 'HH:MM'
  guest_count:      number;
  table_id:         number;
  special_requests?: string;
}

export interface Reservation {
  id:               number;
  user:             number;
  table:            Table;
  date:             string;
  time:             string;
  guest_count:      number;
  special_requests: string;
  status:           'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at:       string;
}

// ── ORDER ─────────────────────────────
export type OrderStatus =
  | 'received'
  | 'confirmed'
  | 'preparing'
  | 'on_the_way'
  | 'delivered';

export interface OrderItem {
  menu_item: MenuItem;
  quantity:  number;
  subtotal:  number;
}

export interface Order {
  id:           number;
  order_number: string;
  user:         number;
  table:        Table;
  items:        OrderItem[];
  status:       OrderStatus;
  subtotal:     number;
  service_fee:  number;
  total:        number;
  created_at:   string;
  updated_at:   string;
}

// ── PAYMENT ───────────────────────────
export type PaymentMethod = 'momo' | 'card' | 'table';

export interface PaymentRequest {
  order_id:       number;
  method:         PaymentMethod;
  phone_number?:  string;
  card_token?:    string;
}

export interface PaymentResponse {
  id:             number;
  order:          number;
  method:         PaymentMethod;
  amount:         number;
  status:         'pending' | 'success' | 'failed';
  reference:      string;
  created_at:     string;
}

// ── REVIEW ────────────────────────────
export interface ReviewRequest {
  rating:  number;   // 1–5
  comment: string;
  order?:  number;
}

export interface Review {
  id:         number;
  user:       Pick<User, 'id' | 'full_name'>;
  rating:     number;
  comment:    string;
  order?:     number;
  created_at: string;
}

export interface ReviewSummary {
  average:      number;
  total:        number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

// ── API RESPONSES ─────────────────────
export interface PaginatedResponse<T> {
  count:    number;
  next:     string | null;
  previous: string | null;
  results:  T[];
}

export interface ApiError {
  detail?: string;
  [key: string]: string | string[] | undefined;
}
