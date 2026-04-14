/**
 * Fever Dream — Story Entry Point
 *
 * A perceptual horror. Three items alter your perception.
 * The world stays the same. You do not.
 *
 * This file wires all modules together via the Story interface.
 */

import { Story, StoryConfig, GameEngine } from '@sharpee/engine';
import {
  WorldModel,
  IFEntity,
  EntityType,
  Direction,
} from '@sharpee/world-model';
import type { IWorldModel } from '@sharpee/world-model';
import {
  IdentityTrait,
  RoomTrait,
  ActorTrait,
  ContainerTrait,
  SceneryTrait,
  WearableTrait,
  ReadableTrait,
} from '@sharpee/world-model';
import type { Action } from '@sharpee/stdlib';
import type { Parser } from '@sharpee/parser-en-us';
import type { LanguageProvider } from '@sharpee/lang-en-us';
import type { ISemanticEvent } from '@sharpee/core';

import { createWard, WardIds } from './ward.js';
import { createBasement, BasementIds } from './basement.js';
import { createDepths, DepthIds } from './depths.js';
import { createItems, ItemIds } from './items.js';
import { PerceptionStateTrait, ROOM_ZONES } from './perception.js';
import { registerMessages, PerceptionMsg, ActionMsg, EndgameMsg } from './language.js';
import { createAudioRegistry, SfxCue } from './audio.js';
import type { AudioRegistry } from '@sharpee/media';
import type { Effect } from '@sharpee/event-processor';
import { createTypedEvent } from '@sharpee/core';

// ─── Story Config ───────────────────────────────────────────────────

export const config: StoryConfig = {
  id: 'fever-dream',
  title: 'Fever Dream',
  author: 'John Googol',
  version: '1.0.0',
  description: 'A perceptual horror. Three items alter your perception. The world stays the same. You do not.',
};

// ─── Module IDs (set during init) ───────────────────────────────────

let wardIds: WardIds;
let basementIds: BasementIds;
let depthIds: DepthIds;
let itemIds: ItemIds;

// ─── Game State Flags ───────────────────────────────────────────────

const STATE = {
  GLASS_CASE_BROKEN: 'story.glass_case_broken',
  CISTERN_DRAINED: 'story.cistern_drained',
  GAME_WON: 'story.game_won',
  GAME_OVER: 'story.game_over',
  AUDIO: 'story.audio_registry',
};

// ─── Story Class ────────────────────────────────────────────────────

class FeverDreamStory implements Story {
  config = config;

  createPlayer(world: WorldModel): IFEntity {
    const player = world.createEntity('yourself', EntityType.ACTOR);
    player.add(new IdentityTrait({
      name: 'yourself',
      description: 'You are wearing a patient\'s gown, thin and pale blue. Your hands are steady.',
      aliases: ['self', 'me', 'myself'],
      properName: true,
    }));
    player.add(new ActorTrait({ isPlayer: true }));
    player.add(new ContainerTrait({ capacity: { maxItems: 10 } }));
    player.add(new PerceptionStateTrait());
    return player;
  }

  initializeWorld(world: WorldModel): void {
    // Create all regions
    wardIds = createWard(world);
    basementIds = createBasement(world);
    depthIds = createDepths(world);

    // Create all items (needs room IDs for placement)
    itemIds = createItems(world, wardIds, basementIds);

    // Create audio registry and store on world state
    const audio = createAudioRegistry();
    world.setStateValue(STATE.AUDIO, audio);

    // ── Cross-module exit wiring ──

    // Stairwell → Corridor (UP is always available once you're down there)
    const stairwellRoom = world.getEntity(basementIds.stairwell);
    if (stairwellRoom) {
      stairwellRoom.get(RoomTrait)!.exits[Direction.UP] = {
        destination: wardIds.corridor,
      };
    }

    // Cistern → Laboratory (NORTH — always available once you're in the cistern)
    const cisternRoom = world.getEntity(depthIds.cistern);
    if (cisternRoom) {
      cisternRoom.get(RoomTrait)!.exits[Direction.NORTH] = {
        destination: basementIds.laboratory,
      };
    }

    // Source → Cistern (UP — always available)
    // (already wired in depths.ts)

    // GATED EXITS — added dynamically by event chains:
    // Corridor DOWN → Stairwell    (on wearing spectacles)
    // Laboratory SOUTH → Cistern   (on eating fungus)
    // Cistern DOWN → Source         (on draining cistern)

    // Place player
    const player = world.getPlayer();
    if (player) {
      world.moveEntity(player.id, wardIds.receivingRoom);
    }
  }

