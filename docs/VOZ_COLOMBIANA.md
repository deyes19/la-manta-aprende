# Narración femenina colombiana

La plataforma permite usar la voz del navegador, sin una cuenta de Azure. Los MP3 de respaldo siguen siendo eSpeak; todavía no se ha generado ni aprobado una muestra neural de Salomé.

## Voz del navegador (opción inicial)

En la plataforma, abrir **Elegir voz**, seleccionar **Voz del navegador**, elegir una **Voz en español** y pulsar **Probar voz**. La elección se conserva en ese navegador y equipo. Las instrucciones, pistas y retroalimentación usan el mismo sistema. Escuchar y Repetir empiezan desde el principio; Detener corta la locución; Velocidad permite escuchar más despacio. Solo suena una narración a la vez.

El modo automático prefiere voces instaladas, y da prioridad al español colombiano y a nombres de voces femeninas conocidos dentro de las voces disponibles. La API no informa el género de manera universal: el docente debe escuchar y elegir. Las voces y su calidad cambian entre Windows, Android, macOS y navegadores. **No se garantiza que exista una voz colombiana ni que aparezca la voz del lector de Edge**; su lector y la API de voz web pueden ofrecer listas distintas.

Las opciones marcan **instalada** o **necesita internet**, según la información del navegador. Para el aula sin conexión, probar la voz instalada desconectando Internet en el equipo real. Si falta la voz seleccionada o falla al iniciar, la plataforma usa otra voz española disponible o los MP3 locales. También se pueden elegir directamente **Audios guardados**. Las voces que necesitan Internet pueden enviar el guion al proveedor del navegador; no se narra información de estudiantes con este sistema.

En Windows, se pueden instalar voces en español desde Configuración → Hora e idioma → Voz (la ubicación puede variar según la versión). Reiniciar el navegador y revisar la lista. Algunas voces naturales de Windows no están disponibles para páginas web. La prueba en los equipos escolares es necesaria.

Se comprobó selección, repetición, detención, persistencia, recuperación de fallos y operación offline con voces simuladas en Chromium. Las pruebas no certifican la calidad audible ni la disponibilidad de voces en Windows.

## MP3 neural colombiano opcional

Preferencia para generación futura: Salomé, `es-CO-SalomeNeural`, velocidad -8%. Esta preparación no es necesaria para usar la voz del navegador.

## Ruta sin cuenta de Azure

Se usa `edge-tts`, cliente no oficial del lector de Microsoft Edge. Su disponibilidad no está garantizada. Necesita Internet durante la preparación, nunca durante la clase. Solo envía guiones didácticos; no envía registros estudiantiles.

Desde la raíz, con Python 3 y Node:

```sh
python -m venv .venv-voice
.venv-voice/bin/pip install -r scripts/audio/requirements.txt
.venv-voice/bin/python scripts/audio/edge.py --plan
.venv-voice/bin/python scripts/audio/edge.py
```

En Windows, reemplazar `.venv-voice/bin/python` por `.venv-voice\Scripts\python.exe` y usar `python -m pip` para instalar. La muestra se guarda en `../entregas/voz-muestras/`. Escuchar y revisar pronunciación, números, claridad y ritmo antes del lote:

```sh
.venv-voice/bin/python scripts/audio/edge.py --all
npm run audio:apply:neural
npm run validate:content
npm run build
npm run test:e2e
```

El lote se prepara fuera del repositorio. El aplicador verifica los 826 guiones y archivos antes de sustituirlos y conserva un respaldo fuera del repositorio. El aula conserva recursos locales y la misma navegación. Tras publicar, esperar que la PWA actualice y prepare todos sus recursos antes de desconectar Internet.

## Bloqueo del entorno en la nube

La prueba devolvió `ClientHttpProxyError 403`: la política restringida no permitía `speech.platform.bing.com`. Se guardó ese dominio en el borrador de configuración, conservando los dominios de Drive. Guardar el borrador no cambia el entorno activo: revisar, guardar y publicar la configuración del entorno antes de reintentar. Esto no garantiza que el servicio acepte la generación.

## Ruta opcional con Azure

Los comandos `audio:sample` y `audio:generate:neural` utilizan Azure y requieren `MANTA_SPEECH_REGION` y `MANTA_SPEECH_KEY`. No compartir claves en chat ni guardarlas en Git. Esta ruta es opcional y no está configurada. `audio:plan` y `test:audio` no necesitan credenciales ni conexiones.
