'use client';

import { useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Star, Edit, Trash2, Plus, X, Wand2, AlertTriangle } from 'lucide-react';

import { fetchApi, api } from '@/lib/api';
import { toast } from 'sonner';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

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
  ownerId?: string;
};

type ModalMode = 'add' | 'edit';

export default function DashboardItemsPage() {
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Safe cookie reading after mount (prevents hydration / reload issues)
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    try {
      const u = Cookies.get('user');
      if (u) {
        setCurrentUser(JSON.parse(u));
      }
    } catch (e) {
      console.warn('Failed to parse user cookie');
    }
  }, []);

  const isAdmin = currentUser?.role === 'ADMIN';
  const isManager = currentUser?.role === 'MANAGER';
  const isPrivileged = isAdmin || isManager;
  const currentUserId = currentUser?.id;

  // Admins see all items (including pending), others see only approved

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

  // (removed unused pending approvals state - approvals are handled on dedicated /dashboard/approvals page)

  // New: make description optional when auto-generated
  const [autoGenDescription, setAutoGenDescription] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      // Everyone (USER, MANAGER, ADMIN) sees only their own created items
      const data = await fetchApi(`${api.items}/my-items`);
      const list = data?.data?.items || data?.items || [];
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
  }, []);

  const handleDeleteItem = async (itemId: string) => {
    try {
      await fetchApi(`${api.items}/${itemId}`, { method: 'DELETE' });
      toast.success('Item deleted successfully');
      fetchItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error('Failed to delete item');
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

  const generateItemContent = async (type: 'title' | 'description' | 'all' | 'tags') => {
    if (!formCategory.trim()) {
      setError('Please enter a category first');
      return;
    }

    setError(null);
    try {
      if (type === 'title') setIsGeneratingTitle(true);
      if (type === 'description') setIsGeneratingDescription(true);
      if (type === 'all' || type === 'tags') setIsGeneratingAll(true);

      const payload: any = {
        topic: formCategory || formTitle || undefined,
        category: formCategory,
        price: formPrice ? Number(formPrice) : undefined,
        keywords: parseTagsArray(formTags),
        length: 'medium' as const,
        tone: 'professional' as const,
      };
      if (type === 'title') payload.type = 'item-title';
      else if (type === 'description') payload.type = 'item-description';
      else if (type === 'tags') payload.type = 'tags';
      // 'all' leaves type undefined (generates title+desc+tags)

      let response: any = null;
      if (generationMode === 'ai') {
        response = await fetchApi(api.ai.generateItemContent, {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        // Apply AI-generated content (response is wrapped by sendResponse → { success, message, data: {...} })
        const aiData = response?.data || response;

        if ((type === 'title' || type === 'all') && aiData?.title) {
          setFormTitle(aiData.title);
        }
        if ((type === 'description' || type === 'all') && aiData?.description) {
          setFormDescription(aiData.description);
        }

        // Tags: only set when the user asked for tags (prevents "Generate Tags" button from overwriting other fields)
        if ((type === 'tags' || type === 'all') && Array.isArray(aiData?.tags) && aiData.tags.length > 0) {
          const unique = Array.from(new Set(aiData.tags.map((t: string) => t.trim()).filter(Boolean)));
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
        quantity: formQuantity ? Number(formQuantity) : 0,
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
      <DashboardHeader
        title="Items"
        subtitle="Manage product listings and inventory"
      />

        {/* All logged-in users can add their own items */}
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
            setFormQuantity('1');   // sensible default stock
            setError(null);
            setModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredItems.map((item) => {
            // Show tags as-is (AI generates 5 relevant ones). Only remove exact category duplicates if any.
            const cleanTags = (item.tags || []).filter(
              (t) => t && t.toLowerCase() !== (item.category || '').toLowerCase()
            );

            const stockQty = item.quantity ?? 0;

            return (
              <Card key={item.id} className="group overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all flex flex-col h-full bg-white rounded-xl">
                {/* Image Section with fixed height */}
                <div className="relative h-40 bg-gray-100 flex-shrink-0 overflow-hidden">
                  {Array.isArray(item.images) && item.images.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm bg-sky-100">
                      No Image
                    </div>
                  )}

                  {/* Category badge (top-left) */}
                  <Badge variant="secondary" className="absolute top-2 left-2 text-[10px] px-2 py-0 h-5 bg-white/90 backdrop-blur border">
                    {item.category}
                  </Badge>

                  {/* AI badge (top-right) */}
                  {item.isAIContent && (
                    <Badge className="absolute top-2 right-2 text-[10px] px-1.5 py-0 h-5 bg-purple-600 text-white">
                      AI Generated
                    </Badge>
                  )}

                  {/* No stock overlay on image - cleaner look */}
                </div>

                {/* Content */}
                <CardContent className="p-3 flex-1 flex flex-col text-sm">
                  {/* Title */}
                  <h3 className="font-semibold text-[14.5px] leading-tight text-gray-900 line-clamp-2 mb-1 min-h-[34px]">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2 min-h-[30px]">
                    {item.description || 'No description provided.'}
                  </p>

                  {/* Price + Rating */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg font-bold text-emerald-600 tracking-tight">
                      ৳{Number(item.price).toLocaleString()}
                    </span>

                    {item.rating && item.rating > 0 ? (
                      <div className="flex items-center gap-0.5 text-sm text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-semibold text-gray-800">{item.rating}</span>
                        {item.reviewCount !== undefined && (
                          <span className="text-[10px] text-gray-500">({item.reviewCount})</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400">No reviews yet</span>
                    )}
                  </div>

                  {/* Stock - Always show the actual number you entered */}
                  <div className="mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide
                      ${stockQty > 10 ? 'bg-emerald-100 text-emerald-700' : 
                        stockQty > 0 ? 'bg-amber-100 text-amber-700' : 
                        'bg-red-100 text-red-700'}`}>
                      Stock: {stockQty}
                    </span>
                  </div>

                  {/* Tags - Always try to show (AI now generates up to 5) */}
                  <div className="flex flex-wrap gap-1 mb-2 min-h-[18px]">
                    {cleanTags.length > 0 ? (
                      cleanTags.slice(0, 5).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center text-[9.5px] px-1.5 py-0 rounded bg-gray-100 text-gray-700 font-medium h-4.5"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-[9px] text-gray-400">No tags</span>
                    )}
                  </div>

                  {/* Location */}
                  <p className="text-[11px] text-gray-500 mb-2">{item.location}</p>

                  {/* Action Buttons */}
                   <div className="mt-auto pt-2 border-t flex flex-wrap gap-1.5">
                     {/* Owner can always edit/delete their own items (regardless of role) */}
                     {item.ownerId === currentUserId ? (
                       <>
                         <Button
                           variant="outline"
                           size="sm"
                           className="flex-1 h-7 text-xs"
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
                           <Edit className="w-3 h-3 mr-1" />
                           Edit
                         </Button>

                         <Button
                           variant="destructive"
                           size="sm"
                           className="flex-1 h-7 text-xs"
                           onClick={() => handleDeleteItem(item.id)}
                         >
                           <Trash2 className="w-3 h-3 mr-1" />
                           Delete
                         </Button>
                       </>
                     ) : (
                       <Button
                         variant="outline"
                         size="sm"
                         className="w-full h-7 text-xs"
                         onClick={() => alert('You can only manage items you created')}
                       >
                         View Details
                       </Button>
                     )}
                   </div>
                </CardContent>
              </Card>
            );
          })}
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
                     <div className="flex items-center justify-between">
                       <label className="text-sm font-medium text-gray-700">Title *</label>
                       <Button
                         type="button"
                         variant="outline"
                         size="sm"
                         onClick={() => generateItemContent('title')}
                         className="h-6 px-2 text-xs"
                         disabled={isGeneratingTitle}
                       >
                         <Wand2 className="w-3 h-3 mr-1" />
                         {isGeneratingTitle ? '...' : generationMode === 'ai' ? 'AI' : 'Write'}
                       </Button>
                     </div>
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
                     onClick={() => generateItemContent('tags')}
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
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormIsAIContent(checked);

                      if (checked && formCategory) {
                        // Auto-generate good AI tags (5) if user hasn't typed any
                        if (!formTags.trim()) {
                          generateItemContent('tags');
                        }
                        // Also auto-fill description if empty (great UX for Add Item)
                        if (!formDescription.trim()) {
                          generateItemContent('description');
                        }
                      }
                    }}
                   className="w-4 h-4"
                 />
                 <label htmlFor="isAI" className="text-sm text-gray-700 cursor-pointer">
                   Mark as AI Generated Content (auto-generates tags too)
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