  extendParser(parser: Parser): void {
    const grammar = parser.getStoryGrammar();

    // Breaking things
    grammar.define('break :target').mapsTo('story.action.breaking').withPriority(150).build();
    grammar.define('smash :target').mapsTo('story.action.breaking').withPriority(150).build();
    grammar.define('shatter :target').mapsTo('story.action.breaking').withPriority(150).build();
    grammar.define('hit :target').mapsTo('story.action.breaking').withPriority(150).build();

    // Break with instrument
    grammar.define('break :target with :instrument').mapsTo('story.action.breaking').withPriority(155).build();
    grammar.define('smash :target with :instrument').mapsTo('story.action.breaking').withPriority(155).build();
    grammar.define('hit :target with :instrument').mapsTo('story.action.breaking').withPriority(155).build();

    // Valve operations
    grammar.define('turn :target left').mapsTo('story.action.turning-left').withPriority(150).build();
    grammar.define('turn :target counterclockwise').mapsTo('story.action.turning-left').withPriority(150).build();
    grammar.define('turn :target right').mapsTo('story.action.turning-right').withPriority(150).build();
    grammar.define('turn :target clockwise').mapsTo('story.action.turning-right').withPriority(150).build();

    // Wearing — grammar not in stdlib parser yet
    grammar.forAction('if.action.wearing').verbs(['wear', 'don']).pattern(':target').build();
    grammar.define('put on :target').mapsTo('if.action.wearing').withPriority(95).build();

    // Taking off
    grammar.define('take off :target').mapsTo('if.action.taking_off').withPriority(95).build();
    grammar.define('remove :target').mapsTo('if.action.taking_off').withPriority(95).build();

    // Touch (for basin endgame)
    grammar.define('touch :target').mapsTo('story.action.touching').withPriority(150).build();
    grammar.define('reach into :target').mapsTo('story.action.touching').withPriority(150).build();
  }

  extendLanguage(language: LanguageProvider): void {
    registerMessages(language);
  }

  getCustomActions(): Action[] {
    return [
      createBreakAction(),
      createTurnLeftAction(),
      createTurnRightAction(),
      createTouchAction(),
    ];
  }

