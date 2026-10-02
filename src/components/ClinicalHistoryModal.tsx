import React, { useState } from 'react';
import { Pet, ClinicalRecord, ClinicalRecordType } from '../types/pet';
import { formatLocalDateToInput, formatReadableDate, isFutureDate } from '../utils/dateCalculations';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Stethoscope,
  Pill,
  Activity,
  Bug,
  FileText,
  AlertCircle,
  Search,
  Scale,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';

interface ClinicalHistoryModalProps {
  isOpen: boolean;
  pet: Pet | null;
  onClose: () => void;
  onAddRecord: (petId: string, record: ClinicalRecord) => void;
  onDeleteRecord: (petId: string, recordId: string) => void;
}

const TYPE_CONFIG: Record<
  ClinicalRecordType,
  { label: string; icon: React.ComponentType<{ className?: string }>; bg: string; text: string; border: string }
> = {
  consulta: { label: 'Consulta', icon: Stethoscope, bg: 'bg-blue-100', text: 'text-blue-950', border: 'border-blue-500' },
  tratamiento: { label: 'Tratamiento', icon: Pill, bg: 'bg-emerald-100', text: 'text-emerald-950', border: 'border-emerald-500' },
  cirugia: { label: 'Cirugía', icon: Activity, bg: 'bg-purple-100', text: 'text-purple-950', border: 'border-purple-500' },
  desparasitacion: { label: 'Desparasitación', icon: Bug, bg: 'bg-amber-100', text: 'text-amber-950', border: 'border-amber-500' },
  estudio: { label: 'Estudio / Análisis', icon: FileText, bg: 'bg-cyan-100', text: 'text-cyan-950', border: 'border-cyan-500' },
  urgencia: { label: 'Urgencia', icon: AlertCircle, bg: 'bg-rose-100', text: 'text-rose-950', border: 'border-rose-500' },
};

