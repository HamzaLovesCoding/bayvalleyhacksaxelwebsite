// Inverse kinematics for the arm, in the same steps the pitch describes:
// a tray spot in polar form (angle, distance) -> rectangular coordinates -> joint angles.
// Geometry is measured from the CAD (mm, three.js axes: Y up). All joint angles are radians,
// relative to the pose the CAD was saved in.

const DEG = Math.PI / 180;

/** Joint pivots, taken from the servo horn centres in the CAD. */
export const PIVOTS = {
  yaw: [-7, 0, 0],
  shoulder: [-17.2, 40, 0],
  elbow: [-18.2, 90.7, -108.8],
  wrist: [-18.2, 121.8, 7.1],
  /** Centre of the space between the two gripper pads. */
  grip: [-15.5, 103.7, 109.6],
} as const;

// Distances in the arm's own vertical plane. h = horizontal reach away from the base (three.js -Z
// before yaw), v = height. The arm plane sits 11.2 mm to the side of the yaw axis.
const ARM_PLANE_OFFSET = PIVOTS.wrist[0] - PIVOTS.yaw[0]; // -11.2 mm
const SHOULDER_V = PIVOTS.shoulder[1];
const L1 = Math.hypot(PIVOTS.elbow[1] - PIVOTS.shoulder[1], PIVOTS.elbow[2] - PIVOTS.shoulder[2]); // 120 mm
const L2 = Math.hypot(PIVOTS.wrist[1] - PIVOTS.elbow[1], PIVOTS.wrist[2] - PIVOTS.elbow[2]); // 120 mm

// Rest-pose angles of each segment in the (h, v) plane, measured counter-clockwise from "straight out".
const A1 = Math.atan2(PIVOTS.elbow[1] - PIVOTS.shoulder[1], -(PIVOTS.elbow[2] - PIVOTS.shoulder[2]));
const A2 = Math.atan2(PIVOTS.wrist[1] - PIVOTS.elbow[1], -(PIVOTS.wrist[2] - PIVOTS.elbow[2]));
// The gripper points straight back over the base at rest (180°). The grip centre sits ahead of and
// slightly off the wrist axis; express that offset in the gripper's own frame.
const GRIP_ALONG = PIVOTS.grip[2] - PIVOTS.wrist[2]; // 102.5 mm along the gripper
const GRIP_ACROSS = -(PIVOTS.grip[1] - PIVOTS.wrist[1]); // 18.1 mm across it

export type Pose = {
  yaw: number;
  shoulder: number;
  elbow: number;
  wrist: number;
  /** Jaw travel per side in mm. 0 is the CAD pose (nearly closed). */
  grip: number;
};

export const REST: Pose = { yaw: 0, shoulder: 0, elbow: 0, wrist: 0, grip: 0 };

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
/** Base yaw lives in [-90°, 270°) so the tray's 0°–180° range is one continuous stretch (no ±180° jump). */
const wrapYaw = (a: number) => ((((a + Math.PI / 2) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI / 2;

/** Polar tray spot -> world X/Z (mm). 0° faces the way the arm faces at rest; angles run counter-clockwise seen from above. */
export function traySpot(angleDeg: number, distance: number): [number, number] {
  const theta = angleDeg * DEG;
  return [PIVOTS.yaw[0] - distance * Math.sin(theta), PIVOTS.yaw[2] - distance * Math.cos(theta)];
}

/**
 * Joint angles that put the grip centre at a tray spot.
 * @param angleDeg  polar angle of the spot around the base (see traySpot)
 * @param distance  polar distance from the yaw axis, mm
 * @param height    grip-centre height, mm (the base bottom / tray surface is at -55)
 * @param pitchDeg  gripper direction: 0 = level and pointing away from the base, negative = tipped down
 * @param back      reach the spot by folding back over the base (like the stowed Z pose) instead of turning
 *                  the base to face it. The base servo only travels ~180°, so spots outside 0°–180° (the
 *                  person, at 270°) are reached this way, with the base facing the opposite direction.
 */
export function solve(angleDeg: number, distance: number, height: number, pitchDeg = 0, back = false): Omit<Pose, "grip"> | null {
  // Polar -> rectangular, relative to the yaw axis.
  const [sx, sz] = traySpot(angleDeg, distance);
  const x = sx - PIVOTS.yaw[0];
  const z = sz - PIVOTS.yaw[2];

  // Yaw: rotate so the (offset) arm plane passes through the spot, in front of the arm or behind it.
  const h = Math.sqrt(Math.max(distance * distance - ARM_PLANE_OFFSET * ARM_PLANE_OFFSET, 0));
  const worldAngle = Math.atan2(z, x);
  const localAngle = Math.atan2(back ? h : -h, ARM_PLANE_OFFSET);
  const yaw = wrapYaw(localAngle - worldAngle);

  // Planar two-link IK for the wrist, then the wrist angle that sets the gripper pitch.
  const reach = back ? -h : h;
  const gamma = back ? Math.PI - pitchDeg * DEG : pitchDeg * DEG;
  const gh = reach - (GRIP_ALONG * Math.cos(gamma) - GRIP_ACROSS * Math.sin(gamma));
  const gv = height - SHOULDER_V - (GRIP_ALONG * Math.sin(gamma) + GRIP_ACROSS * Math.cos(gamma));
  const d = Math.hypot(gh, gv);
  if (d > L1 + L2 || d < Math.abs(L1 - L2)) return null;
  // Keep the elbow above the shoulder-wrist line whichever way the arm is reaching.
  const bend = Math.acos((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d));
  const alpha1 = Math.atan2(gv, gh) + (back ? -bend : bend);
  const eh = L1 * Math.cos(alpha1);
  const ev = L1 * Math.sin(alpha1);
  const alpha2 = Math.atan2(gv - ev, gh - eh);

  const shoulder = wrap(alpha1 - A1);
  const elbow = wrap(alpha2 - A2 - shoulder);
  const wrist = wrap(gamma - Math.PI - shoulder - elbow);
  return { yaw, shoulder, elbow, wrist };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function mix(a: Pose, b: Pose, t: number): Pose {
  return {
    yaw: lerp(a.yaw, b.yaw, t),
    shoulder: lerp(a.shoulder, b.shoulder, t),
    elbow: lerp(a.elbow, b.elbow, t),
    wrist: lerp(a.wrist, b.wrist, t),
    grip: lerp(a.grip, b.grip, t),
  };
}
