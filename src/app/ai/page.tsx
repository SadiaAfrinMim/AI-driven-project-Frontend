'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, Wand2, MessageSquare, TrendingUp, Heart } from 'lucide-react';
import { fetchApi, api } from '@/lib/api';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
}

interface GeneratedContent {
  content: string;
  metadata: {
    type: string;
    wordCount: number;
    generatedAt: string;
    model: string;
  };
}

export default function AIPage() {
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const [contentType, setContentType] = useState<'blog' | 'description' | 'title'>('description');
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState<'professional' | 'casual' | 'creative'>('professional');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [trendData, setTrendData] = useState<any>(null);
  const [isAnalyzingTrends, setIsAnalyzingTrends] = useState(false);
  const [sentimentInput, setSentimentInput] = useState('');
  const [sentimentResult, setSentimentResult] = useState<any>(null);
  const [isAnalyzingSentiment, setIsAnalyzingSentiment] = useState(false);

  const handleChat = async () => {
    if (!chatMessage.trim()) return;
    setIsChatLoading(true);
    try {
      const response = await fetchApi(api.ai.chat, {
        method: 'POST',
        body: JSON.stringify({ message: chatMessage }),
      });
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        message: chatMessage,
        response: response.data.response,
        timestamp: new Date(),
      };
      setChatHistory(prev => [newMessage, ...prev]);
      setChatMessage('');
      toast.success('Message sent!');
    } catch {
      toast.error('Chat failed');
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    try {
      const response = await fetchApi(api.ai.generateContent, {
        method: 'POST',
        body: JSON.stringify({
          type: contentType,
          topic,
          keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
          length: 'medium',
          tone,
        }),
      });
      setGeneratedContent(response.data);
      toast.success('Content generated!');
    } catch {
      toast.error('Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTrendAnalysis = async () => {
    setIsAnalyzingTrends(true);
    try {
      const res = await fetchApi(api.ai.analyzeTrends, { method: 'POST', body: JSON.stringify({}) });
      setTrendData(res.data);
      toast.success('Trends analyzed!');
    } catch {
      toast.error('Trend analysis failed');
    } finally {
      setIsAnalyzingTrends(false);
    }
  };

  const handleSentimentAnalysis = async () => {
    if (!sentimentInput.trim()) return;
    setIsAnalyzingSentiment(true);
    try {
      const res = await fetchApi(api.ai.analyzeSentiment, {
        method: 'POST',
        body: JSON.stringify({ text: sentimentInput }),
      });
      setSentimentResult(res.data);
      toast.success('Sentiment analysis!');
    } catch {
      toast.error('Sentiment analysis failed');
    } finally {
      setIsAnalyzingSentiment(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-12 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-xl">
                <Bot className="w-12 h-12" />
              </div>
              <div>
                <h1 className="text-6xl font-bold tracking-tighter">AI Studio</h1>
                <p className="text-2xl text-white/80 mt-2">2026 Edition • Powered by GPT-4o</p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 px-6 py-2 text-sm">Next-Gen Intelligence</Badge>
          </div>
        </div>

        {/* Premium Feature Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Smart Chat */}
          <Card className="overflow-hidden border-0 shadow-2xl bg-white dark:bg-slate-900">
            <div className="h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500" />
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-950"><MessageSquare className="w-6 h-6 text-blue-600" /></div>
                Smart AI Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Ask about products, trends or get recommendations..." className="h-12 flex-1" onKeyDown={(e) => e.key === 'Enter' && handleChat()} />
                <Button onClick={handleChat} disabled={isChatLoading || !chatMessage.trim()} className="px-8 bg-gradient-to-r from-blue-600 to-cyan-600">Send</Button>
              </div>
              {chatHistory.length > 0 && (
                <div className="max-h-[340px] overflow-y-auto space-y-4 pr-1 pt-2">
                  {chatHistory.map((msg) => (
                    <div key={msg.id} className="space-y-2">
                      <div className="flex justify-end"><div className="bg-blue-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[75%] text-sm">{msg.message}</div></div>
                      <div className="flex justify-start"><div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 rounded-2xl rounded-tl-sm max-w-[75%] text-sm">{msg.response}</div></div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Review Intelligence */}
          <Card className="overflow-hidden border-0 shadow-2xl bg-white dark:bg-slate-900">
            <div className="h-1.5 bg-gradient-to-r from-violet-500 to-purple-600" />
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2.5 rounded-2xl bg-violet-100 dark:bg-violet-950"><Wand2 className="w-6 h-6 text-violet-600" /></div>
                AI Review Intelligence
              </CardTitle>
              <p className="text-sm text-muted-foreground">Summarize reviews • Extract insights • Find pros &amp; cons</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                value={topic} 
                onChange={(e) => setTopic(e.target.value)} 
                placeholder="Enter product name or paste reviews" 
                className="h-12" 
              />
              <Button 
                onClick={handleGenerateContent} 
                disabled={isGenerating || !topic.trim()} 
                className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 text-base font-semibold"
              >
                Analyze Reviews with AI
              </Button>
              {generatedContent && (
                <div className="mt-4 p-5 bg-violet-50 dark:bg-violet-950/40 rounded-2xl border border-violet-200 dark:border-violet-900 text-sm leading-relaxed">
                  {generatedContent.content}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Premium Trend Intelligence */}
          <Card className="overflow-hidden border-0 shadow-2xl bg-white dark:bg-slate-900">
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950"><TrendingUp className="w-6 h-6 text-emerald-600" /></div>
                Trend Intelligence
              </CardTitle>
              <p className="text-sm text-muted-foreground">AI-powered market forecasting • 2026</p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleTrendAnalysis} 
                disabled={isAnalyzingTrends} 
                className="w-full h-12 mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-base font-semibold shadow-lg"
              >
                {isAnalyzingTrends ? 'Analyzing Global Trends...' : 'Run AI Trend Analysis'}
              </Button>

              {trendData && (
                <div className="space-y-6">
                  <div>
                    <div className="text-xs font-semibold tracking-widest text-emerald-600 mb-3">HOT CATEGORIES RIGHT NOW</div>
                    <div className="flex flex-wrap gap-2">
                      {trendData.trendingCategories?.map((cat: string, i: number) => (
                        <Badge key={i} variant="outline" className="px-3 py-1 text-sm border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold tracking-widest text-emerald-600 mb-4">PREDICTED GROWTH 2026</div>
                    <div className="space-y-4">
                      {trendData.predictedGrowth?.slice(0, 4).map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-28 text-sm font-medium truncate">{item.category}</div>
                          <div className="flex-1 h-3 bg-emerald-100 dark:bg-emerald-950 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700" 
                              style={{ width: item.growth }}
                            />
                          </div>
                          <div className="w-14 text-right text-sm font-mono font-semibold text-emerald-600">+{item.growth}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-900">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-emerald-600">✨</div>
                      <div className="font-semibold text-emerald-700 dark:text-emerald-400">AI Insight</div>
                    </div>
                    <p className="text-sm leading-relaxed text-emerald-700/90 dark:text-emerald-300/90">
                      {trendData.insights}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sentiment Analyzer */}
          <Card className="overflow-hidden border-0 shadow-2xl bg-white dark:bg-slate-900">
            <div className="h-1.5 bg-gradient-to-r from-rose-500 to-orange-500" />
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-950"><Heart className="w-6 h-6 text-rose-600" /></div>
                Sentiment &amp; Emotion AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 mb-4">
                <Input value={sentimentInput} onChange={(e) => setSentimentInput(e.target.value)} placeholder="Paste review or text for analysis..." className="h-12 flex-1" />
                <Button onClick={handleSentimentAnalysis} disabled={isAnalyzingSentiment || !sentimentInput.trim()} className="bg-gradient-to-r from-rose-600 to-orange-600">Analyze</Button>
              </div>
              {sentimentResult && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/40 dark:to-orange-950/40 border">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={sentimentResult.sentiment === 'positive' ? 'default' : 'secondary'}>{sentimentResult.sentiment}</Badge>
                    <span className="font-mono text-sm text-muted-foreground">Score: {sentimentResult.score}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{sentimentResult.summary}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
