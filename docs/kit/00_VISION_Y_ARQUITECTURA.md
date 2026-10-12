# LA MANTA APRENDE — Especificación funcional y técnica

**Versión:** 1.0 · 12 de octubre de 2026  
**Institución:** Institución Educativa La Manta · Sede Villanueva · Montería, Córdoba, Colombia  
**Alcance:** transición (preescolar) y primaria de 1.º a 5.º, cuatro períodos por grado, todas las áreas o proyectos de las mallas institucionales.

## 1. Problema pedagógico que resuelve

En el aula rural multigrado el docente atiende simultáneamente estudiantes de distintas edades, ritmos y competencias. Un OVA que simplemente enseña un tema y plantea preguntas NO resuelve el problema. Cada OVA debe funcionar como una **ruta autoguiada de aprendizaje**, capaz de indicar al estudiante qué hacer a continuación, con instrucciones cortas, audibles, concretas y verificables.

**Resultado esperado:** el niño abre una asignatura y un tema, escucha o lee el objetivo; explora una situación cercana a La Manta; recibe explicación; ve y escucha exactamente lo que copiará en su cuaderno; realiza actividades físicas o escritas con instrucciones detalladas; completa retos digitales y recibe retroalimentación y ayudas; cierra con una evidencia y una devolución docente posible.

Nunca se debe presentar solamente «haz ejercicios en tu cuaderno», «realiza la actividad» o «pregunta al profesor». Debe aparecer cada enunciado, el número, el espacio, el ejemplo y la acción concreta. La plataforma no debe exigir que el maestro vaya puesto por puesto indicando los pasos rutinarios.

## 2. Usuarios y roles

**Estudiante:** elige perfil local (alias, avatar y grado), entra a la ruta, avanza a su ritmo y retoma desde el último paso. Pantallas sencillas, instrucciones narradas, botones grandes y accesibles.

**Docente:** selecciona grado/asignatura/período, asigna misiones a uno o varios grupos, consulta la versión docente de cada tema, configura apoyos y registra resultados. Puede proyectar una unidad grupal y exportar evidencia en CSV/JSON. No se requiere nube.

**Transición:** experiencia **principalmente oral, visual y manipulativa**, estructurada por propósitos/dimensiones y las actividades rectoras (juego, arte, literatura y exploración del medio). Sin exigir copia extensa ni lectura independiente, con indicaciones para acompañamiento cuando proceda.

## 3. Arquitectura curricular

### Fuentes verificadas
- Mallas institucionales: https://drive.google.com/drive/folders/154X2-Tp_VLv_TCWeI1-K6qFYXwGcTOcL
- Planeaciones de aula: https://drive.google.com/drive/folders/1bw9ek6akYda8_TdUIJBxIz7r_DeI_mpy
- Malla de Matemáticas 1.º–5.º, de Lengua Castellana 1.º–5.º, Naturales 1.º–5.º, Sociales 1.º–5.º.
- Malla de **transición** para los cuatro períodos.
- Proyectos institucionales **PIE–CapER** (Cátedra de la Paz, Ética y Religión) y **PIE–EATI** (Emprendimiento, Artística, Tecnología e Informática).

### Estado de cobertura
- La revisión anterior consolidó **315 registros curriculares temáticos de primaria** y **47 entradas de transición**. Se trata de registros, no de 315 OVA completos ni necesariamente 315 temas únicos.
- La carpeta de planeaciones disponible se concentra en **cuarto período, especialmente grados 3.º a 5.º**. La malla será fuente primaria cuando no exista planeación.
- No se encontró una malla general de **Inglés** ni de **Educación Física** en la carpeta de mallas; sus contenidos específicos deben marcarse `PENDIENTE_FUENTE`, sin inventarse como aprobados.
- Matemáticas quinto, tercer período: una copia del archivo de malla contiene múltiplos, divisores, MCM/MCD y fracciones completos, mientras una versión de nombre principal presenta una sección incompleta. Guardar la discrepancia, con trazabilidad, hasta que el docente confirme la versión.
- Algunas mallas comparten contenidos para 1.º/2.º o 4.º/5.º; **no copiar el mismo OVA para ambos grados**. Diferenciar lenguaje, complejidad, cantidad, evidencias y autonomía.

### Identificación de cada unidad

`transicion|g1|g2|g3|g4|g5 / asignatura_o_proyecto / periodo_1-4 / unidad / tema`

Cada tema debe referenciar: `fuente_doc`, `grado`, `periodo`, `area`, `eje_tematico`, `aprendizaje`, `competencias`, `evidencias`, `dba_si_aplica`, `nivel_confianza`, `estado_curricular`.

## 4. Flujo OBLIGATORIO de cada lección de primaria

