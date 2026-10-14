import React from 'react';
import {
  HelpCircle,
  Smartphone,
  EyeOff,
  Flame,
  Radio,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  PlaySquare,
  Lock,
} from 'lucide-react';

export const GuideSection: React.FC = () => {
  return (
    <div className="w-full space-y-6">
      {/* Step by step flow requested by user */}
      <div className="bg-neutral-900/90 rounded-2xl border border-neutral-800 p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-4">
          <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Radio className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white">Flujo Completo de la Aplicación</h3>
            <p className="text-xs text-neutral-400">
              Resumen visual de cómo interactúa el usuario y el sistema operativo Android.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">
                Paso 1: Activación
              </span>
              <h4 className="text-xs font-bold text-neutral-200 mt-2">Burbuja Suspensiva Flotante</h4>
              <p className="text-[11px] text-neutral-400 mt-1">
                Queda fijada arriba en la pantalla como el widget de grabación de pantalla de Android. Se puede mover arrastrándola o tocarla en cualquier instante mientras ves un video o juegas.
              </p>
            </div>
            <div className="mt-3 text-[10px] text-emerald-300 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>1 toque en la burbuja = Modo Blackout</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded">
                Paso 2: Modo Oscuro Activo
              </span>
              <h4 className="text-xs font-bold text-neutral-200 mt-2">Capa Negra & Brillo al 0.001f</h4>
              <p className="text-[11px] text-neutral-400 mt-1">
                La pantalla parece 100% apagada para cualquiera que la mire. La CPU sigue despierta (FLAG_KEEP_SCREEN_ON), el audio sigue sonando y los toques siguen siendo procesados.
              </p>
            </div>
            <div className="mt-3 text-[10px] text-amber-300 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ahorra hasta ~90% de batería en OLED</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded">
                Paso 3: Desactivación
              </span>
              <h4 className="text-xs font-bold text-neutral-200 mt-2">Doble Toque para Salir</h4>
              <p className="text-[11px] text-neutral-400 mt-1">
                Para quitarla y restaurar la pantalla, el usuario pulsa dos veces seguidas en cualquier punto del cristal. La actividad se cierra y devuelve el brillo original instantáneamente.
              </p>
            </div>
            <div className="mt-3 text-[10px] text-indigo-300 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Desbloqueo háptico con vibración</span>
            </div>
          </div>
        </div>
      </div>

      {/* Installation steps for Android Studio */}
      <div className="bg-neutral-900/90 rounded-2xl border border-neutral-800 p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-4">
          <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Smartphone className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white">Guía para Instalar y Compilar en Android Studio</h3>
            <p className="text-xs text-neutral-400">
              Instrucciones sencillas para compilar el proyecto en tu propio dispositivo.
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-neutral-300">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <span className="w-5 h-5 rounded-full bg-neutral-800 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              1
            </span>
            <div>
              <p className="font-semibold text-white">Descarga el archivo ZIP del proyecto</p>
              <p className="text-neutral-400 text-[11px] mt-0.5">
                Usa el botón "Descargar ZIP Proyecto" en la pestaña de Código Android. Descomprímelo en tu computadora.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <span className="w-5 h-5 rounded-full bg-neutral-800 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              2
            </span>
            <div>
              <p className="font-semibold text-white">Abre en Android Studio</p>
              <p className="text-neutral-400 text-[11px] mt-0.5">
                Selecciona <code>File &gt; Open...</code> y elige la carpeta descomprimida. Espera a que Gradle sincronice las dependencias automáticamente.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <span className="w-5 h-5 rounded-full bg-neutral-800 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              3
            </span>
            <div>
              <p className="font-semibold text-white">Otorga el Permiso de Superposición</p>
              <p className="text-neutral-400 text-[11px] mt-0.5">
                Al abrir la app por primera vez en tu teléfono, te llevará a Ajustes &gt; <em>"Aparecer encima de otras aplicaciones"</em>. Actívalo para que la burbuja flotante pueda situarse sobre YouTube, juegos o cualquier app.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <span className="w-5 h-5 rounded-full bg-neutral-800 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              4
            </span>
            <div>
              <p className="font-semibold text-white">¡Listo para usar!</p>
              <p className="text-neutral-400 text-[11px] mt-0.5">
                Presiona "Activar Botón Flotante". Aparecerá la burbuja en pantalla. Ve a cualquier app, toca la burbuja y la pantalla se volverá totalmente negra. Con un doble toque en cualquier parte, regresa a la normalidad.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* GitHub Actions & Capacitor Automation Card */}
      <div className="bg-neutral-900/90 rounded-2xl border border-neutral-800 p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-4">
          <span className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Sliders className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white">Compilación Automática de APK en GitHub Actions (Capacitor)</h3>
            <p className="text-xs text-neutral-400">
              Pipeline de integración continua (CI) configurado en <code>.github/workflows/build-apk.yml</code>.
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-neutral-300">
          <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800">
            <h4 className="font-semibold text-teal-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Configuración Lista en el Repositorio</span>
            </h4>
            <ul className="mt-2 space-y-1.5 text-[11px] text-neutral-400 list-disc list-inside">
              <li><strong>Capacitor v7:</strong> <code>@capacitor/core</code>, <code>@capacitor/cli</code> y <code>@capacitor/android</code> instalados.</li>
              <li><strong>capacitor.config.json:</strong> Configurado con <code>"webDir": "dist"</code>, <code>"appId": "com.blackoutscreen.app"</code> y <code>"androidScheme": "https"</code>.</li>
              <li><strong>Workflow GitHub Actions:</strong> Configurado en <code>.github/workflows/build-apk.yml</code> listo para compilar en cada <code>push</code> a <code>main</code> o vía <code>workflow_dispatch</code>.</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800">
            <h4 className="font-semibold text-white">¿Cómo descargar el APK compilado en GitHub?</h4>
            <ol className="mt-2 space-y-1.5 text-[11px] text-neutral-400 list-decimal list-inside">
              <li>Sube los cambios a tu repositorio de GitHub (en la rama <code>main</code>).</li>
              <li>Ve a la pestaña <strong>Actions</strong> en GitHub.</li>
              <li>Selecciona el workflow <strong>"Build Android APK"</strong> (se ejecuta automáticamente o haz clic en <em>Run workflow</em>).</li>
              <li>Al finalizar con éxito, en la sección <strong>Artifacts</strong> encontrarás <strong>app-debug.apk</strong> listo para descargar e instalar en tu celular.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
