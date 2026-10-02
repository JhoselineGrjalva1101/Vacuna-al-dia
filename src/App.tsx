import { useState, useEffect } from 'react';
import { Pet, Vaccine, ClinicalRecord } from './types/pet';
import { INITIAL_PETS } from './data/initialData';
import { calculateNextDoseDate } from './utils/dateCalculations';
import { loadPetsFromStorage, savePetsToStorage, clearPetsFromStorage } from './utils/storage';
import { VaccineListAlerts } from './components/VaccineListAlerts';
import { PetCard } from './components/PetCard';
import { PetFormModal } from './components/PetFormModal';
import { AddVaccineModal } from './components/AddVaccineModal';
import { ClinicalHistoryModal } from './components/ClinicalHistoryModal';
import { BackupModal } from './components/BackupModal';
import { 
  Bell, 
  Plus, 
  RotateCcw,
  Sparkles,
  HardDrive,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  // -------------------------------------------------------------
  // ESTADO Y PERSISTENCIA (LocalStorage centralizado)
  // -------------------------------------------------------------
  const [pets, setPets] = useState<Pet[]>(() => loadPetsFromStorage());
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Guardar en localStorage cada vez que cambien las mascotas
  useEffect(() => {
    savePetsToStorage(pets);
  }, [pets]);

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Pestaña activa ('alertas' = lista de vencidas/por vencer, 'mascotas' = lista de mascotas)
  const [activeTab, setActiveTab] = useState<'alertas' | 'mascotas'>('alertas');

  // Modales
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
  const [selectedPetForVaccine, setSelectedPetForVaccine] = useState<Pet | null>(null);
  const [selectedPetForHistory, setSelectedPetForHistory] = useState<Pet | null>(null);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // -------------------------------------------------------------
  // ACCIONES CRUD CON MENSAJES CLAROS EN ESPAÑOL
  // -------------------------------------------------------------

  // Función 1: Registrar nueva mascota con especie, edad y vacunas
  const handleSavePet = (newPet: Pet) => {
    setPets((prev) => [newPet, ...prev]);
    showNotification(`¡${newPet.name} fue guardado con éxito! Sus vacunas ya están en seguimiento.`);
  };

  // Eliminar mascota
  const handleDeletePet = (petId: string) => {
    const targetPet = pets.find((p) => p.id === petId);
    if (!targetPet) return;
    const confirmDelete = window.confirm(
      `¿Confirmas que deseas eliminar a ${targetPet.name} y todo su historial?`
    );
    if (confirmDelete) {
      setPets((prev) => prev.filter((p) => p.id !== petId));
      showNotification(`Se eliminó a ${targetPet.name} del registro.`);
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
    showNotification('¡Entrada guardada en el historial médico correctamente!');
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
    showNotification('Se eliminó el registro del historial clínico.');
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
    showNotification(`¡Vacuna "${vaccine.name}" registrada! Ya calculamos su próxima dosis.`);
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
    showNotification('Se eliminó la vacuna de la lista.');
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
    showNotification('¡Dosis registrada como aplicada hoy! Calculamos automáticamente la próxima fecha.');
  };

  // Restaurar datos de prueba iniciales
  const handleResetSampleData = () => {
    if (window.confirm('¿Deseas restaurar las mascotas de demostración (Toby y Michi)?')) {
      setPets(INITIAL_PETS);
      savePetsToStorage(INITIAL_PETS);
      showNotification('Se cargaron las mascotas de ejemplo correctamente.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans pb-16 w-full max-w-full overflow-x-hidden">
      
      {/* Toast de Éxito Visible (Requisito 6) */}
      {successToast && (
        <div className="fixed top-4 left-3 right-3 sm:left-auto sm:right-4 z-50 max-w-md bg-emerald-900 border-2 border-emerald-400 text-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-7 h-7 text-emerald-300 shrink-0" />
          <p className="text-base font-bold leading-tight">{successToast}</p>
        </div>
      )}

      {/* Barra Superior / Header - Optimizado desde 320px de ancho */}
      <header className="bg-white border-b-2 border-slate-300 sticky top-0 z-40 shadow-xs">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2.5">
          
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-black text-2xl shadow-xs shrink-0">
              🐾
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-950 tracking-tight leading-tight">
                Vacuna al Día
              </h1>
              <p className="text-base text-slate-700 font-semibold">
                Control de dosis y salud
              </p>
            </div>
          </div>

          {/* Acciones del Header con clara jerarquía visual */}
          <div className="flex items-center gap-2">
            {/* Botón SECUNDARIO */}
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="flex-1 xs:flex-none inline-flex items-center justify-center gap-2 px-3 py-3 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-600 rounded-xl text-base font-bold transition-colors min-h-[48px]"
              title="Copia de seguridad y exportar datos a archivo JSON"
            >
              <HardDrive className="w-5 h-5 text-blue-800" />
              <span>Respaldo</span>
            </button>

            {/* ÚNICO BOTÓN PRINCIPAL DE LA PANTALLA PRINCIPAL (Requisito 4) */}
            <button
              onClick={() => setIsAddPetModalOpen(true)}
              className="flex-1 xs:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white rounded-xl text-base font-black transition-all shadow-md min-h-[48px]"
            >
              <Plus className="w-5 h-5" />
              <span>Registrar Mascota</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal - Todo >= 16px y alto contraste para leer al sol */}
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4 w-full flex-1 space-y-4">
        
        {/* Banner Informativo con Alto Contraste */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border-2 border-slate-800 shadow-sm space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800 text-white text-base font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-emerald-300" />
            Protección al día
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
            Nunca más se te vencerá una vacuna por olvido
          </h2>
          <p className="text-base text-slate-200 leading-relaxed font-medium">
            Calculamos automáticamente la fecha exacta de la próxima dosis y te avisamos con tiempo antes de que expire.
          </p>
        </div>

        {/* Pestañas de Navegación Grandes y Cómodas para el Pulgar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-200 p-1.5 rounded-2xl border-2 border-slate-300">
          <button
            onClick={() => setActiveTab('alertas')}
            className={`py-3.5 px-3 rounded-xl transition-all font-black text-base flex items-center justify-center gap-2 min-h-[48px] ${
              activeTab === 'alertas'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Bell className="w-5 h-5 text-amber-400" />
            <span>Vacunas y Alertas</span>
          </button>

          <button
            onClick={() => setActiveTab('mascotas')}
            className={`py-3.5 px-3 rounded-xl transition-all font-black text-base flex items-center justify-center gap-2 min-h-[48px] ${
              activeTab === 'mascotas'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span className="text-xl">🐶</span>
            <span>Mis Mascotas ({pets.length})</span>
          </button>
        </div>

        {/* Vista 1: Lista de Vacunas Vencidas o Por Vencer */}
        {activeTab === 'alertas' && (
          <VaccineListAlerts
            pets={pets}
            onUpdateVaccineDose={handleUpdateVaccineDose}
            onOpenAddPet={() => setIsAddPetModalOpen(true)}
          />
        )}

        {/* Vista 2: Mascotas Registradas */}
        {activeTab === 'mascotas' && (
          <div className="space-y-4">
            
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
              <div>
                <h3 className="text-xl font-black text-slate-950">
                  Tus mascotas registradas
                </h3>
                <p className="text-base text-slate-700 font-semibold">
                  {pets.length} {pets.length === 1 ? 'mascota' : 'mascotas'} bajo control
                </p>
              </div>

              {/* Botón secundario para agregar cuando ya hay mascotas */}
              {pets.length > 0 && (
                <button
                  onClick={() => setIsAddPetModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-emerald-800 bg-emerald-50 text-emerald-950 font-bold text-base hover:bg-emerald-100 min-h-[48px]"
                >
                  <Plus className="w-5 h-5 text-emerald-800" />
                  <span>+ Agregar otra</span>
                </button>
              )}
            </div>

            {/* ESTADO VACÍO (Requisito 5: Frase clara que invita a la acción) */}
            {pets.length === 0 ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 text-center border-2 border-slate-300 space-y-4 shadow-sm">
                <div className="text-5xl">🐶</div>
                <div>
                  <h4 className="font-black text-slate-950 text-2xl">
                    Todavía no tienes mascotas registradas
                  </h4>
                  <p className="text-base text-slate-800 mt-2 max-w-md mx-auto leading-relaxed font-medium">
                    Empecemos registrando a tu perro o gato para calcular sus próximas vacunas y que nunca más se te pasen de fecha.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  {/* ÚNICO BOTÓN PRINCIPAL DEL ESTADO VACÍO */}
                  <button
                    onClick={() => setIsAddPetModalOpen(true)}
                    className="w-full sm:w-auto px-6 py-4 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white rounded-2xl text-base font-black shadow-md min-h-[52px] inline-flex items-center justify-center gap-2"
                  >
                    <Plus className="w-6 h-6" />
                    <span>Registrar primera mascota</span>
                  </button>

                  {/* Botón secundario */}
                  <button
                    onClick={handleResetSampleData}
                    className="w-full sm:w-auto px-4 py-3 bg-white border-2 border-slate-600 text-slate-900 rounded-2xl text-base font-bold hover:bg-slate-100 min-h-[50px] inline-flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5 text-slate-700" />
                    <span>Cargar mascotas de prueba</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
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

        {/* Pie con opción de restaurar */}
        <div className="pt-4 text-center">
          <button
            onClick={handleResetSampleData}
            className="text-base text-slate-700 hover:text-slate-950 underline font-semibold p-2 min-h-[48px] inline-flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Restaurar datos de muestra (Toby y Michi)</span>
          </button>
        </div>
      </main>

      {/* Modal para Registrar Mascota */}
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

      {/* Modal de Copia de Seguridad */}
      <BackupModal
        isOpen={isBackupModalOpen}
        pets={pets}
        onClose={() => setIsBackupModalOpen(false)}
        onRestorePets={(restoredPets) => {
          setPets(restoredPets);
          showNotification('¡Datos restaurados con éxito desde el archivo!');
        }}
        onClearStorage={() => {
          clearPetsFromStorage();
          setPets([]);
          showNotification('Todos los datos fueron borrados de este celular.');
        }}
      />
    </div>
  );
}
