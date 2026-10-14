import React from 'react';
import { BlackoutConfig, UnlockGesture } from '../types';
import {
  HandMetal,
  Sun,
  Eye,
  Clock,
  Volume2,
  Vibrate,
  CircleDot,
  Power,
  Moon,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

interface SettingsPanelProps {
  config: BlackoutConfig;
  onChange: (updated: Partial<BlackoutConfig>) => void;
  onTestTrigger: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  config,
  onChange,
  onTestTrigger,
}) => {
  const gestures: { id: UnlockGesture; label: string; desc: string }[] = [
    {
      id: 'double_tap',
      label: 'Doble Toque (Recomendado)',
      desc: 'Toca 2 veces seguidas en cualquier parte de la pantalla oscura para salir.',
    },
    {
      id: 'single_tap',
      label: 'Un solo Toque',
      desc: 'Un toque inmediato reactiva la pantalla.',
    },
    {
      id: 'triple_tap',
      label: 'Triple Toque',
      desc: 'Tres toques rápidos evitan cualquier toque accidental en el bolsillo.',
    },
    {
      id: 'long_press',
      label: 'Pulsación Larga (1.2s)',
      desc: 'Mantén el dedo presionado para reactivar.',
    },
    {
      id: 'swipe_up',
      label: 'Deslizar hacia arriba',
      desc: 'Gesto de deslizar hacia arriba para salir.',
    },
  ];

  return (
    <div className="w-full bg-neutral-900/90 rounded-2xl border border-neutral-800 p-5 space-y-6 shadow-xl backdrop-blur-md">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </span>
          <h2 className="text-base font-bold text-neutral-100">Configuración de Pantalla Negra</h2>
        </div>
        <p className="text-xs text-neutral-400">
          Personaliza los gestos de desbloqueo, el botón flotante y el nivel de opacidad.
        </p>
      </div>

      {/* Gesto de desbloqueo */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
          <HandMetal className="w-3.5 h-3.5 text-indigo-400" />
          <span>Gesto para Desactivar / Quitar la Capa:</span>
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {gestures.map((item) => {
            const isSelected = config.unlockGesture === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChange({ unlockGesture: item.id })}
                className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-neutral-800/90 border-emerald-500/60 ring-1 ring-emerald-500/30 text-white'
                    : 'bg-neutral-950/40 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    <span>{item.label}</span>
                    {isSelected && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                        ACTIVO
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">{item.desc}</div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center ${
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

      {/* Opacidad y Brillo */}
      <div className="space-y-4 pt-3 border-t border-neutral-800">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <label className="flex items-center gap-1.5 font-medium text-neutral-200">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Opacidad de la capa negra:</span>
            </label>
            <span className="font-mono text-emerald-400 font-bold">
              {(config.opacity * 100).toFixed(0)}% {config.opacity >= 0.99 ? '(OLED Puro)' : ''}
            </span>
          </div>
          <input
            type="range"
            min="0.80"
            max="1.0"
            step="0.02"
            value={config.opacity}
            onChange={(e) => onChange({ opacity: parseFloat(e.target.value) })}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
            <span>80% Translúcido</span>
            <span>100% Apagado Total</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <label className="flex items-center gap-1.5 font-medium text-neutral-200">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Brillo simulado de pantalla (screenBrightness):</span>
            </label>
            <span className="font-mono text-amber-300 font-bold">
              {config.brightnessLevel <= 0.01 ? '0.001f (Mínimo)' : `${(config.brightnessLevel * 100).toFixed(0)}%`}
            </span>
          </div>
          <input
            type="range"
            min="0.01"
            max="0.20"
            step="0.01"
            value={config.brightnessLevel}
            onChange={(e) => onChange({ brightnessLevel: parseFloat(e.target.value) })}
            className="w-full accent-amber-400 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
            <span>0.001f Hardware</span>
            <span>20% Luz suave</span>
          </div>
        </div>
      </div>

      {/* Botón flotante estilo */}
      <div className="space-y-2 pt-3 border-t border-neutral-800">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
          <CircleDot className="w-3.5 h-3.5 text-teal-400" />
          <span>Icono del Botón Flotante (Burbuja Suspensiva):</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {(
            [
              { id: 'moon', label: 'Luna', icon: Moon },
              { id: 'power', label: 'Poder', icon: Power },
              { id: 'shield', label: 'Escudo', icon: Shield },
              { id: 'eye', label: 'Sigilo', icon: Eye },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const isSelected = config.bubbleIcon === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChange({ bubbleIcon: item.id })}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs transition-all ${
                  isSelected
                    ? 'bg-neutral-800 border-teal-500/70 text-teal-300 ring-1 ring-teal-500/40'
                    : 'bg-neutral-950/40 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggles extras */}
      <div className="space-y-2.5 pt-3 border-t border-neutral-800 text-xs">
        <label className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-800 cursor-pointer hover:border-neutral-700">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-neutral-200 font-medium">Reloj Tenue AOD (Always-On)</span>
          </div>
          <input
            type="checkbox"
            checked={config.showAodClock}
            onChange={(e) => onChange({ showAodClock: e.target.checked })}
            className="w-4 h-4 accent-emerald-500 rounded"
          />
        </label>

        <label className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-800 cursor-pointer hover:border-neutral-700">
          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-neutral-200 font-medium">Sonido de feedback al tocar</span>
          </div>
          <input
            type="checkbox"
            checked={config.soundFeedback}
            onChange={(e) => onChange({ soundFeedback: e.target.checked })}
            className="w-4 h-4 accent-emerald-500 rounded"
          />
        </label>

        <label className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-800 cursor-pointer hover:border-neutral-700">
          <div className="flex items-center gap-2">
            <Vibrate className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-neutral-200 font-medium">Vibración háptica (móvil)</span>
          </div>
          <input
            type="checkbox"
            checked={config.vibrationFeedback}
            onChange={(e) => onChange({ vibrationFeedback: e.target.checked })}
            className="w-4 h-4 accent-emerald-500 rounded"
          />
        </label>
      </div>

      {/* Quick test button */}
      <button
        onClick={onTestTrigger}
        className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
      >
        <Moon className="w-4 h-4 fill-neutral-950" />
        <span>Activar Pantalla Negra de Prueba</span>
      </button>
    </div>
  );
};
