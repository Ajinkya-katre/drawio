'use client';

import { useEffect, useRef, useState } from 'react';
import DrawingCanvas from '@/components/Canvas/DrawingCanvas';
import Toolbar from '@/components/Toolbar/Toolbar';
import { Tool } from '@/types/tools';
import { useEditorStore } from '@/store/useEditorStore';
import type { DrawingCanvasHandle } from '@/components/Canvas/DrawingCanvas';

export default function Home() {
  const canvasRef = useRef<DrawingCanvasHandle>(null);
  const [tool, setTool] = useState<Tool>('pencil');

  const connectRoom = useEditorStore((s) => s.connectRoom);
  const load = useEditorStore((s) => s.load);
  const shapes = useEditorStore((s) => s.shapes);
  const save = useEditorStore((s) => s.save);

  // Guards
  const hasLoadedFromDB = useRef(false);
  const hasConnectedRealtime = useRef(false);

  // -----------------------------
  // Export PNG
  // -----------------------------
  function handleExportPNG() {
    canvasRef.current?.exportPNG();
  }

  // -----------------------------
  // 1️⃣ Load persisted drawing
  // -----------------------------
  useEffect(() => {
    let mounted = true;

    (async () => {
      await load('demo-room');
      if (mounted) {
        hasLoadedFromDB.current = true;
      }
    })();

    return () => {
      mounted = false;
    };
  }, [load]);

  // -----------------------------
  // 2️⃣ Connect realtime AFTER load
  // -----------------------------
  useEffect(() => {
    if (!hasLoadedFromDB.current) return;
    if (hasConnectedRealtime.current) return;

    connectRoom('demo-room');
    hasConnectedRealtime.current = true;
  }, [connectRoom, shapes.length]); // 👈 ensures sync happens once after load

  // -----------------------------
  // 3️⃣ Auto-save (debounced)
  // -----------------------------
  useEffect(() => {
    if (!hasLoadedFromDB.current) return;
    if (shapes.length === 0) return;

    const timeout = setTimeout(() => {
      save();
    }, 800);

    return () => clearTimeout(timeout);
  }, [shapes, save]);

  return (
    <main className="w-screen h-screen bg-gray-100">
      <Toolbar
        activeTool={tool}
        onToolChange={setTool}
        onExportPNG={handleExportPNG}
      />

      <DrawingCanvas ref={canvasRef} tool={tool} />
    </main>
  );
}
