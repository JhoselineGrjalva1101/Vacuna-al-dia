import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

/**
 * ESQUEMA FIJO PARA GEMINI API (responseSchema)
 * Requisito 1: Esquema tipado para que la respuesta sea un objeto JSON estructurado y predecible.
 */
const VET_ADVISOR_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    species: {
      type: Type.STRING,
      description: "Especie de la mascota (ej: perro, gato).",
    },
    petStage: {
      type: Type.STRING,
      description: "Etapa de vida según la edad (ej: Cachorro 3 meses, Adulto joven, Senior).",
    },
    summaryNote: {
      type: Type.STRING,
      description: "Resumen técnico breve de una frase sobre el esquema sanitario.",
    },
    recommendedVaccines: {
      type: Type.ARRAY,
      description: "Vacunas que corresponden por especie y edad.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "Nombre veterinario estándar de la vacuna.",
          },
          frequency: {
            type: Type.STRING,
            description: "Frecuencia sugerida (ej: Cada 12 meses, Cada 21 a 28 días).",
          },
          targetAgeOrCondition: {
            type: Type.STRING,
            description: "Edad de aplicación o condición de riesgo.",
          },
          purpose: {
            type: Type.STRING,
            description: "Enfermedades que previene y por qué es clave.",
          },
          urgencyLevel: {
            type: Type.STRING,
            description: "Nivel de urgencia sanitaria: 'obligatoria', 'recomendada' u 'opcional'.",
          },
        },
        required: ["name", "frequency", "targetAgeOrCondition", "purpose", "urgencyLevel"],
      },
    },
    veterinarianQuestions: {
      type: Type.ARRAY,
      description: "Preguntas pertinentes y profesionales para hacerle al veterinario en la próxima visita.",
      items: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            description: "Categoría de la pregunta (ej: Vacunación, Nutrición, Desparasitación, Dientes).",
          },
          question: {
            type: Type.STRING,
            description: "Pregunta redactada para que el dueño la formule.",
          },
          reason: {
            type: Type.STRING,
            description: "Motivo por el que conviene preguntar esto según su edad y especie.",
          },
        },
        required: ["category", "question", "reason"],
      },
    },
  },
  required: [
    "species",
    "petStage",
    "summaryNote",
    "recommendedVaccines",
    "veterinarianQuestions",
  ],
};

/**
 * ENDPOINT: POST /api/ai/vet-calendar
 * Invoca el modelo gemini-3.8-flash mediante @google/genai con responseSchema.
 */
app.post('/api/ai/vet-calendar', async (req, res) => {
  try {
    const { species, ageYears, ageMonths, petName, vaccinesAlreadyGiven } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    // Validación de llave de API (Requisito 3 y 4)
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(503).json({
        error: 'NO_API_KEY',
        message: 'No se encontró una clave de Gemini API configurada en la variable de entorno GEMINI_API_KEY.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const promptText = `
Sos un asesor veterinario preventivo. Analiza la siguiente mascota:
- Nombre: ${petName || 'Mascota'}
- Especie: ${species || 'perro'}
- Edad: ${ageYears || 0} años y ${ageMonths || 0} meses.
- Vacunas que ya tiene registradas: ${
      Array.isArray(vaccinesAlreadyGiven) && vaccinesAlreadyGiven.length > 0
        ? vaccinesAlreadyGiven.join(', ')
        : 'Ninguna informada aún'
    }

TAREA:
1. Arma el calendario de vacunación recomendado para esta etapa de vida y especie.
2. Redacta preguntas directas y estratégicas que el dueño debe hacerle a su veterinario de cabecera en la próxima consulta.
Sé riguroso, práctico y en español.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: VET_ADVISOR_SCHEMA,
        systemInstruction:
          'Eres un especialista en medicina preventiva veterinaria canina y felina. Siempre devuelves respuestas que cumplen con el esquema JSON indicado sin texto libre ni markdown fuera del JSON.',
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error('La IA devolvió una respuesta vacía.');
    }

    // Requisito 1 & 4: Parsear y verificar cumplimiento de esquema
    const parsedData = JSON.parse(rawText);

    if (
      !parsedData ||
      !Array.isArray(parsedData.recommendedVaccines) ||
      !Array.isArray(parsedData.veterinarianQuestions)
    ) {
      throw new Error('La respuesta de la IA no cumplió con el formato estructurado esperado.');
    }

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error al generar calendario con Gemini:', error);
    return res.status(500).json({
      error: 'AI_GENERATION_FAILED',
      message: error?.message || 'Ocurrió un error inesperado al consultar a la inteligencia artificial.',
    });
  }
});

// Montar Vite en modo desarrollo o servir estáticos en producción
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor de Vacuna al Día activo en puerto ${PORT}`);
  });
}

startServer();
