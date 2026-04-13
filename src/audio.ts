/**
 * Fever Dream — Audio Layer
 *
 * Registers all audio cues, variation pools, and room atmospheres.
 * The AudioRegistry is stored on world state so actions and event
 * chains can fire cues via `world.getStateValue('audio')`.
 *
 * Audio asset paths are relative to assets/audio/ in the browser build.
 * Procedural recipes are synthesized client-side (no files needed).
 */

import { AudioRegistry } from '@sharpee/media';
import { createTypedEvent } from '@sharpee/core';
import type { WardIds } from './ward.js';
import type { BasementIds } from './basement.js';
import type { DepthIds } from './depths.js';

// ─── Cue Name Constants ────────────────────────────────────────────

export const SfxCue = {
  GLASS_BREAK: 'sfx.glass-break',
  VALVE_SCREECH: 'sfx.valve-screech',
  VALVE_FLOOD: 'sfx.valve-flood',
  SPRAY_HISS: 'sfx.spray-hiss',
  BASIN_TOUCH: 'sfx.basin-touch',
  KEY_DROP: 'sfx.key-drop',
  CABINET_UNLOCK: 'sfx.cabinet-unlock',
  CABINET_OPEN: 'sfx.cabinet-open',
  SPECTACLES_ON: 'sfx.spectacles-on',
  FUNGUS_EAT: 'sfx.fungus-eat',
  WOUND_OPEN: 'sfx.wound-open',
} as const;

export const ProceduralCue = {
  STATIC_BURST: 'proc.static-burst',
  HEARTBEAT: 'proc.heartbeat',
  LOW_HUM: 'proc.low-hum',
  ALERT_BEEP: 'proc.alert-beep',
  SWEEP_DOWN: 'proc.sweep-down',
} as const;

// ─── Registry Setup ────────────────────────────────────────────────

