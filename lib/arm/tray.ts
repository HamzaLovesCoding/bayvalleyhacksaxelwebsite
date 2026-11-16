import * as THREE from "three";
import { traySpot } from "@/lib/arm/ik";
import { GRIP_HEIGHT, TRAY_ITEMS, TRAY_RADIUS, TRAY_TOP, type TrayItemName } from "@/lib/arm/items";

export type TrayItem = {
  name: TrayItemName;
  position: number;
  angle: number;
  group: THREE.Group;
  home: THREE.Vector3;
  /** Gap between the jaws when this item is held, mm per side (0 = CAD pose, 10 mm apart). */
  gripClosed: number;
};

const mat = (color: number, roughness = 0.55) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 });

function shape(name: TrayItemName, body: THREE.Material, detail: THREE.Material): [THREE.Group, number] {
  const g = new THREE.Group();
  const add = (geo: THREE.BufferGeometry, m: THREE.Material, y: number, x = 0, z = 0) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, y, z);
    mesh.userData.body = m === body;
    g.add(mesh);
    return mesh;
  };
  // Every item is narrow enough (≤ 30 mm) where the pads close on it; the jaws open to ~38 mm.
  switch (name) {
    case "water":
      add(new THREE.CylinderGeometry(14, 14, 110, 40), body, 55);
      add(new THREE.CylinderGeometry(9, 12, 12, 32), body, 116);
      add(new THREE.CylinderGeometry(7.5, 7.5, 9, 24), detail, 126);
      return [g, 4];
    case "pills":
      add(new THREE.CylinderGeometry(13, 13, 52, 36), body, 26);
      add(new THREE.CylinderGeometry(14, 14, 12, 36), detail, 58);
      return [g, 3.5];
    case "glasses":
      // A slim glasses case standing on end; the pads close on its narrow sides.
      add(new THREE.CapsuleGeometry(13, 50, 8, 24), body, 38).scale.set(0.85, 1, 1.35);
      add(new THREE.CylinderGeometry(13.4, 13.4, 2.5, 32), detail, 46).scale.set(0.85, 1, 1.35);
      return [g, 1.5];
    case "phone":
      add(new THREE.BoxGeometry(9, 104, 50), body, 52);
      add(new THREE.BoxGeometry(9.6, 90, 43), detail, 53);
      return [g, -0.5];
    case "remote":
      add(new THREE.BoxGeometry(20, 108, 30), body, 54);
      add(new THREE.CylinderGeometry(4, 4, 21, 16), detail, 88).rotation.z = Math.PI / 2;
      return [g, 1.5];
    case "keys":
      add(new THREE.BoxGeometry(20, 50, 28), body, 25);
      add(new THREE.TorusGeometry(12, 2.4, 10, 32), detail, 62);
      return [g, 0.5];
    case "book":
      add(new THREE.BoxGeometry(24, 112, 78), body, 56);
      add(new THREE.BoxGeometry(25, 108, 3), detail, 56, 0, 38);
      return [g, 3.5];
  }
}

/** A soft contact shadow: a radial-gradient plane, far cheaper than real shadow maps. */
function blobShadow(radius: number, opacity: number) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, `rgba(20,24,40,${opacity})`);
  grad.addColorStop(1, "rgba(20,24,40,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2, radius * 2), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  return m;
}

export class Tray {
  readonly group = new THREE.Group();
  readonly items: TrayItem[] = [];
  private readonly accent = mat(0x46a5d8, 0.45);
  private readonly bodies = new Map<TrayItemName, THREE.Material>();
  private readonly materials: THREE.Material[] = [];

  constructor() {
    const surface = mat(0xf3f5fa, 0.9);
    const rim = mat(0xe3e9f6, 0.8);
    const R = TRAY_RADIUS + 75;
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(R, R + 4, 10, 128), surface);
    disc.position.set(-7, TRAY_TOP - 5, 0);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R + 1, 2.2, 8, 160), rim);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(-7, TRAY_TOP, 0);
    this.group.add(disc, ring);
    const base = blobShadow(95, 0.32);
    base.position.set(-7, TRAY_TOP + 0.6, 0);
    this.group.add(base);
    this.materials.push(surface, rim, this.accent);

    TRAY_ITEMS.forEach((name, i) => {
      const body = mat(0xffffff, 0.5);
      const detail = mat(0xb9c3d6, 0.6);
      this.materials.push(body, detail);
      const [g, gripClosed] = shape(name, body, detail);
      const angle = i * 30;
      const [x, z] = traySpot(angle, TRAY_RADIUS);
      // Face each item toward the arm so its narrow side meets the pads.
      g.rotation.y = (angle * Math.PI) / 180;
      const home = new THREE.Vector3(x, TRAY_TOP, z);
      g.position.copy(home);
      const s = blobShadow(34, 0.22);
      s.position.set(x, TRAY_TOP + 0.5, z);
      this.group.add(s, g);
      this.bodies.set(name, body);
      this.items.push({ name, position: i + 1, angle, group: g, home, gripClosed });
    });
  }

  get(name: TrayItemName) {
    return this.items.find((it) => it.name === name)!;
  }

  /** Tint one item with the accent colour (null clears). */
  setActive(name: TrayItemName | null) {
    for (const it of this.items) {
      const body = this.bodies.get(it.name)!;
      for (const c of it.group.children) {
        if (c.userData.body) (c as THREE.Mesh).material = it.name === name ? this.accent : body;
      }
    }
  }

  /**
   * Put an item at its tray spot, or in the gripper: `grip` is the grip centre (world) and `turned`
   * how far the arm has yawed since picking it up (radians), so the item turns with the gripper.
   */
  place(item: TrayItem, grip: THREE.Vector3 | null, turned = 0) {
    if (grip) {
      item.group.position.set(grip.x, grip.y - (GRIP_HEIGHT - TRAY_TOP), grip.z);
      item.group.rotation.y = (item.angle * Math.PI) / 180 + turned;
    } else {
      item.group.position.copy(item.home);
      item.group.rotation.y = (item.angle * Math.PI) / 180;
    }
  }

  /** Every item back on its spot, solid, untinted; the tray shown. Acts call this before drawing their own state. */
  reset() {
    this.group.visible = true;
    this.setActive(null);
    for (const it of this.items) {
      this.place(it, null);
      this.fade(it, 1);
    }
  }

  /** Fade one item (1 = solid, 0 = gone): used when the person takes it from the gripper. */
  fade(item: TrayItem, opacity: number) {
    item.group.visible = opacity > 0.01;
    item.group.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (!m || !(o as THREE.Mesh).isMesh) return;
      m.transparent = opacity < 1;
      m.opacity = opacity;
    });
  }

  dispose() {
    this.group.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.geometry.dispose();
        const map = (m.material as THREE.MeshBasicMaterial).map;
        map?.dispose();
      }
    });
    this.materials.forEach((m) => m.dispose());
  }
}
