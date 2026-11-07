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
} as const;

const KEYS: [string, string][] = [
  ["space", "space"], ["up arrow", "up"], ["down arrow", "down"], ["left arrow", "left"], ["right arrow", "right"],
  ["w", "w"], ["a", "a"], ["s", "s"], ["d", "d"],
];
const COSTUMES: [string, string][] = [
  ["🐱 cat", "🐱"], ["🐶 dog", "🐶"], ["🐰 rabbit", "🐰"], ["🐸 frog", "🐸"], ["🦄 unicorn", "🦄"], ["🐢 turtle", "🐢"],
  ["🤖 robot", "🤖"], ["🚀 rocket", "🚀"], ["👾 alien", "👾"], ["⚽ ball", "⚽"], ["🍎 apple", "🍎"], ["⭐ star", "⭐"],
  ["🐠 fish", "🐠"], ["🦁 lion", "🦁"], ["🚗 car", "🚗"], ["🧑‍🚀 astronaut", "🧑‍🚀"],
];
const BACKDROPS: [string, string][] = [
  ["white", "#ffffff"], ["sky", "#bfe3ff"], ["grass", "#c8f0b0"], ["sand", "#f5e3b3"], ["night", "#1c2541"], ["sunset", "#ffb38a"], ["pink", "#ffd1e8"],
];
const NOTES: [string, string][] = [
  ["C", "261.63"], ["D", "293.66"], ["E", "329.63"], ["F", "349.23"], ["G", "392"], ["A", "440"], ["B", "493.88"], ["high C", "523.25"],
];

/** What a hat block turns into: the event the stage listens for. */
const HATS: Record<string, (b: Blockly.Block) => string> = {
  ev_flag: () => "flag",
  ev_click: () => "click",
  ev_key: (b) => `key:${b.getFieldValue("KEY")}`,
};

/** The sprites of the project being edited (the "touching" block lists them). Set by the studio. */
let spriteChoices: [string, string][] = [];
export const setSpriteChoices = (sprites: { id: string; name: string; emoji: string }[]) => {
  spriteChoices = sprites.map((sp) => [`${sp.emoji} ${sp.name}`, sp.id]);
};
/** Sprite ids in order, while compiling (the stage knows sprites by number). */
let compileIds: string[] = [];

let registered = false;

