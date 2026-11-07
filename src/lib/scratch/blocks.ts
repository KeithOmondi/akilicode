/**
 * The block set: a Scratch-style kit built with Blockly.
 * - definitions: what each block looks like
 * - toolbox:     the categories a child picks blocks from
 * - generators:  how each block becomes code for the stage runtime (runtime.ts)
 *
 * Children can only use these blocks, so the generated code is always code WE wrote the pieces of.
 */
import * as Blockly from "blockly/core";
import "blockly/blocks";
import { javascriptGenerator, Order } from "blockly/javascript";
import * as En from "blockly/msg/en";

export const COLORS = {
  events: "#FFBF00",
  motion: "#4C97FF",
  looks: "#9966FF",
  sound: "#CF63CF",
  control: "#FFAB19",
  sensing: "#5CB1D6",
  operators: "#59C059",
  variables: "#FF8C1A",
  myBlocks: "#FF6680",
} as const;

const KEY_NAMES: [string, string][] = [
  ["space", "space"], ["up arrow", "up"], ["down arrow", "down"], ["left arrow", "left"], ["right arrow", "right"], ["enter", "enter"],
  ...Array.from("abcdefghijklmnopqrstuvwxyz0123456789").map((c): [string, string] => [c, c]),
];
/** Keys for "when key pressed" and "key pressed?" (any key is also allowed). */
const KEYS: [string, string][] = [["any", "any"], ...KEY_NAMES];
const COSTUMES: [string, string][] = [
  ["🐱 cat", "🐱"], ["🐶 dog", "🐶"], ["🐰 rabbit", "🐰"], ["🐸 frog", "🐸"], ["🦄 unicorn", "🦄"], ["🐢 turtle", "🐢"],
  ["🤖 robot", "🤖"], ["🚀 rocket", "🚀"], ["👾 alien", "👾"], ["⚽ ball", "⚽"], ["🍎 apple", "🍎"], ["⭐ star", "⭐"],
  ["🐠 fish", "🐠"], ["🦁 lion", "🦁"], ["🚗 car", "🚗"], ["🧑‍🚀 astronaut", "🧑‍🚀"],
];
const BACKDROPS: [string, string][] = [
  ["white", "#ffffff"], ["sky", "#bfe3ff"], ["grass", "#c8f0b0"], ["sand", "#f5e3b3"], ["night", "#1c2541"], ["sunset", "#ffb38a"], ["pink", "#ffd1e8"],
];
/** Sound effects the stage can make (it builds them from tones and noise, so there are no files to load). */
const SOUND_EFFECTS: [string, string][] = [
  // plain names: Blockly measures emoji badly, and the dropdown then overlaps the words next to it
  ["pop", "pop"], ["meow", "meow"], ["woof", "woof"], ["coin", "coin"], ["laser", "laser"], ["jump", "jump"],
  ["drum", "drum"], ["clap", "clap"], ["bell", "bell"], ["boing", "boing"], ["win", "win"], ["lose", "lose"],
];
const NOTES: [string, string][] = [
  ["C", "261.63"], ["D", "293.66"], ["E", "329.63"], ["F", "349.23"], ["G", "392"], ["A", "440"], ["B", "493.88"], ["high C", "523.25"],
];
/** Messages sprites can send each other ("broadcast" / "when I receive"). */
const MESSAGES: [string, string][] = [
  ["go", "go"], ["start", "start"], ["next", "next"], ["stop", "stop"], ["win", "win"], ["lose", "lose"], ["hello", "hello"], ["bye", "bye"], ["message1", "message1"], ["message2", "message2"],
];
const EFFECTS: [string, string][] = [["color", "color"], ["brightness", "brightness"], ["ghost", "ghost"]];
const ROTATIONS: [string, string][] = [["left-right", "lr"], ["don't rotate", "none"], ["all around", "all"]];
const CLOCK: [string, string][] = [["year", "year"], ["month", "month"], ["date", "date"], ["day of week", "dayofweek"], ["hour", "hour"], ["minute", "minute"], ["second", "second"]];
const PROPERTIES: [string, string][] = [["x position", "x"], ["y position", "y"], ["direction", "direction"], ["costume number", "costumenumber"], ["costume name", "costumename"], ["size", "size"]];

/** What a hat block turns into: the event the stage listens for. */
const HATS: Record<string, (b: Blockly.Block) => string> = {
  ev_flag: () => "flag",
  ev_click: () => "click",
  ev_key: (b) => `key:${b.getFieldValue("KEY")}`,
  ev_receive: (b) => `msg:${b.getFieldValue("MSG")}`,
  ev_backdrop: (b) => `backdrop:${b.getFieldValue("C")}`,
  ev_clone: () => "clone",
};

/** The sprites of the project being edited (the "touching", "go to", "point towards" ... blocks list them). Set by the studio. */
let spriteChoices: [string, string][] = [];
export const setSpriteChoices = (sprites: { id: string; name: string }[]) => {
  spriteChoices = sprites.map((sp) => [sp.name, sp.id]);
};
/** A dropdown of special targets followed by the project's sprites (read each time it opens, so new sprites appear). */
const targets = (special: [string, string][]) => () => [...special, ...spriteChoices] as [string, string][];
const spritesOnly = () => (spriteChoices.length ? spriteChoices : [["(no sprites)", "none"]]) as [string, string][];

