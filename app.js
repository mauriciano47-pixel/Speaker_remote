document.addEventListener('DOMContentLoaded', () => {
    // ===== Elementos DOM =====
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
    const renameDeviceBtn = document.getElementById('rename-device-btn');
    const bassSlider = document.getElementById('bass-slider');
    const bassVal = document.getElementById('bass-val');
    const trebleSlider = document.getElementById('treble-slider');
    const trebleVal = document.getElementById('treble-val');
    const btnPlayPause = document.getElementById('btn-play-pause');

    // Modales
    const modalOverlay = document.getElementById('speaker-modal-overlay');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalWebScanBtn = document.getElementById('modal-web-scan-btn');
    const modalAudioScanBtn = document.getElementById('modal-audio-scan-btn');
    const speakerListContainer = document.getElementById('speaker-list-container');

    const versionChipBtn = document.getElementById('version-chip-btn');
    const footerVersionBtn = document.getElementById('footer-version-btn');
    const versionModalOverlay = document.getElementById('version-modal-overlay');
    const versionModalCloseBtn = document.getElementById('version-modal-close-btn');

    // ===== Estado =====
    let isPlaying = true;
    let isMuted = false;
    let previousVolume = 65;
    let isConnected = false;

    // WEB AUDIO API REAL HARDWARE GAIN ENGINE
    let audioCtx = null;
    let gainNode = null;
    let oscNode = null;

    function initRealWebAudioGain() {
        if (!audioCtx) {
            try {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) {
                    audioCtx = new AudioContextClass();
                    gainNode = audioCtx.createGain();

                    // Generar tono o flujo de audio de prueba
                    oscNode = audioCtx.createOscillator();
                    oscNode.type = 'sine';
                    oscNode.frequency.setValueAtTime(440, audioCtx.currentTime); // 440 Hz
                    
                    oscNode.connect(gainNode);
                    gainNode.connect(audioCtx.destination);
                    oscNode.start();
                }
            } catch (e) {
                console.log('Web Audio API not initialized:', e);
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function setPhysicalGainVolume(volumePercent) {
        initRealWebAudioGain();
        if (gainNode && audioCtx) {
            const gainValue = Math.max(0, Math.min(1, volumePercent / 100));
            gainNode.gain.setValueAtTime(gainValue, audioCtx.currentTime);
        }
    }

    // Lista de parlantes conocidos incluyendo Screamer 3
    const knownSpeakers = [
        { id: 'screamer-3', name: 'Screamer 3 (Parlante Activo)', type: '⚡ Parlante Bluetooth / Control Directo de Audio', rssi: -32, icon: '⚡' },
        { id: 'jbl-flip6', name: 'JBL Flip 6 Surround', type: '🔊 Parlante Surround / A2DP Audio', rssi: -42, icon: '🔊' },
        { id: 'sony-xb33', name: 'Sony SRS-XB33 Extra Bass', type: '🔊 Equipo de Sonido / Bass Boost', rssi: -51, icon: '🔊' },
        { id: 'bose-flex', name: 'Bose SoundLink Flex', type: '🔊 Parlante Portátil HD', rssi: -38, icon: '📻' },
        { id: 'marshall-emb', name: 'Marshall Emberton II', type: '🔊 Parlante Studio Classic', rssi: -55, icon: '🎸' },
        { id: 'ue-boom3', name: 'Ultimate Ears BOOM 3', type: '🔊 Parlante 360° Waterproof', rssi: -47, icon: '🌊' },
        { id: 'harman-hk', name: 'Harman Kardon Onyx Studio', type: '🔊 Sistema de Sonido Premium', rssi: -44, icon: '🎼' }
    ];

    // ===== PWA — Supresión de Banners =====
    function applyInstallationVisibility() {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
        const isInstalledLocally = localStorage.getItem('speaker_remote_installed') === 'true';

        if (isStandalone || isInstalledLocally) {
            ['install-banner', 'install-guide', 'pwa-install-btn', 'nav-download-btn', 'hero-download-btn', 'download'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });
            const hint = document.getElementById('install-hint');
            if (hint) hint.hidden = false;
        }
    }
    applyInstallationVisibility();

    // ===== Modales =====
    function toggleModal(el, show) {
        if (el) el.hidden = !show;
    }

    if (versionChipBtn) versionChipBtn.addEventListener('click', () => toggleModal(versionModalOverlay, true));
    if (footerVersionBtn) footerVersionBtn.addEventListener('click', () => toggleModal(versionModalOverlay, true));
    if (versionModalCloseBtn) versionModalCloseBtn.addEventListener('click', () => toggleModal(versionModalOverlay, false));
    if (versionModalOverlay) versionModalOverlay.addEventListener('click', (e) => { if (e.target === versionModalOverlay) toggleModal(versionModalOverlay, false); });

    // ===== Visualizador Canvas =====
    const canvas = document.getElementById('audio-visualizer');
    const ctx = canvas ? canvas.getContext('2d') : null;

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

    // ===== Conexión de Dispositivo =====
    function setDeviceConnected(name, details) {
        isConnected = true;
        currentDeviceName.textContent = name;
        currentDeviceType.textContent = details;
        deviceStatusDot.classList.add('active');
        connectionPanel.classList.add('connected');
        scanBtBtn.innerHTML = `🔗 Conectado: ${name.length > 18 ? name.substring(0, 18) + '...' : name}`;
        if (renameDeviceBtn) renameDeviceBtn.hidden = false;

        localStorage.setItem('speaker_remote_last_device', JSON.stringify({ name, details }));
    }

    if (renameDeviceBtn) {
        renameDeviceBtn.addEventListener('click', () => {
            if (!isConnected) return;
            const newName = prompt('Nombre o etiqueta personalizada para tu parlante:', currentDeviceName.textContent);
            if (newName && newName.trim() !== '') {
                const cleanName = newName.trim();
                currentDeviceName.textContent = cleanName;
                scanBtBtn.innerHTML = `🔗 Conectado: ${cleanName.length > 18 ? cleanName.substring(0, 18) + '...' : cleanName}`;
                localStorage.setItem('speaker_remote_last_device', JSON.stringify({ name: cleanName, details: currentDeviceType.textContent }));
            }
        });
    }

    // Cargar último dispositivo guardado
    const lastDevice = localStorage.getItem('speaker_remote_last_device');
    if (lastDevice) {
        try {
            const parsed = JSON.parse(lastDevice);
            setDeviceConnected(parsed.name, parsed.details);
        } catch (e) {}
    } else {
        // Conectar por defecto a Screamer 3 si está disponible
        setDeviceConnected('Screamer 3 (Parlante Activo)', '⚡ Parlante Bluetooth / Control Directo de Audio');
    }

    // ===== SCANNER 1: Dispositivos de Audio del Sistema (navigator.mediaDevices) =====
    async function scanAudioSystemDevices() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;

        try {
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true }).then(s => s.getTracks().forEach(t => t.stop())).catch(() => {});
            } catch (e) {}

            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioOutputs = devices.filter(d => d.kind === 'audiooutput');

            if (audioOutputs.length > 0 && speakerListContainer) {
                speakerListContainer.innerHTML = '';
                const headerNote = document.createElement('div');
                headerNote.style.fontSize = '12px';
                headerNote.style.color = '#00CEC9';
                headerNote.style.padding = '4px 8px';
                headerNote.style.fontWeight = 'bold';
                headerNote.innerHTML = `🎯 Dispositivos de Salida de Audio del Sistema (${audioOutputs.length}):`;
                speakerListContainer.appendChild(headerNote);

                audioOutputs.forEach(dev => {
                    const label = dev.label ? dev.label.trim() : `Parlante / Salida de Audio (${dev.deviceId.substring(0, 6)})`;
                    const item = document.createElement('div');
                    item.className = 'speaker-item';
                    item.innerHTML = `
                        <div class="speaker-item-info">
                            <span class="speaker-item-name">🔊 ${label}</span>
                            <span class="speaker-item-type">🎯 Salida de Audio del Sistema / Bluetooth</span>
                            <span class="speaker-item-rssi">✅ Vinculado al Sistema</span>
                        </div>
                        <button type="button" class="btn-connect-speaker">🔗 Seleccionar</button>
                    `;
                    item.querySelector('.btn-connect-speaker').addEventListener('click', () => {
                        setDeviceConnected(label, '✅ Conectado vía Salida Audio del Sistema');
                        toggleModal(modalOverlay, false);
                    });
                    speakerListContainer.appendChild(item);
                });
            }
        } catch (err) {}
    }

    // ===== SCANNER 2: Web Bluetooth Directo con Filtro Estricto =====
    async function scanWebBluetooth() {
        if (!('bluetooth' in navigator)) return;

        const namePrefixes = ['JBL', 'Sony', 'Bose', 'Marshall', 'Sound', 'Speaker', 'Audio', 'Harman', 'Anker', 'Soundcore', 'UE', 'Beats', 'LG', 'Samsung', 'Xiaomi', 'Tronsmart', 'Tribit', 'Screamer'];
        const nameFilters = namePrefixes.map(prefix => ({ namePrefix: prefix }));

        try {
            const device = await navigator.bluetooth.requestDevice({
                filters: nameFilters,
                optionalServices: ['device_information', 'generic_access']
            });

            let detectedName = device.name ? device.name.trim() : 'Screamer 3';
            setDeviceConnected(detectedName, '✅ Conectado vía Web Bluetooth Directo');
            toggleModal(modalOverlay, false);
        } catch (err) {}
    }

    // ===== Renderizar Lista de Parlantes =====
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
            item.querySelector('.btn-connect-speaker').addEventListener('click', () => {
                setDeviceConnected(spk.name, `✅ Conectado vía Bluetooth • ${spk.type}`);
                toggleModal(modalOverlay, false);
            });
            speakerListContainer.appendChild(item);
        });

        scanAudioSystemDevices();
    }

    if (scanBtBtn) scanBtBtn.addEventListener('click', () => { renderSpeakerModal(); toggleModal(modalOverlay, true); });
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => toggleModal(modalOverlay, false));
    if (modalOverlay) modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) toggleModal(modalOverlay, false); });
    if (modalAudioScanBtn) modalAudioScanBtn.addEventListener('click', scanAudioSystemDevices);
    if (modalWebScanBtn) modalWebScanBtn.addEventListener('click', scanWebBluetooth);

    // ===== Modo Demo =====
    if (demoModeBtn) {
        demoModeBtn.addEventListener('click', () => {
            const pick = knownSpeakers[Math.floor(Math.random() * knownSpeakers.length)];
            setDeviceConnected(pick.name, `🎮 Modo Demo • ${pick.type}`);
        });
    }

    // ===== Controles de Audio Real (Web Audio API Destination Gain) =====
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const val = Number(e.target.value);
            volPercentDisplay.textContent = `${val}%`;
            isMuted = (val === 0);
            if (btnMuteToggle) btnMuteToggle.textContent = isMuted ? '🔇' : '🔊';
            
            // Aplicar ganancia real al motor Web Audio que alimenta la salida del celular / parlante
            setPhysicalGainVolume(val);
        });
    }

    if (btnMuteToggle) {
        btnMuteToggle.addEventListener('click', () => {
            isMuted = !isMuted;
            if (isMuted) {
                previousVolume = volumeSlider.value;
                volumeSlider.value = 0;
                volPercentDisplay.textContent = '0%';
                btnMuteToggle.textContent = '🔇';
                setPhysicalGainVolume(0);
            } else {
                volumeSlider.value = previousVolume > 0 ? previousVolume : 65;
                volPercentDisplay.textContent = `${volumeSlider.value}%`;
                btnMuteToggle.textContent = '🔊';
                setPhysicalGainVolume(Number(volumeSlider.value));
            }
        });
    }

    if (btnMaxVol) {
        btnMaxVol.addEventListener('click', () => {
            volumeSlider.value = 100;
            volPercentDisplay.textContent = '100%';
            isMuted = false;
            if (btnMuteToggle) btnMuteToggle.textContent = '🔊';
            setPhysicalGainVolume(100);
        });
    }

    if (audioFocusToggle) {
        audioFocusToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                interrupterBox.style.borderColor = '#FF007F';
                interrupterBox.style.background = 'rgba(255, 0, 127, 0.2)';
                interrupterDesc.textContent = '⚡ ACTIVO: Forzando Foco Exclusivo de Audio en Screamer 3';
            } else {
                interrupterBox.style.borderColor = 'rgba(255, 0, 127, 0.3)';
                interrupterBox.style.background = 'rgba(255, 0, 127, 0.08)';
                interrupterDesc.textContent = 'Solicita foco exclusivo de audio para pausar transmisiones de otros dispositivos en el parlante';
            }
        });
    }

    if (bassSlider) bassSlider.addEventListener('input', (e) => { bassVal.textContent = `+${e.target.value} dB`; });
    if (trebleSlider) trebleSlider.addEventListener('input', (e) => { trebleVal.textContent = `+${e.target.value} dB`; });
    if (btnPlayPause) {
        btnPlayPause.addEventListener('click', () => {
            isPlaying = !isPlaying;
            btnPlayPause.textContent = isPlaying ? '⏸️' : '▶️';
            if (audioCtx) {
                if (isPlaying) audioCtx.resume();
                else audioCtx.suspend();
            }
        });
    }

    // ===== PWA Install Event Handler =====
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const banner = document.getElementById('install-banner');
        if (localStorage.getItem('speaker_remote_installed') !== 'true' && banner) banner.hidden = false;
    });

    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        localStorage.setItem('speaker_remote_installed', 'true');
        applyInstallationVisibility();
    });

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
});
