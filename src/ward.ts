/**
 * Fever Dream — The Ward (Upper Level)
 *
 * Three rooms: Receiving Room, Corridor, Treatment Room.
 * The Corridor has a perception-hidden trapdoor leading down.
 *
 * Public interface: createWard(world) → WardIds
 */

import {
  WorldModel,
  EntityType,
  Direction,
} from '@sharpee/world-model';
import {
  IdentityTrait,
  RoomTrait,
  SceneryTrait,
  ReadableTrait,
} from '@sharpee/world-model';
import { ROOM_ZONES } from './perception.js';

export interface WardIds {
  receivingRoom: string;
  corridor: string;
  treatmentRoom: string;
}

export function createWard(world: WorldModel): WardIds {

  // ─── Receiving Room ───────────────────────────────────────────────

  const receivingRoom = world.createEntity('Receiving Room', EntityType.ROOM);
  receivingRoom.add(new RoomTrait({ exits: {}, isDark: false }));
  receivingRoom.add(new IdentityTrait({
    name: 'Receiving Room',
    description: 'Fluorescent tubes buzz overhead, one flickering at the far end. A long counter divides the room — scuffed linoleum on your side, dark wood on the other. A door leads east.',
    aliases: ['receiving room', 'reception', 'lobby'],
    properName: true,
  }));
  ROOM_ZONES[receivingRoom.id] = 'ward';

  // Scenery: fluorescent tubes
  const tubes = world.createEntity('fluorescent tubes', EntityType.SCENERY);
  tubes.add(new IdentityTrait({
    name: 'fluorescent tubes',
    description: 'Long glass tubes behind plastic diffusers. One flickers in a broken rhythm.',
    aliases: ['tubes', 'lights', 'fluorescent lights', 'fluorescents'],
  }));
  tubes.add(new SceneryTrait());
  world.moveEntity(tubes.id, receivingRoom.id);

  // Scenery: long counter
  const counter = world.createEntity('long counter', EntityType.SCENERY);
  counter.add(new IdentityTrait({
    name: 'long counter',
    description: 'Waist-high, dividing the room. Your side is scuffed linoleum. The far side is dark wood, polished once but not recently.',
    aliases: ['counter', 'desk', 'reception desk'],
  }));
  counter.add(new SceneryTrait());
  world.moveEntity(counter.id, receivingRoom.id);

  // ─── Corridor ─────────────────────────────────────────────────────

  const corridor = world.createEntity('Corridor', EntityType.ROOM);
  corridor.add(new RoomTrait({ exits: {}, isDark: false }));
  corridor.add(new IdentityTrait({
    name: 'Corridor',
    description: 'A long hallway tiled in white. Several tiles are cracked, revealing raw concrete beneath. The receiving room is west. The treatment room is east.',
    aliases: ['corridor', 'hallway', 'hall'],
    properName: true,
  }));
  ROOM_ZONES[corridor.id] = 'ward';

  // Scenery: white tiles
  const tiles = world.createEntity('white tiles', EntityType.SCENERY);
  tiles.add(new IdentityTrait({
    name: 'white tiles',
    description: 'Institutional white. Several are cracked, revealing raw concrete beneath. The grout has yellowed with age.',
    aliases: ['tiles', 'tile', 'floor', 'floor tiles'],
  }));
  tiles.add(new SceneryTrait());
  world.moveEntity(tiles.id, corridor.id);

  // Scenery: hidden trapdoor (perception-hidden — concealed until spectacles worn)
  const trapdoor = world.createEntity('trapdoor', EntityType.SCENERY);
  trapdoor.add(new IdentityTrait({
    name: 'trapdoor',
    description: 'A heavy trapdoor set into the floor, propped open against the wall. A recessed handle is set into the frame. Stairs descend into darkness.',
    aliases: ['trapdoor', 'trap door', 'hatch', 'door in floor'],
    concealed: true,  // hidden until spectacles reveal it
  }));
  trapdoor.add(new SceneryTrait());
  world.moveEntity(trapdoor.id, corridor.id);

  // ─── Treatment Room ───────────────────────────────────────────────

  const treatmentRoom = world.createEntity('Treatment Room', EntityType.ROOM);
  treatmentRoom.add(new RoomTrait({ exits: {}, isDark: false }));
  treatmentRoom.add(new IdentityTrait({
    name: 'Treatment Room',
    description: 'A reclining chair bolted to the floor, surrounded by drainage channels cut into the concrete. Instrument trays line the east wall. A faded note is pinned to the wall. The corridor is west.',
    aliases: ['treatment room', 'treatment'],
    properName: true,
  }));
  ROOM_ZONES[treatmentRoom.id] = 'treatment';

  // Scenery: reclining chair
  const chair = world.createEntity('reclining chair', EntityType.SCENERY);
  chair.add(new IdentityTrait({
    name: 'reclining chair',
    description: 'Padded in cracked leather, tilted fifteen degrees back. Restraint loops hang from the armrests.',
    aliases: ['chair', 'reclining chair', 'recliner', 'seat'],
  }));
  chair.add(new SceneryTrait());
  world.moveEntity(chair.id, treatmentRoom.id);

  // Scenery: instrument trays
  const trays = world.createEntity('instrument trays', EntityType.SCENERY);
  trays.add(new IdentityTrait({
    name: 'instrument trays',
    description: 'Stainless steel trays on wheeled stands. Labels read EXTRACTION, CALIBRATION, REFINEMENT. All empty.',
    aliases: ['trays', 'instrument trays', 'steel trays', 'instruments'],
  }));
  trays.add(new SceneryTrait());
  world.moveEntity(trays.id, treatmentRoom.id);

  // Scenery: faded note (readable)
  const fadedNote = world.createEntity('faded note', EntityType.SCENERY);
  fadedNote.add(new IdentityTrait({
    name: 'faded note',
    description: 'A typewritten note pinned to the wall with a single tack. The paper has yellowed.',
    aliases: ['note', 'faded note', 'wall note', 'paper'],
  }));
  fadedNote.add(new SceneryTrait());
  fadedNote.add(new ReadableTrait({
    text: 'Re: access to the lower level. What you cannot see is still there. The corrective lenses are not optional. They are the first step.',
  }));
  world.moveEntity(fadedNote.id, treatmentRoom.id);

  // ─── Wire Exits ───────────────────────────────────────────────────

  world.connectRooms(receivingRoom.id, corridor.id, Direction.EAST);
  world.connectRooms(corridor.id, treatmentRoom.id, Direction.EAST);

  // NOTE: Down exit from Corridor → Stairwell is wired in index.ts
  // after basement rooms exist, and only when spectacles are worn
  // (handled by a going-action interceptor).

  return {
    receivingRoom: receivingRoom.id,
    corridor: corridor.id,
    treatmentRoom: treatmentRoom.id,
  };
}
