import { useEffect, useRef } from "react";
import * as Blockly from "blockly/core";
import { registerBlocks, TOOLBOX, COLORS } from "../../lib/scratch/blocks";

export type WorkspaceState = object;

interface Props {
  /** The saved blocks to start from (JSON from Blockly). */
  initialState: WorkspaceState | null;
  /** Called after every change that matters (not for scrolling or zooming). */
  onChange?: (state: WorkspaceState) => void;
  /** The workspace itself, once it exists (for the studio to read the latest blocks). */
  onReady?: (ws: Blockly.WorkspaceSvg) => void;
  readOnly?: boolean;
  /** CSS height of the editor. */
  height?: string;
}

const THEME = Blockly.Theme.defineTheme("akili", {
  name: "akili",
  base: Blockly.Themes.Classic,
  blockStyles: {
    logic_blocks: { colourPrimary: COLORS.operators },
    math_blocks: { colourPrimary: COLORS.operators },
    text_blocks: { colourPrimary: COLORS.operators },
    variable_blocks: { colourPrimary: COLORS.variables },
    variable_dynamic_blocks: { colourPrimary: COLORS.variables },
  },
  componentStyles: {
    workspaceBackgroundColour: "#f9f9f9",
    toolboxBackgroundColour: "#ffffff",
    toolboxForegroundColour: "#575e75",
    flyoutBackgroundColour: "#f9f9f9",
    flyoutForegroundColour: "#575e75",
    flyoutOpacity: 1,
    scrollbarColour: "#cecdce",
    insertionMarkerColour: "#7c3aed",
    insertionMarkerOpacity: 0.3,
    cursorColour: "#7c3aed",
  },
  fontStyle: { family: "Nunito, ui-rounded, system-ui, sans-serif", weight: "bold", size: 12 },
});

/**
 * The block editor. Blockly draws and edits; we only load the saved blocks and report changes.
 * The look is Scratch-like: round "zelos" blocks, big colourful categories, drag and drop.
 */
const BlockWorkspace = ({ initialState, onChange, onReady, readOnly = false, height = "28rem" }: Props) => {
  const host = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onChangeRef.current = onChange;
    onReadyRef.current = onReady;
  }, [onChange, onReady]);

  useEffect(() => {
    if (!host.current) return;
    registerBlocks();
    // Phones: the categories go in a row along the top, so the blocks get the full width.
    const phone = window.matchMedia("(max-width: 1023px)").matches;
    const ws = Blockly.inject(host.current, {
      horizontalLayout: phone,
      toolboxPosition: "start",
      toolbox: readOnly ? undefined : (TOOLBOX as never),
      renderer: "zelos",
      theme: THEME,
      readOnly,
      sounds: false,
      trashcan: !readOnly,
      zoom: { controls: !readOnly, wheel: false, startScale: 0.85, maxScale: 1.6, minScale: 0.4, scaleSpeed: 1.15 },
      grid: { spacing: 28, length: 2, colour: "#d9d9d9", snap: true },
      move: { scrollbars: true, drag: true, wheel: true },
    });

    if (initialState) {
      Blockly.Events.disable();
      try {
        Blockly.serialization.workspaces.load(initialState as never, ws);
      } finally {
        Blockly.Events.enable();
      }
    }

    ws.addChangeListener((e: Blockly.Events.Abstract) => {
      // Moving the view, selecting a block or opening the flyout is not a change to the program.
      if (e.isUiEvent || e.type === Blockly.Events.FINISHED_LOADING) return;
      onChangeRef.current?.(Blockly.serialization.workspaces.save(ws));
    });
    onReadyRef.current?.(ws);

    const observer = new ResizeObserver(() => Blockly.svgResize(ws));
    observer.observe(host.current);

    return () => {
      observer.disconnect();
      ws.dispose();
    };
    // The workspace is created once per mount; changing the saved state later must not rebuild it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly]);

  return <div ref={host} style={{ height }} className="scratch-ws w-full overflow-hidden" aria-label="Block editor" />;
};

export default BlockWorkspace;
