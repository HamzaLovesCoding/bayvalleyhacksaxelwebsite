// Tray layout shared by the 3D scene and the plain UI (kept free of three.js so UI code stays light).
// Example layout from the pitch: position n sits at (n - 1) × 30°, glasses in position 2 (30°).
export const TRAY_ITEMS = ["keys", "glasses", "water", "pills", "phone", "remote", "book"] as const;
export type TrayItemName = (typeof TRAY_ITEMS)[number];

/** Distance from the yaw axis to each item's centre, mm. Comfortably inside the arm's reach. */
export const TRAY_RADIUS = 250;
/** Tray surface height (the base bottom), mm. */
export const TRAY_TOP = -55;
/** Height the gripper holds items at, mm (pads centred ~40 mm above the tray). */
export const GRIP_HEIGHT = TRAY_TOP + 40;

export const itemAngle = (name: TrayItemName) => TRAY_ITEMS.indexOf(name) * 30;
