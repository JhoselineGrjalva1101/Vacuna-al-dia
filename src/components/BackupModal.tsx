import React, { useRef, useState } from 'react';
import { Pet } from '../types/pet';
import { exportPetsToJSONFile, importPetsFromJSONFile } from '../utils/storage';
import { 
  X, 
  Download, 
  Upload, 
  Trash2, 
  HardDrive, 
  ShieldCheck, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  pets: Pet[];
  onClose: () => void;
  onRestorePets: (pets: Pet[]) => void;
  onClearStorage: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  pets,
  onClose,
  onRestorePets,
  onClearStorage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const totalVaccines = pets.reduce((acc, p) => acc + p.vaccines.length, 0);
  const totalClinical = pets.reduce((acc, p) => acc + (p.clinicalRecords?.length || 0), 0);

  const handleExport = () => {
    exportPetsToJSONFile(pets);
    setNotification({
      message: '¡Copia de seguridad guardada con éxito en tu dispositivo!',
      type: 'success',
    });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const restored = await importPetsFromJSONFile(file);
      onRestorePets(restored);
      setNotification({
        message: `¡Se recuperaron ${restored.length} mascotas con sus vacunas e historial!`,
        type: 'success',
      });
      setTimeout(() => {
        setNotification(null);
        onClose();
      }, 1500);
    } catch {
      setNotification({
        message: 'No pudimos leer el archivo. Asegúrate de seleccionar el archivo de respaldo correcto.',
        type: 'error',
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClear = () => {
    const confirmText = window.prompt(
      '¿Estás seguro de que deseas borrar los datos de este celular? Escribe BORRAR para confirmar:'
    );
    if (confirmText === 'BORRAR') {
      onClearStorage();
      setNotification({
        message: 'Todos los datos fueron borrados correctamente de este dispositivo.',
        type: 'success',
      });
      setTimeout(() => {
        setNotification(null);
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 border-2 border-slate-400 animate-in fade-in duration-150">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center border-2 border-blue-300">
              <HardDrive className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-950 leading-tight">
                Copia de Seguridad
              </h2>
              <p className="text-base text-slate-700">
                Guardado en este dispositivo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 min-h-[48px] min-w-[48px] flex items-center justify-center"
            aria-label="Cerrar ventana"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mensajes de notificación en español claro */}
        {notification && (
          <div
            className={`p-4 rounded-xl text-base font-bold flex items-center gap-2 border-2 ${
              notification.type === 'success'
                ? 'bg-emerald-100 border-emerald-600 text-emerald-950'
                : 'bg-rose-100 border-rose-600 text-rose-950'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-800 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-rose-800 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Resumen de Datos Locales */}
        <div className="bg-slate-100 p-4 rounded-2xl border-2 border-slate-300 space-y-2 text-base">
          <div className="flex items-center justify-between font-black text-slate-950">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-800" />
              Estado actual:
            </span>
            <span className="text-emerald-950 bg-emerald-200 px-2.5 py-0.5 rounded-lg border border-emerald-400 font-extrabold">
              Guardado automático
            </span>
          </div>
          <p className="text-slate-800 font-medium">
            • <strong>{pets.length}</strong> mascotas guardadas
          </p>
          <p className="text-slate-800 font-medium">
            • <strong>{totalVaccines}</strong> vacunas registradas
          </p>
          <p className="text-slate-800 font-medium">
            • <strong>{totalClinical}</strong> visitas en historial clínico
          </p>
        </div>

        {/* Acciones de Respaldo */}
        <div className="space-y-3 pt-1">
          {/* ÚNICO BOTÓN PRINCIPAL DE ESTA PANTALLA (Requisito 4) */}
          <button
            onClick={handleExport}
            className="w-full py-4 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white text-base font-black transition-all shadow-md flex items-center justify-center gap-2 min-h-[52px]"
          >
            <Download className="w-6 h-6" />
            <span>Descargar archivo de respaldo</span>
          </button>

          {/* Botón secundario para importar */}
          <div>
            <label htmlFor="restore-file-input" className="sr-only">
              Seleccionar archivo de respaldo para restaurar
            </label>
            <input
              id="restore-file-input"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json,application/json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3.5 px-4 rounded-xl border-2 border-slate-700 bg-white hover:bg-slate-100 text-slate-900 text-base font-bold transition-colors flex items-center justify-center gap-2 min-h-[50px]"
            >
              <Upload className="w-5 h-5 text-blue-800" />
              <span>Restaurar desde archivo de respaldo</span>
            </button>
          </div>

          {/* Botón secundario para borrar */}
          <button
            onClick={handleClear}
            className="w-full py-3 px-4 rounded-xl text-rose-800 hover:bg-rose-50 border-2 border-transparent hover:border-rose-300 text-base font-bold transition-colors flex items-center justify-center gap-2 min-h-[48px]"
          >
            <Trash2 className="w-5 h-5 text-rose-700" />
            <span>Borrar todos los datos de este celular</span>
          </button>
        </div>

        {/* Explicación didáctica sin palabras técnicas */}
        <div className="pt-2 border-t-2 border-slate-200 text-base text-slate-700 leading-relaxed">
          <p>
            Tus datos quedan guardados en la memoria de este navegador. Si cambias de teléfono, descarga el archivo de respaldo y cárgalo en tu nuevo equipo para conservar todo sin perder nada.
          </p>
        </div>
      </div>
    </div>
  );
};
