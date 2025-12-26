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

export type Shape = PencilShape | RectangleShape | LineShape;


