/**
 * Esquema de tipos para el Asesor Veterinario con IA (Gemini API)
 */

export interface RecommendedVaccineItem {
  name: string;
  frequency: string;            // Ej: "Anual", "Cada 21 a 28 días"
  targetAgeOrCondition: string; // Ej: "A partir de los 3 meses", "Cachorro"
  purpose: string;              // Explicación técnica breve de protección
  urgencyLevel: 'obligatoria' | 'recomendada' | 'opcional';
}

export interface VetQuestionItem {
  category: string;             // Ej: "Vacunación", "Nutrición", "Prevención"
  question: string;             // Pregunta redactada para el veterinario
  reason: string;               // Por qué conviene hacer esta pregunta según edad/especie
}

export interface VetAdvisorResponse {
  species: string;
  petStage: string;             // Ej: "Cachorro (3 a 6 meses)", "Adulto joven"
  summaryNote: string;          // 1 frase resumen de orientación
  recommendedVaccines: RecommendedVaccineItem[];
  veterinarianQuestions: VetQuestionItem[];
}
