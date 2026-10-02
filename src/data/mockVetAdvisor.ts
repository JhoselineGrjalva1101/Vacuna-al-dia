import { VetAdvisorResponse } from '../types/aiAdvisor';

/**
 * REQUISITO 5: Ejemplo de respuesta de prueba para desarrollar sin gastar llamadas a la API.
 * 
 * Contiene datos estructurados completos para perro y gato que cumplen
 * exactamente con el responseSchema definido para Gemini.
 */
export const MOCK_DOG_ADVISOR_RESPONSE: VetAdvisorResponse = {
  species: "perro",
  petStage: "Adulto joven (1 a 7 años)",
  summaryNote: "Calendario de mantenimiento inmunológico anual y prevención de parásitos endémicos.",
  recommendedVaccines: [
    {
      name: "Antirrábica",
      frequency: "Cada 12 meses (anual)",
      targetAgeOrCondition: "Obligatoria por ley a partir de los 3 meses y anual de por vida",
      purpose: "Inmunización contra el virus de la rabia, mortal y transmisible a humanos (zoonosis).",
      urgencyLevel: "obligatoria"
    },
    {
      name: "Polivalente Séxtuple / Óctuple (DHPPi+L)",
      frequency: "Cada 12 meses",
      targetAgeOrCondition: "Refuerzo anual durante toda la etapa adulta",
      purpose: "Protección contra parvovirus, moquillo canino, hepatitis infecciosa, parainfluenza y leptospirosis.",
      urgencyLevel: "obligatoria"
    },
    {
      name: "Tos de las Perreras (Bordetella + Parainfluenza)",
      frequency: "Cada 6 a 12 meses",
      targetAgeOrCondition: "Recomendada si visita parques caninos, guarderías o peluquerías",
      purpose: "Previene traqueobronquitis infecciosa de alta transmisibilidad en lugares concurridos.",
      urgencyLevel: "recomendada"
    },
    {
      name: "Giardia canina",
      frequency: "Cada 12 meses",
      targetAgeOrCondition: "Zonas con agua estancada o antecedentes de diarreas parasitarias",
      purpose: "Reduce la severidad de la infección y la excreción de quistes de Giardia lamblia.",
      urgencyLevel: "opcional"
    }
  ],
  veterinarianQuestions: [
    {
      category: "Vacunación y Refuerzos",
      question: "¿La vacuna antirrábica y la séxtuple se pueden aplicar juntas o recomienda separarlas por 15 días?",
      reason: "Algunos perros son sensibles a la carga antigénica combinada y los veterinarios prefieren espaciarlas."
    },
    {
      category: "Desparasitación y Pulgas",
      question: "¿Qué pastilla o pipeta de amplio espectro cubre parásitos internos y externos según el peso actual?",
      reason: "La efectividad depende del peso exacto y de la presencia de garrapatas o parásitos del corazón en tu zona."
    },
    {
      category: "Salud Dental y Peso",
      question: "¿Observa acumulación de sarro en los molares superiores y cómo ve su condición corporal (peso)?",
      reason: "Entre los 2 y 4 años inicia la enfermedad periodontal y cambios en el metabolismo que requieren ajustes de porción."
    },
    {
      category: "Estilo de Vida",
      question: "Si va a viajar o convivir con otros perros, ¿necesita serología o vacuna de leptospira semestral?",
      reason: "La leptospirosis tiene cepas específicas que varían en zonas de campo o con roedores."
    }
  ]
};

export const MOCK_CAT_ADVISOR_RESPONSE: VetAdvisorResponse = {
  species: "gato",
  petStage: "Adulto joven (1 a 7 años)",
  summaryNote: "Protección respiratoria y viral adaptada al nivel de acceso al exterior.",
  recommendedVaccines: [
    {
      name: "Triple Felina (Panleucopenia, Calicivirus, Herpesvirus)",
      frequency: "Cada 12 meses",
      targetAgeOrCondition: "Básica para todos los gatos, incluso los de interior",
      purpose: "Protege contra el virus más mortal (panleucopenia) y el complejo respiratorio felino.",
      urgencyLevel: "obligatoria"
    },
    {
      name: "Antirrábica Felina",
      frequency: "Cada 12 meses",
      targetAgeOrCondition: "Obligatoria a partir de los 3 meses",
      purpose: "Inmunización contra la rabia (fórmula especial libre de adyuvantes agresivos para felinos).",
      urgencyLevel: "obligatoria"
    },
    {
      name: "Leucemia Felina (FeLV)",
      frequency: "Cada 12 meses (previo test de sangre negativo)",
      targetAgeOrCondition: "Gatos con acceso a patio, techos o contacto con otros gatos",
      purpose: "Previene la infección por retrovirus transmisible por saliva y acicalamiento mutuo.",
      urgencyLevel: "recomendada"
    }
  ],
  veterinarianQuestions: [
    {
      category: "Vacunación",
      question: "¿La vacuna que utiliza es libre de adyuvantes para minimizar el riesgo de sarcoma en el sitio de inyección?",
      reason: "En gatos es prioritario aplicar vacunas en zonas específicas (extremidades o cola) y libres de adyuvantes inflamatorios."
    },
    {
      category: "Comportamiento y Riñón",
      question: "¿Cómo nota la palpación renal y qué hábitos de hidratación me recomienda para prevenir cálculos urinarios?",
      reason: "Los felinos tienen predisposición genética a problemas renales y baja ingesta de agua espontánea."
    },
    {
      category: "Test Virales",
      question: "Si sale al exterior o ingresa un nuevo gato, ¿conviene realizar el test de VIF / ViLeF (SIDA y Leucemia)?",
      reason: "Son enfermedades silenciosas muy comunes que cambian el protocolo médico a seguir."
    }
  ]
};
