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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentLineRef: React.MutableRefObject<any | null>;
  startPointRef: React.MutableRefObject<Point | null>;
  startLinePointRef: React.MutableRefObject<Point | null>;

  addShape: (shape: Shape) => void;
}

const MIN_DIST_SQ = 4;

export function useCanvasEvents({
  tool,
  canvasRef,
  queueDraw,
  isDrawingRef,
  currentPathRef,
  currentRectRef,
  currentLineRef,
  startPointRef,
  startLinePointRef,
  addShape,
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

  function shouldAddPoint(
    last: Point | undefined,
    next: Point
  ) {
    if (!last) return true;
    const dx = last.x - next.x;
    const dy = last.y - next.y;
    return dx * dx + dy * dy > MIN_DIST_SQ;
  }

  function handleMouseDown(
    e: React.MouseEvent<HTMLCanvasElement>
  ) {
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

    if (tool === 'line') {
      startLinePointRef.current = point;
      currentLineRef.current = {
        x1: point.x,
        y1: point.y,
        x2: point.x,
        y2: point.y,
      };
    }
  }

  function handleMouseMove(
    e: React.MouseEvent<HTMLCanvasElement>
  ) {
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

    if (tool === 'line' && startLinePointRef.current) {
      const start = startLinePointRef.current;
      currentLineRef.current = {
        x1: start.x,
        y1: start.y,
        x2: point.x,
        y2: point.y,
      };
      queueDraw();
    }
  }

  function handleMouseUp() {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (tool === 'pencil' && currentPathRef.current.length > 1) {
      addShape({
        id: nanoid(),
        type: 'pencil',
        points: [...currentPathRef.current],
      });
      currentPathRef.current = [];
    }

    if (tool === 'rectangle' && currentRectRef.current) {
      const r = currentRectRef.current;
      addShape({
        id: nanoid(),
        type: 'rectangle',
        x: r.x,
        y: r.y,
        w: r.w,
        h: r.h,
      });
      currentRectRef.current = null;
      startPointRef.current = null;
    }

    if (tool === 'line' && currentLineRef.current) {
      const l = currentLineRef.current;
      addShape({
        id: nanoid(),
        type: 'line',
        x1: l.x1,
        y1: l.y1,
        x2: l.x2,
        y2: l.y2,
      });
      currentLineRef.current = null;
      startLinePointRef.current = null;
    }
  }

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
