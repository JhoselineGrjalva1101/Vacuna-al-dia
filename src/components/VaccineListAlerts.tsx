import React, { useState } from 'react';
import { Pet, VaccineAlertItem } from '../types/pet';
import { 
  getDaysRemaining, 
  getVaccineUrgency, 
  getRemainingDaysLabel, 
  formatReadableDate,
  formatLocalDateToInput 
} from '../utils/dateCalculations';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Syringe, 
  Calendar, 
  Clock, 
  RotateCw,
  Plus
} from 'lucide-react';

interface VaccineListAlertsProps {
  pets: Pet[];
  onUpdateVaccineDose: (petId: string, vaccineId: string, newApplicationDate: string) => void;
  onOpenAddPet: () => void;
}

export const VaccineListAlerts: React.FC<VaccineListAlertsProps> = ({
  pets,
  onUpdateVaccineDose,
  onOpenAddPet,
}) => {
  const [filter, setFilter] = useState<'urgentes' | 'vencidas' | 'por_vencer' | 'al_dia' | 'todas'>('urgentes');
  const [confirmingDose, setConfirmingDose] = useState<{ petId: string; vaccineId: string; vaccineName: string; petName: string } | null>(null);

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

  const sortedItems = [...allAlertItems].sort((a, b) => a.daysRemaining - b.daysRemaining);

  const countVencidas = sortedItems.filter((i) => i.urgency === 'vencida').length;
  const countPorVencer = sortedItems.filter((i) => i.urgency === 'por_vencer').length;
  const countAlDia = sortedItems.filter((i) => i.urgency === 'al_dia').length;

  const filteredItems = sortedItems.filter((item) => {
    if (filter === 'urgentes') return item.urgency === 'vencida' || item.urgency === 'por_vencer';
    if (filter === 'vencidas') return item.urgency === 'vencida';
    if (filter === 'por_vencer') return item.urgency === 'por_vencer';
    if (filter === 'al_dia') return item.urgency === 'al_dia';
    return true;
  });

  const handleApplyToday = () => {
    if (!confirmingDose) return;
    const todayStr = formatLocalDateToInput(new Date());
    onUpdateVaccineDose(confirmingDose.petId, confirmingDose.vaccineId, todayStr);
    setConfirmingDose(null);
  };

  return (
    <div className="space-y-4 w-full">
      {/* Resumen Superior de Estado - Alto Contraste para el Sol */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setFilter('vencidas')}
          className={`p-4 rounded-2xl border-2 text-left transition-all min-h-[56px] ${
            filter === 'vencidas'
              ? 'bg-rose-100 border-rose-800 ring-2 ring-rose-800'
              : 'bg-white border-rose-300 hover:bg-rose-50'
          }`}
        >
          <div className="flex items-center justify-between text-rose-900 font-bold mb-1">
            <span className="text-base uppercase tracking-wide">Vencidas</span>
            <AlertCircle className="w-6 h-6 text-rose-800" />
          </div>
          <p className="text-3xl font-black text-rose-950">{countVencidas}</p>
          <p className="text-base font-semibold text-rose-900 mt-1">Requieren atención hoy</p>
        </button>

        <button
          onClick={() => setFilter('por_vencer')}
          className={`p-4 rounded-2xl border-2 text-left transition-all min-h-[56px] ${
            filter === 'por_vencer'
              ? 'bg-amber-100 border-amber-800 ring-2 ring-amber-800'
              : 'bg-white border-amber-300 hover:bg-amber-50'
          }`}
        >
          <div className="flex items-center justify-between text-amber-950 font-bold mb-1">
            <span className="text-base uppercase tracking-wide">Por vencer</span>
            <AlertTriangle className="w-6 h-6 text-amber-800" />
          </div>
          <p className="text-3xl font-black text-amber-950">{countPorVencer}</p>
          <p className="text-base font-semibold text-amber-950 mt-1">Próximos 30 días</p>
        </button>

        <button
          onClick={() => setFilter('al_dia')}
          className={`p-4 rounded-2xl border-2 text-left transition-all min-h-[56px] ${
            filter === 'al_dia'
              ? 'bg-emerald-100 border-emerald-800 ring-2 ring-emerald-800'
              : 'bg-white border-emerald-300 hover:bg-emerald-50'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-950 font-bold mb-1">
            <span className="text-base uppercase tracking-wide">Al día</span>
            <CheckCircle2 className="w-6 h-6 text-emerald-800" />
          </div>
          <p className="text-3xl font-black text-emerald-950">{countAlDia}</p>
          <p className="text-base font-semibold text-emerald-900 mt-1">Protegidos</p>
        </button>
      </div>

      {/* Selector de filtros visible y táctil (mínimo 48px de alto y texto 16px) */}
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          onClick={() => setFilter('urgentes')}
          className={`px-4 py-2.5 rounded-xl font-bold min-h-[48px] border-2 transition-colors ${
            filter === 'urgentes'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-900 border-slate-400 hover:bg-slate-100'
          }`}
        >
          🚨 Urgentes ({countVencidas + countPorVencer})
        </button>
        <button
          onClick={() => setFilter('vencidas')}
          className={`px-4 py-2.5 rounded-xl font-bold min-h-[48px] border-2 transition-colors ${
            filter === 'vencidas'
              ? 'bg-rose-800 text-white border-rose-900'
              : 'bg-white text-rose-900 border-rose-400 hover:bg-rose-50'
          }`}
        >
          Vencidas ({countVencidas})
        </button>
        <button
          onClick={() => setFilter('por_vencer')}
          className={`px-4 py-2.5 rounded-xl font-bold min-h-[48px] border-2 transition-colors ${
            filter === 'por_vencer'
              ? 'bg-amber-700 text-white border-amber-800'
              : 'bg-white text-amber-950 border-amber-400 hover:bg-amber-50'
          }`}
        >
          Por vencer ({countPorVencer})
        </button>
        <button
          onClick={() => setFilter('al_dia')}
          className={`px-4 py-2.5 rounded-xl font-bold min-h-[48px] border-2 transition-colors ${
            filter === 'al_dia'
              ? 'bg-emerald-800 text-white border-emerald-900'
              : 'bg-white text-emerald-950 border-emerald-400 hover:bg-emerald-50'
          }`}
        >
          Al día ({countAlDia})
        </button>
        <button
          onClick={() => setFilter('todas')}
          className={`px-4 py-2.5 rounded-xl font-bold min-h-[48px] border-2 transition-colors ${
            filter === 'todas'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-900 border-slate-400 hover:bg-slate-100'
          }`}
        >
          Todas ({sortedItems.length})
        </button>
      </div>

      {/* ESTADO VACÍO (Requisito 5: Frase clara que invita a la acción) */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 text-center border-2 border-slate-300 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-950">
              {pets.length === 0
                ? '¡Bienvenido! Empecemos por tu mascota'
                : '¡Excelente noticia! No hay vacunas pendientes'}
            </h3>
            <p className="text-base text-slate-800 mt-2 max-w-md mx-auto leading-relaxed">
              {pets.length === 0
                ? 'Registra a tu primer perro o gato para calcular las fechas exactas de sus vacunas y que nunca más se te pasen.'
                : 'Todas las vacunas registradas están al día. Cuando una vacuna esté por vencer dentro de los próximos 30 días, aparecerá aquí automáticamente para recordártelo.'}
            </p>
          </div>

          {pets.length === 0 && (
            <div className="pt-2">
              {/* ÚNICO BOTÓN PRINCIPAL DE ESTA VISTA */}
              <button
                onClick={onOpenAddPet}
                className="w-full sm:w-auto px-6 py-4 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-black rounded-2xl text-base shadow-md transition-transform active:scale-98 min-h-[52px] inline-flex items-center justify-center gap-2"
              >
                <Plus className="w-6 h-6" />
                <span>Registrar primera mascota</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Lista de Tarjetas de Vacunas con Alto Contraste */
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const isVencida = item.urgency === 'vencida';
            const isPorVencer = item.urgency === 'por_vencer';

            return (
              <div
                key={`${item.petId}-${item.vaccine.id}`}
                className={`bg-white rounded-3xl p-4 sm:p-5 border-2 shadow-sm space-y-3 ${
                  isVencida
                    ? 'border-rose-600 bg-rose-50/20'
                    : isPorVencer
                    ? 'border-amber-600 bg-amber-50/20'
                    : 'border-slate-300'
                }`}
              >
                {/* Cabecera de la Tarjeta */}
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {item.petSpecies === 'perro' ? '🐶' : item.petSpecies === 'gato' ? '🐱' : '🐾'}
                    </span>
                    <span className="font-black text-slate-950 text-lg">
                      {item.petName}
                    </span>
                  </div>

                  {/* Insignia de urgencia con contraste máximo */}
                  <div>
                    {isVencida && (
                      <span className="inline-flex items-center gap-1.5 font-black px-3 py-1.5 rounded-xl bg-rose-800 text-white text-base">
                        <AlertCircle className="w-5 h-5" />
                        VENCIDA
                      </span>
                    )}
                    {isPorVencer && (
                      <span className="inline-flex items-center gap-1.5 font-black px-3 py-1.5 rounded-xl bg-amber-700 text-white text-base">
                        <AlertTriangle className="w-5 h-5" />
                        POR VENCER
                      </span>
                    )}
                    {!isVencida && !isPorVencer && (
                      <span className="inline-flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-xl bg-emerald-800 text-white text-base">
                        <CheckCircle2 className="w-5 h-5" />
                        AL DÍA
                      </span>
                    )}
                  </div>
                </div>

                {/* Nombre de la Vacuna */}
                <div>
                  <h4 className="text-xl font-black text-slate-950 leading-tight">
                    {item.vaccine.name}
                  </h4>
                  {item.vaccine.notes && (
                    <p className="text-base text-slate-700 mt-1">
                      {item.vaccine.notes}
                    </p>
                  )}
                </div>

                {/* Fechas de aplicación y próxima dosis con etiquetas visibles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-100 border border-slate-300">
                  <div>
                    <span className="text-slate-700 block font-bold text-base">
                      Última aplicación:
                    </span>
                    <span className="text-slate-950 font-extrabold flex items-center gap-1.5 mt-0.5 text-base">
                      <Calendar className="w-5 h-5 text-slate-700" />
                      {formatReadableDate(item.vaccine.applicationDate)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-700 block font-bold text-base">
                      Próxima dosis recomendada:
                    </span>
                    <span
                      className={`font-black flex items-center gap-1.5 mt-0.5 text-base ${
                        isVencida
                          ? 'text-rose-800'
                          : isPorVencer
                          ? 'text-amber-900'
                          : 'text-emerald-800'
                      }`}
                    >
                      <Clock className="w-5 h-5" />
                      {formatReadableDate(item.vaccine.nextDoseDate)}
                    </span>
                  </div>
                </div>

                {/* Cuenta regresiva y Acción secundaria */}
                <div className="pt-1 flex flex-col xs:flex-row xs:items-center justify-between gap-3">
                  <span
                    className={`font-black text-base ${
                      isVencida
                        ? 'text-rose-900 underline'
                        : isPorVencer
                        ? 'text-amber-900'
                        : 'text-slate-800'
                    }`}
                  >
                    {getRemainingDaysLabel(item.daysRemaining)}
                  </span>

                  {/* Botón SECUNDARIO (Requisito 4: Sólo un botón principal por pantalla) */}
                  <button
                    onClick={() =>
                      setConfirmingDose({
                        petId: item.petId,
                        vaccineId: item.vaccine.id,
                        vaccineName: item.vaccine.name,
                        petName: item.petName,
                      })
                    }
                    className="w-full xs:w-auto px-4 py-3 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 border-2 border-slate-700 rounded-xl font-bold min-h-[48px] transition-colors flex items-center justify-center gap-2 shadow-xs"
                    title="Registrar que ya se le aplicó la dosis hoy"
                  >
                    <Syringe className="w-5 h-5 text-emerald-700" />
                    <span>Aplicada hoy</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de confirmación rápida */}
      {confirmingDose && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border-2 border-slate-400 shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center mx-auto">
              <RotateCw className="w-8 h-8" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-slate-950">
                ¿Aplicaste la dosis hoy?
              </h3>
              <p className="text-base text-slate-800 leading-relaxed">
                Vamos a actualizar la vacuna <strong>{confirmingDose.vaccineName}</strong> de{' '}
                <strong>{confirmingDose.petName}</strong> con la fecha de hoy. La próxima dosis
                se calculará automáticamente.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              {/* Botón secundario */}
              <button
                type="button"
                onClick={() => setConfirmingDose(null)}
                className="w-full py-3.5 px-4 rounded-xl border-2 border-slate-400 text-slate-800 font-bold text-base hover:bg-slate-100 min-h-[48px]"
              >
                Cancelar
              </button>
              {/* ÚNICO BOTÓN PRINCIPAL de esta confirmación */}
              <button
                type="button"
                onClick={handleApplyToday}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-800 text-white font-black text-base hover:bg-emerald-900 min-h-[48px] shadow-md"
              >
                Sí, confirmar dosis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
