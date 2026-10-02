import { Pet } from '../types/pet';
import { INITIAL_PETS } from '../data/initialData';
import { calculateNextDoseDate } from './dateCalculations';

export const STORAGE_KEY = 'vacuna_al_dia_pets_v1';

export interface StorageSaveResult {
  success: boolean;
  quotaExceeded?: boolean;
}

/**
 * 1. GUARDAR DATOS EN LOCALSTORAGE
 * Con detección de QuotaExceededError (Requisito 9).
 */
export function savePetsToStorage(pets: Pet[]): StorageSaveResult {
  try {
    const serialized = JSON.stringify(pets);
    localStorage.setItem(STORAGE_KEY, serialized);
    return { success: true };
  } catch (error: any) {
    console.error('Error al guardar datos en localStorage:', error);
    const isQuota =
      error?.name === 'QuotaExceededError' ||
      error?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error?.code === 22;
    return { success: false, quotaExceeded: isQuota };
  }
}

/**
 * 2. LEER DATOS DESDE LOCALSTORAGE
 */
export function loadPetsFromStorage(): Pet[] {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      savePetsToStorage(INITIAL_PETS);
      return INITIAL_PETS;
    }

    const parsed = JSON.parse(rawData);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Sanitizar estructura mínima
      return parsed.map(sanitizePet);
    }
  } catch (error) {
    console.error('Error al leer datos desde localStorage (JSON inválido):', error);
  }
  return INITIAL_PETS;
}

/**
 * 3. BORRAR DATOS DE LOCALSTORAGE
 */
export function clearPetsFromStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error al borrar datos de localStorage:', error);
  }
}

/**
 * 4. EXPORTAR DATOS A UN ARCHIVO JSON DE RESPALDO
 */
export function exportPetsToJSONFile(pets: Pet[]): void {
  const exportPayload = {
    app: 'Vacuna al Día',
    version: '1.0',
    exportDate: new Date().toISOString(),
    totalPets: pets.length,
    pets,
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const downloadUrl = URL.createObjectURL(blob);

  const link = document.createElement('a');
  const dateFormatted = new Date().toISOString().split('T')[0];
  link.href = downloadUrl;
  link.download = `vacuna_al_dia_respaldo_${dateFormatted}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}

/**
 * 5. IMPORTAR / RESTAURAR DATOS DESDE UN ARCHIVO JSON
 * Con validación defensiva estricta para evitar crashes en React (Bug 8).
 */
export function importPetsFromJSONFile(file: File): Promise<Pet[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text || text.trim() === '') {
          throw new Error('El archivo seleccionado está vacío.');
        }

        const parsed = JSON.parse(text);

        const rawPetsList = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.pets)
          ? parsed.pets
          : null;

        if (!rawPetsList || rawPetsList.length === 0) {
          throw new Error('El archivo no contiene ninguna mascota válida para restaurar.');
        }

        // Validación estricta de cada elemento
        const validatedPets: Pet[] = rawPetsList.map((item: any, index: number) => {
          if (!item || typeof item !== 'object') {
            throw new Error(`El elemento #${index + 1} del archivo está corrupto.`);
          }

          if (!item.name || typeof item.name !== 'string' || !item.name.trim()) {
            throw new Error(`La mascota #${index + 1} no tiene un nombre válido.`);
          }

          return sanitizePet(item);
        });

        resolve(validatedPets);
      } catch (err: any) {
        reject(err instanceof Error ? err.message : 'Error al procesar el archivo de respaldo.');
      }
    };

    reader.onerror = () => reject('No fue posible leer el archivo desde el dispositivo.');
    reader.readAsText(file);
  });
}

/**
 * Función auxiliar para asegurar que ningún campo obligatorio sea undefined.
 */
function sanitizePet(raw: any): Pet {
  const safeSpecies = ['perro', 'gato', 'otro'].includes(raw.species) ? raw.species : 'otro';
  const safeVaccines = Array.isArray(raw.vaccines)
    ? raw.vaccines.map((v: any) => ({
        id: String(v.id || `vac-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`),
        name: String(v.name || 'Vacuna').trim().substring(0, 50),
        applicationDate: String(v.applicationDate || new Date().toISOString().split('T')[0]),
        intervalValue: Math.max(1, Math.min(365, Number(v.intervalValue) || 12)),
        intervalUnit: ['meses', 'dias', 'anios'].includes(v.intervalUnit) ? v.intervalUnit : 'meses',
        notes: v.notes ? String(v.notes).substring(0, 250) : undefined,
        nextDoseDate: String(
          v.nextDoseDate ||
          calculateNextDoseDate(
            v.applicationDate || new Date().toISOString().split('T')[0],
            v.intervalValue || 12,
            v.intervalUnit || 'meses'
          )
        ),
      }))
    : [];

  const safeClinical = Array.isArray(raw.clinicalRecords)
    ? raw.clinicalRecords.map((c: any) => ({
        id: String(c.id || `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`),
        date: String(c.date || new Date().toISOString().split('T')[0]),
        type: ['consulta', 'tratamiento', 'cirugia', 'desparasitacion', 'estudio', 'urgencia'].includes(c.type)
          ? c.type
          : 'consulta',
        title: String(c.title || 'Consulta').trim().substring(0, 100),
        veterinarian: c.veterinarian ? String(c.veterinarian).substring(0, 80) : undefined,
        clinic: c.clinic ? String(c.clinic).substring(0, 80) : undefined,
        weightKg: c.weightKg && !isNaN(Number(c.weightKg)) ? Math.max(0, Math.min(200, Number(c.weightKg))) : undefined,
        diagnosisNotes: String(c.diagnosisNotes || '').substring(0, 600),
        treatment: c.treatment ? String(c.treatment).substring(0, 250) : undefined,
        followUpDate: c.followUpDate ? String(c.followUpDate) : undefined,
      }))
    : [];

  return {
    id: String(raw.id || `pet-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`),
    name: String(raw.name || 'Mascota').trim().substring(0, 50),
    species: safeSpecies,
    customSpecies: raw.customSpecies ? String(raw.customSpecies).substring(0, 50) : undefined,
    ageYears: Math.max(0, Math.min(30, Number(raw.ageYears) || 0)),
    ageMonths: Math.max(0, Math.min(11, Number(raw.ageMonths) || 0)),
    photoEmoji: raw.photoEmoji || (safeSpecies === 'perro' ? '🐶' : safeSpecies === 'gato' ? '🐱' : '🐾'),
    vaccines: safeVaccines,
    clinicalRecords: safeClinical,
    createdAt: String(raw.createdAt || new Date().toISOString().split('T')[0]),
  };
}
