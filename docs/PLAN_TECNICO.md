# Etapa 1: piloto ejecutable

- [x] React/TypeScript/Vite con módulos de estudiante, lecciones, actividades, accesibilidad, progreso y docente.
- [x] JSON validado: ocho momentos desglosados en tareas pequeñas; tablas 2–5; cuaderno literal y revisión posterior.
- [x] Perfiles por alias, ruta grado/área/período, reanudación e IndexedDB con errores visibles.
- [x] Audio español empaquetado para consignas, contenido, ayuda y devolución; teclado, contraste, texto grande y movimiento reducido.
- [x] Práctica numérica, elección de expresiones y representación manipulable; evaluación de cuatro objetivos con primer intento e historial de ayudas.
- [x] PWA con precarga íntegra, preparación offline explícita y comprobación sin red.
- [x] Reportes docentes JSON/CSV, filtrado, grupos y asignación local del piloto; revisión de cuaderno separada del resultado digital.
- [x] Pruebas unitarias/e2e y documentación Windows, privacidad y revisión pedagógica.

## Límite curricular
El kit aporta un ejemplo, no los documentos institucionales. La afirmación del kit «identificado en malla» no constituye verificación directa. El piloto es una propuesta didáctica PENDIENTE_FUENTE y PENDIENTE_APROBACION_PEDAGOGICA. No se publican otros OVA ni se inventa el catálogo. Transición, CapER y EATI conservan su identidad y quedan pendientes de fuentes y de otra etapa.

## Arquitectura
Contenido JSON → esquema Zod → motor de tarjetas → actividades reutilizables. IndexedDB guarda perfiles y recorrido versionado; el docente descarga reportes localmente. Workbox precarga código, contenido y audio local, sin peticiones externas de sesión. El equipo funciona en un origen fijo localhost/HTTPS; el almacenamiento pertenece a ese origen.

Resultado: arquitectura y piloto técnico entregados. La verificación de mallas originales y la aceptación pedagógica permanecen pendientes; ver ENTREGA_1.md.

## Ampliación de cuarto período

Se consultaron los originales y se desarrollaron 19 rutas / 509 pantallas para transición a quinto en Matemáticas, Lengua Castellana y Ciencias Sociales. La trazabilidad pasa a FUENTE_CONSULTADA, la aprobación pedagógica sigue pendiente. Ver ENTREGA_2.md para el estado vigente y ALCANCE_CUARTO_PERIODO.md para límites.
