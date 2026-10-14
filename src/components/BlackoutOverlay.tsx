import React, { useState, useEffect, useRef } from 'react';
import { BlackoutConfig } from '../types';
import { audioController } from '../utils/audio';
import { Sparkles } from 'lucide-react';
import { StatusBar } from '@capacitor/status-bar';

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

  // Update clock for AOD
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

  // Control Android Status Bar and Hardware Fullscreen
  useEffect(() => {
    const enterFullscreenAndHideBars = async () => {
      if (isActive) {
        // 1. Hide Android Status Bar (clock, battery, wifi, notifications)
        try {
          await StatusBar.hide();
          await StatusBar.setBackgroundColor({ color: '#000000' });
        } catch {
          // Fallback if not on native device
        }

        // 2. Request true hardware fullscreen to cover notches and edges
        try {
          const docEl = document.documentElement as HTMLElement & {
            webkitRequestFullscreen?: () => Promise<void>;
            mozRequestFullScreen?: () => Promise<void>;
            msRequestFullscreen?: () => Promise<void>;
          };
          if (docEl.requestFullscreen) {
            await docEl.requestFullscreen();
          } else if (docEl.webkitRequestFullscreen) {
            await docEl.webkitRequestFullscreen();
          }
        } catch {
          // Ignore
        }

        // 3. Ensure HTML and Body are pitch black
        document.documentElement.style.backgroundColor = '#000000';
        document.body.style.backgroundColor = '#000000';
      } else {
        // Exit fullscreen and restore Status Bar
        try {
          await StatusBar.show();
        } catch {
          // Ignore
        }

        try {
          const doc = document as Document & {
            webkitExitFullscreen?: () => Promise<void>;
            mozCancelFullScreen?: () => Promise<void>;
            msExitFullscreen?: () => Promise<void>;
          };
          if (document.fullscreenElement && doc.exitFullscreen) {
            await doc.exitFullscreen();
          } else if (doc.webkitExitFullscreen) {
            await doc.webkitExitFullscreen();
          }
        } catch {
          // Ignore
        }
      }
    };

    enterFullscreenAndHideBars();
  }, [isActive]);

  // Keyboard Escape listener for emergency
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
    setRipples((prev) => [...prev.slice(-3), newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 500);
  };

  const showTemporaryHint = () => {
    setHintVisible(true);
    setTimeout(() => {
      setHintVisible(false);
    }, 1300);
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
        return clickCount === 1 ? '¡Toca una vez más para salir!' : 'Toca 2 veces para reactivar pantalla';
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
      className="fixed -inset-10 w-[120vw] h-[120vh] z-[9999999] flex flex-col items-center justify-between p-8 select-none cursor-pointer overflow-hidden touch-none"
    >
      {/* 100% Pitch black background layer with no visible borders */}
      <div className="absolute inset-0 bg-black pointer-events-none" />

      {/* Subtle Touches Ripple effect */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          style={{
            left: `${ripple.x + 20}px`,
            top: `${ripple.y + 20}px`,
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/10 pointer-events-none animate-ping duration-500"
        />
      ))}

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
          <div className="px-5 py-2.5 rounded-full bg-neutral-900/95 border border-neutral-700/80 backdrop-blur-md shadow-2xl flex items-center gap-2">
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
      <div className="w-full text-center pb-6 z-10 pointer-events-none">
        <p className="text-[11px] text-neutral-800/80 font-mono select-none">
          {config.unlockGesture === 'double_tap' && 'Doble toque para salir'}
          {config.unlockGesture === 'single_tap' && 'Toca para salir'}
          {config.unlockGesture === 'triple_tap' && 'Triple toque para salir'}
          {config.unlockGesture === 'long_press' && 'Mantén presionado para salir'}
          {config.unlockGesture === 'swipe_up' && 'Desliza hacia arriba para salir'}
        </p>
      </div>
    </div>
  );
};
