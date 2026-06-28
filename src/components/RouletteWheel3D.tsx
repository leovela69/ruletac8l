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
    ballAngle: Math.random() * Math.PI * 2,
    ballSpeed: 0,
    ballRadius: 0,
    phase: "idle" as "idle" | "spinning" | "decelerating" | "bouncing" | "settled",
    targetNumber: -1,
    startTime: 0,
    lastTickAngle: 0,
    bounceCount: 0,
    ballSettled: false,
    showResult: false,
  });

  const { phase, lastResult, spinComplete } = useGameStore();

  const SIZE = 400;
  const C = SIZE / 2;
  const OUTER_R = C - 12;
  const WOOD_R = OUTER_R - 8;
  const NUM_RING_OUTER = WOOD_R - 20;
  const NUM_RING_INNER = NUM_RING_OUTER - 36;
  const CONE_R = NUM_RING_INNER - 8;
  const BALL_TRACK = WOOD_R - 10;
  const SEGMENTS = 37;
  const SEG_ANGLE = (2 * Math.PI) / SEGMENTS;


  const startSpin = useCallback((targetNum: number) => {
    const state = stateRef.current;
    state.phase = "spinning";
    state.wheelSpeed = 0.06 + Math.random() * 0.02;
    state.ballSpeed = -(0.10 + Math.random() * 0.03);
    state.ballRadius = BALL_TRACK;
    state.targetNumber = targetNum;
    state.startTime = performance.now();
    state.bounceCount = 0;
    state.ballSettled = false;
    state.showResult = false;
    state.lastTickAngle = state.ballAngle;
    audioEngine.init();
    audioEngine.playSpinning(5.5);
  }, [BALL_TRACK]);

  useEffect(() => {
    if (phase === "spinning" && lastResult) {
      startSpin(lastResult.number);
    }
  }, [phase, lastResult, startSpin]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;


    function drawWoodRing(ctx: CanvasRenderingContext2D) {
      // Outer metallic brass ring
      const brassGrad = ctx.createRadialGradient(C, C, OUTER_R - 10, C, C, OUTER_R);
      brassGrad.addColorStop(0, "#d4a843");
      brassGrad.addColorStop(0.3, "#f0d060");
      brassGrad.addColorStop(0.6, "#c49a30");
      brassGrad.addColorStop(1, "#8b6914");
      ctx.beginPath();
      ctx.arc(C, C, OUTER_R, 0, Math.PI * 2);
      ctx.fillStyle = brassGrad;
      ctx.fill();

      // Wood ring (pine/light wood with vertical grain)
      const woodGrad = ctx.createRadialGradient(C, C, NUM_RING_OUTER + 2, C, C, WOOD_R);
      woodGrad.addColorStop(0, "#c8a050");
      woodGrad.addColorStop(0.3, "#dbb56a");
      woodGrad.addColorStop(0.5, "#c49a40");
      woodGrad.addColorStop(0.7, "#b8903a");
      woodGrad.addColorStop(1, "#a07828");
      ctx.beginPath();
      ctx.arc(C, C, WOOD_R, 0, Math.PI * 2);
      ctx.arc(C, C, NUM_RING_OUTER + 2, 0, Math.PI * 2);
      ctx.fillStyle = woodGrad;
      ctx.fill("evenodd");

      // Wood grain lines
      for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * Math.PI * 2;
        const r1 = NUM_RING_OUTER + 4;
        const r2 = WOOD_R - 2;
        ctx.beginPath();
        ctx.moveTo(C + Math.cos(angle) * r1, C + Math.sin(angle) * r1);
        ctx.lineTo(C + Math.cos(angle) * r2, C + Math.sin(angle) * r2);
        ctx.strokeStyle = "rgba(100, 60, 20, 0.15)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Diamond deflectors on wood ring
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const dx = C + Math.cos(angle) * (NUM_RING_OUTER + 14);
        const dy = C + Math.sin(angle) * (NUM_RING_OUTER + 14);
        ctx.save();
        ctx.translate(dx, dy);
        ctx.rotate(angle);
        // Diamond shape
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.lineTo(3.5, 0);
        ctx.moveTo(0, -5);
        ctx.lineTo(-3.5, 0);
        ctx.lineTo(0, 5);
        ctx.lineTo(3.5, 0);
        ctx.closePath();
        const dGrad = ctx.createLinearGradient(-4, -5, 4, 5);
        dGrad.addColorStop(0, "#f0d060");
        dGrad.addColorStop(0.5, "#c49a30");
        dGrad.addColorStop(1, "#8b6914");
        ctx.fillStyle = dGrad;
        ctx.fill();
        ctx.strokeStyle = "#6b4e10";
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.restore();
      }

      // Inner brass ring (between wood and number crown)
      ctx.beginPath();
      ctx.arc(C, C, NUM_RING_OUTER + 2, 0, Math.PI * 2);
      ctx.strokeStyle = "#c49a30";
      ctx.lineWidth = 2;
      ctx.stroke();
    }


    function drawNumberCrown(ctx: CanvasRenderingContext2D, rotation: number) {
      // Black number ring background
      ctx.beginPath();
      ctx.arc(C, C, NUM_RING_OUTER, 0, Math.PI * 2);
      ctx.arc(C, C, NUM_RING_INNER, 0, Math.PI * 2);
      ctx.fillStyle = "#111";
      ctx.fill("evenodd");

      // Draw colored segments with numbers
      for (let i = 0; i < SEGMENTS; i++) {
        const num = WHEEL_NUMBERS[i];
        const color = getNumberColor(num);
        const startA = rotation + i * SEG_ANGLE;
        const endA = startA + SEG_ANGLE;
        const midA = startA + SEG_ANGLE / 2;

        // Colored pocket
        ctx.beginPath();
        ctx.arc(C, C, NUM_RING_OUTER - 1, startA, endA);
        ctx.arc(C, C, NUM_RING_INNER + 1, endA, startA, true);
        ctx.closePath();

        if (color === "red") ctx.fillStyle = "#c0392b";
        else if (color === "black") ctx.fillStyle = "#1a1a2e";
        else ctx.fillStyle = "#27ae60";
        ctx.fill();

        // Gold divider line
        ctx.beginPath();
        ctx.moveTo(
          C + Math.cos(startA) * (NUM_RING_INNER + 1),
          C + Math.sin(startA) * (NUM_RING_INNER + 1)
        );
        ctx.lineTo(
          C + Math.cos(startA) * (NUM_RING_OUTER - 1),
          C + Math.sin(startA) * (NUM_RING_OUTER - 1)
        );
        ctx.strokeStyle = "rgba(196, 154, 48, 0.6)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Number text (radial orientation)
        const textR = (NUM_RING_OUTER + NUM_RING_INNER) / 2;
        const tx = C + Math.cos(midA) * textR;
        const ty = C + Math.sin(midA) * textR;
        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(midA + Math.PI / 2);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px Arial, Helvetica, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(num.toString(), 0, 0);
        ctx.restore();
      }

      // Inner brass ring
      ctx.beginPath();
      ctx.arc(C, C, NUM_RING_INNER, 0, Math.PI * 2);
      ctx.strokeStyle = "#c49a30";
      ctx.lineWidth = 2;
      ctx.stroke();
    }


    function drawConeAndTurret(ctx: CanvasRenderingContext2D) {
      // Dark wood cone center
      const coneGrad = ctx.createRadialGradient(C - 10, C - 10, 0, C, C, CONE_R);
      coneGrad.addColorStop(0, "#8b6530");
      coneGrad.addColorStop(0.3, "#6b4520");
      coneGrad.addColorStop(0.7, "#4a2f15");
      coneGrad.addColorStop(1, "#2a1a0a");
      ctx.beginPath();
      ctx.arc(C, C, CONE_R, 0, Math.PI * 2);
      ctx.fillStyle = coneGrad;
      ctx.fill();

      // Concentric wood rings on cone
      for (let r = 15; r < CONE_R; r += 12) {
        ctx.beginPath();
        ctx.arc(C, C, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(139, 101, 48, ${0.2 + (r / CONE_R) * 0.2})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Turret cross (4 arms with golden spheres)
      const armLength = 30;
      const arms = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
      
      arms.forEach((angle) => {
        const x1 = C;
        const y1 = C;
        const x2 = C + Math.cos(angle) * armLength;
        const y2 = C + Math.sin(angle) * armLength;

        // Arm
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = "#c49a30";
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.strokeStyle = "#f0d060";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Sphere at tip
        const sphereGrad = ctx.createRadialGradient(
          x2 - 2, y2 - 2, 0, x2, y2, 6
        );
        sphereGrad.addColorStop(0, "#f0d060");
        sphereGrad.addColorStop(0.4, "#c49a30");
        sphereGrad.addColorStop(0.8, "#8b6914");
        sphereGrad.addColorStop(1, "#5a4510");
        ctx.beginPath();
        ctx.arc(x2, y2, 6, 0, Math.PI * 2);
        ctx.fillStyle = sphereGrad;
        ctx.fill();
        ctx.strokeStyle = "#5a4510";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Center sphere (bigger)
      const centerGrad = ctx.createRadialGradient(C - 3, C - 3, 0, C, C, 10);
      centerGrad.addColorStop(0, "#f5e080");
      centerGrad.addColorStop(0.4, "#d4a843");
      centerGrad.addColorStop(0.8, "#8b6914");
      centerGrad.addColorStop(1, "#5a4510");
      ctx.beginPath();
      ctx.arc(C, C, 10, 0, Math.PI * 2);
      ctx.fillStyle = centerGrad;
      ctx.fill();
      ctx.strokeStyle = "#5a4510";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }


    function drawBall(ctx: CanvasRenderingContext2D, angle: number, radius: number) {
      const bx = C + Math.cos(angle) * radius;
      const by = C + Math.sin(angle) * radius;

      // Ball shadow
      ctx.beginPath();
      ctx.arc(bx + 2, by + 2, 6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fill();

      // Ball body (flat gray with single highlight)
      ctx.beginPath();
      ctx.arc(bx, by, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#bbb";
      ctx.fill();
      ctx.strokeStyle = "#888";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Highlight spot (top-left)
      ctx.beginPath();
      ctx.arc(bx - 2, by - 2, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fill();
    }

    function drawWinningNumber(ctx: CanvasRenderingContext2D, num: number) {
      // Giant fuchsia number in center
      ctx.save();
      ctx.font = "bold 72px Arial, Helvetica, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Black stroke
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 6;
      ctx.strokeText(num.toString(), C, C);

      // Fuchsia fill
      ctx.fillStyle = "#ff1493";
      ctx.fillText(num.toString(), C, C);

      // Bright highlight
      ctx.fillStyle = "rgba(255, 100, 200, 0.3)";
      ctx.fillText(num.toString(), C - 1, C - 1);
      ctx.restore();
    }


    function updatePhysics() {
      const state = stateRef.current;
      const elapsed = (performance.now() - state.startTime) / 1000;

      switch (state.phase) {
        case "spinning": {
          state.wheelRotation += state.wheelSpeed;
          state.ballAngle += state.ballSpeed;
          state.ballSpeed *= 0.997;
          state.wheelSpeed *= 0.999;

          const diff = Math.abs(state.ballAngle - state.lastTickAngle);
          if (diff > SEG_ANGLE) {
            state.lastTickAngle = state.ballAngle;
            if (Math.random() > 0.5) audioEngine.playBallTick();
          }

          if (elapsed > 2.8) {
            state.phase = "decelerating";
          }
          break;
        }
        case "decelerating": {
          state.wheelRotation += state.wheelSpeed;
          state.wheelSpeed *= 0.996;
          state.ballAngle += state.ballSpeed;
          state.ballSpeed *= 0.98;
          state.ballRadius -= 0.5;

          const diff2 = Math.abs(state.ballAngle - state.lastTickAngle);
          if (diff2 > SEG_ANGLE * 0.7) {
            state.lastTickAngle = state.ballAngle;
            audioEngine.playBallTick();
          }

          if (state.ballRadius <= NUM_RING_OUTER - 5) {
            state.phase = "bouncing";
            state.bounceCount = 0;
            audioEngine.playBallBounce();
          }
          break;
        }
        case "bouncing": {
          state.wheelRotation += state.wheelSpeed;
          state.wheelSpeed *= 0.998;
          state.ballAngle += state.ballSpeed * 0.4;
          state.ballSpeed *= 0.93;
          state.bounceCount++;

          if (state.bounceCount % 12 === 0 && state.bounceCount < 50) {
            state.ballRadius += (Math.random() - 0.3) * 4;
            audioEngine.playBallBounce();
          }

          if (state.bounceCount > 50) {
            state.phase = "settled";
            const targetIdx = WHEEL_NUMBERS.indexOf(state.targetNumber);
            const targetA = targetIdx * SEG_ANGLE + state.wheelRotation + SEG_ANGLE / 2;
            state.ballAngle = targetA;
            state.ballRadius = (NUM_RING_OUTER + NUM_RING_INNER) / 2;
            audioEngine.playBallSettle();
          }
          break;
        }
        case "settled": {
          state.wheelRotation += state.wheelSpeed;
          state.wheelSpeed *= 0.99;

          const targetIdx = WHEEL_NUMBERS.indexOf(state.targetNumber);
          const targetA = targetIdx * SEG_ANGLE + state.wheelRotation + SEG_ANGLE / 2;
          state.ballAngle += (targetA - state.ballAngle) * 0.08;

          if (state.wheelSpeed < 0.001) {
            state.showResult = true;
            if (!state.ballSettled) {
              state.ballSettled = true;
              if (spinComplete) spinComplete();
            }
          }
          break;
        }
      }
    }


    function loop() {
      const state = stateRef.current;
      if (state.phase !== "idle") updatePhysics();

      ctx.clearRect(0, 0, SIZE, SIZE);

      // Draw wheel layers
      drawWoodRing(ctx);
      drawNumberCrown(ctx, state.wheelRotation);
      drawConeAndTurret(ctx);

      // Draw ball
      if (state.phase !== "idle") {
        drawBall(ctx, state.ballAngle, state.ballRadius);
      }

      // Draw winning number overlay
      if (state.showResult && state.targetNumber >= 0) {
        drawWinningNumber(ctx, state.targetNumber);
      }

      animationRef.current = requestAnimationFrame(loop);
    }

    loop();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [C, OUTER_R, WOOD_R, NUM_RING_OUTER, NUM_RING_INNER, CONE_R, BALL_TRACK, SIZE, SEGMENTS, SEG_ANGLE, spinComplete]);

  return (
    <div className="flex-shrink-0">
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        className="block"
        style={{ filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.5))" }}
      />
    </div>
  );
}
