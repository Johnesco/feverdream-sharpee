/**
 * Fever Dream — The Basement (Middle Level)
 *
 * Three rooms: Stairwell, Laboratory, Cold Storage.
 * The Laboratory has a perception-hidden glass case.
 * Cold Storage has a locked metal cabinet containing the fungus.
 * The south exit from Laboratory → Cistern opens only after fungus consumption.
 *
 * Public interface: createBasement(world) → BasementIds
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
  ContainerTrait,
  OpenableTrait,
  LockableTrait,
} from '@sharpee/world-model';
import { ROOM_ZONES } from './perception.js';

export interface BasementIds {
  stairwell: string;
  laboratory: string;
  coldStorage: string;
  glassCaseId: string;
  metalCabinetId: string;
}

export function createBasement(world: WorldModel): BasementIds {

  // ─── Stairwell ────────────────────────────────────────────────────

  const stairwell = world.createEntity('Stairwell', EntityType.ROOM);
  stairwell.add(new RoomTrait({ exits: {}, isDark: false }));
  stairwell.add(new IdentityTrait({
    name: 'Stairwell',
    description: 'Concrete steps descend to a landing. The air turns cold and damp. Pipes run along the ceiling, sweating with condensation. The trapdoor opens above. A passage continues south to the laboratory.',
    aliases: ['stairwell', 'stairs', 'steps'],
    properName: true,
  }));
  ROOM_ZONES[stairwell.id] = 'basement';

  // Scenery: sweating pipes
  const pipes = world.createEntity('sweating pipes', EntityType.SCENERY);
  pipes.add(new IdentityTrait({
    name: 'sweating pipes',
    description: 'Copper and iron pipes bundled with wire, running along the ceiling. Condensation beads on their surfaces.',
    aliases: ['pipes', 'sweating pipes', 'ceiling pipes'],
  }));
  pipes.add(new SceneryTrait());
  world.moveEntity(pipes.id, stairwell.id);

  // ─── Laboratory ───────────────────────────────────────────────────

  const laboratory = world.createEntity('Laboratory', EntityType.ROOM);
  laboratory.add(new RoomTrait({ exits: {}, isDark: false }));
  laboratory.add(new IdentityTrait({
    name: 'Laboratory',
    description: 'A long room lined with workbenches and glass-fronted cabinets. Everything is labeled in the same careful handwriting. The stairwell is north. A heavy door leads east to cold storage.',
    aliases: ['laboratory', 'lab'],
    properName: true,
  }));
  ROOM_ZONES[laboratory.id] = 'laboratory';

  // Scenery: workbenches
  const benches = world.createEntity('workbenches', EntityType.SCENERY);
  benches.add(new IdentityTrait({
    name: 'workbenches',
    description: 'Slate-topped benches scored with knife marks and chemical burns. Numbered brass plates read 1 through 12, but benches 7 through 10 are missing.',
    aliases: ['workbenches', 'benches', 'work benches', 'tables'],
  }));
  benches.add(new SceneryTrait());
  world.moveEntity(benches.id, laboratory.id);

  // Scenery: lab plaque (critical — valve instructions)
  const plaque = world.createEntity('lab plaque', EntityType.SCENERY);
  plaque.add(new IdentityTrait({
    name: 'lab plaque',
    description: 'A brass plaque mounted beside the cold storage door.',
    aliases: ['plaque', 'brass plaque', 'lab plaque', 'sign'],
  }));
  plaque.add(new SceneryTrait());
  plaque.add(new ReadableTrait({
    text: 'CISTERN MAINTENANCE — Valve operation: LEFT drains. RIGHT floods. Do not operate without authorization.',
  }));
  world.moveEntity(plaque.id, laboratory.id);

  // Glass case (perception-hidden until spectacles worn)
  const glassCase = world.createEntity('glass case', EntityType.SCENERY);
  glassCase.add(new IdentityTrait({
    name: 'glass case',
    description: 'A small display case mounted on the wall. Thin glass, sealed shut. Inside, a brass key hangs from a thin wire.',
    aliases: ['case', 'glass case', 'display case'],
    concealed: true,  // hidden until spectacles reveal it
  }));
  glassCase.add(new SceneryTrait());
  world.moveEntity(glassCase.id, laboratory.id);

  // ─── Cold Storage ─────────────────────────────────────────────────

  const coldStorage = world.createEntity('Cold Storage', EntityType.ROOM);
  coldStorage.add(new RoomTrait({ exits: {}, isDark: false }));
  coldStorage.add(new IdentityTrait({
    name: 'Cold Storage',
    description: 'The temperature drops immediately. Your breath fogs. Racks of specimen jars line the walls, filled with amber fluid. A heavy metal cabinet stands against the far wall, marked with a snowflake. The laboratory is west.',
    aliases: ['cold storage', 'cold room', 'freezer'],
    properName: true,
  }));
  ROOM_ZONES[coldStorage.id] = 'coldstorage';

  // Scenery: specimen jars
  const jars = world.createEntity('specimen jars', EntityType.SCENERY);
  jars.add(new IdentityTrait({
    name: 'specimen jars',
    description: 'Sealed with wax. Dark shapes suspended in amber fluid, beyond identification. Each jar has a patient number. None match.',
    aliases: ['jars', 'specimen jars', 'specimens', 'bottles'],
  }));
  jars.add(new SceneryTrait());
  world.moveEntity(jars.id, coldStorage.id);

  // Metal cabinet (locked container — brass key unlocks it)
  const cabinet = world.createEntity('metal cabinet', EntityType.SCENERY);
  cabinet.add(new IdentityTrait({
    name: 'metal cabinet',
    description: 'Heavy metal, cold to the touch. A snowflake is embossed on the door. It is locked.',
    aliases: ['cabinet', 'metal cabinet', 'locker', 'snowflake cabinet'],
  }));
  cabinet.add(new SceneryTrait({ cantTakeMessage: 'It is bolted to the wall.' }));
  cabinet.add(new ContainerTrait({ capacity: { maxItems: 3 }, isTransparent: false }));
  cabinet.add(new OpenableTrait({ isOpen: false, canClose: true, revealsContents: true }));
  cabinet.add(new LockableTrait({ isLocked: true }));
  // keyId is set in items.ts after the brass key is created
  world.moveEntity(cabinet.id, coldStorage.id);

  // ─── Wire Exits ───────────────────────────────────────────────────

  world.connectRooms(stairwell.id, laboratory.id, Direction.SOUTH);
  world.connectRooms(laboratory.id, coldStorage.id, Direction.EAST);

  // NOTE: Up from Stairwell → Corridor is wired in index.ts
  // NOTE: South from Lab → Cistern is wired dynamically after fungus consumption

  return {
    stairwell: stairwell.id,
    laboratory: laboratory.id,
    coldStorage: coldStorage.id,
    glassCaseId: glassCase.id,
    metalCabinetId: cabinet.id,
  };
}
