import React, { useState, useRef, useEffect } from 'react';
import { Moon, Power, Shield, Eye } from 'lucide-react';
import { BlackoutConfig, BubblePosition } from '../types';
import { audioController } from '../utils/audio';

interface FloatingBubbleProps {
  config: BlackoutConfig;
  onActivate: () => void;
  isBlackoutActive: boolean;
  visible?: boolean;
}

export const FloatingBubble: React.FC<FloatingBubbleProps> = ({
  config,
  onActivate,
  isBlackoutActive,
  visible = true,
}) => {
  const [position, setPosition] = useState<BubblePosition>(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 380;
    return { x: Math.max(16, width - 72), y: 140 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number; hasMoved: boolean }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
    hasMoved: false,
  });

  const bubbleRef = useRef<HTMLDivElement>(null);

  // Keep bubble within real window bounds on resize or orientation change
  useEffect(() => {
    const handleResize = () => {
      const bubbleSize = bubbleRef.current?.offsetWidth || 56;
      setPosition((prev) => ({
        x: Math.max(8, Math.min(prev.x, window.innerWidth - bubbleSize - 8)),
        y: Math.max(8, Math.min(prev.y, window.innerHeight - bubbleSize - 8)),
      }));
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
      hasMoved: false,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      dragStartRef.current.hasMoved = true;
    }

    const bubbleSize = bubbleRef.current?.offsetWidth || 56;
    const newX = Math.max(8, Math.min(dragStartRef.current.posX + deltaX, window.innerWidth - bubbleSize - 8));
    const newY = Math.max(8, Math.min(dragStartRef.current.posY + deltaY, window.innerHeight - bubbleSize - 8));

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    // Tap detected (not drag) -> Activate Blackout on phone!
    if (!dragStartRef.current.hasMoved) {
      if (config.soundFeedback) {
        audioController.playClickSound(340, 0.05);
      }
      if (config.vibrationFeedback) {
        audioController.triggerHaptic(40);
      }
      onActivate();
    } else {
      // Magnetic edge snapping for realism (dock to left or right edge of real phone screen)
      const bubbleSize = bubbleRef.current?.offsetWidth || 56;
      const middleX = window.innerWidth / 2;
      const snapX = position.x < middleX ? 12 : window.innerWidth - bubbleSize - 12;
      setPosition((prev) => ({ ...prev, x: snapX }));
    }
  };

  // If blackout is active or user disabled floating bubble, hide it
  if (isBlackoutActive || !visible) {
    return null;
  }

  const renderIcon = () => {
    switch (config.bubbleIcon) {
      case 'power':
        return <Power className="w-6 h-6 text-amber-300" />;
      case 'shield':
        return <Shield className="w-6 h-6 text-emerald-400" />;
      case 'eye':
        return <Eye className="w-6 h-6 text-cyan-400" />;
      case 'moon':
      default:
        return <Moon className="w-6 h-6 text-indigo-300 fill-indigo-400/20" />;
    }
  };

  const sizeClass = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  }[config.bubbleSize];

  return (
    <div
      ref={bubbleRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: 'none',
      }}
      className={`fixed z-[9999] flex items-center justify-center rounded-full cursor-grab active:cursor-grabbing select-none transition-shadow ${sizeClass} ${
        isDragging ? 'scale-110 shadow-2xl ring-2 ring-emerald-400/60' : 'hover:scale-105 shadow-2xl'
      }`}
      title="Botón suspensivo: Toca para poner en negro la pantalla de tu teléfono o arrástralo"
    >
      {/* Outer pulsing ring like screen recorder floating widget */}
      <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-ping opacity-70 pointer-events-none" />

      {/* Floating Bubble Body */}
      <div className="relative w-full h-full rounded-full bg-neutral-900/95 backdrop-blur-xl border-2 border-emerald-500/50 flex items-center justify-center shadow-[0_8px_25px_rgba(0,0,0,0.85)] group">
        {/* Status indicator dot */}
        <span className="absolute top-1 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />

        {renderIcon()}

        {/* Small badge */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 text-[9px] text-neutral-300 font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-neutral-800">
          Toca para apagar
        </div>
      </div>
    </div>
  );
};
