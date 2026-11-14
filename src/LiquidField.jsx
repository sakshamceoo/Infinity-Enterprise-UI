import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_res;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_mark;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec2 m = (u_mouse - 0.5 * u_res) / u_res.y;
  vec2 delta = uv - m;
  float pull = exp(-dot(delta, delta) * 2.6);

  vec2 p = uv * (1.15 + u_mark * 0.15);
  float t = u_time * 0.07;
  p += 0.22 * vec2(fbm(p + t), fbm(p - t + 4.0));
  p += delta * pull * 0.42;

  float spread = 0.34 + pull * 0.08;
  float lobeA = length(p - vec2(spread, 0.02));
  float lobeB = length(p + vec2(spread, -0.02));
  float field = min(lobeA, lobeB);
  field += (fbm(p * 2.2 + t) - 0.45) * 0.28;

  float body = smoothstep(0.72, 0.34, field);
  float rim = smoothstep(0.58, 0.5, field) - smoothstep(0.5, 0.4, field);

  vec3 obsidian = vec3(0.039, 0.039, 0.039);
  vec3 warm = vec3(0.16, 0.14, 0.11);
  vec3 ivory = vec3(0.956, 0.945, 0.91);
  vec3 champagne = vec3(0.722, 0.608, 0.384);

  vec3 col = mix(obsidian, warm, body);
  col = mix(col, champagne, rim * 0.85);
  col = mix(col, ivory, rim * pull * 0.45 + body * pull * 0.08);

  float alpha = body * 0.94;
  float center = smoothstep(0.0, 0.42, length(uv));
  alpha *= mix(0.2, 1.0, center);
  gl_FragColor = vec4(col, alpha);
}
`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function LiquidField({ variant = "field" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: "low-power",
    });
    if (!gl) return undefined;

    const vert = compile(gl, gl.VERTEX_SHADER, VERT);
    const frag = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vert || !frag) return undefined;

    const program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return undefined;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_res");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uMark = gl.getUniformLocation(program, "u_mark");

    gl.useProgram(program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform1f(uMark, variant === "mark" ? 1 : 0);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let width = 0;
    let height = 0;
    let running = true;
    let visible = true;
    let raf = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, rect.width < 800 ? 1 : 1.35);
      width = Math.max(1, Math.floor(rect.width * dpr));
      height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      mouse.x = mouse.tx = width / 2;
      mouse.y = mouse.ty = height / 2;
    };

    const onMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!inside || rect.width === 0) {
        mouse.tx = width / 2;
        mouse.ty = height / 2;
        return;
      }
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;
      mouse.tx = (event.clientX - rect.left) * scaleX;
      mouse.ty = (rect.bottom - event.clientY) * scaleY;
    };

    const draw = (now) => {
      if (!running) return;
      if (visible) {
        mouse.x += (mouse.tx - mouse.x) * 0.07;
        mouse.y += (mouse.ty - mouse.y) * 0.07;
        gl.viewport(0, 0, width, height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(uRes, width, height);
        gl.uniform2f(uMouse, mouse.x, mouse.y);
        gl.uniform1f(uTime, reduce ? 0 : now * 0.001);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });

    resize();
    observer.observe(canvas);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
    };
  }, [variant]);

  return (
    <div className={`liquid-wrap liquid-${variant}`}>
      <canvas ref={canvasRef} className="liquid" aria-hidden="true" />
    </div>
  );
}
