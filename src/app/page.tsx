'use client';

import { useEffect, useRef, useState } from 'react';
import DrawingCanvas from '@/components/Canvas/DrawingCanvas';
import Toolbar from '@/components/Toolbar/Toolbar';
import { Tool } from '@/types/tools';
import { useEditorStore } from '@/store/useEditorStore';

export default function Home() {
  const [tool, setTool] = useState<Tool>('pencil');

  const connectRoom = useEditorStore((s) => s.connectRoom);
  const load = useEditorStore((s) => s.load);
  const shapes = useEditorStore((s) => s.shapes);
  const save = useEditorStore((s) => s.save);

  // 🔐 Guards
  const hasLoadedFromDB = useRef(false);
  const hasConnectedRealtime = useRef(false);

  // 1️⃣ LOAD FROM DATABASE FIRST (CRITICAL)
  useEffect(() => {
    (async () => {
      await load('demo-room');
      hasLoadedFromDB.current = true;
    })();
  }, [load]);

  // 2️⃣ CONNECT REALTIME ONLY AFTER DB LOAD
  useEffect(() => {
    if (!hasLoadedFromDB.current) return;
    if (hasConnectedRealtime.current) return;

    connectRoom('demo-room');
    hasConnectedRealtime.current = true;
  }, [connectRoom]);

  // 3️⃣ AUTO-SAVE (ONLY AFTER DB LOAD)
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
      <Toolbar activeTool={tool} onToolChange={setTool} />
      <DrawingCanvas tool={tool} />
    </main>
  );
}
