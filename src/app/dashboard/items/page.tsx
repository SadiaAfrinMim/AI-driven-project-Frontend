'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Star, Edit, Trash2, Plus, X, Wand2, AlertTriangle } from 'lucide-react';

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

type ModalMode = 'add' | 'edit';

export default function DashboardItemsPage() {
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Current user from cookie
  const Cookies = require('js-cookie');
  const currentUser = (() => {
    try {
      const u = Cookies.get('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();
  const isAdmin = currentUser?.role === 'ADMIN';
  const isManager = currentUser?.role === 'MANAGER';
  const isPrivileged = isAdmin || isManager;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('add');
  const [selectedItem, setSelectedItem] = useState<DashboardItem | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formQuantity, setFormQuantity] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formCategory, setFormCategory] = useState('Electronics');
  const [formTags, setFormTags] = useState('');
  const [formIsAIContent, setFormIsAIContent] = useState(false);
  const [formImages, setFormImages] = useState<File[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generationMode, setGenerationMode] = useState<'ai' | 'manual'>('ai');

  // Pending Approvals (Admin only)
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);

  // New: make description optional when auto-generated
  const [autoGenDescription, setAutoGenDescription] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await fetchApi(api.items);
      const list = data?.data?.items;
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Failed to fetch items:', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchItems();
    if (isAdmin) {
      fetchPendingItems();
    }
  }, []);

  const fetchPendingItems = async () => {
    setLoadingPending(true);
    try {
      const res = await fetchApi(api.pendingItems);
      setPendingItems(res?.data || []);
    } catch (e) {
      console.error('Failed to fetch pending items');
    } finally {
      setLoadingPending(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await fetchApi(api.approveItem(id), { method: 'PATCH' });
      toast.success('Item approved!');
      fetchPendingItems();
      fetchItems();
    } catch {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await fetchApi(api.rejectItem(id), { method: 'PATCH' });
      toast.success('Item rejected');
      fetchPendingItems();
    } catch {
      toast.error('Failed to reject');
    }
  };

  const filteredItems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.location || '').toLowerCase().includes(q)
      );
    });
  }, [items, searchTerm]);

  const closeModal = () => {
    if (submitting) return;
    setModalOpen(false);
  };

  const parseTagsArray = (tagsValue: string): string[] => {
    return tagsValue
      .split(',')
      .map((t) => t.trim().replace(/^#/, '')) // remove leading # if present
      .map((t) => t.toLowerCase())
      .map((t) => t.replace(/[^a-z0-9\s-]/g, ''))
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 5);
  };

  const handleChangeTags = (value: string) => setFormTags(value);

  const generateLocalTags = (text: string) => {
    // Simple local heuristic: split on spaces, pick nouns-ish words
    const words = (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);

    const stopwords = new Set(['the','and','with','for','from','this','that','is','a','an','in','on','of']);
    const freq: Record<string, number> = {};
    for (const w of words) {
      if (w.length <= 2 || stopwords.has(w)) continue;
      freq[w] = (freq[w] || 0) + 1;
    }

    const sorted = Object.keys(freq).sort((a,b)=> freq[b]-freq[a]);
    return sorted.slice(0,5).map(w=>`#${w}`);
  };

  const generateItemContent = async (type: 'title' | 'description' | 'all') => {
    if (!formCategory.trim()) {
      setError('Please enter a category first');
      return;
    }

    setError(null);
    try {
      if (type === 'title') setIsGeneratingTitle(true);
      if (type === 'description') setIsGeneratingDescription(true);
      if (type === 'all') setIsGeneratingAll(true);

      const payload = {
        topic: formCategory || formTitle || undefined,
        category: formCategory,
        price: formPrice ? Number(formPrice) : undefined,
        keywords: parseTagsArray(formTags),
        length: 'medium' as const,
        tone: 'professional' as const,
      };

      let response: any = null;
      if (generationMode === 'ai') {
        response = await fetchApi(api.ai.generateItemContent, {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        // Apply AI-generated content
        if ((type === 'title' || type === 'all') && response?.title) {
          setFormTitle(response.title);
        }
        if ((type === 'description' || type === 'all') && response?.description) {
          setFormDescription(response.description);
        }

        if (Array.isArray(response?.tags) && response.tags.length > 0) {
          const unique = Array.from(new Set(response.tags.map((t: string) => t.trim()).filter(Boolean)));
          setFormTags(unique.slice(0, 5).join(', '));
        }

        setFormIsAIContent(true);
      } else {
        // Manual mode: mark fields as user-provided (no API call)
        if (type === 'title' || type === 'all') {
          setFormTitle((prev) => prev || 'Handcrafted Title');
        }
        if (type === 'description' || type === 'all') {
          setFormDescription((prev) => prev || 'Handwritten description placeholder.');
        }
        // For tags in manual mode, do nothing unless auto-apply is checked
      }
    } catch (err) {
      const msg = (err as { message?: string } | undefined)?.message;
      setError(typeof msg === 'string' ? msg : 'Failed to generate content');
    } finally {
      setIsGeneratingTitle(false);
      setIsGeneratingDescription(false);
      setIsGeneratingAll(false);
    }
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const fd = new FormData();
      const payload = {
        title: formTitle,
        description: formDescription,
        price: Number(formPrice),
        quantity: formQuantity ? Number(formQuantity) : 0,
        location: formLocation,
        category: formCategory,
        tags: parseTagsArray(formTags),
        isAIContent: formIsAIContent,
      };

      fd.append('data', JSON.stringify(payload));
      formImages.forEach((file) => fd.append('images', file));

      await fetchApi(api.items, {
        method: 'POST',
        body: fd,
      });

      setModalOpen(false);
      await fetchItems();

      if (isManager) {
        toast.success('Item submitted for Admin approval!');
      } else {
        toast.success('Item created successfully!');
      }
    } catch (err) {
      const msg = (err as { message?: string } | undefined)?.message;
      setError(typeof msg === 'string' ? msg : 'Failed to create item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!selectedItem) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        title: formTitle,
        description: formDescription,
        price: Number(formPrice),
        location: formLocation,
        category: formCategory,
        tags: parseTagsArray(formTags),
        isAIContent: formIsAIContent,
      };

      // Use fetchApi to include auth headers and consistent error handling
      await fetchApi(`${api.items}/${selectedItem.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      setModalOpen(false);
      toast.success('Item updated successfully');
      await fetchItems();
    } catch (err) {
      const msg = (err as { message?: string } | undefined)?.message;
      setError(typeof msg === 'string' ? msg : 'Failed to update item');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Items</h1>
          <p className="text-gray-600 mt-2">Manage product listings and inventory</p>
        </div>

        {isPrivileged && (
          <Button
            onClick={() => {
              setModalMode('add');
              setSelectedItem(null);
              setFormTitle('');
              setFormDescription('');
              setFormPrice('');
              setFormLocation('');
              setFormCategory('');
              setFormTags('');
              setFormIsAIContent(false);
              setFormImages([]);
              setError(null);
              setModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        )}
        </div>

      {/* Admin - Pending Approvals Section */}
      {isAdmin && pendingItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <AlertTriangle className="w-5 h-5" /> Pending Approvals ({pendingItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingItems.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-muted-foreground">By {item.owner?.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApprove(item.id)} className="bg-green-600 hover:bg-green-700">Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(item.id)}>Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card className="bg-white/70 backdrop-blur">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="bg-white/70 backdrop-blur">
          <CardContent className="text-center py-10 text-gray-500">No items found</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="aspect-video bg-gray-200 relative">
                {Array.isArray(item.images) && item.images.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
                {item.isAIContent && (
                  <Badge className="absolute top-2 right-2 bg-purple-100 text-purple-800">
                    AI Generated
                  </Badge>
                )}
              </div>

              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>

                   <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">${item.price}</span>
                      {item.quantity !== undefined && (
                        <span className="text-sm text-muted-foreground ml-2">Stock: {item.quantity}</span>
                      )}
                      {item.rating && item.rating > 0 ? (
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{item.rating}</span>
                          {item.reviewCount !== undefined && (
                            <span className="text-xs text-muted-foreground">({item.reviewCount})</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No reviews</span>
                      )}
                   </div>

                   <div className="flex flex-wrap gap-1">
                     {/* Show category as primary badge, and tags excluding the category to avoid duplicates */}
                     <Badge variant="secondary">{item.category}</Badge>
                     {(() => {
                       const tags: string[] = (item.tags || []).filter(t => t && t.toLowerCase() !== (item.category || '').toLowerCase());
                       const shown = tags.slice(0, 2);
                       return (
                         <>
                           {shown.map(tag => (
                             <Badge key={tag} variant="outline" className="text-xs">
                               {tag}
                             </Badge>
                           ))}
                           {tags.length > 2 && (
                             <Badge variant="outline" className="text-xs">
                               +{tags.length - 2}
                             </Badge>
                           )}
                         </>
                       );
                     })()}
                   </div>

                  <p className="text-sm text-gray-500">{item.location}</p>

                  <div className="flex space-x-2 pt-2">
                     {isPrivileged ? (
                       <>
                         <Button
                           variant="outline"
                           size="sm"
                           className="flex-1"
                           onClick={() => {
                             setModalMode('edit');
                             setSelectedItem(item);
                             setFormTitle(item.title || '');
                             setFormDescription(item.description || '');
                              setFormPrice(String(item.price ?? ''));
                              setFormQuantity(String(item.quantity ?? ''));
                             setFormLocation(item.location || '');
                             setFormCategory(item.category || '');
                             setFormTags((item.tags || []).join(', '));
                             setFormIsAIContent(!!item.isAIContent);
                             setFormImages([]);
                             setError(null);
                             setModalOpen(true);
                           }}
                         >
                           <Edit className="w-4 h-4 mr-1" />
                           Edit
                         </Button>
                         {isAdmin && (
                           <Button
                             variant="outline"
                             size="sm"
                             className="flex-1 text-red-600 hover:text-red-700"
                      onClick={async () => {
                        // Use formTitle as topic; category may be 'uncategorized'
                        try {
                          const payload = {
                            topic: formTitle || 'product',
                            category: formCategory || 'uncategorized',
                            keywords: parseTagsArray(formTags),
                            length: 'short' as const,
                            tone: 'professional' as const,
                          };

                           const resp = await fetchApi(api.ai.generateItemContent, {
                             method: 'POST',
                             body: JSON.stringify({
                               type: 'tags',
                               topic: formTitle || formDescription || 'product',
                               category: formCategory || 'general',
                               keywords: [formCategory],
                             }),
                           });

                          if (Array.isArray(resp?.tags) && resp.tags.length > 0) {
                            const unique = Array.from(new Set((resp.tags as any[]).map((t: any) => String(t).trim().replace(/^#/, ''))));
                            // Format tags with leading # for display
                            const formatted = unique.slice(0,5).map((t: any) => String(t).startsWith('#') ? String(t) : `#${String(t)}`);
                            setFormTags(formatted.join(', '));
                            toast.success('Tags generated from AI');
                            return;
                          }

                          // If no tags returned, fall back to local tag generation
                          const fallback = generateLocalTags(formTitle || formDescription || 'product');
                          setFormTags(fallback.join(', '));
                          toast.success('Tags generated locally');
                        } catch (err: any) {
                          console.error('Generate tags error:', err);
                          // Fallback: generate from title locally
                          const fallback = generateLocalTags(formTitle || formDescription || 'product');
                          setFormTags(fallback.join(', '));
                          toast.success('Tags generated locally');
                        }
                      }}
                           >
                             <Trash2 className="w-4 h-4 mr-1" />
                             Delete
                           </Button>
                         )}
                       </>
                     ) : (
                       <Button variant="outline" size="sm" onClick={() => alert('You do not have permission to edit or delete this item')}>
                         <Edit className="w-4 h-4 mr-1" />
                         View
                       </Button>
                     )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="font-semibold">
                {modalMode === 'add' ? 'Add Item' : 'Edit Item'}
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-60"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              className="p-4 space-y-5"
              onSubmit={modalMode === 'add' ? handleSubmitAdd : handleSubmitEdit}
            >
              {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

              {/* Step 1: Basic Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Title *</label>
                    <div className="relative">
                      <Input
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="Enter product title"
                        required
                      />
                      {formIsAIContent && (
                        <Badge className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-purple-100 text-purple-700 border-purple-200">
                          AI
                        </Badge>
                      )}
                    </div>
                  </div>

                   <div className="space-y-1.5">
                     <label className="text-sm font-medium text-gray-700">Price (BDT) *</label>
                     <Input
                       value={formPrice}
                       onChange={(e) => setFormPrice(e.target.value)}
                       type="number"
                       step="0.01"
                       placeholder="0.00"
                       required
                     />
                   </div>

                   <div className="space-y-1.5">
                     <label className="text-sm font-medium text-gray-700">Quantity</label>
                     <Input
                       value={formQuantity}
                       onChange={(e) => setFormQuantity(e.target.value)}
                       type="number"
                       placeholder="0"
                     />
                   </div>
                </div>

                 <div className="mt-4 space-y-1.5">
                   <label className="text-sm font-medium text-gray-700">Location *</label>
                   <Input
                     value={formLocation}
                     onChange={(e) => setFormLocation(e.target.value)}
                     placeholder="e.g. Dhaka, Chittagong"
                     required
                   />
                 </div>

                 {/* Category Dropdown */}
                 <div className="mt-4 space-y-1.5">
                   <label className="text-sm font-medium text-gray-700">Category *</label>
                   <Select value={formCategory} onValueChange={(val) => val && setFormCategory(val)}>
                     <SelectTrigger className="w-full">
                       <SelectValue placeholder="Select category" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="Electronics">Electronics</SelectItem>
                       <SelectItem value="Fashion">Fashion</SelectItem>
                       <SelectItem value="Home & Living">Home & Living</SelectItem>
                       <SelectItem value="Beauty">Beauty</SelectItem>
                       <SelectItem value="Sports & Outdoors">Sports & Outdoors</SelectItem>
                       <SelectItem value="Books">Books</SelectItem>
                       <SelectItem value="Toys & Games">Toys & Games</SelectItem>
                       <SelectItem value="Health & Wellness">Health & Wellness</SelectItem>
                       <SelectItem value="Automotive">Automotive</SelectItem>
                       <SelectItem value="Food & Grocery">Food & Grocery</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
               </div>

              {/* Step 2: Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoGenDescription}
                        onChange={(e) => setAutoGenDescription(e.target.checked)}
                      />
                      Auto-generate
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => generateItemContent('description')}
                      className="h-7 px-2 text-xs"
                    >
                      <Wand2 className="w-3 h-3 mr-1" />
                      {isGeneratingDescription ? '...' : generationMode === 'ai' ? 'AI' : 'Write'}
                    </Button>
                  </div>
                </div>
                <Input
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder={autoGenDescription ? "Will be auto-generated..." : "Describe your product..."}
                  required={!autoGenDescription}
                />
                {autoGenDescription && (
                  <p className="text-xs text-gray-500 mt-1">Description will be filled automatically when you create the item.</p>
                )}
              </div>

              {/* Step 3: Tags */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Tags (Max 5)</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => generateItemContent('all')}
                    className="h-7 px-3 text-xs"
                  >
                    <Wand2 className="w-3 h-3 mr-1" />
                    {isGeneratingAll ? 'Generating...' : 'Generate Tags with AI'}
                  </Button>
                </div>
                <Input
                  value={formTags}
                  onChange={(e) => handleChangeTags(e.target.value)}
                  placeholder="#electronics, #new, #premium"
                />
                <p className="text-xs text-gray-500 mt-1">Tags will be shown with # prefix. AI generates up to 5 relevant tags.</p>
              </div>

              {/* Step 4: AI Toggle */}
              <div className="flex items-center gap-3 pt-2 border-t">
                <input
                  id="isAI"
                  type="checkbox"
                  checked={formIsAIContent}
                  onChange={(e) => setFormIsAIContent(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="isAI" className="text-sm text-gray-700 cursor-pointer">
                  Mark as AI Generated Content
                </label>
              </div>

              {/* Images - Only for Add */}
              {modalMode === 'add' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Images *</label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setFormImages(files);
                    }}
                    required
                  />
                  {formImages.length > 0 && (
                    <div className="text-xs text-green-600 mt-1">{formImages.length} image(s) selected</div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={closeModal} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : modalMode === 'add' ? 'Create Item' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

