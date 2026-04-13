/**
 * Fever Dream — Language Layer
 *
 * All player-facing prose lives here. No English strings in logic files.
 * Messages are organized by feature area with constant ID maps.
 */

import type { LanguageProvider } from '@sharpee/lang-en-us';

// ─── Message ID Constants ───────────────────────────────────────────

export const PerceptionMsg = {
  // Spectacles
  WEAR_SPECTACLES: 'story.spectacles.wear',
  ALREADY_WEARING: 'story.spectacles.already_wearing',
  CORRIDOR_REVEALED: 'story.spectacles.corridor_revealed',
  LAB_CASE_REVEALED: 'story.spectacles.lab_case_revealed',

  // Fungus consumption
  FUNGUS_CONSUMED: 'story.fungus.consumed',
  LAB_FLOOR_OPENS: 'story.fungus.lab_floor_opens',

  // Spray exposure
  SPRAY_EXPOSURE: 'story.spray.exposure',

  // Transformed descriptions (post-fungus)
  CHAIR_TRANSFORMED: 'story.transform.chair',
  TRAYS_TRANSFORMED: 'story.transform.trays',
  PIPES_TRANSFORMED: 'story.transform.pipes',
  CABINET_TRANSFORMED: 'story.transform.cabinet',
  JARS_TRANSFORMED: 'story.transform.jars',
  CORRIDOR_TRANSFORMED: 'story.transform.corridor',
  CISTERN_TRANSFORMED: 'story.transform.cistern',
} as const;

export const EndgameMsg = {
  WIN: 'story.endgame.win',
  FLOOD_DEATH: 'story.endgame.flood_death',
} as const;

export const ActionMsg = {
  // Breaking
  BREAK_GLASS: 'story.break.glass_case',
  BREAK_NOTHING: 'story.break.nothing',
  BREAK_NEED_TOOL: 'story.break.need_tool',
  BREAK_ALREADY: 'story.break.already_broken',
  BREAK_CANT: 'story.break.cant',

  // Valve
  VALVE_LEFT: 'story.valve.left',
  VALVE_RIGHT: 'story.valve.right_flood',
  VALVE_UNDIRECTED: 'story.valve.undirected',
  VALVE_ALREADY_DRAINED: 'story.valve.already_drained',
  VALVE_NOT_HERE: 'story.valve.not_here',

  // Basin
  BASIN_TOUCH: 'story.basin.touch',
  BASIN_NOT_HERE: 'story.basin.not_here',

  // Movement blocks
  DOWN_NO_SPECTACLES: 'story.move.no_trapdoor',
  SOUTH_NO_FUNGUS: 'story.move.no_south_exit',
  DOWN_NO_DRAIN: 'story.move.cistern_flooded',

  // Eating
  EAT_FUNGUS: 'story.eat.fungus',
} as const;

export const SmellMsg = {
  RECEIVING: 'story.smell.receiving',
  CORRIDOR_NORMAL: 'story.smell.corridor_normal',
  CORRIDOR_FUNGUS: 'story.smell.corridor_fungus',
  TREATMENT: 'story.smell.treatment',
  STAIRWELL: 'story.smell.stairwell',
  LABORATORY: 'story.smell.laboratory',
  COLD_STORAGE: 'story.smell.cold_storage',
  CISTERN_NORMAL: 'story.smell.cistern_normal',
  CISTERN_FUNGUS: 'story.smell.cistern_fungus',
  CISTERN_SPRAY: 'story.smell.cistern_spray',
  SOURCE_NORMAL: 'story.smell.source_normal',
  SOURCE_FUNGUS: 'story.smell.source_fungus',
  SOURCE_SPRAY: 'story.smell.source_spray',
} as const;

export const ListenMsg = {
  RECEIVING: 'story.listen.receiving',
  CORRIDOR_NORMAL: 'story.listen.corridor_normal',
  CORRIDOR_FUNGUS: 'story.listen.corridor_fungus',
  TREATMENT: 'story.listen.treatment',
  STAIRWELL: 'story.listen.stairwell',
  LABORATORY: 'story.listen.laboratory',
  COLD_STORAGE: 'story.listen.cold_storage',
  CISTERN_NORMAL: 'story.listen.cistern_normal',
  CISTERN_FUNGUS: 'story.listen.cistern_fungus',
  CISTERN_SPRAY: 'story.listen.cistern_spray',
  SOURCE_NORMAL: 'story.listen.source_normal',
  SOURCE_FUNGUS: 'story.listen.source_fungus',
  SOURCE_SPRAY: 'story.listen.source_spray',
} as const;

export const MiscMsg = {
  WOUND_OPENING: 'story.misc.wound_opening',
  SPECTACLES_HINT_COUNTER: 'story.spectacles.hint_counter',
} as const;


// ─── Registration ───────────────────────────────────────────────────

