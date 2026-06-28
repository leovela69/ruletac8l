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
    tickCooldown: 0,
  });

  const { phase, lastResult, spinComplete } = useGameStore();

  const SIZE = 420;
  const C = SIZE / 2;
  const OUTER_R = C - 12;
  const WOOD_R = OUTER_R - 8;
  const NUM_RING_OUTER = WOOD_R - 22;
  const NUM_RING_INNER = NUM_RING_OUTER - 38;
  const CONE_R = NUM_RING_INNER - 10;
  const BALL_TRACK = WOOD_R - 12;
  const SEGMENTS = 37;
  const SEG_ANGLE = (2 * Math.PI) / SEGMENTS;

  const startSpin = useCallback((targetNum: number) => {
    const state = stateRef.current;
    state.phase = "spinning";
    // Much faster initial speed for longer, smoother spin
    state.wheelSpeed = 0.12 + Math.random() * 0.04;
    state.ballSpeed = -(0.18 + Math.random() * 0.05);
    state.ballRadius = BALL_TRACK;
    state.targetNumber = targetNum;
    state.startTime = performance.now();
    state.bounceCount = 0;
    state.ballSettled = false;
    state.showResult = false;
    state.lastTickAngle = state.ballAngle;
    state.tickCooldown = 0;
    audioEngine.init();
    audioEngine.playSpinning(9); // Longer spin sound
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

    function drawWoodRing() {
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

      // Wood ring
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

      // Wood grain
      for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(C + Math.cos(angle) * (NUM_RING_OUTER + 4), C + Math.sin(angle) * (NUM_RING_OUTER + 4));
        ctx.lineTo(C + Math.cos(angle) * (WOOD_R - 2), C + Math.sin(angle) * (WOOD_R - 2));
        ctx.strokeStyle = "rgba(100, 60, 20, 0.12)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Diamond deflectors
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const dx = C + Math.cos(angle) * (NUM_RING_OUTER + 14);
        const dy = C + Math.sin(angle) * (NUM_RING_OUTER + 14);
        ctx.save();
        ctx.translate(dx, dy);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(4, 0);
        ctx.lineTo(0, 6);
        ctx.lineTo(-4, 0);
        ctx.closePath();
        const dGrad = ctx.createLinearGradient(-4, -6, 4, 6);
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

      // Inner brass ring
      ctx.beginPath();
      ctx.arc(C, C, NUM_RING_OUTER + 2, 0, Math.PI * 2);
      ctx.strokeStyle = "#c49a30";
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    function drawNumberCrown(rotation: number) {
      // Black background ring
      ctx.beginPath();
      ctx.arc(C, C, NUM_RING_OUTER, 0, Math.PI * 2);
      ctx.arc(C, C, NUM_RING_INNER, 0, Math.PI * 2);
      ctx.fillStyle = "#0a0a0a";
      ctx.fill("evenodd");

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

        // Gold divider
        ctx.beginPath();
        ctx.moveTo(C + Math.cos(startA) * (NUM_RING_INNER + 1), C + Math.sin(startA) * (NUM_RING_INNER + 1));
        ctx.lineTo(C + Math.cos(startA) * (NUM_RING_OUTER - 1), C + Math.sin(startA) * (NUM_RING_OUTER - 1));
        ctx.strokeStyle = "rgba(196, 154, 48, 0.5)";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Number text radial
        const textR = (NUM_RING_OUTER + NUM_RING_INNER) / 2;
        const tx = C + Math.cos(midA) * textR;
        const ty = C + Math.sin(midA) * textR;
        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(midA + Math.PI / 2);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 11px Arial, sans-serif";
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

    function drawConeAndTurret() {
      // Dark wood cone
      const coneGrad = ctx.createRadialGradient(C - 10, C - 10, 0, C, C, CONE_R);
      coneGrad.addColorStop(0, "#8b6530");
      coneGrad.addColorStop(0.3, "#6b4520");
      coneGrad.addColorStop(0.7, "#4a2f15");
      coneGrad.addColorStop(1, "#2a1a0a");
      ctx.beginPath();
      ctx.arc(C, C, CONE_R, 0, Math.PI * 2);
      ctx.fillStyle = coneGrad;
      ctx.fill();

      // Concentric wood rings
      for (let r = 15; r < CONE_R; r += 10) {
        ctx.beginPath();
        ctx.arc(C, C, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(139, 101, 48, ${0.15 + (r / CONE_R) * 0.15})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      // Turret cross 4 arms
      const armLen = 32;
      const arms = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
      arms.forEach((angle) => {
        const x2 = C + Math.cos(angle) * armLen;
        const y2 = C + Math.sin(angle) * armLen;
        ctx.beginPath();
        ctx.moveTo(C, C);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = "#c49a30";
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.strokeStyle = "#f0d060";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Sphere tip
        const sg = ctx.createRadialGradient(x2 - 2, y2 - 2, 0, x2, y2, 7);
        sg.addColorStop(0, "#f5e080");
        sg.addColorStop(0.4, "#c49a30");
        sg.addColorStop(0.8, "#8b6914");
        sg.addColorStop(1, "#5a4510");
        ctx.beginPath();
        ctx.arc(x2, y2, 7, 0, Math.PI * 2);
        ctx.fillStyle = sg;
        ctx.fill();
        ctx.strokeStyle = "#4a3510";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Center sphere
      const cg = ctx.createRadialGradient(C - 3, C - 3, 0, C, C, 12);
      cg.addColorStop(0, "#f5e080");
      cg.addColorStop(0.4, "#d4a843");
      cg.addColorStop(0.8, "#8b6914");
      cg.addColorStop(1, "#5a4510");
      ctx.beginPath();
      ctx.arc(C, C, 12, 0, Math.PI * 2);
      ctx.fillStyle = cg;
      ctx.fill();
      ctx.strokeStyle = "#4a3510";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    function drawBall(angle: number, radius: number) {
      const bx = C + Math.cos(angle) * radius;
      const by = C + Math.sin(angle) * radius;

      // Shadow
      ctx.beginPath();
      ctx.arc(bx + 2, by + 3, 6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fill();

      // Ball body
      ctx.beginPath();
      ctx.arc(bx, by, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#ccc";
      ctx.fill();
      ctx.strokeStyle = "#999";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Highlight
      ctx.beginPath();
      ctx.arc(bx - 2, by - 2, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.fill();
    }

    function drawWinningNumber(num: number) {
      ctx.save();
      ctx.font = "bold 76px Arial, Helvetica, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 8;
      ctx.strokeText(num.toString(), C, C);
      ctx.fillStyle = "#ff1493";
      ctx.fillText(num.toString(), C, C);
      ctx.fillStyle = "rgba(255, 150, 220, 0.25)";
      ctx.fillText(num.toString(), C - 1, C - 1);
      ctx.restore();
    }

    function updatePhysics() {
      const state = stateRef.current;
      const elapsed = (performance.now() - state.startTime) / 1000;

      switch (state.phase) {
        case "spinning": {
          // Smooth deceleration with very gentle curve
          state.wheelRotation += state.wheelSpeed;
          state.ballAngle += state.ballSpeed;
          // Very gentle deceleration — spins for a long time
          state.ballSpeed *= 0.9992;
          state.wheelSpeed *= 0.9996;

          // Tick sound synced to segments passing
          state.tickCooldown--;
          const angleDiff = Math.abs(state.ballAngle - state.lastTickAngle);
          if (angleDiff > SEG_ANGLE && state.tickCooldown <= 0) {
            state.lastTickAngle = state.ballAngle;
            state.tickCooldown = 2; // Prevent too many ticks
            audioEngine.playBallTick();
          }

          // Ball spins much longer (5+ seconds) before deceleration phase
          if (elapsed > 5.0) {
            state.phase = "decelerating";
          }
          break;
        }
        case "decelerating": {
          state.wheelRotation += state.wheelSpeed;
          state.wheelSpeed *= 0.9985;
          state.ballAngle += state.ballSpeed;
          // Ball fights to keep rolling — slow deceleration
          state.ballSpeed *= 0.993;
          // Ball slowly spirals inward
          state.ballRadius -= 0.25;

          // Tick sounds getting further apart as ball slows
          state.tickCooldown--;
          const diff = Math.abs(state.ballAngle - state.lastTickAngle);
          if (diff > SEG_ANGLE * 0.6 && state.tickCooldown <= 0) {
            state.lastTickAngle = state.ballAngle;
            state.tickCooldown = 3;
            audioEngine.playBallTick();
          }

          // Ball reaches the pocket ring
          if (state.ballRadius <= NUM_RING_OUTER - 3) {
            state.phase = "bouncing";
            state.bounceCount = 0;
            audioEngine.playBallBounce();
          }
          break;
        }
        case "bouncing": {
          state.wheelRotation += state.wheelSpeed;
          state.wheelSpeed *= 0.9992;
          state.ballAngle += state.ballSpeed * 0.35;
          state.ballSpeed *= 0.96;
          state.bounceCount++;

          // Multiple realistic bounces — ball hops between pockets
          if (state.bounceCount % 8 === 0 && state.bounceCount < 80) {
            // Ball bounces up and comes back down
            state.ballRadius += (Math.random() - 0.4) * 5;
            // Keep ball within pocket area
            state.ballRadius = Math.min(state.ballRadius, NUM_RING_OUTER - 2);
            state.ballRadius = Math.max(state.ballRadius, NUM_RING_INNER + 5);
            audioEngine.playBallBounce();
          }

          // Gradually settle
          if (state.bounceCount > 80) {
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
          // Wheel keeps spinning gently even after ball settles
          state.wheelSpeed *= 0.995;

          // Ball locked in pocket, rotates with wheel
          const targetIdx = WHEEL_NUMBERS.indexOf(state.targetNumber);
          const targetA = targetIdx * SEG_ANGLE + state.wheelRotation + SEG_ANGLE / 2;
          state.ballAngle += (targetA - state.ballAngle) * 0.06;
          state.ballRadius += ((NUM_RING_OUTER + NUM_RING_INNER) / 2 - state.ballRadius) * 0.05;

          if (state.wheelSpeed < 0.0008) {
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
      drawWoodRing();
      drawNumberCrown(state.wheelRotation);
      drawConeAndTurret();

      if (state.phase !== "idle") {
        drawBall(state.ballAngle, state.ballRadius);
      }

      if (state.showResult && state.targetNumber >= 0) {
        drawWinningNumber(state.targetNumber);
      }

      animationRef.current = requestAnimationFrame(loop);
    }

    loop();
    return () => { cancelAnimationFrame(animationRef.current); };
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
