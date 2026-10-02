# 🐾 Vacuna al Día — Libreta Sanitaria & Asesor Veterinario Inteligente

> **Sistema integral de control preventivo de vacunación, historial clínico digital interactivo y asesoría médica con IA para familias y tutores de mascotas.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini_3.8_Flash-4285F4?style=flat&logo=google&logoColor=white)](https://ai.google.dev/)
[![Node / Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📌 Tabla de Contenidos
1. [Descripción General](#-descripción-general)
2. [Características Principales](#-características-principales)
3. [Arquitectura del Sistema](#-arquitectura-del-sistema)
4. [Estructura del Proyecto](#-estructura-del-proyecto)
5. [Módulos y Componentes Detallados](#-módulos-y-componentes-detallados)
6. [Diseño y Accesibilidad (WCAG & Mobile-First)](#-diseño-y-accesibilidad-wcag--mobile-first)
7. [Blindaje Defensivo y Pruebas de Robustez (QA)](#-blindaje-defensivo-y-pruebas-de-robustez-qa)
8. [Integración con Google Gemini API](#-integración-con-google-gemini-api)
9. [Modelo de Datos (TypeScript)](#-modelo-de-datos-typescript)
10. [Instalación y Puesta en Marcha](#-instalación-y-puesta-en-marcha)
11. [Guía de Uso Rápido](#-guía-de-uso-rápido)
12. [Créditos y Licencia](#-créditos-y-licencia)

---

## 📖 Descripción General

**Vacuna al Día** nace para dar respuesta a un problema cotidiano pero crítico de salud pública veterinaria: **el olvido de las fechas de refuerzo de vacunación en animales de compañía**. 

La pérdida de cartillas de papel, la confusión con intervalos variables (21 días en cachorros vs. 12 meses en adultos) y la falta de un registro centralizado de visitas médicas suelen provocar baches de inmunización que dejan expuestas a las mascotas a enfermedades graves (parvovirus, moquillo, rabia, panleucopenia).

Esta aplicación full-stack ofrece:
- **Cálculo de fechas preciso:** Sin errores de zonas horarias, años bisiestos ni fin de mes.
- **Semáforo de urgencia:** Priorización visual inmediata de dosis vencidas o próximas a vencer.
- **Historial clínico portátil:** Control de peso, cirugías, diagnósticos y tratamientos sin depender de papel.
- **Inteligencia Artificial Médica Preventiva:** Generación de calendarios según especie/edad y formulación de preguntas fundamentadas para el veterinario mediante **Gemini 3.8 Flash**.
- **Privacidad absoluta:** Almacenamiento local en el navegador del usuario con exportación e importación en formato JSON estándar.

---

## 🚀 Características Principales

### 🔔 1. Semáforo de Alertas y Dosis en un Toque
- Clasificación visual instantánea en 3 estados:
  - 🔴 **Vencida:** La fecha límite ya expiró. Muestra los días de retraso exactos.
  - 🟡 **Por vencer (≤ 30 días):** Alerta preventiva con cuenta regresiva en días.
  - 🟢 **Al día (> 30 días):** Cobertura vigente con fecha de próximo refuerzo.
- **Botón rápido «Aplicada hoy»:** Registra la aplicación en el momento y recalcula de forma automática el próximo ciclo sin formularios complejos.

### 🐕 2. Libreta Digital de Mascotas
- Soporte para **Perros**, **Gatos** y **Otras especies** (con personalización de tipo de animal: conejos, hurones, cobayos, etc.).
- Contadores dinámicos de estado por mascota y cálculo de edad en años y meses.
- Acordeón colapsable con vista detallada de vacunas y fechas asociadas.

### 🩺 3. Historial Clínico Interactivo
- Registro cronológico clasificado por tipos:
  - 🩺 **Consulta Médica**
  - 💊 **Tratamiento / Medicación**
  - ⚡ **Cirugía / Procedimiento**
  - 🐛 **Desparasitación**
  - 📄 **Estudio o Análisis Clínico**
  - 🚨 **Urgencia**
- Seguimiento de **peso corporal en kilogramos** con soporte para decimales (`14,5` o `14.5`).
- Indicación de profesional actuante, clínica u hospital y fecha de próximo control.
- Buscador en tiempo real por palabra clave (síntoma, diagnóstico, médico o medicamento).

### 🤖 4. Asesor Veterinario con Gemini 3.8 Flash
- Envío seguro de especie, edad y vacunas existentes a la API de Gemini a través de un proxy backend.
- Respuesta forzada por **`responseSchema` estructurado en JSON** (sin párrafos libres ni markdown roto).
- Visualización de vacunas sugeridas con nivel de urgencia (*Obligatoria*, *Recomendada*, *Opcional*) y botón de incorporación directa con 1 clic: **«+ Registrar esta dosis en [Mascota]»**.
- Batería de preguntas estratégicas para la consulta organizadas por categoría, con justificación clínica y botón de copiado rápido al portapapeles.
- **Modo de Prueba Local (0 costo):** Guía pre-validada para perro y gato que funciona incluso sin conexión o sin clave de API configurada.

### 💾 5. Soberanía de Datos y Copias de Seguridad
- Guardado automático y silencioso en `localStorage` ante cada modificación.
- **Exportación en JSON:** Descarga de archivo `.json` legible con toda la información clínica.
- **Restauración segura:** Importación con sanitización estricta que previene pantallas blancas ante archivos alterados o incompletos.
- Detección de pérdida de conexión (`offline`) y alerta por límite de memoria del navegador (`QuotaExceededError`).

---

## 🏗 Arquitectura del Sistema

La aplicación combina un cliente SPA moderno con un servidor backend liviano para aislar las credenciales de IA:

```text
┌─────────────────────────────────────────────────────────────┐
│                    NAVEGADOR DEL USUARIO                    │
│                                                             │
│   ┌─────────────────┐    ┌──────────────────────────────┐   │
│   │   React 19 UI   │───▶│ localStorage (Persistencia)  │   │
│   │ (Tailwind v4)   │◀───│ "vacuna_al_dia_pets_v1"      │   │
│   └────────┬────────┘    └──────────────────────────────┘   │
└────────────┼────────────────────────────────────────────────┘
             │ fetch POST /api/ai/vet-calendar
             ▼
┌─────────────────────────────────────────────────────────────┐
│                     SERVIDOR EXPRESS                        │
│                       (server.ts)                           │
│                                                             │
│  - Middleware de Vite para modo desarrollo                  │
│  - Endpoint proxy seguro (protege GEMINI_API_KEY)           │
│  - SDK oficial @google/genai con responseSchema estricto    │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS TLS 1.3
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   GOOGLE GEMINI API                         │
│                  (gemini-3.8-flash)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura del Proyecto

```text
├── index.html                    # Entry point HTML con SEO y meta tags
├── metadata.json                 # Metadatos del entorno y capacidades de servidor
├── package.json                  # Dependencias y scripts de ejecución
├── server.ts                     # Servidor Express + Middleware Vite + Proxy Gemini API
├── tsconfig.json                 # Configuración del compilador TypeScript
├── vite.config.ts                # Configuración de empaquetado Vite y plugins
│
└── src/
    ├── App.tsx                   # Controlador raíz, estado central, navegación y toasts
    ├── main.tsx                  # Punto de montaje del árbol de React
    ├── index.css                 # Importación Tailwind v4 y reglas globales de accesibilidad
    │
    ├── components/               # Componentes modulares de interfaz
    │   ├── AddVaccineModal.tsx      # Modal para añadir vacunas con sugerencias rápidas
    │   ├── AiVetAdvisorModal.tsx    # Modal del Asesor Veterinario con Gemini y modo prueba
    │   ├── BackupModal.tsx          # Modal de exportación, importación y borrado seguro
    │   ├── ClinicalHistoryModal.tsx # Modal de línea de tiempo e historial médico
    │   ├── PetCard.tsx              # Tarjeta de mascota con acordeón de vacunas y acciones
    │   ├── PetFormModal.tsx         # Modal de alta de mascota y borrador de vacunas iniciales
    │   └── VaccineListAlerts.tsx    # Vista principal de alertas con semáforo y filtros
    │
    ├── data/                     # Datos iniciales y mocks
    │   ├── initialData.ts           # Mascotas de demostración (Toby y Michi) y plantillas
    │   └── mockVetAdvisor.ts        # Respuestas mock estructuradas para pruebas sin API Key
    │
    ├── services/                 # Servicios de comunicación externa
    │   └── aiAdvisorService.ts      # Cliente para Gemini con timeout de 15s y validación
    │
    ├── types/                    # Tipos e interfaces de TypeScript
    │   ├── aiAdvisor.ts             # Esquema del Asesor IA (vacunas, preguntas, categorías)
    │   └── pet.ts                   # Entidades centrales: Mascota, Vacuna, Registro Clínico
    │
    └── utils/                    # Funciones puras y utilitarias
        ├── dateCalculations.ts      # Operaciones seguras de fechas, días restantes y urgencia
        └── storage.ts               # Lógica de localStorage, exportación/importación y cuota
```

---

## 🧩 Módulos y Componentes Detallados

### 1. `src/utils/dateCalculations.ts`
El motor matemático de la aplicación. Elimina por completo las trampas de zona horaria:
- `parseLocalDate(dateString)`: Parsea cadenas `YYYY-MM-DD` descomponiendo año, mes y día, instanciando la fecha en hora local a las 00:00:00. Nunca devuelve `Invalid Date`.
- `formatLocalDateToInput(date)`: Formatea objetos `Date` a `YYYY-MM-DD` sin desfase de huso horario para `<input type="date">`.
- `calculateNextDoseDate(date, interval, unit)`: Suma días, meses o años respetando fines de mes (ej: 31 de marzo + 1 mes = 30 de abril).
- `getDaysRemaining(nextDoseDate)`: Calcula la diferencia en días exactos normalizados a medianoche.
- `getVaccineUrgency(nextDoseDate)`: Asigna el estado `vencida`, `por_vencer` o `al_dia`.

### 2. `src/utils/storage.ts`
Capa de abstracción para el almacenamiento:
- `savePetsToStorage(pets)`: Serializa en `localStorage` y captura `QuotaExceededError`.
- `loadPetsFromStorage()`: Recupera y sanitiza las mascotas almacenadas; si no hay datos, inicializa con Toby y Michi.
- `exportPetsToJSONFile(pets)`: Construye un payload con metadatos y dispara la descarga mediante un `Blob` sin tocar servidores externos.
- `importPetsFromJSONFile(file)`: Lee el archivo con `FileReader` y ejecuta `sanitizePet()` asegurando que ninguna propiedad requerida quede indefinida.

### 3. `src/components/VaccineListAlerts.tsx`
Tablero de control principal:
- Filtros interactivos con contadores: *Urgentes*, *Vencidas*, *Por vencer*, *Al día* y *Todas*.
- Estado de confirmación para renovación rápida (*«¿Confirmas que se aplicó hoy?»*) para prevenir toques involuntarios.
- Indicador visual claro del retraso acumulado o días faltantes.

### 4. `src/components/ClinicalHistoryModal.tsx`
Expediente veterinario completo:
- Píldoras de colores y contrastes según la naturaleza del evento clínico.
- Campo de peso adaptativo: acepta coma o punto indistintamente (`14,5` pasa a `14.5 kg`).
- Lectura expandible para diagnósticos extensos (`line-clamp-2` con botón *«Leer detalle completo»*).
- Buscador instantáneo con coincidencias en título, notas, clínica, veterinario y medicamentos.

### 5. `src/components/AiVetAdvisorModal.tsx`
Interfaz del Asesor Veterinario Inteligente:
- Selector de modo: **Gemini API en vivo** vs **Datos de prueba (0 consumo)**.
- Tarjetas de vacunas recomendadas con badges de severidad (*Obligatoria*, *Recomendada*, *Opcional*).
- Botón interactivo para añadir la vacuna directamente al perfil de la mascota activa.
- Preguntas clínicas para el dueño con copia en un toque para WhatsApp o libreta de notas.

---

## 📱 Diseño y Accesibilidad (WCAG & Mobile-First)

La aplicación fue concebida bajo estrictos estándares de usabilidad real en la calle o la veterinaria:

1. **Uso garantizado desde 320 px de ancho:**
   - Todo el contenido y las botoneras son fluidos y responsivos, sin scroll horizontal deforme.
2. **Uso con una sola mano:**
   - Botones principales de confirmación y cierre ubicados en la zona inferior alcanzable por el pulgar.
   - Objetivos táctiles con altura mínima de **48 px** a **52 px** (área táctil óptima para dedos adultos).
3. **Legibilidad al sol y contraste máximo:**
   - Tipografía base forzada mediante `* { font-size: max(16px, 1rem); }` en `index.css`.
   - Evita el auto-zoom molesto de iOS Safari en inputs de texto.
   - Textos de alta densidad en `slate-950` (`#020617`) sobre fondos blancos o claros, complementados con bordes definidos de `2px`.
4. **Claridad cognitiva:**
   - Todas las entradas cuentan con su `<label>` visible y descriptivo.
   - Se evita la jerga técnica confusa en mensajes de error o estados vacíos.

---

## 🛡 Blindaje Defensivo y Pruebas de Robustez (QA)

La aplicación fue sometida a una auditoría de control de calidad destructiva y cuenta con protección activa contra las siguientes 10 fallas críticas:

| # | Vulnerabilidad / Caso Límite | Comportamiento Defensivo Implementado |
|---|---|---|
| **1** | Doble clic rápido en "Guardar" | Estado `isSubmitting` bloquea el botón de inmediato tras el primer toque (`disabled={isSubmitting}`). |
| **2** | Textos de 500 letras sin espacios | Atributos `maxLength` en todos los inputs y clases CSS `break-words` y `break-all` en las tarjetas. |
| **3** | Números negativos o gigantes por teclado | Sanitización estricta con límites: `Math.max(0, Math.min(30, val))` para edad y `Math.max(1, Math.min(365, val))` para intervalos. |
| **4** | Registro de vacunas en fechas futuras | Atributo `max={todayStr}` en selectores de fecha y validación lógica `isFutureDate(date)` en el submit. |
| **5** | Fechas corruptas o borradas a medias | `parseLocalDate()` valida formato y componentes; si falla retorna `new Date()` sin lanzar `RangeError`. |
| **6** | Trampa de espacios en blanco (`"   "`) | Validación obligatoria con `.trim()` antes de permitir el guardado. |
| **7** | Coma decimal en el peso clínico (`14,5`) | Normalización previa con `.replace(',', '.')` para no truncar decimales en navegadores móviles. |
| **8** | Archivos de respaldo JSON corruptos | Función `sanitizePet()` verifica la estructura interna campo por campo antes de cargar datos. |
| **9** | Saturación de memoria (`QuotaExceededError`) | Detección de error de cuota en `storage.ts` y notificación visible para exportar respaldo. |
| **10** | Pérdida de conexión a internet | Listener del evento `offline` en `App.tsx` que notifica que los datos siguen seguros en el dispositivo. |

---

## 🤖 Integración con Google Gemini API

### Esquema Fijo (`responseSchema`)
En `server.ts` se implementa el modelo `gemini-3.8-flash` con el SDK oficial `@google/genai`. La respuesta está gobernada por el siguiente contrato tipado:

```typescript
import { Type } from '@google/genai';

const VET_ADVISOR_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    species: { type: Type.STRING },
    petStage: { type: Type.STRING },
    summaryNote: { type: Type.STRING },
    recommendedVaccines: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          frequency: { type: Type.STRING },
          targetAgeOrCondition: { type: Type.STRING },
          purpose: { type: Type.STRING },
          urgencyLevel: { type: Type.STRING },
        },
        required: ["name", "frequency", "targetAgeOrCondition", "purpose", "urgencyLevel"],
      },
    },
    veterinarianQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          question: { type: Type.STRING },
          reason: { type: Type.STRING },
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
```

### Configuración de la Variable de Entorno
La clave de API **nunca viaja al navegador**. Se configura en el archivo `.env` en la raíz del proyecto:

```bash
GEMINI_API_KEY="AIzaSyTuClaveDeGoogleAIStudio..."
```

En Google AI Studio, se asigna directamente desde el panel **Settings > Secrets**.

---

## 📊 Modelo de Datos (TypeScript)

### Mascota (`Pet`)
```typescript
export type PetSpecies = 'perro' | 'gato' | 'otro';

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  customSpecies?: string;
  ageYears: number;
  ageMonths: number;
  photoEmoji?: string;
  vaccines: Vaccine[];
  clinicalRecords?: ClinicalRecord[];
  createdAt: string;
}
```

### Vacuna (`Vaccine`)
```typescript
export type VaccineFrequencyUnit = 'meses' | 'dias' | 'anios';
export type VaccineUrgency = 'al_dia' | 'por_vencer' | 'vencida';

export interface Vaccine {
  id: string;
  name: string;
  applicationDate: string;   // 'YYYY-MM-DD'
  intervalValue: number;     // Ej: 12
  intervalUnit: VaccineFrequencyUnit; // 'meses'
  notes?: string;
  nextDoseDate: string;      // Calculada automáticamente
}
```

### Registro Clínico (`ClinicalRecord`)
```typescript
export type ClinicalRecordType =
  | 'consulta'
  | 'tratamiento'
  | 'cirugia'
  | 'desparasitacion'
  | 'estudio'
  | 'urgencia';

export interface ClinicalRecord {
  id: string;
  date: string;
  type: ClinicalRecordType;
  title: string;
  veterinarian?: string;
  clinic?: string;
  weightKg?: number;
  diagnosisNotes: string;
  treatment?: string;
  followUpDate?: string;
}
```

---

## 💻 Instalación y Puesta en Marcha

### Prerrequisitos
- Node.js versión 18 o superior.
- Gestor de paquetes `npm`.

### Paso 1: Clonar el repositorio
```bash
git clone https://github.com/jhoselcanva/vacuna-al-dia.git
cd vacuna-al-dia
```

### Paso 2: Instalar dependencias
```bash
npm install
```

### Paso 3: Configurar variables de entorno (Opcional para llamadas en vivo)
```bash
cp .env.example .env
```
Edita `.env` y agrega tu clave de Gemini API:
```env
GEMINI_API_KEY="tu_api_key_aqui"
```
*(Si no dispones de una clave en este momento, puedes utilizar el botón "Modo de Prueba" dentro del Asesor IA sin costo).*

### Paso 4: Iniciar en desarrollo
```bash
npm run dev
```
La aplicación iniciará en: **`http://localhost:3000`**.

### Paso 5: Comandos disponibles
```bash
# Compilar la aplicación para producción
npm run build

# Ejecutar el análisis de tipos y sintaxis (Linter)
npm run lint

# Iniciar el servidor en producción
npm run start

# Limpiar archivos de compilación
npm run clean
```

---

## 🎯 Guía de Uso Rápido

1. **Revisar alertas urgentes:**
   - Al abrir la app, la pestaña **«Alertas»** lista todas las vacunas que requieren atención.
   - Si le diste la vacuna a tu mascota hoy, toca **«Aplicada hoy»** y confirma para renovar la dosis.
2. **Registrar una nueva mascota:**
   - Ve a la pestaña **«Mis Mascotas»** y pulsa el botón verde **«+ Registrar Mascota»**.
   - Ingresa el nombre, especie (perro, gato u otro), edad y selecciona vacunas frecuentes de las sugerencias rápidas.
3. **Añadir visitas al historial médico:**
   - En la tarjeta de la mascota, pulsa **«Historial»**.
   - Toca **«+ Nueva Entrada»**, elige el tipo de atención (consulta, cirugía, desparasitación), anota el peso en kg y las indicaciones del veterinario.
4. **Consultar al Asesor Veterinario IA:**
   - En la tarjeta de la mascota, toca **«Asesor IA»** (botón morado).
   - Observa el calendario sugerido y pulsa **«+ Registrar esta dosis»** para incorporarla de inmediato.
   - Usa el botón **«Copiar pregunta»** para enviarle por mensaje a tu veterinario las dudas clínicas clave.
5. **Hacer una copia de seguridad:**
   - Toca el botón de disco **«Respaldo»** en la esquina superior derecha.
   - Pulsa **«Exportar copia de seguridad»** para guardar el archivo `.json` en tu teléfono o computadora.

---

## 📄 Créditos y Licencia

- **Desarrollador:** Jhosel Canva
- **Carrera / Institución:** 3.er año Desarrollo de Software · INDEL · octubre de 2026
- **Licencia:** Este proyecto se distribuye bajo los términos de la licencia **MIT**. Eres libre de modificarlo, distribuirlo y utilizarlo de forma personal o comercial. Consulta el archivo `LICENSE` para más detalles.
