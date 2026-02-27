'use client';

import React, { useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';

// ─── Custom Node Components ──────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PositionNode({ data }: { data: any }) {
  return (
    <div
      style={{
        background: '#1e3a5f',
        color: '#fff',
        border: '2px solid #2563eb',
        borderRadius: '8px',
        padding: '8px 10px',
        fontSize: '11px',
        fontWeight: 700,
        textAlign: 'center',
        width: '180px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: '1.3',
        boxSizing: 'border-box',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ opacity: 0, width: 0, height: 0, minWidth: 0, minHeight: 0 }}
      />
      {data.label}
      <Handle
        type="source"
        position={Position.Right}
        style={{ opacity: 0, width: 0, height: 0, minWidth: 0, minHeight: 0 }}
      />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SubmissionNode({ data }: { data: any }) {
  return (
    <div
      style={{
        background: '#6b1a1a',
        color: '#fff',
        border: '2px solid #dc2626',
        borderRadius: '6px',
        padding: '6px 8px',
        fontSize: '10px',
        fontWeight: 700,
        textAlign: 'center',
        width: '150px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: '1.3',
        boxSizing: 'border-box',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ opacity: 0, width: 0, height: 0, minWidth: 0, minHeight: 0 }}
      />
      {data.label}
      <Handle
        type="source"
        position={Position.Right}
        style={{ opacity: 0, width: 0, height: 0, minWidth: 0, minHeight: 0 }}
      />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  position: PositionNode,
  submission: SubmissionNode,
};

// ─── Submission IDs ───────────────────────────────────────────────────────────

const SUBMISSION_IDS = new Set([
  'triangle-choke',
  'armbar',
  'kimura',
  'americana',
  'rear-naked-choke',
  'guillotine',
  'darce-choke',
  'omoplata',
  'bow-arrow',
  'ankle-lock',
  'heel-hook',
]);

// ─── Node Definitions (positions computed by dagre) ───────────────────────────

const RAW_NODES: Node[] = [
  // Position nodes
  { id: 'standing', type: 'position', position: { x: 0, y: 0 }, data: { label: 'Standing' } },
  { id: 'closed-guard-bottom', type: 'position', position: { x: 0, y: 0 }, data: { label: 'Closed Guard (bottom)' } },
  { id: 'open-guard-bottom', type: 'position', position: { x: 0, y: 0 }, data: { label: 'Open Guard (bottom)' } },
  { id: 'half-guard-bottom', type: 'position', position: { x: 0, y: 0 }, data: { label: 'Half Guard (bottom)' } },
  { id: 'side-control-bottom', type: 'position', position: { x: 0, y: 0 }, data: { label: 'Side Control (bottom)' } },
  { id: 'mount-bottom', type: 'position', position: { x: 0, y: 0 }, data: { label: 'Mount (bottom)' } },
  { id: 'back-bottom', type: 'position', position: { x: 0, y: 0 }, data: { label: 'Back (bottom)' } },
  { id: 'side-control-top', type: 'position', position: { x: 0, y: 0 }, data: { label: 'Side Control (top)' } },
  { id: 'mount-top', type: 'position', position: { x: 0, y: 0 }, data: { label: 'Mount (top)' } },
  { id: 'back-mount-top', type: 'position', position: { x: 0, y: 0 }, data: { label: 'Back Mount (top)' } },
  { id: 'turtle', type: 'position', position: { x: 0, y: 0 }, data: { label: 'Turtle' } },
  // Submission nodes
  { id: 'triangle-choke', type: 'submission', position: { x: 0, y: 0 }, data: { label: 'Triangle Choke' } },
  { id: 'armbar', type: 'submission', position: { x: 0, y: 0 }, data: { label: 'Armbar' } },
  { id: 'kimura', type: 'submission', position: { x: 0, y: 0 }, data: { label: 'Kimura' } },
  { id: 'americana', type: 'submission', position: { x: 0, y: 0 }, data: { label: 'Americana' } },
  { id: 'rear-naked-choke', type: 'submission', position: { x: 0, y: 0 }, data: { label: 'Rear Naked Choke' } },
  { id: 'guillotine', type: 'submission', position: { x: 0, y: 0 }, data: { label: 'Guillotine' } },
  { id: 'darce-choke', type: 'submission', position: { x: 0, y: 0 }, data: { label: "D'Arce Choke" } },
  { id: 'omoplata', type: 'submission', position: { x: 0, y: 0 }, data: { label: 'Omoplata' } },
  { id: 'bow-arrow', type: 'submission', position: { x: 0, y: 0 }, data: { label: 'Bow & Arrow' } },
  { id: 'ankle-lock', type: 'submission', position: { x: 0, y: 0 }, data: { label: 'Ankle Lock' } },
  { id: 'heel-hook', type: 'submission', position: { x: 0, y: 0 }, data: { label: 'Heel Hook' } },
];

// ─── Edge Definitions ─────────────────────────────────────────────────────────

type RawEdge = { id: string; source: string; target: string; label?: string };

const EDGE_DEFS: RawEdge[] = [
  // Standing
  { id: 'e1', source: 'standing', target: 'closed-guard-bottom', label: 'guard pull' },
  { id: 'e2', source: 'standing', target: 'guillotine', label: 'snap down' },
  { id: 'e3', source: 'standing', target: 'side-control-top', label: 'takedown' },
  // Closed Guard (bottom)
  { id: 'e4', source: 'closed-guard-bottom', target: 'triangle-choke' },
  { id: 'e5', source: 'closed-guard-bottom', target: 'armbar' },
  { id: 'e6', source: 'closed-guard-bottom', target: 'kimura' },
  { id: 'e7', source: 'closed-guard-bottom', target: 'omoplata' },
  { id: 'e8', source: 'closed-guard-bottom', target: 'mount-top', label: 'hip bump sweep' },
  { id: 'e9', source: 'closed-guard-bottom', target: 'open-guard-bottom', label: 'open guard' },
  // Open Guard (bottom)
  { id: 'e10', source: 'open-guard-bottom', target: 'back-mount-top', label: 'back take' },
  { id: 'e11', source: 'open-guard-bottom', target: 'triangle-choke' },
  { id: 'e12', source: 'open-guard-bottom', target: 'omoplata' },
  { id: 'e13', source: 'open-guard-bottom', target: 'closed-guard-bottom' },
  // Half Guard (bottom)
  { id: 'e14', source: 'half-guard-bottom', target: 'back-mount-top', label: 'take back' },
  { id: 'e15', source: 'half-guard-bottom', target: 'kimura' },
  { id: 'e16', source: 'half-guard-bottom', target: 'closed-guard-bottom', label: 'recover guard' },
  // Side Control (bottom)
  { id: 'e17', source: 'side-control-bottom', target: 'closed-guard-bottom', label: 'shrimp out' },
  { id: 'e18', source: 'side-control-bottom', target: 'half-guard-bottom', label: 'half guard' },
  { id: 'e19', source: 'side-control-bottom', target: 'turtle', label: 'roll to turtle' },
  // Mount (bottom)
  { id: 'e20', source: 'mount-bottom', target: 'closed-guard-bottom', label: 'elbow-knee escape' },
  { id: 'e21', source: 'mount-bottom', target: 'half-guard-bottom', label: 'half guard escape' },
  // Back (bottom)
  { id: 'e22', source: 'back-bottom', target: 'side-control-bottom', label: 'escape to side' },
  { id: 'e23', source: 'back-bottom', target: 'turtle', label: 'turtle' },
  // Side Control (top)
  { id: 'e24', source: 'side-control-top', target: 'mount-top', label: 'advance' },
  { id: 'e25', source: 'side-control-top', target: 'back-mount-top', label: 'take back' },
  { id: 'e26', source: 'side-control-top', target: 'americana' },
  { id: 'e27', source: 'side-control-top', target: 'kimura' },
  { id: 'e28', source: 'side-control-top', target: 'darce-choke' },
  // Mount (top)
  { id: 'e29', source: 'mount-top', target: 'armbar' },
  { id: 'e30', source: 'mount-top', target: 'americana' },
  { id: 'e31', source: 'mount-top', target: 'kimura' },
  { id: 'e32', source: 'mount-top', target: 'back-mount-top', label: 'take back' },
  // Back Mount (top)
  { id: 'e33', source: 'back-mount-top', target: 'rear-naked-choke' },
  { id: 'e34', source: 'back-mount-top', target: 'bow-arrow' },
  { id: 'e35', source: 'back-mount-top', target: 'armbar' },
  // Turtle
  { id: 'e36', source: 'turtle', target: 'back-mount-top', label: 'take back' },
  { id: 'e37', source: 'turtle', target: 'darce-choke' },
];

// ─── Build Edges ─────────────────────────────────────────────────────────────

function buildEdges(defs: RawEdge[]): Edge[] {
  return defs.map(({ id, source, target, label }) => {
    const isSubmission = SUBMISSION_IDS.has(target);
    return {
      id,
      source,
      target,
      label: label ?? undefined,
      animated: !isSubmission,
      style: isSubmission
        ? { stroke: '#dc2626', strokeWidth: 2 }
        : { stroke: '#4a7cc7', strokeWidth: 1.5 },
      labelStyle: { fill: '#9ca3af', fontSize: 9, fontWeight: 600 },
      labelBgStyle: { fill: '#0d1117', fillOpacity: 0.9 },
      labelBgPadding: [3, 4] as [number, number],
      type: 'smoothstep',
    };
  });
}

// ─── Dagre Layout ─────────────────────────────────────────────────────────────

function applyDagreLayout(nodes: Node[], edges: Edge[]) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 90, marginx: 40, marginy: 40 });

  nodes.forEach((node) => {
    const w = node.type === 'submission' ? 150 : 180;
    const h = node.type === 'submission' ? 50 : 60;
    g.setNode(node.id, { width: w, height: h });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    const w = node.type === 'submission' ? 150 : 180;
    const h = node.type === 'submission' ? 50 : 60;
    return {
      ...node,
      position: { x: pos.x - w / 2, y: pos.y - h / 2 },
    };
  });
}

