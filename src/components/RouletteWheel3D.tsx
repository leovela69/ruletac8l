"use client";

import { useEffect, useRef, useCallback } from "react";
import { WHEEL_NUMBERS, getNumberColor } from "@/lib/roulette-engine";
import { useGameStore } from "@/store/game-store";
import { audioEngine } from "@/lib/audio-engine";

export default function RouletteWheel3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const stateRef = useRef({
    wheelRotation: 0,
    wheelSpeed: 0,
    ballAngle: 0,
    ballSpeed: 0,
    ballRadius: 0,
    ballBouncing: false,
    ballSettled: false,
    phase: "idle" as "idle" | "spinning" | "decelerating" | "bouncing" | "settled",
    targetNumber: -1,
    startTime: 0,
    lastTickAngle: 0,
    bounceCount: 0,
  });

  const { phase, lastResult, spinComplete } = useGameStore();

  const CANVAS_SIZE = 380;
  const CENTER = CANVAS_SIZE / 2;
  const OUTER_RADIUS = CENTER - 15;
  const POCKET_RADIUS = OUTER_RADIUS - 45;
  const BALL_TRACK_RADIUS = OUTER_RADIUS - 8;
  const NUM_SEGMENTS = 37;
  const SEGMENT_ANGLE = (2 * Math.PI) / NUM_SEGMENTS;

  const startSpin = useCallback((targetNum: number) => {
    const state = stateRef.current;
    state.phase = "spinning";
    state.wheelSpeed = 0.08 + Math.random() * 0.02;
    state.ballSpeed = -(0.12 + Math.random() * 0.03);
    state.ballRadius = BALL_TRACK_RADIUS;
    state.ballBouncing = false;
    state.ballSettled = false;
    state.targetNumber = targetNum;
    state.startTime = performance.now();
    state.bounceCount = 0;
    state.lastTickAngle = state.ballAngle;

    audioEngine.init();
    audioEngine.playSpinning(5);
  }, [BALL_TRACK_RADIUS]);

  // React to game phase changes
  useEffect(() => {
    if (phase === "spinning" && lastResult) {
      startSpin(lastResult.number);
    }
  }, [phase, lastResult, startSpin]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    function drawWheel() {
      const state = stateRef.current;
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // === OUTER RIM (3D effect with gradient) ===
      const rimGrad = ctx.createRadialGradient(
        CENTER - 20, CENTER - 20, OUTER_RADIUS - 10,
        CENTER, CENTER, OUTER_RADIUS + 12
      );
      rimGrad.addColorStop(0, "#8b6914");
      rimGrad.addColorStop(0.3, "#c9a435");
      rimGrad.addColorStop(0.5, "#e6c84d");
      rimGrad.addColorStop(0.7, "#c9a435");
      rimGrad.addColorStop(1, "#4a3508");

      ctx.beginPath();
      ctx.arc(CENTER, CENTER, OUTER_RADIUS + 10, 0, Math.PI * 2);
      ctx.fillStyle = rimGrad;
      ctx.fill();

      // Inner shadow for 3D depth
      ctx.beginPath();
      ctx.arc(CENTER, CENTER, OUTER_RADIUS + 2, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.lineWidth = 3;
      ctx.stroke();

      // === BALL TRACK (chrome ring) ===
      ctx.beginPath();
      ctx.arc(CENTER, CENTER, OUTER_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = "#2a2a2a";
      ctx.fill();

      // Ball track groove
      const trackGrad = ctx.createRadialGradient(
        CENTER, CENTER, BALL_TRACK_RADIUS - 6,
        CENTER, CENTER, BALL_TRACK_RADIUS + 6
      );
      trackGrad.addColorStop(0, "#1a1a1a");
      trackGrad.addColorStop(0.3, "#3a3a3a");
      trackGrad.addColorStop(0.5, "#555");
      trackGrad.addColorStop(0.7, "#3a3a3a");
      trackGrad.addColorStop(1, "#1a1a1a");

      ctx.beginPath();
      ctx.arc(CENTER, CENTER, BALL_TRACK_RADIUS + 5, 0, Math.PI * 2);
      ctx.arc(CENTER, CENTER, BALL_TRACK_RADIUS - 5, 0, Math.PI * 2);
      ctx.fillStyle = trackGrad;
      ctx.fill("evenodd");

      // === NUMBER WHEEL (rotates) ===
      ctx.save();
      ctx.translate(CENTER, CENTER);
      ctx.rotate(state.wheelRotation);

      // Wheel base
      ctx.beginPath();
      ctx.arc(0, 0, POCKET_RADIUS + 30, 0, Math.PI * 2);
      ctx.fillStyle = "#1a1a1a";
      ctx.fill();

      // Draw segments
      for (let i = 0; i < NUM_SEGMENTS; i++) {
        const num = WHEEL_NUMBERS[i];
        const color = getNumberColor(num);
        const startA = i * SEGMENT_ANGLE - SEGMENT_ANGLE / 2;
        const endA = startA + SEGMENT_ANGLE;

        // Pocket color
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, POCKET_RADIUS + 28, startA, endA);
        ctx.closePath();

        if (color === "red") {
          const g = ctx.createRadialGradient(0, 0, POCKET_RADIUS - 10, 0, 0, POCKET_RADIUS + 28);
          g.addColorStop(0, "#8b1a1a");
          g.addColorStop(1, "#c62828");
          ctx.fillStyle = g;
        } else if (color === "black") {
          const g = ctx.createRadialGradient(0, 0, POCKET_RADIUS - 10, 0, 0, POCKET_RADIUS + 28);
          g.addColorStop(0, "#111");
          g.addColorStop(1, "#333");
          ctx.fillStyle = g;
        } else {
          const g = ctx.createRadialGradient(0, 0, POCKET_RADIUS - 10, 0, 0, POCKET_RADIUS + 28);
          g.addColorStop(0, "#1b5e20");
          g.addColorStop(1, "#2e7d32");
          ctx.fillStyle = g;
        }
        ctx.fill();

        // Divider (metal separator)
        ctx.beginPath();
        ctx.moveTo(
          Math.cos(startA) * (POCKET_RADIUS + 5),
          Math.sin(startA) * (POCKET_RADIUS + 5)
        );
        ctx.lineTo(
          Math.cos(startA) * (POCKET_RADIUS + 28),
          Math.sin(startA) * (POCKET_RADIUS + 28)
        );
        ctx.strokeStyle = "#c9a435";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Number
        const textAngle = startA + SEGMENT_ANGLE / 2;
        const textR = POCKET_RADIUS + 16;
        ctx.save();
        ctx.rotate(textAngle);
        ctx.translate(textR, 0);
        ctx.rotate(Math.PI / 2);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 11px Georgia, serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 2;
        ctx.fillText(num.toString(), 0, 0);
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // Inner cone (3D golden center)
      const coneGrad = ctx.createRadialGradient(
        -10, -10, 0, 0, 0, POCKET_RADIUS
      );
      coneGrad.addColorStop(0, "#e6c84d");
      coneGrad.addColorStop(0.2, "#c9a435");
      coneGrad.addColorStop(0.5, "#8b6914");
      coneGrad.addColorStop(0.8, "#4a3508");
      coneGrad.addColorStop(1, "#2a2004");

      ctx.beginPath();
      ctx.arc(0, 0, POCKET_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = coneGrad;
      ctx.fill();

      // Cone ridges
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(
          Math.cos(angle) * POCKET_RADIUS * 0.8,
          Math.sin(angle) * POCKET_RADIUS * 0.8
        );
        ctx.strokeStyle = "rgba(201, 164, 53, 0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Center jewel
      const jewelGrad = ctx.createRadialGradient(-3, -3, 0, 0, 0, 15);
      jewelGrad.addColorStop(0, "#fff");
      jewelGrad.addColorStop(0.3, "#e6c84d");
      jewelGrad.addColorStop(0.7, "#c9a435");
      jewelGrad.addColorStop(1, "#8b6914");

      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fillStyle = jewelGrad;
      ctx.fill();
      ctx.strokeStyle = "#4a3508";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore(); // End wheel rotation

      // === BALL ===
      if (state.phase !== "idle") {
        const ballX = CENTER + Math.cos(state.ballAngle) * state.ballRadius;
        const ballY = CENTER + Math.sin(state.ballAngle) * state.ballRadius;

        // Ball shadow
        ctx.beginPath();
        ctx.arc(ballX + 3, ballY + 3, 7, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fill();

        // Ball (3D metallic sphere)
        const ballGrad = ctx.createRadialGradient(
          ballX - 3, ballY - 3, 1,
          ballX, ballY, 7
        );
        ballGrad.addColorStop(0, "#ffffff");
        ballGrad.addColorStop(0.2, "#f5f5f5");
        ballGrad.addColorStop(0.5, "#ddd");
        ballGrad.addColorStop(0.8, "#aaa");
        ballGrad.addColorStop(1, "#666");

        ctx.beginPath();
        ctx.arc(ballX, ballY, 7, 0, Math.PI * 2);
        ctx.fillStyle = ballGrad;
        ctx.fill();

        // Ball highlight
        ctx.beginPath();
        ctx.arc(ballX - 2, ballY - 2, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fill();
      }

      // === 3D PERSPECTIVE OVERLAY (top reflection) ===
      const reflGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_SIZE);
      reflGrad.addColorStop(0, "rgba(255,255,255,0.06)");
      reflGrad.addColorStop(0.3, "rgba(255,255,255,0.02)");
      reflGrad.addColorStop(0.5, "rgba(0,0,0,0)");
      reflGrad.addColorStop(1, "rgba(0,0,0,0.1)");

      ctx.beginPath();
      ctx.arc(CENTER, CENTER, OUTER_RADIUS + 10, 0, Math.PI * 2);
      ctx.fillStyle = reflGrad;
      ctx.fill();
    }

    function updatePhysics() {
      const state = stateRef.current;
      const elapsed = (performance.now() - state.startTime) / 1000;

      switch (state.phase) {
        case "spinning": {
          // Wheel spins, ball rolls opposite direction
          state.wheelRotation += state.wheelSpeed;
          state.ballAngle += state.ballSpeed;
          state.ballSpeed *= 0.997; // Slow down gradually

          // Ball tick sounds when passing dividers
          const angleDiff = Math.abs(state.ballAngle - state.lastTickAngle);
          if (angleDiff > SEGMENT_ANGLE) {
            state.lastTickAngle = state.ballAngle;
            if (Math.random() > 0.6) audioEngine.playBallTick();
          }

          // Wheel decelerates
          state.wheelSpeed *= 0.999;

          // After ~2.5s, ball starts falling inward
          if (elapsed > 2.5) {
            state.phase = "decelerating";
          }
          break;
        }

        case "decelerating": {
          state.wheelRotation += state.wheelSpeed;
          state.wheelSpeed *= 0.995;
          state.ballAngle += state.ballSpeed;
          state.ballSpeed *= 0.985;

          // Ball slowly falls toward pockets
          state.ballRadius -= 0.4;

          if (angleDiffForTick(state)) {
            audioEngine.playBallTick();
          }

          // When ball reaches pocket area
          if (state.ballRadius <= POCKET_RADIUS + 30) {
            state.phase = "bouncing";
            state.bounceCount = 0;
            audioEngine.playBallBounce();
          }
          break;
        }

        case "bouncing": {
          state.wheelRotation += state.wheelSpeed;
          state.wheelSpeed *= 0.998;
          state.ballAngle += state.ballSpeed * 0.5;
          state.ballSpeed *= 0.95;

          // Ball bounces between pockets
          state.bounceCount++;
          if (state.bounceCount % 15 === 0 && state.bounceCount < 60) {
            state.ballRadius += (Math.random() - 0.5) * 3;
            audioEngine.playBallBounce();
          }

          // Settle into target pocket
          if (state.bounceCount > 60) {
            state.phase = "settled";
            state.ballRadius = POCKET_RADIUS + 18;

            // Calculate final ball angle to match target number on wheel
            const targetIdx = WHEEL_NUMBERS.indexOf(state.targetNumber);
            const targetAngle = targetIdx * SEGMENT_ANGLE + state.wheelRotation + SEGMENT_ANGLE / 2;
            state.ballAngle = targetAngle;

            audioEngine.playBallSettle();
          }
          break;
        }

        case "settled": {
          // Keep wheel slowly rotating with ball locked in pocket
          state.wheelRotation += state.wheelSpeed;
          state.wheelSpeed *= 0.99;

          // Ball stays in pocket (rotates with wheel)
          const targetIdx = WHEEL_NUMBERS.indexOf(state.targetNumber);
          const targetAngle = targetIdx * SEGMENT_ANGLE + state.wheelRotation + SEGMENT_ANGLE / 2;
          state.ballAngle += (targetAngle - state.ballAngle) * 0.1;
          state.ballRadius += (POCKET_RADIUS + 18 - state.ballRadius) * 0.1;

          if (state.wheelSpeed < 0.001 && !state.ballSettled) {
            state.ballSettled = true;
            // Signal game store that spin animation is complete
            if (spinComplete) spinComplete();
          }
          break;
        }
      }
    }

    function angleDiffForTick(state: typeof stateRef.current) {
      const diff = Math.abs(state.ballAngle - state.lastTickAngle);
      if (diff > SEGMENT_ANGLE * 0.8) {
        state.lastTickAngle = state.ballAngle;
        return Math.random() > 0.4;
      }
      return false;
    }

    function loop() {
      const state = stateRef.current;
      if (state.phase !== "idle") {
        updatePhysics();
      }
      drawWheel();
      animationRef.current = requestAnimationFrame(loop);
    }

    loop();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [CENTER, OUTER_RADIUS, BALL_TRACK_RADIUS, POCKET_RADIUS, CANVAS_SIZE, NUM_SEGMENTS, SEGMENT_ANGLE, spinComplete]);

  return (
    <div className="relative flex items-center justify-center" style={{ perspective: "800px" }}>
      {/* 3D tilt effect */}
      <div
        className="relative"
        style={{
          transform: "rotateX(15deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Outer glow ring */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: CANVAS_SIZE + 30,
            height: CANVAS_SIZE + 30,
            top: -15,
            left: -15,
            background: "radial-gradient(circle, rgba(201,164,53,0.15) 60%, transparent 70%)",
            boxShadow: "0 0 40px rgba(201,164,53,0.2), 0 20px 60px rgba(0,0,0,0.5)",
          }}
        />

        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="relative z-10"
          style={{
            filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.6))",
          }}
        />

        {/* Table reflection below wheel */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 pointer-events-none"
          style={{
            width: CANVAS_SIZE * 0.8,
            height: 40,
            background: "radial-gradient(ellipse, rgba(201,164,53,0.08) 0%, transparent 70%)",
            filter: "blur(10px)",
          }}
        />
      </div>
    </div>
  );
}