/** Set Blockly up once: language, block definitions and generators. Safe to call many times. */
export const registerBlocks = () => {
  if (registered) return;
  registered = true;
  Blockly.setLocale(En as unknown as { [key: string]: string });

  const stack = { previousStatement: null, nextStatement: null } as const;
  const num = (name: string) => ({ type: "input_value", name, check: "Number" });
  const any = (name: string) => ({ type: "input_value", name });

  Blockly.common.defineBlocksWithJsonArray([
    // events
    { type: "ev_flag", message0: "when 🏁 clicked", nextStatement: null, colour: COLORS.events },
    { type: "ev_key", message0: "when %1 key pressed", args0: [{ type: "field_dropdown", name: "KEY", options: KEYS }], nextStatement: null, colour: COLORS.events },
    { type: "ev_click", message0: "when this sprite clicked", nextStatement: null, colour: COLORS.events },

    // motion
    { type: "mo_move", message0: "move %1 steps", args0: [num("N")], ...stack, colour: COLORS.motion },
    { type: "mo_turn_right", message0: "turn ↻ %1 degrees", args0: [num("N")], ...stack, colour: COLORS.motion },
    { type: "mo_turn_left", message0: "turn ↺ %1 degrees", args0: [num("N")], ...stack, colour: COLORS.motion },
    { type: "mo_goto", message0: "go to x: %1 y: %2", args0: [num("X"), num("Y")], ...stack, colour: COLORS.motion },
    { type: "mo_point", message0: "point in direction %1", args0: [num("N")], ...stack, colour: COLORS.motion },
    { type: "mo_change_x", message0: "change x by %1", args0: [num("N")], ...stack, colour: COLORS.motion },
    { type: "mo_change_y", message0: "change y by %1", args0: [num("N")], ...stack, colour: COLORS.motion },
    { type: "mo_set_x", message0: "set x to %1", args0: [num("N")], ...stack, colour: COLORS.motion },
    { type: "mo_set_y", message0: "set y to %1", args0: [num("N")], ...stack, colour: COLORS.motion },
    { type: "mo_bounce", message0: "if on edge, bounce", ...stack, colour: COLORS.motion },

    // looks
    { type: "lo_say", message0: "say %1", args0: [any("MSG")], ...stack, colour: COLORS.looks },
    { type: "lo_say_for", message0: "say %1 for %2 seconds", args0: [any("MSG"), num("SECS")], ...stack, colour: COLORS.looks },
    { type: "lo_set_size", message0: "set size to %1 %", args0: [num("N")], ...stack, colour: COLORS.looks },
    { type: "lo_change_size", message0: "change size by %1", args0: [num("N")], ...stack, colour: COLORS.looks },
    { type: "lo_show", message0: "show", ...stack, colour: COLORS.looks },
    { type: "lo_hide", message0: "hide", ...stack, colour: COLORS.looks },
    { type: "lo_costume", message0: "switch costume to %1", args0: [{ type: "field_dropdown", name: "C", options: COSTUMES }], ...stack, colour: COLORS.looks },
    { type: "lo_background", message0: "switch backdrop to %1", args0: [{ type: "field_dropdown", name: "C", options: BACKDROPS }], ...stack, colour: COLORS.looks },

    // sound
    { type: "so_note", message0: "play note %1 for %2 beats", args0: [{ type: "field_dropdown", name: "NOTE", options: NOTES }, num("BEATS")], ...stack, colour: COLORS.sound },

    // control
    { type: "co_wait", message0: "wait %1 seconds", args0: [num("SECS")], ...stack, colour: COLORS.control },
    { type: "co_repeat", message0: "repeat %1 %2", args0: [num("N"), { type: "input_statement", name: "DO" }], ...stack, colour: COLORS.control },
    { type: "co_forever", message0: "forever %1", args0: [{ type: "input_statement", name: "DO" }], previousStatement: null, colour: COLORS.control },
    { type: "co_if", message0: "if %1 then %2", args0: [{ type: "input_value", name: "COND", check: "Boolean" }, { type: "input_statement", name: "DO" }], ...stack, colour: COLORS.control },
    { type: "co_if_else", message0: "if %1 then %2 else %3", args0: [{ type: "input_value", name: "COND", check: "Boolean" }, { type: "input_statement", name: "DO" }, { type: "input_statement", name: "ELSE" }], ...stack, colour: COLORS.control },
    { type: "co_repeat_until", message0: "repeat until %1 %2", args0: [{ type: "input_value", name: "COND", check: "Boolean" }, { type: "input_statement", name: "DO" }], ...stack, colour: COLORS.control },
    { type: "co_stop", message0: "stop all", previousStatement: null, colour: COLORS.control },

    // sensing
    { type: "se_touching_edge", message0: "touching edge?", output: "Boolean", colour: COLORS.sensing },
    { type: "se_key_pressed", message0: "key %1 pressed?", args0: [{ type: "field_dropdown", name: "KEY", options: KEYS }], output: "Boolean", colour: COLORS.sensing },
    { type: "se_touching", message0: "touching %1 ?", args0: [{ type: "field_dropdown", name: "WHO", options: () => (spriteChoices.length ? spriteChoices : [["(no sprites)", "none"]]) }], output: "Boolean", colour: COLORS.sensing },
    { type: "se_x", message0: "x position", output: "Number", colour: COLORS.sensing },
    { type: "se_y", message0: "y position", output: "Number", colour: COLORS.sensing },
    { type: "se_direction", message0: "direction", output: "Number", colour: COLORS.sensing },
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
  const value = (b: Blockly.Block, name: string, fallback = "0") => g.valueToCode(b, name, Order.NONE) || fallback;
  const simple = (type: string, fn: (b: Blockly.Block) => string) => {
    g.forBlock[type] = (b) => `${fn(b)}\n`;
  };

  simple("mo_move", (b) => `S.move(${value(b, "N")});`);
  simple("mo_turn_right", (b) => `S.turn(${value(b, "N")});`);
  simple("mo_turn_left", (b) => `S.turn(-(${value(b, "N")}));`);
  simple("mo_goto", (b) => `S.goTo(${value(b, "X")}, ${value(b, "Y")});`);
  simple("mo_point", (b) => `S.pointDir(${value(b, "N")});`);
  simple("mo_change_x", (b) => `S.changeX(${value(b, "N")});`);
  simple("mo_change_y", (b) => `S.changeY(${value(b, "N")});`);
  simple("mo_set_x", (b) => `S.setX(${value(b, "N")});`);
  simple("mo_set_y", (b) => `S.setY(${value(b, "N")});`);
  simple("mo_bounce", () => "S.bounce();");

  simple("lo_say", (b) => `S.say(${value(b, "MSG", "''")});`);
  simple("lo_say_for", (b) => `await S.sayFor(${value(b, "MSG", "''")}, ${value(b, "SECS", "2")});`);
  simple("lo_set_size", (b) => `S.setSize(${value(b, "N", "100")});`);
  simple("lo_change_size", (b) => `S.changeSize(${value(b, "N")});`);
  simple("lo_show", () => "S.show();");
  simple("lo_hide", () => "S.hide();");
  simple("lo_costume", (b) => `S.costume(${JSON.stringify(b.getFieldValue("C"))});`);
  simple("lo_background", (b) => `S.background(${JSON.stringify(b.getFieldValue("C"))});`);
  simple("so_note", (b) => `await S.note(${Number(b.getFieldValue("NOTE")) || 261.63}, ${value(b, "BEATS", "1")});`);
  simple("co_wait", (b) => `await S.wait(${value(b, "SECS", "1")});`);
  simple("co_stop", () => "S.stop();\nreturn;");

  // Every loop gives the stage one frame per turn, so loops animate and can never freeze the page.
  g.forBlock["co_repeat"] = (b, gen) => {
    const i = gen.nameDB_?.getDistinctName("count", Blockly.Names.NameType.VARIABLE) ?? "count";
    return `for (var ${i} = 0; ${i} < ${value(b, "N", "10")}; ${i}++) {\n${gen.statementToCode(b, "DO")}  await S.tick();\n}\n`;
  };
  g.forBlock["co_forever"] = (b, gen) => `while (S.running) {\n${gen.statementToCode(b, "DO")}  await S.tick();\n}\n`;
  g.forBlock["co_repeat_until"] = (b, gen) => `while (S.running && !(${value(b, "COND", "false")})) {\n${gen.statementToCode(b, "DO")}  await S.tick();\n}\n`;
  g.forBlock["co_if"] = (b, gen) => `if (${value(b, "COND", "false")}) {\n${gen.statementToCode(b, "DO")}}\n`;
  g.forBlock["co_if_else"] = (b, gen) => `if (${value(b, "COND", "false")}) {\n${gen.statementToCode(b, "DO")}} else {\n${gen.statementToCode(b, "ELSE")}}\n`;

  g.forBlock["se_touching_edge"] = () => ["S.touchingEdge()", Order.FUNCTION_CALL];
  g.forBlock["se_touching"] = (b) => {
    const i = compileIds.indexOf(String(b.getFieldValue("WHO")));
    return [i < 0 ? "false" : `S.touching(${i})`, Order.FUNCTION_CALL];
  };
  g.forBlock["se_key_pressed"] = (b) => [`S.keyDown(${JSON.stringify(b.getFieldValue("KEY"))})`, Order.FUNCTION_CALL];
  g.forBlock["se_x"] = () => ["S.x()", Order.FUNCTION_CALL];
  g.forBlock["se_y"] = () => ["S.y()", Order.FUNCTION_CALL];
  g.forBlock["se_direction"] = () => ["S.direction()", Order.FUNCTION_CALL];
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
        blk("mo_goto", { X: n(0), Y: n(0) }), blk("mo_point", { N: n(90) }),
        blk("mo_change_x", { N: n(10) }), blk("mo_change_y", { N: n(10) }), blk("mo_set_x", { N: n(0) }), blk("mo_set_y", { N: n(0) }),
        blk("mo_bounce"), blk("se_x"), blk("se_y"), blk("se_direction"),
      ],
    },
    {
      kind: "category", name: "Looks", colour: COLORS.looks, contents: [
        blk("lo_say", { MSG: t("Hello!") }), blk("lo_say_for", { MSG: t("Hello!"), SECS: n(2) }),
        blk("lo_costume"), blk("lo_background"), blk("lo_set_size", { N: n(100) }), blk("lo_change_size", { N: n(10) }), blk("lo_show"), blk("lo_hide"),
      ],
    },
    { kind: "category", name: "Sound", colour: COLORS.sound, contents: [blk("so_note", { BEATS: n(1) })] },
    { kind: "category", name: "Events", colour: COLORS.events, contents: [blk("ev_flag"), blk("ev_key"), blk("ev_click")] },
    {
      kind: "category", name: "Control", colour: COLORS.control, contents: [
        blk("co_wait", { SECS: n(1) }), blk("co_repeat", { N: n(10) }), blk("co_forever"), blk("co_if"), blk("co_if_else"), blk("co_repeat_until"), blk("co_stop"),
      ],
    },
    { kind: "category", name: "Sensing", colour: COLORS.sensing, contents: [blk("se_touching"), blk("se_touching_edge"), blk("se_key_pressed")] },
    {
      kind: "category", name: "Operators", colour: COLORS.operators, contents: [
        blk("math_arithmetic", { A: n(1), B: n(1) }), blk("math_random_int", { FROM: n(1), TO: n(10) }),
        blk("logic_compare", { A: n(1), B: n(1) }), blk("logic_operation"), blk("logic_negate"), blk("logic_boolean"),
        blk("text_join"), blk("text", undefined),
      ],
    },
    { kind: "category", name: "Variables", colour: COLORS.variables, custom: "VARIABLE" },
  ],
} as const;

