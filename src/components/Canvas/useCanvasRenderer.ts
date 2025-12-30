import { Shape } from '@/types/shapes';
import { Tool } from '@/types/tools';
import { drawPath, drawLine } from './drawingUtils';

/* ----------------------------------
   Arrow drawing helper
---------------------------------- */
function drawArrow(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number
) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const head = 10;

    // main line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // arrow head
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
        x2 - head * Math.cos(angle - Math.PI / 6),
        y2 - head * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        x2 - head * Math.cos(angle + Math.PI / 6),
        y2 - head * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.stroke();
}

/* ----------------------------------
   Main renderer
---------------------------------- */
export function renderCanvas(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    shapes: Shape[],
    tool: Tool,
    live: {
        path?: { x: number; y: number }[];
        rect?: { x: number; y: number; w: number; h: number };
        line?: { x1: number; y1: number; x2: number; y2: number };
        circle?: { cx: number; cy: number; r: number };
        arrow?: { x1: number; y1: number; x2: number; y2: number };
    }
) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* -------- committed shapes -------- */
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

        if (shape.type === 'circle') {
            ctx.beginPath();
            ctx.arc(shape.cx, shape.cy, shape.r, 0, Math.PI * 2);
            ctx.stroke();
        }
        if (shape.type === 'arrow') {
            drawArrow(ctx, shape.x1, shape.y1, shape.x2, shape.y2);
        }

        if (shape.type === 'text') {
  ctx.font = '16px sans-serif';
  ctx.fillStyle = 'black';
  ctx.fillText(shape.text, shape.x, shape.y);
}

    }

    /* -------- live preview -------- */
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

    if (tool === 'circle' && live.circle) {
        ctx.beginPath();
        ctx.arc(
            live.circle.cx,
            live.circle.cy,
            live.circle.r,
            0,
            Math.PI * 2
        );
        ctx.stroke();
    }

    if (tool === 'arrow' && live.arrow) {
        drawArrow(
            ctx,
            live.arrow.x1,
            live.arrow.y1,
            live.arrow.x2,
            live.arrow.y2
        );
    }

}
