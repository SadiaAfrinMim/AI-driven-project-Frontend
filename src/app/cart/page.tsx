'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getCart, updateCartQuantity, removeFromCart, clearCart, getCartTotal, CartItem } from '@/lib/cart';
import { api, fetchApi } from '@/lib/api';
import { toast } from 'sonner';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [placing, setPlacing] = useState(false);
  const router = useRouter();

  const loadCart = () => {
    setCartItems(getCart());
  };

  useEffect(() => {
    loadCart();

    const handleUpdate = () => loadCart();
    window.addEventListener('cartUpdated', handleUpdate);
    return () => window.removeEventListener('cartUpdated', handleUpdate);
  }, []);

  const total = getCartTotal();
  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const handleQuantityChange = (id: string, newQty: number) => {
    const updated = updateCartQuantity(id, newQty);
    setCartItems(updated);
  };

  const handleRemove = (id: string) => {
    const updated = removeFromCart(id);
    setCartItems(updated);
    toast.success('Item removed from cart');
  };

  const handlePlaceAllOrders = async () => {
    if (cartItems.length === 0) return;

    setPlacing(true);

    try {
      let successCount = 0;

      for (const item of cartItems) {
        try {
          await fetchApi(api.selections, {
            method: 'POST',
            body: JSON.stringify({
              itemId: item.id,
              quantity: item.quantity,
            }),
          });
          successCount++;
        } catch (e) {
          console.error('Failed to place for', item.title, e);
        }
      }

      if (successCount > 0) {
        toast.success(`Order placed for ${successCount} item(s)! Check My Orders for status.`);
        clearCart();
        setCartItems([]);
        router.push('/dashboard/orders');
      } else {
        toast.error('Failed to place any orders. Please try again.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong while placing orders');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-sky-100 text-sky-600">
              <ShoppingCart className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
              <p className="text-sm text-gray-500">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} • Ready to request
              </p>
            </div>
          </div>

          <Link href="/products">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Continue Shopping
            </Button>
          </Link>
        </div>

        {cartItems.length === 0 ? (
          /* Empty State */
          <Card className="border-0 shadow-sm">
            <CardContent className="py-20 text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-sky-100 flex items-center justify-center mb-6">
                <Package className="h-10 w-10 text-sky-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Browse amazing products and add them here. You can request multiple items at once.
              </p>
              <Link href="/products">
                <Button size="lg" className="bg-sky-600 hover:bg-sky-700">
                  Browse Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-8 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="border border-sky-200 shadow-sm overflow-hidden">
                  <div className="flex flex-col sm:flex-row gap-4 p-4">
                    {/* Image */}
                    <div className="w-full sm:w-28 h-28 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{item.title}</h3>
                        <p className="text-sky-600 font-bold mt-1">৳{item.price.toLocaleString()} each</p>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full border border-sky-300 flex items-center justify-center text-sky-600 hover:bg-sky-50 active:bg-sky-100"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-bold text-xl tabular-nums w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full border border-sky-300 flex items-center justify-center text-sky-600 hover:bg-sky-50 active:bg-sky-100"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Subtotal</div>
                            <div className="font-bold text-xl text-sky-600">
                              ৳{(item.price * item.quantity).toLocaleString()}
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemove(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4">
              <Card className="border-sky-200 sticky top-8">
                <CardContent className="p-6 space-y-5">
                  <div>
                    <h3 className="font-semibold text-xl text-gray-900 mb-1">Order Summary</h3>
                    <p className="text-sm text-gray-500">{itemCount} items in cart</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600 truncate pr-4">{item.title} × {item.quantity}</span>
                        <span className="font-medium text-gray-800">৳{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t flex justify-between items-baseline">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-3xl font-bold text-sky-600">৳{total.toLocaleString()}</span>
                  </div>

                  <div className="pt-2 space-y-3">
                    <Button
                      onClick={handlePlaceAllOrders}
                      disabled={placing || cartItems.length === 0}
                      className="w-full h-12 text-base bg-sky-600 hover:bg-sky-700 font-semibold"
                    >
                      {placing ? 'Placing Orders...' : 'Place Order for All Items'}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => router.push('/dashboard/orders')}
                      className="w-full h-11 border-sky-300 text-sky-700 hover:bg-sky-50"
                    >
                      Go to My Orders
                    </Button>
                  </div>

                  <p className="text-[11px] text-center text-gray-500 leading-tight pt-1">
                    Placing order will send requests to managers for approval. 
                    Stock will be reserved after approval.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