export function createAudioRegistry(
  wardIds: WardIds,
  basementIds: BasementIds,
  depthIds: DepthIds,
): AudioRegistry {
  const audio = new AudioRegistry();

  // ── SFX Cues ──

  audio.registerCue(SfxCue.GLASS_BREAK, () =>
    createTypedEvent('audio.sfx', {
      src: 'sfx/glass-shatter.mp3',
      volume: 0.85,
      duck: 2,
    }),
  );

  audio.registerCue(SfxCue.VALVE_SCREECH, () =>
    createTypedEvent('audio.sfx', {
      src: 'sfx/metal-screech.mp3',
      volume: 0.9,
      duck: 3,
    }),
  );

  audio.registerCue(SfxCue.VALVE_FLOOD, () =>
    createTypedEvent('audio.sfx', {
      src: 'sfx/water-rush.mp3',
      volume: 1.0,
      duck: 3,
    }),
  );

  audio.registerCue(SfxCue.SPRAY_HISS, () =>
    createTypedEvent('audio.sfx', {
      src: 'sfx/spray-hiss.mp3',
      volume: 0.7,
      duck: 2,
    }),
  );

  audio.registerCue(SfxCue.BASIN_TOUCH, () =>
    createTypedEvent('audio.sfx', {
      src: 'sfx/basin-resonance.mp3',
      volume: 0.8,
      duck: 3,
    }),
  );

  audio.registerCue(SfxCue.KEY_DROP, () =>
    createTypedEvent('audio.sfx', {
      src: 'sfx/key-drop.mp3',
      volume: 0.6,
      duck: 1,
    }),
  );

  audio.registerCue(SfxCue.CABINET_UNLOCK, () =>
    createTypedEvent('audio.sfx', {
      src: 'sfx/lock-click.mp3',
      volume: 0.5,
      duck: 1,
    }),
  );

  audio.registerCue(SfxCue.CABINET_OPEN, () =>
    createTypedEvent('audio.sfx', {
      src: 'sfx/cabinet-creak.mp3',
      volume: 0.5,
      duck: 1,
    }),
  );

  audio.registerCue(SfxCue.SPECTACLES_ON, () =>
    createTypedEvent('audio.sfx', {
      src: 'sfx/lens-focus.mp3',
      volume: 0.4,
      duck: 1,
    }),
  );

  audio.registerCue(SfxCue.FUNGUS_EAT, () =>
    createTypedEvent('audio.sfx', {
      src: 'sfx/organic-pulse.mp3',
      volume: 0.7,
      duck: 2,
    }),
  );

  audio.registerCue(SfxCue.WOUND_OPEN, () =>
    createTypedEvent('audio.sfx', {
      src: 'sfx/flesh-tear.mp3',
      volume: 0.6,
      duck: 2,
    }),
  );

  // ── Procedural Cues (synthesized client-side) ──

  audio.registerCue(ProceduralCue.STATIC_BURST, () =>
    createTypedEvent('audio.procedural', {
      recipe: 'static',
      params: { color: 0, duration: 800 },
      volume: 0.5,
      duck: 1,
    }),
  );

  audio.registerCue(ProceduralCue.HEARTBEAT, () =>
    createTypedEvent('audio.procedural', {
      recipe: 'beep',
      params: { frequency: 60, duration: 300 },
      volume: 0.3,
    }),
  );

  audio.registerCue(ProceduralCue.LOW_HUM, () =>
    createTypedEvent('audio.procedural', {
      recipe: 'hum',
      params: { frequency: 55, harmonics: 3 },
      volume: 0.2,
    }),
  );

  audio.registerCue(ProceduralCue.ALERT_BEEP, () =>
    createTypedEvent('audio.procedural', {
      recipe: 'alert',
      params: { frequency: 1200, interval: 500, count: 3 },
      volume: 0.4,
      duck: 2,
    }),
  );

  audio.registerCue(ProceduralCue.SWEEP_DOWN, () =>
    createTypedEvent('audio.procedural', {
      recipe: 'sweep-down',
      params: { startFreq: 2000, endFreq: 80, duration: 1500 },
      volume: 0.5,
      duck: 2,
    }),
  );

  // ── Footstep Variation Pools ──

  audio.registerPool('step.tile', {
    sources: ['sfx/step-tile-1.mp3', 'sfx/step-tile-2.mp3', 'sfx/step-tile-3.mp3'],
    volume: 0.3,
    volumeJitter: 0.08,
    pitchJitter: 0.05,
    duck: 0,
  });

  audio.registerPool('step.concrete', {
    sources: ['sfx/step-concrete-1.mp3', 'sfx/step-concrete-2.mp3'],
    volume: 0.35,
    volumeJitter: 0.1,
    pitchJitter: 0.06,
    duck: 0,
  });

  audio.registerPool('step.wet', {
    sources: ['sfx/step-wet-1.mp3', 'sfx/step-wet-2.mp3'],
    volume: 0.4,
    volumeJitter: 0.1,
    pitchJitter: 0.04,
    duck: 0,
  });

  // ── Room Atmospheres ──

  // Ward: Receiving Room + Corridor — sterile, fluorescent buzz
  audio.atmosphere(wardIds.receivingRoom)
    .ambient('ambient/fluorescent-buzz.mp3', 'lights', 0.15)
    .ambient('ambient/air-vent-low.mp3', 'ventilation', 0.08)
    .build();

  audio.atmosphere(wardIds.corridor)
    .ambient('ambient/fluorescent-buzz.mp3', 'lights', 0.12)
    .ambient('ambient/distant-hum.mp3', 'building', 0.06)
    .build();

  // Treatment Room — slightly more oppressive, leather creak
  audio.atmosphere(wardIds.treatmentRoom)
    .ambient('ambient/fluorescent-buzz.mp3', 'lights', 0.1)
    .ambient('ambient/leather-creak.mp3', 'room', 0.05)
    .build();

  // Stairwell — echoing drips, descending tone
  audio.atmosphere(basementIds.stairwell)
    .ambient('ambient/pipe-drip.mp3', 'dripping', 0.25)
    .ambient('ambient/deep-rumble.mp3', 'subsonic', 0.1)
    .effect('reverb', 'master', { decay: 2.5, mix: 0.3 })
    .build();

  // Laboratory — electrical hum, equipment rattle
  audio.atmosphere(basementIds.laboratory)
    .ambient('ambient/electrical-hum.mp3', 'machinery', 0.2)
    .ambient('ambient/cabinet-rattle.mp3', 'equipment', 0.08)
    .effect('lowpass', 'ambient:machinery', { frequency: 4000, q: 0.8 })
    .build();

  // Cold Storage — silence and cold, fridge compressor drone
  audio.atmosphere(basementIds.coldStorage)
    .ambient('ambient/compressor-drone.mp3', 'cooling', 0.18)
    .effect('lowpass', 'master', { frequency: 3000, q: 0.5 })
    .build();

  // Cistern — water lapping, pipe stress, enclosed reverb
  audio.atmosphere(depthIds.cistern)
    .ambient('ambient/water-lap.mp3', 'water', 0.3)
    .ambient('ambient/pipe-stress.mp3', 'pipes', 0.15)
    .effect('reverb', 'master', { decay: 4.0, mix: 0.45 })
    .build();

  // Source — deep pulse, organic hum, heavy reverb + lowpass
  audio.atmosphere(depthIds.source)
    .ambient('ambient/deep-pulse.mp3', 'pulse', 0.35)
    .ambient('ambient/organic-hum.mp3', 'organic', 0.2)
    .effect('reverb', 'master', { decay: 5.0, mix: 0.5 })
    .build();

  // ── Ducking Config ──

  audio.setDucking({
    duckVolume: 0.25,
    attackMs: 80,
    releaseMs: 600,
    targets: ['music', 'ambient'],
  });

  // ── Fade Defaults ──

  audio.setFadeDefaults({
    ambientIn: 2500,
    ambientOut: 2000,
    musicIn: 1500,
    effectTransition: 2000,
  });

  return audio;
}