export const ClinicalHistoryModal: React.FC<ClinicalHistoryModalProps> = ({
  isOpen,
  pet,
  onClose,
  onAddRecord,
  onDeleteRecord,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('todos');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = formatLocalDateToInput(new Date());
  const [date, setDate] = useState(todayStr);
  const [type, setType] = useState<ClinicalRecordType>('consulta');
  const [title, setTitle] = useState('');
  const [veterinarian, setVeterinarian] = useState('');
  const [clinic, setClinic] = useState('');
  const [weightKg, setWeightKg] = useState<string>('');
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [treatment, setTreatment] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [formError, setFormError] = useState('');

  if (!isOpen || !pet) return null;

  const records = pet.clinicalRecords || [];

  const filteredRecords = records.filter((rec) => {
    const matchesType = selectedType === 'todos' || rec.type === selectedType;
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      rec.title.toLowerCase().includes(query) ||
      rec.diagnosisNotes.toLowerCase().includes(query) ||
      (rec.veterinarian && rec.veterinarian.toLowerCase().includes(query)) ||
      (rec.clinic && rec.clinic.toLowerCase().includes(query)) ||
      (rec.treatment && rec.treatment.toLowerCase().includes(query));

    return matchesType && matchesSearch;
  });

  const sortedRecords = [...filteredRecords].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const resetForm = () => {
    setDate(todayStr);
    setType('consulta');
    setTitle('');
    setVeterinarian('');
    setClinic('');
    setWeightKg('');
    setDiagnosisNotes('');
    setTreatment('');
    setFollowUpDate('');
    setFormError('');
    setIsAddingNew(false);
    setIsSubmitting(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFormError('Por favor, indica el motivo o título de la consulta.');
      return;
    }

    const trimmedNotes = diagnosisNotes.trim();
    if (!trimmedNotes) {
      setFormError('Por favor, escribe las observaciones o diagnóstico del veterinario.');
      return;
    }

    if (isFutureDate(date)) {
      setFormError('La fecha de la visita no puede ser futura.');
      return;
    }

    // Normalizar coma a punto en el peso (Bug 7)
    let parsedWeight: number | undefined = undefined;
    if (weightKg && weightKg.trim() !== '') {
      const normalized = parseFloat(weightKg.replace(',', '.'));
      if (!isNaN(normalized) && normalized > 0 && normalized <= 200) {
        parsedWeight = Math.round(normalized * 100) / 100;
      }
    }

    setIsSubmitting(true);

    const newRecord: ClinicalRecord = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: date || todayStr,
      type,
      title: trimmedTitle.substring(0, 100),
      veterinarian: veterinarian.trim().substring(0, 80) || undefined,
      clinic: clinic.trim().substring(0, 80) || undefined,
      weightKg: parsedWeight,
      diagnosisNotes: trimmedNotes.substring(0, 600),
      treatment: treatment.trim().substring(0, 250) || undefined,
      followUpDate: followUpDate || undefined,
    };

    onAddRecord(pet.id, newRecord);
    resetForm();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[94vh] flex flex-col border-2 border-slate-400 animate-in fade-in duration-150">
        
        {/* Cabecera */}
        <div className="px-5 py-4 border-b-2 border-slate-200 flex items-center justify-between shrink-0 bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{pet.species === 'perro' ? '🐶' : pet.species === 'gato' ? '🐱' : '🐾'}</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-950 leading-tight break-all">
                  Historial de {pet.name}
                </h2>
                <span className="text-base font-bold px-2.5 py-0.5 rounded-lg bg-slate-200 text-slate-900 border border-slate-400">
                  {records.length} {records.length === 1 ? 'registro' : 'registros'}
                </span>
              </div>
              <p className="text-base text-slate-700">
                Consultas, diagnósticos y tratamientos
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-200 min-h-[48px] min-w-[48px] flex items-center justify-center"
            aria-label="Cerrar historial"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        {!isAddingNew && (
          <div className="p-4 border-b-2 border-slate-200 space-y-3 bg-slate-100 shrink-0">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={50}
                  aria-label="Buscar en historial clínico"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar síntoma, diagnóstico, médico..."
                  className="w-full pl-10 pr-3 py-3 rounded-xl bg-white border-2 border-slate-400 text-base text-slate-950 font-bold focus:outline-none focus:border-emerald-700 min-h-[48px]"
                />
              </div>

              <button
                onClick={() => setIsAddingNew(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-base font-black transition-colors shrink-0 shadow-md min-h-[48px]"
              >
                <Plus className="w-5 h-5" />
                <span>+ Nueva Entrada</span>
              </button>
            </div>

            {/* Chips de Categorías */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedType('todos')}
                className={`px-3 py-2 rounded-xl font-bold min-h-[48px] border-2 whitespace-nowrap transition-colors text-base ${
                  selectedType === 'todos'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-900 border-slate-400 hover:bg-slate-200'
                }`}
              >
                Todos ({records.length})
              </button>
              {(Object.keys(TYPE_CONFIG) as ClinicalRecordType[]).map((t) => {
                const count = records.filter((r) => r.type === t).length;
                return (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`px-3 py-2 rounded-xl font-bold min-h-[48px] border-2 whitespace-nowrap transition-colors text-base ${
                      selectedType === t
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-900 border-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {TYPE_CONFIG[t].label} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Contenido con Scroll: Formulario o Línea de Tiempo */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1">
          {isAddingNew ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b-2 border-slate-200">
                <h3 className="text-lg font-black text-slate-950">
                  Nueva entrada clínica
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-base text-slate-800 font-bold hover:underline p-1 min-h-[48px]"
                >
                  Volver a la lista
                </button>
              </div>

              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-100 border-2 border-rose-600 text-rose-950 text-base font-bold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-800 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label 
                    htmlFor="clin-type"
                    className="block text-base font-black text-slate-950 mb-1"
                  >
                    Tipo de atención médica:
                  </label>
                  <select
                    id="clin-type"
                    value={type}
                    onChange={(e) => setType(e.target.value as ClinicalRecordType)}
                    className="w-full px-3 py-3 rounded-xl border-2 border-slate-400 text-base font-bold min-h-[48px]"
                  >
                    <option value="consulta">Consulta Médica</option>
                    <option value="tratamiento">Tratamiento / Medicación</option>
                    <option value="cirugia">Cirugía / Procedimiento</option>
                    <option value="desparasitacion">Desparasitación</option>
                    <option value="estudio">Estudio o Análisis</option>
                    <option value="urgencia">Urgencia</option>
                  </select>
                </div>

                <div>
                  <label 
                    htmlFor="clin-date"
                    className="block text-base font-black text-slate-950 mb-1"
                  >
                    Fecha de la visita:
                  </label>
                  <input
                    id="clin-date"
                    type="date"
                    required
                    max={todayStr}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border-2 border-slate-400 text-base font-bold min-h-[48px]"
                  />
                </div>
              </div>

              <div>
                <label 
                  htmlFor="clin-title"
                  className="block text-base font-black text-slate-950 mb-1"
                >
                  Motivo de la visita:
                </label>
                <input
                  id="clin-title"
                  type="text"
                  required
                  maxLength={100}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setFormError('');
                  }}
                  placeholder="Por ejemplo: Chequeo dental, Otitis, Control de peso..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-400 text-slate-950 font-bold text-base min-h-[48px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label 
                    htmlFor="clin-vet"
                    className="block text-base font-bold text-slate-900 mb-1"
                  >
                    Veterinario/a:
                  </label>
                  <input
                    id="clin-vet"
                    type="text"
                    maxLength={80}
                    value={veterinarian}
                    onChange={(e) => setVeterinarian(e.target.value)}
                    placeholder="Dra. Gómez"
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-400 text-base min-h-[48px]"
                  />
                </div>

                <div>
                  <label 
                    htmlFor="clin-clinic"
                    className="block text-base font-bold text-slate-900 mb-1"
                  >
                    Clínica u Hospital:
                  </label>
                  <input
                    id="clin-clinic"
                    type="text"
                    maxLength={80}
                    value={clinic}
                    onChange={(e) => setClinic(e.target.value)}
                    placeholder="Clínica San Roque"
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-400 text-base min-h-[48px]"
                  />
                </div>

                {/* Campo de peso con soporte para coma decimal (Bug 7) */}
                <div>
                  <label 
                    htmlFor="clin-weight"
                    className="block text-base font-bold text-slate-900 mb-1"
                  >
                    Peso registrado (kg):
                  </label>
                  <input
                    id="clin-weight"
                    type="text"
                    inputMode="decimal"
                    maxLength={6}
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="Ej: 14.5"
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-400 text-base font-bold min-h-[48px]"
                  />
                </div>
              </div>

              <div>
                <label 
                  htmlFor="clin-diagnosis"
                  className="block text-base font-black text-slate-950 mb-1"
                >
                  Diagnóstico y observaciones del profesional:
                </label>
                <textarea
                  id="clin-diagnosis"
                  required
                  maxLength={600}
                  rows={3}
                  value={diagnosisNotes}
                  onChange={(e) => {
                    setDiagnosisNotes(e.target.value);
                    setFormError('');
                  }}
                  placeholder="Describe qué observó el veterinario y qué indicó hacer..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-400 text-base text-slate-950 leading-relaxed min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label 
                    htmlFor="clin-treatment"
                    className="block text-base font-bold text-slate-900 mb-1"
                  >
                    Medicamentos o tratamiento recetado:
                  </label>
                  <input
                    id="clin-treatment"
                    type="text"
                    maxLength={250}
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    placeholder="Ej: Gotas en oído cada 12 horas por 7 días"
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-400 text-base min-h-[48px]"
                  />
                </div>

                <div>
                  <label 
                    htmlFor="clin-followup"
                    className="block text-base font-bold text-slate-900 mb-1"
                  >
                    Fecha del próximo control:
                  </label>
                  <input
                    id="clin-followup"
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-400 text-base font-bold min-h-[48px]"
                  />
                </div>
              </div>

              {/* BOTONERA CON PROTECCIÓN ANTI-DOBLE CLIC (Bug 1) */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsAddingNew(false)}
                  className="w-full sm:w-1/3 py-3.5 px-4 rounded-xl border-2 border-slate-400 bg-white hover:bg-slate-100 text-slate-800 font-bold text-base min-h-[52px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-2/3 py-3.5 px-6 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 disabled:opacity-50 text-white font-black text-lg shadow-md min-h-[52px] inline-flex items-center justify-center gap-2"
                >
                  <Check className="w-6 h-6" />
                  <span>{isSubmitting ? 'Guardando...' : 'Guardar en Historial'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div>
              {sortedRecords.length === 0 ? (
                <div className="text-center py-8 space-y-3 bg-slate-50 rounded-3xl p-6 border-2 border-slate-300">
                  <div className="w-16 h-16 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-950">
                      {searchTerm || selectedType !== 'todos'
                        ? 'No encontramos registros con esos filtros'
                        : 'El historial clínico está vacío'}
                    </h4>
                    <p className="text-base text-slate-700 max-w-sm mx-auto mt-2 leading-relaxed">
                      {searchTerm || selectedType !== 'todos'
                        ? 'Prueba borrando la búsqueda o seleccionando "Todos" para ver el historial completo.'
                        : 'Lleva el registro de las visitas al veterinario, el peso de tu mascota y los tratamientos indicados.'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedType('todos');
                      setIsAddingNew(true);
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl text-base font-black min-h-[50px] inline-flex items-center justify-center gap-2 shadow-md"
                  >
                    <Plus className="w-6 h-6" />
                    <span>Registrar primera visita veterinaria</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedRecords.map((rec) => {
                    const typeInfo = TYPE_CONFIG[rec.type] || TYPE_CONFIG.consulta;
                    const IconComponent = typeInfo.icon;
                    const isExpanded = expandedRecordId === rec.id;

                    return (
                      <div
                        key={rec.id}
                        className="bg-white rounded-2xl p-4 border-2 border-slate-300 shadow-sm space-y-2.5 break-words"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span
                                className={`text-base font-black px-2.5 py-0.5 rounded-lg border-2 ${typeInfo.bg} ${typeInfo.text} ${typeInfo.border}`}
                              >
                                {typeInfo.label}
                              </span>
                              <span className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                                <Calendar className="w-5 h-5 text-slate-600" />
                                {formatReadableDate(rec.date)}
                              </span>
                            </div>

                            <h4 className="text-lg font-black text-slate-950 leading-tight break-all">
                              {rec.title}
                            </h4>
                          </div>

                          <button
                            onClick={() => {
                              if (window.confirm(`¿Seguro que deseas eliminar la entrada "${rec.title}"?`)) {
                                onDeleteRecord(pet.id, rec.id);
                              }
                            }}
                            className="text-slate-600 hover:text-rose-700 p-2 min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl"
                            title="Eliminar entrada"
                            aria-label={`Eliminar registro de ${rec.title}`}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Metadatos: Médico, Clínica, Peso */}
                        <div className="flex items-center gap-3 text-base text-slate-800 flex-wrap font-medium">
                          {rec.veterinarian && (
                            <span className="inline-flex items-center gap-1.5 break-all">
                              <Stethoscope className="w-5 h-5 text-slate-600" />
                              {rec.veterinarian}
                            </span>
                          )}
                          {rec.clinic && (
                            <span className="inline-flex items-center gap-1.5 break-all">
                              <MapPin className="w-5 h-5 text-slate-600" />
                              {rec.clinic}
                            </span>
                          )}
                          {rec.weightKg && (
                            <span className="inline-flex items-center gap-1.5 font-black text-emerald-950 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
                              <Scale className="w-5 h-5" />
                              {rec.weightKg} kg
                            </span>
                          )}
                        </div>

                        {/* Diagnóstico con break-words */}
                        <p
                          className={`text-base text-slate-900 leading-relaxed bg-slate-100 p-3 rounded-xl border border-slate-200 break-words ${
                            !isExpanded ? 'line-clamp-2' : ''
                          }`}
                        >
                          {rec.diagnosisNotes}
                        </p>

                        {/* Tratamiento y Próximo Control */}
                        {(rec.treatment || rec.followUpDate) && (
                          <div className="pt-1 space-y-1.5 text-base">
                            {rec.treatment && (
                              <div className="flex items-start gap-2 text-slate-900 break-words">
                                <Pill className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
                                <span>
                                  <strong>Tratamiento:</strong> {rec.treatment}
                                </span>
                              </div>
                            )}

                            {rec.followUpDate && (
                              <div className="flex items-center gap-2 text-amber-950 bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-300 text-base font-bold">
                                <Clock className="w-5 h-5 text-amber-800" />
                                <span>Próximo control: {formatReadableDate(rec.followUpDate)}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {rec.diagnosisNotes.length > 80 && (
                          <button
                            onClick={() => setExpandedRecordId(isExpanded ? null : rec.id)}
                            className="text-base font-bold text-slate-800 hover:text-slate-950 inline-flex items-center gap-1 pt-1 min-h-[44px]"
                          >
                            <span>{isExpanded ? 'Ver menos' : 'Leer detalle completo'}</span>
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