  onEngineReady(engine: GameEngine): void {
    const world = engine.getWorld();

    // ── Audio handlers: attach SFX to story/chain events that mutate state ──
    //
    // Three I7 sound cues (fungus-consume, spray-hiss, heartbeat) fire from
    // moments that Sharpee handles via chainEvent — which has no return-slot
    // for side-effect events. We observe the resulting story/stdlib events
    // here and emit the audio cues as Effect[] side-effects (dungeo pattern).

    const audio = world.getStateValue(STATE.AUDIO) as AudioRegistry | undefined;
    const eventProcessor = engine.getEventProcessor();

    const emitCue = (cueId: string): Effect[] => {
      const events = audio?.cue(cueId);
      if (!events || events.length === 0) return [];
      return events.map((event) => ({ type: 'emit', event }));
    };

    // Fungus-consume: chainEvent on 'if.event.eaten' replaces it with
    // 'story.event.fungus-consumed' (see chain registration below).
    eventProcessor.registerHandler(
      'story.event.fungus-consumed',
      (): Effect[] => emitCue(SfxCue.FUNGUS_EAT),
    );

    // Spray-hiss: the spray-exposure chainEvent emits 'story.event.spray-exposure'
    // when the player enters the Cistern with fungus consumed.
    eventProcessor.registerHandler(
      'story.event.spray-exposure',
      (): Effect[] => emitCue(SfxCue.SPRAY_HISS),
    );

    // Heartbeat: going down from the Cistern into the Source (no custom chain;
    // use raw actor_moved with a room-pair check).
    eventProcessor.registerHandler(
      'if.event.actor_moved',
      (event: ISemanticEvent): Effect[] => {
        const data = event.data as Record<string, any> | undefined;
        const from = data?.fromRoom;
        const to = data?.toRoom ?? data?.destination;
        if (from === depthIds.cistern && to === depthIds.source) {
          return emitCue(SfxCue.WOUND_OPEN);
        }
        return [];
      },
    );

    // ── Spray exposure: auto-trigger on entering Cistern with fungus consumed ──

    world.chainEvent('if.event.actor_moved', (event: ISemanticEvent, w: IWorldModel): ISemanticEvent | null => {
      const data = event.data as Record<string, any>;
      const toRoom = data.toRoom || data.destination;
      if (toRoom !== depthIds.cistern) return null;

      const player = w.getPlayer();
      if (!player) return null;
      const perception = player.get(PerceptionStateTrait);
      if (!perception || !perception.fungusConsumed || perception.sprayActive) return null;

      // Trigger spray exposure
      perception.sprayActive = true;
      perception.state = 'corruption';

      // ── Corrupt descriptions in Cistern and Source ──

      const updateDesc = (roomId: string, entityName: string, desc: string) => {
        for (const child of w.getContents(roomId)) {
          const id = child.get(IdentityTrait);
          if (id && (child.name === entityName || id.name === entityName)) {
            id.description = desc;
            break;
          }
        }
      };

      // Cistern room → corrupted
      const cisternRoom = w.getEntity(depthIds.cistern);
      if (cisternRoom) {
        const cId = cisternRoom.get(IdentityTrait);
        if (cId) {
          cId.description = 'Th3 chamb_r is al1ve. The brikcs are t33th in a circuler jaw. Th3 dark watr below is a thro@t, swllowing and unswll0wing. An ir0n valv3 gros from the n0rth wall. Bes1de it, a s1gn. The pa55age back n0rth climbs t0ward the lab0ratory.';
        }
      }

      // Cistern objects
      updateDesc(depthIds.cistern, 'dark water',
        'Drk watr. It movs but you c4nt tell which w@y.');

      updateDesc(depthIds.cistern, 'iron valve',
        'An ir0n valv3. It hs a handl you can trn l3ft or r1ght.');

      // Instructional sign: corrupt description + readable text
      for (const child of w.getContents(depthIds.cistern)) {
        if (child.name === 'instructional sign') {
          const id = child.get(IdentityTrait);
          if (id) id.description = 'Th3 l3tters sw1m. You c4n alm0st r3ad it.';
          const readable = child.get(ReadableTrait);
          if (readable) readable.text = 'LEFT dr--ns? Or was 1t R1GHT? Th3 w0rds r3arrange th3mselves wh3n you bl1nk.';
          break;
        }
      }

      // Source objects
      updateDesc(depthIds.source, 'membrane walls',
        'Th3y puls3. Y0u c@n s3e sh4pes m0ving b3h1nd th3m. Th3y ar3 n0t shad0ws.');

      updateDesc(depthIds.source, 'stone basin',
        'A b@sin c@rved fr0m a s1ngle p1ece of st0ne. Ins1de, s0meth1ng gl0ws. 1t 1s n0t l1ght. It 1s att3ntion.');

      return {
        id: `spray-exposure-${Date.now()}`,
        type: 'story.event.spray-exposure',
        timestamp: Date.now(),
        entities: {},
        data: { messageId: PerceptionMsg.SPRAY_EXPOSURE },
      };
    }, { key: 'story.chain.spray-exposure' });

    // ── Fungus eating interceptor ──
    // When eating the grey fungus, trigger perception shift

    world.chainEvent('if.event.eaten', (event: ISemanticEvent, w: IWorldModel): ISemanticEvent | null => {
      const data = event.data as Record<string, any>;
      if (data.blocked) return null;
      if (data.item !== itemIds.greyFungus) return null;

      const player = w.getPlayer();
      if (!player) return null;
      const perception = player.get(PerceptionStateTrait);
      if (!perception) return null;

      // Trigger perception shift
      perception.fungusConsumed = true;
      perception.state = 'clarity';

      // Open Laboratory → Cistern exit and update lab description
      const lab = w.getEntity(basementIds.laboratory);
      if (lab) {
        lab.get(RoomTrait)!.exits[Direction.SOUTH] = {
          destination: depthIds.cistern,
        };
        const labId = lab.get(IdentityTrait);
        if (labId) {
          labId.description = 'A long room lined with workbenches and glass-fronted cabinets. Everything is labeled in the same careful handwriting. The stairwell is north. A heavy door leads east to cold storage. At the south end, the floor has split open — a wound with smooth, glistening edges. A dark passage descends through it.';
        }
      }

      // ── Transform world descriptions for clarity state ──

      // Helpers for bulk description mutations
      const updateDesc = (roomId: string, entityName: string, desc: string) => {
        for (const child of w.getContents(roomId)) {
          if (child.name === entityName) {
            const id = child.get(IdentityTrait);
            if (id) id.description = desc;
            break;
          }
        }
      };

      const transformEntity = (roomId: string, entityName: string, newName: string, desc: string) => {
        for (const child of w.getContents(roomId)) {
          if (child.name === entityName) {
            const id = child.get(IdentityTrait);
            if (id) {
              id.name = newName;
              id.description = desc;
            }
            break;
          }
        }
      };

      // Corridor: tiles breathe
      updateDesc(wardIds.corridor, 'white tiles',
        'They breathe. You are certain of this now. Each tile swells slightly on the inhale and settles on the exhale. The grout between them is wet and warm.');

      // Treatment Room: chair becomes crouching thing
      transformEntity(wardIds.treatmentRoom, 'reclining chair', 'crouching thing',
        'It has four legs and a flat back. You know it is a chair. It does not look like a chair. Its leather is skin. Its restraints are tendons.');

      // Treatment Room: trays become bone shelves
      transformEntity(wardIds.treatmentRoom, 'instrument trays', 'bone shelves',
        'They are not steel. They are cartilage, smooth and pale, arranged like ribs along the wall.');

      // Stairwell: pipes become arteries
      transformEntity(basementIds.stairwell, 'sweating pipes', 'arteries',
        'They pulse. The condensation is warm now, and slightly viscous. These are not pipes. They have never been pipes.');

      // Cold Storage: jars become organs
      transformEntity(basementIds.coldStorage, 'specimen jars', 'organs',
        'Not jars. Transparent sacs of membrane, each holding a dark shape that twitches when you look directly at it. They are alive. They have always been alive.');

      // Cold Storage: cabinet becomes iron ribcage
      transformEntity(basementIds.coldStorage, 'metal cabinet', 'iron ribcage',
        'What you called a cabinet is a cage of fused iron bones. It stands open like a chest cavity after surgery.');

      // Cistern: room description for clarity state (seen on first entry)
      const cisternRoom = w.getEntity(depthIds.cistern);
      if (cisternRoom) {
        const cId = cisternRoom.get(IdentityTrait);
        if (cId) {
          cId.description = 'The chamber is alive. The bricks are teeth in a circular jaw. The dark water below is a throat, swallowing and unswallowing in slow rhythm. The pipes overhead are arteries, pulsing with something that is not water. An iron valve grows from the north wall like a bone spur. Beside it, a sign hangs from the flesh of the wall. The passage back north climbs toward the laboratory.';
        }
      }

      // Cistern: dark water
      updateDesc(depthIds.cistern, 'dark water',
        'It moves, but you cannot tell which way. Something underneath displaces the surface in slow, deliberate patterns.');

      // Cistern: iron valve
      updateDesc(depthIds.cistern, 'iron valve',
        'A growth of iron, fused to the wall like coral. The handle is a joint that bends left or right.');

      // Cistern: instructional sign description + readable text
      for (const child of w.getContents(depthIds.cistern)) {
        if (child.name === 'instructional sign') {
          const id = child.get(IdentityTrait);
          if (id) id.description = 'A flap of skin pinned to the wall with a thorn. The words are tattooed into it. They read the same — valve directions, maintenance notes — but the medium has changed.';
          break;
        }
      }

      return {
        id: `fungus-consumed-${Date.now()}`,
        type: 'story.event.fungus-consumed',
        timestamp: Date.now(),
        entities: {},
        data: { messageId: PerceptionMsg.FUNGUS_CONSUMED },
      };
    }, { key: 'story.chain.fungus-consumption' });

    // ── Wearing spectacles interceptor ──

    world.chainEvent('if.event.worn', (event: ISemanticEvent, w: IWorldModel): ISemanticEvent | null => {
      const data = event.data as Record<string, any>;
      if (data.itemId !== itemIds.spectacles) return null;

      const player = w.getPlayer();
      if (!player) return null;
      const perception = player.get(PerceptionStateTrait);
      if (!perception) return null;

      perception.hasSpectacles = true;

      // Open Corridor → Stairwell exit
      const corridor = w.getEntity(wardIds.corridor);
      if (corridor) {
        corridor.get(RoomTrait)!.exits[Direction.DOWN] = {
          destination: basementIds.stairwell,
        };
      }

      // Unconceal the trapdoor
      for (const child of w.getContents(wardIds.corridor)) {
        const identity = child.get(IdentityTrait);
        if (identity && child.name === 'trapdoor') {
          identity.concealed = false;
        }
      }
      // Unconceal the glass case
      for (const child of w.getContents(basementIds.laboratory)) {
        const identity = child.get(IdentityTrait);
        if (identity && child.name === 'glass case') {
          identity.concealed = false;
        }
      }
      return {
        id: `spectacles-worn-${Date.now()}`,
        type: 'story.event.spectacles-worn',
        timestamp: Date.now(),
        entities: {},
        data: { messageId: PerceptionMsg.WEAR_SPECTACLES },
      };
    }, { key: 'story.chain.spectacles' });
  }
}

