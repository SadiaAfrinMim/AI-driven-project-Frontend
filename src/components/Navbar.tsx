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

  useEffect(() => {
    loadUserFromCookie();
    loadCart();
    setMounted(true);

    const handleProfileUpdate = () => {
      console.log('🔄 [NAVBAR] userProfileUpdated event received - refreshing user image from cookie');
      loadUserFromCookie();
      
      const fresh = getFreshUser();
      if (fresh) {
        setUser(fresh);
      }
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
  }, [pathname]);

  const handleLogout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('user');
    Cookies.remove('role');
    router.push('/login');
    toast.success('Logged out successfully!');
  };

  const getFreshUser = () => {
    try {
      const raw = Cookies.get('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const freshUser = mounted ? (getFreshUser() || user) : null;
  const avatarKey = freshUser?.profileImage ? `${freshUser.profileImage}-${freshUser.updatedAt || Date.now()}` : 'no-image';

  return (
    <nav suppressHydrationWarning className={`sticky top-0 z-50 transition-all duration-300 backdrop-blur-md border-b ${
      isDashboard
        ? 'bg-slate-50/80 dark:bg-slate-900/80 border-slate-200/60 dark:border-slate-800/60 shadow-sm'
        : 'bg-white/80 dark:bg-slate-950/80 border-slate-100 dark:border-slate-900 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                AI Suggester
              </span>
            </div>
          </Link>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {mounted && isAuthenticated ? (
              <>
                {[
                  { href: '/', label: 'Home' },
                  { href: '/recommendations', label: 'Recommendations' },
                  { href: '/products', label: 'Products' },
                  { href: '/about', label: 'About' },
                  { href: '/help', label: 'Help' },
                  { href: '/ai', label: 'AI Assistant' },
                ].map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive 
                          ? 'bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400' 
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                {(freshUser?.role === 'ADMIN' || freshUser?.role === 'MANAGER') && (
                  <Link
                    href="/dashboard/analytics"
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      pathname === '/dashboard/analytics'
                        ? 'bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Analytics
                  </Link>
                )}
              </>
            ) : (
              <>
                {[
                  { href: '/', label: 'Features' },
                  { href: '/products', label: 'Products' },
                  { href: '/about', label: 'About' },
                  { href: '/help', label: 'Help' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900 dark:hover:text-white transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {mounted && freshUser ? (
              <>
                {/* Cart Icon */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsCartOpen(!isCartOpen);
                      setIsProfileDropdownOpen(false);
                    }}
                    className={`relative p-2.5 rounded-xl transition-all border group ${
                      isCartOpen 
                        ? 'bg-sky-50 border-sky-200 text-sky-600 dark:bg-sky-950/50 dark:border-sky-900 dark:text-sky-400' 
                        : 'border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                    aria-label="Shopping Cart"
                  >
                    <ShoppingCart className="h-4 w-4 transition-transform group-hover:scale-105" />
                    {getCartCount() > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-sm shadow-emerald-500/20 animate-pulse">
                        {getCartCount()}
                      </span>
                    )}
                  </button>

                  {/* Cart Dropdown */}
                  {isCartOpen && (
                    <div className="absolute right-0 mt-2 w-[320px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden transform origin-top-right transition-all">
                      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4 text-sky-500" />
                          <span className="font-semibold text-slate-900 dark:text-white text-sm">Your Cart</span>
                        </div>
                        <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {cartItems.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                          Your cart is empty.<br />
                          <span className="text-xs text-slate-400 mt-1 block">Add products from the product pages.</span>
                        </div>
                      ) : (
                        <>
                          <div className="max-h-[260px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                            {cartItems.map((item) => (
                              <div key={item.id} className="p-4 flex gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200/40 dark:border-slate-700/40">
                                  {item.image ? (
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">No image</div>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                  <div>
                                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{item.title}</div>
                                    <div className="text-emerald-600 dark:text-emerald-400 font-bold text-xs mt-0.5">
                                      ৳{(item.price * item.quantity).toLocaleString()}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 mt-2">
                                    <button
                                      onClick={() => {
                                        const updated = updateCartQuantity(item.id, item.quantity - 1);
                                        setCartItems(updated);
                                      }}
                                      className="w-5 h-5 flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                      <Minus className="h-2.5 w-2.5" />
                                    </button>
                                    <span className="text-xs font-bold w-5 text-center tabular-nums text-slate-700 dark:text-slate-300">{item.quantity}</span>
                                    <button
                                      onClick={() => {
                                        const updated = updateCartQuantity(item.id, item.quantity + 1);
                                        setCartItems(updated);
                                      }}
                                      className="w-5 h-5 flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                      <Plus className="h-2.5 w-2.5" />
                                    </button>

                                    <button
                                      onClick={() => {
                                        const updated = removeFromCart(item.id);
                                        setCartItems(updated);
                                      }}
                                      className="ml-auto text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Amount</span>
                              <span className="font-bold text-base text-slate-900 dark:text-white">৳{getCartTotal().toLocaleString()}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => {
                                  setIsCartOpen(false);
                                  router.push('/cart');
                                }}
                                className="py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
                              >
                                View Full Cart
                              </button>

                              <button
                                onClick={async () => {
                                  if (cartItems.length === 0) return;
                                  try {
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
                                className="py-2 text-xs font-semibold rounded-xl bg-sky-600 hover:bg-sky-700 text-white transition-all shadow-sm shadow-sky-600/10"
                              >
                                Place Order
                              </button>
                            </div>
                            <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-2">Requires manager approval after placement</p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Profile Button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(!isProfileDropdownOpen);
                      setIsCartOpen(false);
                    }}
                    className={`flex items-center gap-2 rounded-xl p-1 pr-2 sm:pr-3 transition-all border ${
                      isProfileDropdownOpen
                        ? 'bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800'
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    {freshUser.profileImage ? (
                      <img
                        key={avatarKey}
                        src={freshUser.profileImage}
                        alt={freshUser.name}
                        className="h-8 w-8 rounded-lg ring-2 ring-slate-100 dark:ring-slate-800 object-cover flex-shrink-0 shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-lg bg-sky-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-white font-bold text-xs">
                          {freshUser.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div className="hidden md:block text-left min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[80px]">
                        {freshUser.name.split(' ')[0]}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[80px] -mt-0.5">{freshUser.role}</p>
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-[240px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-50 transform origin-top-right transition-all">
                      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">{freshUser.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{freshUser.email}</p>
                        <span className="inline-block px-2 py-0.5 text-[9px] font-semibold rounded-md bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 mt-1.5 border border-sky-100 dark:border-sky-900/50">
                          {freshUser.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link href="/dashboard/profile" className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" onClick={() => setIsProfileDropdownOpen(false)}>
                          <User className="w-3.5 h-3.5 text-slate-400" /> My Profile
                        </Link>
                        <Link href="/dashboard" className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" onClick={() => setIsProfileDropdownOpen(false)}>
                          <Settings className="w-3.5 h-3.5 text-slate-400" /> Dashboard
                        </Link>

                        {(freshUser.role === 'ADMIN' || freshUser.role === 'MANAGER') && (
                          <Link href="/dashboard/analytics" className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" onClick={() => setIsProfileDropdownOpen(false)}>
                            <BarChart3 className="w-3.5 h-3.5 text-slate-400" /> Analytics
                          </Link>
                        )}

                        {freshUser.role === 'ADMIN' && (
                          <Link href="/dashboard/users" className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" onClick={() => setIsProfileDropdownOpen(false)}>
                            <Shield className="w-3.5 h-3.5 text-slate-400" /> Manage Users
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center space-x-1.5">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="rounded-xl text-xs font-medium">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="rounded-xl text-xs font-medium bg-sky-600 hover:bg-sky-700 shadow-sm shadow-sky-600/10">
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
                className="p-2 rounded-xl border border-slate-200/60 dark:border-slate-800"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 px-4 py-3 space-y-1">
          {isAuthenticated ? (
            <>
              {[
                { href: '/', label: 'Home' },
                { href: '/recommendations', label: 'Recommendations' },
                { href: '/about', label: 'About' },
                { href: '/help', label: 'Help' },
                { href: '/ai', label: 'AI Assistant' },
                { href: '/dashboard/analytics', label: 'Analytics' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {(freshUser?.role === 'ADMIN' || freshUser?.role === 'MANAGER') && (
                <Link
                  href="/dashboard/items"
                  className="block px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Products
                </Link>
              )}
            </>
          ) : (
            <>
              {[
                { href: '/#features', label: 'Features' },
                { href: '/products', label: 'Products' },
                { href: '/about', label: 'About' },
                { href: '/help', label: 'Help' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 grid grid-cols-2 gap-2 px-2">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full rounded-xl text-xs">
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full rounded-xl text-xs bg-sky-600 hover:bg-sky-700">
                    Get Started
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}