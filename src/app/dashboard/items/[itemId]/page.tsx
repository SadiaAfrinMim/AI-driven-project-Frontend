'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchApi, api } from '@/lib/api';
import { toast } from 'sonner';

type DashboardItem = {
  id: string;
  title: string;
  description: string;
  price: number;
  quantity?: number;
  reviewCount?: number;
  location: string;
  category: string;
  tags: string[];
  images: string[];
  rating?: number;
  isAIContent?: boolean;
};

export default function ItemDetailsPage() {
  const params = useParams();
  const itemId = params?.itemId as string;

  const [item, setItem] = useState<DashboardItem | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchItem = async () => {
    if (!itemId) return;
    setLoading(true);
    try {
      const data = await fetchApi(`${api.items}/${itemId}`);
      setItem(data?.data || null);
    } catch (e) {
      console.error('Failed to fetch item:', e);
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemId) {
      fetchItem();
    }
  }, [itemId]);

  if (loading) {
    return <div className="p-8">Loading item details...</div>;
  }

  if (!item) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Item not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{item.title}</h1>
        <p className="text-gray-600 mt-1">Product details</p>
      </div>

      <Card>
        <CardContent className="space-y-6">
          {/* Image */}
          <div className="relative h-48 bg-gray-100">
            {item.images?.length > 0 ? (
              <img
                src={item.images[0]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
            {item.isAIContent && (
              <Badge className="absolute top-2 right-2 bg-purple-100 text-purple-800">
                AI Generated
              </Badge>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{item.title}</h2>
              {item.rating && item.rating > 0 ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((index) => (
                      <Star
                        key={index}
                        className={`w-4 h-4 ${index <= (item.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{item.rating}/5</span>
                  {item.reviewCount !== undefined && (
                    <span className="text-xs text-muted-foreground">({item.reviewCount})</span>
                  )}
                </div>
              ) : (
                <span className="text-xs text-gray-400">No reviews</span>
              )}
            </div>

            <p className="text-gray-600">{item.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Price</p>
                <p className="text-2xl font-bold">৳{item.price}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Stock</p>
                <p className="text-lg">{item.quantity ?? 0}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Location</p>
                <p className="text-lg">{item.location}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Category</p>
                <Badge variant="secondary" className="text-lg">{item.category}</Badge>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-600">Tags</p>
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  // TODO: Implement edit functionality (could redirect to edit modal or edit page)
                  toast.info('Edit functionality not implemented yet');
                }}
              >
                <Edit className="w-4 h-4 mr-1" /> Edit
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (!confirm('Delete this item?')) return;
                  try {
                    await fetchApi(`${api.items}/${item.id}`, { method: 'DELETE' });
                    toast.success('Item deleted');
                    // Redirect to items page after deletion
                    // Note: We need to use router.push from next/navigation, but we are in a client component
                    // For simplicity, we'll just show a toast and reload the page
                    window.location.href = '/dashboard/items';
                  } catch (err) {
                    toast.error('Failed to delete item');
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}