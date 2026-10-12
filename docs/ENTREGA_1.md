# Entrega 1 · 12 de octubre de 2026

## Implementado

Arquitectura React/TypeScript/Vite con módulos separados; contenido JSON validado por Zod; perfiles por alias/grado/avatar; ruta curricular y reanudación; IndexedDB; unidad completa de segundo, Matemáticas, período IV, multiplicación y tablas 2–5. Son 33 pantallas en ocho momentos, no 33 unidades.

La ruta contiene representación manipulable, ejemplos resueltos, fecha visible de Colombia, título y definición literales, ejemplo dibujado, tablas, tres ejercicios escritos completos, revisión posterior, práctica, misión de cinco bandejas de cuatro semillas y cuatro comprobaciones formativas de objetivos diferentes. Incluye 92 audios locales en español (consignas/contenidos/pistas/devoluciones), voz lenta y transcripciones.

Panel docente con grupos, asignación local a segundo, ajustes de acceso y exportación CSV/JSON por grupo/estudiante. Se registran pasos, respuestas, primer intento, reintentos, ayudas, autoevaluación y finalización. El clic del cuaderno se trata como autodeclaración y no como evidencia de calidad.

La PWA precarga 104 entradas, aproximadamente 7,8 MiB, con iconos instalables. No depende de recursos externos para sesiones educativas. Incluye servidor local sin dependencias y lanzador Windows, además de documentación pedagógica, importador de originales con hashes y auditoría de estado curricular.

## Verificado en esta máquina Linux / Chromium

| Comprobación | Resultado |
|---|---|
| `npm ci` con lockfile | Correcto; instalación repetible |
| `npm run validate:content` | 33 pantallas válidas y audios locales presentes |
| `npm run build` | TypeScript y producción/PWA correctos |
| `npm test` | 6 pruebas aprobadas; ninguna omitida |
| `npm run test:e2e` | 4 pruebas aprobadas; ninguna omitida |
| Recorrido real | Completó las 33 pantallas, cuaderno y cuatro evaluaciones |
| Persistencia | Recarga y reanudación en tarjeta del cuaderno; separación entre perfiles; borrado selectivo |
| Sin red | Contexto Chromium desconectado después de precarga; recarga de aplicación, audio, nueva respuesta guardada y exportación JSON funcionaron |
| Actividades y reportes | Respuestas incorrectas bloquean avance; corrección funciona; exportación conserva primer intento fallido y ayuda posterior |
| Accesibilidad | Teclado/foco, texto grande y contraste; axe sin infracciones serias o críticas en vistas de perfil y actividad |
| Fallo de almacenamiento | Error visible, sin avance silencioso |
| Pantalla estrecha | Navegación y actividad a 390 px, sin desbordamiento horizontal |

La prueba offline no registró solicitudes externas de sesión. El audio inicial se decodificó y su reproducción avanzó; el audio del cierre se abrió sin red. La presencia de todos los audios se valida y la preparación comprueba su caché. No se ha escuchado y validado humanamente toda la locución ni se ha observado autonomía real con niños. Axe automático no sustituye revisión de accesibilidad con usuarios.

## Configuración del entorno en nube

Se guardaron en borrador `install_script` (Node 24, npm ci, validación de contenido y compilación), `start_skill` (checkout existente, inicio y comprobación de aula/desarrollo) y la adición de `drive.google.com` a los dominios personalizados permitidos, conservando los presets existentes. El borrador está confirmado como guardado. Guardarlo no aplica la política de red ni publica el entorno; revisar y guardar los cambios en configuración del entorno y después publicar. No se ha comprobado restauración en una nueva tarea.

## Pendiente y decisiones pedagógicas

El estado del piloto es **PENDIENTE_FUENTE** y su aprobación pedagógica está pendiente. Drive devolvió CONNECT 403 por la política vigente; el ZIP solo contiene documentos del kit. Faltan originales, lectura de mallas/planeaciones y localizadores verificables. Las competencias/evidencias son propuestas didácticas, no certificaciones institucionales. El acceso a las carpetas tras aplicar la política todavía necesita comprobarse; puede requerir permisos del propietario.

El docente debe aprobar ubicación curricular, carga de copia de tablas, duración/pausas, ayudas, convención grupos × cantidad y claridad de voz/iconos. La observación de cuaderno y respuestas orales es externa al programa. Se requiere una prueba en aula antes de publicación curricular institucional.

Pendiente: OVA de transición y otros grados/áreas; editor e importación curricular semántica; restauración de reportes; ajustes documentados del objetivo para casos individuales; instalador de escritorio autónomo/firmado. CapER y EATI conservan su identidad sin contenidos supuestos. No se crearon cientos de unidades vacías.

La guía Windows y el lanzador se entregan; no se probaron en un equipo Windows físico. El paquete compilado requiere Node instalado. El modo docente no es autenticación segura y el almacenamiento depende del navegador/origen; exportar copias periódicas.
