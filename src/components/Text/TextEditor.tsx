'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  x: number;
  y: number;
  onSubmit: (text: string) => void;
}

export default function TextEditor({ x, y, onSubmit }: Props) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <input
      ref={ref}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => onSubmit(value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSubmit(value);
        if (e.key === 'Escape') onSubmit('');
      }}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        fontSize: 16,
        border: '1px solid #ddd',
        padding: '2px 4px',
        outline: 'none',
        background: 'white',
      }}
    />
  );
}
