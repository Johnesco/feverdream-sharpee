/**
 * Perception State System
 *
 * Tracks the player's three perceptual states:
 * - normal: clinical, institutional descriptions
 * - clarity: biological/organic descriptions (post-fungus)
 * - corruption: garbled, unreliable text (post-spray)
 *
 * This trait lives on the player entity. Actions and description
 * logic check it to select prose variants. The browser-entry.ts
 * reads it to drive CSS overlay effects.
 */

import type { ITrait } from '@sharpee/world-model';

export type PerceptionState = 'normal' | 'clarity' | 'corruption';

export class PerceptionStateTrait implements ITrait {
  static readonly type = 'story.trait.perception' as const;
  readonly type = PerceptionStateTrait.type;

  state: PerceptionState = 'normal';
  hasSpectacles = false;
  fungusConsumed = false;
  sprayActive = false;
}

/**
 * Zone identifiers for CSS palette mapping.
 * Each room belongs to exactly one zone.
 */
export type Zone = 'ward' | 'treatment' | 'basement' | 'laboratory' | 'coldstorage' | 'cistern' | 'source';

/** Map room entity IDs to zones. Populated during world init. */
export const ROOM_ZONES: Record<string, Zone> = {};

/**
 * Text corruption for spray-active state.
 * Randomly substitutes characters to simulate perceptual breakdown.
 */
const CORRUPTION_MAP: Record<string, string[]> = {
  'e': ['3', 'e', '3'],
  'E': ['3', 'E', '3'],
  'a': ['@', 'a', '4'],
  'A': ['@', 'A', '4'],
  'i': ['1', 'i', '1'],
  'I': ['1', 'I', '1'],
  'o': ['0', 'o', '0'],
  'O': ['0', 'O', '0'],
  'b': ['8', 'b', '8'],
  'B': ['8', 'B', '8'],
  'h': ['#', 'h', '#'],
  'H': ['#', 'H', '#'],
  'l': ['_', 'l', '_'],
  'L': ['_', 'L', '_'],
};

/**
 * Corrupt a text string for spray-active state.
 * ~30% of eligible characters get substituted.
 */
export function corruptText(text: string): string {
  let result = '';
  for (const ch of text) {
    const replacements = CORRUPTION_MAP[ch];
    if (replacements && Math.random() < 0.3) {
      result += replacements[Math.floor(Math.random() * replacements.length)];
    } else {
      result += ch;
    }
  }
  return result;
}
