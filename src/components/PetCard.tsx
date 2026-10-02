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

  const statusCounts = pet.vaccines.reduce(
    (acc, vac) => {
      const urgency = getVaccineUrgency(vac.nextDoseDate);
      acc[urgency] += 1;
      return acc;
    },
    { vencida: 0, por_vencer: 0, al_dia: 0 }
  );

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
    <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-sm overflow-hidden transition-all w-full">
      {/* Cabecera de la Mascota */}
      <div className="p-4 sm:p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-3xl shrink-0">
              {pet.species === 'perro' ? '🐶' : pet.species === 'gato' ? '🐱' : '🐾'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-black text-slate-950 leading-tight">
                  {pet.name}
                </h3>
                <span className="text-base font-bold px-2.5 py-0.5 rounded-lg bg-slate-200 text-slate-900 border border-slate-400">
                  {speciesLabels[pet.species]}
                </span>
              </div>
              <p className="text-base text-slate-800 font-semibold mt-1">
                Edad: {formatAge(pet.ageYears, pet.ageMonths)}
              </p>
            </div>
          </div>

          <button
            onClick={() => onDeletePet(pet.id)}
            className="text-slate-600 hover:text-rose-700 p-2 rounded-xl border border-slate-300 hover:bg-rose-50 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
            title="Eliminar mascota"
            aria-label={`Eliminar a ${pet.name}`}
          >
            <Trash2 className="w-6 h-6 text-slate-700" />
          </button>
        </div>

        {/* Resumen de vacunas */}
        <div className="flex items-center gap-2 pt-2 border-t-2 border-slate-100 flex-wrap">
          <span className="text-base font-bold text-slate-800">
            Vacunas: {pet.vaccines.length}
          </span>

          {statusCounts.vencida > 0 && (
            <span className="inline-flex items-center gap-1 text-base font-black px-2.5 py-1 rounded-xl bg-rose-800 text-white">
              <AlertCircle className="w-4 h-4" />
              {statusCounts.vencida} vencida{statusCounts.vencida > 1 ? 's' : ''}
            </span>
          )}

          {statusCounts.por_vencer > 0 && (
            <span className="inline-flex items-center gap-1 text-base font-black px-2.5 py-1 rounded-xl bg-amber-700 text-white">
              <AlertTriangle className="w-4 h-4" />
              {statusCounts.por_vencer} por vencer
            </span>
          )}

          {statusCounts.al_dia > 0 && (
            <span className="inline-flex items-center gap-1 text-base font-black px-2.5 py-1 rounded-xl bg-emerald-800 text-white">
              <CheckCircle2 className="w-4 h-4" />
              {statusCounts.al_dia} al día
            </span>
          )}
        </div>

        {/* Botonera de acciones (Botones secundarios claramente diferenciados) */}
        <div className="pt-2 flex flex-wrap gap-2">
          {/* Botón Historial Clínico */}
          <button
            onClick={() => onOpenClinicalHistory(pet)}
            className="flex-1 min-w-[130px] py-2.5 px-3 rounded-xl border-2 border-blue-800 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-950 font-bold text-base transition-colors min-h-[48px] flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5 text-blue-800" />
            <span>Historial ({pet.clinicalRecords?.length || 0})</span>
          </button>

          {/* Botón Agregar Vacuna */}
          <button
            onClick={() => onAddVaccine(pet.id)}
            className="flex-1 min-w-[130px] py-2.5 px-3 rounded-xl border-2 border-emerald-800 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-950 font-bold text-base transition-colors min-h-[48px] flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5 text-emerald-800" />
            <span>+ Vacuna</span>
          </button>

          {/* Botón Contraer / Expandir */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="py-2.5 px-3.5 border-2 border-slate-400 bg-white hover:bg-slate-100 text-slate-800 rounded-xl min-h-[48px] flex items-center justify-center"
            aria-label={isExpanded ? 'Ocultar vacunas' : 'Mostrar vacunas'}
          >
            {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Lista detallada de vacunas de esta mascota */}
      {isExpanded && (
        <div className="bg-slate-100 border-t-2 border-slate-300 p-4 space-y-3">
          {pet.vaccines.length === 0 ? (
            <div className="text-center py-4 bg-white rounded-2xl p-4 border border-slate-300">
              <Syringe className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-base text-slate-800 font-bold">
                Esta mascota todavía no tiene vacunas registradas.
              </p>
              <button
                onClick={() => onAddVaccine(pet.id)}
                className="mt-3 w-full sm:w-auto px-4 py-2.5 border-2 border-emerald-800 bg-emerald-50 text-emerald-950 rounded-xl text-base font-bold min-h-[48px] inline-flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5 text-emerald-800" />
                Registrar primera vacuna de {pet.name}
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
                  className="bg-white rounded-2xl p-4 border-2 border-slate-300 shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-slate-950 text-lg">
                          {vac.name}
                        </span>
                        {isVencida ? (
                          <span className="text-base font-black px-2 py-0.5 rounded-lg bg-rose-800 text-white">
                            Vencida
                          </span>
                        ) : isPorVencer ? (
                          <span className="text-base font-black px-2 py-0.5 rounded-lg bg-amber-700 text-white">
                            Por vencer
                          </span>
                        ) : (
                          <span className="text-base font-bold px-2 py-0.5 rounded-lg bg-emerald-800 text-white">
                            Al día
                          </span>
                        )}
                      </div>
                      {vac.notes && (
                        <p className="text-base text-slate-700 mt-1">
                          {vac.notes}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => onDeleteVaccine(pet.id, vac.id)}
                      className="text-slate-600 hover:text-rose-700 p-2 min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl"
                      title="Eliminar vacuna"
                      aria-label={`Eliminar vacuna ${vac.name}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Fechas de aplicación y próxima dosis */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-base bg-slate-100 p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-700 block font-bold text-base">
                        Última aplicación:
                      </span>
                      <span className="text-slate-950 font-bold flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-5 h-5 text-slate-600" />
                        {formatReadableDate(vac.applicationDate)}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-700 block font-bold text-base">
                        Próxima dosis:
                      </span>
                      <span
                        className={`font-black flex items-center gap-1.5 mt-0.5 ${
                          isVencida
                            ? 'text-rose-800'
                            : isPorVencer
                            ? 'text-amber-900'
                            : 'text-emerald-800'
                        }`}
                      >
                        <Clock className="w-5 h-5" />
                        {formatReadableDate(vac.nextDoseDate)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 text-base pt-1">
                    <span className="text-slate-700 font-medium">
                      Frecuencia: cada {vac.intervalValue} {vac.intervalUnit}
                    </span>
                    <span
                      className={`font-black ${
                        isVencida
                          ? 'text-rose-800 underline'
                          : isPorVencer
                          ? 'text-amber-800'
                          : 'text-slate-800'
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
