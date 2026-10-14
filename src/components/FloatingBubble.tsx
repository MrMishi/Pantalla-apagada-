import React, { useState, useRef, useEffect } from 'react';
import { Moon, Power, Shield, Eye, Video } from 'lucide-react';
import { BlackoutConfig, BubblePosition } from '../types';
import { audioController } from '../utils/audio';

interface FloatingBubbleProps {
  config: BlackoutConfig;
  onActivate: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isBlackoutActive: boolean;
}

export const FloatingBubble: React.FC<FloatingBubbleProps> = ({
  config,
  onActivate,
  containerRef,
  isBlackoutActive,
}) => {
  const [position, setPosition] = useState<BubblePosition>({ x: 20, y: 120 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number; hasMoved: boolean }>({
    startX: 0,
    startY: 0,
    posX: 20,
    posY: 120,
    hasMoved: false,
  });

  const bubbleRef = useRef<HTMLDivElement>(null);

  // Keep bubble within bounds if container resizes
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !bubbleRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const bubbleSize = bubbleRef.current.offsetWidth || 52;
      setPosition((prev) => ({
        x: Math.max(8, Math.min(prev.x, rect.width - bubbleSize - 8)),
        y: Math.max(8, Math.min(prev.y, rect.height - bubbleSize - 8)),
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [containerRef]);

  // Touch and Mouse handlers for dragging the floating bubble
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

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
    if (!isDragging || !containerRef.current || !bubbleRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      dragStartRef.current.hasMoved = true;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const bubbleSize = bubbleRef.current.offsetWidth || 52;

    const newX = Math.max(8, Math.min(dragStartRef.current.posX + deltaX, containerRect.width - bubbleSize - 8));
    const newY = Math.max(8, Math.min(dragStartRef.current.posY + deltaY, containerRect.height - bubbleSize - 8));

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

    // If it was just a tap/click and not a drag, activate blackout!
    if (!dragStartRef.current.hasMoved) {
      if (config.soundFeedback) {
        audioController.playClickSound(340, 0.05);
      }
      if (config.vibrationFeedback) {
        audioController.triggerHaptic(40);
      }
      onActivate();
    } else {
      // Magnetic edge snapping for realism (like AssistiveTouch / Android floating bubble)
      if (containerRef.current && bubbleRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const bubbleSize = bubbleRef.current.offsetWidth || 52;
        const middleX = containerRect.width / 2;
        const snapX = position.x < middleX ? 12 : containerRect.width - bubbleSize - 12;
        setPosition((prev) => ({ ...prev, x: snapX }));
      }
    }
  };

  // If blackout is active, hide the floating bubble so the screen is completely uninterrupted
  if (isBlackoutActive) {
    return null;
  }

  const renderIcon = () => {
    switch (config.bubbleIcon) {
      case 'power':
        return <Power className="w-5 h-5 text-amber-300" />;
      case 'shield':
        return <Shield className="w-5 h-5 text-emerald-400" />;
      case 'eye':
        return <Eye className="w-5 h-5 text-cyan-400" />;
      case 'moon':
      default:
        return <Moon className="w-5 h-5 text-indigo-300 fill-indigo-400/20" />;
    }
  };

  const sizeClass = {
    sm: 'w-11 h-11',
    md: 'w-13 h-13',
    lg: 'w-15 h-15',
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
      className={`absolute z-30 flex items-center justify-center rounded-full cursor-grab active:cursor-grabbing select-none transition-shadow ${sizeClass} ${
        isDragging ? 'scale-105 shadow-2xl ring-2 ring-emerald-400/50' : 'hover:scale-105 shadow-xl'
      }`}
      title="Botón suspensivo flotante: Haz clic para oscurecer o arrástralo"
    >
      {/* Outer pulsing ring like screen recorder floating widget */}
      <span className="absolute -inset-1 rounded-full bg-emerald-500/25 animate-ping opacity-75" />

      {/* Floating Bubble Body */}
      <div className="relative w-full h-full rounded-full bg-neutral-900/90 backdrop-blur-md border border-neutral-700/80 flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.6)] group">
        {/* Subtle status indicator dot */}
        <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />

        {renderIcon()}

        {/* Small tooltip on hover */}
        <div className="absolute left-1/2 -bottom-7 -translate-x-1/2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-neutral-300 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none backdrop-blur-sm border border-neutral-800">
          Toca para oscurecer
        </div>
      </div>
    </div>
  );
};
