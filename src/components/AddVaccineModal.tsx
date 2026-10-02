import React, { useState } from 'react';
import { Pet, Vaccine, VaccineFrequencyUnit } from '../types/pet';
import { COMMON_VACCINE_TEMPLATES } from '../data/initialData';
import { 
  calculateNextDoseDate, 
  formatLocalDateToInput, 
  formatReadableDate,
  isFutureDate 
} from '../utils/dateCalculations';
import { X, Check, Clock, Plus, Syringe, AlertCircle } from 'lucide-react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !pet) return null;

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

    if (isSubmitting) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Por favor, escribe el nombre de la vacuna antes de continuar.');
      return;
    }

    if (isFutureDate(applicationDate)) {
      setError('La fecha de aplicación no puede ser en el futuro.');
      return;
    }

    setIsSubmitting(true);

    const cleanInterval = Math.max(1, Math.min(365, Number(intervalValue) || 12));
    const cleanDate = applicationDate || todayStr;

    const newVaccine: Vaccine = {
      id: `vac-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmedName.substring(0, 50),
      applicationDate: cleanDate,
      intervalValue: cleanInterval,
      intervalUnit,
      notes: notes.trim().substring(0, 250) || undefined,
      nextDoseDate: calculatedNextDose,
    };

    onAddVaccine(pet.id, newVaccine);
    setIsSubmitting(false);
    onClose();
  };

  const templates = COMMON_VACCINE_TEMPLATES[pet.species] || COMMON_VACCINE_TEMPLATES.otro;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 border-2 border-slate-400 animate-in fade-in duration-150">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
          <div>
            <h2 className="text-xl font-black text-slate-950 flex items-center gap-2">
              <Syringe className="w-6 h-6 text-emerald-800" />
              Nueva Vacuna para {pet.name}
            </h2>
            <p className="text-base text-slate-700">
              Registra la dosis y calculamos el refuerzo
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 min-h-[48px] min-w-[48px] flex items-center justify-center"
            aria-label="Cerrar formulario"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mensaje de error visible */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-100 border-2 border-rose-600 text-rose-950 text-base font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-800 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Sugerencias comunes */}
          <div>
            <span className="block text-base font-bold text-slate-900 mb-1">
              Vacunas frecuentes para {pet.species === 'perro' ? 'perro' : pet.species === 'gato' ? 'gato' : 'mascota'}:
            </span>
            <div className="flex flex-wrap gap-2">
              {templates.map((tmpl) => (
                <button
                  key={tmpl.name}
                  type="button"
                  onClick={() => handleSelectTemplate(tmpl.name, tmpl.intervalValue, tmpl.intervalUnit)}
                  className="text-base px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-400 text-slate-900 font-semibold min-h-[48px] inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-emerald-800" />
                  <span>{tmpl.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Campo: Nombre con maxLength (Bug 2) */}
          <div>
            <label 
              htmlFor="add-vac-name"
              className="block text-base font-black text-slate-950 mb-1"
            >
              Nombre de la vacuna:
            </label>
            <input
              id="add-vac-name"
              type="text"
              required
              maxLength={50}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Por ejemplo: Antirrábica, Séxtuple..."
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-400 text-slate-950 font-bold text-base min-h-[48px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Campo: Fecha con max=todayStr (Bug 4) */}
            <div>
              <label 
                htmlFor="add-vac-date"
                className="block text-base font-black text-slate-950 mb-1"
              >
                Fecha de aplicación:
              </label>
              <input
                id="add-vac-date"
                type="date"
                required
                max={todayStr}
                value={applicationDate}
                onChange={(e) => setApplicationDate(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border-2 border-slate-400 text-slate-950 font-bold text-base min-h-[48px]"
              />
            </div>

            {/* Campo: Intervalo sanitizado */}
            <div>
              <label 
                htmlFor="add-vac-interval"
                className="block text-base font-black text-slate-950 mb-1"
              >
                Reforzar cada:
              </label>
              <div className="flex gap-2">
                <input
                  id="add-vac-interval"
                  type="number"
                  min="1"
                  max="365"
                  value={intervalValue}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setIntervalValue(isNaN(val) ? 1 : Math.max(1, Math.min(365, val)));
                  }}
                  className="w-20 px-3 py-3 rounded-xl border-2 border-slate-400 text-base font-bold min-h-[48px]"
                />
                <select
                  id="add-vac-unit"
                  aria-label="Unidad de frecuencia de refuerzo"
                  value={intervalUnit}
                  onChange={(e) => setIntervalUnit(e.target.value as VaccineFrequencyUnit)}
                  className="flex-1 px-3 py-3 rounded-xl border-2 border-slate-400 text-base font-bold min-h-[48px]"
                >
                  <option value="meses">Meses</option>
                  <option value="dias">Días</option>
                  <option value="anios">Años</option>
                </select>
              </div>
            </div>
          </div>

          {/* Campo: Observaciones */}
          <div>
            <label 
              htmlFor="add-vac-notes"
              className="block text-base font-bold text-slate-900 mb-1"
            >
              Observaciones (opcional):
            </label>
            <input
              id="add-vac-notes"
              type="text"
              maxLength={250}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Clínica, veterinario o lote de la dosis..."
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-400 text-base text-slate-900 min-h-[48px]"
            />
          </div>

          {/* Cálculo en vivo de la Próxima Dosis */}
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-100 border-2 border-emerald-400 text-base text-emerald-950 font-bold">
            <Clock className="w-6 h-6 text-emerald-900 shrink-0" />
            <div>
              <span className="block text-slate-800 text-base font-semibold">Próxima dosis recomendada:</span>
              <span className="text-emerald-950 font-black text-lg">{formatReadableDate(calculatedNextDose)}</span>
            </div>
          </div>

          {/* BOTONERA CON PROTECCIÓN ANTI-DOBLE CLIC (Bug 1) */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="w-full sm:w-1/3 py-3.5 px-4 rounded-xl border-2 border-slate-400 bg-white hover:bg-slate-100 text-slate-800 font-bold text-base min-h-[52px]"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-2/3 py-3.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 disabled:opacity-50 text-white font-black text-lg shadow-md min-h-[52px] inline-flex items-center justify-center gap-2"
            >
              <Check className="w-6 h-6" />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar Vacuna'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
