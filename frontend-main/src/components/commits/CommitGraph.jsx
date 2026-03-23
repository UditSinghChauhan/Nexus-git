import React from "react";
import { useMemo } from "react";
import { Background, Controls, MarkerType, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

function getPrimaryParent(commit) {
  return commit.parent1 || commit.parent || null;
}

function buildGraph(commits, selectedHash) {
  const orderedCommits = [...commits].sort(
    (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime()
  );
  const laneByHash = new Map();
  let nextLane = 0;

  for (const commit of orderedCommits) {
    if (!laneByHash.has(commit.hash)) {
      laneByHash.set(commit.hash, nextLane);
      nextLane += 1;
    }

    const primaryParent = getPrimaryParent(commit);
    const secondaryParent = commit.parent2 || null;

    if (primaryParent && !laneByHash.has(primaryParent)) {
      laneByHash.set(primaryParent, laneByHash.get(commit.hash));
    }

    if (secondaryParent && !laneByHash.has(secondaryParent)) {
      laneByHash.set(secondaryParent, nextLane);
      nextLane += 1;
    }
  }

  const nodes = orderedCommits.map((commit, index) => {
    const lane = laneByHash.get(commit.hash) || 0;
    const isSelected = selectedHash === commit.hash;

    return {
      id: commit.hash,
      position: {
        x: lane * 240,
        y: index * 130,
      },
      draggable: false,
      data: {
        label: (
          <div
            className={`min-w-[190px] rounded-lg border px-4 py-3 text-left shadow-sm ${
              isSelected
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-800"
            }`}
          >
            <div className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
              Commit
            </div>
            <div className="mt-2 font-mono text-xs">{commit.hash.slice(0, 12)}</div>
            <div className="mt-2 text-sm font-medium">{commit.message}</div>
            <div className="mt-2 text-xs opacity-70">
              {new Date(commit.timestamp).toLocaleString()}
            </div>
          </div>
        ),
      },
      sourcePosition: "bottom",
      targetPosition: "top",
      type: "default",
    };
  });

  const edges = [];

  for (const commit of orderedCommits) {
    const primaryParent = getPrimaryParent(commit);
    const secondaryParent = commit.parent2 || null;

    if (primaryParent) {
      edges.push({
        id: `${commit.hash}-${primaryParent}`,
        source: commit.hash,
        target: primaryParent,
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: "#0f172a", strokeWidth: 1.5 },
      });
    }

    if (secondaryParent) {
      edges.push({
        id: `${commit.hash}-${secondaryParent}`,
        source: commit.hash,
        target: secondaryParent,
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: "#2563eb", strokeWidth: 1.5 },
      });
    }
  }

  return { nodes, edges };
}

export default function CommitGraph({ commits, selectedHash, onSelect }) {
  const { nodes, edges } = useMemo(
    () => buildGraph(commits, selectedHash),
    [commits, selectedHash]
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
        Commit Graph
      </div>
      <div className="h-[520px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={1.5}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          onNodeClick={(_, node) => onSelect(node.id)}
        >
          <Background color="#cbd5e1" gap={18} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}
