"use client";

interface Node {
  id: string;
  label: string;
}
interface Edge {
  from: string;
  to: string;
  label?: string;
}

/**
 * Minimal illustrative renderer: lays nodes out in a single vertical
 * flow. Good enough for "teach a linear process" use cases; swap in
 * a real layout engine (dagre, elkjs) once nodes/edges get non-trivial.
 */
export function BlackboardRenderer({
  title,
  nodes,
  edges,
}: {
  title: string;
  diagramType: string;
  nodes: Node[];
  edges: Edge[];
}) {
  const boxHeight = 56;
  const gap = 40;
  const width = 360;
  const height = nodes.length * (boxHeight + gap);

  const yFor = (i: number) => i * (boxHeight + gap) + boxHeight / 2;

  return (
    <div className="rounded-lg border p-4 bg-slate-900 text-white">
      <h3 className="font-semibold mb-3">{title}</h3>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
        {edges.map((e, i) => {
          const fromIdx = nodes.findIndex((n) => n.id === e.from);
          const toIdx = nodes.findIndex((n) => n.id === e.to);
          if (fromIdx === -1 || toIdx === -1) return null;
          const y1 = yFor(fromIdx) + boxHeight / 2;
          const y2 = yFor(toIdx) - boxHeight / 2;
          return (
            <g key={i}>
              <line x1={width / 2} y1={y1} x2={width / 2} y2={y2} stroke="#94a3b8" strokeWidth={2} markerEnd="url(#arrow)" />
              {e.label && (
                <text x={width / 2 + 10} y={(y1 + y2) / 2} fontSize={11} fill="#cbd5e1">
                  {e.label}
                </text>
              )}
            </g>
          );
        })}
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#94a3b8" />
          </marker>
        </defs>
        {nodes.map((n, i) => (
          <g key={n.id}>
            <rect
              x={width / 2 - 100}
              y={yFor(i) - boxHeight / 2}
              width={200}
              height={boxHeight}
              rx={8}
              fill="#1e293b"
              stroke="#38bdf8"
            />
            <text x={width / 2} y={yFor(i) + 4} fontSize={13} textAnchor="middle" fill="white">
              {n.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
