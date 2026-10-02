import React, { useState } from 'react';
import { Pet, Vaccine, VaccineFrequencyUnit } from '../types/pet';
import { COMMON_VACCINE_TEMPLATES } from '../data/initialData';
import { 
  calculateNextDoseDate, 
  formatLocalDateToInput, 
  formatReadableDate 
} from '../utils/dateCalculations';
import { X, Check, Clock, Plus, Syringe } from 'lucide-react';

interface AddVaccineModalProps {
  isOpen: boolean;
  pet: Pet | null;
  onClose: () => void;
  onAddVaccine: (petId: string, vaccine: Vaccine) => void;
}

export const AddVaccineModal: React.FC<AddVaccineModalProps> = ({
  isOpen,
  pet,
  onClose,
  onAddVaccine,
}) => {
  const todayStr = formatLocalDateToInput(new Date());

  const [name, setName] = useState('');
  const [applicationDate, setApplicationDate] = useState(todayStr);
  const [intervalValue, setIntervalValue] = useState<number>(12);
  const [intervalUnit, setIntervalUnit] = useState<VaccineFrequencyUnit>('meses');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !pet) return null;

  // Cálculo en vivo de la fecha resultante (Función 2)
  const calculatedNextDose = calculateNextDoseDate(
    applicationDate || todayStr,
    Math.max(1, Number(intervalValue) || 12),
    intervalUnit
  );

  const handleSelectTemplate = (tmplName: string, val: number, unit: VaccineFrequencyUnit) => {
    setName(tmplName);
    setIntervalValue(val);
    setIntervalUnit(unit);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Por favor indica el nombre de la vacuna.');
      return;
    }

    const cleanInterval = Math.max(1, Number(intervalValue) || 12);
    const newVaccine: Vaccine = {
      id: `vac-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      applicationDate: applicationDate || todayStr,
      intervalValue: cleanInterval,
      intervalUnit,
      notes: notes.trim() || undefined,
      nextDoseDate: calculatedNextDose,
    };

    onAddVaccine(pet.id, newVaccine);
    onClose();
  };

  const templates = COMMON_VACCINE_TEMPLATES[pet.species] || COMMON_VACCINE_TEMPLATES.otro;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <Syringe className="w-4 h-4 text-emerald-600" />
              Nueva Vacuna para {pet.name}
            </h2>
            <p className="text-xs text-slate-500">
              Registra la dosis y calcula la próxima fecha
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Plantillas sugeridas */}
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">
              Vacunas frecuentes para {pet.species === 'perro' ? 'perro' : pet.species === 'gato' ? 'gato' : 'mascota'}:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {templates.map((tmpl) => (
                <button
                  key={tmpl.name}
                  type="button"
                  onClick={() => handleSelectTemplate(tmpl.name, tmpl.intervalValue, tmpl.intervalUnit)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 transition-colors inline-flex items-center gap-1"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>{tmpl.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nombre de la Vacuna *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Ej: Antirrábica, Séxtuple..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                Fecha de Aplicación:
              </label>
              <input
                type="date"
                required
                value={applicationDate}
                onChange={(e) => setApplicationDate(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                Refuerzo cada:
              </label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={intervalValue}
                  onChange={(e) => setIntervalValue(parseInt(e.target.value, 10) || 1)}
                  className="w-16 px-2 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <select
                  value={intervalUnit}
                  onChange={(e) => setIntervalUnit(e.target.value as VaccineFrequencyUnit)}
                  className="flex-1 px-2 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="meses">Meses</option>
                  <option value="dias">Días</option>
                  <option value="anios">Años</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
              Observaciones (opcional):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Clínica, veterinario o lote..."
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Cálculo en vivo de la Próxima Dosis */}
          <div className="flex items-center gap-1.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="block font-semibold">Próxima dosis calculada:</span>
              <strong className="text-emerald-950 font-bold">{formatReadableDate(calculatedNextDose)}</strong>
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 inline-flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Guardar Vacuna
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
