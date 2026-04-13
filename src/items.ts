/**
 * Fever Dream — Items
 *
 * All portable/interactive objects:
 * - Spectacles (wearable, reveals hidden things)
 * - Intake form (scenery, readable)
 * - Pipe wrench (tool for breaking glass case)
 * - Brass key (unlocks metal cabinet)
 * - Grey fungus (edible, triggers perception shift)
 *
 * Public interface: createItems(world, roomIds, basementIds) → ItemIds
 */

import {
  WorldModel,
  EntityType,
} from '@sharpee/world-model';
import {
  IdentityTrait,
  SceneryTrait,
  ReadableTrait,
  WearableTrait,
  EdibleTrait,
  OpenableTrait,
  LockableTrait,
} from '@sharpee/world-model';
import type { WardIds } from './ward.js';
import type { BasementIds } from './basement.js';

export interface ItemIds {
  spectacles: string;
  intakeForm: string;
  pipeWrench: string;
  brassKey: string;
  greyFungus: string;
  glassDishId: string;
}

export function createItems(
  world: WorldModel,
  ward: WardIds,
  basement: BasementIds,
): ItemIds {

  // ─── Intake Form (Receiving Room — scenery, readable) ─────────────

  const intakeForm = world.createEntity('intake form', EntityType.SCENERY);
  intakeForm.add(new IdentityTrait({
    name: 'intake form',
    description: 'A carbon-copy form on the counter. Your name is written in a handwriting you do not recognize.',
    aliases: ['form', 'intake form', 'paper', 'document'],
  }));
  intakeForm.add(new SceneryTrait({ cantTakeMessage: 'The paper crumbles at the edges when you try to lift it.' }));
  intakeForm.add(new ReadableTrait({
    text: 'Patient exhibits reduced perception. Corrective lenses issued.',
  }));
  world.moveEntity(intakeForm.id, ward.receivingRoom);

  // ─── Spectacles (Receiving Room — wearable, key perception item) ──

  const spectacles = world.createEntity('spectacles', EntityType.ITEM);
  spectacles.add(new IdentityTrait({
    name: 'spectacles',
    description: 'Wire-rimmed with thick lenses. They feel heavier than they should.',
    aliases: ['spectacles', 'glasses', 'lenses', 'specs', 'corrective lenses'],
  }));
  spectacles.add(new WearableTrait({ slot: 'eyes' }));
  world.moveEntity(spectacles.id, ward.receivingRoom);

  // ─── Pipe Wrench (Stairwell — tool) ──────────────────────────────

  const pipeWrench = world.createEntity('pipe wrench', EntityType.ITEM);
  pipeWrench.add(new IdentityTrait({
    name: 'pipe wrench',
    description: 'Heavy steel with a rusted jaw. The grip is worn smooth.',
    aliases: ['wrench', 'pipe wrench', 'tool'],
  }));
  world.moveEntity(pipeWrench.id, basement.stairwell);

  // ─── Brass Key (inside glass case — perception-hidden) ────────────

  const brassKey = world.createEntity('brass key', EntityType.ITEM);
  brassKey.add(new IdentityTrait({
    name: 'brass key',
    description: 'Ornate, warm to the touch. The bow is stamped with a snowflake.',
    aliases: ['key', 'brass key', 'ornate key', 'snowflake key'],
    concealed: true,  // hidden until glass case is broken
  }));
  // Key starts inside the glass case (conceptually — but since the case
  // isn't a container, we track it via game state. The key is revealed
  // and placed in the player's hand when the case is broken.)
  // For now, move it to the laboratory but keep it concealed.
  world.moveEntity(brassKey.id, basement.laboratory);

  // Wire the brass key to the metal cabinet's lock
  const cabinet = world.getEntity(basement.metalCabinetId);
  if (cabinet) {
    const lockable = cabinet.get(LockableTrait);
    if (lockable) {
      lockable.keyId = brassKey.id;
    }
  }

  // ─── Glass Dish (inside cabinet — scenery, readable) ──────────────

  // Create the glass dish here so we can place it inside the cabinet
  const glassDish = world.createEntity('glass dish', EntityType.SCENERY);
  glassDish.add(new IdentityTrait({
    name: 'glass dish',
    description: 'A shallow petri dish. A label reads: "PERCEPTUAL AGENT — STAGE 2 THERAPY."',
    aliases: ['dish', 'glass dish', 'petri dish'],
  }));
  glassDish.add(new SceneryTrait());
  glassDish.add(new ReadableTrait({
    text: 'PERCEPTUAL AGENT — STAGE 2 THERAPY. CONSUME FOR ACCESS TO LOWER LEVELS.',
  }));

  // Place dish inside the locked, closed cabinet
  const openable = cabinet?.get(OpenableTrait);
  if (openable) {
    openable.isOpen = true;
    world.moveEntity(glassDish.id, basement.metalCabinetId);
    openable.isOpen = false;
  }

  // ─── Grey Fungus (inside cabinet — edible, triggers perception) ───

  const greyFungus = world.createEntity('grey fungus', EntityType.ITEM);
  greyFungus.add(new IdentityTrait({
    name: 'grey fungus',
    description: 'A dense, velvety mass the color of wet ash. It gives slightly under pressure, like bread dough. It smells of nothing.',
    aliases: ['fungus', 'grey fungus', 'gray fungus', 'mushroom', 'growth'],
  }));
  greyFungus.add(new EdibleTrait());

  // Place fungus inside the locked, closed cabinet
  if (openable) {
    openable.isOpen = true;
    world.moveEntity(greyFungus.id, basement.metalCabinetId);
    openable.isOpen = false;
  }

  return {
    spectacles: spectacles.id,
    intakeForm: intakeForm.id,
    pipeWrench: pipeWrench.id,
    brassKey: brassKey.id,
    greyFungus: greyFungus.id,
    glassDishId: glassDish.id,
  };
}
