"use client";

import { useEffect, useRef } from "react";
import {
  Mesh, OrthographicCamera, PlaneGeometry,
  Scene, ShaderMaterial, Vector2, Vector3, WebGLRenderer,
} from "three";

const vertexShader = `
precision highp float;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const fragmentShader = `
precision highp float;
uniform float iTime;
uniform vec3  iResolution;
uniform float animationSpeed;
uniform bool enableTop;
uniform bool enableMiddle;
uniform bool enableBottom;
uniform int topLineCount;
uniform int middleLineCount;
uniform int bottomLineCount;
uniform float topLineDistance;
uniform float middleLineDistance;
uniform float bottomLineDistance;
uniform vec3 topWavePosition;
uniform vec3 middleWavePosition;
uniform vec3 bottomWavePosition;
uniform vec2 iMouse;
uniform bool interactive;
uniform float bendRadius;
uniform float bendStrength;
uniform float bendInfluence;
uniform bool parallax;
uniform float parallaxStrength;
uniform vec2 parallaxOffset;
uniform vec3 lineGradient[8];
uniform int lineGradientCount;

mat2 rotate(float r) {
  return mat2(cos(r), sin(r), -sin(r), cos(r));
}

vec3 getLineColor(float t) {
  if (lineGradientCount <= 0) return vec3(0.0, 1.0, 1.0);
  if (lineGradientCount == 1) return lineGradient[0];
  float clampedT = clamp(t, 0.0, 0.9999);
  float scaled = clampedT * float(lineGradientCount - 1);
  int idx = int(floor(scaled));
  float f = fract(scaled);
  int idx2 = min(idx + 1, lineGradientCount - 1);
  return mix(lineGradient[idx], lineGradient[idx2], f) * 0.5;
}

