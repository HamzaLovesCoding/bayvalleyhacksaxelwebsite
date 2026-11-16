import type { Stage } from "@/components/arm-stage";
import { fetchKeys, type Key, poseFor, releaseKeys, returnKeys, sample } from "@/lib/arm/choreo";
import { GRIP_HEIGHT, TRAY_RADIUS, type TrayItemName } from "@/lib/arm/items";

export type Phase = "fetch" | "release" | "return";

const keysFor = (phase: Phase, angle: number, closed: number): Key[] =>
  phase === "fetch" ? fetchKeys(angle, closed) : phase === "release" ? releaseKeys(closed) : returnKeys(angle, closed);

/**
 * Puts the arm and the item where they are at time t (0..1) of a phase. Pure, so scrubbing back and
 * forth through the scroll story always shows the same motion.
 */
export function showPhase(stage: Stage, phase: Phase, name: TrayItemName, t: number) {
  const { rig, tray } = stage;
  if (!tray) return;
  const item = tray.get(name);
  const keys = keysFor(phase, item.angle, item.gripClosed);
  tray.reset();
  tray.setActive(name);
  const { pose, holding } = sample(keys, t);
  // A held item turns with the base: compare with the yaw it was picked up at.
  const turned = pose.yaw - poseFor({ angle: item.angle, distance: TRAY_RADIUS, height: GRIP_HEIGHT, pitch: 0, grip: 0 }).yaw;

  if (phase === "release" && !holding) {
    // The jaws have opened: the person has the item. It stays where it was let go and fades out.
    rig.setPose(sample(keys, 0.5).pose);
    const letGo = rig.gripWorld();
    rig.setPose(pose);
    tray.place(item, letGo, turned);
    tray.fade(item, Math.max(0, 1 - (t - 0.5) / 0.35));
    return;
  }
  rig.setPose(pose);
  if (phase === "return" && t < 0.12) {
    // The person sets it back between the open jaws.
    tray.place(item, rig.gripWorld(), turned);
    tray.fade(item, Math.min(1, t / 0.08));
    return;
  }
  tray.place(item, holding ? rig.gripWorld() : null, turned);
}
