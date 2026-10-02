import { Pet } from '../types/pet';
import { calculateNextDoseDate } from '../utils/dateCalculations';

/**
 * Plantillas de vacunas comunes para facilitar el registro de mascotas
 * con intervalos veterinarios estándar sugeridos.
 */
export const COMMON_VACCINE_TEMPLATES = {
  perro: [
    { name: 'Antirrábica', intervalValue: 12, intervalUnit: 'meses' as const, note: 'Refuerzo anual obligatorio' },
    { name: 'Séxtuple / Polivalente (DHPPi+L)', intervalValue: 12, intervalUnit: 'meses' as const, note: 'Parvovirus, Moquillo, Hepatitis, Leptospira' },
    { name: 'Tos de las Perreras (Bordetella)', intervalValue: 12, intervalUnit: 'meses' as const, note: 'Protección respiratoria anual' },
    { name: 'Giardia', intervalValue: 12, intervalUnit: 'meses' as const, note: 'Protección intestinal anual' },
    { name: 'Refuerzo Cachorro (2da / 3ra dosis)', intervalValue: 21, intervalUnit: 'dias' as const, note: 'Intervalo de 21 a 28 días' }
  ],
  gato: [
    { name: 'Antirrábica Felina', intervalValue: 12, intervalUnit: 'meses' as const, note: 'Refuerzo anual' },
    { name: 'Triple Felina (Panleucopenia, Calicivirus, Herpesvirus)', intervalValue: 12, intervalUnit: 'meses' as const, note: 'Vacuna básica anual' },
    { name: 'Leucemia Felina (FeLV)', intervalValue: 12, intervalUnit: 'meses' as const, note: 'Recomendada para gatos con acceso al exterior' },
    { name: 'Refuerzo Gatito (Refuerzo inicial)', intervalValue: 28, intervalUnit: 'dias' as const, note: 'Intervalo de 3 a 4 semanas' }
  ],
  otro: [
    { name: 'Vacuna General / Preventiva', intervalValue: 12, intervalUnit: 'meses' as const, note: 'Según recomendación de veterinario' }
  ]
};

/**
 * Datos iniciales precargados (se guardan en localStorage si no existen).
 * Muestran exactamente el problema que la app resuelve:
 * "Toby" tiene una vacuna vencida (Rabia) y una por vencer (Séxtuple),
 * ilustrando de inmediato el valor del sistema.
 */
export const INITIAL_PETS: Pet[] = [
  {
    id: 'pet-1-toby',
    name: 'Toby',
    species: 'perro',
    ageYears: 3,
    ageMonths: 4,
    photoEmoji: '🐶',
    createdAt: '2026-01-10',
    vaccines: [
      {
        id: 'vac-1',
        name: 'Antirrábica',
        applicationDate: '2025-09-10',
        intervalValue: 12,
        intervalUnit: 'meses',
        nextDoseDate: calculateNextDoseDate('2025-09-10', 12, 'meses'),
        notes: 'Refuerzo anual obligatorio en clínica veterinaria'
      },
      {
        id: 'vac-2',
        name: 'Séxtuple / Polivalente',
        applicationDate: '2025-10-20',
        intervalValue: 12,
        intervalUnit: 'meses',
        nextDoseDate: calculateNextDoseDate('2025-10-20', 12, 'meses'),
        notes: 'Protección completa contra parvovirus y moquillo'
      },
      {
        id: 'vac-3',
        name: 'Tos de las Perreras (Bordetella)',
        applicationDate: '2026-06-05',
        intervalValue: 12,
        intervalUnit: 'meses',
        nextDoseDate: calculateNextDoseDate('2026-06-05', 12, 'meses'),
        notes: 'Aplicada antes de entrar a guardería canina'
      }
    ],
    clinicalRecords: [
      {
        id: 'rec-1',
        date: '2026-08-14',
        type: 'consulta',
        title: 'Control general y chequeo dental',
        veterinarian: 'Dra. Mariana López',
        clinic: 'Veterinaria Central',
        weightKg: 14.2,
        diagnosisNotes: 'Paciente en excelente condición corporal. Ligero sarro en molares superiores pero sin inflamación gingival. Se recomienda snack dental preventivo.',
        treatment: 'Higiene bucal preventiva semanal',
        followUpDate: '2027-02-14'
      },
      {
        id: 'rec-2',
        date: '2026-05-10',
        type: 'desparasitacion',
        title: 'Desparasitación interna trimestral',
        veterinarian: 'Dr. Lucas Gómez',
        clinic: 'Veterinaria Central',
        weightKg: 14.0,
        diagnosisNotes: 'Administración de comprimido antiparasitario de amplio espectro.',
        treatment: 'Comprimido antiparasitario dosis única'
      }
    ]
  },
  {
    id: 'pet-2-michi',
    name: 'Michi',
    species: 'gato',
    ageYears: 1,
    ageMonths: 8,
    photoEmoji: '🐱',
    createdAt: '2026-03-15',
    vaccines: [
      {
        id: 'vac-4',
        name: 'Triple Felina',
        applicationDate: '2026-04-12',
        intervalValue: 12,
        intervalUnit: 'meses',
        nextDoseDate: calculateNextDoseDate('2026-04-12', 12, 'meses'),
        notes: 'Clínica San Francisco'
      },
      {
        id: 'vac-5',
        name: 'Antirrábica Felina',
        applicationDate: '2026-04-12',
        intervalValue: 12,
        intervalUnit: 'meses',
        nextDoseDate: calculateNextDoseDate('2026-04-12', 12, 'meses'),
        notes: 'Dosis única anual'
      }
    ],
    clinicalRecords: [
      {
        id: 'rec-3',
        date: '2026-04-12',
        type: 'consulta',
        title: 'Chequeo anual y castración preventiva',
        veterinarian: 'Dra. Andrea Ruiz',
        clinic: 'Clínica Felina San Francisco',
        weightKg: 4.1,
        diagnosisNotes: 'Castración previa cicatrizada perfectamente. Vacunación anual al día.',
        treatment: 'Alimento castrados para control de peso'
      }
    ]
  }
];