| Paso | Nombre visible | Lo que realmente debe hacer la aplicación |
|---|---|---|
| 1 | Hoy aprenderé | Decir/mostrar meta e instrucciones para el niño, cantidad aproximada de pasos, materiales concretos y botones «Escuchar», «Repetir», «Empezar». |
| 2 | Descubro | Problema situacional de la vereda, imagen/objeto manipulable y pregunta de saberes previos, con respuesta guiada. |
| 3 | Aprendo paso a paso | Explicación pequeña por escenas, con ejemplo completamente resuelto, ilustración y audio local. Repetición disponible. |
| 4 | Mi cuaderno | **Texto literal para transcribir**, dividido en tarjetas: fecha, título, definición, ejemplo, solución, y **cada ejercicio completo**; el sistema anuncia «abre el cuaderno», «escribe el título», «copia lo siguiente», «ahora resuelve...». No presupone que la copia fue verificada: el botón «Ya terminé de copiar» registra solo una declaración del niño. |
| 5 | Practico acompañado | Ejercicios interactivos con retroalimentación explicativa, pistas visuales, alternativas de material concreto y reintentos no punitivos. |
| 6 | Mi misión en La Manta | Desafío realista y contextualizado (finca, tienda, frutas, agua, huerta, familia, reciclaje). Con solución explicada o evidencia de producto. |
| 7 | Demuestro lo aprendido | Comprobación individual de la competencia con ítems variados: respuesta numérica, emparejar, ordenar, arrastrar, señalar, voz u otra interacción según pertinencia. Distinguir primer intento, ayudas usadas y logro demostrado. |
| 8 | Cierro y comparto | Síntesis amigable, autoevaluación, «¿Qué fue difícil?», indicación exacta de qué mostrar al profesor, opción imprimir o exportar un reporte. |

**Instrucciones obligatorias en cada pantalla:** una sola tarea principal por pantalla; botones «Escuchar instrucciones», «Repetir», «Pista», «Atrás», «Ya terminé / Continuar»; un lector no autónomo no debe depender de poder leer para saber qué hacer. Si aún no hay audio local, marcar el contenido pendiente y proporcionar una modalidad visual eficaz; TTS del dispositivo solo como refuerzo no garantizado.

### Ejemplo mínimo — 2.º, Matemáticas, período IV, «La multiplicación»

**Pantalla CUADERNO 1.** «Busca tu cuaderno de Matemáticas, escribe la fecha de hoy y copia: **Tema: La multiplicación.**» Botón «Escuchar otra vez». Botón «Ya escribí el título».

**Pantalla CUADERNO 2.** «Copia en tu cuaderno: **La multiplicación sirve para contar grupos que tienen la misma cantidad de elementos. Es una suma repetida.**» Botón «Ya lo copié».

**Pantalla CUADERNO 3.** «Copia: **3 canastas con 4 mangos cada una. 4 + 4 + 4 = 12. Entonces, 3 × 4 = 12 mangos.** Dibuja las tres canastas y cuatro mangos en cada una.» Botón «Terminé el dibujo».

**Pantalla CUADERNO 4.** «Copia y resuelve: **1. En 5 canastas hay 2 naranjas en cada una. Dibuja los grupos, escribe la suma y la multiplicación. 2. Hay 4 corrales con 3 gallinas en cada corral. ¿Cuántas gallinas hay? Escribe una suma repetida y una multiplicación. 3. Dibuja 2 filas de 5 plantas y escribe el total.**» Botón «Terminé en mi cuaderno».

**Pantalla COMPROBACIÓN.** «¡Vamos a revisar! En el problema 1 había 5 grupos de 2, por eso 2+2+2+2+2=10 y 5×2=10. Compara con lo que escribiste y corrige, si lo necesitas». Nunca afirmar que se ha verificado la escritura del cuaderno sin evidencia.

## 5. Inclusión y DUA

- Navegación no lectora mediante audio e iconografía reconocible, alto contraste, tamaño adaptable, teclado, diseño sin movimiento obligatorio.
- Tres niveles de apoyo **en la misma competencia**: manipulativo/visual, guiado con pistas y autónomo. El docente puede personalizar el objetivo evaluativo cuando el caso lo requiera, documentándolo sin confundir ajustes de acceso con cambios de objetivo.
- No inferir que un estudiante carece de competencia únicamente por escribir despacio. Separar comprensión, lectura del enunciado, manejo de dispositivos y resolución.
- Inclusión no consiste en reducir todas las actividades a selección múltiple. Contemplar material concreto, respuesta oral o pictográfica donde el objetivo lo permita.
- En primero y segundo hay lectores emergentes; en tercero algunos estudiantes requieren instrucciones narradas y manejo simplificado de cantidades.

## 6. Tecnología y funcionamiento sin conexión