// ─── Custom Actions ─────────────────────────────────────────────────

function createBreakAction(): Action {
  return {
    id: 'story.action.breaking',
    group: 'interaction',

    validate(context) {
      const target = context.command.directObject?.entity;
      if (!target) return { valid: false, error: ActionMsg.BREAK_NOTHING };

      const targetName = target.get(IdentityTrait)?.name || '';

      // Only the glass case can be broken
      if (targetName !== 'glass case') {
        return { valid: false, error: ActionMsg.BREAK_CANT };
      }

      // Already broken?
      if (context.world.getStateValue(STATE.GLASS_CASE_BROKEN)) {
        return { valid: false, error: ActionMsg.BREAK_ALREADY };
      }

      // Need the wrench
      const inventory = context.world.getContents(context.player.id);
      const hasWrench = inventory.some(i =>
        i.get(IdentityTrait)?.aliases?.includes('wrench'),
      );
      if (!hasWrench) {
        return { valid: false, error: ActionMsg.BREAK_NEED_TOOL };
      }

      context.sharedData.target = target;
      return { valid: true };
    },

    execute(context) {
      context.world.setStateValue(STATE.GLASS_CASE_BROKEN, true);

      // Update glass case description
      const target = context.sharedData.target as IFEntity;
      const identity = target.get(IdentityTrait);
      if (identity) {
        identity.description = 'Shattered remains of the display case. Fragments of thin glass cling to the frame.';
      }

      // Unconceal and move brass key to player
      const keyEntity = context.world.getEntity(itemIds.brassKey);
      if (keyEntity) {
        const keyIdentity = keyEntity.get(IdentityTrait);
        if (keyIdentity) {
          keyIdentity.concealed = false;
        }
      }
      context.world.moveEntity(itemIds.brassKey, context.player.id);
    },

    report(context) {
      const audio = context.world.getStateValue(STATE.AUDIO) as AudioRegistry | undefined;
      return [
        context.event('story.event.glass-break', {
          messageId: ActionMsg.BREAK_GLASS,
        }),
        ...(audio?.cue(SfxCue.GLASS_BREAK) ?? []),
        ...(audio?.cue(SfxCue.KEY_DROP) ?? []),
      ];
    },

    blocked(context, result) {
      return [
        context.event('story.event.break-blocked', {
          messageId: result.error || ActionMsg.BREAK_CANT,
        }),
      ];
    },
  };
}

