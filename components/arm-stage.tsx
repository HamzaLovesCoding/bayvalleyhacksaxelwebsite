"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { PerspectiveCamera, Scene } from "three";
import type { ArmRig } from "@/lib/arm/rig";
import type { Tray } from "@/lib/arm/tray";

export type Shot = {
  az: number;
  el: number;
  dist: number;
  target: [number, number, number];
  fov?: number;
  /** Slide the subject across the frame without turning the camera: [x, y] as fractions of the view (+x right, +y down). */
  shift?: [number, number];
};

export type Stage = {
  rig: ArmRig;
  tray: Tray | null;
  scene: Scene;
  camera: PerspectiveCamera;
  /** Point the camera: azimuth/elevation in degrees around `target` (mm). */
  look(shot: Shot): void;
  /** Ask for a redraw. The stage only renders when something changed. */
  invalidate(): void;
  /** Run `tick` every frame while it returns true (idle motion, timed demos). */
  animate(tick: (dt: number) => boolean): void;
};

type Props = {
  className?: string;
  withTray?: boolean;
  /** Let people drag horizontally to turn the view. */
  draggable?: boolean;
  /** Shown until the model is ready, and kept if WebGL is unavailable. */
  poster?: string;
  posterAlt?: string;
  onReady?: (stage: Stage) => void;
};

const D = Math.PI / 180;

export function ArmStage({
  className = "",
  withTray = false,
  draggable = false,
  poster,
  posterAlt = "",
  onReady,
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const ready = useRef(onReady);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    ready.current = onReady;
  });

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      // three is ~150 kB gzipped; it loads only once a stage mounts.
      const THREE = await import("three");
      const { RoomEnvironment } =
        await import("three/examples/jsm/environments/RoomEnvironment.js");
      const { loadArm } = await import("@/lib/arm/rig");
      const { Tray } = await import("@/lib/arm/tray");

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        });
      } catch {
        return; // No WebGL: the poster stays.
      }
      const rig = await loadArm();
      if (disposed) {
        renderer.dispose();
        rig.dispose();
        return;
      }

      // Screen shares encode at 1080p or less, so more pixels only cost frames.
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.85;
      renderer.domElement.className = "absolute inset-0 size-full";
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      const key = new THREE.DirectionalLight(0xffffff, 1.6);
      key.position.set(-300, 500, 400);
      scene.add(key, rig.root);
      const tray = withTray ? new Tray() : null;
      if (tray) scene.add(tray.group);

      const camera = new THREE.PerspectiveCamera(30, 1, 5, 20000);
      let shot: Shot = { az: 35, el: 18, dist: 900, target: [0, 40, 0] };
      let drag = 0; // extra azimuth from dragging, degrees
      const size = { w: 1, h: 1 };
      const place = () => {
        const az = (shot.az + drag) * D;
        const elv = shot.el * D;
        const [tx, ty, tz] = shot.target;
        camera.fov = shot.fov ?? 30;
        camera.position.set(
          tx + shot.dist * Math.cos(elv) * Math.sin(az),
          ty + shot.dist * Math.sin(elv),
          tz + shot.dist * Math.cos(elv) * Math.cos(az),
        );
        camera.lookAt(tx, ty, tz);
        const [sx, sy] = shot.shift ?? [0, 0];
        if (sx || sy) camera.setViewOffset(size.w, size.h, -sx * size.w, -sy * size.h, size.w, size.h);
        else camera.clearViewOffset();
      };

      let visible = true;
      let dirty = true;
      let raf = 0;
      let last = 0;
      let ticker: ((dt: number) => boolean) | null = null;
      const frame = (now: number) => {
        raf = 0;
        const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
        last = now;
        let again = false;
        if (ticker) {
          again = ticker(dt);
          if (!again) ticker = null;
          dirty = true;
        }
        if (dirty && visible) {
          place();
          renderer.render(scene, camera);
          dirty = false;
        }
        if (again) raf = requestAnimationFrame(frame);
        else last = 0;
      };
      const invalidate = () => {
        dirty = true;
        if (!raf) raf = requestAnimationFrame(frame);
      };

      const resize = () => {
        const { width, height } = el.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        size.w = width;
        size.h = height;
        invalidate();
      };
      const ro = new ResizeObserver(resize);
      ro.observe(el);
      resize();
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible) invalidate();
      });
      io.observe(el);

      // Horizontal drag turns the view; it eases back when let go so scroll choreography still lines up.
      let dragging = false;
      let startX = 0;
      let startDrag = 0;
      const down = (e: PointerEvent) => {
        dragging = true;
        startX = e.clientX;
        startDrag = drag;
        el.setPointerCapture(e.pointerId);
      };
      const move = (e: PointerEvent) => {
        if (!dragging) return;
        drag = startDrag - (e.clientX - startX) * 0.35;
        invalidate();
      };
      const up = () => {
        dragging = false;
        stage.animate((dt) => {
          if (dragging) return false;
          drag *= Math.exp(-dt * 2.2);
          if (Math.abs(drag) < 0.05) drag = 0;
          return drag !== 0;
        });
      };
      if (draggable) {
        el.addEventListener("pointerdown", down);
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerup", up);
        el.addEventListener("pointercancel", up);
      }

      const stage: Stage = {
        rig,
        tray,
        scene,
        camera,
        look(s) {
          shot = s;
          invalidate();
        },
        invalidate,
        animate(tick) {
          ticker = tick;
          if (!raf) raf = requestAnimationFrame(frame);
        },
      };
      ready.current?.(stage);
      invalidate();
      setLoaded(true);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        el.removeEventListener("pointerdown", down);
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", up);
        el.removeEventListener("pointercancel", up);
        tray?.dispose();
        rig.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [withTray, draggable]);

  return (
    <div className={className}>
      <div
        ref={host}
        className={`relative size-full ${draggable ? "cursor-grab touch-pan-y active:cursor-grabbing" : ""}`}
      >
        {poster && (
          <Image
            src={poster}
            alt={posterAlt}
            width={1000}
            height={1000}
            className={`pointer-events-none absolute inset-0 m-auto size-full object-contain transition-opacity duration-700 ${loaded ? "opacity-0" : "opacity-100"}`}
          />
        )}
      </div>
    </div>
  );
}
