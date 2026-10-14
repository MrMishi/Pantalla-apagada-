import React, { useState, useEffect } from 'react';
import { BlackoutConfig, UnlockGesture } from './types';
import { FloatingBubble } from './components/FloatingBubble';
import { BlackoutOverlay } from './components/BlackoutOverlay';
import { AndroidCodeViewer } from './components/AndroidCodeViewer';
import { GuideSection } from './components/GuideSection';
import { audioController } from './utils/audio';
import { wakeLockManager } from './utils/wakeLock';
import { nativeOverlayService } from './utils/nativeOverlay';
import {
  Moon,
  Power,
  Play,
  Pause,
  Music2,
  Volume2,
  HandMetal,
  Layers,
  Sun,
  Clock,
  Vibrate,
  ShieldCheck,
  Zap,
  Code2,
  BookOpen,
  Smartphone,
  CheckCircle2,
  Radio,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'device' | 'code' | 'guide'>('device');
  const [isBlackoutActive, setIsBlackoutActive] = useState(false);
  const [showWebBubble, setShowWebBubble] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Native Floating Service state
  const [isNativeServiceRunning, setIsNativeServiceRunning] = useState(false);
  const [nativePermissionGranted, setNativePermissionGranted] = useState(false);
  const [serviceMessage, setServiceMessage] = useState<string | null>(null);

  const [config, setConfig] = useState<BlackoutConfig>({
    opacity: 1.0,
    brightnessLevel: 0.01,
    unlockGesture: 'double_tap',
    showAodClock: false,
    soundFeedback: true,
    vibrationFeedback: true,
    bubbleSize: 'md',
    bubbleIcon: 'moon',
    keepScreenOn: true,
  });

  // Check native permission on load
  useEffect(() => {
    const checkNative = async () => {
      const granted = await nativeOverlayService.checkPermission();
      setNativePermissionGranted(granted);
    };
    checkNative();
  }, []);

  // Screen WakeLock when blackout is active
  useEffect(() => {
    if (isBlackoutActive && config.keepScreenOn) {
      wakeLockManager.request();
    } else {
      wakeLockManager.release();
    }
  }, [isBlackoutActive, config.keepScreenOn]);

  const handleStartNativeFloatingService = async () => {
    const granted = await nativeOverlayService.checkPermission();
    if (!granted) {
      setServiceMessage('Solicitando permiso "Aparecer encima de otras apps"...');
      await nativeOverlayService.requestPermission();
      setTimeout(async () => {
        const recheck = await nativeOverlayService.checkPermission();
        setNativePermissionGranted(recheck);
        if (recheck) {
          await nativeOverlayService.startService();
          setIsNativeServiceRunning(true);
          setServiceMessage('¡Burbuja activada! Ya puedes abrir YouTube Music.');
        }
      }, 1500);
      return;
    }

    const ok = await nativeOverlayService.startService();
    if (ok) {
      setIsNativeServiceRunning(true);
      setServiceMessage('¡Burbuja activada sobre otras apps! Ahora abre YouTube Music.');
    } else {
      // If running on web preview or fallback, use web floating bubble
      setShowWebBubble(true);
      setServiceMessage('Burbuja flotante activa en pantalla.');
    }
  };

  const handleStopNativeFloatingService = async () => {
    await nativeOverlayService.stopService();
    setIsNativeServiceRunning(false);
    setServiceMessage('Burbuja flotante detenida.');
  };

  const handleActivateBlackout = () => {
    if (config.soundFeedback) {
      audioController.playClickSound(300, 0.05);
    }
    if (config.vibrationFeedback) {
      audioController.triggerHaptic(40);
    }
    setIsBlackoutActive(true);
  };

  const handleDeactivateBlackout = () => {
    setIsBlackoutActive(false);
  };

  const toggleAudio = () => {
    const nextState = !isPlayingAudio;
    setIsPlayingAudio(nextState);
    audioController.toggleSimulatedAudio(nextState);
  };

  const gestures: { id: UnlockGesture; label: string; desc: string }[] = [
    {
      id: 'double_tap',
      label: 'Doble Toque (Recomendado)',
      desc: 'Toca 2 veces seguidas en cualquier punto de tu pantalla negra para reactivarla.',
    },
    {
      id: 'single_tap',
      label: 'Un Toque',
      desc: 'Un solo toque en la pantalla negra reactiva el teléfono.',
    },
    {
      id: 'triple_tap',
      label: 'Triple Toque',
      desc: 'Tres toques seguidos evitan toques accidentales en el bolsillo.',
    },
    {
      id: 'long_press',
      label: 'Pulsación Larga (1.2s)',
      desc: 'Mantén presionado con el dedo para reactivar.',
    },
    {
      id: 'swipe_up',
      label: 'Deslizar hacia arriba',
      desc: 'Desliza el dedo hacia arriba para salir.',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300 pb-16">
      {/* Top Mobile App Header */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-xl px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-neutral-950 shadow-md shadow-emerald-500/20">
              <Moon className="w-4 h-4 fill-neutral-950" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
                <span>Blackout Screen</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h1>
              <p className="text-[10px] text-neutral-400">Modo Pantalla Negra & YouTube</p>
            </div>
          </div>

          {/* Navigation Mode */}
          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs">
            <button
              onClick={() => setActiveTab('device')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                activeTab === 'device'
                  ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mi Teléfono</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                activeTab === 'code'
                  ? 'bg-neutral-800 text-indigo-400 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Código</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                activeTab === 'guide'
                  ? 'bg-neutral-800 text-amber-400 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guía</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto px-4 pt-5 space-y-5">
        {activeTab === 'device' && (
          <>
            {/* SPECIAL CARD: FLOATING BUBBLE OVER YOUTUBE MUSIC */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-indigo-950/40 via-neutral-900 to-neutral-950 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Radio className="w-5 h-5 animate-pulse" />
                </span>
                <div>
                  <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>Botón Flotante sobre YouTube Music</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                      OVERLAY NATIVO
                    </span>
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Aparece sobre YouTube o cualquier app sin cerrarla.
                  </p>
                </div>
              </div>

              <div className="p-3.5 my-3 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-300 space-y-2">
                <p>
                  🎵 <strong>Para escuchar YouTube Music con la pantalla oscura:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-neutral-400 text-[11px]">
                  <li>Presiona <strong>"Activar Burbuja sobre YouTube"</strong> abajo.</li>
                  <li>Abre <strong>YouTube Music</strong> y dale Play a tus canciones.</li>
                  <li>Toca la burbuja flotante que estará en tu pantalla: <strong>toda la pantalla se apagará (#000000)</strong> sin pausar la música.</li>
                  <li>Para reactivar la pantalla, haz <strong>doble toque</strong> en el cristal.</li>
                </ol>
              </div>

              {serviceMessage && (
                <div className="p-3 mb-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{serviceMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleStartNativeFloatingService}
                  className="py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <Radio className="w-4 h-4" />
                  <span>{isNativeServiceRunning ? 'Burbuja Flotando Activa' : 'Activar Burbuja sobre YouTube'}</span>
                </button>

                <button
                  onClick={handleStopNativeFloatingService}
                  className="py-3.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 border border-neutral-700 active:scale-95 transition-all"
                >
                  <Power className="w-4 h-4 text-rose-400" />
                  <span>Detener Burbuja Flotante</span>
                </button>
              </div>
            </div>

            {/* DIRECT ACTION: BLACKOUT SCREEN NOW */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 shadow-2xl relative overflow-hidden text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Prueba Inmediata en este Dispositivo</span>
              </span>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
                Oscurecer Pantalla Ahora
              </h2>
              <p className="text-xs text-neutral-400 max-w-md mx-auto mb-5">
                Pon a oscuras la pantalla ahora mismo. Se ocultan notificaciones, batería y wifi. Doble toque para reactivar.
              </p>

              {/* GIANT PRIMARY ACTION BUTTON */}
              <button
                onClick={handleActivateBlackout}
                className="w-full max-w-sm mx-auto py-5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-black text-base tracking-wide flex items-center justify-center gap-3 shadow-[0_10px_35px_rgba(16,185,129,0.35)] active:scale-[0.98] transition-all"
              >
                <Power className="w-6 h-6 stroke-[2.5]" />
                <span>PROBAR PANTALLA NEGRA AQUÍ</span>
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-neutral-500 mt-4">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  No suspende apps
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Ahorro OLED ~90%
                </span>
              </div>
            </div>

            {/* UNLOCK GESTURE SELECTOR */}
            <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <HandMetal className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">¿Cómo reactivar la pantalla negra?</h3>
                  <p className="text-[11px] text-neutral-400">
                    Gesto configurado para salir del modo oscuro.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-1">
                {gestures.map((item) => {
                  const isSelected = config.unlockGesture === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setConfig((prev) => ({ ...prev, unlockGesture: item.id }))}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-neutral-800/90 border-emerald-500 text-white shadow-md'
                          : 'bg-neutral-950/40 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-neutral-200">{item.label}</div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">{item.desc}</div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
                          isSelected ? 'border-emerald-400 bg-emerald-500' : 'border-neutral-600'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CONTINUOUS AUDIO TEST CARD */}
            <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <Music2 className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Prueba de Audio en Segundo Plano</h3>
                    <p className="text-[11px] text-neutral-400">
                      Simula la reproducción continua de YouTube Music.
                    </p>
                  </div>
                </div>

                <button
                  onClick={toggleAudio}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    isPlayingAudio
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-white" />
                      <span>Pausar</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Reproducir</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 text-[11px] text-neutral-400 flex items-center gap-2">
                <Volume2 className={`w-4 h-4 shrink-0 ${isPlayingAudio ? 'text-emerald-400 animate-pulse' : 'text-neutral-500'}`} />
                <span>
                  {isPlayingAudio
                    ? '🔊 Música sonando. Activa la pantalla negra para comprobar que el audio continúa sin pausas.'
                    : 'Dale reproducir para probar audio continuo sin interrupción de pantalla.'}
                </span>
              </div>
            </div>

            {/* QUICK PREFERENCES */}
            <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-4">
              <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Ajustes Visuales & Hápticos
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5 text-neutral-200 font-medium">
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                      Opacidad de la capa negra
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">100% (Negro OLED Absoluto)</span>
                  </div>
                  <input
                    type="range"
                    min="0.85"
                    max="1.0"
                    step="0.01"
                    value={config.opacity}
                    onChange={(e) => setConfig((prev) => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                    className="w-full accent-emerald-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="pt-2 border-t border-neutral-800 space-y-2">
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-800/80 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Vibrate className="w-4 h-4 text-emerald-400" />
                      <span className="text-neutral-200 font-medium">Vibración háptica al desbloquear</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.vibrationFeedback}
                      onChange={(e) => setConfig((prev) => ({ ...prev, vibrationFeedback: e.target.checked }))}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-800/80 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <span className="text-neutral-200 font-medium">Reloj tenue AOD (Always-On Display)</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.showAodClock}
                      onChange={(e) => setConfig((prev) => ({ ...prev, showAodClock: e.target.checked }))}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                  </label>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tab 2: Kotlin Native Code & GitHub Actions */}
        {activeTab === 'code' && (
          <div className="space-y-4">
            <AndroidCodeViewer />
          </div>
        )}

        {/* Tab 3: Guide & Tutorial */}
        {activeTab === 'guide' && (
          <div className="space-y-4">
            <GuideSection />
          </div>
        )}
      </main>

      {/* WEB FLOATING BUBBLE (Preview / in-app) */}
      <FloatingBubble
        config={config}
        onActivate={handleActivateBlackout}
        isBlackoutActive={isBlackoutActive}
        visible={showWebBubble}
      />

      {/* BLACKOUT OVERLAY */}
      <BlackoutOverlay
        isActive={isBlackoutActive}
        config={config}
        onDeactivate={handleDeactivateBlackout}
      />
    </div>
  );
}
