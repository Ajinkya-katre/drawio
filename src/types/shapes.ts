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

export type Shape = PencilShape | RectangleShape;
