# La Manta Aprende

Plataforma local para I. E. La Manta, sede Villanueva, Montería, Córdoba. **Cuarto período, transición a quinto, Matemáticas, Lengua Castellana y Ciencias Sociales.** React/TypeScript/Vite, IndexedDB, audio local y PWA.

Actualmente hay **19 rutas ejecutables y 665 pantallas**: 16 unidades de primaria y tres experiencias integradas de transición. Segundo tiene dos rutas de Matemáticas (multiplicación y área/datos). No se confunde un catálogo con unidades completas.

**Estado curricular: FUENTE_CONSULTADA.** Se descargaron y leyeron las cuatro mallas originales y siete planeaciones complementarias. Cada unidad referencia archivo, tabla/fila y aprendizajes/evidencias. Las actividades son una propuesta didáctica; **requieren revisión y aprobación docente**, prueba en aula y revisión de la voz sintética. No se declaran aprobadas por la institución.

## Ejecutar

Node.js 24 LTS y npm. Desde la raíz:

```bash
npm ci
npm run validate:content
npm run dev
```

Versión de aula con preparación sin conexión:

```bash
npm run build
npm start
```

Abre `http://localhost:4173` en Edge/Chrome. Espera **«Unidad y audios preparados para usar sin internet»** y usa instalar aplicación desde el menú del navegador. La preparación precarga todas las rutas (aproximadamente 79 MiB); no desconectes hasta verificar. Mantén navegador/origen/puerto. `npm run dev` no habilita el modo offline. `file://` no funciona.

Windows: después de preparar la compilación, abre `scripts/iniciar-windows.cmd`. El ZIP de aula incluye la compilación y solo necesita Node instalado: no requiere npm ni descargas durante la clase. [Guía Windows](docs/INSTALACION_WINDOWS.md). El instalador autónomo de escritorio queda para otra fase.

## Publicar en Vercel

Conectar el proyecto a `deyes19/la-manta-aprende`, usar `main` como rama de producción y seleccionar Node.js 24.x. Las rutas de salida se interpretan desde **Root Directory**. Configurar una de estas dos opciones completas:

| Root Directory | Output Directory | Configuración |
| --- | --- | --- |
| Vacío (raíz del repositorio) | `apps/web/dist` | `vercel.json` |
| `apps/web` | `dist` | `apps/web/vercel.json` |

En ambos casos, instalar con `npm ci` y compilar con `npm run build`. La opción recomendada para una configuración nueva es raíz vacía con salida `apps/web/dist`. Si se elige `apps/web`, habilitar **Include source files outside of the Root Directory in the Build Step**, porque el código usa `packages/content-schema` del repositorio. Evitar mezclar raíz vacía con salida `dist`: la compilación genera `apps/web/dist`, y Vercel no encontrará una carpeta `dist` en la raíz. El repositorio incluye un `vercel.json` en cada raíz admitida para hacer explícita la salida.

Con la integración Git activa, cada push a `main` solicita un despliegue. Confirmar el commit y el estado **Ready** en Deployments antes de darlo por publicado. Usar el dominio de producción de Domains para el aula; los enlaces individuales de despliegue corresponden a versiones concretas. Si la PWA instalada muestra una actualización, terminar la actividad y exportar los resultados antes de aplicarla. Esperar la preparación sin conexión de los recursos nuevos.

La opción **Elegir voz** permite probar las voces del navegador. Para el aula sin Internet, elegir una voz instalada o los audios guardados. Ver [guía de voz](docs/VOZ_COLOMBIANA.md).

## Qué puede hacer el estudiante

Seleccionar alias/grado/período/área/unidad; escuchar y repetir; avanzar una tarea a la vez; copiar textos y ejercicios íntegros; revisar soluciones; practicar; realizar una misión; comprobar aprendizajes y compartir evidencias. Guarda avances separados por perfil/unidad y reanuda.

Primaria organiza 75 temas en secuencias completas: explicación, tarjetas de cuaderno, ejercicio con revisión inmediata y práctica antes de abrir el siguiente tema. Título, idea y ejemplo se escriben en tarjetas separadas. La misión y evaluación integran lo trabajado. Los modelos locales de dibujo apoyan la copia y las tablas y fracciones incluyen construcción de grupos, coloreado y reparto. Primaria conserva los ocho momentos. Hay respuestas numéricas, decimales con coma o punto, escritura, elección, secuencias, reparto y fracciones manipulables. Se conservan el primer intento, ayudas y reintentos. El dictado tiene la palabra en audio, sin mostrarla como respuesta en la pregunta.

Transición usa juego, arte, literatura y exploración, oralidad, composición de figuras y acompañamiento. Las áreas son etiquetas de navegación de experiencias integradas del propósito #4, no divisiones curriculares inventadas. No exige copias ni exámenes de primaria; sus producciones no se califican automáticamente.

## Panel docente y privacidad

Filtros por estudiante/grupo/unidad, asignaciones por grado, apoyos de acceso, observaciones manuales y exportación CSV/JSON. Las confirmaciones del niño no verifican el cuaderno, dibujos, actuaciones ni competencia oral. Se separan observaciones docentes y comprobaciones digitales.

Sin cuentas en nube, analítica remota, fotos o grabaciones. Datos en IndexedDB del navegador y del origen. El modo docente **no tiene autenticación segura**; supervisar equipos compartidos. Exporta periódicamente. Borrar datos o cambiar origen/navegador puede perder acceso a avances. Los reportes se pueden consultar externamente; aún no hay restauración/importación de respaldos. No se generan notas oficiales.

## Fuentes y autoría

[Mapa de cuarto período](docs/ALCANCE_CUARTO_PERIODO.md), [trazabilidad](docs/MATRIZ_TRAZABILIDAD.md), [fuentes originales](docs/fuentes/README.md), [manual](docs/MANUAL_DOCENTE.md) y [secuencia por temas](docs/ENTREGA_3_SECUENCIA.md). SHA-256 en docs/fuentes/manifest.json. Se conserva el kit como antecedente, no como sustituto de las mallas originales.

Los JSON ejecutables están en apps/web/src/content/. scripts/content/build-fourth-period.py contiene los guiones didácticos y genera las unidades/catalog.ts; requiere Python 3 solo para autoría, no para uso o instalación de aula. Al editar el contenido generado, actualiza el guion fuente para no perder cambios en futuras generaciones. Las mallas y extractos originales no se sobrescriben.

1. Modificar guiones y ejecutar `python scripts/content/build-fourth-period.py`.
2. Regenerar narraciones con `npm run audio:generate` (requiere FFmpeg y eSpeak-NG de desarrollo).
3. Ejecutar validación, compilación y pruebas; revisar pedagogía y audio antes de aprobar contenidos.

Hay **1.650 locuciones**; el índice de audio reutiliza 826 archivos distintos, conservando los recursos históricos del piloto. Las transcripciones están en public/audio/transcripts.json. No se necesita sintetizador ni internet para escuchar. La herramienta eSpeak-NG es GPL-3.0, de desarrollo; su código no se incluye en el navegador.

## Validación técnica

```bash
npm run validate:content
npm run audit:curriculum
npm test
npm run build
npm run test:e2e
```

Las pruebas e2e usan Chromium del sistema, o `npx playwright install chromium` en otro equipo. Ese navegador solo se descarga al preparar las pruebas. La suite recorre todas las unidades y prueba persistencia, observación docente, reportes, transición, accesibilidad y uso sin red. La validación automática no acredita autonomía real con niños.