Recomendación: **React + TypeScript + Vite** en proyecto modular, con CSS accesible, almacenamiento **IndexedDB**, modo **PWA instalable** con recursos locales y service worker; datos curriculares JSON versionados por grado, área, período y unidad. Para equipos Windows que no puedan instalar PWA, prever una distribución autónoma de escritorio en fase posterior (Tauri/Electron o lanzador local), y documentar que un paquete Vite con `fetch()` y service worker **no funciona simplemente abriendo `index.html` por `file://`**. No depender de CDN, YouTube ni solicitudes remotas durante el uso de aula.

Privacidad: sin cuentas de menores en la nube; alias o códigos locales; reportes exportables solo por el docente; explicar límites de almacenamientos locales y borrado. No hacer grabaciones/fotos de menores por defecto.

## 7. Estructura sugerida del repositorio

```text
la-manta-aprende/
  README.md
  docs/
    VISION_PEDAGOGICA.md
    MAPA_CURRICULAR.md
    ESTANDARES_DE_CONTENIDO.md
    MANUAL_DOCENTE.md
    MATRIZ_TRAZABILIDAD.md
    fuentes/                     # mallas y planeaciones descargadas, si se dispone de permiso
  apps/
    web/
      src/
        app/                     # rutas, roles, navegación
        components/              # botones, lectura, audio, pasos, progreso
        features/
          student/
          teacher/
          lessons/
          preschool/
          accessibility/
          analytics/
        content/                 # JSON por grado-asignatura-periodo
        data/                    # schemas, validadores, importación
        offline/                 # SW y almacenamiento
        assets/                   # gráficos/audio local
      public/
      tests/                      # unitarias, integración, e2e
  packages/
    content-schema/
  scripts/
    validate-content.ts
    audit-curriculum.ts
  .github/workflows/
  package.json
```

## 8. Modelo mínimo de unidad (JSON/TS)

```text
id, titulo, grado, asignatura, periodo, fuente:
  archivo, localizador (página, tabla o encabezado), estadoValidacion
curriculo: competencia, aprendizaje, evidencia, dbaSiCorresponde
metadatos: materiales, duracionAprox, autonomia, perfilAccesibilidad
pasos[]:
  id, tipo, orden, instruccionVisible, narracion, ayudas[], condicionAvance
  para tipo='cuaderno': bloquesLiteralmenteCopiables[], ejerciciosEscritos[], revisionAutodeclarada
  para tipo='actividad': mecanica, enunciado, respuestaEsperada, evaluacion, retroalimentacion
  para tipo='evaluacion': objetivosMedidos, items[], politicaReintentos
resultado: competenciasObservadas[], apoyosUsados[], intentos[], estadoLeccion
```

Se deben validar fuentes y campos con esquema; no permitir lecciones publicadas sin texto exacto de cuaderno (excepto transición o actividades donde la copia no aplica), ni permitir botones inertes.

## 9. Ruta de implementación

**Fase 0: auditoría del currículo.** Importar fuentes locales y matrices, resolver duplicados, catalogar temas con estado verificado/pendiente y diferencias de versiones. No inventar contenidos que falten.

**Fase 1: MVP completo y testeado.** Autenticación local por alias; panel alumno; una unidad **completa** de Matemáticas 2.º período IV «La multiplicación»; guion de las ocho etapas; audio o narración funcional offline; registro de pasos; retos interactivos; evaluación; exportación docente.

**Fase 2: motor editorial.** Crear plantillas de varios tipos de actividad, editor docente local de textos, validador curricular, importación/exportación de contenidos.

**Fase 3: expansión:** completar asignaturas y períodos por lotes, revisando exactitud. Priorizar 2.º–3.º (necesidad inicial), luego 1.º, 4.º, 5.º. Desarrollar transición por actividades rectoras.

**Fase 4: evaluación en contexto.** Validación con usuarios, ajustes DUA, pruebas de instalación y funcionamiento offline en equipos reales; documentación para la sede y escalamiento a otras sedes.

## 10. Criterios de aceptación (no negociables)

1. Un niño ve y escucha la próxima acción sin preguntar al docente; la secuencia tiene instrucciones concretas hasta terminar.
2. Cada lección publicable contiene lo que se copia y **todos** los ejercicios del cuaderno con enunciado; no simples títulos o referencias genéricas.
3. Comprobación de respuestas digital, retroalimentación significativa y ayudas en lugar de solo correcto/incorrecto.
4. Funciona sin internet después de instalación/carga inicial, sin URLs de recursos críticos externos.
5. No confunde clic «copié» con evidencia de calidad de la escritura ni con logro de competencia.
6. En el modo docente se pueden exportar resultados separados por estudiantes/grupo y aprendizajes, sin subir datos a la nube.
7. Preescolar usa actividades rectoras y puede requerir acompañamiento, sin falsificar autonomía.
8. Toda unidad es trazable a una malla/planeación institucional identificada; ausencia o ambigüedad se señala.
9. Hay pruebas unitarias y de navegación, control de errores y botón para reanudar la lección.
10. No expandir a cientos de lecciones incompletas antes de aprobar el piloto pedagógico y técnico.