/** The costumes of the sprite being edited ("switch costume to ..." lists them). Set by the studio. */
let costumeChoices: [string, string][] = [];
export const setCostumeChoices = (costumes: { id: string; name: string }[]) => {
  costumeChoices = costumes.map((c) => [c.name, c.id]);
};
/** Sprite ids in order, while compiling (the stage knows sprites by number). */
let compileIds: string[] = [];

/** The green flag, as a picture for the "when flag clicked" block. */
export const FLAG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M5 3v18" stroke="#3b7d3b" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M5.5 4.5c3-1.8 5.5 1.8 9 0 1.6-.8 3-.7 4.5 0v8c-1.5-.7-2.9-.8-4.5 0-3.5 1.8-6-1.8-9 0z" fill="#4cbf56" stroke="#2f8f3a" stroke-width="1.2" stroke-linejoin="round"/></svg>`;
export const FLAG_URI = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(FLAG_SVG)}`;

let registered = false;

/** Set Blockly up once: language, block definitions and generators. Safe to call many times. */
export const registerBlocks = () => {
  if (registered) return;
  registered = true;
  Blockly.setLocale(En as unknown as { [key: string]: string });

  // In Blockly, clicking a block in the palette drops a copy into the coding area. In Scratch it just runs the block
  // (the studio does that), so a click must not add blocks to the program.
  const gesture = Blockly.Gesture.prototype as unknown as { doBlockClick: () => void; flyout?: { autoClose?: boolean } };
  const originalBlockClick = gesture.doBlockClick;
  gesture.doBlockClick = function (this: typeof gesture) {
    if (this.flyout?.autoClose) return;
    originalBlockClick.call(this);
  };

  const stack = { previousStatement: null, nextStatement: null } as const;
  const terminal = { previousStatement: null } as const; // a stack block that ends the script
  const num = (name: string) => ({ type: "input_value", name, check: "Number" });
  const any = (name: string) => ({ type: "input_value", name });
  const drop = (name: string, options: [string, string][] | (() => [string, string][])) => ({ type: "field_dropdown", name, options });
  const reporter = (type: string, message0: string, colour: string, args0: object[] = [], output: string | null = "Number") => ({ type, message0, ...(args0.length ? { args0 } : {}), output, colour });

  Blockly.common.defineBlocksWithJsonArray([
    // events
    { type: "ev_flag", message0: "when %1 clicked", args0: [{ type: "field_image", src: FLAG_URI, width: 22, height: 22, alt: "green flag" }], nextStatement: null, colour: COLORS.events },
    { type: "ev_key", message0: "when %1 key pressed", args0: [drop("KEY", KEYS)], nextStatement: null, colour: COLORS.events },
    { type: "ev_click", message0: "when this sprite clicked", nextStatement: null, colour: COLORS.events },
    { type: "ev_backdrop", message0: "when backdrop switches to %1", args0: [drop("C", BACKDROPS)], nextStatement: null, colour: COLORS.events },
    { type: "ev_receive", message0: "when I receive %1", args0: [drop("MSG", MESSAGES)], nextStatement: null, colour: COLORS.events },
    { type: "ev_broadcast", message0: "broadcast %1", args0: [drop("MSG", MESSAGES)], ...stack, colour: COLORS.events },
    { type: "ev_broadcast_wait", message0: "broadcast %1 and wait", args0: [drop("MSG", MESSAGES)], ...stack, colour: COLORS.events },

    // motion
    { type: "mo_move", message0: "move %1 steps", args0: [num("N")], ...stack, colour: COLORS.motion },
    { type: "mo_turn_right", message0: "turn ↻ %1 degrees", args0: [num("N")], ...stack, colour: COLORS.motion },
    { type: "mo_turn_left", message0: "turn ↺ %1 degrees", args0: [num("N")], ...stack, colour: COLORS.motion },
    { type: "mo_goto_target", message0: "go to %1", args0: [drop("T", targets([["random position", "_random_"], ["mouse-pointer", "_mouse_"]]))], ...stack, colour: COLORS.motion },
    { type: "mo_goto", message0: "go to x: %1 y: %2", args0: [num("X"), num("Y")], ...stack, colour: COLORS.motion },
    { type: "mo_glide_target", message0: "glide %1 secs to %2", args0: [num("SECS"), drop("T", targets([["random position", "_random_"], ["mouse-pointer", "_mouse_"]]))], ...stack, colour: COLORS.motion },
    { type: "mo_glide", message0: "glide %1 secs to x: %2 y: %3", args0: [num("SECS"), num("X"), num("Y")], ...stack, colour: COLORS.motion },
    { type: "mo_point", message0: "point in direction %1", args0: [num("N")], ...stack, colour: COLORS.motion },
    { type: "mo_point_towards", message0: "point towards %1", args0: [drop("T", targets([["mouse-pointer", "_mouse_"]]))], ...stack, colour: COLORS.motion },
    { type: "mo_change_x", message0: "change x by %1", args0: [num("N")], ...stack, colour: COLORS.motion },
    { type: "mo_change_y", message0: "change y by %1", args0: [num("N")], ...stack, colour: COLORS.motion },
    { type: "mo_set_x", message0: "set x to %1", args0: [num("N")], ...stack, colour: COLORS.motion },
    { type: "mo_set_y", message0: "set y to %1", args0: [num("N")], ...stack, colour: COLORS.motion },
    { type: "mo_bounce", message0: "if on edge, bounce", ...stack, colour: COLORS.motion },
    { type: "mo_rotation_style", message0: "set rotation style %1", args0: [drop("R", ROTATIONS)], ...stack, colour: COLORS.motion },

    // looks
    { type: "lo_say", message0: "say %1", args0: [any("MSG")], ...stack, colour: COLORS.looks },
    { type: "lo_say_for", message0: "say %1 for %2 seconds", args0: [any("MSG"), num("SECS")], ...stack, colour: COLORS.looks },
    { type: "lo_think", message0: "think %1", args0: [any("MSG")], ...stack, colour: COLORS.looks },
    { type: "lo_think_for", message0: "think %1 for %2 seconds", args0: [any("MSG"), num("SECS")], ...stack, colour: COLORS.looks },
    { type: "lo_costume2", message0: "switch costume to %1", args0: [drop("C", () => (costumeChoices.length ? costumeChoices : [["(no costumes)", "none"]]))], ...stack, colour: COLORS.looks },
    { type: "lo_next_costume", message0: "next costume", ...stack, colour: COLORS.looks },
    { type: "lo_costume", message0: "switch costume to %1", args0: [drop("C", COSTUMES)], ...stack, colour: COLORS.looks },
    { type: "lo_background", message0: "switch backdrop to %1", args0: [drop("C", BACKDROPS)], ...stack, colour: COLORS.looks },
    { type: "lo_next_backdrop", message0: "next backdrop", ...stack, colour: COLORS.looks },
    { type: "lo_change_size", message0: "change size by %1", args0: [num("N")], ...stack, colour: COLORS.looks },
    { type: "lo_set_size", message0: "set size to %1 %", args0: [num("N")], ...stack, colour: COLORS.looks },
    { type: "lo_change_effect", message0: "change %1 effect by %2", args0: [drop("E", EFFECTS), num("N")], ...stack, colour: COLORS.looks },
    { type: "lo_set_effect", message0: "set %1 effect to %2", args0: [drop("E", EFFECTS), num("N")], ...stack, colour: COLORS.looks },
    { type: "lo_clear_effects", message0: "clear graphic effects", ...stack, colour: COLORS.looks },
    { type: "lo_show", message0: "show", ...stack, colour: COLORS.looks },
    { type: "lo_hide", message0: "hide", ...stack, colour: COLORS.looks },
    { type: "lo_front", message0: "go to front layer", ...stack, colour: COLORS.looks },
    { type: "lo_back", message0: "go back %1 layers", args0: [num("N")], ...stack, colour: COLORS.looks },
    reporter("lo_costume_number", "costume number", COLORS.looks),
    reporter("lo_costume_name", "costume name", COLORS.looks, [], null),
    reporter("lo_backdrop_number", "backdrop number", COLORS.looks),
    reporter("lo_size", "size", COLORS.looks),

    // sound
    { type: "so_play", message0: "play sound %1 until done", args0: [drop("S", SOUND_EFFECTS)], ...stack, colour: COLORS.sound },
    { type: "so_start", message0: "start sound %1", args0: [drop("S", SOUND_EFFECTS)], ...stack, colour: COLORS.sound },
    { type: "so_stop", message0: "stop all sounds", ...stack, colour: COLORS.sound },
    { type: "so_note", message0: "play note %1 for %2 beats", args0: [drop("NOTE", NOTES), num("BEATS")], ...stack, colour: COLORS.sound },
    { type: "so_change_volume", message0: "change volume by %1", args0: [num("N")], ...stack, colour: COLORS.sound },
    { type: "so_set_volume", message0: "set volume to %1 %", args0: [num("N")], ...stack, colour: COLORS.sound },
    reporter("so_volume", "volume", COLORS.sound),

    // control
    { type: "co_wait", message0: "wait %1 seconds", args0: [num("SECS")], ...stack, colour: COLORS.control },
    { type: "co_repeat", message0: "repeat %1 %2", args0: [num("N"), { type: "input_statement", name: "DO" }], ...stack, colour: COLORS.control },
    { type: "co_forever", message0: "forever %1", args0: [{ type: "input_statement", name: "DO" }], previousStatement: null, colour: COLORS.control },
    { type: "co_if", message0: "if %1 then %2", args0: [{ type: "input_value", name: "COND", check: "Boolean" }, { type: "input_statement", name: "DO" }], ...stack, colour: COLORS.control },
    { type: "co_if_else", message0: "if %1 then %2 else %3", args0: [{ type: "input_value", name: "COND", check: "Boolean" }, { type: "input_statement", name: "DO" }, { type: "input_statement", name: "ELSE" }], ...stack, colour: COLORS.control },
    { type: "co_wait_until", message0: "wait until %1", args0: [{ type: "input_value", name: "COND", check: "Boolean" }], ...stack, colour: COLORS.control },
    { type: "co_repeat_until", message0: "repeat until %1 %2", args0: [{ type: "input_value", name: "COND", check: "Boolean" }, { type: "input_statement", name: "DO" }], ...stack, colour: COLORS.control },
    { type: "co_stop", message0: "stop all", ...terminal, colour: COLORS.control },
    { type: "co_stop_script", message0: "stop this script", ...terminal, colour: COLORS.control },
    { type: "ev_clone", message0: "when I start as a clone", nextStatement: null, colour: COLORS.control },
    { type: "co_create_clone", message0: "create clone of %1", args0: [drop("T", targets([["myself", "_myself_"]]))], ...stack, colour: COLORS.control },
    { type: "co_delete_clone", message0: "delete this clone", ...terminal, colour: COLORS.control },

    // sensing
    { type: "se_touching", message0: "touching %1 ?", args0: [drop("WHO", targets([["mouse-pointer", "_mouse_"], ["edge", "_edge_"]]))], output: "Boolean", colour: COLORS.sensing },
    { type: "se_touching_edge", message0: "touching edge?", output: "Boolean", colour: COLORS.sensing },
    reporter("se_distance", "distance to %1", COLORS.sensing, [drop("T", targets([["mouse-pointer", "_mouse_"]]))]),
    { type: "se_ask", message0: "ask %1 and wait", args0: [any("Q")], ...stack, colour: COLORS.sensing },
    reporter("se_answer", "answer", COLORS.sensing, [], null),
    { type: "se_key_pressed", message0: "key %1 pressed?", args0: [drop("KEY", KEYS)], output: "Boolean", colour: COLORS.sensing },
    { type: "se_mouse_down", message0: "mouse down?", output: "Boolean", colour: COLORS.sensing },
    reporter("se_mouse_x", "mouse x", COLORS.sensing),
    reporter("se_mouse_y", "mouse y", COLORS.sensing),
    reporter("se_timer", "timer", COLORS.sensing),
    { type: "se_reset_timer", message0: "reset timer", ...stack, colour: COLORS.sensing },
    reporter("se_of", "%1 of %2", COLORS.sensing, [drop("P", PROPERTIES), drop("T", spritesOnly)], null),
    reporter("se_current", "current %1", COLORS.sensing, [drop("W", CLOCK)]),
    reporter("se_days", "days since 2000", COLORS.sensing),
    reporter("se_x", "x position", COLORS.sensing),
    reporter("se_y", "y position", COLORS.sensing),
    reporter("se_direction", "direction", COLORS.sensing),

    // operators (the maths and text blocks that come with Blockly cover + - × ÷, random, compare, and, or, not, join ...)
    reporter("op_letter", "letter %1 of %2", COLORS.operators, [num("N"), any("S")], null),
    reporter("op_length", "length of %1", COLORS.operators, [any("S")]),
    { type: "op_contains", message0: "%1 contains %2 ?", args0: [any("A"), any("B")], output: "Boolean", colour: COLORS.operators },
  ]);

  // Hat blocks: the "cap" shape on top (no previous connection).
  for (const t of Object.keys(HATS)) {
    const original = Blockly.Blocks[t].init;
    Blockly.Blocks[t].init = function (this: Blockly.Block) {
      original.call(this);
      (this as unknown as { hat?: string }).hat = "cap";
    };
  }

  // ── generators ─────────────────────────────────────────────────────────────
  const g = javascriptGenerator;
  // a child's variable or block name must never be able to hide the stage commands
  g.addReservedWords("S,Math,String,Number,window,document,Date,Promise");
  const value = (b: Blockly.Block, name: string, fallback = "0") => g.valueToCode(b, name, Order.NONE) || fallback;
  const simple = (type: string, fn: (b: Blockly.Block) => string) => {
    g.forBlock[type] = (b) => `${fn(b)}\n`;
  };
  const reports = (type: string, fn: (b: Blockly.Block) => string) => {
    g.forBlock[type] = (b) => [fn(b), Order.FUNCTION_CALL];
  };
  /** A dropdown target ("mouse-pointer", "random position", a sprite ...) as the stage understands it. */
  const target = (b: Blockly.Block, field: string): string => {
    const v = String(b.getFieldValue(field));
    if (v.startsWith("_")) return JSON.stringify(v);
    const i = compileIds.indexOf(v);
    return i < 0 ? JSON.stringify("_none_") : String(i);
  };
  const text = (b: Blockly.Block, field: string) => JSON.stringify(String(b.getFieldValue(field)));

  // events
  simple("ev_broadcast", (b) => `S.broadcast(${text(b, "MSG")});`);
  simple("ev_broadcast_wait", (b) => `await S.broadcastAndWait(${text(b, "MSG")});`);

  // motion
  simple("mo_move", (b) => `S.move(${value(b, "N")});`);
  simple("mo_turn_right", (b) => `S.turn(${value(b, "N")});`);
  simple("mo_turn_left", (b) => `S.turn(-(${value(b, "N")}));`);
  simple("mo_goto", (b) => `S.goTo(${value(b, "X")}, ${value(b, "Y")});`);
  simple("mo_goto_target", (b) => `S.goToTarget(${target(b, "T")});`);
  simple("mo_glide", (b) => `await S.glide(${value(b, "SECS", "1")}, ${value(b, "X")}, ${value(b, "Y")});`);
  simple("mo_glide_target", (b) => `await S.glideToTarget(${value(b, "SECS", "1")}, ${target(b, "T")});`);
  simple("mo_point", (b) => `S.pointDir(${value(b, "N")});`);
  simple("mo_point_towards", (b) => `S.pointTowards(${target(b, "T")});`);
  simple("mo_change_x", (b) => `S.changeX(${value(b, "N")});`);
  simple("mo_change_y", (b) => `S.changeY(${value(b, "N")});`);
  simple("mo_set_x", (b) => `S.setX(${value(b, "N")});`);
  simple("mo_set_y", (b) => `S.setY(${value(b, "N")});`);
  simple("mo_bounce", () => "S.bounce();");
  simple("mo_rotation_style", (b) => `S.setRotation(${text(b, "R")});`);

  // looks
  simple("lo_say", (b) => `S.say(${value(b, "MSG", "''")});`);
  simple("lo_say_for", (b) => `await S.sayFor(${value(b, "MSG", "''")}, ${value(b, "SECS", "2")});`);
  simple("lo_think", (b) => `S.think(${value(b, "MSG", "''")});`);
  simple("lo_think_for", (b) => `await S.thinkFor(${value(b, "MSG", "''")}, ${value(b, "SECS", "2")});`);
  simple("lo_set_size", (b) => `S.setSize(${value(b, "N", "100")});`);
  simple("lo_change_size", (b) => `S.changeSize(${value(b, "N")});`);
  simple("lo_set_effect", (b) => `S.setEffect(${text(b, "E")}, ${value(b, "N")});`);
  simple("lo_change_effect", (b) => `S.changeEffect(${text(b, "E")}, ${value(b, "N")});`);
  simple("lo_clear_effects", () => "S.clearEffects();");
  simple("lo_show", () => "S.show();");
  simple("lo_hide", () => "S.hide();");
  simple("lo_front", () => "S.toFront();");
  simple("lo_back", (b) => `S.back(${value(b, "N", "1")});`);
  simple("lo_costume2", (b) => `S.costume(${text(b, "C")});`);
  simple("lo_next_costume", () => "S.nextCostume();");
  simple("lo_costume", (b) => `S.costume(${text(b, "C")});`);
  simple("lo_background", (b) => `S.background(${text(b, "C")});`);
  simple("lo_next_backdrop", () => "S.nextBackdrop();");
  reports("lo_costume_number", () => "S.costumeNumber()");
  reports("lo_costume_name", () => "S.costumeName()");
  reports("lo_backdrop_number", () => "S.backdropNumber()");
  reports("lo_size", () => "S.size()");

  // sound
  simple("so_play", (b) => `await S.playSound(${text(b, "S")});`);
  simple("so_start", (b) => `S.startSound(${text(b, "S")});`);
  simple("so_stop", () => "S.stopSounds();");
  simple("so_note", (b) => `await S.note(${Number(b.getFieldValue("NOTE")) || 261.63}, ${value(b, "BEATS", "1")});`);
  simple("so_change_volume", (b) => `S.changeVolume(${value(b, "N")});`);
  simple("so_set_volume", (b) => `S.setVolume(${value(b, "N", "100")});`);
  reports("so_volume", () => "S.volume()");

  // control
  simple("co_wait", (b) => `await S.wait(${value(b, "SECS", "1")});`);
  simple("co_wait_until", (b) => `while (S.running && !(${value(b, "COND", "false")})) await S.tick();`);
  simple("co_stop", () => "S.stop();\nreturn;");
  simple("co_stop_script", () => "return;");
  simple("co_create_clone", (b) => `S.createClone(${target(b, "T")});`);
  simple("co_delete_clone", () => "S.deleteClone();\nreturn;");

  // Every loop gives the stage one frame per turn, so loops animate and can never freeze the page.
  g.forBlock["co_repeat"] = (b, gen) => {
    const i = gen.nameDB_?.getDistinctName("count", Blockly.Names.NameType.VARIABLE) ?? "count";
    return `for (var ${i} = 0; ${i} < ${value(b, "N", "10")} && S.running; ${i}++) {\n${gen.statementToCode(b, "DO")}  await S.tick();\n}\n`;
  };
  g.forBlock["co_forever"] = (b, gen) => `while (S.running) {\n${gen.statementToCode(b, "DO")}  await S.tick();\n}\n`;
  g.forBlock["co_repeat_until"] = (b, gen) => `while (S.running && !(${value(b, "COND", "false")})) {\n${gen.statementToCode(b, "DO")}  await S.tick();\n}\n`;
  g.forBlock["co_if"] = (b, gen) => `if (${value(b, "COND", "false")}) {\n${gen.statementToCode(b, "DO")}}\n`;
  g.forBlock["co_if_else"] = (b, gen) => `if (${value(b, "COND", "false")}) {\n${gen.statementToCode(b, "DO")}} else {\n${gen.statementToCode(b, "ELSE")}}\n`;

  // sensing
  reports("se_touching_edge", () => "S.touchingEdge()");
  reports("se_touching", (b) => (compileIds.indexOf(String(b.getFieldValue("WHO"))) < 0 && !String(b.getFieldValue("WHO")).startsWith("_") ? "false" : `S.touching(${target(b, "WHO")})`));
  reports("se_distance", (b) => `S.distanceTo(${target(b, "T")})`);
  simple("se_ask", (b) => `await S.ask(${value(b, "Q", "''")});`);
  reports("se_answer", () => "S.answer()");
  reports("se_key_pressed", (b) => `S.keyDown(${text(b, "KEY")})`);
  reports("se_mouse_down", () => "S.mouseDown()");
  reports("se_mouse_x", () => "S.mouseX()");
  reports("se_mouse_y", () => "S.mouseY()");
  reports("se_timer", () => "S.timer()");
  simple("se_reset_timer", () => "S.resetTimer();");
  reports("se_of", (b) => `S.attrOf(${target(b, "T")}, ${text(b, "P")})`);
  reports("se_current", (b) => `S.current(${text(b, "W")})`);
  reports("se_days", () => "S.daysSince2000()");
  reports("se_x", () => "S.x()");
  reports("se_y", () => "S.y()");
  reports("se_direction", () => "S.direction()");

  // operators
  reports("op_letter", (b) => `String(${value(b, "S", "''")}).charAt(Math.max(0, Math.round(Number(${value(b, "N", "1")})) - 1))`);
  reports("op_length", (b) => `String(${value(b, "S", "''")}).length`);
  reports("op_contains", (b) => `String(${value(b, "A", "''")}).toLowerCase().includes(String(${value(b, "B", "''")}).toLowerCase())`);

  // My Blocks: a block the child makes. It becomes an async function, so it can wait, glide and so on.
  /** The names of the inputs a My Blocks block takes (Blockly keeps them in arguments_). */
  const parameterNames = (block: Blockly.Block): string[] => ((block as unknown as { arguments_?: string[] }).arguments_ ?? []).slice();
  type NameHelpers = { getProcedureName: (n: string) => string; getVariableName: (n: string) => string; definitions_: Record<string, string> };
  g.forBlock["procedures_defnoreturn"] = (block, gen) => {
    const h = gen as unknown as NameHelpers;
    const name = h.getProcedureName(block.getFieldValue("NAME"));
    const args = parameterNames(block).map((v) => h.getVariableName(v));
    h.definitions_["%" + name] = `async function ${name}(${args.join(", ")}) {\n${gen.statementToCode(block, "STACK")}}`;
    return null as unknown as string;
  };
  g.forBlock["procedures_callnoreturn"] = (block, gen) => {
    const h = gen as unknown as NameHelpers;
    const name = h.getProcedureName(block.getFieldValue("NAME"));
    const args = parameterNames(block).map((_, i) => gen.valueToCode(block, `ARG${i}`, Order.NONE) || "null");
    return `await ${name}(${args.join(", ")});\n`;
  };
};

const shadow = (type: string, fieldName: string, value: number | string) => ({ shadow: { type, fields: { [fieldName]: value } } });
const n = (v: number) => shadow("math_number", "NUM", v);
const t = (v: string) => shadow("text", "TEXT", v);
const blk = (type: string, inputs?: Record<string, unknown>) => ({ kind: "block", type, ...(inputs ? { inputs } : {}) });

/** The categories shown in the flyout, in Scratch's order. */
export const TOOLBOX = {
  kind: "categoryToolbox",
  contents: [
    {
      kind: "category", name: "Motion", colour: COLORS.motion, contents: [
        blk("mo_move", { N: n(10) }), blk("mo_turn_right", { N: n(15) }), blk("mo_turn_left", { N: n(15) }),
        blk("mo_goto_target"), blk("mo_goto", { X: n(0), Y: n(0) }),
        blk("mo_glide_target", { SECS: n(1) }), blk("mo_glide", { SECS: n(1), X: n(0), Y: n(0) }),
        blk("mo_point", { N: n(90) }), blk("mo_point_towards"),
        blk("mo_change_x", { N: n(10) }), blk("mo_set_x", { N: n(0) }), blk("mo_change_y", { N: n(10) }), blk("mo_set_y", { N: n(0) }),
        blk("mo_bounce"), blk("mo_rotation_style"), blk("se_x"), blk("se_y"), blk("se_direction"),
      ],
    },
    {
      kind: "category", name: "Looks", colour: COLORS.looks, contents: [
        blk("lo_say_for", { MSG: t("Hello!"), SECS: n(2) }), blk("lo_say", { MSG: t("Hello!") }),
        blk("lo_think_for", { MSG: t("Hmm..."), SECS: n(2) }), blk("lo_think", { MSG: t("Hmm...") }),
        blk("lo_costume2"), blk("lo_next_costume"), blk("lo_background"), blk("lo_next_backdrop"),
        blk("lo_change_size", { N: n(10) }), blk("lo_set_size", { N: n(100) }),
        blk("lo_change_effect", { N: n(25) }), blk("lo_set_effect", { N: n(0) }), blk("lo_clear_effects"),
        blk("lo_show"), blk("lo_hide"), blk("lo_front"), blk("lo_back", { N: n(1) }),
        blk("lo_costume_number"), blk("lo_costume_name"), blk("lo_backdrop_number"), blk("lo_size"),
      ],
    },
    {
      kind: "category", name: "Sound", colour: COLORS.sound, contents: [
        blk("so_play"), blk("so_start"), blk("so_stop"), blk("so_note", { BEATS: n(1) }),
        blk("so_change_volume", { N: n(-10) }), blk("so_set_volume", { N: n(100) }), blk("so_volume"),
      ],
    },
    {
      kind: "category", name: "Events", colour: COLORS.events, contents: [
        blk("ev_flag"), blk("ev_key"), blk("ev_click"), blk("ev_backdrop"), blk("ev_receive"), blk("ev_broadcast"), blk("ev_broadcast_wait"),
      ],
    },
    {
      kind: "category", name: "Control", colour: COLORS.control, contents: [
        blk("co_wait", { SECS: n(1) }), blk("co_repeat", { N: n(10) }), blk("co_forever"), blk("co_if"), blk("co_if_else"),
        blk("co_wait_until"), blk("co_repeat_until"), blk("co_stop"), blk("co_stop_script"),
        blk("ev_clone"), blk("co_create_clone"), blk("co_delete_clone"),
      ],
    },
    {
      kind: "category", name: "Sensing", colour: COLORS.sensing, contents: [
        blk("se_touching"), blk("se_distance"), blk("se_ask", { Q: t("What's your name?") }), blk("se_answer"),
        blk("se_key_pressed"), blk("se_mouse_down"), blk("se_mouse_x"), blk("se_mouse_y"),
        blk("se_timer"), blk("se_reset_timer"), blk("se_of"), blk("se_current"), blk("se_days"),
      ],
    },
    {
      kind: "category", name: "Operators", colour: COLORS.operators, contents: [
        blk("math_arithmetic", { A: n(1), B: n(1) }), blk("math_random_int", { FROM: n(1), TO: n(10) }),
        blk("logic_compare", { A: n(1), B: n(1) }), blk("logic_operation"), blk("logic_negate"), blk("logic_boolean"),
        blk("text_join", { ADD0: t("apple "), ADD1: t("banana") }), blk("op_letter", { N: n(1), S: t("apple") }), blk("op_length", { S: t("apple") }), blk("op_contains", { A: t("apple"), B: t("a") }),
        blk("math_modulo", { DIVIDEND: n(10), DIVISOR: n(3) }), blk("math_round", { NUM: n(3.6) }), blk("math_single", { NUM: n(9) }),
        blk("text", undefined),
      ],
    },
    { kind: "category", name: "Variables", colour: COLORS.variables, custom: "VARIABLE" },
    { kind: "category", name: "My Blocks", colour: COLORS.myBlocks, custom: "PROCEDURE" },
  ],
} as const;

/**
 * A costume is one picture of a sprite. `src` says where the picture comes from:
 *   "lib:<code>"  a picture from our sprite library (public/sprites/<code>.svg)
 *   "emoji:<x>"   an emoji drawn as text (older projects)
 *   "data:image/..." a picture the child painted or uploaded (stored inside the project)
 */
export interface Costume { id: string; name: string; src: string }
/** One sprite: a name, its costumes (the first is shown when the flag is pressed) and its own blocks. */
export interface SpriteData { id: string; name: string; costumes: Costume[]; /** which costume shows first (default 0) */ start?: number; blocks: object | null }
/** A saved block project. Older projects (a single workspace, or sprites with one emoji) are upgraded on load. */
export interface ProjectState { v: 3; sprites: SpriteData[] }

export const MAX_SPRITES = 8;
export const MAX_COSTUMES = 12;

const STARTER_BLOCKS = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: "ev_flag", x: 30, y: 30,
        next: {
          block: {
            type: "lo_say_for",
            inputs: { MSG: { shadow: { type: "text", fields: { TEXT: "Hello! I am your sprite." } } }, SECS: { shadow: { type: "math_number", fields: { NUM: 2 } } } },
            next: { block: { type: "mo_move", inputs: { N: { shadow: { type: "math_number", fields: { NUM: 100 } } } } } },
          },
        },
      },
    ],
  },
};

/** A new sprite starts with just the "when flag clicked" block, ready for blocks to be snapped under it. */
export const HAT_ONLY = { blocks: { languageVersion: 0, blocks: [{ type: "ev_flag", x: 30, y: 30 }] } };

/** A new block project starts with something that already works. */
export const STARTER_PROJECT: ProjectState = {
  v: 3,
  sprites: [{ id: "s1", name: "Cat", costumes: [{ id: "c1", name: "Cat", src: "lib:1f431" }, { id: "c2", name: "Happy cat", src: "lib:1f63a" }], blocks: STARTER_BLOCKS }],
};
/** Kept for old callers: the first sprite's starter blocks. */
export const STARTER_STATE = STARTER_BLOCKS;

const emojiName = (emoji: string) => COSTUMES.find(([, v]) => v === emoji)?.[0].replace(/^\S+\s*/, "") ?? "costume";

/** Accepts anything that was ever saved (nothing, an old single workspace, or a project) and returns a project. */
export const normalizeProject = (raw: unknown): ProjectState => {
  const r = raw as { sprites?: unknown } | null | undefined;
  if (r && Array.isArray(r.sprites) && r.sprites.length) {
    const seen = new Set<string>();
    const sprites = (r.sprites as (Partial<SpriteData> & { emoji?: string })[]).slice(0, MAX_SPRITES).map((sp, i) => {
      let id = typeof sp.id === "string" && sp.id ? sp.id : `s${i + 1}`;
      while (seen.has(id)) id += "x";
      seen.add(id);
      let costumes: Costume[] = Array.isArray(sp.costumes)
        ? sp.costumes.slice(0, MAX_COSTUMES).filter((c) => c && typeof c.src === "string").map((c, k) => ({ id: String(c.id || `c${k + 1}`), name: String(c.name || `costume${k + 1}`).slice(0, 30), src: c.src }))
        : [];
      if (!costumes.length) {
        // an older sprite: one emoji
        const emoji = String(sp.emoji || "🐱");
        costumes = [{ id: "c1", name: emojiName(emoji), src: `emoji:${emoji}` }];
      }
      const start = Number.isInteger(sp.start) && (sp.start as number) >= 0 && (sp.start as number) < costumes.length ? (sp.start as number) : 0;
      return { id, name: String(sp.name || `Sprite${i + 1}`).slice(0, 20), costumes, start, blocks: (sp.blocks as object | null) ?? null };
    });
    return { v: 3, sprites };
  }
  if (r && typeof r === "object" && "blocks" in r) {
    return { v: 3, sprites: [{ id: "s1", name: "Cat", costumes: [{ id: "c1", name: "cat", src: "emoji:🐱" }], blocks: raw as object }] };
  }
  return STARTER_PROJECT;
};

const indent = (code: string) => code.replace(/^(?=.)/gm, "  ");

/** My Blocks: generate every block definition of a workspace so that calls to them have something to call. */
const defineProcedures = (ws: Blockly.Workspace) => {
  for (const top of ws.getTopBlocks(false)) if (top.type.startsWith("procedures_def")) javascriptGenerator.blockToCode(top);
};

/**
 * The code for the stack a child just clicked (any block in it): like Scratch, the whole stack runs from its top
 * block. Under a hat block that means the blocks below the hat. A lone value block has nothing to run (null).
 */
export const compileStack = (block: Blockly.Block, spriteIds: string[], spriteIndex: number): string | null => {
  registerBlocks();
  compileIds = spriteIds;
  const root = block.getRootBlock();
  if (root.outputConnection) return null;
  javascriptGenerator.init(root.workspace);
  // A block clicked in the palette lives in the palette's own workspace; the blocks it calls are in the coding area.
  defineProcedures((root.workspace as unknown as { targetWorkspace?: Blockly.Workspace }).targetWorkspace ?? root.workspace);
  const first = HATS[root.type] ? root.getNextBlock() : root;
  const body = first ? (javascriptGenerator.blockToCode(first) as string) : "";
  return `(async function (S) {
${indent(javascriptGenerator.finish(body))}})(S.forSprite(${spriteIndex}));
`;
};

/** A stack of blocks that is not under a start block (and is not a lone value block): the flag never runs it. */
export const isLooseStack = (block: Blockly.Block): boolean => !HATS[block.type] && !block.type.startsWith("procedures_def") && !block.outputConnection && !block.getParent();

/** Which sprites have stacks of blocks that are not under a start block, and how many each. */
export const looseStacks = (raw: unknown): { id: string; name: string; count: number }[] => {
  registerBlocks();
  const found: { id: string; name: string; count: number }[] = [];
  for (const sp of normalizeProject(raw).sprites) {
    if (!sp.blocks) continue;
    const ws = new Blockly.Workspace();
    try {
      Blockly.serialization.workspaces.load(sp.blocks as never, ws);
      const count = ws.getTopBlocks(false).filter(isLooseStack).length;
      if (count) found.push({ id: sp.id, name: sp.name, count });
    } finally {
      ws.dispose();
    }
  }
  return found;
};

/** The code for ONE sprite's blocks. Only blocks under a hat block (flag, key, click) run, like in Scratch. */
const compileWorkspace = (state: object | null | undefined): string => {
  const ws = new Blockly.Workspace();
  try {
    if (state) Blockly.serialization.workspaces.load(state as never, ws);
    javascriptGenerator.init(ws);
    defineProcedures(ws);
    let handlers = "";
    for (const top of ws.getTopBlocks(true)) {
      const event = HATS[top.type]?.(top);
      if (!event) continue;
      const next = top.getNextBlock();
      const body = next ? (javascriptGenerator.blockToCode(next) as string) : "";
      handlers += `S.on(${JSON.stringify(event)}, async function (S) {
${indent(body)}});
`;
    }
    return javascriptGenerator.finish(handlers);
  } finally {
    ws.dispose();
  }
};

/** Turn a saved project (or an old single workspace) into the code the stage runs: one block of code per sprite. */
export const compileBlocks = (raw: unknown): string => {
  registerBlocks();
  const project = normalizeProject(raw);
  compileIds = project.sprites.map((sp) => sp.id);
  return project.sprites
    .map((sp, i) => `(function (S) {\n${indent(compileWorkspace(sp.blocks))}})(S.forSprite(${i}));\n`)
    .join("\n");
};

/** How many blocks are in a saved project (for "is there anything here?" checks). */
export const countBlocks = (raw: unknown): number =>
  normalizeProject(raw).sprites.reduce((sum, sp) => sum + ((sp.blocks as { blocks?: { blocks?: unknown[] } } | null)?.blocks?.blocks?.length ?? 0), 0);
