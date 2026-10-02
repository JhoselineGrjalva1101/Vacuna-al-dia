import React, { useState } from 'react';
import { Pet, PetSpecies, Vaccine, VaccineFrequencyUnit } from '../types/pet';
import { COMMON_VACCINE_TEMPLATES } from '../data/initialData';
import { 
  calculateNextDoseDate, 
  formatLocalDateToInput, 
  formatReadableDate 
} from '../utils/dateCalculations';
import { 
  X, 
  Plus, 
  Trash2, 
  Calendar, 
  Check, 
  Clock, 
  Syringe, 
  Info 
} from 'lucide-react';

interface PetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePet: (newPet: Pet) => void;
}

interface DraftVaccine {
  id: string;
  name: string;
  applicationDate: string;
  intervalValue: number;
  intervalUnit: VaccineFrequencyUnit;
  notes?: string;
}

/**
 * FUNCIÓN 1 REQUERIDA: Registrar mascota con especie, edad y vacunas aplicadas.
 * 
 * Permite capturar los datos requeridos por la consigna:
 * - Especie (Perro, Gato, u Otro)
 * - Edad (años y meses)
 * - Vacunas aplicadas con cálculo automático de la próxima dosis (Función 2)
 */
export const PetFormModal: React.FC<PetFormModalProps> = ({
  isOpen,
  onClose,
  onSavePet,
}) => {
  // Estado básico de la mascota
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<PetSpecies>('perro');
  const [customSpecies, setCustomSpecies] = useState('');
  const [ageYears, setAgeYears] = useState<number>(2);
  const [ageMonths, setAgeMonths] = useState<number>(0);

  // Lista de vacunas que se registrarán junto con la mascota
  const todayStr = formatLocalDateToInput(new Date());
  const [draftVaccines, setDraftVaccines] = useState<DraftVaccine[]>([
    {
      id: 'draft-1',
      name: 'Antirrábica',
      applicationDate: todayStr,
      intervalValue: 12,
      intervalUnit: 'meses',
      notes: '',
    },
  ]);

  // Mensaje de error para validaciones
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Manejador para agregar una nueva fila de vacuna al borrador
  const handleAddVaccineRow = () => {
    setDraftVaccines((prev) => [
      ...prev,
      {
        id: `draft-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: '',
        applicationDate: todayStr,
        intervalValue: 12,
        intervalUnit: 'meses',
        notes: '',
      },
    ]);
  };

  // Manejador para eliminar una fila de vacuna del borrador
  const handleRemoveVaccineRow = (id: string) => {
    setDraftVaccines((prev) => prev.filter((v) => v.id !== id));
  };

  // Manejador para actualizar un campo de una vacuna específica
  const handleUpdateVaccine = (
    id: string,
    field: keyof DraftVaccine,
    value: string | number
  ) => {
    setDraftVaccines((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  // Aplicar plantilla rápida de vacuna sugerida
  const handleSelectTemplate = (templateName: string, intervalValue: number, intervalUnit: VaccineFrequencyUnit) => {
    setDraftVaccines((prev) => [
      ...prev,
      {
        id: `draft-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: templateName,
        applicationDate: todayStr,
        intervalValue,
        intervalUnit,
        notes: '',
      },
    ]);
  };

  // Guardar y validar
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMessage('Por favor ingresa el nombre de la mascota.');
      return;
    }

    if (species === 'otro' && !customSpecies.trim()) {
      setErrorMessage('Por favor especifica la especie de la mascota.');
      return;
    }

    // Filtrar vacunas válidas (que tengan nombre)
    const validVaccines: Vaccine[] = draftVaccines
      .filter((v) => v.name.trim().length > 0)
      .map((v) => {
        // ⚠️ TRAMPA HABITUAL:
        // Asegurarse de que el cálculo de la próxima dosis se ejecute con tipos numéricos limpios.
        const cleanInterval = Math.max(1, Number(v.intervalValue) || 12);
        const calculatedNextDose = calculateNextDoseDate(
          v.applicationDate || todayStr,
          cleanInterval,
          v.intervalUnit
        );

        return {
          id: `vac-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: v.name.trim(),
          applicationDate: v.applicationDate || todayStr,
          intervalValue: cleanInterval,
          intervalUnit: v.intervalUnit,
          notes: v.notes?.trim() || undefined,
          nextDoseDate: calculatedNextDose,
        };
      });

    const newPet: Pet = {
      id: `pet-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      species,
      customSpecies: species === 'otro' ? customSpecies.trim() : undefined,
      ageYears: Math.max(0, Number(ageYears) || 0),
      ageMonths: Math.max(0, Math.min(11, Number(ageMonths) || 0)),
      photoEmoji: species === 'perro' ? '🐶' : species === 'gato' ? '🐱' : '🐾',
      vaccines: validVaccines,
      createdAt: todayStr,
    };

    onSavePet(newPet);
    onClose();
  };

  const templatesForSpecies = COMMON_VACCINE_TEMPLATES[species] || COMMON_VACCINE_TEMPLATES.otro;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200">
        {/* Cabecera del Modal */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Registrar Mascota</h2>
            <p className="text-xs text-slate-500">
              Registra a tu peludo y sus vacunas aplicadas
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* 1. Datos Básicos */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nombre de la Mascota *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Ej: Toby, Luna, Simón..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
              />
            </div>

            {/* Especie */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Especie *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSpecies('perro')}
                  className={`py-2 px-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    species === 'perro'
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400 text-emerald-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xl">🐶</span>
                  <span className="text-xs font-bold">Perro</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSpecies('gato')}
                  className={`py-2 px-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    species === 'gato'
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400 text-emerald-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xl">🐱</span>
                  <span className="text-xs font-bold">Gato</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSpecies('otro')}
                  className={`py-2 px-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    species === 'otro'
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400 text-emerald-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xl">🐾</span>
                  <span className="text-xs font-bold">Otro</span>
                </button>
              </div>

              {species === 'otro' && (
                <input
                  type="text"
                  value={customSpecies}
                  onChange={(e) => setCustomSpecies(e.target.value)}
                  placeholder="Especifica (ej: Conejo, Hurón...)"
                  className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              )}
            </div>

            {/* Edad */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Edad Aproximada *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={ageYears}
                      onChange={(e) => setAgeYears(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                    <span className="text-xs font-medium text-slate-600">años</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={ageMonths}
                      onChange={(e) => setAgeMonths(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                    <span className="text-xs font-medium text-slate-600">meses</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Vacunas Aplicadas */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Vacunas Aplicadas
                </h3>
                <p className="text-[11px] text-slate-500">
                  La próxima dosis se calcula automáticamente
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddVaccineRow}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Nueva vacuna
              </button>
            </div>

            {/* Sugerencias Rápidas de Vacunas */}
            <div className="mb-3">
              <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">
                Sugerencias comunes para {species === 'perro' ? 'perros' : species === 'gato' ? 'gatos' : 'mascotas'}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {templatesForSpecies.map((tmpl) => (
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

            {/* Lista de Filas de Vacunas */}
            <div className="space-y-3">
              {draftVaccines.map((v, index) => {
                // Cálculo en tiempo real de la próxima dosis
                const calculatedNext = calculateNextDoseDate(
                  v.applicationDate || todayStr,
                  Number(v.intervalValue) || 12,
                  v.intervalUnit
                );

                return (
                  <div
                    key={v.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5 relative"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Syringe className="w-3.5 h-3.5 text-emerald-600" />
                        Vacuna #{index + 1}
                      </span>
                      {draftVaccines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVaccineRow(v.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                          title="Eliminar de la lista"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Nombre */}
                    <div>
                      <input
                        type="text"
                        required
                        value={v.name}
                        onChange={(e) =>
                          handleUpdateVaccine(v.id, 'name', e.target.value)
                        }
                        placeholder="Nombre de la vacuna (ej: Antirrábica, Séxtuple...)"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Fecha de Aplicación */}
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          Fecha de aplicación:
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            required
                            value={v.applicationDate}
                            onChange={(e) =>
                              handleUpdateVaccine(
                                v.id,
                                'applicationDate',
                                e.target.value
                              )
                            }
                            className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Intervalo / Frecuencia */}
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          Frecuencia de refuerzo:
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="number"
                            min="1"
                            max="365"
                            value={v.intervalValue}
                            onChange={(e) =>
                              handleUpdateVaccine(
                                v.id,
                                'intervalValue',
                                parseInt(e.target.value, 10) || 1
                              )
                            }
                            className="w-16 px-2 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <select
                            value={v.intervalUnit}
                            onChange={(e) =>
                              handleUpdateVaccine(
                                v.id,
                                'intervalUnit',
                                e.target.value as VaccineFrequencyUnit
                              )
                            }
                            className="flex-1 px-2 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="meses">Meses (habitual: 12)</option>
                            <option value="dias">Días (ej: 21 cachorro)</option>
                            <option value="anios">Años</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* VISTA EN VIVO DEL CÁLCULO DE LA PRÓXIMA DOSIS (Función 2) */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/70 text-[11px] text-emerald-800">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        Próxima dosis calculada:{' '}
                        <strong>{formatReadableDate(calculatedNext)}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm inline-flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Guardar Mascota
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
