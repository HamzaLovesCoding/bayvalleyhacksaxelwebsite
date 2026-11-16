import { type Pose, solve } from "@/lib/arm/ik";
import { GRIP_HEIGHT, TRAY_RADIUS } from "@/lib/arm/items";

// Arm moves are planned in task space, the way the pitch describes them: a target given as a polar
// angle + distance around the base, a height and a gripper pitch. Every frame the target is
// interpolated and solved with inverse kinematics, so the gripper travels in straight lines.
// Moves that switch between reaching forward and folding back over the base are interpolated joint by
// joint instead, the way the servos would actually move.

export type Task = {
  /** Polar angle around the base, degrees (see traySpot). */
  angle: number;
  /** Polar distance from the yaw axis, mm. */
  distance: number;
  /** Grip-centre height, mm (tray surface = -55). */
  height: number;
  /** Gripper pitch, degrees (0 = level, negative = tipped down). */
  pitch: number;
  /** Jaw travel per side, mm (0 = CAD pose; ~14 = wide open). */
  grip: number;
  /** Reach the spot by folding back over the base rather than turning to face it (see ik.solve). */
  back?: boolean;
};

/** A keyframe is either a task-space target (solved with IK) or a joint pose given directly. */
export type Key = { at: number; holding: boolean } & (
  { task: Task; pose?: never } | { pose: Pose; task?: never }
);

/** Where the person sits: across the tray from the items (positions 1–7 cover 0°–180°). */
export const USER_ANGLE = 270;
const OPEN = 14;

/** Upright, facing the middle of the tray. The base never needs to leave its 0°–180° travel. */
export const READY: Task = {
  angle: 90,
  distance: 200,
  height: 200,
  pitch: -20,
  grip: 0,
};
/** Held out to the person: the base faces the items' side and the arm folds back over itself. */
export const HANDOFF: Task = {
  angle: USER_ANGLE,
  distance: 270,
  height: 90,
  pitch: 0,
  grip: 0,
  back: true,
};

const at = (
  angle: number,
  distance: number,
  height: number,
  pitch: number,
  grip: number,
): Task => ({ angle, distance, height, pitch, grip });
const DEG = Math.PI / 180;

/**
 * Upper arm straight up, forearm leaning back over the base, base facing the middle of the tray.
 * Moving between reaching out over the tray and folding back to the person goes through here, so a
 * carried item swings up and over the top instead of sweeping through the tray.
 */
function over(grip: number): Pose {
  return {
    yaw: poseFor(READY).yaw,
    shoulder: 65 * DEG,
    elbow: -110 * DEG,
    wrist: 15 * DEG,
    grip,
  };
}

/** Ready -> pick the item up -> hand it over, closed on the item. */
export function fetchKeys(angle: number, closed: number): Key[] {
  const R = TRAY_RADIUS;
  return [
    { at: 0, task: { ...READY, grip: 0 }, holding: false },
    { at: 0.2, task: at(angle, R - 70, 75, -20, OPEN), holding: false },
    { at: 0.32, task: at(angle, R - 70, GRIP_HEIGHT, 0, OPEN), holding: false },
    { at: 0.42, task: at(angle, R, GRIP_HEIGHT, 0, OPEN), holding: false },
    { at: 0.5, task: at(angle, R, GRIP_HEIGHT, 0, closed), holding: true },
    // Lift high enough that the carried item clears the tallest thing on the tray (the water, ~130 mm).
    { at: 0.62, task: at(angle, R - 60, 125, 0, closed), holding: true },
    { at: 0.78, pose: over(closed), holding: true },
    { at: 0.93, task: { ...HANDOFF, grip: closed }, holding: true },
    { at: 1, task: { ...HANDOFF, grip: closed }, holding: true },
  ];
}

/** At the hand-off point: the jaws open and the person takes the item. */
export function releaseKeys(closed: number): Key[] {
  return [
    { at: 0, task: { ...HANDOFF, grip: closed }, holding: true },
    { at: 0.5, task: { ...HANDOFF, grip: OPEN }, holding: false },
    {
      at: 1,
      task: { ...HANDOFF, distance: HANDOFF.distance - 40, grip: OPEN },
      holding: false,
    },
  ];
}

