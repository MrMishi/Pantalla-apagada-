import React, { useState } from 'react';
import { ANDROID_FILES } from '../data/androidSourceCode';
import {
  Copy,
  Check,
  Download,
  FileCode2,
  FolderArchive,
  Info,
  Terminal,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import JSZip from 'jszip';

export const AndroidCodeViewer: React.FC = () => {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const currentFile = ANDROID_FILES[activeFileIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Root files
      zip.file(
        'README.md',
        `# Blackout Screen Android Project

Esta aplicación Android implementa:
1. Una burbuja flotante tipo grabador de pantalla que se mantiene encima de todas las aplicaciones ('TYPE_APPLICATION_OVERLAY').
2. Al tocarla, abre 'BlackoutActivity' con una capa negra que simula un apagado total.
3. Brillo de pantalla fijado al mínimo absoluto (0.001f).
4. El dispositivo NO entra en suspensión y mantiene la CPU despierta gracias a 'FLAG_KEEP_SCREEN_ON'.
5. Al hacer DOBLE TOQUE (o el gesto configurado) en cualquier lugar de la pantalla oscura, la actividad se finaliza y el brillo se restaura inmediatamente.

## Requisitos
- Android Studio Iguana / Jellyfish / Ladybug o superior.
- Dispositivo Android con versión 8.0 (API 26) o superior.
- Conceder el permiso especial de "Mostrar sobre otras aplicaciones" en Ajustes.`
      );

      // Add each code file in the proper path
      ANDROID_FILES.forEach((file) => {
        zip.file(file.path, file.content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'BlackoutScreen_Android_Project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="w-full bg-neutral-900/95 rounded-2xl border border-neutral-800 overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-neutral-950/80 border-b border-neutral-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Código Nativo Android (Kotlin & XML)</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                API 34 Ready
              </span>
            </h2>
            <p className="text-xs text-neutral-400">
              Archivos completos para importar directamente en Android Studio.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors border border-neutral-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '¡Copiado!' : 'Copiar Archivo'}</span>
          </button>

          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            {downloadSuccess ? (
              <Check className="w-4 h-4" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isZipping ? 'Comprimiendo...' : downloadSuccess ? '¡Descargado!' : 'Descargar ZIP Proyecto'}</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center overflow-x-auto p-2 bg-neutral-950/40 border-b border-neutral-800 gap-1.5 scrollbar-thin">
        {ANDROID_FILES.map((file, idx) => (
          <button
            key={file.name}
            onClick={() => setActiveFileIndex(idx)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
              activeFileIndex === idx
                ? 'bg-neutral-800 text-emerald-300 font-semibold border border-neutral-700 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{file.name}</span>
          </button>
        ))}
      </div>

      {/* File Description bar */}
      <div className="px-4 py-2 bg-neutral-900/60 border-b border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
        <span className="font-mono text-[11px] text-neutral-300">{currentFile.path}</span>
        <span className="text-[11px] italic text-neutral-400">{currentFile.description}</span>
      </div>

      {/* Code Editor Preview */}
      <div className="relative max-h-[460px] overflow-y-auto p-4 bg-neutral-950 font-mono text-xs text-neutral-200 leading-relaxed scrollbar-thin">
        <pre className="whitespace-pre">
          <code>{currentFile.content}</code>
        </pre>
      </div>

      {/* Educational Guide Explanations (How it works in Android) */}
      <div className="p-4 bg-neutral-950/70 border-t border-neutral-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center gap-2 font-bold text-emerald-400 mb-1">
            <Smartphone className="w-4 h-4" />
            <span>1. Brillo Mínimo (0.001f)</span>
          </div>
          <p className="text-neutral-400 text-[11px]">
            <code>window.attributes.screenBrightness = 0.001f</code> ajusta la retroiluminación física al nivel más bajo posible sin apagar la GPU, permitiendo que la app siga interactuando.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center gap-2 font-bold text-amber-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>2. Sin Suspensión (Keep Screen On)</span>
          </div>
          <p className="text-neutral-400 text-[11px]">
            <code>FLAG_KEEP_SCREEN_ON</code> evita que Android apague la CPU ni cierre YouTube, videojuegos o grabaciones. La pantalla parece apagada pero todo sigue activo.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center gap-2 font-bold text-indigo-400 mb-1">
            <Terminal className="w-4 h-4" />
            <span>3. Burbuja Flotante Suspensiva</span>
          </div>
          <p className="text-neutral-400 text-[11px]">
            <code>TYPE_APPLICATION_OVERLAY</code> crea el botón flotante arrastrable sobre cualquier aplicación. Con un solo toque abre la capa oscura instantáneamente.
          </p>
        </div>
      </div>
    </div>
  );
};