export function registerMessages(language: LanguageProvider): void {

  // ── Spectacles & Perception Gates ──

  language.addMessage(PerceptionMsg.WEAR_SPECTACLES,
    'You settle the spectacles on your nose. The lenses are thick, heavy. The room sharpens at its edges — details you missed before push forward into clarity.');

  language.addMessage(PerceptionMsg.ALREADY_WEARING,
    'You are already wearing the spectacles.');

  language.addMessage(PerceptionMsg.CORRIDOR_REVEALED,
    'With the spectacles on, you notice a seam in the floor tiles — too straight to be structural damage. A recessed handle is set into the frame. A trapdoor, already propped open.');

  language.addMessage(PerceptionMsg.LAB_CASE_REVEALED,
    'The spectacles reveal a small glass case mounted on the wall, previously invisible. Inside, a brass key hangs from a thin wire.');

  // ── Fungus ──

  language.addMessage(PerceptionMsg.FUNGUS_CONSUMED,
    'It tastes of nothing. Then of everything. The walls ripple once and settle into new shapes. You understand, now, that this is not distortion. This is clarity. The world has not changed. Your ability to see it has.');

  language.addMessage(PerceptionMsg.LAB_FLOOR_OPENS,
    'The floor at the south end of the laboratory splits open. Not cracks — a wound. The edges are smooth and glistening, like muscle tissue pulling apart. A dark shaft descends, lined with something that contracts slowly as you watch.');

  // ── Spray ──

  language.addMessage(PerceptionMsg.SPRAY_EXPOSURE,
    'A hiss from the cracked pipes overhead. Something cold and chemical settles on your skin, your eyes, your tongue. You blink. The letters on the sign shift. The walls flicker like a signal losing coherence.\n\nWhen your vision steadies, the world has not returned to normal. It has gone further.');

  // ── Transformed Descriptions ──

  language.addMessage(PerceptionMsg.CHAIR_TRANSFORMED,
    'It has four legs and a flat back. You know it is a chair. It does not look like a chair. Its leather is skin. Its restraints are tendons.');

  language.addMessage(PerceptionMsg.TRAYS_TRANSFORMED,
    'They are not steel. They are cartilage, smooth and pale, arranged like ribs along the wall.');

  language.addMessage(PerceptionMsg.PIPES_TRANSFORMED,
    'They pulse. The condensation is warm now, and slightly viscous. These are not pipes. They have never been pipes.');

  language.addMessage(PerceptionMsg.CABINET_TRANSFORMED,
    'What you called a cabinet is a cage of fused iron bones. It stands open like a chest cavity after surgery.');

  language.addMessage(PerceptionMsg.JARS_TRANSFORMED,
    'Not jars. Transparent sacs of membrane, each holding a dark shape that twitches when you look directly at it. They are alive. They have always been alive.');

  language.addMessage(PerceptionMsg.CORRIDOR_TRANSFORMED,
    'The tiles pulse faintly, expanding and contracting like something breathing. The cracks between them are veins. The hallway is a throat and you are inside it.');

  language.addMessage(PerceptionMsg.CISTERN_TRANSFORMED,
    'The bricks are teeth in a circular jaw. The water is a throat, swallowing and unswallowing. The pipes are arteries pulsing with non-water.');

  // ── Actions: Breaking ──

  language.addMessage(ActionMsg.BREAK_GLASS,
    'You swing the wrench. The glass shatters cleanly. The brass key drops into your hand.');

  language.addMessage(ActionMsg.BREAK_NOTHING,
    'There is nothing here to break.');

  language.addMessage(ActionMsg.BREAK_NEED_TOOL,
    'You rap your knuckles against the glass. It holds. You cannot break it with your bare hands.');

  language.addMessage(ActionMsg.BREAK_ALREADY,
    'The case is already shattered. Only fragments remain.');

  language.addMessage(ActionMsg.BREAK_CANT,
    'Violence will not help here.');

  // ── Actions: Valve ──

  language.addMessage(ActionMsg.VALVE_LEFT,
    'Metal screams against metal as you force the valve left. The water shudders, then begins to drain — slowly at first, then in a sudden rush. The dark water drops, revealing walls coated in pale slime. A drainage grate stands open in the floor, revealing a narrow passage descending further.');

  language.addMessage(ActionMsg.VALVE_RIGHT,
    'You turn the valve right. A deep groan echoes through the pipes.\n\nThe water surges in. It does not stop. It rises past your waist, your chest, your chin. The last thing you see is the ceiling, dark and receding.\n\nThe water fills the chamber. It does not stop.');

  language.addMessage(ActionMsg.VALVE_UNDIRECTED,
    'The handle can turn left or right. Choose carefully.');

  language.addMessage(ActionMsg.VALVE_ALREADY_DRAINED,
    'The valve is already turned. The cistern is drained.');

  language.addMessage(ActionMsg.VALVE_NOT_HERE,
    'There is no valve here.');

  // ── Actions: Basin ──

  language.addMessage(ActionMsg.BASIN_TOUCH,
    'You reach in. It reaches back.\n\nThe light expands. It fills your hands, your arms, your chest. You feel it behind your eyes — not heat, not cold, but recognition. The building above you does not exist. The rooms, the corridors, the instruments — they were always this. Membrane and bone and light, folded into shapes you could almost name.\n\nYou understand now. You have always been the patient. The treatment is complete.');

  language.addMessage(EndgameMsg.WIN,
    '*** You have won ***');

  language.addMessage(EndgameMsg.FLOOD_DEATH,
    '*** You have died ***');

  language.addMessage(ActionMsg.BASIN_NOT_HERE,
    'There is nothing like that here.');

  // ── Movement Blocks ──

  language.addMessage(ActionMsg.DOWN_NO_SPECTACLES,
    'The floor is solid tile. There is no way down.');

  language.addMessage(ActionMsg.SOUTH_NO_FUNGUS,
    'The south wall is solid. There is no exit that way.');

  language.addMessage(ActionMsg.DOWN_NO_DRAIN,
    'The grate is submerged under dark water. You cannot go down.');

  // ── Eating ──

  language.addMessage(ActionMsg.EAT_FUNGUS,
    'It tastes of nothing. Then of everything. The walls ripple once and settle into new shapes. You understand, now, that this is not distortion. This is clarity. The world has not changed. Your ability to see it has.');

  // ── Smell ──

  language.addMessage(SmellMsg.RECEIVING,
    'Iodine and old paper. Under that, something antiseptic and faintly sweet.');
  language.addMessage(SmellMsg.CORRIDOR_NORMAL,
    'Disinfectant, faded but still sharp enough to sting your sinuses.');
  language.addMessage(SmellMsg.CORRIDOR_FUNGUS,
    'Copper and salt. Living tissue.');
  language.addMessage(SmellMsg.TREATMENT,
    'Alcohol and rust. The drainage channels still carry a faint chemical residue.');
  language.addMessage(SmellMsg.STAIRWELL,
    'Damp concrete and old iron. The air thickens as you descend.');
  language.addMessage(SmellMsg.LABORATORY,
    'Formaldehyde and something sharper underneath. The handwriting on the labels smells faintly of ink.');
  language.addMessage(SmellMsg.COLD_STORAGE,
    'Cold. The amber fluid in the jars has a faint sweetness that clings to the back of your throat.');
  language.addMessage(SmellMsg.CISTERN_NORMAL,
    'Mineral water and old brick. The dampness has a weight to it.');
  language.addMessage(SmellMsg.CISTERN_FUNGUS,
    'Blood and mineral water. The chamber is a stomach.');
  language.addMessage(SmellMsg.CISTERN_SPRAY,
    'Y0u sm3ll... ch3micals. And s0meth1ng 3lse.');
  language.addMessage(SmellMsg.SOURCE_NORMAL,
    'Warm stone and something biological. The air is humid and close.');
  language.addMessage(SmellMsg.SOURCE_FUNGUS,
    'Warm stone and something biological. The air is humid and close, like breath.');
  language.addMessage(SmellMsg.SOURCE_SPRAY,
    'W@rm. It sm3lls w@rm.');

  // ── Listen ──

  language.addMessage(ListenMsg.RECEIVING,
    'The fluorescent tubes buzz. One flickers with a faint electrical tick.');
  language.addMessage(ListenMsg.CORRIDOR_NORMAL,
    'Your footsteps echo. Nothing else.');
  language.addMessage(ListenMsg.CORRIDOR_FUNGUS,
    'Breathing. Not yours.');
  language.addMessage(ListenMsg.TREATMENT,
    'A faint drip from the drainage channels. The chair leather creaks as if recently occupied.');
  language.addMessage(ListenMsg.STAIRWELL,
    'Water dripping from the pipes. The echo makes it sound like footsteps, always one floor below.');
  language.addMessage(ListenMsg.LABORATORY,
    'The hum of something electrical behind the walls. The cabinets rattle faintly.');
  language.addMessage(ListenMsg.COLD_STORAGE,
    'Your own breathing, amplified by the cold. The amber fluid in the jars is silent.');
  language.addMessage(ListenMsg.CISTERN_NORMAL,
    'Water lapping against brick. The pipes creak and settle.');
  language.addMessage(ListenMsg.CISTERN_FUNGUS,
    'The water speaks in a language of surface tension and resonance. You almost understand it.');
  language.addMessage(ListenMsg.CISTERN_SPRAY,
    'Dr1pp1ng. 0r is it a v0ice?');
  language.addMessage(ListenMsg.SOURCE_NORMAL,
    'A hum below the threshold of hearing. You feel it in your teeth and the bones of your wrists.');
  language.addMessage(ListenMsg.SOURCE_FUNGUS,
    'A hum below the threshold of hearing. You feel it in your teeth and the bones of your wrists. It is not a machine. It is patient.');
  language.addMessage(ListenMsg.SOURCE_SPRAY,
    'A hum. B3low h3aring. Y0u f33l it in y0ur t33th.');

  // ── Misc ──

  language.addMessage(MiscMsg.WOUND_OPENING,
    'Below you, a wound has opened in the floor of the laboratory. The edges are smooth and wet.');

  language.addMessage(MiscMsg.SPECTACLES_HINT_COUNTER,
    'Under the counter, scratched into the wood: THEY BUILT DOWN BEFORE THEY BUILT UP.');
}
