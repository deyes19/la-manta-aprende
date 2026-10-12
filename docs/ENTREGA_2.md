# Entrega 2: cuarto período de transición a quinto

## Implementación

Se descargaron y consultaron cuatro mallas institucionales de 2026 (Matemáticas, Lengua Castellana, Ciencias Sociales y Transición) y siete planeaciones complementarias de tercero a quinto. Se conservaron sus originales, identificadores públicos de Drive y SHA-256; las unidades tienen localizador de tabla/fila. El acceso HTTPS oficial funciona ahora. La afirmación previa de falta de fuentes quedó superada.

Hay 19 rutas completas y 509 pantallas: 16 unidades de primaria y tres experiencias integradas de transición. La cobertura por grado/área está en ALCANCE_CUARTO_PERIODO.md. Incluye el piloto original de multiplicación, con IDs/versión preservados, y área/datos para segundo. Lenguaje de segundo usa los inversos y oración que aparecen en su malla IV; no se sustituye por combinaciones de otro período.

Primaria: ocho momentos, instrucciones/ejemplos narrados, título/fecha/definiciones, todos los enunciados escritos, revisión, práctica, misión, evaluación y cierre. Mecánicas de número, decimal localizado, texto, opción, secuencia, reparto y fracción. Diagramas de barras, sólidos y superficie con cuadrados locales. Transición: cuatro actividades rectoras, gestos/voz, dibujos, figuras que se pueden mover en una cuadrícula y acompañamiento; no copia/examen de primaria.

1.338 locuciones en español reutilizan 721 archivos distintos mediante un índice local; se conservan recursos históricos del piloto. El paquete PWA precarga alrededor de 69 MiB, sin recursos remotos de sesión. Node/FFmpeg/eSpeak se necesitan solo para desarrollo/regeneración; el aula usa archivos MP3.

Panel docente: asignación por unidad/grado, filtros, apoyos, reporte separado por objetivo y área, CSV/JSON, observación docente manual y composiciones de transición. El guardado de observaciones bloquea exportación hasta concluir. Ningún clic del niño verifica calidad del cuaderno, gestos, dibujos o actuación; no hay notas oficiales automáticas.

## Validación

- Esquemas, IDs, archivos/transcripciones de audio y SHA-256 de las 11 fuentes: aprobados.
- TypeScript y compilación Vite/PWA: aprobados.
- 18 pruebas unitarias: aprobadas; sin omitidas.
- 25 pruebas de navegador: aprobadas, sin omitidas. La suite comprueba los 19 recorridos completos, productos/observación docente/exportación, persistencia de figuras y posiciones, ausencia de copias en transición, dictado con respuesta oculta, accesibilidad, error de almacenamiento, pantalla estrecha y operación sin red. Resultado final: 25/25 aprobadas.

La prueba offline corta la red después de preparar el contenido; recarga la aplicación, reproduce audio local, guarda una nueva respuesta y exporta. No equivale a prueba física en Windows ni a evaluación de autonomía con niños. Axe se aplica a pantallas representativas; no garantiza toda la accesibilidad por sí solo. La revisión humana de todos los audios sigue pendiente.

## Decisiones pendientes

Revisión/aprobación pedagógica de los guiones, ejemplos, carga de copia, duración, audios y productos. Las fuentes están consultadas, no se simula aprobación institucional. Confirmar localmente el alcalde vigente y observar reconocimiento del escudo con imagen oficial/cartel; no se inventa el dato ni se empaqueta escudo genérico/himno grabado.

Discrepancias: fragmento «Lo» de Matemáticas 4, encabezado «APRENDIZAJES SEGUNDO PERIODO» dentro de transición IV y organización compartida de algunos grados. Se conserva la fuente y se diferencian los retos. La enseñanza del cielo aclara que la Luna puede verse también de día y refleja luz solar.

Pendiente: evaluación en aula y Windows real; instalador autónomo firmado; restauración/importación de reportes; editor docente; otros períodos/áreas; reconciliación de copias alternativas fuera del período solicitado. El modo docente no es autenticación segura: requiere supervisión de equipos compartidos.

## Entrega y entorno

El código, fuentes y audios se entregan en main del repositorio autorizado. Los paquetes de aula y código se actualizan tras pruebas. El paquete de aula incluye compilación y servidor local sin dependencias, requiere Node 24 instalado y no ejecuta npm en clase. La configuración de inicio en nube se guarda como borrador; guardarlo no publica el entorno ni prueba restauración en una tarea nueva.
