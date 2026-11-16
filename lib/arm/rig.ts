import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { PIVOTS, type Pose } from "@/lib/arm/ik";

// Node names in /arm/arm.glb are "<link>-<part>": link = what it moves with, part = what it is.
export type ArmLink = "base" | "yaw" | "upper" | "fore" | "wrist" | "jawL" | "jawR";
export type ArmPart = "base" | "shoulder" | "upper" | "fore" | "wrist" | "gripper" | "servos" | "hardware";

type Piece = { mesh: THREE.Mesh; depth: THREE.Mesh; link: ArmLink; part: ArmPart; material: THREE.Material };

const v3 = (p: readonly number[]) => new THREE.Vector3(p[0], p[1], p[2]);

export class ArmRig {
  readonly root = new THREE.Group();
  private readonly joints: Record<Exclude<ArmLink, "base">, THREE.Object3D>;
  private readonly pieces: Piece[] = [];
  private readonly gripLocal: THREE.Vector3;
  private readonly ghost = new THREE.MeshStandardMaterial({
    color: 0xc9d6f2,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
  });
  // Ghosted parts first write depth only, then draw their colour where they are frontmost, so they read
  // as one clean translucent silhouette instead of an x-ray tangle of every inner surface.
  private readonly depthOnly = new THREE.MeshBasicMaterial({ colorWrite: false });

  constructor(model: THREE.Object3D) {
    this.root.add(model);
    this.root.updateMatrixWorld(true);

    const pivot = (name: string, at: readonly number[], parent: THREE.Object3D) => {
      const o = new THREE.Object3D();
      o.name = name;
      o.position.copy(v3(at));
      this.root.add(o);
      o.updateMatrixWorld(true);
      parent.attach(o);
      return o;
    };
    const yaw = pivot("yaw", PIVOTS.yaw, this.root);
    const upper = pivot("shoulder", PIVOTS.shoulder, yaw);
    const fore = pivot("elbow", PIVOTS.elbow, upper);
    const wrist = pivot("wrist", PIVOTS.wrist, fore);
    const jawL = pivot("jawL", PIVOTS.wrist, wrist);
    const jawR = pivot("jawR", PIVOTS.wrist, wrist);
    this.joints = { yaw, upper, fore, wrist, jawL, jawR };

    const found: THREE.Mesh[] = [];
    model.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) found.push(o as THREE.Mesh);
    });
    for (const mesh of found) {
      // gltfpack suffixes repeated names (fore-servos_1); the quantisation transform lives on the mesh itself.
      const [link, part] = (mesh.parent?.name ?? "base-hardware").replace(/_\d+$/, "").split("-") as [ArmLink, ArmPart];
      const material = mesh.material as THREE.Material;
      if (link !== "base") this.joints[link].attach(mesh);
      const depth = new THREE.Mesh(mesh.geometry, this.depthOnly);
      depth.position.copy(mesh.position);
      depth.quaternion.copy(mesh.quaternion);
      depth.scale.copy(mesh.scale);
      depth.renderOrder = 1;
      depth.visible = false;
      mesh.parent!.add(depth);
      this.pieces.push({ mesh, depth, link, part, material });
    }
    this.gripLocal = wrist.worldToLocal(v3(PIVOTS.grip));
  }

  setPose(p: Pose) {
    this.joints.yaw.rotation.y = p.yaw;
    this.joints.upper.rotation.x = p.shoulder;
    this.joints.fore.rotation.x = p.elbow;
    this.joints.wrist.rotation.x = p.wrist;
    this.joints.jawL.position.x = -p.grip;
    this.joints.jawR.position.x = p.grip;
  }

  /** World position of the space between the gripper pads (where a held item sits). */
  gripWorld(out = new THREE.Vector3()) {
    this.root.updateMatrixWorld(true);
    return out.copy(this.gripLocal).applyMatrix4(this.joints.wrist.matrixWorld);
  }

  /** Full colour for some subsystems, everything else ghosted; null shows everything. */
  highlight(parts: ArmPart | ArmPart[] | null) {
    const show = parts === null ? null : Array.isArray(parts) ? parts : [parts];
    for (const { mesh, depth, part: p, material } of this.pieces) {
      const solid = !show || show.includes(p);
      mesh.material = solid ? material : this.ghost;
      mesh.renderOrder = solid ? 0 : 2;
      depth.visible = !solid;
    }
  }

  /** Geometry and materials are shared with the page-wide cache (see loadArm), so only the ghost materials are ours. */
  dispose() {
    this.ghost.dispose();
    this.depthOnly.dispose();
  }
}

let cached: Promise<THREE.Group> | null = null;

/** Loads the arm once per page; every caller gets its own clone. */
export async function loadArm(url = "/arm/arm.glb") {
  cached ??= new GLTFLoader()
    .setMeshoptDecoder(MeshoptDecoder)
    .loadAsync(url)
    .then((g) => g.scene);
  const scene = await cached;
  return new ArmRig(scene.clone(true));
}
