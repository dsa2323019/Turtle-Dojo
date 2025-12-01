import React, { useEffect, useRef } from 'react';
import { DrawingStep } from '../types';

interface GameCanvasProps {
  steps: DrawingStep[];
  isAnimating: boolean;
  onAnimationComplete: () => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ steps, isAnimating, onAnimationComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const currentStepRef = useRef<number>(0);

  // Setup Canvas
  const draw = (upToStepIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Grid
    drawGrid(ctx, canvas.width, canvas.height);

    // Coordinate System Reset (Center is 0,0)
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(1, -1); // Flip Y so positive Y is up

    // Draw Path
    if (steps.length > 0) {
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      let currentX = 0;
      let currentY = 0;

      // We need to replay path segments
      // To optimize, we could just stroke the whole path, but color might change
      ctx.beginPath();
      ctx.moveTo(0, 0);
      
      for (let i = 1; i <= upToStepIndex; i++) {
        const step = steps[i];
        const prev = steps[i-1];
        
        ctx.strokeStyle = step.color;
        
        // If color changed, stroke existing and start new
        if (prev && step.color !== prev.color) {
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
        }

        if (step.penDown) {
            ctx.lineTo(step.x, step.y);
        } else {
            ctx.moveTo(step.x, step.y);
        }
        
        currentX = step.x;
        currentY = step.y;
      }
      ctx.stroke();

      // Draw Turtle
      const lastStep = steps[upToStepIndex];
      drawTurtle(ctx, lastStep.x, lastStep.y, lastStep.angle);
    } else {
        // Initial Turtle
        drawTurtle(ctx, 0, 0, 90);
    }

    ctx.restore();
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.strokeStyle = '#e2e8f0'; // slate-200
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    const spacing = 50;
    const offsetX = (w / 2) % spacing;
    const offsetY = (h / 2) % spacing;

    for (let x = offsetX; x < w; x += spacing) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = offsetY; y < h; y += spacing) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();
    
    // Axes
    ctx.strokeStyle = '#cbd5e1'; // slate-300
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
  };

  const drawTurtle = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((angle - 90) * Math.PI / 180); // Adjust because default turtle points up (90deg), but drawing assumes 0 is right.
    // Actually our interpreter assumes 90 is UP. Math functions use 0 as Right.
    // If angle is 90 (up), we want to rotate by 0 relative to "Up" logic?
    // Let's rely on standard transform: 
    // ctx.rotate takes radians. 
    // If angle=90, we want turtle head up.
    // If we draw turtle facing +Y (up), then we don't need offset if rotate works standardly?
    // Let's standardise: Draw turtle facing RIGHT (0 deg). 
    // Then rotate by `angle`.
    
    // Interpreter: Start 90 (Up).
    // Canvas: 0 is Right.
    // So if angle is 90, we rotate 90 deg.
    
    // Wait, let's draw the turtle facing UP locally.
    // If angle is 90 (global up), we want 0 rotation relative to drawing it up.
    // If angle is 0 (global right), we want -90 rotation.
    // So rotate by (angle - 90).
    
    // Drawing a simple turtle icon (triangle)
    ctx.fillStyle = '#10b981'; // emerald-500
    ctx.beginPath();
    ctx.moveTo(0, 10); // Nose (up)
    ctx.lineTo(-7, -7); // Back Left
    ctx.lineTo(0, -3); // Indent
    ctx.lineTo(7, -7); // Back Right
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  useEffect(() => {
    // Initial draw
    draw(0);
  }, []);

  useEffect(() => {
    if (isAnimating && steps.length > 0) {
      currentStepRef.current = 0;
      let lastTime = performance.now();
      const speed = 0.05; // ms per step? No, too fast.
      // We want to draw X steps per frame.
      
      const animate = (time: number) => {
        // Draw up to currentStep
        if (currentStepRef.current < steps.length - 1) {
            currentStepRef.current += 2; // Speed multiplier
            if (currentStepRef.current >= steps.length) currentStepRef.current = steps.length - 1;
            
            draw(currentStepRef.current);
            animationRef.current = requestAnimationFrame(animate);
        } else {
            draw(steps.length - 1);
            onAnimationComplete();
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    } else if (!isAnimating && steps.length > 0) {
        // Jump to end if not animating (e.g. resize)
        draw(steps.length - 1);
    }
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [steps, isAnimating]);

  return (
    <canvas 
        ref={canvasRef} 
        width={800} 
        height={600} 
        className="w-full h-full bg-white rounded-lg shadow-inner cursor-crosshair"
    />
  );
};

export default GameCanvas;
