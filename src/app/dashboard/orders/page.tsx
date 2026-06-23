'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { api, fetchApi } from '@/lib/api';
import { Package, Clock, CheckCircle, XCircle, Calendar, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

interface Selection {
  id: string;
  quantity: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  item?: {
    id: string;
    title: string;
    price: number;
    category: string;
    images: string[];
    location: string;
  };
}

const statusConfig = {
  PENDING: { label: 'Pending Approval', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
  APPROVED: { label: 'Approved', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
};

export default function MyOrdersPage() {
  const [selections, setSelections] = useState<Selection[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  // Client-side pagination
  const itemsPerPage = 9;
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMyOrders = async () => {
    setLoading(true);
    try {
      const res = await fetchApi(api.mySelections);
      // Backend returns { data: { selections: [...] } } for /my-selections
      const list = res?.data?.selections || res?.data || res?.selections || [];
      setSelections(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Failed to load your orders:', e);
      setSelections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const filtered = filter === 'ALL'
    ? selections
    : selections.filter((s) => s.status === filter);

  const counts = {
    ALL: selections.length,
    PENDING: selections.filter((s) => s.status === 'PENDING').length,
    APPROVED: selections.filter((s) => s.status === 'APPROVED').length,
    REJECTED: selections.filter((s) => s.status === 'REJECTED').length,
  };

  // Paginated data for current filter
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filtered.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="My Orders"
        subtitle="Track your product requests and purchases"
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((key) => {
          const active = filter === key;
          return (
            <Button
              key={key}
              variant={active ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setFilter(key);
                setCurrentPage(1); // reset pagination when changing filter
              }}
              className="rounded-full"
            >
              {key === 'ALL' ? 'All Orders' : key.charAt(0) + key.slice(1).toLowerCase()}
              <Badge variant="secondary" className="ml-2 text-xs">
                {counts[key]}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-white/70 backdrop-blur">
          <CardContent className="py-16 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              {filter === 'ALL' ? 'No orders yet' : `No ${filter.toLowerCase()} orders`}
            </h3>
            <p className="text-gray-500">
              {filter === 'ALL'
                ? 'Browse products and place your first order!'
                : 'Orders in this status will appear here.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedOrders.map((order) => {
            const item = order.item;
            const cfg = statusConfig[order.status];
            const StatusIcon = cfg.icon;
            const total = item ? (item.price * order.quantity) : 0;

            return (
              <Card key={order.id} className="overflow-hidden py-0 border border-gray-200 hover:shadow-lg transition-all bg-white rounded-2xl flex flex-col">
                {/* Image */}
                <div className="relative  h-44 bg-gray-100">
                  {item?.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="w-10 h-10" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <Badge className={`absolute top-3 right-3 ${cfg.color} border`}>
                    <StatusIcon className="w-3.5 h-3.5 mr-1" />
                    {cfg.label}
                  </Badge>
                </div>

                <CardContent className="p-4 flex-1 flex flex-col">
                  {/* Title */}
                  <h3 className="font-semibold text-lg leading-tight line-clamp-2 mb-1">
                    {item?.title || 'Product'}
                  </h3>

                  {/* Category + Location */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    {item?.category && <span>{item.category}</span>}
                    {item?.location && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {item.location}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Price & Qty */}
                  <div className="mt-auto">
                    <div className="flex items-baseline justify-between mb-2">
                      <div>
                        <span className="text-2xl font-bold text-emerald-600">
                          ৳{total.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">total</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Qty: <span className="font-semibold text-gray-900">{order.quantity}</span></div>
                        {item && (
                          <div className="text-xs text-gray-500">৳{item.price} each</div>
                        )}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      {new Date(order.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>

          {/* Professional Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{startIndex + 1}</span> - <span className="font-medium">{Math.min(startIndex + itemsPerPage, filtered.length)}</span> of <span className="font-medium">{filtered.length}</span> orders
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="min-w-[36px]"
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
