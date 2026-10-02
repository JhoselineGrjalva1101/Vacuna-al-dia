# Bitácora de Prompts — Vacuna al Día

Proyecto académico: Desarrollo de Software (3.er año) · INDEL · Octubre de 2026

---

## P0 · Prompt Cero (Versión Inicial)

**Prompt textual:**
```text
Crea una app para registrar mascotas (perro, gato u otro con especie personalizada),
guardar sus vacunas con fecha de aplicación y frecuencia (meses o días), calcular la
próxima dosis y mostrar alertas de vencidas o por vencer en los próximos 30 días.
```

**Qué devolvió:** Una aplicación básica en React con lista de tarjetas de mascotas, modal de registro y cálculo simple de fechas.  
**Qué acepté:** La estructura base de las interfaces de datos (`Pet`, `Vaccine`) y el selector de especies con emojis.  
**Qué corregí a mano:** Los desfases de zona horaria generados por `new Date('YYYY-MM-DD')` que adelantaban un día las fechas; creé la función `parseLocalDate` para trabajar en hora local exacta.  
**Evidencia:** `evidencias/E0-inicial.png`  
**Commit:** `f8a12bc`

---

## M1 · Función (Historial Clínico Digital)

**Prompt textual:**
```text
No reescribas lo que ya funciona. Dame únicamente:
1. Los fragmentos nuevos o modificados, indicando en qué archivo y en qué parte va cada uno.
2. Una prueba manual de tres pasos para comprobar que quedó bien.
3. Qué podría romperse en el resto de la app por este cambio.
Agrega un historial clínico digital con consultas, diagnósticos, cirugías, tratamientos y peso.
```

**Qué devolvió:** La interfaz `ClinicalRecord`, el modal `ClinicalHistoryModal.tsx` con línea de tiempo interactiva y la integración sin alterar la lista de vacunas.  
**Qué acepté:** El diseño de la línea de tiempo clasificada por categorías (consultas, cirugías, desparasitaciones) y el buscador por diagnóstico.  
**Qué corregí a mano:** Agregué fallback con `pet.clinicalRecords || []` para evitar errores `undefined` en mascotas registradas previamente.  
**Evidencia:** `evidencias/E1-antes.png` / `evidencias/E1-despues.png`  
**Commit:** `c3d4e5f`

---

## M2 · Datos (Persistencia y Respaldo JSON)

**Prompt textual:**
```text
Quiero que los datos de la app no se pierdan al cerrarla. Usá [localStorage / archivo JSON]
y explicame: 1. Dónde queda guardada la información exactamente. 2. Qué pasa si el usuario
borra el caché o cambia de dispositivo. 3. Cómo hago para exportar los datos a un archivo.
Dame el código de guardar, leer y borrar, y un dato de ejemplo ya cargado para probar.
```

**Qué devolvió:** Explicación técnica de almacenamiento en el perfil del navegador y funciones en TypeScript para `savePets`, `loadPets`, `exportPetsToJSONFile` y un objeto JSON de prueba.  
**Qué acepté:** El módulo `storage.ts` con lectura y escritura centralizada y la exportación en formato `.json` descargable vía `Blob`.  
**Qué corregí a mano:** Integré el componente `BackupModal.tsx` con botón directo en la barra superior para que el usuario pueda respaldar y restaurar con un solo clic.  
**Evidencia:** `evidencias/E2-antes.png` / `evidencias/E2-despues.png`  
**Commit:** `a9b8c7d`

---

## M3 · Experiencia (Accesibilidad y Uso en Celular)

**Prompt textual:**
```text
Ajustá la interfaz de la app con estos requisitos, sin cambiar la lógica:
1. Se usa bien desde 320 px de ancho, con una sola mano y sin hacer zoom.
2. Contraste suficiente para leerse al sol; texto nunca menor a 16 px.
3. Todos los campos con etiqueta visible, no solo con texto de ejemplo dentro.
4. Un solo botón principal por pantalla; los demás, secundarios.
5. Estado vacío: qué se muestra cuando todavía no hay ningún dato, con una frase que invite a la primera acción.
6. Mensajes de éxito y de error visibles, en español, sin palabras técnicas.
Dame los cambios y decime cuál de los seis puntos NO pudiste cumplir y por qué.
```

