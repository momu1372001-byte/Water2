import { useEffect, useState } from 'react';
import { Star, X } from 'lucide-react';

interface ConfettiBurstProps {
  trigger: boolean;
  pieces?: number;
}

export function ConfettiBurst({ trigger, pieces = 24 }: ConfettiBurstProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (trigger) {
      setActive(true);
      const t = setTimeout(() => setActive(false), 3000);
      return () => clearTimeout(t);
    }
  }, [trigger]);

  if (!active) return null;

  const colors = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#34d399', '#fbbf24'];
  const items = Array.from({ length: pieces }, (_, i) => {
    const left = (i / pieces) * 100 + (Math.random() * 10 - 5);
    const delay = Math.random() * 0.5;
    const color = colors[i % colors.length];
    const size = 6 + Math.random() * 8;
    const rotate = Math.random() * 360;
    return { left, delay, color, size, rotate, key: i };
  });

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {items.map((p) => (
        <div
          key={p.key}
          className="absolute top-0 animate-confetti"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.5,
            background: p.color,
            borderRadius: '2px',
            transform: `rotate(${p.rotate}deg)`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

interface FeedbackOverlayProps {
  show: boolean;
  correct: boolean;
}

export function FeedbackOverlay({ show, correct }: FeedbackOverlayProps) {
  if (!show) return null;
  return (
    <div
      className={`pointer-events-none fixed inset-0 z-40 ${
        correct ? 'bg-primary-500/5' : 'bg-error-500/5'
      } animate-fade-in`}
    >
      <div className="flex items-center justify-center min-h-screen">
        <div
          className={`grid place-items-center w-24 h-24 rounded-full ${
            correct ? 'bg-primary-100' : 'bg-error-100'
          } animate-bounce-in`}
        >
          {correct ? (
            <Star className="w-12 h-12 text-primary-600 fill-primary-500" />
          ) : (
            <X className="w-12 h-12 text-error-500" />
          )}
        </div>
      </div>
    </div>
  );
}
