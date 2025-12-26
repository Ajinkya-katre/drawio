import { Shape } from '@/types/shapes';

export function exportToSVG(
  shapes: Shape[],
  width = 3000,
  height = 3000
): string {
  const svgShapes = shapes.map((shape) => {
    if (shape.type === 'pencil') {
      const d = shape.points
        .map((p, i) =>
          i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
        )
        .join(' ');

      return `
        <path
          d="${d}"
          fill="none"
          stroke="black"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      `;
    }

    if (shape.type === 'rectangle') {
      return `
        <rect
          x="${shape.x}"
          y="${shape.y}"
          width="${shape.w}"
          height="${shape.h}"
          fill="none"
          stroke="black"
          stroke-width="2"
        />
      `;
    }

    return '';
  });

  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
    >
      ${svgShapes.join('\n')}
    </svg>
  `;
}
