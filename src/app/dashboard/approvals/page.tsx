'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { api, fetchApi } from '@/lib/api';
import { Check, Clock, MapPin, RefreshCcw, X } from 'lucide-react';

interface ApprovalItem {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  category: string;
  images: string[];
  createdAt: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
}

type ActionState = Record<string, 'approve' | 'reject' | undefined>;

export default function ApprovalsPage() {
  const [pendingItems, setPendingItems] = useState<ApprovalItem[]>([]);
  const [approvedItems, setApprovedItems] = useState<ApprovalItem[]>([]);
  const [rejectedItems, setRejectedItems] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [actionState, setActionState] = useState<ActionState>({});
  const [error, setError] = useState<string | null>(null);

  const fetchPendingItems = async () => {
    // Only admins can access /items/pending
    const user = (() => { try { return JSON.parse(Cookies.get('user') || '{}'); } catch { return {}; } })();
    if (user.role !== 'ADMIN') {
      return [];
    }
    const res = await fetchApi(api.pendingItems);
    return Array.isArray(res?.data) ? res.data : [];
  };

  const fetchApprovedItems = async () => {
    const res = await fetchApi(`${api.items}/approved?limit=12`);
    return Array.isArray(res?.data?.items) ? res.data.items : [];
  };

  const fetchRejectedItems = async () => {
    const res = await fetchApi(`${api.items}?status=REJECTED&limit=12`);
    return Array.isArray(res?.data?.items) ? res.data.items : [];
  };

  const refreshLists = async (showSpinner = false) => {
    try {
      if (showSpinner) setReloading(true);
      const [pending, approved, rejected] = await Promise.all([
        fetchPendingItems(),
        fetchApprovedItems(),
        fetchRejectedItems(),
      ]);
      setPendingItems(pending);
      setApprovedItems(approved);
      setRejectedItems(rejected);
      setError(null);
    } catch (refreshError) {
      console.error('Failed to refresh approval data:', refreshError);
      setError('Could not load approval data. Please try again.');
    } finally {
      setLoading(false);
      setReloading(false);
    }
  };

  useEffect(() => {
    void refreshLists();
  }, []);

  const handleStatusChange = async (id: string, action: 'approve' | 'reject') => {
    try {
      setActionState((prev) => ({ ...prev, [id]: action }));
      await fetchApi(action === 'approve' ? api.approveItem(id) : api.rejectItem(id), {
        method: 'PATCH',
      });

      setPendingItems((prev) => prev.filter((item) => item.id !== id));
      toast.success(action === 'approve' ? 'Item approved successfully' : 'Item rejected successfully');
      await refreshLists();
    } catch (statusError) {
      console.error(`Failed to ${action} item:`, statusError);
      const message = statusError instanceof Error ? statusError.message : `Failed to ${action} item`;
      toast.error(message);
    } finally {
      setActionState((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Item Approvals"
        subtitle="Approve or reject marketplace listings and monitor what is already live"
      />

      {/* Sky-blue themed stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border border-sky-200 bg-gradient-to-br from-sky-50 to-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <p className="text-sm text-sky-600 font-medium">Pending Review</p>
            <p className="mt-2 text-3xl font-bold text-sky-900">{pendingItems.length}</p>
          </CardContent>
        </Card>
        <Card className="border border-sky-200 bg-gradient-to-br from-sky-50 to-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <p className="text-sm text-sky-600 font-medium">Approved Visible Items</p>
            <p className="mt-2 text-3xl font-bold text-sky-900">{approvedItems.length}</p>
          </CardContent>
        </Card>
        <Card className="border border-sky-200 bg-gradient-to-br from-sky-50 to-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="flex h-full items-center justify-between gap-4 p-5">
            <div>
              <p className="text-sm text-sky-600 font-medium">Need a refresh?</p>
              <p className="mt-2 text-base font-semibold text-sky-900">Sync latest statuses</p>
            </div>
            <Button 
              onClick={() => void refreshLists(true)} 
              disabled={reloading}
              className="bg-sky-600 hover:bg-sky-700 text-white border-sky-600"
            >
              <RefreshCcw className={`mr-2 h-4 w-4 ${reloading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardContent>
        </Card>
        <Card className="border border-sky-200 bg-gradient-to-br from-sky-50 to-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <p className="text-sm text-sky-600 font-medium">Rejected Items</p>
            <p className="mt-2 text-3xl font-bold text-sky-900">{rejectedItems.length}</p>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card>
          <CardContent className="py-10 text-center text-red-600">{error}</CardContent>
        </Card>
      )}

      {!error && (
        <>
          {/* Pending Items - Unique Sky Blue Design */}
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-sky-900 tracking-tight">Pending Items</h2>
                <p className="text-sm text-sky-600">Items waiting for your approval decision</p>
              </div>
              <Badge className="bg-sky-100 text-sky-700 border-sky-200 px-3 py-1 text-sm">
                {pendingItems.length} pending
              </Badge>
            </div>

            {pendingItems.length === 0 ? (
              <Card className="border-sky-200 bg-sky-50/50">
                <CardContent className="py-12 text-center">
                  <Clock className="mx-auto mb-4 h-12 w-12 text-sky-400" />
                  <h3 className="text-lg font-semibold text-sky-900">No pending items</h3>
                  <p className="mt-1 text-sm text-sky-600">All items have been reviewed.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {pendingItems.map((item) => {
                  const pendingAction = actionState[item.id];
                  return (
                    <Card 
                      key={item.id} 
                      className="group overflow-hidden border border-sky-200 bg-white rounded-2xl shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-200 flex flex-col h-full"
                    >
                      {/* Image Section - Fixed height for consistent sizing */}
                      <div className="relative h-48 bg-sky-100 overflow-hidden">
                        {item.images?.[0] ? (
                          <img 
                            src={item.images[0]} 
                            alt={item.title} 
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-sky-100 to-white text-sky-400">
                            <div className="text-center">
                              <div className="text-4xl mb-1">📦</div>
                              <div className="text-xs">No image</div>
                            </div>
                          </div>
                        )}
                        {/* Sky blue status badge */}
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-sky-600 text-white shadow-sm">Pending Review</Badge>
                        </div>
                        {/* Price tag */}
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-3 py-1 rounded-full shadow">
                          <span className="font-bold text-sky-700 text-sm">${Number(item.price).toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex flex-col flex-1 p-5">
                        {/* Header Info */}
                        <div className="mb-3">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <Badge variant="outline" className="text-xs border-sky-200 text-sky-700">{item.category}</Badge>
                              </div>
                              <h3 className="font-semibold text-lg leading-tight text-gray-900 line-clamp-2 group-hover:text-sky-700 transition-colors">
                                {item.title}
                              </h3>
                            </div>
                          </div>
                          <p className="text-xs text-sky-500">
                            by {item.owner?.name || 'Unknown seller'}
                          </p>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 line-clamp-3 flex-1 mb-4 leading-relaxed">
                          {item.description}
                        </p>

                        {/* Location */}
                        <div className="flex items-center gap-1.5 text-xs text-sky-600 mb-4">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="truncate">{item.location}</span>
                        </div>

                        {/* Action Buttons - Sky Blue Theme */}
                        <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-sky-100">
                          <Button
                            onClick={() => void handleStatusChange(item.id, 'approve')}
                            disabled={Boolean(pendingAction)}
                            className="bg-sky-600 hover:bg-sky-700 text-white h-10 rounded-xl font-medium shadow-sm"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            {pendingAction === 'approve' ? 'Approving...' : 'Approve'}
                          </Button>
                          <Button
                            onClick={() => void handleStatusChange(item.id, 'reject')}
                            disabled={Boolean(pendingAction)}
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-10 rounded-xl font-medium"
                          >
                            <X className="mr-2 h-4 w-4" />
                            {pendingAction === 'reject' ? 'Rejecting...' : 'Reject'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          {/* Approved Items - Matching Sky Blue Card Design */}
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-sky-900 tracking-tight">Approved Items</h2>
                <p className="text-sm text-sky-600">Listings currently visible to users</p>
              </div>
              <Badge className="bg-sky-100 text-sky-700 border-sky-200 px-3 py-1">{approvedItems.length} approved</Badge>
            </div>

            {approvedItems.length === 0 ? (
              <Card className="border-sky-200 bg-sky-50/50">
                <CardContent className="py-10 text-center text-sky-600">
                  No approved items yet.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {approvedItems.map((item) => (
                  <Card 
                    key={item.id} 
                    className="group overflow-hidden border border-sky-200 bg-white rounded-2xl shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-200 flex flex-col h-full"
                  >
                    <div className="relative h-44 bg-sky-100 overflow-hidden">
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-sky-100 to-white text-sky-400">
                          <div className="text-center">
                            <div className="text-3xl mb-1">📦</div>
                            <div className="text-xs">No image</div>
                          </div>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-emerald-500 text-white">Approved</Badge>
                      </div>
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-3 py-1 rounded-full shadow text-sm">
                        <span className="font-semibold text-sky-700">${Number(item.price).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="mb-2">
                        <Badge variant="outline" className="text-xs border-sky-200 text-sky-700 mb-2">{item.category}</Badge>
                        <h3 className="font-semibold text-base leading-tight text-gray-900 line-clamp-2 group-hover:text-sky-700 transition-colors">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-3 flex-1 leading-relaxed mb-4">{item.description}</p>
                      <div className="flex items-center gap-1.5 text-xs text-sky-600 mt-auto">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Rejected Items - Matching Sky Blue Card Design */}
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-sky-900 tracking-tight">Rejected Items</h2>
                <p className="text-sm text-sky-600">Items that were rejected by admin review</p>
              </div>
              <Badge className="bg-sky-100 text-sky-700 border-sky-200 px-3 py-1">{rejectedItems.length} rejected</Badge>
            </div>

            {rejectedItems.length === 0 ? (
              <Card className="border-sky-200 bg-sky-50/50">
                <CardContent className="py-10 text-center text-sky-600">
                  No rejected items yet.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {rejectedItems.map((item) => (
                  <Card 
                    key={item.id} 
                    className="group overflow-hidden border border-sky-200 bg-white rounded-2xl shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-200 flex flex-col h-full opacity-95"
                  >
                    <div className="relative h-44 bg-sky-100 overflow-hidden">
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 grayscale-[0.3]" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-sky-100 to-white text-sky-400">
                          <div className="text-center">
                            <div className="text-3xl mb-1">📦</div>
                            <div className="text-xs">No image</div>
                          </div>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-rose-500 text-white">Rejected</Badge>
                      </div>
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-3 py-1 rounded-full shadow text-sm">
                        <span className="font-semibold text-sky-700">${Number(item.price).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="mb-2">
                        <Badge variant="outline" className="text-xs border-sky-200 text-sky-700 mb-2">{item.category}</Badge>
                        <h3 className="font-semibold text-base leading-tight text-gray-900 line-clamp-2 group-hover:text-sky-700 transition-colors">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-3 flex-1 leading-relaxed mb-4">{item.description}</p>
                      <div className="flex items-center gap-1.5 text-xs text-sky-600 mt-auto">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
