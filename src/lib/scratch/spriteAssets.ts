/**
 * Pictures for sprites: the library we ship (public/sprites), what a child paints or uploads, and turning all of
 * them into the self-contained form the sandboxed stage needs (it cannot load anything from the network).
 */
import type { Costume, ProjectState } from "./blocks";
import type { StageCostume } from "./runtime";

export interface LibrarySprite { id: string; name: string; cat: string; files: string[] }
export interface Library { credit: string; sprites: LibrarySprite[] }

/** A picture stored inside a project (painted or uploaded) must stay small: the whole project is capped. */
export const MAX_PICTURE_CHARS = 120_000;

let libraryPromise: Promise<Library> | null = null;
/** The sprite catalogue (loaded once, on first use). */
export const loadLibrary = (): Promise<Library> => {
  libraryPromise ??= fetch("/sprites/index.json").then((r) => {
    if (!r.ok) throw new Error("The sprite library did not load.");
    return r.json() as Promise<Library>;
  });
  libraryPromise.catch(() => { libraryPromise = null; }); // allow a retry after a failure
  return libraryPromise;
};

export const libraryUrl = (code: string) => `/sprites/${code}.svg`;

/** A picture the app can show in an <img> for this costume, or null for emoji costumes. */
export const costumeUrl = (src: string): string | null =>
  src.startsWith("lib:") ? libraryUrl(src.slice(4)) : src.startsWith("data:image/") ? src : null;

/** The costumes a library sprite starts with (its first picture, plus any extra poses). */
export const costumesOf = (entry: LibrarySprite): Costume[] =>
  entry.files.map((code, i) => ({ id: `c${i + 1}`, name: i === 0 ? entry.name : `${entry.name} ${i + 1}`, src: `lib:${code}` }));

const svgCache = new Map<string, string>();
const toDataUri = async (src: string): Promise<string> => {
  if (src.startsWith("data:")) return src;
  const code = src.slice(4);
  let uri = svgCache.get(code);
  if (!uri) {
    const res = await fetch(libraryUrl(code));
    if (!res.ok) throw new Error("A sprite picture did not load.");
    uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(await res.text())}`;
    svgCache.set(code, uri);
  }
  return uri;
};

/** Everything the stage needs to draw the project: each sprite's costumes with pictures as data: addresses. */
export const resolveCostumes = async (project: ProjectState): Promise<StageCostume[][]> =>
  Promise.all(
    project.sprites.map(async (sp) => {
      const list = await Promise.all(
        sp.costumes.map(async (c, i): Promise<StageCostume> => {
          const src = c.src.startsWith("lib:") ? await toDataUri(c.src).catch(() => "emoji:❓") : c.src;
          return { id: c.id, name: c.name, src, ...(i === (sp.start ?? 0) ? { current: true } : {}) };
        })
      );
      return list;
    })
  );

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("That picture could not be opened."));
    img.src = src;
  });

/** Crop a canvas to what is drawn on it (with a small margin), so a small drawing is a small file. Null when empty. */
export const trimCanvas = (canvas: HTMLCanvasElement): HTMLCanvasElement | null => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  const pad = 4;
  const x0 = Math.max(0, minX - pad), y0 = Math.max(0, minY - pad);
  const w = Math.min(width, maxX + pad + 1) - x0, h = Math.min(height, maxY + pad + 1) - y0;
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  out.getContext("2d")!.drawImage(canvas, x0, y0, w, h, 0, 0, w, h);
  return out;
};

/** Shrink (never enlarge) so the longest side is at most `max`, and encode small; shrinks more until it fits. */
export const encodePicture = (source: HTMLCanvasElement, max = 256): string => {
  let scale = Math.min(1, max / Math.max(source.width, source.height));
  for (let attempt = 0; attempt < 6; attempt++) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(source.width * scale));
    c.height = Math.max(1, Math.round(source.height * scale));
    c.getContext("2d")!.drawImage(source, 0, 0, c.width, c.height);
    // webp is small and keeps transparency; browsers that cannot make it give png instead
    const url = c.toDataURL("image/webp", 0.9);
    if (url.length <= MAX_PICTURE_CHARS) return url;
    scale *= 0.75;
  }
  throw new Error("That picture is too big. Try a smaller or simpler one.");
};

export const ACCEPTED_UPLOADS = ["image/png", "image/jpeg", "image/webp", "image/gif"];

/** A picture the child chose from their device, made small and safe (re-drawn, so nothing but pixels is kept). */
export const pictureFromFile = async (file: File): Promise<string> => {
  if (!ACCEPTED_UPLOADS.includes(file.type)) throw new Error("Please choose a PNG, JPG, WEBP or GIF picture.");
  if (file.size > 8 * 1024 * 1024) throw new Error("That picture is too big (8 MB at most).");
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext("2d")!.drawImage(img, 0, 0);
    return encodePicture(canvas);
  } finally {
    URL.revokeObjectURL(url);
  }
};

/** Open a costume picture onto a canvas (for editing it in the paint editor). */
export const drawCostumeOn = async (src: string, canvas: HTMLCanvasElement) => {
  const url = costumeUrl(src);
  if (!url) return;
  const img = await loadImage(url);
  const k = Math.min(1, (canvas.width * 0.8) / img.naturalWidth, (canvas.height * 0.8) / img.naturalHeight, Infinity);
  const scale = img.naturalWidth < 200 ? Math.min((canvas.width * 0.7) / img.naturalWidth, (canvas.height * 0.7) / img.naturalHeight) : k;
  const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
  canvas.getContext("2d")!.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
};
