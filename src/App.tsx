import React, { useState, useEffect } from 'react';
import { BlackoutConfig } from './types';
import { PhoneSimulator } from './components/PhoneSimulator';
import { SettingsPanel } from './components/SettingsPanel';
import { AndroidCodeViewer } from './components/AndroidCodeViewer';
import { GuideSection } from './components/GuideSection';
import { wakeLockManager } from './utils/wakeLock';
import {
  Moon,
  Smartphone,
  Code2,
  BookOpen,
  Maximize2,
  Minimize2,
  Sparkles,
  Zap,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'guide'>('simulator');
  const [isBlackoutActive, setIsBlackoutActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [config, setConfig] = useState<BlackoutConfig>({
    opacity: 0.98,
    brightnessLevel: 0.01,
    unlockGesture: 'double_tap',
    showAodClock: false,
    soundFeedback: true,
    vibrationFeedback: true,
    bubbleSize: 'md',
    bubbleIcon: 'moon',
    keepScreenOn: true,
  });

  // Handle WakeLock when blackout is active
  useEffect(() => {
    if (isBlackoutActive && config.keepScreenOn) {
      wakeLockManager.request();
    } else {
      wakeLockManager.release();
    }
  }, [isBlackoutActive, config.keepScreenOn]);

  const handleConfigChange = (updated: Partial<BlackoutConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleTestTrigger = () => {
    setIsBlackoutActive(true);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-neutral-950 font-bold">
              <Moon className="w-5 h-5 fill-neutral-950" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>Blackout Screen</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium hidden sm:inline-block">
                  Android Native & Overlay
                </span>
              </h1>
              <p className="text-[11px] text-neutral-400 hidden sm:block">
                Capa negra con brillo mínimo, botón flotante suspensivo y doble toque para salir
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'simulator'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simulador</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'code'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Código Kotlin</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'guide'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Guía</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Banner with brief instructions */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900/80 to-neutral-900 border border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-neutral-200">
                Pruébalo en vivo: Toca la burbuja flotante para oscurecer la pantalla.
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Para desactivarla, haz <strong className="text-emerald-400">doble toque</strong> en la pantalla negra (o pulsa Escape / botón de salida).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors border border-neutral-700"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isFullscreen ? 'Salir Fullscreen' : 'Probar Pantalla Completa'}</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Phone Simulator */}
            <div className="lg:col-span-6 xl:col-span-7 flex justify-center">
              <PhoneSimulator
                config={config}
                isBlackoutActive={isBlackoutActive}
                setIsBlackoutActive={setIsBlackoutActive}
                isFullscreen={isFullscreen}
                setIsFullscreen={setIsFullscreen}
              />
            </div>

            {/* Right: Controls & Parameters */}
            <div className="lg:col-span-6 xl:col-span-5 space-y-4">
              <SettingsPanel
                config={config}
                onChange={handleConfigChange}
                onTestTrigger={handleTestTrigger}
              />

              {/* Quick info card */}
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-neutral-300">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  <span>Comportamiento en Android Nativo:</span>
                </div>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  El botón flotante utiliza el permiso <code>SYSTEM_ALERT_WINDOW</code> para mantenerse sobre cualquier app (YouTube, videojuegos, grabadoras). La actividad de pantalla negra utiliza <code>FLAG_KEEP_SCREEN_ON</code> y fija <code>screenBrightness = 0.001f</code>, simulando el apagado sin suspender la actividad del procesador.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('code')}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4 flex items-center gap-1"
                  >
                    <span>Ver código Kotlin completo y descargar proyecto &rarr;</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-6">
            <AndroidCodeViewer />
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-6">
            <GuideSection />
          </div>
        )}
      </main>
    </div>
  );
}
