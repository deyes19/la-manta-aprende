# La Manta Aprende

Primera entrega ejecutable para I. E. La Manta, sede Villanueva, Montería, Córdoba. Un piloto de **segundo · Matemáticas · período IV · multiplicación y tablas del 2 al 5**. React, TypeScript y Vite; perfiles por alias, IndexedDB, audio español empaquetado y PWA.

**Estado pedagógico: PENDIENTE_FUENTE.** El kit inicial no contiene las mallas originales. El ejemplo orienta la propuesta; no demuestra aprobación institucional. No se han desarrollado otras unidades ni auditado las cifras curriculares citadas en el kit.

## Ampliación a las tres áreas

Alcance confirmado: transición a quinto, cuarto período, Matemáticas, Lengua Castellana y Ciencias Sociales. El motor, catálogo y reportes ahora admiten múltiples unidades y objetivos por área; únicamente el piloto de Matemáticas de segundo está disponible. Las mallas se identificaron en Drive, pero su descarga necesita habilitar `drive.usercontent.google.com` o aportar los originales. Consulta [cobertura y bloqueo actual](docs/ALCANCE_CUARTO_PERIODO.md).

## Ejecutar

Requisitos: Node.js 24 LTS y npm. Desde la raíz del proyecto:

```bash
npm ci
npm run validate:content
npm run dev
```

Para la versión de aula y el modo sin internet:

```bash
npm run build
npm start
```

Abre `http://localhost:4173` en Edge o Chrome, espera **«Unidad y audios preparados para usar sin internet»** y usa la opción de instalar aplicación del navegador. Mantén siempre el mismo navegador y origen; no cambies localhost por 127.0.0.1 ni el puerto. `npm run dev` sirve para desarrollo; su modo offline no está habilitado. No abras `index.html` con doble clic: `file://` no soporta este flujo.

En Windows, después de preparar la compilación, abre `scripts/iniciar-windows.cmd`. El lanzador requiere Node y sirve archivos locales; no es todavía un instalador autónomo. Consulta [instalación Windows](docs/INSTALACION_WINDOWS.md).

## Qué incluye

- 33 pantallas en ocho momentos, audio local por consigna, contenido literal, ayuda y devolución (92 MP3).
- Grupos manipulables, tablas 2–5, copia gradual, tres problemas escritos completos con revisión posterior, práctica, misión y evaluación de cuatro objetivos.
- Perfil local, reanudación, registro de primer intento/reintentos/ayudas y declaración de cuaderno separada de competencia.
- Panel docente, grupos, asignación del piloto a segundo, apoyos de acceso y exportación JSON/CSV filtrada.
- Texto grande, alto contraste, teclado, foco al cambiar de pantalla y ausencia de movimiento obligatorio.
- Módulo de transición reservado con su enfoque pedagógico; CapER y EATI visibles sin temas inventados.

## Validación

```bash
npm run validate:content
npm run audit:curriculum
npm test
npm run build
npm run test:e2e
```

Las pruebas e2e usan Chromium del sistema si está disponible. En otro equipo, instala el navegador de pruebas con `npx playwright install chromium`. Requiere red únicamente para obtener las dependencias/navegador, no durante la sesión de aprendizaje. Consulta [reporte de entrega](docs/ENTREGA_1.md).

## Contenido y fuentes

La unidad está en `apps/web/src/content/pilot.json`. El esquema Zod está en `packages/content-schema/index.ts`. Se conservan los tres documentos del kit en `docs/kit/`. Importación y trazabilidad: [fuentes](docs/fuentes/README.md), [matriz](docs/MATRIZ_TRAZABILIDAD.md), [estándares](docs/ESTANDARES_DE_CONTENIDO.md).

Los MP3 ya están incluidos: no se necesita sintetizador ni internet para escucharlos. Para regenerarlos en desarrollo: `npm run audio:generate`, con FFmpeg instalado. Se usa eSpeak-NG (herramienta de desarrollo GPL-3.0); sus binarios no se incluyen en la aplicación. La voz sintética necesita revisión de inteligibilidad por docentes y niños antes de uso institucional. Transcripciones en `apps/web/public/audio/transcripts.json`.

## Protección y límites

No hay cuentas de menores, analítica remota, fotos ni grabación. Los datos solo existen en el navegador de este equipo. El modo docente es una separación de interfaz, **no autenticación segura**: todo usuario del mismo navegador puede abrirlo. El equipo compartido necesita supervisión y políticas locales de acceso.

Exporta periódicamente desde el panel docente. El borrado de datos del navegador elimina los avances; JSON es una copia consultable, la restauración/importación de resultados queda para otra etapa. No se afirma que el programa haya inspeccionado el cuaderno. No hay notas oficiales automáticas.

## Estructura

`apps/web/src/features/` separa estudiante, lecciones/actividades, docente, inclusión, transición y reportes; `offline/` contiene persistencia y verificación de caché. `scripts/` conserva validación, auditoría, importación de documentos y servidor local. [Plan técnico](docs/PLAN_TECNICO.md), [visión pedagógica](docs/VISION_PEDAGOGICA.md) y [manual docente](docs/MANUAL_DOCENTE.md).
