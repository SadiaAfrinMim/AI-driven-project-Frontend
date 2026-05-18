'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock } from 'lucide-react';
import { fetchApi, api } from '@/lib/api';
import { toast } from 'sonner';

interface PendingItem {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  category: string;
  images: string[];
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function ApprovalsPage() {
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingItems = async () => {
    try {
      const res = await fetchApi(`${api.items}/pending`);
      setPendingItems(res?.data || []);
    } catch (error) {
      console.error('Failed to fetch pending items:', error);
      setPendingItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await fetchApi(`${api.items}/${id}/approve`, { method: 'PATCH' });
      toast.success('Item approved successfully');
      fetchPendingItems();
    } catch (error) {
      toast.error('Failed to approve item');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await fetchApi(`${api.items}/${id}/reject`, { method: 'PATCH' });
      toast.success('Item rejected');
      fetchPendingItems();
    } catch (error) {
      toast.error('Failed to reject item');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Item Approvals</h1>
        <p className="text-gray-600 mt-2">Review and approve pending product listings</p>
      </div>

      {pendingItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No pending items</h3>
            <p className="text-gray-500 mt-1">All items have been reviewed.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              {item.images?.[0] && (
                <div className="h-48 bg-gray-100">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      by {item.owner?.name || 'Unknown'}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      ${item.price}
                    </p>
                    <p className="text-sm text-gray-600">{item.location}</p>
                  </div>

                  <p className="text-sm text-gray-700 line-clamp-3">
                    {item.description}
                  </p>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleApprove(item.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(item.id)}
                      variant="outline"
                      className="flex-1 text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
