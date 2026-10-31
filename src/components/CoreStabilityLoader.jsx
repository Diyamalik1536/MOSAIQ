import { useEffect, useRef, useState } from 'react';
import './CoreStabilityLoader.css';

const TELEMETRY_LINES = [
  "L STAB // K13",
  "ACCESS LU-K // MK",
  "SUBJ KD6-893 // N9",
  "CORE 37.3C // 41LX",
  "SYNC 99% TEMP 37C",
  "DRIFT 06MS CALM",
  "V-RAIL 0.99V HOLD",
  "LATTICE 83%",
  "MEM-ECHO 17% LOW",
  "AFFECT FLAT 9%",
  "CELLS 1.22M LINKED",
  "STATUS // NOMINAL",
  "PHASE 02 // LOCKED",
  "NOISE 06DB QUIET",
  "INTEGRITY 100%"
];

const SPHERE_GLYPHS = ['.', ':', '*', 'o', '0', '8', '#', '@'];
const FIBONACCI_PHI = Math.PI * (3 - Math.sqrt(5)); // Golden angle

export default function CoreStabilityLoader({ fullScreen = true, text = "LOADING MOSAIQ" }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [telemetryIdx, setTelemetryIdx] = useState(0);
  const [dots, setDots] = useState(".");

  // Mouse tilt tracking
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Telemetry cycle timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryIdx((prev) => (prev + 1) % TELEMETRY_LINES.length);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  // Dots animation timer
  useEffect(() => {
    const dotTimer = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 450);
    return () => clearInterval(dotTimer);
  }, []);

  // Mouse move handler
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    mouseRef.current.targetX = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width / 2)));
    mouseRef.current.targetY = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2)));
  };

  const handleMouseLeave = () => {
    mouseRef.current.targetX = 0;
    mouseRef.current.targetY = 0;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let startTime = performance.now();

    // Precompute Fibonacci sphere points
    const N_SPHERE = 340;
    const spherePoints = [];
    for (let i = 0; i < N_SPHERE; i++) {
      const yNorm = 1.0 - (i / (N_SPHERE - 1)) * 2.0;
      const rCircle = Math.sqrt(Math.max(0.0, 1.0 - yNorm * yNorm));
      const phi = i * FIBONACCI_PHI;
      spherePoints.push({
        x: Math.cos(phi) * rCircle,
        y: yNorm,
        z: Math.sin(phi) * rCircle
      });
    }

    // Outer lattice parameters
    const N_RINGS = 16;
    const N_RAYS = 64;

    const render = (now) => {
      const timeSec = (now - startTime) / 1000.0;
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;

      const cx = width / 2;
      const cy = height / 2;

      // Base orientation and interaction
      const basePitch = 0.52 + 0.04 * Math.sin(timeSec * 0.5) - mouseRef.current.y * 0.28;
      const baseYaw = 0.24 + 0.04 * Math.cos(timeSec * 0.4) + mouseRef.current.x * 0.32;
      const inPlaneSpin = timeSec * 0.25;

      const cosP = Math.cos(basePitch);
      const sinP = Math.sin(basePitch);
      const cosY = Math.cos(baseYaw);
      const sinY = Math.sin(baseYaw);
      const cosS = Math.cos(inPlaneSpin);
      const sinS = Math.sin(inPlaneSpin);

      // 3D rotation function
      const rotatePoint = (x, y, z) => {
        // Spin in plane
        const x1 = x * cosS - y * sinS;
        const y1 = x * sinS + y * cosS;
        const z1 = z;
        // Pitch
        const y2 = y1 * cosP - z1 * sinP;
        const z2 = y1 * sinP + z1 * cosP;
        const x2 = x1;
        // Yaw
        const x3 = x2 * cosY + z2 * sinY;
        const z3 = -x2 * sinY + z2 * cosY;
        const y3 = y2;
        return [x3, y3, z3];
      };

      const renderItems = [];

      // Scale factors based on canvas size
      const baseScale = Math.min(width, height) / 360.0;
      const Rs = 36.0 * baseScale;
      const rInner = 48.0 * baseScale;
      const rOuterSpan = 54.0 * baseScale;

      // 1. Central ASCII Sphere
      for (let i = 0; i < N_SPHERE; i++) {
        const pt = spherePoints[i];
        const sx = pt.x * Rs;
        const sy = pt.y * Rs;
        const sz = pt.z * Rs;

        const [rx, ry, rz] = rotatePoint(sx, sy, sz);

        // Directional lighting from top-left front
        const nx = rx / Rs;
        const ny = ry / Rs;
        const nz = rz / Rs;
        const diff = -0.35 * nx - 0.5 * ny + 0.8 * nz;
        const lum = Math.max(0.0, Math.min(1.0, diff * 0.75 + 0.35));

        const charIdx = Math.floor(lum * (SPHERE_GLYPHS.length - 1));
        const glyph = SPHERE_GLYPHS[charIdx];
        const brightness = Math.floor(90 + lum * 165);

        renderItems.push({
          z: rz,
          x: rx,
          y: ry,
          glyph,
          color: `rgb(${brightness}, ${Math.floor(brightness * 0.95)}, ${Math.floor(brightness * 0.9)})`,
          size: 9.5 * baseScale
        });
      }

      // 2. Outer Morphing Lattice
      const cycle = (timeSec % 8.0) / 8.0;
      const phase = cycle * 4.0;
      const pIdx = Math.floor(phase) % 4;
      const tBlend = phase - Math.floor(phase);
      const sBlend = tBlend * tBlend * (3.0 - 2.0 * tBlend);

      let wSq; let wSt; let wCl;
      if (pIdx === 0) {
        wSq = 1.0 - sBlend;
        wSt = sBlend;
      } else if (pIdx === 1) {
        wSt = 1.0 - sBlend;
        wCl = sBlend;
      } else if (pIdx === 2) {
        wCl = 1.0 - sBlend;
        wSt = sBlend;
      } else {
        wSt = 1.0 - sBlend;
        wSq = sBlend;
      }

      for (let ri = 0; ri < N_RINGS; ri++) {
        const rBase = rInner + (ri / (N_RINGS - 1)) * rOuterSpan;
        const rNorm = (ri + 1) / N_RINGS;

        for (let ai = 0; ai < N_RAYS; ai++) {
          const th = ai * ((2.0 * Math.PI) / N_RAYS);

          // Shape 1: Square Diamond
          const cos4 = Math.cos(4.0 * th);
          const rSq = rBase * (1.0 + 0.22 * cos4);

          // Shape 2: 4-pointed Star with Twist
          const twist = 0.55 * rNorm * rNorm;
          const rSt = rBase * (1.0 + 0.65 * Math.cos(4.0 * (th - twist)));

          // Shape 3: 4-lobed Clover / Cross
          const rCl = rBase * (0.8 + 0.55 * Math.abs(Math.cos(2.0 * th)));

          const rFinal = wSq * rSq + wSt * rSt + wCl * rCl;
          const thFinal = th + wSt * twist * 0.7;

          const lx = rFinal * Math.cos(thFinal);
          const ly = rFinal * Math.sin(thFinal);
          const lz = (3.5 * wSq + 8.5 * wSt + 5.5 * wCl) *
            Math.sin(3.5 * rNorm - timeSec * 1.6) *
            Math.cos(4.0 * th) * baseScale;

          const [rx, ry, rz] = rotatePoint(lx, ly, lz);

          // Monospace ASCII glyph choice
          let ch;
          const cosVal = Math.cos(thFinal);
          const sinVal = Math.sin(thFinal);

          if (cosVal > 0 && sinVal > 0) {
            ch = ai % 2 === 0 ? 'd' : 'q';
          } else if (cosVal < 0 && sinVal > 0) {
            ch = ai % 2 === 0 ? 'p' : 'b';
          } else if (cosVal < 0 && sinVal < 0) {
            ch = ai % 2 === 0 ? 'b' : 'p';
          } else {
            ch = ai % 2 === 0 ? 'q' : 'd';
          }

          if (ri < 2) {
            ch = ai % 2 === 0 ? '0' : 'o';
          } else if (ri === N_RINGS - 1 && ai % 4 === 0) {
            ch = '8';
          }

          const alpha = Math.max(0.3, Math.min(1.0, 0.45 + (rz + 75 * baseScale) / (150 * baseScale)));
          const cr = Math.floor(225 * alpha);
          const cg = Math.floor(218 * alpha);
          const cb = Math.floor(210 * alpha);

          renderItems.push({
            z: rz,
            x: rx,
            y: ry,
            glyph: ch,
            color: `rgba(${cr}, ${cg}, ${cb}, ${alpha.toFixed(2)})`,
            size: 9.0 * baseScale
          });
        }
      }

      // Depth sort back-to-front
      renderItems.sort((a, b) => a.z - b.z);

      // Render Glyphs to Canvas
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(255, 235, 220, 0.4)';
      ctx.shadowBlur = 3;

      const fov = 340.0 * baseScale;
      const zOffset = 90.0 * baseScale;

      for (let i = 0; i < renderItems.length; i++) {
        const item = renderItems[i];
        const scale = fov / (fov + item.z + zOffset);
        const px = cx + item.x * scale;
        const py = cy + item.y * scale;

        ctx.font = `bold ${Math.max(6, Math.round(item.size * scale))}px monospace`;
        ctx.fillStyle = item.color;
        ctx.fillText(item.glyph, px, py);
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // 3 telemetry lines to display
  const l1 = TELEMETRY_LINES[telemetryIdx % TELEMETRY_LINES.length];
  const l2 = TELEMETRY_LINES[(telemetryIdx + 1) % TELEMETRY_LINES.length];
  const l3 = TELEMETRY_LINES[(telemetryIdx + 2) % TELEMETRY_LINES.length];

  // Dynamic bottom right indicator style cycling
  const brState = telemetryIdx % 3;

  return (
    <div
      className={`core-loader-container ${fullScreen ? 'fullscreen' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="core-loader-hud" ref={containerRef}>
        {/* 4 Corner HUD Brackets */}
        <div className="core-hud-bracket tl" />
        <div className="core-hud-bracket tr" />
        <div className="core-hud-bracket bl" />
        <div className="core-hud-bracket br" />

        {/* Top-Left Title */}
        <div className="core-hud-tl">
          <span>CORE</span>
          <span>STABILITY</span>
        </div>

        {/* Top-Right Hatched Box */}
        <div className="core-hud-tr" />

        {/* Center 3D ASCII Canvas */}
        <canvas ref={canvasRef} className="core-loader-canvas" />

        {/* Center Bottom Loading Status */}
        <div className="core-hud-status">
          <span className="core-hud-status-indicator" />
          <span>{text}</span>
          <span className="core-hud-status-dots">{dots}</span>
        </div>

        {/* Bottom-Left Baseline Telemetry */}
        <div className="core-hud-bl">
          <div className="core-telemetry-line">{l1}</div>
          <div className="core-telemetry-line">{l2}</div>
          <div className="core-telemetry-line">{l3}</div>
        </div>

        {/* Bottom-Right Indicator */}
        <div className="core-hud-br">
          {brState === 0 && (
            <>
              <div className="core-br-box-small" />
              <div className="core-br-box-large" />
            </>
          )}
          {brState === 1 && (
            <div className="core-br-box-stacked">
              <div className="core-br-box-tiny" />
              <div className="core-br-box-tiny" />
            </div>
          )}
          {brState === 2 && (
            <>
              <div className="core-br-box-large" style={{ backgroundColor: '#ded7ce' }} />
              <div className="core-br-box-small" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
