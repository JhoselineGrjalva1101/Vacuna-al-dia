import { VaccineFrequencyUnit, VaccineUrgency } from '../types/pet';

/**
 * UTILIDADES ROBUSTAS DE CÁLCULO DE FECHAS
 * Con validaciones defensivas contra valores nulos, fechas inválidas y desbordes.
 */

/**
 * Convierte un string 'YYYY-MM-DD' a un objeto Date en HORA LOCAL.
 * Valida formato estricto y valores numéricos para prevenir crashes por 'Invalid Date'.
 */
export function parseLocalDate(dateString: string): Date {
  if (!dateString || typeof dateString !== 'string') {
    return new Date();
  }

  const parts = dateString.trim().split('-');
  if (parts.length !== 3) {
    return new Date();
  }

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day) || year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return new Date();
  }

  const parsed = new Date(year, month - 1, day, 0, 0, 0, 0);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Formatea una fecha local a formato 'YYYY-MM-DD' para inputs <input type="date">.
 */
export function formatLocalDateToInput(date: Date): string {
  if (!date || isNaN(date.getTime())) {
    date = new Date();
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formatea una fecha a formato legible en español (ej: "15 de oct. de 2026").
 * Nunca arroja RangeError ante fechas corruptas.
 */
export function formatReadableDate(dateString: string): string {
  if (!dateString) return 'Sin fecha';
  try {
    const date = parseLocalDate(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Fecha no disponible';
  }
}

/**
 * Valida si una fecha ingresada es futura con respecto a hoy a medianoche.
 */
export function isFutureDate(dateString: string): boolean {
  if (!dateString) return false;
  const target = parseLocalDate(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return target.getTime() > today.getTime();
}

/**
 * Calcula la fecha de la próxima dosis con protección de fin de mes y años bisiestos.
 */
export function calculateNextDoseDate(
  applicationDateStr: string,
  intervalValue: number,
  intervalUnit: VaccineFrequencyUnit
): string {
  const baseDate = parseLocalDate(applicationDateStr);
  const targetDate = new Date(baseDate.getTime());

  // Sanitizar intervalo (mínimo 1 día/mes/año, máximo 365)
  const safeInterval = Math.max(1, Math.min(365, Number(intervalValue) || 12));
  const originalDay = baseDate.getDate();

  switch (intervalUnit) {
    case 'dias': {
      targetDate.setDate(targetDate.getDate() + safeInterval);
      break;
    }
    case 'anios': {
      const totalMonths = safeInterval * 12;
      targetDate.setMonth(targetDate.getMonth() + totalMonths);
      if (targetDate.getDate() !== originalDay) {
        targetDate.setDate(0);
      }
      break;
    }
    case 'meses':
    default: {
      targetDate.setMonth(targetDate.getMonth() + safeInterval);
      if (targetDate.getDate() !== originalDay) {
        targetDate.setDate(0);
      }
      break;
    }
  }

  return formatLocalDateToInput(targetDate);
}

/**
 * Calcula los días restantes normalizando ambas fechas a medianoche.
 */
export function getDaysRemaining(nextDoseDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextDose = parseLocalDate(nextDoseDateStr);
  nextDose.setHours(0, 0, 0, 0);

  const diffTimeMs = nextDose.getTime() - today.getTime();
  const diffDays = Math.round(diffTimeMs / (1000 * 60 * 60 * 24));
  return isNaN(diffDays) ? 0 : diffDays;
}

/**
 * Determina el estado de urgencia:
 * - 'vencida': días restantes < 0
 * - 'por_vencer': días entre 0 y 30
 * - 'al_dia': más de 30 días
 */
export function getVaccineUrgency(nextDoseDateStr: string): VaccineUrgency {
  const days = getDaysRemaining(nextDoseDateStr);
  if (days < 0) return 'vencida';
  if (days <= 30) return 'por_vencer';
  return 'al_dia';
}

/**
 * Texto legible del conteo de días.
 */
export function getRemainingDaysLabel(days: number): string {
  if (isNaN(days)) return 'Fecha a confirmar';
  if (days < 0) {
    const absDays = Math.abs(days);
    if (absDays === 1) return 'Venció ayer';
    return `Venció hace ${absDays} días`;
  }
  if (days === 0) return 'Vence hoy';
  if (days === 1) return 'Vence mañana';
  if (days <= 30) return `Vence en ${days} días`;
  
  const months = Math.floor(days / 30);
  if (months === 1) return 'Vence en aprox. 1 mes';
  return `Vence en ${months} meses (${days} días)`;
}
