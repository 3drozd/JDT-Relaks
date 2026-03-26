"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useGLTF, Center, Html } from "@react-three/drei";
import { EffectComposer, Outline } from "@react-three/postprocessing";
import { Suspense, useEffect, useRef, useCallback, useState } from "react";
import * as THREE from "three";

// ── 3D scene params (mutable ref for lil-gui) ──────────────────────

const sceneParams = {
  // Camera
  camX: 0, camY: 2, camZ: 4, fov: 45,
  // Ambient
  ambientIntensity: 0.15,
  // Spot light
  spotX: 1, spotY: 4, spotZ: -1,
  spotIntensity: 6, spotAngle: 0.7, spotPenumbra: 0.8,
  spotColor: "#fff5e6",
  // Directional (backlight)
  dirX: 2, dirY: 3, dirZ: -8, dirIntensity: 1, dirColor: "#ffffff",
  // Point light (blue from below)
  ptX: 0, ptY: -3, ptZ: 2,
  ptIntensity: 4, ptColor: "#4488ff", ptDistance: 10,
  // Model rotation
  rotBaseY: 0.4, rotX: 0.3, rotZ: -0.15, scrollMul: 0.002,
  // Play mode rotation
  playRotX: 0.75, playRotZ: 0, playScrollMul: 0,
};

function getNoteLetter(meshName: string): string {
  return meshName.replace("Key_", "").replace(/\d+$/, "");
}

// ── Camera updater ──────────────────────────────────────────────────

function CameraUpdater() {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.set(sceneParams.camX, sceneParams.camY, sceneParams.camZ);
    if ((camera as THREE.PerspectiveCamera).fov !== sceneParams.fov) {
      (camera as THREE.PerspectiveCamera).fov = sceneParams.fov;
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    }
  });
  return null;
}

// ── Lights (read from sceneParams every frame) ──────────────────────

