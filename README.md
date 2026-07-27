# 🔊 Speaker Remote Pro

**Controlador y Gestor de Parlantes Bluetooth** — Interrupción de señal audio focus, control remoto de volumen, mute y ecualizador.

[![Versión](https://img.shields.io/badge/versión-v1.5.0-blue)](https://github.com/mauriciano47-pixel/Speaker_remote)
[![GitHub Pages](https://img.shields.io/badge/demo-live-brightgreen)](https://mauriciano47-pixel.github.io/Speaker_remote/)
[![PWA](https://img.shields.io/badge/PWA-instalable-purple)](https://mauriciano47-pixel.github.io/Speaker_remote/)

## 🌐 Demo en Vivo

👉 **[https://mauriciano47-pixel.github.io/Speaker_remote/](https://mauriciano47-pixel.github.io/Speaker_remote/)**

## ⚡ Funciones

| Función | Descripción |
|---------|-------------|
| 🔊 Volumen Master | Control de 0-100% con slider en tiempo real |
| 🔊 Salida Hardware Directa | Conexión física Web Audio API + MediaSession para Screamer 3 |
| 🔇 Mute Ultra-Rápido | Silencia sin desconectar Bluetooth |
| ⚡ Audio Focus Interrupter | Fuerza foco exclusivo anulando otras fuentes |
| 🎛️ Ecualizador DSP | Bass Boost + Treble (0 a +12 dB) |
| 📋 Historial de Versiones | Registro de versiones interactivo en pantalla |
| 🔍 Scanner Asertivo | Web Audio System API (enumerateDevices) + Web Bluetooth |
| 🎮 Modo Demo Instantáneo | Prueba todos los controles simulando dispositivos |
| 📲 PWA Network-First | Supresión de banners tras instalar y cache de rápida actualización |

## 📲 Instalación Ultra-Sencilla

### Opción A (Automática):
1. Abre **Chrome** o **Edge** en tu celular y visita la app.
2. Toca **"Instalar"** en el **banner flotante** que aparece abajo en tu pantalla.

### Opción B (Manual de 3 pasos):
1. Abre esta página en **Google Chrome** o **Edge**.
2. Toca el menú **⋮** (tres puntos) en la esquina superior derecha (o botón ⬆️ Compartir en iPhone).
3. Selecciona **"Instalar aplicación"** (o *"Agregar a pantalla de inicio"*).

## 🛠️ Tecnologías

- HTML5 + CSS3 (Glassmorphism, Gradientes, Banner Flotante, Animaciones)
- JavaScript Vanilla (ES6+)
- Web Audio API + MediaSession API
- Web Bluetooth API + System Audio Device Enumeration
- Service Worker Network-First + Cache API
- PWA Manifest (standalone, maskable icons)
- GitHub Pages

## 📁 Estructura

```
Speaker_remote/
├── index.html          → Página principal y componentes UI
├── index.css           → Estilos premium y responsive
├── app.js              → Lógica de control, Web Audio Gain, Bluetooth y PWA
├── sw.js               → Service Worker v1.5.0 (Network-First)
├── manifest.json       → Manifest PWA (Android / iOS)
├── icon-192.png        → Ícono 192x192
├── icon-512.png        → Ícono 512x512
├── VERSION.txt         → Versión actual (v1.5.0)
└── README.md           → Documentación del proyecto
```

## 👤 Créditos

Desarrollado por **Mauricio (mauriciano47-pixel)** & **Antigravity AI**.

© 2026 Speaker Remote Pro
