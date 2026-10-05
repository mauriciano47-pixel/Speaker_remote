# 🔊 Speaker Remote Pro

**Controlador y Gestor de Parlantes Bluetooth** — Interrupción de señal audio focus, control remoto de volumen master, ecualizador DSP físico, mute instantáneo y enrutamiento de hardware.

[![Versión](https://img.shields.io/badge/versión-v1.6.0-blue)](https://github.com/mauriciano47-pixel/Speaker_remote)
[![GitHub Pages](https://img.shields.io/badge/demo-live-brightgreen)](https://mauriciano47-pixel.github.io/Speaker_remote/)
[![PWA](https://img.shields.io/badge/PWA-instalable-purple)](https://mauriciano47-pixel.github.io/Speaker_remote/)

## 🌐 Demo en Vivo

👉 **[https://mauriciano47-pixel.github.io/Speaker_remote/](https://mauriciano47-pixel.github.io/Speaker_remote/)**

## ⚡ Funciones Destacadas

| Función | Descripción |
|---|---|
| 🔊 **Volumen Master** | Control de 0-100% con slider en tiempo real y ganancia física Web Audio API |
| 🎛️ **Ecualizador DSP Real** | Filtros activos `BiquadFilterNode` (Graves lowshelf 200 Hz y Agudos highshelf 3 kHz) |
| 🎚️ **Presets de 1 Clic** | Perfiles acústicos instantáneos: Flat, Bass Boost, Voces y Club Máximo |
| 🎵 **Test Armónico de Sonido** | Acorde polifónico cálido para verificación acústica inmediata del enlace |
| 📊 **Espectro Reactivo FFT** | Visualizador Canvas impulsado en tiempo real por `AnalyserNode` |
| ⚡ **Audio Focus Takeover** | Sostén de sesión de medios con portadora limpia (sin zumbidos continuos) |
| 🔇 **Mute Ultra-Rápido** | Silenciado físico con un toque preservando el emparejamiento Bluetooth |
| 🎯 **Enrutamiento por Hardware** | Asignación directa de salida de audio mediante `setSinkId()` |
| 🔍 **Scanner Asertivo** | Audio System API (`enumerateDevices`) + Web Bluetooth directo |
| ⚖️ **Marco Legal & Regulatorio** | Documentación y blindaje conforme a SUBTEL, ENACOM, SETELECO y FCC |
| 📲 **PWA Network-First** | Cache de alta velocidad, soporte offline y supresión automática de banners |

## 📲 Instalación Rápida

### Opción A (Automática):
1. Abre **Chrome** o **Edge** en tu teléfono o PC y visita la aplicación.
2. Toca **"Instalar"** en el banner flotante inferior.

### Opción B (Manual):
1. Abre la página en **Google Chrome** o **Edge**.
2. Toca el menú **⋮** (tres puntos) en la esquina superior derecha (o botón ⬆️ Compartir en Safari/iOS).
3. Selecciona **"Instalar aplicación"** o **"Agregar a pantalla de inicio"**.

## 🛠️ Stack Tecnológico

- **Frontend Web / PWA:** HTML5, CSS3 Glassmorphism, JavaScript Moderno (ES6+).
- **Procesamiento de Audio:** Web Audio API (`AudioContext`, `GainNode`, `BiquadFilterNode`, `AnalyserNode`).
- **Control de Sistema:** MediaSession API, MediaDevices API (`enumerateDevices`, `setSinkId`).
- **Nativo Android:** Kotlin, Jetpack Compose, `AudioManager`, `AudioFocusRequest` (`AUDIOFOCUS_GAIN_TRANSIENT_EXCLUSIVE`).
- **PWA:** Service Worker Network-First v1.6.0, Web App Manifest.

## 📁 Estructura del Proyecto

```
Speaker_remote/
├── index.html          → Interfaz principal, modales y componentes UI
├── index.css           → Diseño glassmorphism, responsive y dark OLED
├── app.js              → Motor de audio DSP, Web Audio Gain, Bluetooth y PWA
├── sw.js               → Service Worker v1.6.0 (Network-First)
├── manifest.json       → Manifest PWA (Android / iOS / Desktop)
├── icon-192.png        → Ícono PWA 192x192
├── icon-512.png        → Ícono PWA 512x512
├── VERSION.txt         → Versión actual (v1.6.0)
├── ADVERTENCIA_LEGAL_Y_REGULATORIA.md → Marco legal y regulatorio
├── app/                → Módulo nativo Android (Jetpack Compose / Kotlin)
└── README.md           → Documentación técnica del proyecto
```

## 👤 Créditos

Desarrollado por **Mauricio (mauriciano47-pixel)** & **Antigravity AI**.

© 2026 Speaker Remote Pro — Todos los derechos reservados.
