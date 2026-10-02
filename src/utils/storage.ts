import { Pet } from '../types/pet';
import { INITIAL_PETS } from '../data/initialData';

/**
 * CLAVE DE LOCALSTORAGE
 * La información queda aislada bajo el origen web de la aplicación.
 */
export const STORAGE_KEY = 'vacuna_al_dia_pets_v1';

/**
 * 1. GUARDAR DATOS EN LOCALSTORAGE
 * Serializa la lista completa de mascotas a texto JSON.
 */
export function savePetsToStorage(pets: Pet[]): boolean {
  try {
    const serialized = JSON.stringify(pets);
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (error) {
    console.error('Error al guardar datos en localStorage:', error);
    return false;
  }
}

/**
 * 2. LEER DATOS DESDE LOCALSTORAGE
 * Obtiene y parsea el JSON. Si no existe o está dañado, devuelve los datos iniciales de ejemplo.
 */
export function loadPetsFromStorage(): Pet[] {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      // Si el usuario abre la app por primera vez, precargamos el dato de ejemplo
      savePetsToStorage(INITIAL_PETS);
      return INITIAL_PETS;
    }

    const parsed = JSON.parse(rawData);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.error('Error al leer datos desde localStorage (JSON inválido):', error);
  }
  return INITIAL_PETS;
}

/**
 * 3. BORRAR DATOS DE LOCALSTORAGE
 * Limpia la clave de la aplicación sin afectar otras webs del usuario.
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
 * Crea un archivo descargable (.json) en el dispositivo del usuario.
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

  // Creamos un enlace invisible para disparar la descarga en el celular o navegador
  const link = document.createElement('a');
  const dateFormatted = new Date().toISOString().split('T')[0];
  link.href = downloadUrl;
  link.download = `vacuna_al_dia_respaldo_${dateFormatted}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Liberamos la memoria del objeto URL
  URL.revokeObjectURL(downloadUrl);
}

/**
 * 5. IMPORTAR / RESTAURAR DATOS DESDE UN ARCHIVO JSON
 * Lee el archivo seleccionado por el usuario, valida su contenido y devuelve las mascotas.
 */
export function importPetsFromJSONFile(file: File): Promise<Pet[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Acepta tanto el formato exportado { pets: [...] } como un array directo [...]
        const importedPets = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.pets)
          ? parsed.pets
          : null;

        if (!importedPets) {
          throw new Error('El archivo no contiene un formato de respaldo válido.');
        }

        resolve(importedPets);
      } catch (err) {
        reject(err instanceof Error ? err.message : 'Error al procesar el archivo JSON.');
      }
    };

    reader.onerror = () => reject('Error al leer el archivo desde el dispositivo.');
    reader.readAsText(file);
  });
}
