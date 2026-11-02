"use client";

import { useEffect, useRef, useState } from "react";

// 5×7 bitmaps for the letters of the name.
const FONT: Record<string, string[]> = {
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  N: ["10001", "11001", "10101", "10101", "10011", "10001", "10001"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
};
const WORD = "CHINMOY";

type State = "idle" | "playing" | "won" | "lost";

/** Break the name, one pixel at a time. */
export function PixelGame() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<State>("idle");
  const [score, setScore] = useState(0);
  const start = useRef<() => void>(() => undefined);

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context) return;
    const W = 960;
    const H = 460;
    element.width = W;
    element.height = H;
    const cell = 16;
    const paddle = { x: W / 2, w: 130, h: 10 };
    const ball = { x: W / 2, y: H - 60, vx: 0, vy: 0, r: 7 };
    let bricks: { x: number; y: number; on: boolean }[] = [];
    let playing = false;
    let frame = 0;
    let visible = false;
    let keys = 0;

    const reset = () => {
      const total = WORD.length * 6 * cell - cell;
      bricks = [];
      [...WORD].forEach((char, c) =>
        FONT[char].forEach((row, y) =>
          [...row].forEach((bit, x) => {
            if (bit === "1") bricks.push({ x: (W - total) / 2 + (c * 6 + x) * cell, y: 50 + y * cell, on: true });
          }),
        ),
      );
      ball.x = W / 2;
      ball.y = H - 60;
      ball.vx = 0;
      ball.vy = 0;
      paddle.x = W / 2;
      setScore(0);
    };

    const draw = () => {
      context.clearRect(0, 0, W, H);
      context.fillStyle = "#f4f2ee";
      for (const brick of bricks) if (brick.on) context.fillRect(brick.x + 1, brick.y + 1, cell - 3, cell - 3);
      context.fillStyle = "#e8262d";
      context.fillRect(paddle.x - paddle.w / 2, H - 26, paddle.w, paddle.h);
      context.beginPath();
      context.arc(ball.x, ball.y, ball.r, 0, 6.3);
      context.fill();
    };

    const step = () => {
      paddle.x = Math.min(W - paddle.w / 2, Math.max(paddle.w / 2, paddle.x + keys * 9));
      ball.x += ball.vx;
      ball.y += ball.vy;
      if (ball.x < ball.r || ball.x > W - ball.r) ball.vx *= -1;
      if (ball.y < ball.r) ball.vy = Math.abs(ball.vy);
      if (ball.vy > 0 && ball.y + ball.r > H - 26 && ball.y < H - 14 && Math.abs(ball.x - paddle.x) < paddle.w / 2 + ball.r) {
        ball.vy = -Math.abs(ball.vy);
        ball.vx = ((ball.x - paddle.x) / (paddle.w / 2)) * 6;
      }
      for (const brick of bricks) {
        if (!brick.on || ball.x < brick.x - ball.r || ball.x > brick.x + cell + ball.r || ball.y < brick.y - ball.r || ball.y > brick.y + cell + ball.r) continue;
        brick.on = false;
        ball.vy *= -1;
        setScore((value) => value + 1);
        break;
      }
      if (ball.y > H + 20) {
        playing = false;
        setState("lost");
      } else if (!bricks.some((brick) => brick.on)) {
        playing = false;
        setState("won");
      }
    };

    const loop = () => {
      frame = requestAnimationFrame(loop);
      if (!visible) return;
      if (playing) step();
      draw();
    };

    start.current = () => {
      reset();
      ball.vx = 3.5;
      ball.vy = -6;
      playing = true;
      setState("playing");
    };

    const onPointer = (event: PointerEvent) => {
      const box = element.getBoundingClientRect();
      paddle.x = Math.min(W - paddle.w / 2, Math.max(paddle.w / 2, ((event.clientX - box.left) / box.width) * W));
    };
    const onKey = (event: KeyboardEvent) => {
      if (!playing || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      keys = event.type === "keyup" ? 0 : event.key === "ArrowLeft" ? -1 : 1;
    };
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(element);
    reset();
    draw();
    loop();
    element.addEventListener("pointermove", onPointer);
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      element.removeEventListener("pointermove", onPointer);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, []);

  const label = state === "idle" ? "Play" : state === "playing" ? "Restart" : "Play again";
  const message = state === "won" ? "Every pixel broken." : state === "lost" ? "Missed. One more?" : "Break it if you can. Mouse, touch or arrow keys.";

  return (
    <section id="play" data-nav="solid" aria-labelledby="play-title" className="gutter pt-24 sm:pt-40">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="play-title" className="label text-ember">
          08 / One more thing
        </h2>
        <p className="label" role="status">
          {message}
        </p>
      </div>
      <div className="border border-line">
        <canvas ref={canvas} role="img" aria-label="A breakout game with the name Chinmoy built from pixels" className="block aspect-[96/46] w-full touch-none" />
      </div>
      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="label tabular-nums">Pixels {score}</p>
        <button type="button" onClick={() => start.current()} className="pill">
          {label}
        </button>
      </div>
    </section>
  );
}
