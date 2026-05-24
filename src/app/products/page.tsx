'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search,
  Filter,
  Star,
  MapPin,
  Calendar,
  Package,
  Grid,
  List,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { fetchApi, api } from '@/lib/api';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  quantity?: number;
  location: string;
  category: string;
  rating: number;
  reviewCount: number;
  images: string[];
  tags: string[];
  createdAt: string;
  isAIContent: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState<string | null>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 12;

  // Exact same categories as in Add Item modal for consistency
  const categories = [
    'Electronics',
    'Fashion',
    'Home & Living',
    'Beauty',
    'Sports & Outdoors',
    'Books',
    'Toys & Games',
    'Health & Wellness',
    'Automotive',
    'Food & Grocery',
  ];

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory, priceRange, sortBy, sortOrder, currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchQuery,
        ...(selectedCategory && { category: selectedCategory }),
        ...(priceRange.min && { minPrice: priceRange.min }),
        ...(priceRange.max && { maxPrice: priceRange.max }),
        sortBy: sortBy || 'createdAt',
        sortOrder: sortOrder || 'desc',
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });

      // Use dedicated approved items endpoint
      const response = await fetchApi(`${api.items}/approved?${params}`);
      const rawItems = response?.data?.items || response?.data || [];
      const meta = response?.data?.meta || {};

      const mappedItems = rawItems.map((it: any) => ({
        id: it.id,
        title: it.title ?? '',
        description: it.description ?? '',
        price: typeof it.price === 'number' ? it.price : Number(it.price) || 0,
        quantity: typeof it.quantity === 'number' ? it.quantity : (it.quantity ? Number(it.quantity) : 0),
        location: it.location ?? '',
        category: it.category ?? '',
        rating: typeof it.rating === 'number' ? it.rating : Number(it.rating) || 0,
        reviewCount: typeof it.reviewCount === 'number' ? it.reviewCount : (Array.isArray(it.reviews) ? it.reviews.length : (it.reviewCount ? Number(it.reviewCount) : 0)),
        images: Array.isArray(it.images) ? it.images : [],
        tags: Array.isArray(it.tags) ? it.tags : [],
        createdAt: it.createdAt ?? new Date().toISOString(),
        isAIContent: !!it.isAIContent,
      }));

      setProducts(mappedItems);
      setTotalPages(meta.totalPages || Math.ceil((meta.total || mappedItems.length) / itemsPerPage) || 1);
      setTotalItems(meta.total || mappedItems.length);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const cleanTags = (product.tags || []).filter(
      (t) => t && t.toLowerCase() !== (product.category || '').toLowerCase()
    );
    const stockQty = product.quantity ?? 0;

    return (
      <Card className="group flex flex-col h-full overflow-hidden border border-gray-200 hover:border-sky-300 hover:shadow-xl transition-all bg-white rounded-2xl">
        {/* Image */}
        <div className="relative h-48 bg-gray-100 flex-shrink-0 overflow-hidden">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-sky-100">
              <Package className="h-10 w-10 text-gray-400" />
            </div>
          )}

          {/* Category badge */}
          <Badge variant="secondary" className="absolute top-2 left-2 text-[10px] bg-white/90 backdrop-blur border">
            {product.category}
          </Badge>

          {/* AI badge */}
          {product.isAIContent && (
            <Badge className="absolute top-2 right-2 text-[10px] bg-purple-600 text-white">
              AI Generated
            </Badge>
          )}

          {/* Rating badge */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/95 rounded-full px-2 py-0.5 shadow-sm">
            <div className="flex items-center text-amber-500">
              {renderStars(Math.floor(product.rating))}
            </div>
            <span className="text-[11px] font-medium text-gray-700">
              {product.rating > 0 ? product.rating.toFixed(1) : '—'}
            </span>
            <span className="text-[10px] text-gray-500">({product.reviewCount})</span>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4 flex flex-col flex-1">
          {/* Title */}
          <h3 className="font-semibold text-[15px] leading-snug text-gray-900 line-clamp-2 mb-1 group-hover:text-sky-600 transition-colors">
            {product.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-gray-600 line-clamp-2 mb-3 min-h-[32px]">
            {product.description || 'No description'}
          </p>

          {/* Price + Stock */}
          <div className="flex items-baseline justify-between mb-2">
            <div>
            <span className="text-2xl font-bold text-sky-600 tracking-tighter">
              ৳{Number(product.price).toLocaleString()}
            </span>
            </div>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold
              ${stockQty > 10 ? 'bg-sky-100 text-sky-700' : 
                stockQty > 0 ? 'bg-amber-100 text-amber-700' : 
                'bg-red-100 text-red-700'}`}>
              Stock: {stockQty}
            </span>
          </div>

          {/* Tags */}
          {cleanTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3 min-h-[20px]">
              {cleanTags.slice(0, 5).map((tag) => (
              <span key={tag} className="text-[9.5px] px-1.5 py-0 rounded bg-sky-100 text-sky-700 font-medium h-4">
                {tag}
              </span>
              ))}
            </div>
          )}

          {/* Location + Date */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-3 mt-auto">
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {product.location || 'N/A'}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(product.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Action */}
          <Link href={`/products/${product.id}`} className="mt-1">
            <Button 
              size="sm" 
              className="w-full h-9 text-sm bg-sky-600 hover:bg-sky-700 transition-colors"
            >
              View Details
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  };

  const ProductListItem = ({ product }: { product: Product }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
           <div className="w-24 h-24 bg-sky-100 dark:bg-sky-900 rounded-lg flex items-center justify-center flex-shrink-0">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Package className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg mb-1">{product.title}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <Badge variant="outline">{product.category}</Badge>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {product.location}
                  </div>
                  <div className="flex items-center">
                    {renderStars(Math.floor(product.rating))}
                    <span className="ml-1">({product.reviewCount})</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary mb-2">
                  ${product.price.toFixed(2)}
                </div>
                {product.isAIContent && (
                  <Badge className="bg-blue-500 text-white text-xs">
                    AI Generated
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {product.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(product.createdAt).toLocaleDateString()}
              </div>
              <Link href={`/products/${product.id}`}>
                <Button size="sm">
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 bg-sky-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Discover Products
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Find the perfect products with AI-powered recommendations and community reviews.
            </p>
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-3 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content with Professional Sidebar */}
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Professional Left Sidebar - Filters */}
            <div className="lg:col-span-3">
              <div className="sticky top-6 space-y-6">
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <SlidersHorizontal className="h-5 w-5" />
                      Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-0">
                    
                    {/* Category Filter */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Category</label>
                    <Select value={selectedCategory || ''} onValueChange={(value) => setSelectedCategory(value || null)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Price Range</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground">Min</label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Max</label>
                          <Input
                            type="number"
                            placeholder="Any"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick Clear */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearFilters} 
                      className="w-full"
                    >
                      Clear All Filters
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Products Area */}
            <div className="lg:col-span-9">
              {/* Top Controls Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    {totalItems} products found
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Sort */}
                  <div className="flex items-center gap-2 flex-1 sm:flex-none">
                    <span className="text-sm text-muted-foreground hidden sm:inline">Sort:</span>
                    <Select value={sortBy || ''} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full sm:w-[130px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt">Newest</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortOrder || 'desc'} onValueChange={(v) => setSortOrder(v as any)}>
                      <SelectTrigger className="w-[90px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">High to Low</SelectItem>
                        <SelectItem value="asc">Low to High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* View Toggle */}
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-r-none"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-l-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Products Grid/List */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="aspect-square bg-muted rounded-t-lg"></div>
                      <CardContent className="p-4">
                        <div className="h-4 bg-muted rounded mb-2"></div>
                        <div className="h-4 bg-muted rounded mb-2 w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16 border rounded-2xl bg-muted/30">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No products found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters or search.</p>
                  <Button variant="outline" onClick={clearFilters} className="mt-4">Clear Filters</Button>
                </div>
              ) : (
                <div className={`grid gap-6 mb-8 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'grid-cols-1'
                }`}>
                  {products.map((product) => (
                    viewMode === 'grid' ? (
                      <ProductCard key={product.id} product={product} />
                    ) : (
                      <ProductListItem key={product.id} product={product} />
                    )
                  ))}
                </div>
              )}

              {/* Professional Pagination */}
              {!loading && products.length > 0 && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t">
                  <div className="text-sm text-muted-foreground">
                    Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
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

                    {/* Smart Page Numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
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
          </div>
        </div>
      </section>
    </div>
  );
}