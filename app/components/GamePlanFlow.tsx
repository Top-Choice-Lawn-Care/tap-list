'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeTypes,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ─── Types ────────────────────────────────────────────────────────────────────

type PositionKey =
  | 'closed-guard'
  | 'half-guard'
  | 'side-control'
  | 'mount'
  | 'back-taken'
  | 'standing';

// ─── Custom Node Components ───────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StartingPosNode({ data }: { data: any }) {
  return (
    <div
      style={{
        background: '#1a1a2e',
        border: '2px solid #4a4a8a',
        borderRadius: '12px',
        width: '200px',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ visibility: 'hidden', width: 0, height: 0, minWidth: 0, minHeight: 0 }} />
      <span style={{ fontSize: '22px', lineHeight: 1 }}>{data.emoji}</span>
      <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700, lineHeight: 1.3 }}>{data.label}</span>
      <Handle type="source" position={Position.Right} style={{ visibility: 'hidden', width: 0, height: 0, minWidth: 0, minHeight: 0 }} />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SelectedNode({ data }: { data: any }) {
  return (
    <div
      style={{
        background: '#1e1e3f',
        border: '3px solid #ffffff',
        borderRadius: '12px',
        width: '200px',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        boxShadow: '0 0 20px rgba(255,255,255,0.3)',
        userSelect: 'none',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ visibility: 'hidden', width: 0, height: 0, minWidth: 0, minHeight: 0 }} />
      <span style={{ fontSize: '22px', lineHeight: 1 }}>{data.emoji}</span>
      <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700, lineHeight: 1.3 }}>{data.label}</span>
      <Handle type="source" position={Position.Right} style={{ visibility: 'hidden', width: 0, height: 0, minWidth: 0, minHeight: 0 }} />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function IntermediateNode({ data }: { data: any }) {
  return (
    <div
      style={{
        background: '#0f2d1a',
        border: '2px solid #22c55e',
        borderRadius: '10px',
        width: '170px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 600,
        textAlign: 'center',
        padding: '0 10px',
        boxSizing: 'border-box',
        lineHeight: '1.3',
        userSelect: 'none',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ visibility: 'hidden', width: 0, height: 0, minWidth: 0, minHeight: 0 }} />
      {data.label}
      <Handle type="source" position={Position.Right} style={{ visibility: 'hidden', width: 0, height: 0, minWidth: 0, minHeight: 0 }} />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SubmissionNode({ data }: { data: any }) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const query = encodeURIComponent(`bjj ${data.label} tutorial`);
      window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
    },
    [data.label]
  );
  return (
    <div
      onClick={handleClick}
      style={{
        background: '#2d0a0a',
        border: '2px solid #dc2626',
        borderRadius: '999px',
        width: '150px',
        height: '42px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '5px',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ visibility: 'hidden', width: 0, height: 0, minWidth: 0, minHeight: 0 }} />
      <span style={{ fontSize: '8px', lineHeight: 1 }}>🔴</span>
      <span style={{ color: '#fca5a5', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {data.label}
      </span>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TakedownNode({ data }: { data: any }) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const query = encodeURIComponent(`bjj ${data.label} tutorial`);
      window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
    },
    [data.label]
  );
  return (
    <div
      onClick={handleClick}
      style={{
        background: '#2d1458',
        border: '2px solid #9333ea',
        borderRadius: '999px',
        width: '150px',
        height: '42px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '5px',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ visibility: 'hidden', width: 0, height: 0, minWidth: 0, minHeight: 0 }} />
      <span style={{ fontSize: '8px', lineHeight: 1 }}>🟣</span>
      <span style={{ color: '#d8b4fe', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {data.label}
      </span>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  startingPos: StartingPosNode,
  selected: SelectedNode,
  intermediate: IntermediateNode,
  submission: SubmissionNode,
  takedown: TakedownNode,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COL0 = 0;
const COL1 = 300;
const COL2 = 610;
const COL3 = 920;

function nd(id: string, type: string, x: number, y: number, data: Record<string, unknown>): Node {
  return {
    id,
    type,
    position: { x, y },
    data,
    selectable: false,
    draggable: false,
    focusable: false,
  };
}

function ed(
  id: string,
  source: string,
  target: string,
  isSubmission: boolean,
  label?: string
): Edge {
  return {
    id,
    source,
    target,
    label: label ?? undefined,
    animated: !isSubmission,
    type: 'smoothstep',
    style: {
      stroke: isSubmission ? '#dc2626' : '#4a7cc7',
      strokeWidth: isSubmission ? 2 : 1.5,
    },
    labelStyle: { fill: '#e5e7eb', fontSize: 10, fontWeight: 600 },
    labelBgStyle: { fill: '#111', fillOpacity: 0.9 },
    labelBgPadding: [3, 5] as [number, number],
    labelBgBorderRadius: 3,
  };
}

// ─── Default View: 6 Starting Position Nodes ─────────────────────────────────
//  Layout: 3-col × 2-row grid, 200×70 cards, 60px gap

const DEFAULT_NODES: Node[] = [
  nd('closed-guard', 'startingPos', 0,   0,   { emoji: '🥋', label: 'Closed Guard' }),
  nd('half-guard',   'startingPos', 260, 0,   { emoji: '🤼', label: 'Half Guard'   }),
  nd('side-control', 'startingPos', 520, 0,   { emoji: '😬', label: 'Side Control' }),
  nd('mount',        'startingPos', 0,   150, { emoji: '😰', label: 'Mount'        }),
  nd('back-taken',   'startingPos', 260, 150, { emoji: '😱', label: 'Back Taken'   }),
  nd('standing',     'startingPos', 520, 150, { emoji: '🧍', label: 'Standing'     }),
];

// ─── Subgraph Definitions ─────────────────────────────────────────────────────

type Subgraph = { nodes: Node[]; edges: Edge[] };

const SUBGRAPHS: Record<PositionKey, Subgraph> = {

  // ── CLOSED GUARD ────────────────────────────────────────────────────────────
  // Root centered at y=212 (midpoint of 6 level-1 items at y=0..425, spacing=85)
  'closed-guard': {
    nodes: [
      nd('root',        'selected',     COL0, 212, { emoji: '🥋', label: 'Closed Guard' }),
      // Level 1
      nd('cg-tri',      'submission',   COL1, 0,   { label: 'Triangle Choke' }),
      nd('cg-arm',      'submission',   COL1, 85,  { label: 'Armbar' }),
      nd('cg-kim',      'submission',   COL1, 170, { label: 'Kimura' }),
      nd('cg-omo',      'submission',   COL1, 255, { label: 'Omoplata' }),
      nd('cg-mount',    'intermediate', COL1, 340, { label: 'Mount (top)' }),
      nd('cg-open',     'intermediate', COL1, 425, { label: 'Open Guard' }),
      // Level 2 — from Mount (top)
      nd('cg-2-arm',    'submission',   COL2, 255, { label: 'Armbar' }),
      nd('cg-2-ame',    'submission',   COL2, 340, { label: 'Americana' }),
      nd('cg-2-back',   'intermediate', COL2, 425, { label: 'Back Mount (top)' }),
      // Level 2 — from Open Guard (shares cg-2-back)
      nd('cg-2-tri',    'submission',   COL2, 510, { label: 'Triangle Choke' }),
    ],
    edges: [
      ed('e1',  'root',     'cg-tri',   true),
      ed('e2',  'root',     'cg-arm',   true),
      ed('e3',  'root',     'cg-kim',   true),
      ed('e4',  'root',     'cg-omo',   true),
      ed('e5',  'root',     'cg-mount', false, 'hip bump sweep'),
      ed('e6',  'root',     'cg-open',  false, 'open up'),
      ed('e7',  'cg-mount', 'cg-2-arm', true),
      ed('e8',  'cg-mount', 'cg-2-ame', true),
      ed('e9',  'cg-mount', 'cg-2-back',false, 'take back'),
      ed('e10', 'cg-open',  'cg-2-back',false, 'back take'),
      ed('e11', 'cg-open',  'cg-2-tri', true),
    ],
  },

  // ── HALF GUARD ──────────────────────────────────────────────────────────────
  // Root at y=85 (3 items at y=0,85,170)
  'half-guard': {
    nodes: [
      nd('root',        'selected',     COL0, 85,  { emoji: '🤼', label: 'Half Guard' }),
      // Level 1
      nd('hg-back',     'intermediate', COL1, 0,   { label: 'Back Mount (top)' }),
      nd('hg-kim',      'submission',   COL1, 85,  { label: 'Kimura' }),
      nd('hg-cg',       'intermediate', COL1, 170, { label: 'Closed Guard' }),
      // Level 2 — from Back Mount (top)
      nd('hg-2-rnc',    'submission',   COL2, 0,   { label: 'Rear Naked Choke' }),
      nd('hg-2-bow',    'submission',   COL2, 85,  { label: 'Bow & Arrow' }),
      // Level 2 — from Closed Guard
      nd('hg-2-tri',    'submission',   COL2, 170, { label: 'Triangle Choke' }),
      nd('hg-2-arm',    'submission',   COL2, 255, { label: 'Armbar' }),
      nd('hg-2-kim',    'submission',   COL2, 340, { label: 'Kimura' }),
    ],
    edges: [
      ed('e1',  'root',    'hg-back',   false, 'take back'),
      ed('e2',  'root',    'hg-kim',    true),
      ed('e3',  'root',    'hg-cg',     false, 'recover guard'),
      ed('e4',  'hg-back', 'hg-2-rnc',  true),
      ed('e5',  'hg-back', 'hg-2-bow',  true),
      ed('e6',  'hg-cg',   'hg-2-tri',  true),
      ed('e7',  'hg-cg',   'hg-2-arm',  true),
      ed('e8',  'hg-cg',   'hg-2-kim',  true),
    ],
  },

  // ── SIDE CONTROL (bottom, escaping) ─────────────────────────────────────────
  // Root at y=170 (3 items at y=0,170,340)
  'side-control': {
    nodes: [
      nd('root',         'selected',     COL0, 170, { emoji: '😬', label: 'Side Control' }),
      // Level 1
      nd('sc-cg',        'intermediate', COL1, 0,   { label: 'Closed Guard' }),
      nd('sc-hg',        'intermediate', COL1, 170, { label: 'Half Guard' }),
      nd('sc-turtle',    'intermediate', COL1, 340, { label: 'Turtle' }),
      // Level 2 — from Closed Guard
      nd('sc-2-tri',     'submission',   COL2, 0,   { label: 'Triangle Choke' }),
      nd('sc-2-arm',     'submission',   COL2, 85,  { label: 'Armbar' }),
      nd('sc-2-kim',     'submission',   COL2, 170, { label: 'Kimura' }),
      // Level 2 — from Half Guard
      nd('sc-2-back',    'intermediate', COL2, 255, { label: 'Back Mount (top)' }),
      nd('sc-2-kim2',    'submission',   COL2, 340, { label: 'Kimura' }),
      // Level 2 — from Turtle
      nd('sc-2-back2',   'intermediate', COL2, 425, { label: 'Back Mount (top)' }),
      nd('sc-2-cg',      'intermediate', COL2, 510, { label: 'Closed Guard' }),
    ],
    edges: [
      ed('e1',  'root',      'sc-cg',      false, 'shrimp out'),
      ed('e2',  'root',      'sc-hg',      false, 'underhook'),
      ed('e3',  'root',      'sc-turtle',  false, 'roll away'),
      ed('e4',  'sc-cg',     'sc-2-tri',   true),
      ed('e5',  'sc-cg',     'sc-2-arm',   true),
      ed('e6',  'sc-cg',     'sc-2-kim',   true),
      ed('e7',  'sc-hg',     'sc-2-back',  false, 'take back'),
      ed('e8',  'sc-hg',     'sc-2-kim2',  true),
      ed('e9',  'sc-turtle', 'sc-2-back2', false, 'granby roll'),
      ed('e10', 'sc-turtle', 'sc-2-cg',    false, 'sit out'),
    ],
  },

  // ── MOUNT (bottom, escaping) ─────────────────────────────────────────────────
  // Root at y=85 (2 items at y=0,170)
  'mount': {
    nodes: [
      nd('root',        'selected',     COL0, 85,  { emoji: '😰', label: 'Mount' }),
      // Level 1
      nd('mt-cg',       'intermediate', COL1, 0,   { label: 'Closed Guard' }),
      nd('mt-hg',       'intermediate', COL1, 170, { label: 'Half Guard' }),
      // Level 2 — from Closed Guard
      nd('mt-2-tri',    'submission',   COL2, 0,   { label: 'Triangle Choke' }),
      nd('mt-2-arm',    'submission',   COL2, 85,  { label: 'Armbar' }),
      nd('mt-2-kim',    'submission',   COL2, 170, { label: 'Kimura' }),
      // Level 2 — from Half Guard
      nd('mt-2-back',   'intermediate', COL2, 255, { label: 'Back Mount (top)' }),
      nd('mt-2-kim2',   'submission',   COL2, 340, { label: 'Kimura' }),
    ],
    edges: [
      ed('e1', 'root',  'mt-cg',      false, 'elbow-knee escape'),
      ed('e2', 'root',  'mt-hg',      false, 'trap and roll'),
      ed('e3', 'mt-cg', 'mt-2-tri',   true),
      ed('e4', 'mt-cg', 'mt-2-arm',   true),
      ed('e5', 'mt-cg', 'mt-2-kim',   true),
      ed('e6', 'mt-hg', 'mt-2-back',  false, 'take back'),
      ed('e7', 'mt-hg', 'mt-2-kim2',  true),
    ],
  },

  // ── BACK TAKEN (bottom, escaping) ────────────────────────────────────────────
  // Root at y=85 (2 items at y=0,170)
  'back-taken': {
    nodes: [
      nd('root',        'selected',     COL0, 85,  { emoji: '😱', label: 'Back Taken' }),
      // Level 1
      nd('bt-sc',       'intermediate', COL1, 0,   { label: 'Side Control (bottom)' }),
      nd('bt-turtle',   'intermediate', COL1, 170, { label: 'Turtle' }),
      // Level 2 — from Side Control
      nd('bt-2-cg',     'intermediate', COL2, 0,   { label: 'Closed Guard' }),
      nd('bt-2-hg',     'intermediate', COL2, 85,  { label: 'Half Guard' }),
      // Level 2 — from Turtle
      nd('bt-2-cg2',    'intermediate', COL2, 170, { label: 'Closed Guard' }),
      nd('bt-2-sc',     'intermediate', COL2, 255, { label: 'Side Control (bottom)' }),
    ],
    edges: [
      ed('e1', 'root',      'bt-sc',     false, 'escape to side'),
      ed('e2', 'root',      'bt-turtle', false, 'chin tuck + escape'),
      ed('e3', 'bt-sc',     'bt-2-cg',   false, 'shrimp out'),
      ed('e4', 'bt-sc',     'bt-2-hg',   false, 'underhook'),
      ed('e5', 'bt-turtle', 'bt-2-cg2',  false, 'sit out'),
      ed('e6', 'bt-turtle', 'bt-2-sc',   false, 'flatten out'),
    ],
  },

  // ── STANDING ────────────────────────────────────────────────────────────────
  // 4-column layout: COL0 root → COL1 level-1 → COL2 level-2 → COL3 level-3
  // Level-1 y range 0..750, root centred at 307
  'standing': {
    nodes: [
      nd('root',         'selected',     COL0, 307, { emoji: '🧍', label: 'Standing' }),
      // Level 1
      nd('st-dl',        'takedown',     COL1, 0,   { label: 'Double Leg' }),
      nd('st-sl',        'takedown',     COL1, 90,  { label: 'Single Leg' }),
      nd('st-ad',        'intermediate', COL1, 210, { label: 'Arm Drag' }),
      nd('st-guil',      'submission',   COL1, 330, { label: 'Guillotine' }),
      nd('st-cg',        'intermediate', COL1, 460, { label: 'Closed Guard' }),
      nd('st-sc',        'intermediate', COL1, 750, { label: 'Side Control (top)' }),
      // Level 2 — from Arm Drag
      nd('st-back',      'intermediate', COL2, 160, { label: 'Back Mount (top)' }),
      // Level 2 — from Closed Guard
      nd('st-2-tri',     'submission',   COL2, 410, { label: 'Triangle Choke' }),
      nd('st-2-arm',     'submission',   COL2, 500, { label: 'Armbar' }),
      nd('st-2-kim',     'submission',   COL2, 590, { label: 'Kimura' }),
      // Level 2 — from Side Control (top)
      nd('st-2-mount',   'intermediate', COL2, 700, { label: 'Mount (top)' }),
      nd('st-2-ame',     'submission',   COL2, 790, { label: 'Americana' }),
      nd('st-2-darce',   'submission',   COL2, 880, { label: "D'Arce Choke" }),
      // Level 3 — from Back Mount (top)
      nd('st-3-rnc',     'submission',   COL3, 115, { label: 'Rear Naked Choke' }),
      nd('st-3-bow',     'submission',   COL3, 205, { label: 'Bow & Arrow' }),
    ],
    edges: [
      ed('e1',  'root',    'st-dl',      false, 'level change'),
      ed('e2',  'root',    'st-sl',      false, 'level change'),
      ed('e3',  'root',    'st-ad',      false, 'arm drag'),
      ed('e4',  'root',    'st-guil',    true,  'snap down + underhook'),
      ed('e5',  'root',    'st-cg',      false, 'guard pull'),
      ed('e6',  'root',    'st-sc',      false, 'takedown lands'),
      ed('e7',  'st-ad',   'st-back',    false, 'arm drag'),
      ed('e8',  'st-back', 'st-3-rnc',   true),
      ed('e9',  'st-back', 'st-3-bow',   true),
      ed('e10', 'st-cg',   'st-2-tri',   true),
      ed('e11', 'st-cg',   'st-2-arm',   true),
      ed('e12', 'st-cg',   'st-2-kim',   true),
      ed('e13', 'st-sc',   'st-2-mount', false, 'advance'),
      ed('e14', 'st-sc',   'st-2-ame',   true),
      ed('e15', 'st-sc',   'st-2-darce', true),
    ],
  },
};

// ─── Position labels for header ───────────────────────────────────────────────

const POSITION_LABEL: Record<PositionKey, { emoji: string; label: string }> = {
  'closed-guard': { emoji: '🥋', label: 'Closed Guard' },
  'half-guard':   { emoji: '🤼', label: 'Half Guard'   },
  'side-control': { emoji: '😬', label: 'Side Control' },
  'mount':        { emoji: '😰', label: 'Mount'        },
  'back-taken':   { emoji: '😱', label: 'Back Taken'   },
  'standing':     { emoji: '🧍', label: 'Standing'     },
};

// ─── Inner Component ──────────────────────────────────────────────────────────

function GamePlanFlowInner() {
  const { fitView } = useReactFlow();
  const [nodes, setNodes] = useNodesState<Node>(DEFAULT_NODES);
  const [edges, setEdges] = useEdgesState<Edge>([]);
  const [selectedPosition, setSelectedPosition] = useState<PositionKey | null>(null);

  // Switch view and animate
  const applyView = useCallback(
    (pos: PositionKey | null) => {
      if (pos === null) {
        setNodes(DEFAULT_NODES);
        setEdges([]);
      } else {
        const { nodes: sNodes, edges: sEdges } = SUBGRAPHS[pos];
        setNodes(sNodes);
        setEdges(sEdges);
      }
      setSelectedPosition(pos);
      setTimeout(() => {
        fitView({ padding: 0.22, duration: 400 });
      }, 60);
    },
    [fitView, setNodes, setEdges]
  );

  // Initial fit
  useEffect(() => {
    setTimeout(() => {
      fitView({ padding: 0.18, duration: 300 });
    }, 100);
  }, [fitView]);

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      if (node.type === 'startingPos' && selectedPosition === null) {
        applyView(node.id as PositionKey);
      }
      // submission clicks are handled inside SubmissionNode itself
    },
    [selectedPosition, applyView]
  );

  const meta = selectedPosition ? POSITION_LABEL[selectedPosition] : null;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        minZoom={0.1}
        maxZoom={3}
        style={{ backgroundColor: '#080808' }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} color="#1a1a1a" gap={20} size={1.5} />

        {/* ── Header ── */}
        <Panel position="top-center">
          <div
            style={{
              textAlign: 'center',
              padding: '10px 20px',
              background: 'rgba(10,10,18,0.88)',
              border: '1px solid #2a2a4a',
              borderRadius: '10px',
              backdropFilter: 'blur(6px)',
              minWidth: '260px',
            }}
          >
            {!selectedPosition ? (
              <>
                <div style={{ color: '#ffffff', fontSize: '18px', fontWeight: 800, letterSpacing: '0.06em' }}>
                  🥋 WHERE ARE YOU?
                </div>
                <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '3px' }}>
                  tap a position to see your options
                </div>
              </>
            ) : (
              <>
                <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: 700 }}>
                  {meta!.emoji} {meta!.label}
                </div>
                <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '3px' }}>
                  tap a move to search YouTube
                </div>
              </>
            )}
          </div>
        </Panel>

        {/* ── Back Button ── */}
        {selectedPosition && (
          <Panel position="top-left">
            <button
              onClick={() => applyView(null)}
              style={{
                background: 'rgba(10,10,18,0.88)',
                color: '#ffffff',
                border: '1px solid #444',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              ← Back
            </button>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function GamePlanFlow() {
  return (
    <ReactFlowProvider>
      <GamePlanFlowInner />
    </ReactFlowProvider>
  );
}
