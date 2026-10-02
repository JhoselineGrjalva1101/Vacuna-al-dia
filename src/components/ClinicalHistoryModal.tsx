import React, { useState } from 'react';
import { Pet, ClinicalRecord, ClinicalRecordType } from '../types/pet';
import { formatLocalDateToInput, formatReadableDate } from '../utils/dateCalculations';
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
  consulta: { label: 'Consulta', icon: Stethoscope, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  tratamiento: { label: 'Tratamiento', icon: Pill, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  cirugia: { label: 'Cirugía', icon: Activity, bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  desparasitacion: { label: 'Desparasitación', icon: Bug, bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  estudio: { label: 'Estudio / Análisis', icon: FileText, bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
  urgencia: { label: 'Urgencia', icon: AlertCircle, bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
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

  // Estado del formulario de nuevo registro
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

  // Filtrado interactivo por texto y categoría
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

  // Ordenar cronológicamente (más recientes primero)
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
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setFormError('Por favor ingresa el motivo o título de la entrada clínica.');
      return;
    }

    if (!diagnosisNotes.trim()) {
      setFormError('Por favor describe las observaciones o diagnóstico médico.');
      return;
    }

    const newRecord: ClinicalRecord = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: date || todayStr,
      type,
      title: title.trim(),
      veterinarian: veterinarian.trim() || undefined,
      clinic: clinic.trim() || undefined,
      weightKg: weightKg ? parseFloat(weightKg) : undefined,
      diagnosisNotes: diagnosisNotes.trim(),
      treatment: treatment.trim() || undefined,
      followUpDate: followUpDate || undefined,
    };

    onAddRecord(pet.id, newRecord);
    resetForm();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200">
        {/* Cabecera */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{pet.species === 'perro' ? '🐶' : pet.species === 'gato' ? '🐱' : '🐾'}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Historial Clínico de {pet.name}
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {records.length} {records.length === 1 ? 'registro' : 'registros'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Línea de tiempo de consultas, cirugías y tratamientos
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Filtros y Búsqueda Interactiva */}
        {!isAddingNew && (
          <div className="p-4 border-b border-slate-100 space-y-2.5 bg-slate-50/60 shrink-0">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar síntoma, diagnóstico, médico..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={() => setIsAddingNew(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva Entrada</span>
              </button>
            </div>

            {/* Chips de Categorías */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-xs">
              <button
                onClick={() => setSelectedType('todos')}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedType === 'todos'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
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
                    className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      selectedType === t
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
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
        <div className="overflow-y-auto p-4 sm:p-5 flex-1">
          {isAddingNew ? (
            /* Formulario para Agregar Entrada Clínica */
            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">
                  Registrar Entrada al Historial Clínico
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                >
                  Volver a la lista
                </button>
              </div>

              {formError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tipo de Evento *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ClinicalRecordType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="consulta">Consulta Médica</option>
                    <option value="tratamiento">Tratamiento / Medicación</option>
                    <option value="cirugia">Cirugía / Procedimiento</option>
                    <option value="desparasitacion">Desparasitación</option>
                    <option value="estudio">Estudio / Análisis de laboratorio</option>
                    <option value="urgencia">Urgencia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Fecha del Evento *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Motivo o Título Principal *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setFormError('');
                  }}
                  placeholder="Ej: Control de otitis, Limpieza dental, Ecografía..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Veterinario/a
                  </label>
                  <input
                    type="text"
                    value={veterinarian}
                    onChange={(e) => setVeterinarian(e.target.value)}
                    placeholder="Dra. Gómez"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Clínica / Hospital
                  </label>
                  <input
                    type="text"
                    value={clinic}
                    onChange={(e) => setClinic(e.target.value)}
                    placeholder="Centro Veterinario..."
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Peso registrado (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="150"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="Ej: 14.5"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Diagnóstico y Observaciones Médicas *
                </label>
                <textarea
                  required
                  rows={3}
                  value={diagnosisNotes}
                  onChange={(e) => {
                    setDiagnosisNotes(e.target.value);
                    setFormError('');
                  }}
                  placeholder="Detalles del diagnóstico, síntomas observados, recomendaciones del profesional..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tratamiento / Fármacos indicados
                  </label>
                  <input
                    type="text"
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    placeholder="Ej: Gotas óticas cada 12h x 7 días"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Próximo control / Seguimiento
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm inline-flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Guardar en Historial
                </button>
              </div>
            </form>
          ) : (
            /* Línea de Tiempo Interactiva */
            <div>
              {sortedRecords.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      {searchTerm || selectedType !== 'todos'
                        ? 'No se encontraron registros con esos filtros'
                        : 'Aún no hay registros en el historial clínico'}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                      {searchTerm || selectedType !== 'todos'
                        ? 'Prueba cambiando los términos de búsqueda o seleccionando otra categoría.'
                        : 'Lleva el control de visitas veterinarias, diagnósticos, cirugías y peso de tu mascota.'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedType('todos');
                      setIsAddingNew(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Registrar primera entrada
                  </button>
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {sortedRecords.map((rec) => {
                    const typeInfo = TYPE_CONFIG[rec.type] || TYPE_CONFIG.consulta;
                    const IconComponent = typeInfo.icon;
                    const isExpanded = expandedRecordId === rec.id;

                    return (
                      <div key={rec.id} className="relative group">
                        {/* Nodo en la línea de tiempo */}
                        <div
                          className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border-2 border-white shadow-xs flex items-center justify-center ${typeInfo.bg} ${typeInfo.text}`}
                        >
                          <IconComponent className="w-2.5 h-2.5" />
                        </div>

                        {/* Tarjeta del Registro */}
                        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${typeInfo.bg} ${typeInfo.text} ${typeInfo.border}`}
                                >
                                  {typeInfo.label}
                                </span>
                                <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  {formatReadableDate(rec.date)}
                                </span>
                              </div>

                              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                                {rec.title}
                              </h4>
                            </div>

                            <button
                              onClick={() => {
                                if (window.confirm(`¿Eliminar la entrada "${rec.title}" del historial?`)) {
                                  onDeleteRecord(pet.id, rec.id);
                                }
                              }}
                              className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                              title="Eliminar entrada"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Metadatos: Médico, Clínica, Peso */}
                          <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                            {rec.veterinarian && (
                              <span className="inline-flex items-center gap-1 font-medium">
                                <Stethoscope className="w-3 h-3 text-slate-400" />
                                {rec.veterinarian}
                              </span>
                            )}
                            {rec.clinic && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {rec.clinic}
                              </span>
                            )}
                            {rec.weightKg && (
                              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                <Scale className="w-3 h-3" />
                                {rec.weightKg} kg
                              </span>
                            )}
                          </div>

                          {/* Diagnóstico */}
                          <p
                            className={`text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl ${
                              !isExpanded ? 'line-clamp-2' : ''
                            }`}
                          >
                            {rec.diagnosisNotes}
                          </p>

                          {/* Tratamiento y Próximo Control */}
                          {(rec.treatment || rec.followUpDate) && (
                            <div className="pt-1 space-y-1 text-xs">
                              {rec.treatment && (
                                <div className="flex items-start gap-1.5 text-slate-700">
                                  <Pill className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                  <span>
                                    <strong>Tratamiento:</strong> {rec.treatment}
                                  </span>
                                </div>
                              )}

                              {rec.followUpDate && (
                                <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50/80 px-2 py-1 rounded-lg text-[11px] font-semibold">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>Próximo control: {formatReadableDate(rec.followUpDate)}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {rec.diagnosisNotes.length > 100 && (
                            <button
                              onClick={() => setExpandedRecordId(isExpanded ? null : rec.id)}
                              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-0.5 pt-0.5"
                            >
                              <span>{isExpanded ? 'Ver menos' : 'Ver detalle completo'}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
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
