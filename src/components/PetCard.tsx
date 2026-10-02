import React, { useState } from 'react';
import { Pet } from '../types/pet';
import { 
  getDaysRemaining, 
  getVaccineUrgency, 
  formatReadableDate, 
  getRemainingDaysLabel 
} from '../utils/dateCalculations';
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash2, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar,
  Clock,
  Syringe,
  FileText
} from 'lucide-react';

interface PetCardProps {
  pet: Pet;
  onAddVaccine: (petId: string) => void;
  onDeletePet: (petId: string) => void;
  onDeleteVaccine: (petId: string, vaccineId: string) => void;
  onOpenClinicalHistory: (pet: Pet) => void;
}

export const PetCard: React.FC<PetCardProps> = ({
  pet,
  onAddVaccine,
  onDeletePet,
  onDeleteVaccine,
  onOpenClinicalHistory,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Contadores de estado de vacunas para esta mascota
  const statusCounts = pet.vaccines.reduce(
    (acc, vac) => {
      const urgency = getVaccineUrgency(vac.nextDoseDate);
      acc[urgency] += 1;
      return acc;
    },
    { vencida: 0, por_vencer: 0, al_dia: 0 }
  );

  // Formateo legible de la edad
  const formatAge = (years: number, months: number): string => {
    const parts = [];
    if (years > 0) parts.push(`${years} ${years === 1 ? 'año' : 'años'}`);
    if (months > 0) parts.push(`${months} ${months === 1 ? 'mes' : 'meses'}`);
    return parts.length > 0 ? parts.join(' y ') : 'Menos de 1 mes';
  };

  const speciesLabels: Record<string, string> = {
    perro: 'Perro 🐶',
    gato: 'Gato 🐱',
    otro: pet.customSpecies || 'Otro 🐾',
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-all">
      {/* Cabecera de la Mascota */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-3xl shadow-xs shrink-0">
              {pet.species === 'perro' ? '🐶' : pet.species === 'gato' ? '🐱' : '🐾'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  {pet.name}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {speciesLabels[pet.species]}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Edad: {formatAge(pet.ageYears, pet.ageMonths)}
              </p>
            </div>
          </div>

          <button
            onClick={() => onDeletePet(pet.id)}
            className="text-slate-400 hover:text-rose-500 p-1.5 rounded-xl hover:bg-rose-50 transition-colors"
            title="Eliminar mascota"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Resumen de vacunas */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 flex-wrap">
          <span className="text-xs font-medium text-slate-500 mr-1">
            Vacunas ({pet.vaccines.length}):
          </span>

          {statusCounts.vencida > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
              <AlertCircle className="w-3 h-3" />
              {statusCounts.vencida} vencida{statusCounts.vencida > 1 ? 's' : ''}
            </span>
          )}

          {statusCounts.por_vencer > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              <AlertTriangle className="w-3 h-3" />
              {statusCounts.por_vencer} por vencer
            </span>
          )}

          {statusCounts.al_dia > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-3 h-3" />
              {statusCounts.al_dia} al día
            </span>
          )}

          {pet.vaccines.length === 0 && (
            <span className="text-xs text-slate-400 italic">
              Sin vacunas registradas
            </span>
          )}

          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={() => onOpenClinicalHistory(pet)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              title="Ver o agregar al historial clínico digital"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Historial</span>
              <span className="bg-blue-200/80 text-blue-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pet.clinicalRecords?.length || 0}
              </span>
            </button>
            <button
              onClick={() => onAddVaccine(pet.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Vacuna
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              aria-label={isExpanded ? 'Contraer' : 'Expandir'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Lista detallada de vacunas de esta mascota */}
      {isExpanded && (
        <div className="bg-slate-50/70 border-t border-slate-100 p-4 space-y-2.5">
          {pet.vaccines.length === 0 ? (
            <div className="text-center py-4">
              <Syringe className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
              <p className="text-xs text-slate-500 font-medium">
                No tiene vacunas registradas aún.
              </p>
              <button
                onClick={() => onAddVaccine(pet.id)}
                className="mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Registrar primera vacuna
              </button>
            </div>
          ) : (
            pet.vaccines.map((vac) => {
              const urgency = getVaccineUrgency(vac.nextDoseDate);
              const daysRemaining = getDaysRemaining(vac.nextDoseDate);
              const isVencida = urgency === 'vencida';
              const isPorVencer = urgency === 'por_vencer';

              return (
                <div
                  key={vac.id}
                  className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">
                          {vac.name}
                        </span>
                        {isVencida ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                            Vencida
                          </span>
                        ) : isPorVencer ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            Por vencer
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                            Al día
                          </span>
                        )}
                      </div>
                      {vac.notes && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {vac.notes}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => onDeleteVaccine(pet.id, vac.id)}
                      className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                      title="Eliminar vacuna"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Fechas de aplicación y próxima dosis calculada */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2 rounded-xl">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Aplicada
                      </span>
                      <span className="text-slate-700 font-medium flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatReadableDate(vac.applicationDate)}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Próxima dosis
                      </span>
                      <span
                        className={`font-bold flex items-center gap-1 mt-0.5 ${
                          isVencida
                            ? 'text-rose-600'
                            : isPorVencer
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {formatReadableDate(vac.nextDoseDate)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      Intervalo: cada {vac.intervalValue} {vac.intervalUnit}
                    </span>
                    <span
                      className={`font-semibold ${
                        isVencida
                          ? 'text-rose-600'
                          : isPorVencer
                          ? 'text-amber-700'
                          : 'text-slate-500'
                      }`}
                    >
                      {getRemainingDaysLabel(daysRemaining)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
