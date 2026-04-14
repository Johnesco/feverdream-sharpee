/**
 * Fever Dream — Audio Layer
 *
 * Registers the SFX cues declared by the I7 reference implementation.
 * The AudioRegistry is stored on world state via STATE.AUDIO so actions
 * and event handlers can fire cues via `world.getStateValue('audio')`.
 *
 * Parity note: this file mirrors the 8 `Sound of X is the file "Y.ogg"`
 * declarations in text-games/i7/feverdream/story.ni. Asset paths resolve
 * relative to play.html → browser/sfx/ in the deploy directory.
 */

import { AudioRegistry } from '@sharpee/media';
import { createTypedEvent } from '@sharpee/core';

// ─── Cue Name Constants ────────────────────────────────────────────

export const SfxCue = {
  GLASS_BREAK: 'sfx.glass-break',
  VALVE_SCREECH: 'sfx.valve-screech',
  VALVE_FLOOD: 'sfx.valve-flood',
  SPRAY_HISS: 'sfx.spray-hiss',
  BASIN_TOUCH: 'sfx.basin-touch',
  KEY_DROP: 'sfx.key-drop',
  FUNGUS_EAT: 'sfx.fungus-eat',
  WOUND_OPEN: 'sfx.wound-open',
} as const;

// ─── Registry Setup ────────────────────────────────────────────────

export function createAudioRegistry(): AudioRegistry {
  const audio = new AudioRegistry();

  audio.registerCue(SfxCue.GLASS_BREAK, () =>
    createTypedEvent('audio.sfx', { src: 'sfx/glass.ogg', volume: 0.85 }),
  );

  audio.registerCue(SfxCue.VALVE_SCREECH, () =>
    createTypedEvent('audio.sfx', { src: 'sfx/valve-screech.ogg', volume: 0.9 }),
  );

  audio.registerCue(SfxCue.VALVE_FLOOD, () =>
    createTypedEvent('audio.sfx', { src: 'sfx/flood-rush.ogg', volume: 1.0 }),
  );

  audio.registerCue(SfxCue.SPRAY_HISS, () =>
    createTypedEvent('audio.sfx', { src: 'sfx/spray-hiss.ogg', volume: 0.7 }),
  );

  audio.registerCue(SfxCue.BASIN_TOUCH, () =>
    createTypedEvent('audio.sfx', { src: 'sfx/basin-touch.ogg', volume: 0.8 }),
  );

  audio.registerCue(SfxCue.KEY_DROP, () =>
    createTypedEvent('audio.sfx', { src: 'sfx/glass.ogg', volume: 0.4 }),
  );

  audio.registerCue(SfxCue.FUNGUS_EAT, () =>
    createTypedEvent('audio.sfx', { src: 'sfx/fungus-consume.ogg', volume: 0.7 }),
  );

  audio.registerCue(SfxCue.WOUND_OPEN, () =>
    createTypedEvent('audio.sfx', { src: 'sfx/heartbeat.ogg', volume: 0.6 }),
  );

  return audio;
}
