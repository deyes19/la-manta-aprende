# Fuentes originales consultadas

Se descargaron por HTTPS cuatro mallas y siete planeaciones de las carpetas proporcionadas por el usuario. Las descargas funcionan ahora; el bloqueo inicial quedó superado. El plugin de Google Drive no expuso herramientas en esta sesión: se utilizó la descarga HTTPS oficial.

Mallas: https://drive.google.com/drive/folders/154X2-Tp_VLv_TCWeI1-K6qFYXwGcTOcL

Planeaciones: https://drive.google.com/drive/folders/1bw9ek6akYda8_TdUIJBxIz7r_DeI_mpy

`manifest.json` registra origen, ID público de Drive, tipo, tamaño, fecha de consulta y SHA-256. Los DOCX permanecen íntegros. `extractos/` conserva texto estructurado de tablas/párrafos de las cuatro mallas; los localizadores se refieren a números de tabla/fila del XML del DOCX, no a páginas que pueden variar por impresora. La validación comprueba las huellas de los originales.

En primaria el cuarto período aparece en la fila 7 de las tablas de cada grado o grupo de grados. Lengua tiene tablas 1/2/3/4 para primero/segundo/tercero/cuarto-quinto. Sociales tiene tablas 1/2/3 para primero-segundo/tercero/cuarto-quinto. Matemáticas tiene cinco tablas, una por grado. Transición usa tabla 4, fila 3, propósito #4.

**Atención:** Matemáticas etiqueta columna 6 como EVIDENCIA y columna 7 como APRENDIZAJE. Lengua y Sociales usan el orden inverso. La generación respeta esos encabezados. DBA se conserva como aparece; no se crean números de DBA donde no existen.

Las actividades y ejemplos son autoría didáctica del proyecto, no citas literales de la institución. FUENTE_CONSULTADA demuestra trazabilidad de temas, no aprobación pedagógica. Revisar discrepancias y límites en ../ALCANCE_CUARTO_PERIODO.md.

Para importar una versión adicional:

```bash
node scripts/import-source.mjs "C:/documentos/malla.docx" malla "grado, período, tabla o encabezado"
```

No sobrescribe versiones diferentes del mismo nombre. Leer, comparar y registrar antes de cambiar el currículo. No aplicar el generador sobre cambios manuales sin revisar sus guiones. Las copias alternativas de Matemáticas de la carpeta no se usaron para sustituir automáticamente esta versión principal.
