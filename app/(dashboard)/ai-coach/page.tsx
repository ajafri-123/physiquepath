'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type Message = { role: 'user' | 'assistant'; content: string };

const SUGGESTED_QUESTIONS = [
  'What should I eat today?',
  'Can I swap a workout exercise?',
  'Why am I not losing weight?',
  'How do I stay consistent?',
  'What if I miss a workout?',
  'How much protein is enough?',
  'Is it okay to eat late at night?',
  'How do I break a plateau?',
];

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <div className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
        isUser ? 'bg-brand-600' : 'bg-slate-100',
      )}>
        {isUser
          ? <User   className="h-4 w-4 text-white" />
          : <Bot    className="h-4 w-4 text-slate-600" />}
      </div>
      <div className={cn(
        'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
        isUser
          ? 'bg-brand-600 text-white rounded-tr-md'
          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-md shadow-sm',
      )}>
        {message.content.split('\n').map((line, i) => (
          <p key={i} className={i > 0 ? 'mt-1.5' : ''}>{line}</p>
        ))}
      </div>
    </div>
  );
}

export default function AiCoachPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi ${session?.user?.name?.split(' ')[0] ?? 'there'}! 👋 I'm your PhysiquePath AI coach.\n\nI can help you with meal ideas, workout questions, how to handle life getting in the way, plateaus, and staying motivated. What's on your mind?`,
    },
  ]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-coach', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!res.ok) throw new Error('Failed to get response');

      const data = await res.json();
      setMessages((m) => [...m, { role: 'assistant', content: data.content }]);
    } catch {
      setMessages((m) => [...m, {
        role: 'assistant',
        content: 'Sorry, I had trouble connecting. Please try again in a moment.',
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] animate-fade-in">
      {/* Header */}
      <div className="page-header flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="page-title">AI Coach</h1>
          <p className="page-subtitle">Ask me anything about your plan, nutrition, or workouts</p>
        </div>
      </div>

      {/* Suggested questions */}
      {messages.length <= 1 && (
        <div className="mb-4">
          <p className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wide">Try asking</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto card p-4 space-y-4 scrollbar-thin">
        {messages.map((m, i) => (
          <ChatBubble key={i} message={m} />
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
              <Bot className="h-4 w-4 text-slate-600" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4">
        <div className="disclaimer mb-3">
          ⚠️ AI Coach provides general wellness suggestions, not medical advice. Always consult qualified professionals for medical concerns.
        </div>
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask your coach anything... (Enter to send)"
            rows={2}
            className="input flex-1 resize-none"
            disabled={loading}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="btn-primary h-12 w-12 p-0 rounded-xl shrink-0"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
