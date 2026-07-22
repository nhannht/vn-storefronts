"use client";

import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, RenderTarget, Vec3 } from "ogl";
import { useTheme } from "./theme-provider";

// Single-hue (champagne gold) ambient glow. Noise is BAKED once into a texture
// at init; the per-frame shader does two texture taps plus analytic radial
// falloff, so it holds the budget. No hue rotation - one gold family only.

const vert = /* glsl */ `
  precision highp float;
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
`;

const bakeFrag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * vnoise(p); p *= 2.03; a *= 0.5; } return s; }
  void main(){
    vec2 p = vUv * 4.0;
    gl_FragColor = vec4(fbm(p), fbm(p * 1.7 + 19.1), fbm(p * 0.6 - 7.3), 1.0);
  }
`;

const drawFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D tNoise;
  uniform float iTime;
  uniform vec3 gold;
  varying vec2 vUv;
  void main(){
    vec2 uv = vUv;
    float d = distance(uv, vec2(0.5));
    // slow, incommensurate drift so the churn never visibly repeats
    vec2 drift = vec2(sin(iTime * 0.061), cos(iTime * 0.047)) * 0.12;
    vec2 drift2 = vec2(cos(iTime * 0.033), sin(iTime * 0.029)) * 0.08;
    float n1 = texture2D(tNoise, uv * 1.15 + drift).r;
    float n2 = texture2D(tNoise, uv * 0.8 - drift2).g;
    float churn = 0.5 + 0.5 * mix(n1, n2, 0.5);
    float glow = pow(smoothstep(0.66, 0.02, d), 1.7);
    float a = glow * churn * 0.9;
    gl_FragColor = vec4(gold * a, a); // premultiplied
  }
`;

export function AmbientGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const renderer = new Renderer({ alpha: true, premultipliedAlpha: true });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    el.appendChild(gl.canvas);

    // Gold uniform is JS-parsed for WebGL, so it cannot read a CSS var. These
    // RGB floats are the one mirrored literal per JS color; keep in sync with
    // the --accent token in tokens.css (dark gold / light bronze).
    const gold =
      theme === "light" ? [0.502, 0.388, 0.149] : [0.894, 0.773, 0.494];

    const geometry = new Triangle(gl);

    // Bake the noise fields once.
    const target = new RenderTarget(gl, { width: 1024, height: 1024 });
    const bake = new Mesh(gl, {
      geometry,
      program: new Program(gl, { vertex: vert, fragment: bakeFrag }),
    });
    renderer.render({ scene: bake, target });

    const program = new Program(gl, {
      vertex: vert,
      fragment: drawFrag,
      uniforms: {
        tNoise: { value: target.texture },
        iTime: { value: 0 },
        gold: { value: new Vec3(gold[0], gold[1], gold[2]) },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    const MAX_EDGE = 1300;
    function resize() {
      if (!el) return;
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const scale = Math.min(dpr, MAX_EDGE / Math.max(w, h, 1));
      renderer.setSize(w * scale, h * scale);
      gl.canvas.style.width = w + "px";
      gl.canvas.style.height = h + "px";
    }
    window.addEventListener("resize", resize);
    resize();

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let rafId = 0;
    if (reduce) {
      renderer.render({ scene: mesh });
    } else {
      const FRAME_MS = 1000 / 30 - 0.5; // 30fps cadence gate
      let last = -Infinity;
      const update = (t: number) => {
        rafId = requestAnimationFrame(update);
        if (t - last < FRAME_MS) return;
        last = t;
        program.uniforms.iTime.value = t * 0.001;
        renderer.render({ scene: mesh });
      };
      rafId = requestAnimationFrame(update);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      if (gl.canvas.parentNode) gl.canvas.parentNode.removeChild(gl.canvas);
    };
  }, [theme]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
    />
  );
}
