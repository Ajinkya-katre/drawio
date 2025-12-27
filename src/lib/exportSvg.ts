import { Shape } from '@/types/shapes';

export function exportToSVG(shapes: Shape[]): string {
    const width = 3000;
    const height = 3000;

    const hasArrow = shapes.some((s) => s.type === 'arrow');

    const defs = hasArrow
        ? `
      <defs>
        <marker id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="10"
          refY="5"
          orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill="black" />
        </marker>
      </defs>
    `
        : '';

    const body = shapes
        .map((shape) => {
            if (shape.type === 'pencil') {
                return `<path
          d="M ${shape.points
                        .map((p) => `${p.x},${p.y}`)
                        .join(' L ')}"
          fill="none"
          stroke="black"
          stroke-width="2"
        />`;
            }

            if (shape.type === 'rectangle') {
                return `<rect
          x="${shape.x}"
          y="${shape.y}"
          width="${shape.w}"
          height="${shape.h}"
          fill="none"
          stroke="black"
          stroke-width="2"
        />`;
            }

            if (shape.type === 'line') {
                return `<line
          x1="${shape.x1}"
          y1="${shape.y1}"
          x2="${shape.x2}"
          y2="${shape.y2}"
          stroke="black"
          stroke-width="2"
        />`;
            }

            if (shape.type === 'circle') {
                return `<circle
          cx="${shape.cx}"
          cy="${shape.cy}"
          r="${shape.r}"
          fill="none"
          stroke="black"
          stroke-width="2"
        />`;
            }

            // ✅ ADD ARROW HERE
            if (shape.type === 'arrow') {
                return `<line
          x1="${shape.x1}"
          y1="${shape.y1}"
          x2="${shape.x2}"
          y2="${shape.y2}"
          stroke="black"
          stroke-width="2"
          marker-end="url(#arrowhead)"
        />`;
            }

            if (shape.type === 'text') {
                return `<text
          x="${shape.x}"
          y="${shape.y}"
          font-size="16"
          fill="black"
        >${shape.text}</text>`;
            }

            return '';
        })
        .join('\n');

    return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
    >
      ${defs}
      ${body}
    </svg>
  `;
}
