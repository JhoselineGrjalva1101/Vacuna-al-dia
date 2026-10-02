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
  Check, 
  Clock, 
  Syringe,
  AlertCircle
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

export const PetFormModal: React.FC<PetFormModalProps> = ({
  isOpen,
  onClose,
  onSavePet,
}) => {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<PetSpecies>('perro');
  const [customSpecies, setCustomSpecies] = useState('');
  const [ageYears, setAgeYears] = useState<number>(2);
  const [ageMonths, setAgeMonths] = useState<number>(0);

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

  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

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

  const handleRemoveVaccineRow = (id: string) => {
    setDraftVaccines((prev) => prev.filter((v) => v.id !== id));
  };

  const handleUpdateVaccine = (
    id: string,
    field: keyof DraftVaccine,
    value: string | number
  ) => {
    setDraftVaccines((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMessage('Por favor, escribe el nombre de la mascota antes de guardar.');
      return;
    }

    if (species === 'otro' && !customSpecies.trim()) {
      setErrorMessage('Por favor, indica qué tipo de animal es tu mascota (por ejemplo: Conejo, Hurón).');
      return;
    }

    const validVaccines: Vaccine[] = draftVaccines
      .filter((v) => v.name.trim().length > 0)
      .map((v) => {
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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[94vh] flex flex-col border-2 border-slate-400 animate-in fade-in duration-150">
        
        {/* Cabecera del Modal */}
        <div className="px-5 py-4 border-b-2 border-slate-200 flex items-center justify-between shrink-0 bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-950">Registrar Mascota</h2>
            <p className="text-base text-slate-700">
              Datos básicos y primeras vacunas
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-200 min-h-[48px] min-w-[48px] flex items-center justify-center"
            aria-label="Cerrar ventana"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Mensaje de error visible en español claro (Requisito 6) */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-100 border-2 border-rose-600 text-rose-950 text-base font-bold flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-rose-800 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Datos Básicos con ETIQUETAS VISIBLES (Requisito 3) */}
          <div className="space-y-4">
            
            {/* Campo: Nombre con etiqueta visible */}
            <div>
              <label 
                htmlFor="pet-name-input"
                className="block text-base font-black text-slate-950 mb-1"
              >
                Nombre de la mascota:
              </label>
              <input
                id="pet-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Por ejemplo: Toby, Luna, Simón..."
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-400 text-slate-950 font-bold text-base focus:outline-none focus:border-emerald-700 min-h-[48px]"
              />
            </div>

            {/* Campo: Especie con etiqueta visible */}
            <div>
              <label className="block text-base font-black text-slate-950 mb-1.5">
                Especie del animal:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSpecies('perro')}
                  className={`py-3 px-2 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center min-h-[56px] ${
                    species === 'perro'
                      ? 'bg-emerald-100 border-emerald-900 ring-2 ring-emerald-800 text-emerald-950'
                      : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-2xl">🐶</span>
                  <span className="text-base font-bold">Perro</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSpecies('gato')}
                  className={`py-3 px-2 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center min-h-[56px] ${
                    species === 'gato'
                      ? 'bg-emerald-100 border-emerald-900 ring-2 ring-emerald-800 text-emerald-950'
                      : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-2xl">🐱</span>
                  <span className="text-base font-bold">Gato</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSpecies('otro')}
                  className={`py-3 px-2 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center min-h-[56px] ${
                    species === 'otro'
                      ? 'bg-emerald-100 border-emerald-900 ring-2 ring-emerald-800 text-emerald-950'
                      : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-2xl">🐾</span>
                  <span className="text-base font-bold">Otro</span>
                </button>
              </div>

              {species === 'otro' && (
                <div className="mt-2">
                  <label 
                    htmlFor="custom-species-input"
                    className="block text-base font-bold text-slate-900 mb-1"
                  >
                    Especifica la especie:
                  </label>
                  <input
                    id="custom-species-input"
                    type="text"
                    value={customSpecies}
                    onChange={(e) => setCustomSpecies(e.target.value)}
                    placeholder="Por ejemplo: Conejo, Hurón, Cobayo..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-400 text-slate-950 font-semibold text-base focus:outline-none focus:border-emerald-700 min-h-[48px]"
                  />
                </div>
              )}
            </div>

            {/* Campo: Edad con etiquetas visibles */}
            <div>
              <label className="block text-base font-black text-slate-950 mb-1">
                Edad aproximada:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="pet-age-years" className="block text-base font-semibold text-slate-700 mb-1">
                    Años cumplidos:
                  </label>
                  <input
                    id="pet-age-years"
                    type="number"
                    min="0"
                    max="30"
                    value={ageYears}
                    onChange={(e) => setAgeYears(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-400 text-base font-bold min-h-[48px]"
                  />
                </div>
                <div>
                  <label htmlFor="pet-age-months" className="block text-base font-semibold text-slate-700 mb-1">
                    Meses adicionales:
                  </label>
                  <input
                    id="pet-age-months"
                    type="number"
                    min="0"
                    max="11"
                    value={ageMonths}
                    onChange={(e) => setAgeMonths(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-400 text-base font-bold min-h-[48px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Vacunas Aplicadas con etiquetas visibles */}
          <div className="pt-4 border-t-2 border-slate-200 space-y-3">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-black text-slate-950">
                  Vacunas aplicadas:
                </h3>
                <p className="text-base text-slate-700">
                  Calculamos la fecha de la próxima dosis al instante
                </p>
              </div>

              {/* Botón secundario para agregar fila */}
              <button
                type="button"
                onClick={handleAddVaccineRow}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border-2 border-slate-700 bg-white hover:bg-slate-100 text-slate-900 font-bold text-base min-h-[48px]"
              >
                <Plus className="w-5 h-5" />
                <span>+ Agregar otra</span>
              </button>
            </div>

            {/* Sugerencias Rápidas */}
            <div>
              <span className="block text-base font-bold text-slate-800 mb-1">
                Elegir sugerencia común:
              </span>
              <div className="flex flex-wrap gap-2">
                {templatesForSpecies.map((tmpl) => (
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

            {/* Lista de Filas de Vacunas con Etiquetas */}
            <div className="space-y-4">
              {draftVaccines.map((v, index) => {
                const calculatedNext = calculateNextDoseDate(
                  v.applicationDate || todayStr,
                  Number(v.intervalValue) || 12,
                  v.intervalUnit
                );

                return (
                  <div
                    key={v.id}
                    className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-300 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-base font-black text-slate-900 flex items-center gap-1.5">
                        <Syringe className="w-5 h-5 text-emerald-800" />
                        Vacuna #{index + 1}
                      </span>
                      {draftVaccines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVaccineRow(v.id)}
                          className="text-slate-600 hover:text-rose-700 p-2 min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl"
                          title="Eliminar esta vacuna"
                          aria-label={`Eliminar vacuna número ${index + 1}`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    {/* Nombre con etiqueta visible */}
                    <div>
                      <label 
                        htmlFor={`vac-name-${v.id}`}
                        className="block text-base font-bold text-slate-900 mb-1"
                      >
                        Nombre de la vacuna:
                      </label>
                      <input
                        id={`vac-name-${v.id}`}
                        type="text"
                        required
                        value={v.name}
                        onChange={(e) => handleUpdateVaccine(v.id, 'name', e.target.value)}
                        placeholder="Por ejemplo: Antirrábica, Séxtuple..."
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-400 text-slate-950 font-bold text-base min-h-[48px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Fecha de Aplicación con etiqueta visible */}
                      <div>
                        <label 
                          htmlFor={`vac-date-${v.id}`}
                          className="block text-base font-bold text-slate-900 mb-1"
                        >
                          Fecha en que se aplicó:
                        </label>
                        <input
                          id={`vac-date-${v.id}`}
                          type="date"
                          required
                          value={v.applicationDate}
                          onChange={(e) => handleUpdateVaccine(v.id, 'applicationDate', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-400 text-slate-950 font-bold text-base min-h-[48px]"
                        />
                      </div>

                      {/* Intervalo con etiqueta visible */}
                      <div>
                        <label 
                          htmlFor={`vac-interval-${v.id}`}
                          className="block text-base font-bold text-slate-900 mb-1"
                        >
                          Repetir dosis cada:
                        </label>
                        <div className="flex gap-2">
                          <input
                            id={`vac-interval-${v.id}`}
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
                            className="w-20 px-3 py-3 rounded-xl border-2 border-slate-400 text-base font-bold min-h-[48px]"
                          />
                          <select
                            id={`vac-unit-${v.id}`}
                            aria-label="Unidad de tiempo para la dosis"
                            value={v.intervalUnit}
                            onChange={(e) =>
                              handleUpdateVaccine(
                                v.id,
                                'intervalUnit',
                                e.target.value as VaccineFrequencyUnit
                              )
                            }
                            className="flex-1 px-3 py-3 rounded-xl border-2 border-slate-400 text-base font-bold min-h-[48px]"
                          >
                            <option value="meses">Meses (habitual: 12)</option>
                            <option value="dias">Días (ej: 21 cachorro)</option>
                            <option value="anios">Años</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Próxima Dosis Calculada */}
                    <div className="p-3 rounded-xl bg-emerald-100 border-2 border-emerald-400 text-base text-emerald-950 font-bold flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-900 shrink-0" />
                      <span>
                        Próxima dosis calculada: <strong>{formatReadableDate(calculatedNext)}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BOTONERA: UN SOLO BOTÓN PRINCIPAL (Requisito 4) */}
          <div className="pt-3 flex flex-col sm:flex-row gap-3">
            {/* Botón secundario */}
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-1/3 py-3.5 px-4 rounded-xl border-2 border-slate-400 bg-white hover:bg-slate-100 text-slate-800 font-bold text-base min-h-[52px]"
            >
              Cancelar
            </button>

            {/* ÚNICO BOTÓN PRINCIPAL */}
            <button
              type="submit"
              className="w-full sm:w-2/3 py-3.5 px-6 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-black text-lg shadow-md min-h-[52px] inline-flex items-center justify-center gap-2"
            >
              <Check className="w-6 h-6" />
              <span>Guardar Mascota</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