// Compute layout once at module level (client-side only)
const INITIAL_EDGES = buildEdges(EDGE_DEFS);
const INITIAL_NODES = applyDagreLayout(RAW_NODES, INITIAL_EDGES);

// ─── Inner Component (needs ReactFlowProvider context) ────────────────────────

function GamePlanFlowInner() {
  const { fitView } = useReactFlow();
  const [nodes, , onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, , onEdgesChange] = useEdgesState(INITIAL_EDGES);

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.15, duration: 400 });
  }, [fitView]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.12 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        minZoom={0.05}
        maxZoom={2.5}
        style={{ backgroundColor: '#0a0a0a' }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1a1a1a" gap={24} size={1} />

        {/* Fit View button */}
        <Panel position="top-right">
          <button
            onClick={handleFitView}
            style={{
              backgroundColor: '#1a1a1a',
              color: '#d1d5db',
              border: '1px solid #374151',
              borderRadius: '6px',
              padding: '7px 12px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            ⊙ Fit View
          </button>
        </Panel>

        {/* Legend */}
        <Panel position="bottom-left">
          <div
            style={{
              backgroundColor: '#111',
              border: '1px solid #2a2a2a',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '11px',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: 24, height: 10, background: '#1e3a5f', border: '1.5px solid #2563eb', borderRadius: 3 }} />
              <span style={{ color: '#9ca3af' }}>Position</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: 24, height: 10, background: '#6b1a1a', border: '1.5px solid #dc2626', borderRadius: 3 }} />
              <span style={{ color: '#9ca3af' }}>Submission</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: 24, height: 2, background: '#4a7cc7', borderTop: '2px dashed #4a7cc7' }} />
              <span style={{ color: '#9ca3af' }}>Transition</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: 24, height: 2, background: '#dc2626' }} />
              <span style={{ color: '#9ca3af' }}>Submission edge</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

// ─── Export (wrapped in provider) ─────────────────────────────────────────────

export default function GamePlanFlow() {
  return (
    <ReactFlowProvider>
      <GamePlanFlowInner />
    </ReactFlowProvider>
  );
}
