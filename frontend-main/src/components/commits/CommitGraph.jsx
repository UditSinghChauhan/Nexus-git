import { useMemo } from "react";
import { Background, Controls, MarkerType, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

function getPrimaryParent(commit) {
  return commit.parent1 || commit.parent || null;
}

function getBranchColor(lane) {
  const colors = [
    { node: "#6366f1", edge: "#6366f1" },  // indigo — main
    { node: "#10b981", edge: "#10b981" },  // emerald — feature
    { node: "#f59e0b", edge: "#f59e0b" },  // amber — release
    { node: "#ec4899", edge: "#ec4899" },  // pink
    { node: "#06b6d4", edge: "#06b6d4" },  // cyan
  ];
  return colors[lane % colors.length];
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
    const isMerge = Boolean(commit.parent2);
    const color = getBranchColor(lane);

    return {
      id: commit.hash,
      position: { x: lane * 260, y: index * 115 },
      draggable: false,
      data: {
        label: (
          <div
            style={{
              minWidth: "200px",
              borderRadius: "10px",
              padding: "12px 15px",
              textAlign: "left",
              background: isSelected
                ? `linear-gradient(135deg, rgba(${lane === 0 ? "99,102,241" : "16,185,129"},0.35), rgba(139,92,246,0.2))`
                : "#0f1521",
              border: `1.5px solid ${isSelected ? color.node : "rgba(99,120,167,0.2)"}`,
              boxShadow: isSelected ? `0 0 0 3px ${color.node}33, 0 4px 20px rgba(0,0,0,0.4)` : "0 2px 8px rgba(0,0,0,0.3)",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: color.node, flexShrink: 0 }} />
              <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: color.node }}>
                {isMerge ? "Merge" : "Commit"}
              </span>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#8b9ec7", marginBottom: "4px" }}>
              {commit.hash.slice(0, 12)}
            </div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f5", lineHeight: "1.4" }}>
              {commit.message}
            </div>
            <div style={{ marginTop: "6px", fontSize: "11px", color: "#566380" }}>
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
    const lane = laneByHash.get(commit.hash) || 0;
    const color = getBranchColor(lane);

    if (primaryParent) {
      edges.push({
        id: `${commit.hash}-${primaryParent}`,
        source: commit.hash,
        target: primaryParent,
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed, color: color.edge },
        style: { stroke: color.edge, strokeWidth: 2, opacity: 0.7 },
      });
    }
    if (secondaryParent) {
      const mergeColor = getBranchColor(laneByHash.get(secondaryParent) || 2);
      edges.push({
        id: `${commit.hash}-${secondaryParent}`,
        source: commit.hash,
        target: secondaryParent,
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, color: mergeColor.edge },
        style: { stroke: mergeColor.edge, strokeWidth: 2, strokeDasharray: "6,3", opacity: 0.8 },
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
    <div className="animate-fade-in overflow-hidden rounded-xl" style={{ border: "1px solid var(--border-subtle)", background: "#090d17" }}>
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Commit Graph</span>
          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold" style={{ background: "rgba(99,102,241,0.15)", color: "var(--accent-indigo)" }}>
            {commits.length} commit{commits.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px]" style={{ color: "var(--text-muted)" }}>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: "var(--commit-main)" }} /> main
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: "var(--commit-feature)" }} /> feature
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: "var(--commit-merge)" }} /> merge
          </span>
        </div>
      </div>
      <div style={{ height: "660px" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          fitViewOptions={{ padding: 0.15, minZoom: 0.5, maxZoom: 1.5 }}
          minZoom={0.15}
          maxZoom={2}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          onNodeClick={(_, node) => onSelect(node.id)}
          style={{ background: "transparent" }}
        >
          <Background color="#1e2d45" gap={20} size={1} />
          <Controls
            showInteractive={false}
            style={{ background: "#0f1521", border: "1px solid rgba(99,120,167,0.2)" }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