/** One sprite: a name, a picture (an emoji) and its own blocks. */
export interface SpriteData { id: string; name: string; emoji: string; blocks: object | null }
/** A saved block project. (Older projects were just one Blockly workspace; those become a single "Cat" sprite.) */
export interface ProjectState { v: 2; sprites: SpriteData[] }

export const SPRITE_PICTURES = ["🐱", "🐶", "🐰", "🐸", "🦄", "🐢", "🤖", "🚀", "👾", "⚽", "🍎", "⭐", "🐠", "🦁", "🚗", "🧑‍🚀"];
export const MAX_SPRITES = 6;

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

/** A new block project starts with something that already works. */
export const STARTER_PROJECT: ProjectState = { v: 2, sprites: [{ id: "s1", name: "Cat", emoji: "🐱", blocks: STARTER_BLOCKS }] };
/** Kept for old callers: the first sprite's starter blocks. */
export const STARTER_STATE = STARTER_BLOCKS;

/** Accepts anything that was ever saved (nothing, an old single workspace, or a project) and returns a project. */
export const normalizeProject = (raw: unknown): ProjectState => {
  const r = raw as { sprites?: unknown } | null | undefined;
  if (r && Array.isArray(r.sprites) && r.sprites.length) {
    const seen = new Set<string>();
    const sprites = (r.sprites as Partial<SpriteData>[]).slice(0, MAX_SPRITES).map((sp, i) => {
      let id = typeof sp.id === "string" && sp.id ? sp.id : `s${i + 1}`;
      while (seen.has(id)) id += "x";
      seen.add(id);
      return { id, name: String(sp.name || `Sprite${i + 1}`).slice(0, 20), emoji: String(sp.emoji || "🐱"), blocks: (sp.blocks as object | null) ?? null };
    });
    return { v: 2, sprites };
  }
  if (r && typeof r === "object" && "blocks" in r) return { v: 2, sprites: [{ id: "s1", name: "Cat", emoji: "🐱", blocks: raw as object }] };
  return STARTER_PROJECT;
};