function SceneLights() {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const spotRef = useRef<THREE.SpotLight>(null);
  const spotTargetRef = useRef<THREE.Object3D>(null);
  const dirRef = useRef<THREE.DirectionalLight>(null);
  const ptRef = useRef<THREE.PointLight>(null);

  useEffect(() => {
    if (spotRef.current && spotTargetRef.current) {
      spotRef.current.target = spotTargetRef.current;
    }
  }, []);

  useFrame(() => {
    if (ambientRef.current) {
      ambientRef.current.intensity = sceneParams.ambientIntensity;
    }
    if (spotRef.current) {
      spotRef.current.position.set(sceneParams.spotX, sceneParams.spotY, sceneParams.spotZ);
      spotRef.current.intensity = sceneParams.spotIntensity;
      spotRef.current.angle = sceneParams.spotAngle;
      spotRef.current.penumbra = sceneParams.spotPenumbra;
      spotRef.current.color.set(sceneParams.spotColor);
    }
    if (dirRef.current) {
      dirRef.current.position.set(sceneParams.dirX, sceneParams.dirY, sceneParams.dirZ);
      dirRef.current.intensity = sceneParams.dirIntensity;
      dirRef.current.color.set(sceneParams.dirColor);
    }
    if (ptRef.current) {
      ptRef.current.position.set(sceneParams.ptX, sceneParams.ptY, sceneParams.ptZ);
      ptRef.current.intensity = sceneParams.ptIntensity;
      ptRef.current.color.set(sceneParams.ptColor);
      ptRef.current.distance = sceneParams.ptDistance;
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={sceneParams.ambientIntensity} />
      <spotLight ref={spotRef} castShadow={false} />
      <object3D ref={spotTargetRef} position={[0, 0, 0]} />
      <directionalLight ref={dirRef} />
      <pointLight ref={ptRef} />
    </>
  );
}

// ── Ripple effect ────────────────────────────────────────────────────

interface RippleData {
  id: number;
  position: THREE.Vector3;
  normal: THREE.Vector3;
}

function Ripple({ position, normal, onDone }: { position: THREE.Vector3; normal: THREE.Vector3; onDone: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const progress = useRef(0);

  // Orient ring to face along the surface normal
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    normal
  );

  useFrame((_, delta) => {
    progress.current += delta * 2.5;
    if (!meshRef.current) return;
    const t = progress.current;
    const scale = 0.05 + t * 0.4;
    meshRef.current.scale.set(scale, scale, scale);
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = Math.max(0, 1 - t);
    if (t >= 1) onDone();
  });

  return (
    <mesh ref={meshRef} position={position} quaternion={quaternion}>
      <ringGeometry args={[0.8, 1, 32]} />
      <meshBasicMaterial color="#D4A843" transparent opacity={1} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

// ── Glow manager (animate emissive back to 0) ───────────────────────

interface GlowEntry {
  mesh: THREE.Mesh;
  progress: number;
}

function GlowManager() {
  const glowingRef = useRef<GlowEntry[]>([]);

  useFrame((_, delta) => {
    for (let i = glowingRef.current.length - 1; i >= 0; i--) {
      const entry = glowingRef.current[i];
      entry.progress += delta * 3;
      const mat = entry.mesh.material as THREE.MeshStandardMaterial;
      if (mat.emissiveIntensity !== undefined) {
        mat.emissiveIntensity = Math.max(0, 1.5 * (1 - entry.progress));
      }
      if (entry.progress >= 1) {
        mat.emissiveIntensity = 0;
        glowingRef.current.splice(i, 1);
      }
    }
  });

  return null;
}

// Expose glow trigger via module-scope ref
const glowQueue: THREE.Mesh[] = [];
function useGlowTrigger() {
  const glowingRef = useRef<GlowEntry[]>([]);

  useFrame((_, delta) => {
    // Process queue
    while (glowQueue.length > 0) {
      const mesh = glowQueue.pop()!;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat.emissive) {
        mat.emissive.set("#D4A843");
        mat.emissiveIntensity = 1.5;
      }
      glowingRef.current.push({ mesh, progress: 0 });
    }
    // Animate
    for (let i = glowingRef.current.length - 1; i >= 0; i--) {
      const entry = glowingRef.current[i];
      entry.progress += delta * 3;
      const mat = entry.mesh.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = Math.max(0, 1.5 * (1 - entry.progress));
      if (entry.progress >= 1) {
        mat.emissiveIntensity = 0;
        glowingRef.current.splice(i, 1);
      }
    }
  });

  return null;
}

function GlowAnimator() {
  useGlowTrigger();
  return null;
}

// ── Drum model ──────────────────────────────────────────────────────

function DrumModel({ onHover, onKeyClick, playMode }: { onHover: (mesh: THREE.Mesh | null) => void; onKeyClick?: (note: string) => void; playMode?: boolean }) {
  const { scene } = useGLTF("/models/TankDrumJDT.glb");
  const clonedRef = useRef(false);
  const [hoveredKey, setHoveredKey] = useState<{
    note: string;
    position: THREE.Vector3;
  } | null>(null);
  const [ripples, setRipples] = useState<RippleData[]>([]);
  const rippleId = useRef(0);

  useEffect(() => {
    if (clonedRef.current) return;
    clonedRef.current = true;
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.computeVertexNormals();
        if (child.material) {
          child.material = child.material.clone();
        }
      }
    });
  }, [scene]);

  const isKey = (name: string) => name.startsWith("Key_");

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      if (!isKey(e.object.name)) return;
      onHover(e.object as THREE.Mesh);
      const worldPos = new THREE.Vector3();
      e.object.getWorldPosition(worldPos);
      setHoveredKey({ note: getNoteLetter(e.object.name), position: worldPos });
      document.body.style.cursor = "pointer";
    },
    [onHover]
  );

  const handlePointerOut = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      if (!isKey(e.object.name)) return;
      onHover(null);
      setHoveredKey(null);
      document.body.style.cursor = "auto";
    },
    [onHover]
  );

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!isKey(e.object.name)) return;

    // Glow pulse
    glowQueue.push(e.object as THREE.Mesh);

    // Ripple at click point
    if (e.point && e.face) {
      const id = ++rippleId.current;
      setRipples((prev) => [...prev, { id, position: e.point.clone(), normal: e.face!.normal.clone().transformDirection(e.object.matrixWorld).normalize() }]);
    }

    // Callback
    onKeyClick?.(getNoteLetter(e.object.name));
  }, [onKeyClick]);

  const removeRipple = useCallback((id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const scrollY = window.scrollY;
    const lerpSpeed = 3 * delta;
    const targetX = playMode ? sceneParams.playRotX : sceneParams.rotX;
    const targetZ = playMode ? sceneParams.playRotZ : sceneParams.rotZ;
    const scrollMul = playMode ? sceneParams.playScrollMul : sceneParams.scrollMul;

    groupRef.current.rotation.y += (sceneParams.rotBaseY + scrollY * scrollMul - groupRef.current.rotation.y) * lerpSpeed;
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * lerpSpeed;
    groupRef.current.rotation.z += (targetZ - groupRef.current.rotation.z) * lerpSpeed;
  });

  return (
    <Center>
      <group ref={groupRef}>
        <primitive
          object={scene}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        />
        {hoveredKey && (
          <Html
            position={[
              hoveredKey.position.x,
              hoveredKey.position.y + 0.15,
              hoveredKey.position.z,
            ]}
            center
            style={{ pointerEvents: "none" }}
          >
            <div
              style={{
                background: "rgba(0, 0, 0, 0.75)",
                color: "#D4A843",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "bold",
                whiteSpace: "nowrap",
              }}
            >
              {hoveredKey.note}
            </div>
          </Html>
        )}
        {ripples.map((r) => (
          <Ripple key={r.id} position={r.position} normal={r.normal} onDone={() => removeRipple(r.id)} />
        ))}
      </group>
    </Center>
  );
}

