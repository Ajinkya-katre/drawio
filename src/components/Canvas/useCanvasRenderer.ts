import { Shape } from '@/types/shapes';
import { Tool } from '@/types/tools';
import { drawPath, drawLine } from './drawingUtils';

export function renderCanvas(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  shapes: Shape[],
  tool: Tool,
  live: {
    path?: { x: number; y: number }[];
    rect?: { x: number; y: number; w: number; h: number };
    line?: { x1: number; y1: number; x2: number; y2: number };
  }
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const shape of shapes) {
    if (shape.type === 'pencil') {
      drawPath(ctx, shape.points);
    }

    if (shape.type === 'rectangle') {
      ctx.strokeRect(shape.x, shape.y, shape.w, shape.h);
    }

    if (shape.type === 'line') {
      drawLine(ctx, shape.x1, shape.y1, shape.x2, shape.y2);
    }
  }

  if (tool === 'pencil' && live.path) {
    drawPath(ctx, live.path);
  }

  if (tool === 'rectangle' && live.rect) {
    ctx.strokeRect(
      live.rect.x,
      live.rect.y,
      live.rect.w,
      live.rect.h
    );
  }

  if (tool === 'line' && live.line) {
    drawLine(
      ctx,
      live.line.x1,
      live.line.y1,
      live.line.x2,
      live.line.y2
    );
  }
}
