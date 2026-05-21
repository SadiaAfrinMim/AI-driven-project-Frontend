'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-amber-50 to-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Pending Review</p>
            <p className="mt-2 text-3xl font-bold">{pendingItems.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Approved Visible Items</p>
            <p className="mt-2 text-3xl font-bold">{approvedItems.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-sky-50 to-white shadow-sm">
          <CardContent className="flex h-full items-center justify-between gap-4 p-5">
            <div>
              <p className="text-sm text-muted-foreground">Need a refresh?</p>
              <p className="mt-2 text-base font-semibold">Sync latest statuses</p>
            </div>
            <Button variant="outline" onClick={() => void refreshLists(true)} disabled={reloading}>
              <RefreshCcw className={`mr-2 h-4 w-4 ${reloading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-rose-50 to-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Rejected Items</p>
            <p className="mt-2 text-3xl font-bold">{rejectedItems.length}</p>
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
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Pending Items</h2>
                <p className="text-sm text-muted-foreground">Items waiting for your approval decision</p>
              </div>
              <Badge variant="outline" className="bg-amber-50 text-amber-700">
                {pendingItems.length} pending
              </Badge>
            </div>

            {pendingItems.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No pending items</h3>
                  <p className="mt-1 text-sm text-muted-foreground">All items have been reviewed.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                {pendingItems.map((item) => {
                  const pendingAction = actionState[item.id];
                  return (
                    <Card key={item.id} className="overflow-hidden border-0 shadow-sm">
                      <div className="grid md:grid-cols-[220px_1fr]">
                        <div className="h-56 bg-muted md:h-full">
                          {item.images?.[0] ? (
                            <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-stone-100 to-amber-50 text-muted-foreground">
                              No image
                            </div>
                          )}
                        </div>

                        <div>
                          <CardHeader className="space-y-3">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="outline">{item.category}</Badge>
                                  <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                                </div>
                                <CardTitle className="text-xl">{item.title}</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                  Submitted by {item.owner?.name || 'Unknown seller'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-primary">${Number(item.price).toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(item.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-4">
                            <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">{item.description}</p>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{item.location}</span>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <Button
                                onClick={() => void handleStatusChange(item.id, 'approve')}
                                disabled={Boolean(pendingAction)}
                                className="bg-emerald-600 hover:bg-emerald-700"
                              >
                                <Check className="mr-2 h-4 w-4" />
                                {pendingAction === 'approve' ? 'Approving...' : 'Approve'}
                              </Button>
                              <Button
                                onClick={() => void handleStatusChange(item.id, 'reject')}
                                disabled={Boolean(pendingAction)}
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                              >
                                <X className="mr-2 h-4 w-4" />
                                {pendingAction === 'reject' ? 'Rejecting...' : 'Reject'}
                              </Button>
                            </div>
                          </CardContent>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Approved Items</h2>
                <p className="text-sm text-muted-foreground">Listings currently visible to users</p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700">{approvedItems.length} approved</Badge>
            </div>

            {approvedItems.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  No approved items yet.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
                {approvedItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden border-0 shadow-sm">
                    <div className="h-48 bg-muted">
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-50 to-stone-50 text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                    <CardHeader className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="mb-2 flex flex-wrap gap-2">
                            <Badge variant="outline">{item.category}</Badge>
                            <Badge className="bg-emerald-100 text-emerald-700">Approved</Badge>
                          </div>
                          <CardTitle className="line-clamp-2 text-lg">{item.title}</CardTitle>
                        </div>
                        <p className="text-lg font-bold text-primary">${Number(item.price).toFixed(2)}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{item.location}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Rejected Items</h2>
                <p className="text-sm text-muted-foreground">Items that were rejected by admin review</p>
              </div>
              <Badge className="bg-rose-100 text-rose-700">{rejectedItems.length} rejected</Badge>
            </div>

            {rejectedItems.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  No rejected items yet.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
                {rejectedItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden border border-rose-100 shadow-sm">
                    <div className="h-44 bg-muted">
                      {item.images?.[0] ? (
                        <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-rose-50 to-stone-50 text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                    <CardHeader className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="mb-2 flex flex-wrap gap-2">
                            <Badge variant="outline">{item.category}</Badge>
                            <Badge className="bg-rose-100 text-rose-700">Rejected</Badge>
                          </div>
                          <CardTitle className="line-clamp-2 text-lg">{item.title}</CardTitle>
                        </div>
                        <p className="text-lg font-bold text-primary">${Number(item.price).toFixed(2)}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{item.location}</span>
                      </div>
                    </CardContent>
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
