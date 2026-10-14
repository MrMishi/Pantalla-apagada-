import React, { useState, useRef, useEffect } from 'react';
import {
  BlackoutConfig,
  SimulatedApp,
} from '../types';
import { FloatingBubble } from './FloatingBubble';
import { BlackoutOverlay } from './BlackoutOverlay';
import { audioController } from '../utils/audio';
import {
  Play,
  Pause,
  Music2,
  Sword,
  BatteryCharging,
  Maximize2,
  Minimize2,
  Wifi,
  Signal,
  RotateCcw,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface PhoneSimulatorProps {
  config: BlackoutConfig;
  isBlackoutActive: boolean;
  setIsBlackoutActive: (active: boolean) => void;
  isFullscreen: boolean;
  setIsFullscreen: (fs: boolean) => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  config,
  isBlackoutActive,
  setIsBlackoutActive,
  isFullscreen,
  setIsFullscreen,
}) => {
  const phoneContainerRef = useRef<HTMLDivElement>(null);
  const [activeApp, setActiveApp] = useState<SimulatedApp>('music');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [gameXp, setGameXp] = useState(1420);
  const [gameGold, setGameGold] = useState(890);
  const [clockTime, setClockTime] = useState('');

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClockTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Game XP ticker to demonstrate continuous background processing
  useEffect(() => {
    const interval = setInterval(() => {
      setGameXp((prev) => prev + 15);
      setGameGold((prev) => prev + 5);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const toggleAudio = (play?: boolean) => {
    const targetState = play !== undefined ? play : !isPlayingAudio;
    setIsPlayingAudio(targetState);
    audioController.toggleSimulatedAudio(targetState);
  };

  const handleActivateBlackout = () => {
    setIsBlackoutActive(true);
  };

  const handleDeactivateBlackout = () => {
    setIsBlackoutActive(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Simulator Control Header */}
      <div className="flex items-center justify-between w-full max-w-[400px] mb-3 px-2 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-neutral-300">Simulador Android 14</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Probar en pantalla completa'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? 'Ventana' : 'Pantalla Completa'}</span>
          </button>
        </div>
      </div>

      {/* App Switcher Tabs */}
      <div className="flex items-center justify-center gap-1.5 w-full max-w-[400px] mb-4 bg-neutral-900/80 p-1 rounded-xl border border-neutral-800">
        <button
          onClick={() => setActiveApp('music')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
            activeApp === 'music'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Music2 className="w-3.5 h-3.5 text-rose-400" />
          <span>Música</span>
        </button>
        <button
          onClick={() => setActiveApp('game')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
            activeApp === 'game'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sword className="w-3.5 h-3.5 text-amber-400" />
          <span>Juego</span>
        </button>
        <button
          onClick={() => setActiveApp('dashboard')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
            activeApp === 'dashboard'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ahorro OLED</span>
        </button>
      </div>

      {/* Phone Hardware Chassis */}
      <div
        className={`relative transition-all duration-300 ${
          isFullscreen
            ? 'fixed inset-0 z-40 bg-black flex items-center justify-center w-screen h-screen'
            : 'w-[360px] sm:w-[380px] h-[720px] rounded-[48px] p-3 bg-gradient-to-b from-neutral-800 via-neutral-900 to-neutral-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.08)]'
        }`}
      >
        {/* Device screen viewport */}
        <div
          ref={phoneContainerRef}
          style={{
            filter: isBlackoutActive ? `brightness(${Math.max(0.01, config.brightnessLevel)})` : 'brightness(1)',
          }}
          className={`relative w-full h-full bg-neutral-950 overflow-hidden flex flex-col justify-between transition-all duration-500 ${
            isFullscreen ? 'rounded-none' : 'rounded-[38px] border border-neutral-800/80 shadow-inner'
          }`}
        >
          {/* Top Camera Punch Hole & Android Status Bar */}
          <div className="relative z-20 w-full pt-3 px-6 pb-2 flex items-center justify-between text-[11px] font-medium text-white/90 select-none">
            {/* Clock */}
            <span className="font-semibold tracking-tight">{clockTime}</span>

            {/* Camera Punch Hole */}
            <div className="absolute left-1/2 -translate-x-1/2 top-3 w-4 h-4 rounded-full bg-black ring-2 ring-neutral-800/80 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
            </div>

            {/* Status Icons */}
            <div className="flex items-center gap-1.5 text-white/80">
              {isPlayingAudio && <Volume2 className="w-3 h-3 text-emerald-400 animate-pulse" />}
              <Wifi className="w-3.5 h-3.5" />
              <Signal className="w-3.5 h-3.5" />
              <div className="flex items-center gap-0.5">
                <span className="text-[10px]">98%</span>
                <div className="w-4 h-2 rounded-[2px] border border-white/60 p-0.5 flex items-center">
                  <div className="w-full h-full bg-emerald-400 rounded-[1px]" />
                </div>
              </div>
            </div>
          </div>

          {/* Foreground Active App Simulation Content */}
          <div className="relative flex-1 w-full overflow-hidden flex flex-col">
            {activeApp === 'music' && (
              <div className="flex-1 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-indigo-950/60 via-neutral-950 to-neutral-950 text-white">
                <div className="w-full text-center mt-2">
                  <span className="text-[10px] tracking-widest uppercase font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                    Reproduciendo de Fondo
                  </span>
                  <h3 className="text-xl font-bold mt-3 text-neutral-100">Midnight Study Lo-Fi</h3>
                  <p className="text-xs text-neutral-400">Podcast & Ambient Chill Mix</p>
                </div>

                {/* Vinyl / Cover Art with animated pulse */}
                <div className="relative my-auto flex items-center justify-center">
                  <div
                    className={`w-44 h-44 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-1 shadow-[0_0_40px_rgba(99,102,241,0.25)] flex items-center justify-center transition-all ${
                      isPlayingAudio ? 'animate-[spin_12s_linear_infinite]' : ''
                    }`}
                  >
                    <div className="w-full h-full rounded-full bg-neutral-900 border-4 border-neutral-950 flex items-center justify-center">
                      <Music2 className="w-12 h-12 text-indigo-400" />
                    </div>
                  </div>
                </div>

                {/* Audio controls */}
                <div className="w-full bg-neutral-900/60 backdrop-blur-md p-4 rounded-2xl border border-neutral-800">
                  <div className="w-full h-1 bg-neutral-800 rounded-full mb-3 overflow-hidden">
                    <div
                      className={`h-full bg-indigo-500 rounded-full transition-all duration-300 ${
                        isPlayingAudio ? 'w-2/3' : 'w-1/3'
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-neutral-500">03:42</span>
                    <button
                      onClick={() => toggleAudio()}
                      className="p-3 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30 transition-transform active:scale-95 flex items-center justify-center"
                    >
                      {isPlayingAudio ? (
                        <Pause className="w-5 h-5 fill-white" />
                      ) : (
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      )}
                    </button>
                    <span className="text-[10px] text-neutral-500">12:00</span>
                  </div>

                  <p className="text-[11px] text-center text-neutral-400 mt-2">
                    {isPlayingAudio
                      ? '🔊 Música sonando. Pulsa el botón flotante para verificar que sigue sonando a oscuras.'
                      : 'Pulsa reproducir para probar audio en segundo plano.'}
                  </p>
                </div>
              </div>
            )}

            {activeApp === 'game' && (
              <div className="flex-1 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-amber-950/40 via-neutral-950 to-neutral-950 text-white">
                <div className="w-full text-center mt-2">
                  <span className="text-[10px] tracking-widest uppercase font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    Modo Auto-Farm Activo
                  </span>
                  <h3 className="text-xl font-bold mt-2 text-neutral-100">Dungeon Crawler AFK</h3>
                  <p className="text-xs text-neutral-400">El juego continúa farmeando sin pantalla</p>
                </div>

                {/* Animated Game Character & Stats */}
                <div className="my-auto w-full bg-neutral-900/80 border border-amber-500/20 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                        <Sword className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-neutral-200">Guerrero Nivel 48</div>
                        <div className="text-[10px] text-emerald-400">Batallas ganadas: 1,489</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                      AUTO ON
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-neutral-800">
                    <div className="bg-neutral-950/60 p-2 rounded-xl">
                      <span className="text-[10px] text-neutral-500 uppercase">EXP Ganada</span>
                      <p className="text-base font-bold font-mono text-emerald-400">+{gameXp}</p>
                    </div>
                    <div className="bg-neutral-950/60 p-2 rounded-xl">
                      <span className="text-[10px] text-neutral-500 uppercase">Oro Recogido</span>
                      <p className="text-base font-bold font-mono text-amber-400">{gameGold}g</p>
                    </div>
                  </div>
                </div>

                <div className="w-full bg-neutral-900/50 p-3 rounded-xl border border-neutral-800 text-[11px] text-neutral-400 text-center">
                  🛡️ Protege la pantalla de quemaduras (Burn-in) y ahorra hasta 80% de batería mientras tu juego sube de nivel.
                </div>
              </div>
            )}

            {activeApp === 'dashboard' && (
              <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-emerald-950/30 via-neutral-950 to-neutral-950 text-white">
                <div className="w-full text-center mt-2">
                  <span className="text-[10px] tracking-widest uppercase font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Tecnología OLED Stealth
                  </span>
                  <h3 className="text-xl font-bold mt-2 text-neutral-100">Eficiencia Energética</h3>
                  <p className="text-xs text-neutral-400">Píxeles negros apagados físicamente</p>
                </div>

                <div className="space-y-3 my-auto">
                  <div className="bg-neutral-900/70 p-4 rounded-2xl border border-emerald-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-neutral-300 font-medium">Consumo Pantalla (Normal)</span>
                      <span className="text-xs font-mono text-rose-400 font-bold">~420 mW</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-rose-500" />
                    </div>
                  </div>

                  <div className="bg-neutral-900/70 p-4 rounded-2xl border border-emerald-500/30 shadow-lg shadow-emerald-950/40">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-emerald-300 font-medium">Consumo Blackout OLED (0.001f)</span>
                      <span className="text-xs font-mono text-emerald-400 font-bold">~32 mW (-92%)</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="w-[8%] h-full bg-emerald-400" />
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-900/40 rounded-xl text-[11px] text-neutral-400 space-y-1">
                    <div className="flex items-center gap-1.5 text-neutral-200 font-semibold">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>¿Cómo funciona el apagado visual?</span>
                    </div>
                    <p>
                      En pantallas AMOLED/OLED, cada píxel negro (#000000) no emite fotones de luz. La CPU y las apps permanecen despiertas con <code>FLAG_KEEP_SCREEN_ON</code>.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleActivateBlackout}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Probar Capa Negra Ahora</span>
                </button>
              </div>
            )}
          </div>

          {/* Android Bottom Navigation Pill */}
          <div className="relative z-20 w-full py-2.5 flex items-center justify-center select-none pointer-events-none">
            <div className="w-28 h-1 rounded-full bg-neutral-600/80" />
          </div>

          {/* THE FLOATING BUBBLE (Botón suspensivo arriba sobre la app) */}
          <FloatingBubble
            config={config}
            onActivate={handleActivateBlackout}
            containerRef={phoneContainerRef}
            isBlackoutActive={isBlackoutActive}
          />

          {/* THE BLACKOUT OVERLAY (Capa negra total con brillo mínimo y desbloqueo por gestos) */}
          <BlackoutOverlay
            isActive={isBlackoutActive}
            config={config}
            onDeactivate={handleDeactivateBlackout}
            isFullscreen={isFullscreen}
          />
        </div>
      </div>
    </div>
  );
};