**Qué devolvió:** Ajustes de estilos con tipografía mínima de 16 px, botones de 48 px de altura táctil, jerarquía visual estricta y estados vacíos amigables.  
**Qué acepté:** La regla global en CSS `* { font-size: max(16px, 1rem); }` que además solucionó de raíz el auto-zoom molesto de Safari en iPhone.  
**Qué corregí a mano:** Ajusté las cuadrículas de los botones secundarios en la cabecera para que nunca hicieran salto de línea desprolijo en pantallas pequeñas de 320 px.  
**Evidencia:** `evidencias/E3-celular.png` / `evidencias/E3-vacio.png`  
**Commit:** `e1f2a3b`

---

## M4 · Robustez (Auditoría de Calidad y Validación Anti-Errores)

**Prompt textual:**
```text
Actuá como tester de software, no como programador. Dame diez formas concretas de romper
esta app desde la interfaz: campos vacíos, texto donde va número, números negativos, fechas
imposibles, textos de 500 caracteres, doble clic en guardar, pérdida de conexión a mitad de
una acción. Para cada una decime: qué pasaría hoy, qué debería pasar, y el código mínimo
que lo evita. No cambies el diseño ni agregues funciones nuevas.
```

**Qué devolvió:** Un reporte de calidad detallando 10 escenarios destructivos con su comportamiento erróneo y los fragmentos defensivos correspondientes.  
**Qué acepté:** Todas las validaciones: `isSubmitting` anti-duplicados, `isFutureDate` contra fechas en el futuro, y `maxLength` contra desbordes de texto.  
**Qué corregí a mano:** Implementé la sanitización completa en `sanitizePet()` para evitar que un archivo JSON mal formado deje la app en pantalla blanca, y agregué el detector de estado `offline`.  
**Evidencia:** `evidencias/E4-error.png`  
**Commit:** `d4e5f6a`

---

## M5 · Inteligencia (Asesor Veterinario con Gemini 3.8 Flash)

**Prompt textual:**
```text
Integrá una llamada a la API de Gemini dentro de la app para esta tarea concreta:
La IA arma el calendario según especie y edad y redacta las preguntas que conviene hacerle al veterinario.
Requisitos:
1. La respuesta debe venir como JSON con un esquema fijo (responseSchema), no como texto libre. Dame el esquema.
2. La app consume ese JSON y lo muestra en pantalla como dato, no como párrafo.
3. La llave de API se lee de una variable de entorno; mostrame cómo configurarla.
4. Manejo de fallo: qué se muestra si la IA no responde, responde lento o devuelve algo que no cumple el esquema.
5. Un ejemplo de respuesta de prueba para desarrollar sin gastar llamadas.
```

**Qué devolvió:** El esquema estricto en `@google/genai`, el endpoint seguro en `server.ts` con modelo `gemini-3.8-flash`, el servicio con timeout de 15 segundos y el JSON de prueba.  
**Qué acepté:** El endpoint con `responseSchema` y el modal `AiVetAdvisorModal.tsx` que muestra cada vacuna y pregunta como tarjeta interactiva.  
**Qué corregí a mano:** Añadí el botón directo *"+ Registrar esta dosis en [Mascota]"* dentro de las tarjetas sugeridas por la IA para que el usuario pueda agregarlas a su libreta sin tener que reescribirlas a mano.  
**Evidencia:** `evidencias/E5-json.png` / `evidencias/E5-app.png` / `evidencias/E5-falla.png`  
**Commit:** `b7c8d9e`

---

## Reflexión de Cierre

- **Prompts que escribí en total:** 6 prompts principales de iteración y refinamiento técnico.
- **El prompt que más me sirvió y por qué:** El prompt de **QA Tester (M4)**. En lugar de pedir código a ciegas, obligó a auditar la app desde la óptica de un usuario que se equivoca o quiere romperla, detectando problemas invisibles como el doble clic rápido y los números negativos por teclado físico.
- **El error más caro que cometí:** Confiar inicialmente en que `new Date('YYYY-MM-DD')` interpretaba la fecha en hora local; en varios husos horarios convertía la fecha a UTC y le restaba un día al renderizar en pantalla. Lo solucioné escribiendo un parser manual de fecha (`parseLocalDate`).
- **Lo que haría distinto la próxima vez:** Definir el esquema estricto de datos y el manejo de persistencia local desde el minuto cero (P0), en lugar de construir la interfaz primero y tener que adaptar los tipos después.
