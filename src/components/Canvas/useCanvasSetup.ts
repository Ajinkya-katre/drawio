import { useEffect } from 'react';

export function useCanvasSetup(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  ctxRef: React.RefObject<CanvasRenderingContext2D | null>
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctxRef.current = ctx;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000';
    ctx.font = '16px Inter, sans-serif';

  }, []);
}
