'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Send, X, MessageCircle } from 'lucide-react';
import { fetchApi, api } from '@/lib/api';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
}

export function FloatingAIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleChat = async () => {
    if (!chatMessage.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetchApi(api.ai.chat, {
        method: 'POST',
        body: JSON.stringify({
          message: chatMessage,
        }),
      });

      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        message: chatMessage,
        response: response.data.response,
        timestamp: new Date(),
      };

      setChatHistory(prev => [newMessage, ...prev]);
      setChatMessage('');
      toast.success('Message sent successfully!');
    } catch (error: any) {
      console.error('Chat failed:', error);
      toast.error('Chat service is temporarily unavailable. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
          <Card className="shadow-2xl border-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Assistant
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleChat}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Chat Messages */}
              <div className="h-80 overflow-y-auto space-y-3 p-4 border-b bg-gray-50">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <Bot className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm">Ask me anything about products, features, or get help!</p>
                  </div>
                ) : (
                  chatHistory.map((chat) => (
                    <div key={chat.id} className="space-y-2">
                      <div className="flex justify-end">
                        <div className="bg-blue-600 text-white px-3 py-2 rounded-lg max-w-[80%] text-sm">
                          {chat.message}
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-white text-gray-800 px-3 py-2 rounded-lg max-w-[80%] text-sm border shadow-sm">
                          {chat.response}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleChat}
                    disabled={isLoading || !chatMessage.trim()}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