// ── lil-gui setup (dev only) ────────────────────────────────────────

function DevGui() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    let gui: InstanceType<typeof import("lil-gui").default> | null = null;

    import("lil-gui").then(({ default: GUI }) => {
      gui = new GUI({ title: "3D Scene", width: 260 });
      gui.domElement.style.position = "absolute";
      gui.domElement.style.top = "0";
      gui.domElement.style.right = "0";
      gui.domElement.style.zIndex = "100";

      const cam = gui.addFolder("Camera");
      cam.add(sceneParams, "camX", -10, 10, 0.1).name("X");
      cam.add(sceneParams, "camY", -10, 10, 0.1).name("Y");
      cam.add(sceneParams, "camZ", -10, 10, 0.1).name("Z");
      cam.add(sceneParams, "fov", 10, 120, 1).name("FOV");
      cam.close();

      const amb = gui.addFolder("Ambient");
      amb.add(sceneParams, "ambientIntensity", 0, 2, 0.05).name("Intensity");
      amb.close();

      const spot = gui.addFolder("Spot Light");
      spot.add(sceneParams, "spotX", -10, 10, 0.1).name("X");
      spot.add(sceneParams, "spotY", -10, 10, 0.1).name("Y");
      spot.add(sceneParams, "spotZ", -10, 10, 0.1).name("Z");
      spot.add(sceneParams, "spotIntensity", 0, 20, 0.5).name("Intensity");
      spot.add(sceneParams, "spotAngle", 0.1, 1.5, 0.05).name("Angle");
      spot.add(sceneParams, "spotPenumbra", 0, 1, 0.05).name("Penumbra");
      spot.addColor(sceneParams, "spotColor").name("Color");

      const dir = gui.addFolder("Backlight");
      dir.add(sceneParams, "dirX", -10, 10, 0.1).name("X");
      dir.add(sceneParams, "dirY", -10, 10, 0.1).name("Y");
      dir.add(sceneParams, "dirZ", -10, 10, 0.1).name("Z");
      dir.add(sceneParams, "dirIntensity", 0, 10, 0.1).name("Intensity");
      dir.addColor(sceneParams, "dirColor").name("Color");
      dir.close();

      const pt = gui.addFolder("Blue Light");
      pt.add(sceneParams, "ptX", -10, 10, 0.1).name("X");
      pt.add(sceneParams, "ptY", -10, 10, 0.1).name("Y");
      pt.add(sceneParams, "ptZ", -10, 10, 0.1).name("Z");
      pt.add(sceneParams, "ptIntensity", 0, 20, 0.5).name("Intensity");
      pt.addColor(sceneParams, "ptColor").name("Color");
      pt.add(sceneParams, "ptDistance", 0, 30, 1).name("Distance");
      pt.close();

      const rot = gui.addFolder("Model Rotation");
      rot.add(sceneParams, "rotBaseY", -3.14, 3.14, 0.01).name("Base Y");
      rot.add(sceneParams, "rotX", -3.14, 3.14, 0.01).name("X");
      rot.add(sceneParams, "rotZ", -3.14, 3.14, 0.01).name("Z");
      rot.add(sceneParams, "scrollMul", 0, 0.01, 0.0005).name("Scroll Mul");
      rot.close();

      // Copy button
      gui.add({
        copy: () => {
          const text = [
            "=== 3D Scene ===",
            `camera.position: [${sceneParams.camX}, ${sceneParams.camY}, ${sceneParams.camZ}]`,
            `camera.fov: ${sceneParams.fov}`,
            `ambientLight.intensity: ${sceneParams.ambientIntensity}`,
            `spotLight.position: [${sceneParams.spotX}, ${sceneParams.spotY}, ${sceneParams.spotZ}]`,
            `spotLight.intensity: ${sceneParams.spotIntensity}`,
            `spotLight.angle: ${sceneParams.spotAngle}`,
            `spotLight.penumbra: ${sceneParams.spotPenumbra}`,
            `spotLight.color: "${sceneParams.spotColor}"`,
            `dirLight.position: [${sceneParams.dirX}, ${sceneParams.dirY}, ${sceneParams.dirZ}]`,
            `dirLight.intensity: ${sceneParams.dirIntensity}`,
            `pointLight.position: [${sceneParams.ptX}, ${sceneParams.ptY}, ${sceneParams.ptZ}]`,
            `pointLight.intensity: ${sceneParams.ptIntensity}`,
            `pointLight.color: "${sceneParams.ptColor}"`,
            `pointLight.distance: ${sceneParams.ptDistance}`,
            `rotation.baseY: ${sceneParams.rotBaseY}`,
            `rotation.x: ${sceneParams.rotX}`,
            `rotation.z: ${sceneParams.rotZ}`,
            `rotation.scrollMul: ${sceneParams.scrollMul}`,
          ].join("\n");
          navigator.clipboard.writeText(text);
        },
      }, "copy").name("📋 Copy All Params");
    });

    return () => {
      gui?.destroy();
    };
  }, []);

  return null;
}

// ── Main scene ──────────────────────────────────────────────────────

export function TankDrumScene({ onKeyClick, playMode }: { onKeyClick?: (note: string) => void; playMode?: boolean } = {}) {
  const [hovered, setHovered] = useState<THREE.Mesh | null>(null);

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 2, 4], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent", marginTop: 2 }}
    >
      <CameraUpdater />
      <SceneLights />
      <GlowAnimator />
      {process.env.NODE_ENV === "development" && <DevGui />}
      <Suspense fallback={null}>
        <DrumModel onHover={setHovered} onKeyClick={onKeyClick} playMode={playMode} />
      </Suspense>
      <EffectComposer autoClear={false}>
        <Outline
          selection={hovered ? [hovered] : []}
          edgeStrength={3}
          pulseSpeed={0.5}
          visibleEdgeColor={0xd4a843}
          hiddenEdgeColor={0x333300}
          blur
        />
      </EffectComposer>
    </Canvas>
  );
}

useGLTF.preload("/models/TankDrumJDT.glb");
