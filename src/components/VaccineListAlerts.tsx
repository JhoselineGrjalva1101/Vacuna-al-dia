import React, { useState } from 'react';
import { Pet, VaccineAlertItem, VaccineUrgency } from '../types/pet';
import { 
  getDaysRemaining, 
  getVaccineUrgency, 
  getRemainingDaysLabel, 
  formatReadableDate,
  formatLocalDateToInput,
  calculateNextDoseDate
} from '../utils/dateCalculations';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Syringe, 
  Calendar, 
  Clock, 
  Filter, 
  RotateCw 
} from 'lucide-react';

interface VaccineListAlertsProps {
  pets: Pet[];
  onUpdateVaccineDose: (petId: string, vaccineId: string, newApplicationDate: string) => void;
  onOpenAddPet: () => void;
}

/**
 * FUNCIÓN 3 REQUERIDA: Lista de vacunas vencidas o por vencer.
 * 
 * Este componente recopila todas las vacunas de todas las mascotas,
 * calcula en tiempo real su estatus de vencimiento y permite al dueño
 * filtrar rápidamente por vacunas urgentes y registrar la nueva dosis con 1 clic.
 */
export const VaccineListAlerts: React.FC<VaccineListAlertsProps> = ({
  pets,
  onUpdateVaccineDose,
  onOpenAddPet,
}) => {
  const [filter, setFilter] = useState<'urgentes' | 'vencidas' | 'por_vencer' | 'al_dia' | 'todas'>('urgentes');
  const [confirmingDose, setConfirmingDose] = useState<{ petId: string; vaccineId: string; vaccineName: string; petName: string } | null>(null);

  // 1. Extraemos y aplanamos todas las vacunas de todas las mascotas con su cálculo de urgencia
  const allAlertItems: VaccineAlertItem[] = pets.flatMap((pet) =>
    pet.vaccines.map((vac) => {
      const days = getDaysRemaining(vac.nextDoseDate);
      const urgency = getVaccineUrgency(vac.nextDoseDate);
      return {
        petId: pet.id,
        petName: pet.name,
        petSpecies: pet.species,
        vaccine: vac,
        urgency,
        daysRemaining: days,
      };
    })
  );

  // ⚠️ TRAMPA HABITUAL: 
  // Ordenar fechas como strings 'YYYY-MM-DD' funciona por ser ISO, 
  // pero ordenar por días restantes directamente garantiza precisión numérica absoluta.
  const sortedItems = [...allAlertItems].sort((a, b) => a.daysRemaining - b.daysRemaining);

  // Conteo para insignias y métricas
  const countVencidas = sortedItems.filter((i) => i.urgency === 'vencida').length;
  const countPorVencer = sortedItems.filter((i) => i.urgency === 'por_vencer').length;
  const countAlDia = sortedItems.filter((i) => i.urgency === 'al_dia').length;

  // Filtrado según selección
  const filteredItems = sortedItems.filter((item) => {
    if (filter === 'urgentes') return item.urgency === 'vencida' || item.urgency === 'por_vencer';
    if (filter === 'vencidas') return item.urgency === 'vencida';
    if (filter === 'por_vencer') return item.urgency === 'por_vencer';
    if (filter === 'al_dia') return item.urgency === 'al_dia';
    return true; // 'todas'
  });

  const handleApplyToday = () => {
    if (!confirmingDose) return;
    const todayStr = formatLocalDateToInput(new Date());
    onUpdateVaccineDose(confirmingDose.petId, confirmingDose.vaccineId, todayStr);
    setConfirmingDose(null);
  };

  return (
    <div className="space-y-4">
      {/* Resumen Superior de Alertas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <button
          onClick={() => setFilter('vencidas')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            filter === 'vencidas'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400'
              : 'bg-white border-rose-100 hover:bg-rose-50/50'
          }`}
        >
          <div className="flex items-center justify-between text-rose-600 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Vencidas</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-rose-700">{countVencidas}</p>
          <p className="text-[11px] text-rose-500 font-medium mt-0.5">Requieren atención</p>
        </button>

        <button
          onClick={() => setFilter('por_vencer')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            filter === 'por_vencer'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400'
              : 'bg-white border-amber-100 hover:bg-amber-50/50'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Por vencer</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-amber-700">{countPorVencer}</p>
          <p className="text-[11px] text-amber-500 font-medium mt-0.5">Próximos 30 días</p>
        </button>

        <button
          onClick={() => setFilter('al_dia')}
          className={`col-span-2 sm:col-span-1 p-3 rounded-2xl border text-left transition-all ${
            filter === 'al_dia'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400'
              : 'bg-white border-emerald-100 hover:bg-emerald-50/50'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Al día</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{countAlDia}</p>
          <p className="text-[11px] text-emerald-500 font-medium mt-0.5">Protección vigente</p>
        </button>
      </div>

      {/* Selector de filtros mobile-friendly */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-medium">
        <span className="text-slate-400 flex items-center gap-1 pl-1">
          <Filter className="w-3.5 h-3.5" />
        </span>
        <button
          onClick={() => setFilter('urgentes')}
          className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
            filter === 'urgentes'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          🚨 Atención urgente ({countVencidas + countPorVencer})
        </button>
        <button
          onClick={() => setFilter('vencidas')}
          className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
            filter === 'vencidas'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Vencidas ({countVencidas})
        </button>
        <button
          onClick={() => setFilter('por_vencer')}
          className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
            filter === 'por_vencer'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Por vencer ({countPorVencer})
        </button>
        <button
          onClick={() => setFilter('al_dia')}
          className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
            filter === 'al_dia'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Al día ({countAlDia})
        </button>
        <button
          onClick={() => setFilter('todas')}
          className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
            filter === 'todas'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Todas ({sortedItems.length})
        </button>
      </div>

      {/* Lista de Vacunas */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="font-semibold text-slate-800">
            {filter === 'urgentes' || filter === 'vencidas'
              ? '¡Excelente! No hay vacunas pendientes'
              : 'No se encontraron vacunas en esta categoría'}
          </h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
            {pets.length === 0
              ? 'Aún no registraste ninguna mascota en la aplicación.'
              : 'Todas las dosis de tus mascotas registradas se encuentran vigentes.'}
          </p>
          {pets.length === 0 && (
            <button
              onClick={onOpenAddPet}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700"
            >
              Registrar primera mascota
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isVencida = item.urgency === 'vencida';
            const isPorVencer = item.urgency === 'por_vencer';

            return (
              <div
                key={`${item.petId}-${item.vaccine.id}`}
                className={`bg-white rounded-2xl p-4 border transition-all shadow-xs ${
                  isVencida
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : isPorVencer
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Encabezado: Mascota y Estado */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-800 text-sm">
                        <span>{item.petSpecies === 'perro' ? '🐶' : item.petSpecies === 'gato' ? '🐱' : '🐾'}</span>
                        <span>{item.petName}</span>
                      </span>

                      {isVencida && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                          <AlertCircle className="w-3 h-3" />
                          VENCIDA
                        </span>
                      )}
                      {isPorVencer && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" />
                          POR VENCER
                        </span>
                      )}
                      {!isVencida && !isPorVencer && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          AL DÍA
                        </span>
                      )}
                    </div>

                    {/* Nombre de la Vacuna */}
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {item.vaccine.name}
                    </h3>

                    {/* Notas si existen */}
                    {item.vaccine.notes && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {item.vaccine.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Datos de Fechas */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Última aplicación
                    </span>
                    <span className="font-medium text-slate-700 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatReadableDate(item.vaccine.applicationDate)}
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
                      <Clock className="w-3.5 h-3.5" />
                      {formatReadableDate(item.vaccine.nextDoseDate)}
                    </span>
                  </div>
                </div>

                {/* Cuenta Regresiva y Botón de Acción */}
                <div className="mt-3 pt-2.5 flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-semibold ${
                      isVencida
                        ? 'text-rose-600'
                        : isPorVencer
                        ? 'text-amber-700'
                        : 'text-slate-500'
                    }`}
                  >
                    {getRemainingDaysLabel(item.daysRemaining)}
                  </span>

                  {/* Botón rápido para marcar que se le acaba de aplicar la dosis */}
                  <button
                    onClick={() =>
                      setConfirmingDose({
                        petId: item.petId,
                        vaccineId: item.vaccine.id,
                        vaccineName: item.vaccine.name,
                        petName: item.petName,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 rounded-xl text-xs font-medium transition-colors"
                    title="Registrar que ya se le aplicó la dosis hoy"
                  >
                    <Syringe className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Aplicada hoy</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de confirmación rápida de aplicación */}
      {confirmingDose && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <RotateCw className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">
                ¿Aplicar dosis hoy?
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Se actualizará la vacuna <strong>{confirmingDose.vaccineName}</strong> de{' '}
                <strong>{confirmingDose.petName}</strong> con la fecha de hoy. La próxima dosis
                se recalculará automáticamente según su frecuencia.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDose(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApplyToday}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
