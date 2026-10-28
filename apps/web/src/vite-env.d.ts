/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface Window {
  MantaAndroid?: { saveReport(name: string, body: string, mime: string): void };
}
