import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { chatbotService } from './chatbotService';
import type { ChatMessage } from './chatbotService';

const FREE_LIMIT = 4;

function getUsageKey(userId: string) {
  return `swiftdrop_chatbot_usage_${userId}`;
}

function getUsageCount(userId: string): number {
  try {
    const raw = localStorage.getItem(getUsageKey(userId));
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

function incrementUsage(userId: string): number {
  const next = getUsageCount(userId) + 1;
  try {
    localStorage.setItem(getUsageKey(userId), String(next));
  } catch {
    // ignore
  }
  return next;
}


const MessageBubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: 8,
        marginBottom: 12,
      }}
    >
    
      <div
        style={{
          flexShrink: 0,
          width: 28,
          height: 28,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isUser ? 'var(--grad)' : 'var(--bg-overlay)',
          color: isUser ? '#fff' : 'var(--primary)',
          border: isUser ? 'none' : '1px solid var(--border)',
        }}
      >
        {isUser ? <User size={13} /> : <Bot size={13} />}
      </div>
      <div
        style={{
          maxWidth: '75%',
          padding: '9px 13px',
          borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
          background: isUser ? 'var(--grad)' : 'var(--bg-raised)',
          color: isUser ? '#fff' : 'var(--text-primary)',
          fontSize: 13,
          lineHeight: 1.5,
          boxShadow: isUser ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
          border: isUser ? 'none' : '1px solid var(--border)',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
        }}
      >
        {msg.content}
      </div>
    </div>
  );
};

// Typing Indicator 
const TypingIndicator: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 12 }}>
    <div
      style={{
        flexShrink: 0,
        width: 28,
        height: 28,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-overlay)',
        color: 'var(--primary)',
        border: '1px solid var(--border)',
      }}
    >
      <Bot size={13} />
    </div>
    <div
      style={{
        padding: '10px 14px',
        borderRadius: '4px 16px 16px 16px',
        background: 'var(--bg-raised)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        gap: 4,
        alignItems: 'center',
      }}
    >
      {[0, 1, 2].map(i => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--primary)',
            opacity: 0.6,
            animation: `chatbotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  </div>
);

//  Main ChatbotWidget 
interface ChatbotWidgetProps {
  userId: string;
  userName?: string;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ userId, userName }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'bot',
      content: `Hi ${userName ? userName.split(' ')[0] : 'there'}! 👋 I'm SwiftBot, your SwiftDrop assistant. I can help you track parcels, understand delivery statuses, and answer questions about our service.\n\nYou have ${FREE_LIMIT} free messages.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [usageCount, setUsageCount] = useState(() => getUsageCount(userId));
  const [limitError, setLimitError] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const remaining = FREE_LIMIT - usageCount;
  const isLimitReached = usageCount >= FREE_LIMIT;

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open && !isLimitReached) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open, isLimitReached]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || isLimitReached) return;

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setLimitError(false);

    try {
      const { reply } = await chatbotService.sendMessage(text);
      const newCount = incrementUsage(userId);
      setUsageCount(newCount);

      const botMsg: ChatMessage = { role: 'bot', content: reply, timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);

      // If limit just reached
      if (newCount >= FREE_LIMIT) {
        setMessages(prev => [
          ...prev,
          {
            role: 'bot',
            content: "You've used all 4 free messages. Upgrade to a premium plan to keep chatting! 🚀",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err: unknown) {
      setLimitError(true);
      // Check if the backend returned a 429 / limit error
      const isLimitErr =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        (err as { response?: { status?: number } }).response?.status === 429;

      if (isLimitErr) {
        setUsageCount(FREE_LIMIT);
        setMessages(prev => [
          ...prev,
          {
            role: 'bot',
            content: "You've reached your free message limit. Please upgrade to continue. 🚀",
            timestamp: new Date(),
          },
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'bot',
            content: 'Sorry, something went wrong. Please try again.',
            timestamp: new Date(),
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, [input, loading, isLimitReached, userId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <style>{`
        @keyframes chatbotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.6; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes chatbotSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatbotPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(13, 148, 136, 0.4); }
          50%       { box-shadow: 0 0 0 8px rgba(13, 148, 136, 0); }
        }
      `}</style>
      <button
        onClick={() => setOpen(p => !p)}
        aria-label={open ? 'Close chat' : 'Open SwiftBot'}
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'var(--grad)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)',
          zIndex: 1000,
          transition: 'transform 0.2s, box-shadow 0.2s',
          animation: !open ? 'chatbotPulse 2.5s ease-in-out infinite' : 'none',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 92,
            right: 28,
            width: 360,
            height: 500,
            background: 'var(--bg-surface)',
            borderRadius: 20,
            boxShadow: 'var(--shadow-lg), 0 0 0 1px var(--border)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 999,
            overflow: 'hidden',
            animation: 'chatbotSlideUp 0.25s ease',
          }}
        >
          <div
            style={{
              background: 'var(--grad)',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Sparkles size={18} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>SwiftBot</p>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>AI Assistant · SwiftDrop</p>
            </div>
            <div
              style={{
                background: remaining > 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255, 80, 80, 0.4)',
                borderRadius: 20,
                padding: '3px 10px',
                fontSize: 11,
                color: '#fff',
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {isLimitReached ? 'Limit reached' : `${remaining} left`}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '14px 14px 4px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          // Limit reached banner 
          {isLimitReached && (
            <div
              style={{
                margin: '8px 12px',
                padding: '10px 12px',
                background: 'var(--warning-bg)',
                border: '1px solid var(--warning-border)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                color: 'var(--warning)',
                fontWeight: 500,
              }}
            >
              <AlertCircle size={14} />
              <span>Free limit reached. Upgrade your plan to continue.</span>
            </div>
          )}

          // Error banner
          {limitError && !isLimitReached && (
            <div
              style={{
                margin: '0 12px 6px',
                padding: '8px 12px',
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12,
                color: 'var(--danger)',
              }}
            >
              <AlertCircle size={13} />
              <span>Failed to send. Please try again.</span>
            </div>
          )}

          
          <div
            style={{
              padding: '10px 12px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: 8,
              alignItems: 'flex-end',
              flexShrink: 0,
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLimitReached ? 'Upgrade to continue…' : 'Ask SwiftBot…'}
              disabled={isLimitReached || loading}
              rows={1}
              style={{
                flex: 1,
                resize: 'none',
                border: '1px solid var(--border-strong)',
                borderRadius: 12,
                padding: '9px 12px',
                fontSize: 13,
                lineHeight: 1.4,
                outline: 'none',
                background: isLimitReached ? 'var(--bg-overlay)' : 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                maxHeight: 90,
                overflowY: 'auto',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--primary)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border-strong)'; }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading || isLimitReached}
              aria-label="Send"
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: !input.trim() || loading || isLimitReached ? 'var(--bg-overlay)' : 'var(--grad)',
                color: !input.trim() || loading || isLimitReached ? 'var(--text-muted)' : '#fff',
                border: 'none',
                cursor: !input.trim() || loading || isLimitReached ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.15s',
                boxShadow: !input.trim() || loading || isLimitReached ? 'none' : 'var(--shadow-glow)',
              }}
            >
              {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
            </button>
          </div>

          
          <p
            style={{
              textAlign: 'center',
              fontSize: 11,
              color: 'var(--text-muted)',
              paddingBottom: 10,
              paddingTop: 2,
            }}
          >
            Powered by SwiftDrop AI
          </p>
        </div>
      )}
    </>
  );
};
