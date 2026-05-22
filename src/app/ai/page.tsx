'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, Wand2, Copy, Loader2, CheckCircle, Star 
} from 'lucide-react';
import { fetchApi, api } from '@/lib/api';
import { toast } from 'sonner';

const categories = [
  'Electronics', 'Fashion', 'Home & Living', 'Beauty', 
  'Sports & Outdoors', 'Books', 'Toys & Games', 'Health & Wellness',
  'Automotive', 'Food & Grocery'
];

interface GeneratedProduct {
  title: string;
  description: string;
  tags: string[];
}

export default function AISellerStudio() {
  // Product Generator State
  const [category, setCategory] = useState('Electronics');
  const [idea, setIdea] = useState('');
  const [price, setPrice] = useState('');
  const [generated, setGenerated] = useState<GeneratedProduct | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Review Generator State
  const [reviewProduct, setReviewProduct] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [generatedReview, setGeneratedReview] = useState('');
  const [isGeneratingReview, setIsGeneratingReview] = useState(false);

  // Generate Product Content (Most Important Feature)
  const generateProductContent = async () => {
    if (!idea.trim()) {
      toast.error('Please enter a product idea or keywords');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetchApi(api.ai.generateItemContent, {
        method: 'POST',
        body: JSON.stringify({
          category,
          topic: idea,
          price: price ? Number(price) : undefined,
          keywords: idea.split(',').map(k => k.trim()).filter(Boolean),
        }),
      });

      const data = response.data;

      setGenerated({
        title: data.title || '',
        description: data.description || '',
        tags: data.tags || [],
      });

      toast.success('AI generated your product content!');
    } catch (error) {
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  // Generate AI Review
  const generateReview = async () => {
    if (!reviewProduct.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    setIsGeneratingReview(true);

    try {
      const res = await fetchApi(api.ai.generateReview, {
        method: 'POST',
        body: JSON.stringify({
          productName: reviewProduct,
          rating: reviewRating,
        }),
      });

      setGeneratedReview(res.data.comment);
      toast.success('AI review generated!');
    } catch {
      toast.error('Failed to generate review');
    } finally {
      setIsGeneratingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-600 to-blue-600 text-white py-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <Sparkles className="w-9 h-9" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">AI Seller Studio</h1>
              <p className="text-sky-100 mt-1 text-lg">Create better product listings in seconds</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-8 space-y-10">

        {/* ========== 1. PRODUCT CONTENT GENERATOR (Most Relevant) ========== */}
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-sky-500 to-blue-600" />
          
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-sky-100 rounded-2xl">
                <Wand2 className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">AI Product Generator</CardTitle>
                <p className="text-muted-foreground mt-1">
                  Generate professional title, description &amp; 5 relevant tags
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Category *</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Product Idea */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1.5 block">Product Idea / Keywords *</label>
                <Input
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="e.g. Wireless noise cancelling headphones, premium sound quality"
                  className="h-11"
                />
              </div>
            </div>

            <div className="flex gap-4 items-end">
              <div className="w-40">
                <label className="text-sm font-medium mb-1.5 block">Price (optional)</label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Price in BDT"
                  className="h-11"
                />
              </div>

              <Button
                onClick={generateProductContent}
                disabled={isGenerating || !idea.trim()}
                className="h-11 px-8 text-base bg-sky-600 hover:bg-sky-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate with AI
                  </>
                )}
              </Button>
            </div>

            {/* Generated Output */}
            {generated && (
              <div className="pt-6 border-t space-y-5">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">AI Generated Content</span>
                </div>

                {/* Title */}
                <div className="bg-slate-50 rounded-2xl p-5 border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-muted-foreground tracking-widest">TITLE</span>
                    <Button size="sm" variant="ghost" onClick={() => copyText(generated.title, 'Title')}>
                      <Copy className="h-4 w-4 mr-1" /> Copy
                    </Button>
                  </div>
                  <p className="text-xl font-semibold text-gray-900">{generated.title}</p>
                </div>

                {/* Description */}
                <div className="bg-slate-50 rounded-2xl p-5 border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-muted-foreground tracking-widest">DESCRIPTION</span>
                    <Button size="sm" variant="ghost" onClick={() => copyText(generated.description, 'Description')}>
                      <Copy className="h-4 w-4 mr-1" /> Copy
                    </Button>
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{generated.description}</p>
                </div>

                {/* Tags */}
                <div className="bg-slate-50 rounded-2xl p-5 border">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold text-muted-foreground tracking-widest">TAGS (5)</span>
                    <Button size="sm" variant="ghost" onClick={() => copyText(generated.tags.join(', '), 'Tags')}>
                      <Copy className="h-4 w-4 mr-1" /> Copy All
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {generated.tags.map((tag, index) => (
                      <Badge key={index} className="text-sm px-3 py-1 bg-sky-100 text-sky-700 border-sky-200">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ========== 2. AI REVIEW GENERATOR (Secondary but Useful) ========== */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-violet-100 rounded-2xl">
                <Star className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <CardTitle>AI Review Writer</CardTitle>
                <p className="text-muted-foreground text-sm mt-1">
                  Generate realistic customer reviews for your products
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  value={reviewProduct}
                  onChange={(e) => setReviewProduct(e.target.value)}
                  placeholder="Product name (e.g. Sony WH-1000XM5 Headphones)"
                  className="h-11"
                />
              </div>
              <div className="flex gap-3">
                <Select value={String(reviewRating)} onValueChange={(v) => setReviewRating(Number(v))}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map((r) => (
                      <SelectItem key={r} value={String(r)}>{r} Stars</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={generateReview} 
                  disabled={isGeneratingReview || !reviewProduct.trim()}
                  className="h-11 px-6 bg-violet-600 hover:bg-violet-700"
                >
                  {isGeneratingReview ? 'Generating...' : 'Generate Review'}
                </Button>
              </div>
            </div>

            {generatedReview && (
              <div className="bg-violet-50 border border-violet-100 p-5 rounded-2xl">
                <p className="text-gray-700 leading-relaxed">{generatedReview}</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
