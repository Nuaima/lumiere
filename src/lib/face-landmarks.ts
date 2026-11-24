// Canonical MediaPipe Face Mesh index sets used for try-on masking.
// 468-point model. Polygon outlines are ordered for correct canvas fill.

// ── Face ───────────────────────────────────────────────────────────────────

export const FACE_OVAL = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365,
  379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93,
  234, 127, 162, 21, 54, 103, 67, 109,
];

// ── Eyes ───────────────────────────────────────────────────────────────────

export const LEFT_EYE = [
  33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7,
];
export const RIGHT_EYE = [
  263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249,
];

// Upper lash lines — ordered inner→outer along the upper lid.
// Used for eyeliner stroke and mascara thickening.
export const LEFT_UPPER_LASH  = [133, 173, 157, 158, 159, 160, 161, 246];
export const RIGHT_UPPER_LASH = [362, 398, 384, 385, 386, 387, 388, 466];

// ── Lips ───────────────────────────────────────────────────────────────────

// Outer lip outline — covers both upper and lower lip as one closed polygon.
export const LIPS_OUTER = [
  61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291,
  375, 321, 405, 314, 17, 84, 181, 91, 146,
];
// Inner lip outline — used as a cutout hole for open-mouth photos.
export const LIPS_INNER = [
  78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308,
  324, 318, 402, 317, 14, 87, 178, 88, 95,
];

// ── Cheeks ─────────────────────────────────────────────────────────────────

// Small polygons around the cheekbone — used for blush and bronzer.
export const LEFT_CHEEK  = [123, 147, 213, 192, 207, 205, 50, 117];
export const RIGHT_CHEEK = [352, 376, 433, 416, 427, 425, 280, 346];

// ── Highlighter anchors ────────────────────────────────────────────────────

// Nose bridge — 4-point strip used as a bbox for the nose highlight dot.
export const NOSE_BRIDGE = [6, 197, 195, 5];

// Single-point anchors — used with pt(i) not pts(idx[]) in the renderer.
export const FOREHEAD_CENTER = 10;
export const CHIN_CENTER     = 152;