/** Take the item back at the hand-off point -> return it to its spot -> back to ready. */
export function returnKeys(angle: number, closed: number): Key[] {
  const R = TRAY_RADIUS;
  return [
    // The person sets the item back between the open jaws; they close on it.
    { at: 0, task: { ...HANDOFF, grip: OPEN }, holding: false },
    { at: 0.12, task: { ...HANDOFF, grip: closed }, holding: true },
    { at: 0.26, pose: over(closed), holding: true },
    { at: 0.4, task: at(angle, R - 60, 125, 0, closed), holding: true },
    { at: 0.52, task: at(angle, R, GRIP_HEIGHT, 0, closed), holding: true },
    { at: 0.6, task: at(angle, R, GRIP_HEIGHT, 0, OPEN), holding: false },
    { at: 0.7, task: at(angle, R - 70, GRIP_HEIGHT, 0, OPEN), holding: false },
    { at: 0.82, task: at(angle, R - 70, 75, -20, OPEN), holding: false },
    { at: 1, task: { ...READY }, holding: false },
  ];
}

const smooth = (t: number) => t * t * t * (t * (t * 6 - 15) + 10); // servo-like: soft start, soft stop
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpAngle = (a: number, b: number, t: number) =>
  a + (((((b - a) % 360) + 540) % 360) - 180) * t;

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const resolve = (k: Key) => k.pose ?? poseFor(k.task);

/** Joint-space blend where every joint takes the short way round, like a servo would. */
function blend(a: Pose, b: Pose, u: number): Pose {
  const turn = (x: number, y: number) => x + wrap(y - x) * u;
  return {
    yaw: turn(a.yaw, b.yaw),
    shoulder: turn(a.shoulder, b.shoulder),
    elbow: turn(a.elbow, b.elbow),
    wrist: turn(a.wrist, b.wrist),
    grip: a.grip + (b.grip - a.grip) * u,
  };
}

/** Arm pose and holding state at time t (0..1) along a keyframe list. */
export function sample(
  keys: Key[],
  t: number,
): { pose: Pose; holding: boolean } {
  if (t <= keys[0].at)
    return { pose: resolve(keys[0]), holding: keys[0].holding };
  for (let i = 1; i < keys.length; i++) {
    const b = keys[i];
    if (t <= b.at) {
      const a = keys[i - 1];
      const u = smooth((t - a.at) / (b.at - a.at || 1));
      // Picking up happens when the jaws finish closing; letting go when they start opening.
      const holding =
        b.holding && a.holding
          ? true
          : b.holding
            ? u > 0.85
            : a.holding
              ? u < 0.15
              : false;
      if (!a.task || !b.task || !!a.task.back !== !!b.task.back)
        return { pose: blend(resolve(a), resolve(b), u), holding };
      const task: Task = {
        angle: lerpAngle(a.task.angle, b.task.angle, u),
        distance: lerp(a.task.distance, b.task.distance, u),
        height: lerp(a.task.height, b.task.height, u),
        pitch: lerp(a.task.pitch, b.task.pitch, u),
        grip: lerp(a.task.grip, b.task.grip, u),
        back: a.task.back,
      };
      return { pose: poseFor(task), holding };
    }
  }
  const last = keys[keys.length - 1];
  return { pose: resolve(last), holding: last.holding };
}

let lastGood: Pose | null = null;

/** Joint angles for a task-space target (keeps the last good pose if a target is out of reach). */
export function poseFor(task: Task): Pose {
  const s = solve(
    task.angle,
    task.distance,
    task.height,
    task.pitch,
    task.back,
  );
  if (s) lastGood = { ...s, grip: task.grip };
  return (
    lastGood ?? { yaw: 0, shoulder: 0, elbow: 0, wrist: 0, grip: task.grip }
  );
}
