// SPEAKER REMOTE - Suite de Pruebas Unitarias: Normalización y Control de Volumen
const test = require('node:test');
const assert = require('node:assert/strict');

function volumeToLinearGain(percent) {
  const clamped = Math.max(0, Math.min(100, Number(percent) || 0));
  return clamped / 100;
}

function gainToDecibels(gain) {
  if (gain <= 0) return -Infinity;
  return 20 * Math.log10(gain);
}

function toggleMute(currentVol, isMuted, lastVol) {
  if (isMuted) {
    const restored = lastVol > 0 ? lastVol : 50;
    return { volume: restored, isMuted: false, lastVolume: restored };
  } else {
    return { volume: 0, isMuted: true, lastVolume: currentVol > 0 ? currentVol : 65 };
  }
}

test('Volume Controller - Convierte porcentaje 0-100 en ganancia lineal 0.0-1.0', () => {
  assert.strictEqual(volumeToLinearGain(0), 0.0);
  assert.strictEqual(volumeToLinearGain(50), 0.5);
  assert.strictEqual(volumeToLinearGain(100), 1.0);
  assert.strictEqual(volumeToLinearGain(-10), 0.0);
  assert.strictEqual(volumeToLinearGain(150), 1.0);
});

test('Volume Controller - Calcula conversión correcta a decibelios', () => {
  assert.strictEqual(gainToDecibels(1.0), 0);
  assert.strictEqual(Math.round(gainToDecibels(0.5)), -6);
  assert.strictEqual(gainToDecibels(0), -Infinity);
});

test('Volume Controller - Mute toggle preserva volumen anterior y restaura correctamente', () => {
  const muted = toggleMute(75, false, 75);
  assert.strictEqual(muted.volume, 0);
  assert.strictEqual(muted.isMuted, true);
  assert.strictEqual(muted.lastVolume, 75);

  const unmuted = toggleMute(0, true, muted.lastVolume);
  assert.strictEqual(unmuted.volume, 75);
  assert.strictEqual(unmuted.isMuted, false);
});
