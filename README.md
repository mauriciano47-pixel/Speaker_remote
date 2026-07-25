# Speaker Remote Pro 🔊⚡

**Speaker Remote Pro** es una aplicación nativa Android (desarrollada en Kotlin con Jetpack Compose) y aplicación web PWA diseñada para el control remoto maestro, interrupción de foco de señal (Audio Focus takeover), control de volumen master, silenciado instantáneo (Mute) y ecualización de parlantes Bluetooth.

## 🚀 Características Principales

1. **⚡ Interrupción de Señal Audio Focus**: Fusta el foco exclusivo de audio (`AUDIOFOCUS_GAIN_TRANSIENT_EXCLUSIVE`) anulando transmisiones secundarias en el parlante.
2. **🔊 Control Master de Volumen & Mute**: Ajuste preciso de decibelios y nivel de volumen con botón de corte instantáneo de audio.
3. **🎛️ Ecualizador DSP & Bass Boost**: Aumento dinámico de graves y frecuencias agudas.
4. **📡 Monitor de Señal Bluetooth RSSI**: Inspección en tiempo real del nivel de señal en dBm de los parlantes vinculados.
5. **🌐 Aplicación Web PWA / Landing Page**: Interfaz responsive accesible desde el navegador con soporte de Web Bluetooth API.

## 📁 Estructura del Proyecto

* `app/src/main/java/com/example/speakerremote/` — Código fuente nativo en Kotlin (`MainActivity.kt`, `audio/AudioFocusController.kt`, `bluetooth/BluetoothSpeakerManager.kt`).
* `index.html`, `index.css`, `app.js` — Frontend Web PWA y landing page interactiva.
* `manifest.json`, `sw.js` — Configuración de Service Worker y manifiesto PWA.
* `build.gradle.kts`, `settings.gradle.kts` — Archivos de construcción Gradle.

## 🌐 Producción & GitHub
* Repositorio: [github.com/maurociano47-pixel/Speaker_remote](https://github.com/maurociano47-pixel/Speaker_remote)
