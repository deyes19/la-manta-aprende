# PROMPT MAESTRO PARA CODEX — LA MANTA APRENDE

Actúa como **arquitecto de software educativo, diseñador instruccional experto en educación rural multigrado colombiana, desarrollador frontend senior, especialista en accesibilidad/DUA y responsable de QA**. Tu objetivo es crear un proyecto real, mantenible y comprobable llamado **La Manta Aprende** para la **Institución Educativa La Manta, sede Villanueva, Montería (Córdoba), Colombia**.

## Contexto y propósito

La sede atiende estudiantes de **transición y primero a quinto**, con varias edades y ritmos de aprendizaje en un aula multigrado. Hay estudiantes lectores emergentes y otros que necesitan instrucciones visuales, auditivas o apoyos. La conectividad es limitada. El docente no puede ir puesto por puesto explicando a cada niño «ahora copia esto», «resuelve este ejercicio» o «haz clic aquí».

**Problema prioritario:** los prototipos anteriores solo permitían navegar y contestar retos, pero NO decían con precisión qué transcribir en el cuaderno ni daban cada ejercicio y cada indicación necesaria. Corrige esto desde la arquitectura: **cada OVA debe actuar como tutor secuencial autoguiado**, no como un banco de cuestionarios.

## Fuentes curriculares y disciplina de trazabilidad

1. Carpeta de mallas oficiales: https://drive.google.com/drive/folders/154X2-Tp_VLv_TCWeI1-K6qFYXwGcTOcL
2. Carpeta de planeaciones: https://drive.google.com/drive/folders/1bw9ek6akYda8_TdUIJBxIz7r_DeI_mpy
3. Cuando estén disponibles, lee los archivos descargados desde `docs/fuentes/`; no presupongas acceso directo del entorno de Codex a Google Drive. Si faltan, prepara el importador, crea el piloto solo con los temas que aquí están confirmados y registra `PENDIENTE_FUENTE`.
4. Existen mallas para Matemáticas, Lengua, Naturales y Sociales 1.º–5.º, malla de Transición, proyecto integrado CapER (Paz/Ética/Religión) y EATI (Emprendimiento/Artística/Tecnología). Hay cerca de 315 registros curriculares temáticos de primaria y 47 entradas de transición en una matriz preliminar; NO afirmar que son OVA completados ni temas distintos sin auditar.
5. No aparecen en esa carpeta mallas generales completas de Inglés y Educación Física: no atribuir temas inventados a esos documentos. Hay planeaciones de Inglés para grados 3.º–5.º del período IV. Marcar las ausencias.
6. Existe una diferencia entre copias de la malla de Matemáticas 5.º período III; **conservar el hallazgo y pedir validación en vez de resolverlo silenciosamente**.

## Arquitectura del proyecto

Crea una aplicación **React + TypeScript + Vite**, con archivos de contenido JSON tipados y versionados, validación de esquemas, estilos accesibles, almacenamiento local en IndexedDB y funcionamiento **offline mediante PWA y recursos precargados**. No dependas en tiempo de clase de API, CDN, videos, fuentes, imágenes o audios de internet. Documenta honestamente que el service worker requiere origen válido (`localhost` o HTTPS) y ofrece instalación PWA; propone empaquetado autónomo de escritorio Windows como fase posterior si se exige doble clic sin servidor.

El repositorio deberá contener `README.md`, documentación pedagógica, `docs/fuentes/`, estructura `apps/web/src/features/{student,teacher,lessons,preschool,analytics,accessibility}`, motor de pasos, validador del esquema curricular, catálogo, guardado de progreso, exportación CSV/JSON, pruebas unitarias y e2e. Mantén el código modular, no un HTML monolítico.

## Navegación

Pantalla de inicio institucional → elección de perfil local del estudiante por alias/código y grado → selección de período → asignatura/proyecto → unidad → tema → recorrido de lección → evidencia y resumen → regreso a la ruta. Mostrar progreso por pasos, opción para continuar donde quedó y mensajes adecuados a la edad. Modo docente con grupos multigrado, visualización del currículo, selección de misiones, ajustes de apoyo y reportes exportables.

## Motor obligatorio de lecciones