function createTurnLeftAction(): Action {
  return {
    id: 'story.action.turning-left',
    group: 'interaction',

    validate(context) {
      const target = context.command.directObject?.entity;
      const targetName = target?.get(IdentityTrait)?.name || '';

      if (targetName !== 'iron valve') {
        return { valid: false, error: ActionMsg.VALVE_NOT_HERE };
      }

      if (context.world.getStateValue(STATE.CISTERN_DRAINED)) {
        return { valid: false, error: ActionMsg.VALVE_ALREADY_DRAINED };
      }

      context.sharedData.target = target;
      return { valid: true };
    },

    execute(context) {
      context.world.setStateValue(STATE.CISTERN_DRAINED, true);

      // Update water description
      const waterEntities = context.world.getContents(depthIds.cistern);
      for (const e of waterEntities) {
        if (e.name === 'dark water') {
          const identity = e.get(IdentityTrait);
          if (identity) {
            identity.description = 'Gone. Only pale slime coats the bricks where the waterline was.';
          }
        }
        if (e.name === 'drainage grate') {
          const identity = e.get(IdentityTrait);
          if (identity) {
            identity.description = 'A heavy circular grate, now standing open. A narrow passage descends into darkness.';
          }
        }
      }

      // Update cistern room description
      const cisternRoom = context.world.getEntity(depthIds.cistern);
      if (cisternRoom) {
        const identity = cisternRoom.get(IdentityTrait);
        if (identity) {
          identity.description = 'A circular chamber of old brick. The water is gone. The walls are coated in pale slime. The drainage grate stands open in the floor, revealing a narrow passage descending further. The passage back north climbs toward the laboratory.';
        }
        // Open Cistern → Source exit
        cisternRoom.get(RoomTrait)!.exits[Direction.DOWN] = {
          destination: depthIds.source,
        };
      }
    },

    report(context) {
      const audio = context.world.getStateValue(STATE.AUDIO) as AudioRegistry | undefined;
      return [
        context.event('story.event.valve-drain', {
          messageId: ActionMsg.VALVE_LEFT,
        }),
        ...(audio?.cue(SfxCue.VALVE_SCREECH) ?? []),
      ];
    },

    blocked(context, result) {
      return [
        context.event('story.event.valve-blocked', {
          messageId: result.error || ActionMsg.VALVE_NOT_HERE,
        }),
      ];
    },
  };
}