const indent = (code: string) => code.replace(/^(?=.)/gm, "  ");

/** The code for ONE sprite's blocks. Only blocks under a hat block (flag, key, click) run, like in Scratch. */
const compileWorkspace = (state: object | null | undefined): string => {
  const ws = new Blockly.Workspace();
  try {
    if (state) Blockly.serialization.workspaces.load(state as never, ws);
    javascriptGenerator.init(ws);
    let handlers = "";
    for (const top of ws.getTopBlocks(true)) {
      const event = HATS[top.type]?.(top);
      if (!event) continue;
      const next = top.getNextBlock();
      const body = next ? (javascriptGenerator.blockToCode(next) as string) : "";
      handlers += `S.on(${JSON.stringify(event)}, async function () {
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
    .map((sp, i) => `(function (S) {\n${indent(compileWorkspace(sp.blocks))}})(S.forSprite(${i}, ${JSON.stringify(sp.emoji)}));\n`)
    .join("\n");
};

/** How many blocks are in a saved project (for "is there anything here?" checks). */
export const countBlocks = (raw: unknown): number =>
  normalizeProject(raw).sprites.reduce((sum, sp) => sum + ((sp.blocks as { blocks?: { blocks?: unknown[] } } | null)?.blocks?.blocks?.length ?? 0), 0);
