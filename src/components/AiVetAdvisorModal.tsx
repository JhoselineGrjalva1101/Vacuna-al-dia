import React, { useState, useEffect } from 'react';
import { Pet, Vaccine } from '../types/pet';
import { VetAdvisorResponse, RecommendedVaccineItem } from '../types/aiAdvisor';
import { getAiVetAdvisor } from '../services/aiAdvisorService';
import { formatLocalDateToInput, calculateNextDoseDate } from '../utils/dateCalculations';
import {
  X,
  Sparkles,
  Bot,
  AlertCircle,
  Copy,
  Check,
  Plus,
  RefreshCw,
  Clock,
  ShieldAlert,
  HelpCircle,
  Layers
} from 'lucide-react';

interface AiVetAdvisorModalProps {
  isOpen: boolean;
  pet: Pet | null;
  onClose: () => void;
  onAddVaccineToPet: (petId: string, vaccine: Vaccine) => void;
}

export const AiVetAdvisorModal: React.FC<AiVetAdvisorModalProps> = ({
  isOpen,
  pet,
  onClose,
  onAddVaccineToPet,
}) => {
  const [loading, setLoading] = useState(false);
  const [advisorData, setAdvisorData] = useState<VetAdvisorResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState(false);
  const [copiedQuestionIndex, setCopiedQuestionIndex] = useState<number | null>(null);
  const [addedVaccines, setAddedVaccines] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen && pet) {
      handleFetchAdvisor(false);
    } else {
      setAdvisorData(null);
      setErrorMessage(null);
      setAddedVaccines({});
    }
  }, [isOpen, pet]);

  if (!isOpen || !pet) return null;

  const handleFetchAdvisor = async (useMock: boolean) => {
    setLoading(true);
    setErrorMessage(null);
    setIsMockMode(useMock);

    try {
      const result = await getAiVetAdvisor(pet, useMock);
      setAdvisorData(result.data);
      setIsMockMode(result.isMock);
    } catch (err: any) {
      setErrorMessage(err?.message || 'No fue posible cargar el calendario de la IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyQuestion = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestionIndex(index);
    setTimeout(() => setCopiedQuestionIndex(null), 2500);
  };

  const handleRegisterRecommendedVaccine = (vac: RecommendedVaccineItem) => {
    const todayStr = formatLocalDateToInput(new Date());
    // Estimamos el intervalo numérico en base a la frecuencia sugerida
    const intervalMonths = vac.frequency.toLowerCase().includes('21') ? 1 : 12;

    const newVac: Vaccine = {
      id: `vac-ai-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: vac.name,
      applicationDate: todayStr,
      intervalValue: intervalMonths,
      intervalUnit: intervalMonths === 1 ? 'dias' : 'meses',
      notes: `Sugerida por Asesor IA: ${vac.purpose}`,
      nextDoseDate: calculateNextDoseDate(todayStr, intervalMonths, intervalMonths === 1 ? 'dias' : 'meses'),
    };

    onAddVaccineToPet(pet.id, newVac);
    setAddedVaccines((prev) => ({ ...prev, [vac.name]: true }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[94vh] flex flex-col border-2 border-slate-400 animate-in fade-in duration-150">
        
        {/* Cabecera del Asesor */}
        <div className="px-5 py-4 border-b-2 border-slate-200 flex items-center justify-between shrink-0 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white leading-tight">
                  Asesor Veterinario IA
                </h2>
                <span className="text-sm font-bold px-2 py-0.5 rounded-lg bg-emerald-800 text-emerald-100 border border-emerald-500">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-base text-slate-300">
                Plan preventivo personalizado para {pet.name} ({pet.species === 'perro' ? 'Perro 🐶' : 'Gato 🐱'}, {pet.ageYears} años)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 min-h-[48px] min-w-[48px] flex items-center justify-center"
            aria-label="Cerrar asesor"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Barra de Modo de Consulta (API en vivo vs Prueba sin costo) */}
        <div className="px-4 py-2.5 bg-slate-100 border-b-2 border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-base text-slate-800 font-semibold">
            <Bot className="w-5 h-5 text-emerald-800" />
            <span>
              {isMockMode
                ? 'Modo: Datos de prueba (0 consumo)'
                : 'Modo: Gemini API en vivo'}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleFetchAdvisor(true)}
              className={`px-3 py-1.5 rounded-xl border-2 font-bold text-base min-h-[44px] transition-colors ${
                isMockMode
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-800 border-slate-400 hover:bg-slate-200'
              }`}
            >
              Usar datos de prueba
            </button>
            <button
              onClick={() => handleFetchAdvisor(false)}
              disabled={loading}
              className={`px-3 py-1.5 rounded-xl border-2 font-black text-base min-h-[44px] transition-colors inline-flex items-center gap-1.5 ${
                !isMockMode
                  ? 'bg-emerald-800 text-white border-emerald-900'
                  : 'bg-white text-emerald-950 border-emerald-500 hover:bg-emerald-50'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Consultar IA en vivo</span>
            </button>
          </div>
        </div>

        {/* Contenido con Scroll */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-6">
          
          {/* ESTADO DE CARGA */}
          {loading && (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-800 border-t-transparent animate-spin mx-auto" />
              <div>
                <h3 className="text-xl font-black text-slate-950">
                  Analizando especie, edad y vacunas de {pet.name}...
                </h3>
                <p className="text-base text-slate-700 mt-1 max-w-sm mx-auto">
                  La IA está armando el calendario de dosis y redactando las preguntas clave para el veterinario.
                </p>
              </div>
            </div>
          )}

          {/* MANEJO DE FALLO VISIBLE (Requisito 4) */}
          {!loading && errorMessage && (
            <div className="p-5 rounded-3xl bg-rose-50 border-2 border-rose-500 text-slate-900 space-y-4 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-8 h-8 text-rose-800 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xl font-black text-rose-950">
                    No pudimos obtener la respuesta de la IA en este momento
                  </h4>
                  <p className="text-base text-slate-800 mt-1 leading-relaxed">
                    {errorMessage}
                  </p>
                </div>
              </div>

              {/* Solución de rescate: Cargar datos de prueba sin costo */}
              <div className="pt-2 border-t-2 border-rose-200">
                <button
                  onClick={() => handleFetchAdvisor(true)}
                  className="w-full sm:w-auto px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-base rounded-2xl min-h-[48px] inline-flex items-center justify-center gap-2"
                >
                  <Layers className="w-5 h-5" />
                  <span>Ver guía y preguntas veterinarias de prueba recomendadas</span>
                </button>
              </div>
            </div>
          )}

          {/* REQUISITO 2: CONSUME EL JSON Y LO MUESTRA COMO DATO (NO COMO PÁRRAFO) */}
          {!loading && advisorData && (
            <div className="space-y-6">
              
              {/* Tarjeta de Resumen Diagnóstico */}
              <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50 border-2 border-emerald-400 space-y-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-base font-black px-3 py-1 rounded-xl bg-emerald-800 text-white">
                    Etapa: {advisorData.petStage}
                  </span>
                  <span className="text-base font-bold text-emerald-950">
                    Especie: {advisorData.species.toUpperCase()}
                  </span>
                </div>
                <p className="text-lg font-bold text-emerald-950 pt-1 leading-snug">
                  {advisorData.summaryNote}
                </p>
              </div>

              {/* SECCIÓN 1: DATO ESTRUCTURADO - Calendario de Vacunas Recomendadas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-950 flex items-center gap-2">
                    <ShieldAlert className="w-6 h-6 text-emerald-800" />
                    <span>Calendario de Vacunas ({advisorData.recommendedVaccines.length})</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {advisorData.recommendedVaccines.map((vac) => {
                    const isAdded = addedVaccines[vac.name];
                    const isObligatoria = vac.urgencyLevel === 'obligatoria';
                    const isRecomendada = vac.urgencyLevel === 'recomendada';

                    return (
                      <div
                        key={vac.name}
                        className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-slate-300 shadow-xs space-y-2.5"
                      >
                        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                          <h4 className="text-lg font-black text-slate-950">
                            {vac.name}
                          </h4>

                          {/* Insignia de urgencia */}
                          <div>
                            {isObligatoria && (
                              <span className="text-base font-black px-2.5 py-1 rounded-lg bg-rose-800 text-white">
                                Obligatoria
                              </span>
                            )}
                            {isRecomendada && (
                              <span className="text-base font-black px-2.5 py-1 rounded-lg bg-amber-700 text-white">
                                Recomendada
                              </span>
                            )}
                            {!isObligatoria && !isRecomendada && (
                              <span className="text-base font-bold px-2.5 py-1 rounded-lg bg-blue-800 text-white">
                                Opcional
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Metadatos en cajas de datos estructurados */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-base bg-slate-100 p-3 rounded-xl border border-slate-200">
                          <div>
                            <span className="block font-bold text-slate-700">Frecuencia sugerida:</span>
                            <span className="font-extrabold text-slate-950 flex items-center gap-1.5 mt-0.5">
                              <Clock className="w-5 h-5 text-slate-700" />
                              {vac.frequency}
                            </span>
                          </div>
                          <div>
                            <span className="block font-bold text-slate-700">Momento o condición:</span>
                            <span className="font-bold text-slate-900 mt-0.5 block">
                              {vac.targetAgeOrCondition}
                            </span>
                          </div>
                        </div>

                        <p className="text-base text-slate-800 leading-relaxed font-medium">
                          <strong>Protección:</strong> {vac.purpose}
                        </p>

                        {/* Acción para incorporar la vacuna sugerida a la mascota */}
                        <div className="pt-1">
                          {isAdded ? (
                            <span className="inline-flex items-center gap-1.5 text-base font-bold text-emerald-800 bg-emerald-100 px-3 py-2 rounded-xl border border-emerald-300">
                              <Check className="w-5 h-5" />
                              <span>¡Vacuna agregada a la ficha de {pet.name}!</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRegisterRecommendedVaccine(vac)}
                              className="w-full xs:w-auto px-4 py-2.5 rounded-xl border-2 border-emerald-800 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-bold text-base min-h-[48px] inline-flex items-center justify-center gap-2 transition-colors"
                            >
                              <Plus className="w-5 h-5 text-emerald-800" />
                              <span>Registrar esta dosis en {pet.name}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECCIÓN 2: DATO ESTRUCTURADO - Preguntas Clave para el Veterinario */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-950 flex items-center gap-2">
                    <HelpCircle className="w-6 h-6 text-blue-800" />
                    <span>Preguntas Estratégicas para la Consulta ({advisorData.veterinarianQuestions.length})</span>
                  </h3>
                </div>

                <div className="space-y-3">
                  {advisorData.veterinarianQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-slate-300 shadow-xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-base font-black px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-950 border border-blue-400">
                          {q.category}
                        </span>

                        <button
                          onClick={() => handleCopyQuestion(q.question, idx)}
                          className="px-3 py-1.5 border-2 border-slate-400 hover:bg-slate-100 text-slate-800 font-bold text-base rounded-xl min-h-[44px] inline-flex items-center gap-1.5 transition-colors"
                          title="Copiar pregunta para enviar por WhatsApp o recordar en la visita"
                        >
                          {copiedQuestionIndex === idx ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-700" />
                              <span className="text-emerald-800">¡Copiada!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copiar pregunta</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-lg font-black text-slate-950 leading-snug">
                        "{q.question}"
                      </p>

                      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-base text-slate-800">
                        <strong>Por qué preguntar esto:</strong> {q.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
