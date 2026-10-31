import { useCallback, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const orbitDefinitions = [
  { radiusX: 6.4, radiusY: 2.25, rotation: -0.12, tiltX: -0.28, tiltY: 0.12, z: -0.85, dashed: false, delay: 0 },
  { radiusX: 5.8, radiusY: 2.85, rotation: 0.18, tiltX: 0.22, tiltY: -0.2, z: -0.35, dashed: true, delay: 0.18 },
  { radiusX: 6.7, radiusY: 1.7, rotation: 0.08, tiltX: -0.14, tiltY: 0.26, z: 0.15, dashed: false, delay: 0.34 }
];

const nodePositions = [
  [-5.55, 0.5, 0.05],
  [-3.9, -1.55, 0.35],
  [-1.7, 1.95, -0.2],
  [0.15, -2.05, 0.25],
  [2.35, 1.55, -0.4],
  [4.25, -0.75, 0.15],
  [5.85, 0.95, -0.3]
];

const particlePositions = [
  [-5.2, 1.55, -1.2], [-4.45, -0.2, 0.75], [-3.2, 2.45, -1.7],
  [-2.6, -2.4, -0.7], [-1.15, 0.45, 1.1], [-0.45, 2.7, -1.4],
  [1.1, -2.8, -1.5], [1.65, 0.15, 0.9], [2.9, 2.5, -1.1],
  [3.55, -2.2, 0.8], [4.7, 1.9, -1.8], [5.35, -1.5, -0.9]
];

function createOrbit(definition, compact, narrow, reducedMotion) {
  const horizontalScale = narrow ? 0.12 : compact ? 0.32 : 1;
  const curve = new THREE.EllipseCurve(
    0,
    0,
    definition.radiusX * horizontalScale,
    compact ? definition.radiusY * 0.82 : definition.radiusY,
    0,
    Math.PI * 2,
    false,
    definition.rotation
  );
  const points = curve.getPoints(128).map(
    ({ x, y }) => new THREE.Vector3(x, y, definition.z)
  );
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  geometry.setDrawRange(0, reducedMotion ? points.length : 0);

  const material = definition.dashed
    ? new THREE.LineDashedMaterial({
        color: "#8b7bff",
        transparent: true,
        opacity: reducedMotion ? 0.32 : 0,
        dashSize: 0.14,
        gapSize: 0.1
      })
    : new THREE.LineBasicMaterial({
        color: "#8b7bff",
        transparent: true,
        opacity: reducedMotion ? 0.2 : 0
      });

  const line = new THREE.Line(geometry, material);
  if (definition.dashed) line.computeLineDistances();
  return line;
}

function Orbit({
  definition,
  compact,
  narrow,
  reducedMotion,
  index,
  activeProjectRef
}) {
  const lineRef = useRef(null);
  const setLineRef = useCallback((currentLine) => {
    if (lineRef.current && lineRef.current !== currentLine) {
      lineRef.current.geometry.dispose();
      lineRef.current.material.dispose();
    }
    lineRef.current = currentLine;
  }, []);
  const line = useMemo(
    () => createOrbit(definition, compact, narrow, reducedMotion),
    [definition, compact, narrow, reducedMotion]
  );

  useFrame((state) => {
    if (reducedMotion) return;
    const currentLine = lineRef.current;
    if (!currentLine) return;
    const progress = THREE.MathUtils.clamp(
      (state.clock.elapsedTime - definition.delay) / 1.8,
      0,
      1
    );
    const frameCount = currentLine.geometry.attributes.position.count;
    currentLine.geometry.setDrawRange(0, Math.ceil(frameCount * progress));
    const activeMultiplier =
      activeProjectRef.current === index ? 2 : 1;
    currentLine.material.opacity =
      (definition.dashed ? 0.32 : 0.2) * progress * activeMultiplier;
    if (progress < 1) state.invalidate();
  });

  return <primitive ref={setLineRef} object={line} />;
}

function DepthParticles({ compact, narrow }) {
  const particlesRef = useRef(null);
  const setParticlesRef = useCallback((particles) => {
    if (particlesRef.current && particlesRef.current !== particles) {
      particlesRef.current.geometry.dispose();
      particlesRef.current.material.dispose();
    }
    particlesRef.current = particles;
  }, []);
  const particles = useMemo(() => {
    const horizontalScale = narrow ? 0.12 : compact ? 0.32 : 1;
    const points = particlePositions.map(
      ([x, y, z]) => new THREE.Vector3(x * horizontalScale, y, z)
    );
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.PointsMaterial({
      color: "#9b8cff",
      size: 0.035,
      transparent: true,
      opacity: 0.36,
      sizeAttenuation: true,
      depthWrite: false
    });
    return new THREE.Points(geometry, material);
  }, [compact, narrow]);

  return <primitive ref={setParticlesRef} object={particles} />;
}

function ConstellationNode({
  position,
  index,
  compact,
  narrow,
  reducedMotion,
  activeProjectRef
}) {
  const meshRef = useRef(null);
  const materialRef = useRef(null);
  const delay = 0.55 + index * 0.13;
  const radius = index === 3 ? 0.105 : index % 2 === 0 ? 0.075 : 0.055;

  useFrame((state) => {
    if (reducedMotion) return;
    if (!meshRef.current || !materialRef.current) return;
    const progress = THREE.MathUtils.clamp(
      (state.clock.elapsedTime - delay) / 0.75,
      0,
      1
    );
    const active = activeProjectRef.current === index % orbitDefinitions.length;
    meshRef.current.scale.setScalar(
      (0.15 + progress * 0.85) * (active ? 1.28 : 1)
    );
    materialRef.current.opacity =
      (0.22 + progress * 0.62) * (active ? 1 : 0.76);
    materialRef.current.emissiveIntensity = active ? 1.25 : 0.55;
    if (progress < 1) state.invalidate();
  });

  if (compact && index % 2 === 1) return null;
  const nodePosition = narrow
    ? [position[0] * 0.12, position[1], position[2]]
    : compact
      ? [position[0] * 0.32, position[1], position[2]]
      : position;

  return (
    <mesh
      ref={meshRef}
      position={nodePosition}
      scale={reducedMotion ? 1 : 0.15}
    >
      <sphereGeometry args={[radius, 14, 14]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#ede9fe"
        emissive={index === 3 ? "#5035ff" : "#8b7bff"}
        emissiveIntensity={reducedMotion ? 0.7 : 0.55}
        roughness={0.38}
        metalness={0}
        transparent
        opacity={reducedMotion ? 0.84 : 0}
      />
    </mesh>
  );
}

function PathGlint({ compact, narrow, reducedMotion }) {
  const meshRef = useRef(null);
  const definition = orbitDefinitions[0];
  const horizontalScale = narrow ? 0.12 : compact ? 0.32 : 1;
  const curve = useMemo(
    () =>
      new THREE.EllipseCurve(
        0,
        0,
        definition.radiusX * horizontalScale,
        compact ? definition.radiusY * 0.82 : definition.radiusY,
        0,
        Math.PI * 2,
        false,
        definition.rotation
      ),
    [compact, definition, horizontalScale]
  );

  useFrame((state) => {
    if (reducedMotion || !meshRef.current) return;
    const progress = (state.clock.elapsedTime - 1.05) / 2.4;
    if (progress < 0 || progress > 1) {
      meshRef.current.visible = false;
      if (progress < 0) state.invalidate();
      return;
    }

    const point = curve.getPointAt(progress);
    meshRef.current.position.set(point.x, point.y, definition.z + 0.025);
    meshRef.current.visible = true;
    const fade = Math.min(progress * 5, (1 - progress) * 5, 1);
    meshRef.current.scale.setScalar(Math.max(0.1, fade));
    state.invalidate();
  });

  return (
    <group
      rotation={[definition.tiltX, definition.tiltY, 0]}
    >
      <mesh ref={meshRef} visible={false}>
        <sphereGeometry args={[0.075, 12, 12]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#8b7bff"
          emissiveIntensity={1.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

function CameraParallax({ pointerRef, reducedMotion }) {
  const cameraRef = useRef(null);
  const { camera, invalidate } = useThree();

  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);

  useFrame(() => {
    if (reducedMotion) return;
    const camera = cameraRef.current;
    if (!camera) return;
    const { x, y } = pointerRef.current;
    const targetX = x * 0.16;
    const targetY = -y * 0.1;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.08);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.08);
    camera.lookAt(0, 0, 0);

    if (
      Math.abs(camera.position.x - targetX) > 0.001 ||
      Math.abs(camera.position.y - targetY) > 0.001
    ) {
      invalidate();
    }
  });

  return null;
}

function ConstellationScene({
  compact,
  narrow,
  pointerRef,
  reducedMotion,
  activeProjectRef
}) {
  return (
    <>
      <CameraParallax
        pointerRef={pointerRef}
        reducedMotion={reducedMotion}
      />
      <ambientLight intensity={0.7} />
      <pointLight
        position={[-2.8, 2.4, 3.5]}
        color="#c4b5fd"
        intensity={7}
        distance={11}
        decay={2}
      />
      <pointLight
        position={[3.2, -1.6, 2.2]}
        color="#8b7bff"
        intensity={4}
        distance={9}
        decay={2}
      />
      <group>
        <DepthParticles compact={compact} narrow={narrow} />
        <PathGlint
          compact={compact}
          narrow={narrow}
          reducedMotion={reducedMotion}
        />
        {orbitDefinitions.map((definition, index) => (
          <group
            key={`${definition.radiusX}-${definition.rotation}`}
            rotation={[definition.tiltX, definition.tiltY, 0]}
          >
            <Orbit
              definition={definition}
              compact={compact}
              narrow={narrow}
              reducedMotion={reducedMotion}
              index={index}
              activeProjectRef={activeProjectRef}
            />
          </group>
        ))}
        {nodePositions.map((position, index) => (
          <ConstellationNode
            key={position.join("-")}
            position={position}
            index={index}
            compact={compact}
            narrow={narrow}
            reducedMotion={reducedMotion}
            activeProjectRef={activeProjectRef}
          />
        ))}
      </group>
    </>
  );
}

function ConstellationFallback() {
  return (
    <svg
      className="tf-constellation-fallback"
      viewBox="0 0 1440 520"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <path d="M80 260C300 80 520 80 720 260S1140 440 1360 260" />
      <path d="M130 350C360 500 530 20 760 175S1110 430 1310 120" />
      <path d="M160 100C450 390 950 390 1280 120" />
      <circle cx="245" cy="230" r="5" />
      <circle cx="720" cy="260" r="7" />
      <circle cx="1190" cy="230" r="5" />
    </svg>
  );
}

export default function ProjectConstellation({
  compact = false,
  narrow = false,
  reducedMotion = false,
  pointerRef,
  activeProjectRef,
  invalidateRef
}) {
  useEffect(
    () => () => {
      invalidateRef.current = null;
    },
    [invalidateRef]
  );

  return (
    <div className="tf-constellation-canvas" aria-hidden="true">
      <Canvas
        frameloop="demand"
        dpr={[1, 1.35]}
        camera={{ position: [0, 0, 8], fov: 48 }}
        gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
        fallback={<ConstellationFallback />}
        onCreated={({ invalidate }) => {
          invalidateRef.current = invalidate;
          invalidate();
        }}
      >
        <ConstellationScene
          compact={compact}
          narrow={narrow}
          pointerRef={pointerRef}
          reducedMotion={reducedMotion}
          activeProjectRef={activeProjectRef}
        />
      </Canvas>
    </div>
  );
}
