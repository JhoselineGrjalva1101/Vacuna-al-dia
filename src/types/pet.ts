/**
 * Tipos de datos para la aplicación Vacuna al Día
 */

export type PetSpecies = 'perro' | 'gato' | 'otro';

export type VaccineFrequencyUnit = 'meses' | 'dias' | 'anios';

export interface Vaccine {
  id: string;
  name: string;
  applicationDate: string; // Formato ISO YYYY-MM-DD
  intervalValue: number;    // Ej: 12
  intervalUnit: VaccineFrequencyUnit; // 'meses' | 'anios' | 'dias'
  notes?: string;
  // Campos calculados por conveniencia en vistas
  nextDoseDate: string;     // Formato ISO YYYY-MM-DD
}

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  customSpecies?: string;
  ageYears: number;
  ageMonths: number;
  photoEmoji?: string;
  vaccines: Vaccine[];
  createdAt: string;
}

export type VaccineUrgency = 'vencida' | 'por_vencer' | 'al_dia';

export interface VaccineAlertItem {
  petId: string;
  petName: string;
  petSpecies: PetSpecies;
  vaccine: Vaccine;
  urgency: VaccineUrgency;
  daysRemaining: number; // Negativo si ya venció
}