float wave(vec2 uv, float offset, vec2 screenUv, vec2 mouseUv, bool shouldBend) {
  float time = iTime * animationSpeed;
  float amp = sin(offset + time * 0.2) * 0.3;
  float y = sin(uv.x + offset + time * 0.1) * amp;
  if (shouldBend) {
    vec2 d = screenUv - mouseUv;
    float influence = exp(-dot(d, d) * bendRadius);
    y += (mouseUv.y - screenUv.y) * influence * bendStrength * bendInfluence;
  }
  float m = uv.y - y;
  return 0.0175 / max(abs(m) + 0.01, 1e-3) + 0.01;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 baseUv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
  baseUv.y *= -1.0;
  if (parallax) baseUv += parallaxOffset;
  vec3 col = vec3(0.0);
  vec2 mouseUv = vec2(0.0);
  if (interactive) {
    mouseUv = (2.0 * iMouse - iResolution.xy) / iResolution.y;
    mouseUv.y *= -1.0;
  }
  if (enableBottom) {
    for (int i = 0; i < 16; ++i) {
      if (i >= bottomLineCount) break;
      float fi = float(i);
      float t = fi / max(float(bottomLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t);
      float angle = bottomWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      col += lineCol * wave(ruv + vec2(bottomLineDistance * fi + bottomWavePosition.x, bottomWavePosition.y), 1.5 + 0.2 * fi, baseUv, mouseUv, interactive) * 0.2;
    }
  }
  if (enableMiddle) {
    for (int i = 0; i < 16; ++i) {
      if (i >= middleLineCount) break;
      float fi = float(i);
      float t = fi / max(float(middleLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t);
      float angle = middleWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      col += lineCol * wave(ruv + vec2(middleLineDistance * fi + middleWavePosition.x, middleWavePosition.y), 2.0 + 0.15 * fi, baseUv, mouseUv, interactive);
    }
  }
  if (enableTop) {
    for (int i = 0; i < 16; ++i) {
      if (i >= topLineCount) break;
      float fi = float(i);
      float t = fi / max(float(topLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t);
      float angle = topWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      ruv.x *= -1.0;
      col += lineCol * wave(ruv + vec2(topLineDistance * fi + topWavePosition.x, topWavePosition.y), 1.0 + 0.2 * fi, baseUv, mouseUv, interactive) * 0.1;
    }
  }
  fragColor = vec4(col, 1.0);
}

void main() {
  vec4 color = vec4(0.0);
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}`;

function hexToVec3(hex: string): Vector3 {
  let v = hex.trim().replace("#", "");
  if (v.length === 3) v = v[0]+v[0]+v[1]+v[1]+v[2]+v[2];
  return new Vector3(
    parseInt(v.slice(0,2),16)/255,
    parseInt(v.slice(2,4),16)/255,
    parseInt(v.slice(4,6),16)/255
  );
}

interface FloatingLinesProps {
  linesGradient?: string[];
  enabledWaves?: Array<"top"|"middle"|"bottom">;
  lineCount?: number | number[];
  lineDistance?: number | number[];
  animationSpeed?: number;
  interactive?: boolean;
  bendRadius?: number;
  bendStrength?: number;
  mouseDamping?: number;
  parallax?: boolean;
  parallaxStrength?: number;
  className?: string;
}

export default function FloatingLines({
  linesGradient = ["#00FFFF","#FF00FF","#6a6a6a"],
  enabledWaves = ["top","middle","bottom"],
  lineCount = 8,
  lineDistance = 8,
  animationSpeed = 1,
  interactive = true,
  bendRadius = 8,
  bendStrength = -2,
  mouseDamping = 0.05,
  parallax = true,
  parallaxStrength = 0.2,
  className = "",
}: FloatingLinesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetMouseRef = useRef(new Vector2(-1000,-1000));
  const currentMouseRef = useRef(new Vector2(-1000,-1000));
  const targetInfluenceRef = useRef(0);
  const currentInfluenceRef = useRef(0);
  const targetParallaxRef = useRef(new Vector2(0,0));
  const currentParallaxRef = useRef(new Vector2(0,0));

  const getCount = (wave: "top"|"middle"|"bottom") => {
    if (typeof lineCount === "number") return lineCount;
    const idx = enabledWaves.indexOf(wave);
    return idx >= 0 ? (lineCount[idx] ?? 6) : 0;
  };
  const getDist = (wave: "top"|"middle"|"bottom") => {
    if (typeof lineDistance === "number") return lineDistance;
    const idx = enabledWaves.indexOf(wave);
    return idx >= 0 ? (lineDistance[idx] ?? 5) : 5;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let active = true;

    const renderer = new WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new OrthographicCamera(-1,1,1,-1,0,1);
    camera.position.z = 1;

    const gradStops = linesGradient.slice(0,8);
    const gradVecs = Array.from({length:8},(_,i) =>
      i < gradStops.length ? hexToVec3(gradStops[i]) : new Vector3(1,1,1)
    );

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new Vector3(1,1,1) },
      animationSpeed: { value: animationSpeed },
      enableTop: { value: enabledWaves.includes("top") },
      enableMiddle: { value: enabledWaves.includes("middle") },
      enableBottom: { value: enabledWaves.includes("bottom") },
      topLineCount: { value: getCount("top") },
      middleLineCount: { value: getCount("middle") },
      bottomLineCount: { value: getCount("bottom") },
      topLineDistance: { value: getDist("top") * 0.01 },
      middleLineDistance: { value: getDist("middle") * 0.01 },
      bottomLineDistance: { value: getDist("bottom") * 0.01 },
      topWavePosition: { value: new Vector3(10.0, 0.5, -0.4) },
      middleWavePosition: { value: new Vector3(5.0, 0.0, 0.2) },
      bottomWavePosition: { value: new Vector3(2.0, -0.7, 0.4) },
      iMouse: { value: new Vector2(-1000,-1000) },
      interactive: { value: interactive },
      bendRadius: { value: bendRadius },
      bendStrength: { value: bendStrength },
      bendInfluence: { value: 0 },
      parallax: { value: parallax },
      parallaxStrength: { value: parallaxStrength },
      parallaxOffset: { value: new Vector2(0,0) },
      lineGradient: { value: gradVecs },
      lineGradientCount: { value: gradStops.length },
    };

    const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader });
    const mesh = new Mesh(new PlaneGeometry(2,2), material);
    scene.add(mesh);

    const clock = { startTime: performance.now(), getElapsedTime: () => (performance.now() - clock.startTime) / 1000 };

    const setSize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h, false);
      uniforms.iResolution.value.set(renderer.domElement.width, renderer.domElement.height, 1);
    };
    setSize();

    const ro = new ResizeObserver(() => { if (active) setSize(); });
    ro.observe(container);

    const onMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const dpr = renderer.getPixelRatio();
      targetMouseRef.current.set((e.clientX-rect.left)*dpr, (rect.height-(e.clientY-rect.top))*dpr);
      targetInfluenceRef.current = 1;
      if (parallax) {
        targetParallaxRef.current.set(
          ((e.clientX-rect.left)/rect.width - 0.5) * parallaxStrength,
          -((e.clientY-rect.top)/rect.height - 0.5) * parallaxStrength
        );
      }
    };
    const onLeave = () => { targetInfluenceRef.current = 0; };

    if (interactive) {
      renderer.domElement.addEventListener("pointermove", onMove);
      renderer.domElement.addEventListener("pointerleave", onLeave);
    }

    let raf = 0;
    const loop = () => {
      if (!active) return;
      uniforms.iTime.value = clock.getElapsedTime();
      currentMouseRef.current.lerp(targetMouseRef.current, mouseDamping);
      uniforms.iMouse.value.copy(currentMouseRef.current);
      currentInfluenceRef.current += (targetInfluenceRef.current - currentInfluenceRef.current) * mouseDamping;
      uniforms.bendInfluence.value = currentInfluenceRef.current;
      currentParallaxRef.current.lerp(targetParallaxRef.current, mouseDamping);
      uniforms.parallaxOffset.value.copy(currentParallaxRef.current);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      active = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (interactive) {
        renderer.domElement.removeEventListener("pointermove", onMove);
        renderer.domElement.removeEventListener("pointerleave", onLeave);
      }
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.parentElement?.removeChild(renderer.domElement);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}
    />
  );
}
