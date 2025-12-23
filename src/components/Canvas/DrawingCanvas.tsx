'use client';

import { useEffect, useRef } from 'react';
import { Tool } from '@/types/tools';
import { useEditorStore } from '@/store/useEditorStore';
import { Shape } from '@/types/shapes';
import { nanoid } from 'nanoid';

type Point = { x: number; y: number };

type Rectangle = {
    x: number;
    y: number;
    w: number;
    h: number;
};

const MIN_DIST_SQ = 4;

interface DrawingCanvasProps {
    tool: Tool;
}

export default function DrawingCanvas({ tool }: DrawingCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const rafRef = useRef<number | null>(null);

    // live drawing refs (performance)
    const isDrawingRef = useRef(false);
    const currentPathRef = useRef<Point[]>([]);
    const startPointRef = useRef<Point | null>(null);
    const currentRectRef = useRef<Rectangle | null>(null);

    // Zustand
    const shapes = useEditorStore((s) => s.shapes);
    const addShape = useEditorStore((s) => s.addShape);
    const undo = useEditorStore((s) => s.undo);
    const redo = useEditorStore((s) => s.redo);

    // ---------------------------------
    // Keyboard shortcuts
    // ---------------------------------
    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                undo();
            }

            if (e.ctrlKey && (e.key === 'y' || e.key === 'Z')) {
                e.preventDefault();
                redo();
            }
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [undo, redo]);

    // ---------------------------------
    // Canvas setup (DPI safe)
    // ---------------------------------
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

    // ---------------------------------
    // Redraw when Zustand changes
    // ---------------------------------


    // ---------------------------------
    // Helpers
    // ---------------------------------
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

    function queueDraw() {
        if (rafRef.current !== null) return;

        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            redrawAll();
        });
    }

    function redrawAll() {
        const ctx = ctxRef.current!;
        const canvas = canvasRef.current!;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // committed shapes (Zustand)
        for (const shape of shapes) {
            if (shape.type === 'pencil') {
                drawPath(ctx, shape.points);
            }

            if (shape.type === 'rectangle') {
                ctx.strokeRect(shape.x, shape.y, shape.w, shape.h);
            }
        }

        // live preview
        if (tool === 'pencil') {
            drawPath(ctx, currentPathRef.current);
        }

        if (tool === 'rectangle' && currentRectRef.current) {
            const r = currentRectRef.current;
            ctx.strokeRect(r.x, r.y, r.w, r.h);
        }
    }


    useEffect(() => {
        redrawAll();
    }, [shapes]);

    // ---------------------------------
    // Mouse handlers
    // ---------------------------------
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

        // commit pencil
        if (tool === 'pencil' && currentPathRef.current.length > 1) {
            const pencilShape: Shape = {
                id: nanoid(),
                type: 'pencil',
                points: [...currentPathRef.current],
            };

            addShape(pencilShape);
            currentPathRef.current = [];
        }

        // commit rectangle
        if (tool === 'rectangle' && currentRectRef.current) {
            const r = currentRectRef.current;

            const rectShape: Shape = {
                id: nanoid(),
                type: 'rectangle',
                x: r.x,
                y: r.y,
                w: r.w,
                h: r.h,
            };

            addShape(rectShape);
            currentRectRef.current = null;
            startPointRef.current = null;
        }

        redrawAll();
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

// ---------------------------------
// Drawing utils
// ---------------------------------
function drawPath(ctx: CanvasRenderingContext2D, path: Point[]) {
    if (path.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);

    for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
    }

    ctx.stroke();
}