**Cada tema de primaria debe recorrer estos ocho pasos funcionales:**

1. `presentacion`: narrar qué aprenderá, qué materiales tendrá listos, qué pasos seguirá.
2. `exploracion`: activar saberes previos con un reto manipulable o situado en la vida de la vereda.
3. `explicacion`: explicación en pantallas cortas, ejemplos resueltos y apoyos visuales; botones para escuchar y repetir.
4. `mi_cuaderno`: **mostrar y narrar exactamente la fecha/título/conceptos/ejemplos y cada ejercicio que el estudiante copiará**, en pantallas separadas. Indicaciones como «Busca tu cuaderno», «Escribe el título», «Copia la definición», «Haz el dibujo», «Resuelve 1, 2 y 3». Cada enunciado debe aparecer completo. El botón «Ya terminé» registra solo autodeclaración, no verificación automática de la copia.
5. `practica_guiada`: ejercicios interactivos concretos, verificables, con pistas, explicaciones y reintentos.
6. `mision_contextual`: problema de tienda, huerta, animales, familia, ambiente, comercio local o escuela, de la competencia correspondiente.
7. `evaluacion`: evidencia formativa de la habilidad, con registro de aciertos, primer intento, ayudas y número de reintentos; no limitar todas las tareas a opción múltiple.
8. `cierre`: síntesis, autoevaluación, siguiente paso explícito y registro docente.

Cada pantalla debe ofrecer botones funcionales: **Escuchar instrucciones / Repetir / Necesito una pista / Atrás / Listo, continuar** según corresponda. Un lector emergente debe poder continuar con voz e iconos, sin pedir permanentemente ayuda al profesor. El audio obligatorio debe funcionar sin internet; TTS del navegador puede ser una ayuda secundaria y no un sustituto garantizado de audios empaquetados.

**Prohibido** usar instrucciones vacías como «realiza la actividad», «haz el taller del cuaderno» o «trabaja en grupo» sin especificar la acción, el enunciado completo, las cantidades, las condiciones y el criterio de finalización.

## Primer OVA completo que debes desarrollar y probar

**Grado:** 2.º · **Asignatura:** Matemáticas · **Período:** IV · **Malla:** «La multiplicación» y «Tablas de multiplicación por 2, 3, 4, 5», relacionadas con problemas multiplicativos de adición repetida. Este contenido SÍ aparece en la malla institucional revisada.

**Escena de apertura:** «En la huerta de La Manta, cuatro canastas tienen tres mangos cada una. Hoy aprenderemos a contar grupos iguales»; mostrar grupos visuales contables, no solo texto.

**Mi cuaderno, paso exacto 1:** «Abre el cuaderno de Matemáticas. Escribe la fecha de hoy. Copia este título: **La multiplicación**». Espera la confirmación del niño.

**Mi cuaderno, paso exacto 2:** «Copia esta idea: **La multiplicación sirve para contar grupos iguales. Es una suma repetida.**».

**Mi cuaderno, paso exacto 3:** «Copia el ejemplo: **Tres canastas tienen cuatro mangos cada una. 4 + 4 + 4 = 12. Entonces, 3 × 4 = 12 mangos.** Dibuja tres canastas con cuatro mangos en cada una».

**Mi cuaderno, paso exacto 4:** «Copia y resuelve estos ejercicios completos: **1. Hay 5 canastas con 2 naranjas cada una. Dibuja las canastas, escribe la suma repetida y la multiplicación. 2. Hay 4 corrales con 3 gallinas en cada corral. ¿Cuántas gallinas hay en total? Escribe la suma repetida y la multiplicación. 3. Dibuja 2 filas de 5 plantas. Cuenta las plantas y escribe la multiplicación.**».

**Mi cuaderno, paso exacto 5:** «Ahora compara tus resultados con los ejemplos que muestra el OVA. Puedes corregir tus operaciones en el cuaderno». Mostrar las soluciones una por una, **después** de que el niño termine, sin afirmar que el programa vio su cuaderno.

**Práctica guiada:** usar grupos gráficos contables, suma repetida y equivalencia multiplicativa; distintas respuestas y pistas visuales, no únicamente un examen de selección múltiple.

