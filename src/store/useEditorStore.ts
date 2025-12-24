/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { Shape } from '@/types/shapes';
import { joinRoom, sendShape } from '@/lib/realtime';
import { saveDrawing, loadDrawing } from '@/lib/db';


interface EditorState {
    shapes: Shape[];
    history: Shape[][];
    redoStack: Shape[][];

    addShape: (shape: Shape) => void;
    setShapes: (shapes: Shape[]) => void;
    undo: () => void;
    redo: () => void;
    channel: any;
    connectRoom: (roomId: string) => void;
    roomId: string;
    save: () => Promise<void>;
    load: (roomId: string) => Promise<void>;

}

export const useEditorStore = create<EditorState>((set, get) => ({
    shapes: [],
    history: [],
    redoStack: [],

    addShape: (shape) => {
        const { shapes, history, channel } = get();

        set({
            shapes: [...shapes, shape],
            history: [...history, shapes],
            redoStack: [],
        });

        if (channel) {
            sendShape(channel, shape);
        }
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
    channel: null,
    connectRoom: (roomId) => {
        const channel = joinRoom(roomId, (shape) => {
            set((state) => ({
                shapes: [...state.shapes, shape],
            }));
        });

        set({ channel });
    },
    roomId: 'demo-room',

    save: async () => {
        const { roomId, shapes } = get();
        await saveDrawing(roomId, shapes);
    },

    load: async (roomId) => {
        const shapes = await loadDrawing(roomId);
        if (shapes) {
            set({ shapes });
        }
    },

}));
