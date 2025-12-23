'use client';

import { Tool } from '@/types/tools';
import { useEffect, useRef } from 'react';

type Point = { x: number; y: number };

const MIN_DIST_SQ = 4; // point sampling threshold

interface DrawingCanvasProps {
    tool: Tool;
}

type Rectangle = {
    x: number;
    y: number;
    w: number;
    h: number;
};



export default function DrawingCanvas({ tool }: DrawingCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

    const isDrawingRef = useRef(false);
    const currentPathRef = useRef<Point[]>([]);
    const pathsRef = useRef<Point[][]>([]);
    const rafRef = useRef<number | null>(null);

    const startPointRef = useRef<Point | null>(null);
    const currentRectRef = useRef<Rectangle | null>(null);

    const rectanglesRef = useRef<Rectangle[]>([]);


    // ✅ Setup canvas once
    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        ctxRef.current = ctx;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        ctx.scale(dpr, dpr);

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000';
    }, []);

function queueDraw() {
  if (rafRef.current !== null) return;

  rafRef.current = requestAnimationFrame(() => {
    rafRef.current = null;

    const ctx = ctxRef.current!;
    const canvas = canvasRef.current!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw committed shapes
    pathsRef.current.forEach((p) => drawPath(ctx, p));
    rectanglesRef.current.forEach((r) =>
      ctx.strokeRect(r.x, r.y, r.w, r.h)
    );

    // draw live shape
    if (tool === 'pencil') {
      drawPath(ctx, currentPathRef.current);
    }

    if (tool === 'rectangle') {
      drawLiveRectangle();
    }
  });
}



    function getMousePos(e: React.MouseEvent<HTMLCanvasElement>): Point {
        const rect = canvasRef.current!.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function shouldAddPoint(last: Point | undefined, next: Point) {
        if (!last) return true;
        const dx = last.x - next.x;
        const dy = last.y - next.y;
        return dx * dx + dy * dy > MIN_DIST_SQ;
    }

    // ✅ Draw ONLY current stroke (no clear)
    function drawLiveStroke() {
        rafRef.current = null;
        const ctx = ctxRef.current!;
        drawPath(ctx, currentPathRef.current);
    }

    function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
        const point = getMousePos(e);
        isDrawingRef.current = true;

        if (tool === 'pencil') {
            currentPathRef.current = [point];
        }

        if (tool === 'rectangle') {
            startPointRef.current = point;
            currentRectRef.current = {
                x: point.x,
                y: point.y,
                w: 0,
                h: 0,
            };
        }
    }


    function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
        if (!isDrawingRef.current) return;
        const point = getMousePos(e);

        if (tool === 'pencil') {
            const last = currentPathRef.current.at(-1);
            if (!shouldAddPoint(last, point)) return;

            currentPathRef.current.push(point);
            queueDraw();
        }

       if (tool === 'rectangle' && startPointRef.current) {
        const start = startPointRef.current;
            currentRectRef.current = {
                x: start.x,
                y: start.y,
                w: point.x - start.x,
                h: point.y - start.y,
            };
            queueDraw();
        }
    }

    function handleMouseUp() {
        if (!isDrawingRef.current) return;
        isDrawingRef.current = false;

        if (tool === 'pencil') {
            pathsRef.current.push([...currentPathRef.current]);
            currentPathRef.current = [];
        }

        if (tool === 'rectangle' && currentRectRef.current) {
            rectanglesRef.current.push({ ...currentRectRef.current });
            currentRectRef.current = null;
            startPointRef.current = null;
        }

        redrawAll();
    }


    function redrawAll() {
        const ctx = ctxRef.current!;
        const canvas = canvasRef.current!;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        pathsRef.current.forEach((p) => drawPath(ctx, p));

        rectanglesRef.current.forEach((r) => {
            ctx.strokeRect(r.x, r.y, r.w, r.h);
        });

        if (currentRectRef.current) {
            const r = currentRectRef.current;
            ctx.strokeRect(r.x, r.y, r.w, r.h);
        }
    }

    function drawLiveRectangle() {
  const ctx = ctxRef.current!;
  const rect = currentRectRef.current;
  if (!rect) return;

  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
}



    return (
        <canvas
            ref={canvasRef}
            style={{ width: '3000px', height: '3000px' }}
            className="bg-white block cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        />
    );
}

function drawPath(ctx: CanvasRenderingContext2D, path: Point[]) {
    if (path.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);

    for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
    }

    ctx.stroke();
}
