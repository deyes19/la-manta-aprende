# Ampliación solicitada: cuarto período

El usuario confirmó **transición a quinto, cuarto período**, para Matemáticas, Lenguaje (Lengua Castellana) y Ciencias Sociales. Es el alcance de desarrollo, no una declaración de cobertura terminada.

| Grado | Matemáticas | Lengua Castellana | Ciencias Sociales |
|---|---|---|---|
| Transición | Pendiente de malla; integrar propósitos y actividades rectoras | Pendiente de malla; sin copias extensas | Pendiente de malla; juego y exploración |
| Primero | Pendiente de lectura de original | Pendiente de lectura de original | Pendiente de lectura de original |
| Segundo | Multiplicación/tablas 2–5: piloto ejecutable; validar original | Pendiente de lectura de original | Pendiente de lectura de original |
| Tercero | Pendiente de lectura de original | Pendiente de lectura de original | Pendiente de lectura de original |
| Cuarto | Pendiente de lectura de original | Pendiente de lectura de original | Pendiente de lectura de original |
| Quinto | Pendiente de lectura de original | Pendiente de lectura de original | Pendiente de lectura de original |

No crear 18 unidades vacías para llenar la tabla. Una selección pendiente no abre una lección supuesta. Para transición las tres áreas orientan experiencias integradas y no sustituyen propósitos/actividades rectoras institucionales. La organización concreta requiere consultar la malla de transición.

## Evidencia de acceso y bloqueo actual

Las carpetas de Drive devolvieron HTTP 200 y permitieron identificar los archivos originales. El listado de identificadores y nombres está en `docs/fuentes/listado-drive.json`. El visor del documento muestra una página de carga, sin entregar el contenido en su HTML inicial.

La descarga oficial `drive.google.com/uc?export=download&id=...` redirige a `drive.usercontent.google.com/download`. Ese destino devolvió CONNECT 403 en el proxy. Se guardó su incorporación junto a `drive.google.com` en el borrador de red; los presets existentes se conservaron. La configuración guardada no prueba su aplicación al entorno activo. No se ha descargado ni leído el currículo completo de esos archivos.

Para continuar con las unidades reales: guardar el cambio de red en configuración del entorno y volver a comprobar la descarga; o aportar los DOCX originales para importarlos en `docs/fuentes/`. Después leer por grado/período, registrar competencia/evidencia/tema/localizador y construir unidades completas por lotes. No asumir que un tema es de cuarto período por su nombre.

## Trabajo técnico preparado

- Registro de unidades ejecutables con selección por grado, área y período.
- Motor recibe la unidad seleccionada; reanudación y avances se aíslan por perfil/unidad.
- Respuestas numéricas, elección, reparto, escritura y orden de secuencias; objetivos de evaluación propios de cada área.
- Esquema separado de transición, que exige juego/arte/literatura/exploración y rechaza cuaderno de primaria.
- Asignación docente por unidad y grado; reportes con área, período, unidad y competencia observada.
- Preparación sin internet recorre todos los audios del registro; generador incremental de narraciones.

Esto prepara la expansión; no significa que Lenguaje, Sociales o los demás grados estén desarrollados.

## Validación de esta adaptación

Compilación TypeScript/Vite/PWA aprobada; 11 pruebas unitarias aprobadas (objetivos propios de área, escritura con tildes, secuencias, aislamiento de avances/reportes y rechazo de primaria en transición), y 4 pruebas de navegador aprobadas (recorrido original, reanudación/audio/guardado/exportación sin red, accesibilidad, fallo de almacenamiento y pantalla estrecha). Las nuevas mecánicas tienen pruebas de lógica; todavía no se ha comprobado una unidad curricular real de Lenguaje o Sociales porque faltan sus originales. No se declaran áreas o grados terminados.
