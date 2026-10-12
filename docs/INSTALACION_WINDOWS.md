# Preparación en Windows

1. En un equipo con internet, instala Node.js 24 LTS de su distribución oficial. Comprueba `node --version` y `npm --version` en PowerShell. Usa Edge o Chrome actualizado, sin navegación privada.
2. Copia el proyecto a una carpeta propia. Abre una terminal en ella. Ejecuta `npm ci`, `npm run validate:content` y `npm run build`. La instalación descarga de registry.npmjs.org; no se utilizan CDN en clase.
3. Ejecuta `npm start` o abre `scripts/iniciar-windows.cmd`. Si el navegador abre antes del servidor, recarga la página. Mantén la ventana del servidor abierta.
4. Abre http://localhost:4173. Espera el mensaje de preparación de unidad y audios; pulsa Verificar si es necesario. Instala la PWA desde el menú del navegador. El primer acceso necesita el servidor local, que funciona sin internet.
5. Crea un alias de segundo, selecciona Matemáticas, período 4, y abre el piloto. Reproduce una consigna y prueba los altavoces. Desconecta internet, recarga, comprueba el audio y reanuda. La aplicación instalada queda en caché, pero conserva el lanzador como respaldo.
6. Antes de borrar datos o actualizar el equipo, exporta CSV y JSON desde el panel docente. Mantén el mismo perfil de navegador, `localhost` y puerto 4173. Otro puerto, otro navegador o `127.0.0.1` son almacenamientos distintos.

## Paquete piloto preparado

El ZIP de demostración contiene la compilación, los audios y un servidor local que requiere Node.js. Descomprime todo; abre `scripts/iniciar-windows.cmd`. No requiere `npm ci` ni internet de aula porque la compilación está incluida. No es un ejecutable independiente de Node ni un instalador firmado.

## Solución de problemas

- «Todavía no está preparada»: utiliza la compilación, no el servidor de desarrollo; espera la descarga local, permite almacenamiento y revisa espacio libre. No borres la caché durante las clases.
- Sin sonido: comprueba volumen y salida de audio, pulsa Escuchar (el navegador puede bloquear reproducción automática), usa Repetir o la velocidad lenta. Las instrucciones visibles permanecen disponibles.
- Puerto ocupado: cierra solo otro servidor de La Manta que tú hayas abierto. Mantén el origen 4173 para no perder acceso a perfiles locales.
- No se guardan avances: no uses modo privado; revisa cuotas y permisos. El programa informa del fallo y no avanza silenciosamente.
- Actualización: exporta primero, prepara la nueva compilación y recarga fuera de la sesión. Las versiones de contenido incompatibles requieren migración; el piloto no sobrescribe esos avances.

## Próxima distribución

Evaluar Tauri/Electron o un paquete que incluya runtime y lanzador firmado, con política de actualizaciones, copia/restauración de datos y pruebas en equipos reales de la sede. Esta fase no incluye instalador autónomo ni validación física en Windows. Las pruebas actuales son en Linux/Chromium.
