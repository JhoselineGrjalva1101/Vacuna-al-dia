import { VaccineFrequencyUnit, VaccineUrgency } from '../types/pet';

/**
 * UTILIDADES DE CÁLCULO DE FECHAS Y PRÓXIMAS DOSIS
 * 
 * ATENCIÓN: El manejo de fechas en JavaScript es propenso a errores sutiles.
 * En cada función se documentan las trampas habituales donde los desarrolladores
 * suelen equivocarse (zonas horarias, mutaciones y desbordamiento de meses).
 */

/**
 * Convierte un string 'YYYY-MM-DD' a un objeto Date en HORA LOCAL.
 * 
 * ⚠️ TRAMPA HABITUAL:
 * Hacer `new Date("2026-10-02")` se interpreta por estándar como UTC a medianoche.
 * En países de habla hispana (ej: Argentina UTC-3, México UTC-6, Colombia UTC-5),
 * al consultar getMonth() o getDate() se obtiene el DÍA ANTERIOR (ej. 2026-10-01 a las 21:00).
 * Para evitar este error, separamos las partes año, mes y día de forma explícita.
 */
export function parseLocalDate(dateString: string): Date {
  if (!dateString) return new Date();
  
  const [yearStr, monthStr, dayStr] = dateString.split('-');
  const year = parseInt(yearStr, 10);
  const monthIndex = parseInt(monthStr, 10) - 1; // ⚠️ En JS los meses van de 0 a 11
  const day = parseInt(dayStr, 10);

  // Instanciamos con año, mes, día exactos en la zona horaria del usuario
  return new Date(year, monthIndex, day, 0, 0, 0, 0);
}

/**
 * Formatea una fecha local a formato 'YYYY-MM-DD' para inputs <input type="date">.
 * 
 * ⚠️ TRAMPA HABITUAL:
 * Usar `date.toISOString().split('T')[0]` convierte a UTC, volviendo a cambiar
 * la fecha visible por el día anterior si es de noche.
 */
export function formatLocalDateToInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formatea una fecha a formato legible en español (ej: "15 de oct. de 2026").
 */
export function formatReadableDate(dateString: string): string {
  if (!dateString) return 'Sin fecha';
  try {
    const date = parseLocalDate(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * FUNCIÓN 2 REQUERIDA: Calcular la fecha de la próxima dosis.
 * 
 * Toma la fecha de aplicación y el intervalo configurado (meses, días o años).
 * 
 * ⚠️ TRAMPA HABITUAL:
 * 1. Mutar el objeto Date original (en JS los métodos como setMonth mutan la instancia).
 * 2. Overflow de fin de mes: Si aplicas una vacuna el 31 de marzo y sumas 1 mes,
 *    abril solo tiene 30 días. Un simple `date.setMonth(date.getMonth() + 1)` saltará al 1 de mayo!
 *    Aquí verificamos si el día resultante cambió y lo ajustamos al último día del mes correspondiente.
 */
export function calculateNextDoseDate(
  applicationDateStr: string,
  intervalValue: number,
  intervalUnit: VaccineFrequencyUnit
): string {
  const baseDate = parseLocalDate(applicationDateStr);
  const targetDate = new Date(baseDate.getTime()); // Clonamos para no mutar

  const originalDay = baseDate.getDate();

  switch (intervalUnit) {
    case 'dias': {
      targetDate.setDate(targetDate.getDate() + intervalValue);
      break;
    }
    case 'anios': {
      // Convertimos años a meses para reutilizar la lógica segura de fin de mes (ej. 29 de feb en bisiestos)
      const totalMonths = intervalValue * 12;
      targetDate.setMonth(targetDate.getMonth() + totalMonths);
      
      // Control de desbordamiento (ej: 29 de febrero sumado 1 año)
      if (targetDate.getDate() !== originalDay) {
        // Establecemos al último día del mes previo al desborde
        targetDate.setDate(0);
      }
      break;
    }
    case 'meses':
    default: {
      targetDate.setMonth(targetDate.getMonth() + intervalValue);

      // Si el día del mes cambió (ej. de 31 a 1 o 2 por meses más cortos),
      // forzamos al último día válido del mes al que queríamos ir.
      if (targetDate.getDate() !== originalDay) {
        targetDate.setDate(0);
      }
      break;
    }
  }

  return formatLocalDateToInput(targetDate);
}

/**
 * Calcula los días restantes hasta la próxima dosis con respecto a HOY.
 * Retorna:
 * - Número positivo: faltan N días
 * - 0: vence hoy
 * - Número negativo: vencida hace N días
 * 
 * ⚠️ TRAMPA HABITUAL:
 * Restar fechas con horas arbitrarias (ej: 14:30 vs 09:00) produce decimales
 * y puede cambiar el resultado en +/- 1 día según la hora en que el usuario abra la app.
 * Ambas fechas deben normalizarse a medianoche (00:00:00.000).
 */
export function getDaysRemaining(nextDoseDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextDose = parseLocalDate(nextDoseDateStr);
  nextDose.setHours(0, 0, 0, 0);

  const diffTimeMs = nextDose.getTime() - today.getTime();
  const diffDays = Math.round(diffTimeMs / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Determina el estado de urgencia de la vacuna:
 * - 'vencida': si los días restantes son menores a 0
 * - 'por_vencer': si vence hoy o dentro de los próximos 30 días (0 a 30)
 * - 'al_dia': si faltan más de 30 días
 */
export function getVaccineUrgency(nextDoseDateStr: string): VaccineUrgency {
  const days = getDaysRemaining(nextDoseDateStr);
  if (days < 0) return 'vencida';
  if (days <= 30) return 'por_vencer';
  return 'al_dia';
}

/**
 * Devuelve un texto legible para el usuario sobre el tiempo restante.
 * Ej: "Venció hace 12 días", "Vence hoy", "Vence en 5 días", "En 8 meses"
 */
export function getRemainingDaysLabel(days: number): string {
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