function createTurnRightAction(): Action {
  return {
    id: 'story.action.turning-right',
    group: 'interaction',

    validate(context) {
      const target = context.command.directObject?.entity;
      const targetName = target?.get(IdentityTrait)?.name || '';

      if (targetName !== 'iron valve') {
        return { valid: false, error: ActionMsg.VALVE_NOT_HERE };
      }

      if (context.world.getStateValue(STATE.CISTERN_DRAINED)) {
        return { valid: false, error: ActionMsg.VALVE_ALREADY_DRAINED };
      }

      context.sharedData.target = target;
      return { valid: true };
    },

    execute(context) {
      context.world.setStateValue(STATE.GAME_OVER, true);
    },

    report(context) {
      const audio = context.world.getStateValue(STATE.AUDIO) as AudioRegistry | undefined;
      return [
        context.event('story.event.valve-flood', {
          messageId: ActionMsg.VALVE_RIGHT,
        }),
        ...(audio?.cue(SfxCue.VALVE_FLOOD) ?? []),
        context.event('story.event.game-end', {
          messageId: EndgameMsg.FLOOD_DEATH,
          won: false,
        }),
      ];
    },

    blocked(context, result) {
      return [
        context.event('story.event.valve-blocked', {
          messageId: result.error || ActionMsg.VALVE_NOT_HERE,
        }),
      ];
    },
  };
}

function createTouchAction(): Action {
  return {
    id: 'story.action.touching',
    group: 'interaction',

    validate(context) {
      const target = context.command.directObject?.entity;
      const targetName = target?.get(IdentityTrait)?.name || '';

      if (targetName !== 'stone basin') {
        return { valid: false, error: ActionMsg.BASIN_NOT_HERE };
      }

      context.sharedData.target = target;
      return { valid: true };
    },

    execute(context) {
      context.world.setStateValue(STATE.GAME_WON, true);
    },

    report(context) {
      const audio = context.world.getStateValue(STATE.AUDIO) as AudioRegistry | undefined;
      return [
        context.event('story.event.basin-touch', {
          messageId: ActionMsg.BASIN_TOUCH,
        }),
        ...(audio?.cue(SfxCue.BASIN_TOUCH) ?? []),
        context.event('story.event.game-end', {
          messageId: EndgameMsg.WIN,
          won: true,
        }),
      ];
    },

    blocked(context, result) {
      return [
        context.event('story.event.touch-blocked', {
          messageId: result.error || ActionMsg.BASIN_NOT_HERE,
        }),
      ];
    },
  };
}

// ─── Exports ────────────────────────────────────────────────────────

export const story = new FeverDreamStory();
export default story;

// Re-export for browser-entry.ts and other modules
export { wardIds, basementIds, depthIds, itemIds, STATE };
export type { WardIds, BasementIds, DepthIds, ItemIds };
