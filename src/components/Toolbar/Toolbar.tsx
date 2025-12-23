'use client';

import { Tool } from '@/types/tools';

interface ToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
}

const tools: { tool: Tool; label: string }[] = [
  { tool: 'select', label: '🖱️' },
  { tool: 'pencil', label: '✏️' },
  { tool: 'rectangle', label: '▭' },
  { tool: 'circle', label: '◯' },
  { tool: 'arrow', label: '→' },
  { tool: 'line', label: '/' },
  { tool: 'text', label: 'A' },
  { tool: 'image', label: '🖼️' },
  { tool: 'eraser', label: '⌫' },
];

export default function Toolbar({
  activeTool,
  onToolChange,
}: ToolbarProps) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 rounded-xl bg-white shadow-lg border px-2 py-1">
        {tools.map(({ tool, label }) => (
          <button
            key={tool}
            onClick={() => onToolChange(tool)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm
              ${
                activeTool === tool
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100'
              }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
