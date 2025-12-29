import { Tool } from '@/types/tools';
import { nanoid } from 'nanoid';
import { Shape } from '@/types/shapes';

type Point = { x: number; y: number };

type Rectangle = {
  x: number;
  y: number;
  w: number;
  h: number;
};

interface Params {
  tool: Tool;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  queueDraw: () => void;

  // live refs
  isDrawingRef: React.MutableRefObject<boolean>;
  currentPathRef: React.MutableRefObject<Point[]>;
  currentRectRef: React.MutableRefObject<Rectangle | null>;
  currentLineRef: React.MutableRefObject<
    { x1: number; y1: number; x2: number; y2: number } | null
  >;
  startPointRef: React.MutableRefObject<Point | null>;
  startLinePointRef: React.MutableRefObject<Point | null>;

  currentCirclePointRef: React.MutableRefObject<
    { cx: number; cy: number; r: number } | null
  >;
  startCirclePointRef: React.MutableRefObject<Point | null>;

  shapes: Shape[];
  addShape: (shape: Shape) => void;
  removeShape: (id: string) => void;
  setTextInput: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
}

const MIN_DIST_SQ = 4;
const ERASE_TOLERANCE = 6;

/* ---------------- HIT TEST HELPERS ---------------- */

function distToSegment(p: Point, a: Point, b: Point) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);

  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const px = a.x + t * dx;
  const py = a.y + t * dy;
  return Math.hypot(p.x - px, p.y - py);
}

function hitTest(shape: Shape, point: Point): boolean {
  if (shape.type === 'rectangle') {
    return (
      point.x >= shape.x &&
      point.x <= shape.x + shape.w &&
      point.y >= shape.y &&
      point.y <= shape.y + shape.h
    );
  }

  if (shape.type === 'circle') {
    return (
      Math.hypot(point.x - shape.cx, point.y - shape.cy) <=
      shape.r + ERASE_TOLERANCE
    );
  }

  if (shape.type === 'line' || shape.type === 'arrow') {
    return (
      distToSegment(
        point,
        { x: shape.x1, y: shape.y1 },
        { x: shape.x2, y: shape.y2 }
      ) <= ERASE_TOLERANCE
    );
  }

  if (shape.type === 'pencil') {
    for (let i = 1; i < shape.points.length; i++) {
      if (
        distToSegment(
          point,
          shape.points[i - 1],
          shape.points[i]
        ) <= ERASE_TOLERANCE
      ) {
        return true;
      }
    }
    return false;
  }

  if (shape.type === 'text') {
    // Approximate bounding box
    const width = shape.text.length * 8;
    const height = 16;
    return (
      point.x >= shape.x &&
      point.x <= shape.x + width &&
      point.y <= shape.y &&
      point.y >= shape.y - height
    );
  }

  return false;
}

/* ---------------- MAIN HOOK ---------------- */

export function useCanvasEvents({
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
  shapes,
  addShape,
  removeShape,
  setTextInput,
}: Params) {
  function getMousePos(
    e: React.MouseEvent<HTMLCanvasElement>
  ): Point {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function shouldAddPoint(last: Point | undefined, next: Point) {
    if (!last) return true;
    const dx = last.x - next.x;
    const dy = last.y - next.y;
    return dx * dx + dy * dy > MIN_DIST_SQ;
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const point = getMousePos(e);
    isDrawingRef.current = true;

    /* -------- ERASER -------- */
    if (tool === 'eraser') {
      const hit = [...shapes]
        .reverse()
        .find((shape) => hitTest(shape, point));

      if (hit) {
        removeShape(hit.id);
        queueDraw();
      }

      isDrawingRef.current = false;
      return;
    }

    /* -------- DRAW TOOLS -------- */
    if (tool === 'pencil') currentPathRef.current = [point];

    if (tool === 'rectangle') {
      startPointRef.current = point;
      currentRectRef.current = { x: point.x, y: point.y, w: 0, h: 0 };
    }

    if (tool === 'line' || tool === 'arrow') {
      startLinePointRef.current = point;
      currentLineRef.current = {
        x1: point.x,
        y1: point.y,
        x2: point.x,
        y2: point.y,
      };
    }

    if (tool === 'circle') {
      startCirclePointRef.current = point;
      currentCirclePointRef.current = {
        cx: point.x,
        cy: point.y,
        r: 0,
      };
    }

    if (tool === 'text') {
        setTextInput({ x: point.x, y: point.y });
        isDrawingRef.current = false;
        return;
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
      const s = startPointRef.current;
      currentRectRef.current = {
        x: s.x,
        y: s.y,
        w: point.x - s.x,
        h: point.y - s.y,
      };
      queueDraw();
    }

    if ((tool === 'line' || tool === 'arrow') && startLinePointRef.current) {
      const s = startLinePointRef.current;
      currentLineRef.current = {
        x1: s.x,
        y1: s.y,
        x2: point.x,
        y2: point.y,
      };
      queueDraw();
    }

    if (tool === 'circle' && startCirclePointRef.current) {
      const s = startCirclePointRef.current;
      currentCirclePointRef.current = {
        cx: s.x,
        cy: s.y,
        r: Math.hypot(point.x - s.x, point.y - s.y),
      };
      queueDraw();
    }
  }

  function handleMouseUp() {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (tool === 'pencil' && currentPathRef.current.length > 1) {
      addShape({ id: nanoid(), type: 'pencil', points: [...currentPathRef.current] });
      currentPathRef.current = [];
    }

    if (tool === 'rectangle' && currentRectRef.current) {
      addShape({ id: nanoid(), type: 'rectangle', ...currentRectRef.current });
      currentRectRef.current = null;
      startPointRef.current = null;
    }

    if ((tool === 'line' || tool === 'arrow') && currentLineRef.current) {
      addShape({
        id: nanoid(),
        type: tool,
        ...currentLineRef.current,
      });
      currentLineRef.current = null;
      startLinePointRef.current = null;
    }

    if (tool === 'circle' && currentCirclePointRef.current) {
      addShape({
        id: nanoid(),
        type: 'circle',
        ...currentCirclePointRef.current,
      });
      currentCirclePointRef.current = null;
      startCirclePointRef.current = null;
    }
    
  }

  return { handleMouseDown, handleMouseMove, handleMouseUp };
}
