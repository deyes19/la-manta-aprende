# Narración femenina colombiana

Preferencia: Salomé, `es-CO-SalomeNeural`, velocidad -8%. Los MP3 actuales siguen siendo eSpeak; todavía no se ha generado ni aprobado una muestra neural. No se necesita Azure para probar la ruta de Edge.

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

El lote se prepara fuera del repositorio. El aplicador verifica los 721 guiones y archivos antes de sustituirlos y conserva un respaldo fuera del repositorio. El aula conserva recursos locales y la misma navegación. Tras publicar, esperar que la PWA actualice y prepare todos sus recursos antes de desconectar Internet.

## Bloqueo del entorno en la nube

La prueba devolvió `ClientHttpProxyError 403`: la política restringida no permitía `speech.platform.bing.com`. Se guardó ese dominio en el borrador de configuración, conservando los dominios de Drive. Guardar el borrador no cambia el entorno activo: revisar, guardar y publicar la configuración del entorno antes de reintentar. Esto no garantiza que el servicio acepte la generación.

## Ruta opcional con Azure

Los comandos `audio:sample` y `audio:generate:neural` utilizan Azure y requieren `MANTA_SPEECH_REGION` y `MANTA_SPEECH_KEY`. No compartir claves en chat ni guardarlas en Git. Esta ruta es opcional y no está configurada. `audio:plan` y `test:audio` no necesitan credenciales ni conexiones.
