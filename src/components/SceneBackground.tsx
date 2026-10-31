import type { ReactNode } from 'react';

interface SceneBackgroundProps {
  variant?: 'default' | 'warm' | 'cool' | 'playful';
  children: ReactNode;
  className?: string;
}

const VARIANTS: Record<NonNullable<SceneBackgroundProps['variant']>, string> = {
  default: 'scene-bg',
  warm: 'scene-bg-warm',
  cool: 'scene-bg',
  playful: 'scene-bg-warm',
};

export function SceneBackground({ variant = 'default', children, className = '' }: SceneBackgroundProps) {
  return (
    <div className={`${VARIANTS[variant]} ${className}`}>
      {/* Floating decorative shapes */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute top-[8%] start-[5%] w-24 h-24 rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #10b981, transparent 70%)' }}
        />
        <div
          className="absolute top-[35%] end-[8%] w-32 h-32 rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[12%] start-[10%] w-28 h-28 rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #f59e0b, transparent 70%)' }}
        />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
