# Fuentes institucionales

No hay mallas ni planeaciones originales en esta entrega. El ZIP recibido solo aporta visión, prompt y ejemplo didáctico. No confundir afirmaciones del kit con revisión directa.

Mallas: https://drive.google.com/drive/folders/154X2-Tp_VLv_TCWeI1-K6qFYXwGcTOcL

Planeaciones: https://drive.google.com/drive/folders/1bw9ek6akYda8_TdUIJBxIz7r_DeI_mpy

El intento de lectura de Drive durante esta etapa obtuvo bloqueo del proxy (CONNECT 403). No demuestra si las carpetas son públicas ni autoriza inventar su contenido.

Descarga los archivos con acceso autorizado y consérvalos aquí. Desde la raíz del proyecto:

```bash
node scripts/import-source.mjs "C:/documentos/matematicas.docx" malla "Segundo, período IV, tabla de aprendizajes"
```

El importador conserva el original, calcula SHA-256 y registra tipo, localizador y estado PENDIENTE_VALIDACION en manifest.json. No sobrescribe versiones diferentes del mismo nombre y no convierte documentos automáticamente en currículo aprobado. También acepta PDF, JSON, CSV y Markdown.

Después: leer la fuente, registrar páginas/tabla/encabezado precisos, confirmar grado/área/período/tema, aprendizaje/competencias/evidencias/DBA si aparecen, comparar versiones y obtener revisión docente. Solo entonces actualizar el JSON y su trazabilidad. No renombrar afirmaciones del kit como evidencia institucional. Conservar discrepancias de Matemáticas quinto, período III si efectivamente se encuentran, sin resolverlas por suposición.

## Actualización del acceso

Las carpetas ahora se pueden listar (HTTP 200); se identificaron las cuatro mallas necesarias, conservadas como metadatos en listado-drive.json. Los archivos originales todavía no están descargados: el destino oficial drive.usercontent.google.com sigue bloqueado. Se guardó su adición en el borrador. Ver ../ALCANCE_CUARTO_PERIODO.md.
