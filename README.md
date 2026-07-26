# 🔊 Speaker Remote Pro

**Controlador y Gestor de Parlantes Bluetooth** — Interrupción de señal audio focus, control remoto de volumen, mute y ecualizador.

[![Versión](https://img.shields.io/badge/versión-v1.2.0-blue)](https://github.com/mauriciano47-pixel/Speaker_remote)
[![GitHub Pages](https://img.shields.io/badge/demo-live-brightgreen)](https://mauriciano47-pixel.github.io/Speaker_remote/)
[![PWA](https://img.shields.io/badge/PWA-instalable-purple)](https://mauriciano47-pixel.github.io/Speaker_remote/)

## 🌐 Demo en Vivo

👉 **[https://mauriciano47-pixel.github.io/Speaker_remote/](https://mauriciano47-pixel.github.io/Speaker_remote/)**

## ⚡ Funciones

| Función | Descripción |
|---------|-------------|
| 🔊 Volumen Master | Control de 0-100% con slider en tiempo real |
| 🔇 Mute Ultra-Rápido | Silencia sin desconectar Bluetooth |
| ⚡ Audio Focus Interrupter | Fuerza foco exclusivo anulando otras fuentes |
| 🎛️ Ecualizador DSP | Bass Boost + Treble (0 a +12 dB) |
| 📡 Monitor RSSI | Señal en dBm en tiempo real |
| 🎵 Controles Playback | Play/Pausa, Anterior/Siguiente |
| 📊 Visualizador Audio | Canvas animado de frecuencias |
| 🔍 Búsqueda Bluetooth Clara | Conexión directa mediante Web Bluetooth API con diagnósticos de ayuda |
| 🎮 Modo Demo Instantáneo | Prueba todos los controles simulando dispositivos |
| 📲 PWA Instalable Simplificada | Banner flotante automático + Guía gráfica de 3 pasos |

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
- Web Bluetooth API + Fallbacks
- Service Worker + Cache API (soporte offline)
- PWA Manifest (standalone, maskable icons)
- GitHub Pages

## 📁 Estructura

```
Speaker_remote/
├── index.html          → Página principal y componentes UI
├── index.css           → Estilos premium y responsive
├── app.js              → Lógica de control, Bluetooth y PWA
├── sw.js               → Service Worker v2 (cache offline)
├── manifest.json       → Manifest PWA (Android / iOS)
├── icon-192.png        → Ícono 192x192
├── icon-512.png        → Ícono 512x512
├── VERSION.txt         → Versión actual (v1.2.0)
└── README.md           → Documentación del proyecto
```

## 👤 Créditos

Desarrollado por **Mauricio (mauriciano47-pixel)** & **Antigravity AI**.

© 2026 Speaker Remote Pro
