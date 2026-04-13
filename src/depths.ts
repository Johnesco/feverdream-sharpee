/**
 * Fever Dream — The Depths (Lower Level)
 *
 * Two rooms: Cistern, Source.
 * Cistern has the iron valve puzzle and drainage grate.
 * Source is the endgame — touching the stone basin wins.
 *
 * Public interface: createDepths(world) → DepthIds
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

export interface DepthIds {
  cistern: string;
  source: string;
  valveId: string;
  signId: string;
  grateId: string;
  basinId: string;
}

export function createDepths(world: WorldModel): DepthIds {

  // ─── Cistern ──────────────────────────────────────────────────────

  const cistern = world.createEntity('Cistern', EntityType.ROOM);
  cistern.add(new RoomTrait({ exits: {}, isDark: false }));
  cistern.add(new IdentityTrait({
    name: 'Cistern',
    description: 'A circular chamber of old brick, half-filled with dark water. The walls are slick with mineral deposits. Pipes enter from above, some intact, some cracked and leaking. An iron valve protrudes from the north wall at chest height. A faded instructional sign hangs beside it. The passage back north climbs toward the laboratory.',
    aliases: ['cistern', 'chamber', 'water chamber'],
    properName: true,
  }));
  ROOM_ZONES[cistern.id] = 'cistern';

  // Scenery: dark water
  const water = world.createEntity('dark water', EntityType.SCENERY);
  water.add(new IdentityTrait({
    name: 'dark water',
    description: 'Still and black. The surface reflects the pipes above with perfect clarity.',
    aliases: ['water', 'dark water', 'pool', 'liquid'],
  }));
  water.add(new SceneryTrait());
  world.moveEntity(water.id, cistern.id);

  // Scenery: iron valve (interactive — custom action handles turning)
  const valve = world.createEntity('iron valve', EntityType.SCENERY);
  valve.add(new IdentityTrait({
    name: 'iron valve',
    description: 'Cast-iron with a T-shaped handle. It can be turned left or right.',
    aliases: ['valve', 'iron valve', 'handle', 'T-handle'],
  }));
  valve.add(new SceneryTrait());
  world.moveEntity(valve.id, cistern.id);

  // Scenery: instructional sign (critical info — read before spray corrupts it)
  const sign = world.createEntity('instructional sign', EntityType.SCENERY);
  sign.add(new IdentityTrait({
    name: 'instructional sign',
    description: 'A laminated sign mounted beside the valve.',
    aliases: ['sign', 'instructional sign', 'instructions', 'notice'],
  }));
  sign.add(new SceneryTrait());
  sign.add(new ReadableTrait({
    text: 'CISTERN VALVE OPERATION — LEFT: drains cistern to sublevel. RIGHT: emergency flood (DO NOT OPERATE).',
  }));
  world.moveEntity(sign.id, cistern.id);

  // Scenery: drainage grate
  const grate = world.createEntity('drainage grate', EntityType.SCENERY);
  grate.add(new IdentityTrait({
    name: 'drainage grate',
    description: 'A heavy circular grate set into the floor, submerged under the dark water.',
    aliases: ['grate', 'drainage grate', 'drain', 'floor grate'],
  }));
  grate.add(new SceneryTrait());
  world.moveEntity(grate.id, cistern.id);

  // ─── Source ───────────────────────────────────────────────────────

  const source = world.createEntity('Source', EntityType.ROOM);
  source.add(new RoomTrait({ exits: {}, isDark: false }));
  source.add(new IdentityTrait({
    name: 'Source',
    description: 'A space that should not exist beneath a building this size. The walls are membranes, translucent and veined. Light comes from inside them — a slow amber pulse. A low stone basin sits in the center, holding something luminous, warm, and waiting.',
    aliases: ['source', 'the source'],
    properName: true,
  }));
  ROOM_ZONES[source.id] = 'source';

  // Scenery: membrane walls
  const walls = world.createEntity('membrane walls', EntityType.SCENERY);
  walls.add(new IdentityTrait({
    name: 'membrane walls',
    description: 'They pulse. Shapes move behind them. Not shadows.',
    aliases: ['walls', 'membrane walls', 'membranes', 'membrane'],
  }));
  walls.add(new SceneryTrait());
  world.moveEntity(walls.id, source.id);

  // Scenery: stone basin (touchable — endgame trigger via custom action)
  const basin = world.createEntity('stone basin', EntityType.SCENERY);
  basin.add(new IdentityTrait({
    name: 'stone basin',
    description: 'Carved from a single piece of stone, older than anything else in the building. It holds something that glows. Not light. Attention.',
    aliases: ['basin', 'stone basin', 'bowl'],
  }));
  basin.add(new SceneryTrait());
  world.moveEntity(basin.id, source.id);

  // ─── Wire Exits ───────────────────────────────────────────────────

  const cisternTrait = cistern.get(RoomTrait)!;
  const sourceTrait = source.get(RoomTrait)!;

  // Cistern west → Laboratory is wired in index.ts (cross-module)
  // Cistern down → Source is wired dynamically after draining

  sourceTrait.exits[Direction.UP] = { destination: cistern.id };

  return {
    cistern: cistern.id,
    source: source.id,
    valveId: valve.id,
    signId: sign.id,
    grateId: grate.id,
    basinId: basin.id,
  };
}
