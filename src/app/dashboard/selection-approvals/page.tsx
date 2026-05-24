'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { api, fetchApi } from '@/lib/api';
import { Check, Clock, MapPin, Package, X, User as UserIcon } from 'lucide-react';

interface PendingSelection {
  id: string;
  quantity: number;
  status: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  item?: {
    id: string;
    title: string;
    price: number;
    category: string;
    images: string[];
    location: string;
  };
}

type ActionState = Record<string, 'approve' | 'reject' | undefined>;

export default function SelectionApprovalsPage() {
  const [pendingSelections, setPendingSelections] = useState<PendingSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionState, setActionState] = useState<ActionState>({});

  const fetchPending = async () => {
    try {
      const res = await fetchApi(api.pendingSelections);
      const list = res?.data || [];
      setPendingSelections(list);
    } catch (e) {
      console.error('Failed to load pending selections', e);
      setPendingSelections([]);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchPending();
      setLoading(false);
    };
    load();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      setActionState((prev) => ({ ...prev, [id]: action }));
      await fetchApi(action === 'approve' ? api.approveSelection(id) : api.rejectSelection(id), {
        method: 'PATCH',
      });

      setPendingSelections((prev) => prev.filter((s) => s.id !== id));
      toast.success(action === 'approve' ? 'Selection approved! Stock confirmed deducted.' : 'Selection rejected. Stock restored to item.');
    } catch (err: any) {
      toast.error(err?.message || `Failed to ${action} selection`);
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
        title="Product Selection Requests"
        subtitle="Review user product selections. Approve to confirm reservation (stock already reduced), or reject to restore stock."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-amber-50 to-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Pending Requests</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">{pendingSelections.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground flex items-center gap-1"><Check className="h-4 w-4" /> Tip</p>
            <p className="mt-1 text-sm text-emerald-700">Approved selections appear as cards in user's Profile → My Approved Selections</p>
          </CardContent>
        </Card>
      </div>

      {pendingSelections.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No pending product selection requests</h3>
            <p className="text-muted-foreground mt-1">When users select products from detail pages, they will appear here for your approval.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pendingSelections.map((sel) => {
            const item = sel.item;
            const requester = sel.user;
            const isActing = actionState[sel.id];

            return (
              <Card key={sel.id} className="overflow-hidden border border-amber-200 hover:shadow-md transition">
                <div className="relative h-48 bg-slate-100">
                  {item?.images?.[0] ? (
                    <img src={item.images[0]} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="h-12 w-12 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-amber-500 text-white">PENDING APPROVAL</Badge>
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 rounded px-2 py-0.5 text-xs font-medium">
                    {sel.quantity} unit{sel.quantity > 1 ? 's' : ''}
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2">{item?.title}</h3>
                    <p className="text-xl font-bold text-emerald-600 mt-1">৳{Number(item?.price || 0).toLocaleString()}</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {item?.location} • {item?.category}
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      {requester?.profileImage ? (
                        <img src={requester.profileImage} className="w-7 h-7 rounded-full border" alt="" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-gray-500" />
                        </div>
                      )}
                      <span className="text-sm font-medium">{requester?.name || 'User'}</span>
                    </div>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(sel.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleAction(sel.id, 'approve')}
                      disabled={!!isActing}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isActing === 'approve' ? 'Approving...' : <><Check className="h-4 w-4 mr-1" /> Approve</>}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleAction(sel.id, 'reject')}
                      disabled={!!isActing}
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      {isActing === 'reject' ? 'Rejecting...' : <><X className="h-4 w-4 mr-1" /> Reject</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
