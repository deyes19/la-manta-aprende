# APK escolar sin conexión

Contenedor Android nativo sin dependencias externas de ejecución. Usa WebView con un origen HTTPS virtual estable (`appassets.androidplatform.net`) servido exclusivamente desde los recursos del APK. No solicita permiso INTERNET ni permisos de almacenamiento amplios. IndexedDB guarda los avances en el espacio privado de la aplicación. El selector de documentos del sistema permite exportar informes.

El modo Android evita registrar el service worker y duplicar los recursos en caché; el paquete ya contiene todos los archivos. Empieza con MP3 locales. Las versiones web y Android conservan el mismo código educativo, pero sus datos se guardan en orígenes separados.

## Construcción

Se necesitan Node.js 24, Python 3, un JDK con el módulo `jdk.compiler` y el SDK oficial de Android (plataforma 35 y build-tools 35.0.0). No se necesita Gradle ni descargar dependencias durante el uso familiar.

```sh
npm ci
VITE_MANTA_DISTRIBUTION=android npm run build -w apps/web -- --outDir dist-android
MANTA_ANDROID_SDK=/ruta/al/sdk python scripts/package-android.py
```

El script usa la plataforma y build-tools disponibles en el SDK indicado. Produce el APK y su huella SHA-256 en `../entregas/`. Firma con v2/v3 y comprueba la alineación y el ZIP. Android mínimo: API 26; objetivo: API 34; compilado con API 35. La compatibilidad JavaScript requiere WebView actualizado.

La firma se guarda fuera del repositorio, en `../.manta-android-signing/` o en `MANTA_ANDROID_SIGNING_DIR`. Conservar esa carpeta privada para firmar futuras actualizaciones que mantengan los datos instalados. No incluir claves en Git, en el APK ni en el paquete para las familias. Si falta una parte de la identidad existente, la compilación se detiene.

`node scripts/smoke-android.mjs` prueba los archivos extraídos del APK en `build/verified-assets/`, en un perfil limpio sin conexión: apertura inicial, MP3, actividad, cierre/reapertura, guardado y puente de exportación. La prueba simula el contenedor web; no sustituye una instalación real ni prueba el selector nativo de documentos. No hubo dispositivo Android ni emulador disponible durante esta entrega.

Ver [guía para familias](../../docs/ANDROID_FAMILIAS.md).
