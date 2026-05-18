'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Star,
  MapPin,
  Calendar,
  User,
  MessageSquare,
  ThumbsUp,
  Share,
  Heart,
  Package,
  Shield,
  Truck,
  RotateCcw
} from 'lucide-react';
import { fetchApi, api } from '@/lib/api';
import { ReviewForm } from '@/components/ReviewForm';
import Cookies from 'js-cookie';

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
  owner: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
}

interface Review {
  id: string;
  comment: string;
  rating: number;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    profileImage?: string;
  };
}

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);


  // get current user id from cookies
  const getCurrentUser = () => { try { const u = Cookies.get('user'); return u ? JSON.parse(u) : null; } catch { return null; } };
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id ?? '';


  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);

      // Fetch product details
      const productResponse = await fetchApi(`${api.items}/${productId}`);
      setProduct(productResponse.data);

      // Fetch reviews for this product
      const reviewsResponse = await fetchApi(`${api.reviews}?itemId=${productId}`);
      const allReviews = reviewsResponse.data?.reviews || [];

      // Separate current user's review
      const myReview = allReviews.find((r: Review) => r.userId === currentUserId) || null;
      const otherReviews = allReviews.filter((r: Review) => r.userId !== currentUserId);

      setUserReview(myReview);
      setReviews(otherReviews);

      // Fetch related products (same category)
      if (productResponse.data?.category) {
        const relatedResponse = await fetchApi(`${api.items}?category=${productResponse.data.category}&limit=4`);
        setRelatedProducts(relatedResponse.data?.items?.filter((p: Product) => p.id !== productId) || []);
      }
    } catch (error) {
      console.error('Failed to fetch product details:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const starSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${starSize} ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="aspect-square bg-muted rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-4/5"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-foreground">Products</Link>
          <span>/</span>
          <span className="text-foreground">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              {product.images?.[selectedImage] ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-primary' : 'border-muted'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{product.category}</Badge>
                {product.isAIContent && (
                  <Badge className="bg-blue-500 text-white">AI Generated</Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold text-foreground mb-4">{product.title}</h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {renderStars(product.rating)}
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  {product.location}
                </div>
              </div>

              <div className="text-4xl font-bold text-primary mb-2">
                ${product.price.toFixed(2)}
              </div>
              {product.quantity !== undefined && (
                <div className="text-sm text-muted-foreground mb-6">
                  In stock: <span className="font-medium text-foreground">{product.quantity}</span>
                </div>
              )}

              <div className="flex gap-3">
                <Button size="lg" className="flex-1">
                  Contact Seller
                </Button>

                <Button variant="outline" size="lg">
                  <Share className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Seller Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={product.owner?.profileImage} />
                    <AvatarFallback>
                      {product.owner?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{product.owner?.name}</p>
                    <p className="text-sm text-muted-foreground">Member since {new Date(product.createdAt).getFullYear()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span>{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span>{product.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Listed</span>
                  <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                </div>
                {product.tags && product.tags.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tags</span>
                    <div className="flex gap-1">
                      {product.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Description */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Shipping Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Shipping & Returns
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Free shipping available</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">30-day return policy</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Buyer protection</span>
                </div>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Why Buy Here?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Verified seller</span>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">High rating seller</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Quick responses</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews Section - Logical & Clean Layout */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Reviews &amp; Ratings
                  <Badge variant="secondary" className="ml-2">{product.reviewCount}</Badge>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent>
              {/* 1. Current User's Review (Top Priority) */}
              {userReview && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-semibold text-yellow-600">Your Review</span>
                    <div className="h-px flex-1 bg-yellow-200" />
                  </div>

                  <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-11 w-11">
                        <AvatarImage src={userReview.user?.profileImage} />
                        <AvatarFallback>
                          {userReview.user?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{userReview.user?.name}</span>
                          {renderStars(userReview.rating, 'sm')}
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          {new Date(userReview.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-gray-700 leading-relaxed">{userReview.comment}</p>

                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-4"
                          onClick={() => {
                            document.getElementById('edit-review-form')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          Edit Review
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Community Reviews */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-semibold text-gray-600">Community Reviews</span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>

                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="flex gap-4">
                        <Avatar className="h-10 w-10 mt-1">
                          <AvatarImage src={review.user?.profileImage} />
                          <AvatarFallback>
                            {review.user?.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{review.user?.name}</span>
                            {renderStars(review.rating, 'sm')}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No community reviews yet. Be the first!
                  </div>
                )}
              </div>

              {/* 3. Review Form - Only if user has not reviewed yet */}
              {!userReview && (
                <div className="mt-10 pt-8 border-t">
                  <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                  <ReviewForm
                    itemId={productId}
                    onReviewSubmitted={fetchProductDetails}
                  />
                </div>
              )}

              {/* 4. Edit Form (appears when user clicks Edit) */}
              {userReview && (
                <div id="edit-review-form" className="mt-10 pt-8 border-t">
                  <h3 className="text-lg font-semibold mb-4">Edit Your Review</h3>
                  <ReviewForm
                    itemId={productId}
                    onReviewSubmitted={fetchProductDetails}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct.id} className="hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-muted rounded-t-lg flex items-center justify-center">
                    {relatedProduct.images?.[0] ? (
                      <img
                        src={relatedProduct.images[0]}
                        alt={relatedProduct.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2 line-clamp-2">{relatedProduct.title}</h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-primary">
                        ${relatedProduct.price.toFixed(2)}
                      </span>
                      <div className="flex items-center">
                        {renderStars(Math.floor(relatedProduct.rating), 'sm')}
                      </div>
                    </div>
                    <Link href={`/products/${relatedProduct.id}`}>
                      <Button size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}