**Misión final:** «La huerta necesita preparar 5 bandejas con 4 semillas cada una. Organiza las semillas, escribe la multiplicación y calcula el total». Permitir comprobar el resultado y explicar por qué 5 × 4 = 20.

**Evaluación:** mínimo 4 problemas que permitan evidenciar si representa grupos iguales, escribe sumas repetidas, traduce a multiplicación y resuelve problemas. Guardar qué apoyo usó y si acertó en el primer intento. No confundir el puntaje del juego con una nota oficial.

**Recursos concretos:** tapas, semillas, lápiz y cuaderno, con alternativa digital sin recursos extra.

## Adaptaciones por nivel

- Transición: módulos por dimensiones y propósitos, juego/arte/literatura/exploración; consignas habladas e iconográficas, manipulación, movimiento y acompañamiento cuando es necesario. No reproducir el formato obligatorio de copia en cuaderno de primaria.
- Primero: muchos estudiantes todavía no leen de modo autónomo; usar audio offline, vocabulario básico, pictogramas y progresión.
- Segundo y tercero: instrucciones con audio, ejemplos resueltos, actividades diferenciadas y escritura gradual.
- Cuarto y quinto: mayor autonomía, lectura/escritura de problemas y retos de análisis.
- En cada grado aplicar DUA: varias formas de representación, participación y respuesta. Distinguir ajuste de acceso de cambio del objetivo de aprendizaje.
- CapER/EATI deben respetar integración institucional sin perder visibilidad de las asignaturas participantes.

## Calidad y límites

- Cada tema publicado está relacionado con `fuente`, `grado`, `periodo`, `tema`, `competencia` y `evidencia` verificables.
- No publiques catálogo de temas como si fueran unidades desarrolladas: indicar «Disponible», «En construcción» y «Falta fuente curricular».
- Permitir regresar y reanudar; gestionar errores, ausencia de sonido y fallos de almacenamiento.
- Resguardar datos de menores: perfiles con alias local, sin enviar información fuera del equipo ni tomar fotografías/grabar por defecto.
- Explicar al docente qué puede comprobar automáticamente el sistema y qué requiere observación del cuaderno/producciones reales.
- Para actividad sin internet, realiza una prueba real con red desconectada después de precarga/instalación; evita dependencias externas.
- Usar botones grandes, contraste, navegación por teclado y mensajes breves. Ejecutar tests automatizados para cálculos, navegación, validación de esquemas, persistencia y exportación.

## Modo de trabajo de Codex: por etapas y con entregas verificables

**PRIMERA ENTREGA:** crea el repositorio, la arquitectura, el esquema de contenidos, la vista de estudiante y docente, el primer OVA **completo** de 2.º Matemáticas IV (ocho pasos incluyendo todas las instrucciones para copiar y resolver en cuaderno), persistencia local, exportación básica, pruebas e instrucciones para instalar y ejecutar offline. Crea documentación para importar las mallas como archivos locales. Incluye un reporte claro de lo terminado, lo probado y lo pendiente. **No desarrolles cientos de OVA vacíos**.

**SEGUNDA ENTREGA (solo tras validar la primera):** motor editorial, módulos de accesibilidad más completos y una segunda unidad de otra asignatura, idealmente Lengua Castellana 2.º con combinaciones e inversos según período, para demostrar que el sistema no está programado solo para Matemáticas.

**TERCERA ENTREGA:** importación de la matriz curricular completa, reconciliación de duplicados y trazabilidad entre malla, planeación y OVA.

**EXPANSIÓN:** implementar por tandas de temas validados, con revisión pedagógica antes de pasar a producción.

**Criterio de aceptación principal:** un estudiante de segundo debe poder completar desde el inicio hasta el cierre la lección piloto, saber **exactamente qué copiar, qué dibujar y qué ejercicios hacer en el cuaderno, cuándo pasar al juego, cómo corregir y qué mostrar al profesor**, sin que el docente tenga que explicarle cada paso de la navegación. La aplicación debe guiarlo por texto y audio y registrar únicamente las evidencias que realmente puede observar.

Antes de escribir demasiado código, crea un plan de implementación y un checklist con estos requisitos. Después **ejecuta la primera entrega**, no te quedes únicamente en un plan o maqueta.
