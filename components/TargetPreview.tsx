import React, { useEffect, useRef } from 'react';
import { executeCode } from '../services/interpreter';

interface TargetPreviewProps {
  solutionCode: string;
}

const TargetPreview: React.FC<TargetPreviewProps> = ({ solutionCode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Execute logic to get steps
    const { steps } = executeCode(solutionCode);

    // Clear and Setup
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background for preview
    ctx.fillStyle = '#1e293b'; // slate-800
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Center and flip Y
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(0.5, -0.5); // Scale down for thumbnail

    if (steps.length > 0) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      
      // Draw ideal path
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#34d399'; // emerald-400
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 1; i < steps.length; i++) {
        const step = steps[i];
        if (step.penDown) {
            ctx.lineTo(step.x, step.y);
        } else {
            ctx.moveTo(step.x, step.y);
        }
      }
      ctx.stroke();
    }

    ctx.restore();
  }, [solutionCode]);

  return (
    <div className="flex flex-col items-center">
        <span className="text-xs text-slate-400 mb-1 uppercase tracking-wider">完成イメージ</span>
        <canvas 
            ref={canvasRef} 
            width={200} 
            height={150} 
            className="rounded border border-slate-700 shadow-sm bg-slate-800"
        />
    </div>
  );
};

export default TargetPreview;