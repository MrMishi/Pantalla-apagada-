import React, { useState, useEffect, useRef } from 'react';
import { BlackoutConfig } from '../types';
import { audioController } from '../utils/audio';
import { Sparkles, X, SunDim } from 'lucide-react';

interface BlackoutOverlayProps {
  isActive: boolean;
  config: BlackoutConfig;
  onDeactivate: () => void;
}

interface TouchRipple {
  id: number;
  x: number;
  y: number;
}

export const BlackoutOverlay: React.FC<BlackoutOverlayProps> = ({
  isActive,
  config,
  onDeactivate,
}) => {
  const [clickCount, setClickCount] = useState(0);
  const [hintVisible, setHintVisible] = useState(false);
  const [ripples, setRipples] = useState<TouchRipple[]>([]);
  const [currentTime, setCurrentTime] = useState('');
  const [longPressProgress, setLongPressProgress] = useState(0);

  const clickTimeoutRef = useRef<number | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const longPressIntervalRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ y: number; time: number }>({ y: 0, time: 0 });

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Request fullscreen and prevent screen sleep when blackout is active
  useEffect(() => {
    if (isActive) {
      // Try entering fullscreen on the real device to hide system UI/notches
      try {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else if ((document.documentElement as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
          (document.documentElement as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen().catch(() => {});
        }
      } catch {
        // Ignore
      }
    } else {
      // Exit fullscreen when deactivated
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      } catch {
        // Ignore
      }
    }
  }, [isActive]);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        handleUnlockSuccess();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  if (!isActive) return null;

  const handleUnlockSuccess = () => {
    if (config.soundFeedback) {
      audioController.playWakeSound();
    }
    if (config.vibrationFeedback) {
      audioController.triggerHaptic(60);
    }
    onDeactivate();
  };

  const addRipple = (x: number, y: number) => {
    const newRipple = { id: Date.now() + Math.random(), x, y };
    setRipples((prev) => [...prev.slice(-4), newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  };

  const showTemporaryHint = () => {
    setHintVisible(true);
    setTimeout(() => {
      setHintVisible(false);
    }, 1400);
  };

  // Pointer / Tap Event handler on the real phone screen
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const x = e.clientX;
    const y = e.clientY;

    addRipple(x, y);

    if (config.soundFeedback) {
      audioController.playClickSound(260, 0.03);
    }
    if (config.vibrationFeedback) {
      audioController.triggerHaptic(25);
    }

    touchStartRef.current = { y: e.clientY, time: Date.now() };

    // Gestures logic
    if (config.unlockGesture === 'single_tap') {
      handleUnlockSuccess();
      return;
    }

    if (config.unlockGesture === 'long_press') {
      let progress = 0;
      setLongPressProgress(10);
      longPressIntervalRef.current = window.setInterval(() => {
        progress += 8;
        setLongPressProgress(Math.min(progress, 100));
      }, 100);

      longPressTimerRef.current = window.setTimeout(() => {
        clearInterval(longPressIntervalRef.current!);
        setLongPressProgress(0);
        handleUnlockSuccess();
      }, 1200);
    }

    if (config.unlockGesture === 'double_tap') {
      if (clickCount === 0) {
        setClickCount(1);
        showTemporaryHint();
        if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = window.setTimeout(() => {
          setClickCount(0);
        }, 450);
      } else if (clickCount === 1) {
        // Double tap confirmed!
        if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
        setClickCount(0);
        handleUnlockSuccess();
      }
    }

    if (config.unlockGesture === 'triple_tap') {
      const nextCount = clickCount + 1;
      setClickCount(nextCount);
      showTemporaryHint();
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

      if (nextCount >= 3) {
        setClickCount(0);
        handleUnlockSuccess();
      } else {
        clickTimeoutRef.current = window.setTimeout(() => {
          setClickCount(0);
        }, 500);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (config.unlockGesture === 'long_press') {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      if (longPressIntervalRef.current) {
        clearInterval(longPressIntervalRef.current);
        longPressIntervalRef.current = null;
      }
      setLongPressProgress(0);
    }

    if (config.unlockGesture === 'swipe_up') {
      const deltaY = e.clientY - touchStartRef.current.y;
      if (deltaY < -50) {
        handleUnlockSuccess();
      } else {
        showTemporaryHint();
      }
    }
  };

  const getGestureLabel = () => {
    switch (config.unlockGesture) {
      case 'double_tap':
        return clickCount === 1 ? '¡Toca una vez más para salir!' : 'Toca 2 veces para reactivar tu pantalla';
      case 'triple_tap':
        return `Toca ${3 - clickCount} vez más para salir`;
      case 'single_tap':
        return 'Toca 1 vez para salir';
      case 'long_press':
        return 'Mantén presionado para reactivar';
      case 'swipe_up':
        return 'Desliza hacia arriba para reactivar';
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        backgroundColor: '#000000',
        opacity: config.opacity,
      }}
      className="fixed inset-0 w-screen h-screen z-[999999] flex flex-col items-center justify-between p-6 select-none cursor-pointer transition-opacity duration-200 overflow-hidden"
    >
      {/* Dim Light Filter / Hardware Brightness Simulation */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 120px rgba(0,0,0, ${1 - config.brightnessLevel})`,
        }}
      />

      {/* Subtle Touches Ripple effect to prove touches are registered */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          style={{
            left: `${ripple.x}px`,
            top: `${ripple.y}px`,
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/10 pointer-events-none animate-ping duration-500"
        />
      ))}

      {/* Top emergency discreet escape */}
      <div className="w-full flex items-center justify-between text-[11px] text-neutral-600/40 pt-2 z-10 pointer-events-none">
        <div className="flex items-center gap-1.5 opacity-30">
          <SunDim className="w-3.5 h-3.5" />
          <span>Brillo: {(config.brightnessLevel * 100).toFixed(0)}% (0.001f)</span>
        </div>

        {/* Discreet exit button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleUnlockSuccess();
          }}
          title="Salir del modo pantalla negra"
          className="pointer-events-auto p-2 rounded-full text-neutral-600 hover:text-white hover:bg-neutral-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center Display / Optional AOD or Hint */}
      <div className="flex flex-col items-center justify-center my-auto z-10 text-center pointer-events-none">
        {/* Optional Ambient Always-On Clock (Faint OLED look) */}
        {config.showAodClock && (
          <div className="flex flex-col items-center mb-8 opacity-25">
            <span className="text-6xl font-light tracking-tighter text-neutral-200 font-mono">
              {currentTime}
            </span>
            <span className="text-[11px] text-neutral-400 mt-1 uppercase tracking-widest">
              Modo Stealth OLED Activo
            </span>
          </div>
        )}

        {/* Transient subtle hint that triggers only on interaction */}
        <div
          className={`transition-all duration-200 flex flex-col items-center gap-2 ${
            hintVisible ? 'opacity-90 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className="px-5 py-2.5 rounded-full bg-neutral-900/90 border border-neutral-700/80 backdrop-blur-md shadow-2xl flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-xs text-neutral-200 font-medium">
              {getGestureLabel()}
            </span>
          </div>
        </div>

        {/* Long press circular progress */}
        {config.unlockGesture === 'long_press' && longPressProgress > 0 && (
          <div className="mt-4 w-12 h-12 rounded-full border-2 border-neutral-700 flex items-center justify-center">
            <div
              className="rounded-full bg-emerald-400/50"
              style={{ width: `${longPressProgress}%`, height: `${longPressProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Bottom hint notice */}
      <div className="w-full text-center pb-4 z-10 pointer-events-none">
        <p className="text-[11px] text-neutral-700/70 font-mono">
          {config.unlockGesture === 'double_tap' && 'Doble toque en cualquier lugar para salir'}
          {config.unlockGesture === 'single_tap' && 'Toca para reactivar'}
          {config.unlockGesture === 'triple_tap' && 'Triple toque para salir'}
          {config.unlockGesture === 'long_press' && 'Mantén presionado para reactivar'}
          {config.unlockGesture === 'swipe_up' && 'Desliza hacia arriba para salir'}
        </p>
      </div>
    </div>
  );
};
