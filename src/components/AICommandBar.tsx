'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Send, Loader2, X } from 'lucide-react';
import { fetchApi, api } from '@/lib/api';
import { toast } from 'sonner';

interface AICommandBarProps {
  context?: string;                    // e.g. product name or page context
  onResult?: (result: any) => void;    // parent can handle generated content
  placeholder?: string;
  className?: string;
}

const QUICK_COMMANDS = [
  "Write a 5-star review for me",
  "Generate a better description",
  "Suggest good tags",
  "Write a catchy title",
  "Recommend similar products",
];

export function AICommandBar({ context, onResult, placeholder, className = '' }: AICommandBarProps) {
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleSubmit = async (cmd?: string) => {
    const finalCommand = (cmd || command).trim();
    if (!finalCommand) return;

    setIsProcessing(true);
    try {
      const res = await fetchApi(api.ai.command, {
        method: 'POST',
        body: JSON.stringify({
          command: finalCommand,
          context: context || '',
        }),
      });

      const data = res.data;
      setLastResult(data);
      onResult?.(data);

      toast.success(data.message || 'AI processed your command!');

      // Clear input after successful command
      setCommand('');
    } catch (error: any) {
      console.error('AI Command failed:', error);
      toast.error(error.message || 'AI command failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickCommand = (cmd: string) => {
    // Make it contextual if possible
    const contextualCmd = context ? `${cmd} for ${context}` : cmd;
    handleSubmit(contextualCmd);
  };

  const clearResult = () => {
    setLastResult(null);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Command Input */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-500" />
            <Input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isProcessing) {
                  handleSubmit();
                }
              }}
              placeholder={placeholder || "Tell AI what to do... (e.g. write a 5 star review, generate description, suggest tags)"}
              className="pl-10 pr-4 h-12 text-base border-sky-200 focus:border-sky-400"
              disabled={isProcessing}
            />
          </div>
          <Button
            onClick={() => handleSubmit()}
            disabled={isProcessing || !command.trim()}
            className="h-12 px-6 bg-sky-600 hover:bg-sky-700"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="ml-2 hidden sm:inline">Send</span>
          </Button>
        </div>
      </div>

      {/* Quick suggestion chips */}
      <div className="flex flex-wrap gap-2">
        {QUICK_COMMANDS.map((cmd, index) => (
          <button
            key={index}
            onClick={() => handleQuickCommand(cmd)}
            disabled={isProcessing}
            className="text-xs px-3 py-1.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors disabled:opacity-50"
          >
            ✨ {cmd}
          </button>
        ))}
      </div>

      {/* Result preview (if any) */}
      {lastResult && (
        <Card className="border-sky-200 bg-sky-50/50">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 text-sm">
                <div className="font-medium text-sky-700 mb-1 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> AI Result
                </div>
                <div className="text-gray-700 whitespace-pre-wrap">
                  {typeof lastResult.result === 'string' 
                    ? lastResult.result 
                    : lastResult.action === 'generate-review' && lastResult.result?.comment
                      ? lastResult.result.comment
                      : lastResult.action === 'generate-tags' && lastResult.result?.tags
                        ? lastResult.result.tags.join(', ')
                        : lastResult.action === 'generate-title' && lastResult.result?.title
                          ? lastResult.result.title
                          : JSON.stringify(lastResult.result, null, 2)}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={clearResult} className="text-sky-600">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
