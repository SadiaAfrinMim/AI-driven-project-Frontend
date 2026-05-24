// Simple client-side cart using localStorage
// Cart items are temporary until user places the actual Selection (order)

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  maxStock: number;
}

const CART_KEY = 'ai_suggester_cart';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  // Notify other components (Navbar, etc.)
  window.dispatchEvent(new CustomEvent('cartUpdated'));
}

export function addToCart(item: Omit<CartItem, 'quantity'>, qty: number = 1) {
  const cart = getCart();
  const existing = cart.findIndex((c) => c.id === item.id);

  if (existing !== -1) {
    // Increase quantity (respect maxStock)
    const newQty = Math.min(cart[existing].maxStock, cart[existing].quantity + qty);
    cart[existing].quantity = newQty;
  } else {
    cart.push({ ...item, quantity: Math.min(item.maxStock, qty) });
  }

  saveCart(cart);
  return cart;
}

export function updateCartQuantity(id: string, newQuantity: number) {
  const cart = getCart();
  const index = cart.findIndex((c) => c.id === id);
  if (index === -1) return cart;

  const clamped = Math.max(1, Math.min(cart[index].maxStock, newQuantity));
  cart[index].quantity = clamped;
  saveCart(cart);
  return cart;
}

export function removeFromCart(id: string) {
  const cart = getCart().filter((c) => c.id !== id);
  saveCart(cart);
  return cart;
}

export function clearCart() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new CustomEvent('cartUpdated'));
}

export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal(): number {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
}
