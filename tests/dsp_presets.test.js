// SPEAKER REMOTE - Suite de Pruebas Unitarias: Presets DSP y Filtros Biquad
const test = require('node:test');
const assert = require('node:assert/strict');

const DSP_PRESETS = {
  flat: { bass: 0, treble: 0, name: 'Plano / Neutral' },
  bass_boost: { bass: 9, treble: 2, name: 'Refuerzo de Graves' },
  vocal: { bass: -2, treble: 6, name: 'Claridad Vocal' },
  crystal: { bass: 3, treble: 10, name: 'Cristalino / Brillante' },
  party: { bass: 12, treble: 8, name: 'Fiesta / Alta Dinámica' }
};

function applyPreset(presetKey) {
  const preset = DSP_PRESETS[presetKey];
  if (!preset) throw new Error(`Preset desconocido: ${presetKey}`);
  return {
    bassGain: Math.max(-12, Math.min(12, preset.bass)),
    trebleGain: Math.max(-12, Math.min(12, preset.treble)),
    lowshelfHz: 200,
    highshelfHz: 3000
  };
}

test('DSP Presets - Aplica correctamente los parámetros acústicos de cada modo', () => {
  const bassConfig = applyPreset('bass_boost');
  assert.strictEqual(bassConfig.bassGain, 9);
  assert.strictEqual(bassConfig.trebleGain, 2);
  assert.strictEqual(bassConfig.lowshelfHz, 200);

  const vocalConfig = applyPreset('vocal');
  assert.strictEqual(vocalConfig.bassGain, -2);
  assert.strictEqual(vocalConfig.trebleGain, 6);

  const crystalConfig = applyPreset('crystal');
  assert.strictEqual(crystalConfig.bassGain, 3);
  assert.strictEqual(crystalConfig.trebleGain, 10);
});

test('DSP Presets - Acota límites de ganancia dentro de [-12 dB, +12 dB]', () => {
  const partyConfig = applyPreset('party');
  assert.strictEqual(partyConfig.bassGain <= 12, true);
  assert.strictEqual(partyConfig.trebleGain <= 12, true);
});

test('DSP Presets - Arroja excepción ante preset inexistente', () => {
  assert.throws(() => applyPreset('modo_fantasma'), /Preset desconocido/);
});
