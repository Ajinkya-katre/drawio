export type Point = {
  x: number;
  y: number;
};

export type PencilShape = {
  id: string;
  type: 'pencil';
  points: Point[];
};

export type RectangleShape = {
  id: string;
  type: 'rectangle';
  x: number;
  y: number;
  w: number;
  h: number;
};

export type LineShape = {
  id: string;
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type CircleShape = {
  id: string;
  type: 'circle';
  cx: number;
  cy: number;
  r: number;
};

export type ArrowShape = {
  id: string;
  type: 'arrow';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type TextShape = {
  id: string;
  type: 'text';
  x: number;
  y: number;
  text: string;
};

export type EraserShape = {
  id: string;
  type: 'eraser';
  points: Point[];
};

export type Shape = PencilShape | RectangleShape | LineShape | CircleShape | ArrowShape | TextShape | EraserShape;


