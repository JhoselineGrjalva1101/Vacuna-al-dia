import { Pet } from '../types/pet';
import { VetAdvisorResponse } from '../types/aiAdvisor';
import { MOCK_DOG_ADVISOR_RESPONSE, MOCK_CAT_ADVISOR_RESPONSE } from '../data/mockVetAdvisor';

export interface AiServiceResult {
  data: VetAdvisorResponse;
  isMock: boolean;
  message?: string;
}

/**
 * Consulta la IA de Gemini para armar el calendario y las preguntas veterinarias.
 * 
 * Requisitos cubiertos:
 * - Timeout de 15 segundos para evitar cuelgues si la IA responde lento.
 * - Validación del esquema devuelto (Requisito 1 & 4).
 * - Fallback inteligente a datos de prueba sin costo (Requisito 5).
 */
export async function getAiVetAdvisor(
  pet: Pet,
  forceMock: boolean = false
): Promise<AiServiceResult> {
  // Si el usuario elige expresamente modo de prueba sin gastar llamadas
  if (forceMock) {
    const mock = pet.species === 'gato' ? MOCK_CAT_ADVISOR_RESPONSE : MOCK_DOG_ADVISOR_RESPONSE;
    return {
      data: mock,
      isMock: true,
      message: 'Mostrando guía de prueba veterinaria sin consumo de llamadas a la API.',
    };
  }

  // Controlador de tiempo de espera (15 segundos)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch('/api/ai/vet-calendar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        species: pet.species,
        ageYears: pet.ageYears,
        ageMonths: pet.ageMonths,
        petName: pet.name,
        vaccinesAlreadyGiven: pet.vaccines.map((v) => v.name),
      }),
    });

    clearTimeout(timeoutId);

    const result = await response.json();

    if (!response.ok) {
      // Manejo de errores específicos del servidor
      if (result.error === 'NO_API_KEY') {
        throw new Error(
          'No se configuró la llave de Gemini API en el servidor. Puedes utilizar el botón de "Modo de Prueba" para visualizar el calendario sin costo.'
        );
      }
      throw new Error(result.message || 'No fue posible consultar a la inteligencia artificial.');
    }

    // Validación defensiva del esquema JSON (Requisito 1 & 4)
    if (
      !result ||
      !Array.isArray(result.recommendedVaccines) ||
      !Array.isArray(result.veterinarianQuestions)
    ) {
      throw new Error(
        'La respuesta recibida no cumplió con el formato veterinario estructurado.'
      );
    }

    return {
      data: result as VetAdvisorResponse,
      isMock: false,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error(
        'La inteligencia artificial tardó más de 15 segundos en responder. Por favor, verifica tu conexión o intenta nuevamente.'
      );
    }

    throw error;
  }
}
