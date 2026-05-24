'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Bot, LogOut, Settings, Menu, User, BarChart3, Shield, ShoppingCart, X, Trash2, Plus, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { getCart, updateCartQuantity, removeFromCart, clearCart, getCartCount, getCartTotal, CartItem } from '@/lib/cart';
import { api, fetchApi } from '@/lib/api';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Style navbar differently on dashboard pages
  const isDashboard = pathname.startsWith('/dashboard');

  const loadUserFromCookie = () => {
    const accessToken = Cookies.get('accessToken');
    const userData = Cookies.get('user');

    if (accessToken && userData) {
      setIsAuthenticated(true);
      try {
        setUser(JSON.parse(userData));
      } catch {
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const loadCart = () => {
    const items = getCart();
    setCartItems(items);
  };

  // Check authentication on client side only to avoid hydration mismatch
  // Also listen for profile image updates from /dashboard/profile so navbar avatar updates live
  useEffect(() => {
    loadUserFromCookie();
    loadCart();
    setMounted(true);

    const handleProfileUpdate = () => {
      console.log('🔄 [NAVBAR] userProfileUpdated event received - refreshing user image from cookie');
      loadUserFromCookie();
    };

    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const handleLogout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('user');
    Cookies.remove('role');
    router.push('/login');
    toast.success('Logged out successfully!');
  };



  // Always derive the freshest user from cookie so that a newly uploaded Cloudinary profile photo
  // (saved by /dashboard/profile) immediately appears in the navbar avatar without waiting for any state sync.
  const getFreshUser = () => {
    try {
      const raw = Cookies.get('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const freshUser = mounted ? (getFreshUser() || user) : null;

  return (
    <nav suppressHydrationWarning className={`sticky top-0 z-50 transition-all duration-300 ${
      isDashboard
        ? 'bg-white/95 backdrop-blur-2xl border-b border-gray-200/80 shadow-sm'
        : 'bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg group-hover:scale-105 transition-transform">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                AI Suggester
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {mounted && isAuthenticated ? (
               <>
                 <Link
                   href="/"
                   className="text-foreground/70 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-primary/10"
                 >
                   Home
                 </Link>

                <Link
                  href="/recommendations"
                  className="text-foreground/70 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-primary/10"
                >
                  Recommendations
                </Link>
                <Link
                  href="/products"
                  className="text-foreground/70 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-primary/10"
                >
                  Products
                </Link>
                <Link
                  href="/about"
                  className="text-foreground/70 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-primary/10"
                >
                  About
                </Link>
                <Link
                  href="/help"
                  className="text-foreground/70 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-primary/10"
                >
                  Help
                </Link>
                <Link
                  href="/ai"
                  className="text-foreground/70 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-primary/10"
                >
                  AI Assistant
                </Link>

                {(freshUser?.role === 'ADMIN' || freshUser?.role === 'MANAGER') && (
                  <Link
                    href="/dashboard/analytics"
                    className="text-foreground/70 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-primary/10"
                  >
                    Analytics
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/#features"
                  className="text-foreground/70 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-primary/10"
                >
                  Features
                </Link>
                <Link
                  href="/products"
                  className="text-foreground/70 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-primary/10"
                >
                  Products
                </Link>
                <Link
                  href="/about"
                  className="text-foreground/70 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-primary/10"
                >
                  About
                </Link>
                <Link
                  href="/help"
                  className="text-foreground/70 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-primary/10"
                >
                  Help
                </Link>
              </>
            )}
          </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-2">
              {mounted && freshUser ? (
                <>
                  {/* Cart Icon - Prominent & Easy to See */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setIsCartOpen(!isCartOpen);
                        setIsProfileDropdownOpen(false);
                      }}
                      className="relative p-2.5 rounded-xl hover:bg-sky-50 active:bg-sky-100 transition-all border border-sky-200 text-sky-700 hover:text-sky-800"
                      aria-label="Shopping Cart"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      {getCartCount() > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow">
                          {getCartCount()}
                        </span>
                      )}
                    </button>

                    {/* Beautiful Cart Dropdown */}
                    {isCartOpen && (
                      <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-sky-200 z-50 overflow-hidden">
                        <div className="px-4 py-3 bg-gradient-to-r from-sky-50 to-white border-b flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4 text-sky-600" />
                            <span className="font-semibold text-sky-900">Your Cart</span>
                          </div>
                          <button onClick={() => setIsCartOpen(false)} className="text-sky-400 hover:text-sky-600">
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        {cartItems.length === 0 ? (
                          <div className="p-8 text-center text-sm text-sky-600">
                            Your cart is empty.<br />Add products from the product pages.
                          </div>
                        ) : (
                          <>
                            {/* Cart Items */}
                            <div className="max-h-[260px] overflow-auto divide-y">
                              {cartItems.map((item) => (
                                <div key={item.id} className="px-4 py-3 flex gap-3">
                                  <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                    {item.image ? (
                                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-gray-900 line-clamp-1">{item.title}</div>
                                    <div className="text-emerald-600 font-bold text-sm mt-0.5">
                                      ৳{(item.price * item.quantity).toLocaleString()}
                                    </div>

                                    {/* Quantity controls inside dropdown */}
                                    <div className="flex items-center gap-2 mt-2">
                                      <button
                                        onClick={() => {
                                          const updated = updateCartQuantity(item.id, item.quantity - 1);
                                          setCartItems(updated);
                                        }}
                                        className="w-6 h-6 flex items-center justify-center rounded border border-sky-300 text-sky-600 hover:bg-sky-50"
                                      >
                                        <Minus className="h-3 w-3" />
                                      </button>
                                      <span className="text-sm font-bold w-6 text-center tabular-nums">{item.quantity}</span>
                                      <button
                                        onClick={() => {
                                          const updated = updateCartQuantity(item.id, item.quantity + 1);
                                          setCartItems(updated);
                                        }}
                                        className="w-6 h-6 flex items-center justify-center rounded border border-sky-300 text-sky-600 hover:bg-sky-50"
                                      >
                                        <Plus className="h-3 w-3" />
                                      </button>

                                      <button
                                        onClick={() => {
                                          const updated = removeFromCart(item.id);
                                          setCartItems(updated);
                                        }}
                                        className="ml-auto text-red-500 hover:text-red-600 p-1"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-sky-50 border-t">
                              <div className="flex justify-between text-sm mb-3">
                                <span className="text-sky-600 font-medium">Total</span>
                                <span className="font-bold text-lg text-sky-900">৳{getCartTotal().toLocaleString()}</span>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setIsCartOpen(false);
                                    router.push('/cart');
                                  }}
                                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-sky-300 text-sky-700 hover:bg-white active:bg-white"
                                >
                                  View Full Cart
                                </button>

                                <button
                                  onClick={async () => {
                                    if (cartItems.length === 0) return;

                                    try {
                                      // Place order for every item in cart (creates Selection requests)
                                      for (const item of cartItems) {
                                        await fetchApi(api.selections, {
                                          method: 'POST',
                                          body: JSON.stringify({
                                            itemId: item.id,
                                            quantity: item.quantity,
                                          }),
                                        });
                                      }

                                      toast.success('All items placed! Check My Orders for approval status.');
                                      clearCart();
                                      setCartItems([]);
                                      setIsCartOpen(false);
                                      router.push('/dashboard/orders');
                                    } catch (err: any) {
                                      toast.error(err?.message || 'Failed to place some orders');
                                    }
                                  }}
                                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                  Place Order
                                </button>
                              </div>
                              <p className="text-[10px] text-center text-sky-500 mt-2">Placing order will create requests for manager approval</p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Profile Button with Photo + Name */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(!isProfileDropdownOpen);
                        setIsCartOpen(false);
                      }}
                      className="flex items-center gap-3 rounded-full pl-1.5 pr-4 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-[0.985]"
                    >
                      {freshUser.profileImage ? (
                        <img
                          src={freshUser.profileImage}
                          alt={freshUser.name}
                          className="h-9 w-9 rounded-full ring-2 ring-blue-100 dark:ring-blue-900"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center ring-2 ring-blue-100 dark:ring-blue-900">
                          <span className="text-white font-bold text-sm tracking-tight">
                            {freshUser.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}

                      <div className="hidden md:block text-left">
                        <p className="text-sm font-semibold text-foreground tracking-tight">
                          {freshUser.name.split(' ')[0]}
                        </p>
                        <p className="text-[10px] text-muted-foreground -mt-0.5">{freshUser.role}</p>
                      </div>
                    </button>

                    {/* Professional Dropdown Menu */}
                    {isProfileDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 py-2 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-4 py-3 border-b">
                      <p className="font-semibold text-sm">{freshUser.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{freshUser.email}</p>
                      <div className="mt-1.5">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          {freshUser.role}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors" onClick={() => setIsProfileDropdownOpen(false)}>
                        <User className="w-4 h-4 text-muted-foreground" /> My Profile
                      </Link>
                      <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors" onClick={() => setIsProfileDropdownOpen(false)}>
                        <Settings className="w-4 h-4 text-muted-foreground" /> Dashboard
                      </Link>

                      {(freshUser.role === 'ADMIN' || freshUser.role === 'MANAGER') && (
                        <Link href="/dashboard/analytics" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors" onClick={() => setIsProfileDropdownOpen(false)}>
                          <BarChart3 className="w-4 h-4 text-muted-foreground" /> Analytics
                        </Link>
                      )}

                      {freshUser.role === 'ADMIN' && (
                        <Link href="/dashboard/users" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors" onClick={() => setIsProfileDropdownOpen(false)}>
                          <Shield className="w-4 h-4 text-muted-foreground" /> Manage Users
                        </Link>
                      )}
                    </div>

                    <div className="border-t pt-1 mt-1">
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isAuthenticated ? (
              <>
                <Link
                  href="/"
                  className="block px-3 py-2 text-base font-medium text-foreground/70 hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/recommendations"
                  className="block px-3 py-2 text-base font-medium text-foreground/70 hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Recommendations
                </Link>
                {(freshUser?.role === 'ADMIN' || freshUser?.role === 'MANAGER') && (
                  <Link
                    href="/dashboard/items"
                    className="block px-3 py-2 text-base font-medium text-foreground/70 hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Products
                  </Link>
                )}
                <Link
                  href="/about"
                  className="block px-3 py-2 text-base font-medium text-foreground/70 hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/help"
                  className="block px-3 py-2 text-base font-medium text-foreground/70 hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Help
                </Link>
                <Link
                  href="/ai"
                  className="block px-3 py-2 text-base font-medium text-foreground/70 hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  AI Assistant
                </Link>

                <Link
                  href="/dashboard/analytics"
                  className="block px-3 py-2 text-base font-medium text-foreground/70 hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Analytics
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/#features"
                  className="block px-3 py-2 text-base font-medium text-foreground/70 hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="/products"
                  className="block px-3 py-2 text-base font-medium text-foreground/70 hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Products
                </Link>
                <Link
                  href="/about"
                  className="block px-3 py-2 text-base font-medium text-foreground/70 hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/help"
                  className="block px-3 py-2 text-base font-medium text-foreground/70 hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Help
                </Link>
                <div className="px-3 py-2 space-x-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}