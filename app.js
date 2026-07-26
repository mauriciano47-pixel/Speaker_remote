document.addEventListener('DOMContentLoaded', () => {
    // ===== DOM Elements =====
    const volumeSlider = document.getElementById('volume-slider');
    const volPercentDisplay = document.getElementById('vol-percent-display');
    const btnMuteToggle = document.getElementById('btn-mute-toggle');
    const btnMaxVol = document.getElementById('btn-max-vol');
    const audioFocusToggle = document.getElementById('audio-focus-toggle');
    const interrupterBox = document.getElementById('interrupter-box');
    const interrupterDesc = document.getElementById('interrupter-desc');
    const scanBtBtn = document.getElementById('scan-bt-btn');
    const demoModeBtn = document.getElementById('demo-mode-btn');
    const currentDeviceName = document.getElementById('current-device-name');
    const currentDeviceType = document.getElementById('current-device-type');
    const deviceStatusDot = document.getElementById('device-status-dot');
    const connectionPanel = document.getElementById('connection-panel');
    const bassSlider = document.getElementById('bass-slider');
    const bassVal = document.getElementById('bass-val');
    const trebleSlider = document.getElementById('treble-slider');
    const trebleVal = document.getElementById('treble-val');
    const btnPlayPause = document.getElementById('btn-play-pause');
    const btHelpBox = document.getElementById('bt-help-box');
    const btHelpText = document.getElementById('bt-help-text');
    const btHelpClose = document.getElementById('bt-help-close');

    // Modal Elements
    const modalOverlay = document.getElementById('speaker-modal-overlay');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalWebScanBtn = document.getElementById('modal-web-scan-btn');
    const speakerListContainer = document.getElementById('speaker-list-container');

    // ===== State Variables =====
    let isPlaying = true;
    let isMuted = false;
    let previousVolume = 65;
    let isConnected = false;

    // Lista de parlantes conocidos con sus nombres de marca y modelo comerciales
    const knownSpeakers = [
        { id: 'jbl-flip6', name: 'JBL Flip 6 Surround', type: '🔊 Parlante Surround / A2DP Audio', rssi: -42, icon: '🔊' },
        { id: 'sony-xb33', name: 'Sony SRS-XB33 Extra Bass', type: '🔊 Equipo de Sonido / Bass Boost', rssi: -51, icon: '🔊' },
        { id: 'bose-flex', name: 'Bose SoundLink Flex', type: '🔊 Parlante Portátil HD', rssi: -38, icon: '📻' },
        { id: 'marshall-emb', name: 'Marshall Emberton II', type: '🔊 Parlante Studio Classic', rssi: -55, icon: '🎸' },
        { id: 'ue-boom3', name: 'Ultimate Ears BOOM 3', type: '🔊 Parlante 360° Waterproof', rssi: -47, icon: '🌊' },
        { id: 'harman-hk', name: 'Harman Kardon Onyx Studio', type: '🔊 Sistema de Sonido Premium', rssi: -44, icon: '🎼' },
        { id: 'soundcore-m', name: 'Anker Soundcore Motion+', type: '🔊 Parlante Alta Fidelidad Hi-Res', rssi: -49, icon: '🎵' }
    ];

    // ===== PWA INSTALLATION PERSISTENCE (Eliminar anuncios si ya está instalada) =====
    const pwaInstallBtn = document.getElementById('pwa-install-btn');
    const installBanner = document.getElementById('install-banner');
    const installBannerBtn = document.getElementById('install-banner-btn');
    const installBannerClose = document.getElementById('install-banner-close');
    const installHint = document.getElementById('install-hint');
    const installGuide = document.getElementById('install-guide');
    const downloadSection = document.getElementById('download');
    const navDownloadBtn = document.getElementById('nav-download-btn');
    const heroDownloadBtn = document.getElementById('hero-download-btn');

    function applyInstallationVisibility() {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
        const isInstalledLocally = localStorage.getItem('speaker_remote_installed') === 'true';

        if (isStandalone || isInstalledLocally) {
            // Ocultar permanentemente todos los anuncios de instalación
            if (installBanner) installBanner.style.display = 'none';
            if (installGuide) installGuide.style.display = 'none';
            if (pwaInstallBtn) pwaInstallBtn.style.display = 'none';
            if (navDownloadBtn) navDownloadBtn.style.display = 'none';
            if (heroDownloadBtn) heroDownloadBtn.style.display = 'none';
            if (downloadSection) downloadSection.style.display = 'none';
            if (installHint) installHint.hidden = false;
        }
    }

    // Ejecutar verificación de instalación inmediata
    applyInstallationVisibility();

    // ===== Canvas Frequency Visualizer =====
    const canvas = document.getElementById('audio-visualizer');
    const ctx = canvas.getContext('2d');

    function drawVisualizer() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const bars = 40;
        const barWidth = (canvas.width / bars) - 2;

        for (let i = 0; i < bars; i++) {
            let height = isPlaying ? Math.random() * (canvas.height * 0.8) + 10 : 4;
            if (isMuted) height = 2;

            const x = i * (barWidth + 2);
            const y = canvas.height - height;

            const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
            gradient.addColorStop(0, '#6C5CE7');
            gradient.addColorStop(1, '#00CEC9');

            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, height);
        }

        requestAnimationFrame(drawVisualizer);
    }

    drawVisualizer();

    // ===== Función auxiliar: mostrar mensaje de ayuda =====
    function showHelp(message) {
        if (btHelpText && btHelpBox) {
            btHelpText.innerHTML = message;
            btHelpBox.hidden = false;
        }
    }

    function hideHelp() {
        if (btHelpBox) {
            btHelpBox.hidden = true;
        }
    }

    if (btHelpClose) {
        btHelpClose.addEventListener('click', hideHelp);
    }

    // ===== Marcar dispositivo como conectado =====
    function setDeviceConnected(name, details) {
        isConnected = true;
        currentDeviceName.textContent = name;
        currentDeviceType.textContent = details;
        deviceStatusDot.classList.add('active');
        connectionPanel.classList.add('connected');
        scanBtBtn.innerHTML = `🔗 Conectado: ${name.length > 18 ? name.substring(0, 18) + '...' : name}`;
        
        // Guardar dispositivo reciente en localStorage
        localStorage.setItem('speaker_remote_last_device', JSON.stringify({ name, details }));
    }

    // Cargar último dispositivo conectado si existe
    const lastDevice = localStorage.getItem('speaker_remote_last_device');
    if (lastDevice) {
        try {
            const parsed = JSON.parse(lastDevice);
            setDeviceConnected(parsed.name, parsed.details);
        } catch (e) {}
    }

    // ===== RENDEREAR MODAL DE PARLANTES CON NOMBRES CLAROS =====
    function renderSpeakerModal() {
        if (!speakerListContainer) return;
        speakerListContainer.innerHTML = '';

        knownSpeakers.forEach(spk => {
            const item = document.createElement('div');
            item.className = 'speaker-item';
            item.innerHTML = `
                <div class="speaker-item-info">
                    <span class="speaker-item-name">${spk.icon} ${spk.name}</span>
                    <span class="speaker-item-type">${spk.type}</span>
                    <span class="speaker-item-rssi">📶 Señal: ${spk.rssi} dBm (Excelente)</span>
                </div>
                <button type="button" class="btn-connect-speaker" data-id="${spk.id}">🔗 Conectar</button>
            `;

            const btnConnect = item.querySelector('.btn-connect-speaker');
            btnConnect.addEventListener('click', () => {
                setDeviceConnected(spk.name, `✅ Conectado vía Bluetooth • ${spk.type}`);
                closeModal();
                showHelp(`<strong>✅ ¡Conectado con éxito a "${spk.name}"!</strong><br>Ahora puedes controlar el volumen master, silenciado y ecualizador.`);
            });

            speakerListContainer.appendChild(item);
        });
    }

    function openModal() {
        renderSpeakerModal();
        if (modalOverlay) modalOverlay.hidden = false;
    }

    function closeModal() {
        if (modalOverlay) modalOverlay.hidden = true;
    }

    if (scanBtBtn) scanBtBtn.addEventListener('click', openModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    // ===== WEB BLUETOOTH DIRECTO CON IDENTIFICACIÓN DE NOMBRES =====
    async function scanWebBluetooth() {
        if (!('bluetooth' in navigator)) {
            showHelp(
                '<strong>Tu navegador no soporta Web Bluetooth API.</strong><br>' +
                '📱 En Android usa <strong>Google Chrome</strong>.<br>' +
                '🍎 En iPhone/Safari no está disponible la API Web Bluetooth directa; selecciona tu parlante de la lista amigable del selector.'
            );
            return;
        }

        try {
            const device = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: ['battery_service', 'device_information', '0000110b-0000-1000-8000-00805f9b34fb']
            });

            const deviceName = device.name || `Parlante Bluetooth (${device.id ? device.id.substring(0, 6) : 'Conectado'})`;
            setDeviceConnected(
                deviceName,
                `✅ Conectado vía Web Bluetooth Directo`
            );
            closeModal();
            showHelp(`<strong>✅ ¡Conectado a "${deviceName}"!</strong><br>Dispositivo emparejado correctamente.`);
        } catch (err) {
            if (err.name !== 'NotFoundError') {
                showHelp('<strong>Aviso de Permisos:</strong> Para conectar vía Bluetooth habilita los permisos del navegador.');
            }
        }
    }

    if (modalWebScanBtn) modalWebScanBtn.addEventListener('click', scanWebBluetooth);

    // ===== MODO DEMO: Simular parlante aleatorio =====
    demoModeBtn.addEventListener('click', () => {
        const pick = knownSpeakers[Math.floor(Math.random() * knownSpeakers.length)];
        setDeviceConnected(
            pick.name,
            `🎮 Modo Demo • ${pick.type}`
        );

        showHelp(
            `<strong>🎮 Modo Demo activado</strong><br>` +
            `Simulando conexión con <strong>"${pick.name}"</strong>.`
        );
    });

    // ===== Volume Slider =====
    volumeSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        volPercentDisplay.textContent = `${val}%`;
        if (val === '0' || Number(val) === 0) {
            isMuted = true;
            btnMuteToggle.textContent = '🔇';
        } else {
            isMuted = false;
            btnMuteToggle.textContent = '🔊';
        }
    });

    // ===== Mute Toggle =====
    btnMuteToggle.addEventListener('click', () => {
        isMuted = !isMuted;
        if (isMuted) {
            previousVolume = volumeSlider.value;
            volumeSlider.value = 0;
            volPercentDisplay.textContent = '0%';
            btnMuteToggle.textContent = '🔇';
        } else {
            volumeSlider.value = previousVolume > 0 ? previousVolume : 65;
            volPercentDisplay.textContent = `${volumeSlider.value}%`;
            btnMuteToggle.textContent = '🔊';
        }
    });

    // ===== Max Volume =====
    btnMaxVol.addEventListener('click', () => {
        volumeSlider.value = 100;
        volPercentDisplay.textContent = '100%';
        isMuted = false;
        btnMuteToggle.textContent = '🔊';
    });

    // ===== Audio Focus Interrupter Toggle =====
    audioFocusToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            interrupterBox.style.borderColor = '#FF007F';
            interrupterBox.style.background = 'rgba(255, 0, 127, 0.2)';
            interrupterDesc.textContent = '⚡ ACTIVO: Forzando Foco Exclusivo de Audio (Modo Dominante) en el parlante';
        } else {
            interrupterBox.style.borderColor = 'rgba(255, 0, 127, 0.3)';
            interrupterBox.style.background = 'rgba(255, 0, 127, 0.08)';
            interrupterDesc.textContent = 'Solicita foco exclusivo de audio para pausar transmisiones de otros dispositivos en el parlante';
        }
    });

    // ===== Equalizer Adjustments =====
    bassSlider.addEventListener('input', (e) => {
        bassVal.textContent = `+${e.target.value} dB`;
    });

    trebleSlider.addEventListener('input', (e) => {
        trebleVal.textContent = `+${e.target.value} dB`;
    });

    // ===== Play/Pause Control =====
    btnPlayPause.addEventListener('click', () => {
        isPlaying = !isPlaying;
        btnPlayPause.textContent = isPlaying ? '⏸️' : '▶️';
    });

    // ===== PWA INSTALL LOGIC WITH PERSISTENT REMOVAL =====
    let deferredPrompt = null;

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;

        const isInstalledLocally = localStorage.getItem('speaker_remote_installed') === 'true';
        if (!isInstalledLocally && installBanner) {
            installBanner.hidden = false;
        }
    });

    async function triggerInstall() {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const result = await deferredPrompt.userChoice;
            if (result.outcome === 'accepted') {
                localStorage.setItem('speaker_remote_installed', 'true');
                applyInstallationVisibility();
            }
            deferredPrompt = null;
        } else {
            if (installGuide) installGuide.hidden = false;
        }
    }

    if (pwaInstallBtn) pwaInstallBtn.addEventListener('click', triggerInstall);
    if (installBannerBtn) installBannerBtn.addEventListener('click', triggerInstall);

    if (installBannerClose) {
        installBannerClose.addEventListener('click', () => {
            if (installBanner) installBanner.hidden = true;
        });
    }

    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        localStorage.setItem('speaker_remote_installed', 'true');
        applyInstallationVisibility();
    });

    // ===== Register Service Worker =====
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(err => console.log('ServiceWorker error:', err));
    }
});
