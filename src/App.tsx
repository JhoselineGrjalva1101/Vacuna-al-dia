import { useState, useEffect } from 'react';
import { Pet, Vaccine, ClinicalRecord } from './types/pet';
import { INITIAL_PETS } from './data/initialData';
import { calculateNextDoseDate } from './utils/dateCalculations';
import { VaccineListAlerts } from './components/VaccineListAlerts';
import { PetCard } from './components/PetCard';
import { PetFormModal } from './components/PetFormModal';
import { AddVaccineModal } from './components/AddVaccineModal';
import { ClinicalHistoryModal } from './components/ClinicalHistoryModal';
import { 
  Bell, 
  Plus, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

const STORAGE_KEY = 'vacuna_al_dia_pets_v1';

export default function App() {
  // -------------------------------------------------------------
  // ESTADO Y PERSISTENCIA (LocalStorage sin backend por consigna)
  // -------------------------------------------------------------
  // ⚠️ TRAMPA HABITUAL:
  // Si se ejecuta JSON.parse sin try/catch, un dato corrupto en el
  // localStorage del usuario romperá toda la aplicación en el arranque (pantalla blanca).
  const [pets, setPets] = useState<Pet[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error al leer de localStorage:', e);
    }
    return INITIAL_PETS;
  });

  // Guardar en localStorage cada vez que cambien las mascotas
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
    } catch (e) {
      console.error('Error al guardar en localStorage:', e);
    }
  }, [pets]);

  // Pestaña activa ('alertas' = lista de vencidas/por vencer, 'mascotas' = lista de mascotas)
  const [activeTab, setActiveTab] = useState<'alertas' | 'mascotas'>('alertas');

  // Modales
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
  const [selectedPetForVaccine, setSelectedPetForVaccine] = useState<Pet | null>(null);
  const [selectedPetForHistory, setSelectedPetForHistory] = useState<Pet | null>(null);

  // -------------------------------------------------------------
  // ACCIONES CRUD PARA CUMPLIR CON LAS 3 FUNCIONES
  // -------------------------------------------------------------

  // Función 1: Registrar nueva mascota con especie, edad y vacunas
  const handleSavePet = (newPet: Pet) => {
    setPets((prev) => [newPet, ...prev]);
  };

  // Eliminar mascota
  const handleDeletePet = (petId: string) => {
    const targetPet = pets.find((p) => p.id === petId);
    if (!targetPet) return;
    const confirmDelete = window.confirm(
      `¿Seguro que deseas eliminar a ${targetPet.name} y todo su historial de vacunas?`
    );
    if (confirmDelete) {
      setPets((prev) => prev.filter((p) => p.id !== petId));
    }
  };

  // Agregar entrada al Historial Clínico Digital
  const handleAddClinicalRecord = (petId: string, record: ClinicalRecord) => {
    setPets((prev) =>
      prev.map((pet) => {
        if (pet.id !== petId) return pet;
        const currentRecords = pet.clinicalRecords || [];
        return {
          ...pet,
          clinicalRecords: [record, ...currentRecords],
        };
      })
    );
  };

  // Eliminar entrada del Historial Clínico Digital
  const handleDeleteClinicalRecord = (petId: string, recordId: string) => {
    setPets((prev) =>
      prev.map((pet) => {
        if (pet.id !== petId) return pet;
        const currentRecords = pet.clinicalRecords || [];
        return {
          ...pet,
          clinicalRecords: currentRecords.filter((r) => r.id !== recordId),
        };
      })
    );
  };

  // Añadir una vacuna a una mascota existente
  const handleAddVaccineToPet = (petId: string, vaccine: Vaccine) => {
    setPets((prev) =>
      prev.map((pet) => {
        if (pet.id !== petId) return pet;
        return {
          ...pet,
          vaccines: [...pet.vaccines, vaccine],
        };
      })
    );
  };

  // Eliminar una vacuna
  const handleDeleteVaccine = (petId: string, vaccineId: string) => {
    setPets((prev) =>
      prev.map((pet) => {
        if (pet.id !== petId) return pet;
        return {
          ...pet,
          vaccines: pet.vaccines.filter((v) => v.id !== vaccineId),
        };
      })
    );
  };

  // Función 2 & 3: Actualizar fecha de dosis aplicada y recalcular automáticamente próxima fecha
  const handleUpdateVaccineDose = (
    petId: string,
    vaccineId: string,
    newApplicationDate: string
  ) => {
    setPets((prev) =>
      prev.map((pet) => {
        if (pet.id !== petId) return pet;

        const updatedVaccines = pet.vaccines.map((vac) => {
          if (vac.id !== vaccineId) return vac;

          // ⚠️ RECALCULO DE LA PRÓXIMA DOSIS
          const recalculatedNextDose = calculateNextDoseDate(
            newApplicationDate,
            vac.intervalValue,
            vac.intervalUnit
          );

          return {
            ...vac,
            applicationDate: newApplicationDate,
            nextDoseDate: recalculatedNextDose,
          };
        });

        return {
          ...pet,
          vaccines: updatedVaccines,
        };
      })
    );
  };

  // Restaurar datos de prueba iniciales si el usuario limpió todo
  const handleResetSampleData = () => {
    if (window.confirm('¿Restaurar las mascotas de ejemplo (Toby y Michi)?')) {
      setPets(INITIAL_PETS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PETS));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Total de vacunas registradas
  const totalVaccines = pets.reduce((acc, p) => acc + p.vaccines.length, 0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans pb-20 sm:pb-8">
      {/* Barra Superior / Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-xs">
              🐾
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                Vacuna al Día
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Control y recordatorios de dosis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddPetModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Registrar Mascota</span>
              <span className="xs:hidden">Registrar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-2xl mx-auto px-4 py-4 w-full flex-1 space-y-4">
        {/* Banner Informativo del Problema que resuelve */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-800/80 text-emerald-200 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-emerald-300" />
              Protección al día
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              No dejes que la vacuna de tu mascota se venza en el olvido
            </h2>
            <p className="text-xs text-emerald-100/90 leading-relaxed max-w-lg">
              Calculamos automáticamente la fecha exacta de la próxima dosis y te mostramos qué vacunas ya vencieron o están próximas a expirar.
            </p>
          </div>
        </div>

        {/* Pestañas de Navegación (Mobile y Desktop) */}
        <div className="flex rounded-2xl bg-slate-200/80 p-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('alertas')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'alertas'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span>Vacunas Vencidas y Próximas</span>
          </button>

          <button
            onClick={() => setActiveTab('mascotas')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'mascotas'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="text-sm">🐶</span>
            <span>Mis Mascotas ({pets.length})</span>
          </button>
        </div>

        {/* Vista 1: Lista de Vacunas Vencidas o Por Vencer (Función 3) */}
        {activeTab === 'alertas' && (
          <VaccineListAlerts
            pets={pets}
            onUpdateVaccineDose={handleUpdateVaccineDose}
            onOpenAddPet={() => setIsAddPetModalOpen(true)}
          />
        )}

        {/* Vista 2: Mascotas Registradas (Función 1) */}
        {activeTab === 'mascotas' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Mascotas Registradas
                </h3>
                <p className="text-xs text-slate-500">
                  Total: {pets.length} {pets.length === 1 ? 'mascota' : 'mascotas'} con {totalVaccines} vacunas
                </p>
              </div>

              <button
                onClick={() => setIsAddPetModalOpen(true)}
                className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Nueva Mascota
              </button>
            </div>

            {pets.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
                <div className="text-4xl mb-3">🐶</div>
                <h4 className="font-bold text-slate-800 text-sm">
                  No tienes mascotas registradas todavía
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Registra a tu perro o gato con su especie, edad y vacunas para calcular sus próximas dosis.
                </p>
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
                  <button
                    onClick={() => setIsAddPetModalOpen(true)}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
                  >
                    Registrar Mascota
                  </button>
                  <button
                    onClick={handleResetSampleData}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 inline-flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Cargar ejemplos
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {pets.map((pet) => (
                  <PetCard
                    key={pet.id}
                    pet={pet}
                    onAddVaccine={() => setSelectedPetForVaccine(pet)}
                    onDeletePet={handleDeletePet}
                    onDeleteVaccine={handleDeleteVaccine}
                    onOpenClinicalHistory={(p) => setSelectedPetForHistory(p)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pie de página con opción de restaurar datos de muestra */}
        <div className="pt-4 text-center">
          <button
            onClick={handleResetSampleData}
            className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Restaurar mascotas de demostración (Toby y Michi)
          </button>
        </div>
      </main>

      {/* Modal para Registrar Mascota (Función 1) */}
      <PetFormModal
        isOpen={isAddPetModalOpen}
        onClose={() => setIsAddPetModalOpen(false)}
        onSavePet={handleSavePet}
      />

      {/* Modal para Agregar Vacuna a Mascota Existente */}
      <AddVaccineModal
        isOpen={Boolean(selectedPetForVaccine)}
        pet={selectedPetForVaccine}
        onClose={() => setSelectedPetForVaccine(null)}
        onAddVaccine={handleAddVaccineToPet}
      />

      {/* Modal del Historial Clínico Digital Interactivo */}
      <ClinicalHistoryModal
        isOpen={Boolean(selectedPetForHistory)}
        pet={selectedPetForHistory ? pets.find((p) => p.id === selectedPetForHistory.id) || null : null}
        onClose={() => setSelectedPetForHistory(null)}
        onAddRecord={handleAddClinicalRecord}
        onDeleteRecord={handleDeleteClinicalRecord}
      />
    </div>
  );
}
