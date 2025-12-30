'use client';

import {
    forwardRef,
    useRef,
    useImperativeHandle,
    useEffect,
    useState,
} from 'react';
import { Tool } from '@/types/tools';
import { useEditorStore } from '@/store/useEditorStore';
import { exportToSVG } from '@/lib/exportSvg';

import { useCanvasSetup } from './useCanvasSetup';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { renderCanvas } from './useCanvasRenderer';
import { useCanvasEvents } from './useCanvasEvents';
import TextEditor from '../Text/TextEditor';
import { nanoid } from 'nanoid';

export interface DrawingCanvasHandle {
    exportPNG: () => void;
    exportSVG: () => void;
}

const DrawingCanvas = forwardRef<
    DrawingCanvasHandle,
    { tool: Tool }
>(({ tool }, ref) => {
    const [textInput, setTextInput] = useState<{ x: number; y: number; } | null>(null);
    
    const canvasRef = useRef<HTMLCanvasElement>(null!);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const rafRef = useRef<number | null>(null);

    // Live drawing refs
    const isDrawingRef = useRef(false);
    const currentPathRef = useRef<{ x: number; y: number }[]>([]);
    const currentRectRef = useRef<
        { x: number; y: number; w: number; h: number } | null
    >(null);
    const currentLineRef = useRef<
        { x1: number; y1: number; x2: number; y2: number } | null
    >(null);

    const startPointRef = useRef<{ x: number; y: number } | null>(null);
    const startLinePointRef = useRef<{ x: number; y: number } | null>(null);
    const startCirclePointRef = useRef<{ x: number; y: number } | null>(null);
    const currentCirclePointRef = useRef<
        { cx: number; cy: number; r: number } | null
    >(null);

    // Zustand
    const shapes = useEditorStore((s) => s.shapes);
    const addShape = useEditorStore((s) => s.addShape);
    const removeShape = useEditorStore((s) => s.removeShape); // ✅ FIX
    const undo = useEditorStore((s) => s.undo);
    const redo = useEditorStore((s) => s.redo);


    // Setup hooks
    useCanvasSetup(canvasRef, ctxRef);
    useKeyboardShortcuts(undo, redo);

    // ---------------------------------
    // Render scheduler
    // ---------------------------------
    function queueDraw() {
        if (rafRef.current !== null) return;

        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            if (!ctxRef.current || !canvasRef.current) return;

            renderCanvas(ctxRef.current, canvasRef.current, shapes, tool, {
                path: currentPathRef.current,
                rect: currentRectRef.current ?? undefined,
                line: currentLineRef.current ?? undefined,
                circle: currentCirclePointRef.current ?? undefined,
            });
        });
    }

    // Render on load / shape change
    useEffect(() => {
        if (!ctxRef.current || !canvasRef.current) return;

        renderCanvas(ctxRef.current, canvasRef.current, shapes, tool, {
            path: currentPathRef.current,
            rect: currentRectRef.current ?? undefined,
            line: currentLineRef.current ?? undefined,
            circle: currentCirclePointRef.current ?? undefined,
        });
    }, [shapes, tool]);

    // ---------------------------------
    // Export handlers
    // ---------------------------------
    useImperativeHandle(ref, () => ({
        exportPNG() {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `whiteboard-${Date.now()}.png`;
            link.click();
        },

        exportSVG() {
            const svg = exportToSVG(shapes);
            const blob = new Blob([svg], {
                type: 'image/svg+xml;charset=utf-8',
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `whiteboard-${Date.now()}.svg`;
            link.click();
            URL.revokeObjectURL(url);
        },
    }));



    // ---------------------------------
    // Mouse events
    // ---------------------------------
    const {
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
    } = useCanvasEvents({
        tool,
        canvasRef,
        queueDraw,
        isDrawingRef,
        currentPathRef,
        currentRectRef,
        currentLineRef,
        currentCirclePointRef,
        startCirclePointRef,
        startPointRef,
        startLinePointRef,
        addShape,
        removeShape, // ✅ FIX
        shapes,
        setTextInput,
    });

    return (
      <div className="relative w-full h-full">
  {textInput && (
    <TextEditor
      x={textInput.x}
      y={textInput.y}
      onSubmit={(text) => {
        if (!text.trim()) {
          setTextInput(null);
          return;
        }

        addShape({
          id: nanoid(),
          type: 'text',
          x: textInput.x,
          y: textInput.y,
          text,
        });

        setTextInput(null);
      }}
    />
  )}

  <canvas
    ref={canvasRef}
    className="bg-white block cursor-crosshair"
    style={{ width: '3000px', height: '3000px' }}
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    onMouseLeave={handleMouseUp}
  />
</div>

    );
});

DrawingCanvas.displayName = 'DrawingCanvas';
export default DrawingCanvas;
