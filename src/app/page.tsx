'use client';

import { useState } from 'react';
import DrawingCanvas from '@/components/Canvas/DrawingCanvas';
import Toolbar from '@/components/Toolbar/Toolbar';
import { Tool } from '@/types/tools';

export default function Home() {
  const [tool, setTool] = useState<Tool>('pencil');

  return (
    <main className="w-screen h-screen bg-gray-100">
      <Toolbar activeTool={tool} onToolChange={setTool} />
      <DrawingCanvas tool={tool} />
    </main>
  );
}
