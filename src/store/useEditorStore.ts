import { create } from 'zustand';
import { Shape } from '@/types/shapes';

interface EditorState {
  shapes: Shape[];
  history: Shape[][];
  redoStack: Shape[][];

  addShape: (shape: Shape) => void;
  setShapes: (shapes: Shape[]) => void;
  undo: () => void;
  redo: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  shapes: [],
  history: [],
  redoStack: [],

  addShape: (shape) => {
    const { shapes, history } = get();
    set({
      shapes: [...shapes, shape],
      history: [...history, shapes],
      redoStack: [],
    });
  },

  setShapes: (shapes) => {
    set({ shapes });
  },

  undo: () => {
    const { history, shapes, redoStack } = get();
    if (history.length === 0) return;

    const previous = history[history.length - 1];
    set({
      shapes: previous,
      history: history.slice(0, -1),
      redoStack: [shapes, ...redoStack],
    });
  },

  redo: () => {
    const { redoStack, shapes, history } = get();
    if (redoStack.length === 0) return;

    const next = redoStack[0];
    set({
      shapes: next,
      redoStack: redoStack.slice(1),
      history: [...history, shapes],
    });
  },
}));
