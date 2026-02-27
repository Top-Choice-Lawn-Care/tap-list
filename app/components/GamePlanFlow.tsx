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
  | 'standing'
  | 'mount-top'
  | 'side-control-top'
  | 'back-mount-top';

// ─── Starting Positions Array (for default grid view) ────────────────────────

const DEFENDING_POSITIONS: { id: PositionKey; emoji: string; label: string }[] = [
  { id: 'closed-guard', emoji: '🥋', label: 'Closed Guard' },
  { id: 'half-guard',   emoji: '½',  label: 'Half Guard'   },
  { id: 'side-control', emoji: '😬', label: 'Side Control' },
  { id: 'mount',        emoji: '😰', label: 'Mount'        },
  { id: 'back-taken',   emoji: '😱', label: 'Back Taken'   },
  { id: 'standing',     emoji: '🤼', label: 'Standing'     },
];

const ATTACKING_POSITIONS: { id: PositionKey; emoji: string; label: string }[] = [
  { id: 'mount-top',        emoji: '💪', label: 'Mount (top)'        },
  { id: 'side-control-top', emoji: '🤛', label: 'Side Control (top)' },
  { id: 'back-mount-top',   emoji: '🎯', label: 'Back Mount (top)'   },
];

const STARTING_POSITIONS = [...DEFENDING_POSITIONS, ...ATTACKING_POSITIONS];

// ─── Custom Node Components ───────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StartingPosNode({ data }: { data: any }) {
  return (
    <div
      style={{
        background: '#16162a',
        border: '1px solid rgba(124,58,237,0.35)',
        borderRadius: '12px',
        width: '200px',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        cursor: 'pointer',
        userSelect: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ visibility: 'hidden', width: 0, height: 0, minWidth: 0, minHeight: 0 }} />
      <span style={{ fontSize: '22px', lineHeight: 1 }}>{data.emoji}</span>
      <span style={{ color: '#e8e8ea', fontSize: '13px', fontWeight: 600, lineHeight: 1.3 }}>{data.label}</span>
      <Handle type="source" position={Position.Right} style={{ visibility: 'hidden', width: 0, height: 0, minWidth: 0, minHeight: 0 }} />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SelectedNode({ data }: { data: any }) {
  return (
    <div
      style={{
        background: '#1e1e34',
        border: '2px solid #7c3aed',
        borderRadius: '12px',
        width: '200px',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        boxShadow: '0 0 16px rgba(124,58,237,0.30), 0 2px 12px rgba(0,0,0,0.5)',
        userSelect: 'none',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ visibility: 'hidden', width: 0, height: 0, minWidth: 0, minHeight: 0 }} />
      <span style={{ fontSize: '22px', lineHeight: 1 }}>{data.emoji}</span>
      <span style={{ color: '#e8e8ea', fontSize: '13px', fontWeight: 700, lineHeight: 1.3 }}>{data.label}</span>
      <Handle type="source" position={Position.Right} style={{ visibility: 'hidden', width: 0, height: 0, minWidth: 0, minHeight: 0 }} />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function IntermediateNode({ data }: { data: any }) {
  return (
    <div
      style={{
        background: '#0e2418',
        border: '1px solid rgba(22,163,74,0.50)',
        borderRadius: '10px',
        width: '170px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#86efac',
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
        background: '#210808',
        border: '1px solid rgba(220,38,38,0.55)',
        borderRadius: '999px',
        width: '152px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '5px',
        cursor: 'pointer',
        userSelect: 'none',
        boxShadow: '0 0 8px rgba(220,38,38,0.18)',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ visibility: 'hidden', width: 0, height: 0, minWidth: 0, minHeight: 0 }} />
      <span style={{ color: '#fca5a5', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', padding: '0 8px' }}>
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
        background: '#180e30',
        border: '1px solid rgba(124,58,237,0.55)',
        borderRadius: '999px',
        width: '152px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '5px',
        cursor: 'pointer',
        userSelect: 'none',
        boxShadow: '0 0 8px rgba(124,58,237,0.18)',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ visibility: 'hidden', width: 0, height: 0, minWidth: 0, minHeight: 0 }} />
      <span style={{ color: '#c4b5fd', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', padding: '0 8px' }}>
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
      stroke: isSubmission ? '#dc2626' : '#5b4a8a',
      strokeWidth: isSubmission ? 2 : 1.5,
    },
    labelStyle: { fill: '#e5e7eb', fontSize: 10, fontWeight: 600 },
    labelBgStyle: { fill: '#111', fillOpacity: 0.9 },
    labelBgPadding: [3, 5] as [number, number],
    labelBgBorderRadius: 3,
  };
}

// ─── Subgraph Definitions ─────────────────────────────────────────────────────

type Subgraph = { nodes: Node[]; edges: Edge[] };

const SUBGRAPHS: Record<PositionKey, Subgraph> = {

  // ── CLOSED GUARD ────────────────────────────────────────────────────────────
  'closed-guard': {
    nodes: [
      nd('root',        'selected',     COL0, 212, { emoji: '🥋', label: 'Closed Guard' }),
      nd('cg-tri',      'submission',   COL1, 0,   { label: 'Triangle Choke' }),
      nd('cg-arm',      'submission',   COL1, 85,  { label: 'Armbar' }),
      nd('cg-kim',      'submission',   COL1, 170, { label: 'Kimura' }),
      nd('cg-omo',      'submission',   COL1, 255, { label: 'Omoplata' }),
      nd('cg-mount',    'intermediate', COL1, 340, { label: 'Mount (top)' }),
      nd('cg-open',     'intermediate', COL1, 425, { label: 'Open Guard' }),
      nd('cg-2-arm',    'submission',   COL2, 255, { label: 'Armbar' }),
      nd('cg-2-ame',    'submission',   COL2, 340, { label: 'Americana' }),
      nd('cg-2-back',   'intermediate', COL2, 425, { label: 'Back Mount (top)' }),
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
  'half-guard': {
    nodes: [
      nd('root',        'selected',     COL0, 85,  { emoji: '½', label: 'Half Guard' }),
      nd('hg-back',     'intermediate', COL1, 0,   { label: 'Back Mount (top)' }),
      nd('hg-kim',      'submission',   COL1, 85,  { label: 'Kimura' }),
      nd('hg-cg',       'intermediate', COL1, 170, { label: 'Closed Guard' }),
      nd('hg-2-rnc',    'submission',   COL2, 0,   { label: 'Rear Naked Choke' }),
      nd('hg-2-bow',    'submission',   COL2, 85,  { label: 'Bow & Arrow' }),
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

  // ── SIDE CONTROL ─────────────────────────────────────────────────────────────
  'side-control': {
    nodes: [
      nd('root',         'selected',     COL0, 170, { emoji: '😬', label: 'Side Control' }),
      nd('sc-cg',        'intermediate', COL1, 0,   { label: 'Closed Guard' }),
      nd('sc-hg',        'intermediate', COL1, 170, { label: 'Half Guard' }),
      nd('sc-turtle',    'intermediate', COL1, 340, { label: 'Turtle' }),
      nd('sc-2-tri',     'submission',   COL2, 0,   { label: 'Triangle Choke' }),
      nd('sc-2-arm',     'submission',   COL2, 85,  { label: 'Armbar' }),
      nd('sc-2-kim',     'submission',   COL2, 170, { label: 'Kimura' }),
      nd('sc-2-back',    'intermediate', COL2, 255, { label: 'Back Mount (top)' }),
      nd('sc-2-kim2',    'submission',   COL2, 340, { label: 'Kimura' }),
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

  // ── MOUNT ─────────────────────────────────────────────────────────────────────
  'mount': {
    nodes: [
      nd('root',        'selected',     COL0, 85,  { emoji: '😰', label: 'Mount' }),
      nd('mt-cg',       'intermediate', COL1, 0,   { label: 'Closed Guard' }),
      nd('mt-hg',       'intermediate', COL1, 170, { label: 'Half Guard' }),
      nd('mt-2-tri',    'submission',   COL2, 0,   { label: 'Triangle Choke' }),
      nd('mt-2-arm',    'submission',   COL2, 85,  { label: 'Armbar' }),
      nd('mt-2-kim',    'submission',   COL2, 170, { label: 'Kimura' }),
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

  // ── BACK TAKEN ────────────────────────────────────────────────────────────────
  'back-taken': {
    nodes: [
      nd('root',        'selected',     COL0, 85,  { emoji: '😱', label: 'Back Taken' }),
      nd('bt-sc',       'intermediate', COL1, 0,   { label: 'Side Control (bottom)' }),
      nd('bt-turtle',   'intermediate', COL1, 170, { label: 'Turtle' }),
      nd('bt-2-cg',     'intermediate', COL2, 0,   { label: 'Closed Guard' }),
      nd('bt-2-hg',     'intermediate', COL2, 85,  { label: 'Half Guard' }),
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
  'standing': {
    nodes: [
      nd('root',         'selected',     COL0, 307, { emoji: '🤼', label: 'Standing' }),
      nd('st-dl',        'takedown',     COL1, 0,   { label: 'Double Leg' }),
      nd('st-sl',        'takedown',     COL1, 90,  { label: 'Single Leg' }),
      nd('st-ad',        'intermediate', COL1, 210, { label: 'Arm Drag' }),
      nd('st-guil',      'submission',   COL1, 330, { label: 'Guillotine' }),
      nd('st-cg',        'intermediate', COL1, 460, { label: 'Closed Guard' }),
      nd('st-sc',        'intermediate', COL1, 750, { label: 'Side Control (top)' }),
      nd('st-back',      'intermediate', COL2, 160, { label: 'Back Mount (top)' }),
      nd('st-2-tri',     'submission',   COL2, 410, { label: 'Triangle Choke' }),
      nd('st-2-arm',     'submission',   COL2, 500, { label: 'Armbar' }),
      nd('st-2-kim',     'submission',   COL2, 590, { label: 'Kimura' }),
      nd('st-2-mount',   'intermediate', COL2, 700, { label: 'Mount (top)' }),
      nd('st-2-ame',     'submission',   COL2, 790, { label: 'Americana' }),
      nd('st-2-darce',   'submission',   COL2, 880, { label: "D'Arce Choke" }),
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

  // ── MOUNT (top) ───────────────────────────────────────────────────────────────
  'mount-top': {
    nodes: [
      nd('root',        'selected',     COL0, 167, { emoji: '💪', label: 'Mount (top)' }),
      nd('mt-arm',      'submission',   COL1, 0,   { label: 'Armbar' }),
      nd('mt-ame',      'submission',   COL1, 90,  { label: 'Americana' }),
      nd('mt-ezek',     'submission',   COL1, 180, { label: 'Ezekiel Choke' }),
      nd('mt-smount',   'intermediate', COL1, 270, { label: 'S-Mount' }),
      nd('mt-backmnt',  'intermediate', COL1, 360, { label: 'Back Mount (top)' }),
      nd('mt-2-arm',    'submission',   COL2, 270, { label: 'Armbar' }),
      nd('mt-2-rnc',    'submission',   COL2, 360, { label: 'Rear Naked Choke' }),
      nd('mt-2-bow',    'submission',   COL2, 450, { label: 'Bow & Arrow' }),
    ],
    edges: [
      ed('e1', 'root',       'mt-arm',    true),
      ed('e2', 'root',       'mt-ame',    true),
      ed('e3', 'root',       'mt-ezek',   true),
      ed('e4', 'root',       'mt-smount', false, 's-mount'),
      ed('e5', 'root',       'mt-backmnt',false, 'take back'),
      ed('e6', 'mt-smount',  'mt-2-arm',  true),
      ed('e7', 'mt-backmnt', 'mt-2-rnc',  true),
      ed('e8', 'mt-backmnt', 'mt-2-bow',  true),
    ],
  },

  // ── SIDE CONTROL (top) ────────────────────────────────────────────────────────
  'side-control-top': {
    nodes: [
      nd('root',         'selected',     COL0, 302, { emoji: '🤛', label: 'Side Control (top)' }),
      nd('sc-ame',       'submission',   COL1, 0,   { label: 'Americana' }),
      nd('sc-kim',       'submission',   COL1, 90,  { label: 'Kimura' }),
      nd('sc-darce',     'submission',   COL1, 180, { label: "D'Arce Choke" }),
      nd('sc-nsc',       'submission',   COL1, 270, { label: 'North-South Choke' }),
      nd('sc-mount',     'intermediate', COL1, 360, { label: 'Mount (top)' }),
      nd('sc-backmnt',   'intermediate', COL1, 450, { label: 'Back Mount (top)' }),
      nd('sc-2-arm',     'submission',   COL2, 360, { label: 'Armbar' }),
      nd('sc-2-ame',     'submission',   COL2, 450, { label: 'Americana' }),
      nd('sc-2-rnc',     'submission',   COL2, 540, { label: 'Rear Naked Choke' }),
      nd('sc-2-bow',     'submission',   COL2, 630, { label: 'Bow & Arrow' }),
    ],
    edges: [
      ed('e1',  'root',       'sc-ame',    true),
      ed('e2',  'root',       'sc-kim',    true),
      ed('e3',  'root',       'sc-darce',  true),
      ed('e4',  'root',       'sc-nsc',    true),
      ed('e5',  'root',       'sc-mount',  false, 'advance'),
      ed('e6',  'root',       'sc-backmnt',false, 'take back'),
      ed('e7',  'sc-mount',   'sc-2-arm',  true),
      ed('e8',  'sc-mount',   'sc-2-ame',  true),
      ed('e9',  'sc-backmnt', 'sc-2-rnc',  true),
      ed('e10', 'sc-backmnt', 'sc-2-bow',  true),
    ],
  },

  // ── BACK MOUNT (top) ──────────────────────────────────────────────────────────
  'back-mount-top': {
    nodes: [
      nd('root',        'selected',     COL0, 212, { emoji: '🎯', label: 'Back Mount (top)' }),
      nd('bm-rnc',      'submission',   COL1, 0,   { label: 'Rear Naked Choke' }),
      nd('bm-bow',      'submission',   COL1, 90,  { label: 'Bow & Arrow' }),
      nd('bm-arm',      'submission',   COL1, 180, { label: 'Armbar' }),
      nd('bm-collar',   'submission',   COL1, 270, { label: 'Collar Choke' }),
      nd('bm-mount',    'intermediate', COL1, 360, { label: 'Mount (top)' }),
      nd('bm-2-arm',    'submission',   COL2, 360, { label: 'Armbar' }),
      nd('bm-2-ame',    'submission',   COL2, 450, { label: 'Americana' }),
    ],
    edges: [
      ed('e1', 'root',     'bm-rnc',   true),
      ed('e2', 'root',     'bm-bow',   true),
      ed('e3', 'root',     'bm-arm',   true),
      ed('e4', 'root',     'bm-collar',true),
      ed('e5', 'root',     'bm-mount', false, 'they escape'),
      ed('e6', 'bm-mount', 'bm-2-arm', true),
      ed('e7', 'bm-mount', 'bm-2-ame', true),
    ],
  },
};

// ─── Position labels for header ───────────────────────────────────────────────

const POSITION_LABEL: Record<PositionKey, { emoji: string; label: string }> = {
  'closed-guard':     { emoji: '🥋', label: 'Closed Guard'        },
  'half-guard':       { emoji: '½',  label: 'Half Guard'          },
  'side-control':     { emoji: '😬', label: 'Side Control'        },
  'mount':            { emoji: '😰', label: 'Mount'               },
  'back-taken':       { emoji: '😱', label: 'Back Taken'          },
  'standing':         { emoji: '🤼', label: 'Standing'            },
  'mount-top':        { emoji: '💪', label: 'Mount (top)'         },
  'side-control-top': { emoji: '🤛', label: 'Side Control (top)'  },
  'back-mount-top':   { emoji: '🎯', label: 'Back Mount (top)'    },
};

// ─── Default View: Plain CSS Grid ────────────────────────────────────────────

function DefaultView({ onSelect }: { onSelect: (pos: PositionKey) => void }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px', paddingTop: '8px' }}>
        <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
          Where are you?
        </div>
        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
          Tap a position to see your options
        </div>
      </div>

      {/* DEFENDING section */}
      <div style={{ marginBottom: '4px' }}>
        <div
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase' as const,
            color: '#6b7280',
            marginBottom: '10px',
            paddingLeft: '2px',
          }}
        >
          Defending 🛡️
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
          }}
        >
          {DEFENDING_POSITIONS.map((pos) => (
            <button
              key={pos.id}
              onClick={() => onSelect(pos.id)}
              style={{
                backgroundColor: '#13131a',
                border: '1.5px solid #2a2a3a',
                borderRadius: '14px',
                padding: '20px 16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                fontFamily: 'inherit',
                transition: 'all 0.15s ease',
                WebkitTapHighlightColor: 'transparent',
                minHeight: '100px',
              }}
            >
              <span style={{ fontSize: '32px', lineHeight: 1 }}>{pos.emoji}</span>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#e8e8ea',
                  textAlign: 'center',
                  lineHeight: 1.3,
                }}
              >
                {pos.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: '#1e1e2e', margin: '16px 0 12px' }} />

      {/* ATTACKING section */}
      <div>
        <div
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase' as const,
            color: '#6b7280',
            marginBottom: '10px',
            paddingLeft: '2px',
          }}
        >
          Attacking ⚔️
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
          }}
        >
          {ATTACKING_POSITIONS.map((pos) => (
            <button
              key={pos.id}
              onClick={() => onSelect(pos.id)}
              style={{
                backgroundColor: '#0d1f12',
                border: '1.5px solid #1a3a22',
                borderRadius: '14px',
                padding: '20px 16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                fontFamily: 'inherit',
                transition: 'all 0.15s ease',
                WebkitTapHighlightColor: 'transparent',
                minHeight: '100px',
              }}
            >
              <span style={{ fontSize: '32px', lineHeight: 1 }}>{pos.emoji}</span>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#e8e8ea',
                  textAlign: 'center',
                  lineHeight: 1.3,
                }}
              >
                {pos.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Inner Component (React Flow — only used for drill-down) ──────────────────

function GamePlanFlowInner({
  selectedPosition,
  onBack,
}: {
  selectedPosition: PositionKey;
  onBack: () => void;
}) {
  const { fitView } = useReactFlow();
  const [nodes, setNodes] = useNodesState<Node>([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);

  // Load subgraph when position changes
  useEffect(() => {
    const { nodes: sNodes, edges: sEdges } = SUBGRAPHS[selectedPosition];
    setNodes(sNodes);
    setEdges(sEdges);
    setTimeout(() => {
      fitView({ padding: 0.1, duration: 400 });
    }, 60);
  }, [selectedPosition, fitView, setNodes, setEdges]);

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      // submission clicks handled inside SubmissionNode; no-op here
      void node;
    },
    []
  );

  const meta = POSITION_LABEL[selectedPosition];

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        minZoom={0.1}
        maxZoom={3}
        style={{ backgroundColor: '#09090d' }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} color="#1a1a26" gap={20} size={1.2} />

        {/* ── Header ── */}
        <Panel position="top-center">
          <div
            style={{
              textAlign: 'center',
              padding: '10px 20px',
              background: 'rgba(12,12,18,0.90)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '10px',
              backdropFilter: 'blur(12px)',
              minWidth: '240px',
            }}
          >
            <div style={{ color: '#e8e8ea', fontSize: '15px', fontWeight: 700 }}>
              {meta.emoji} {meta.label}
            </div>
            <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '3px' }}>
              Tap a move to search YouTube
            </div>
          </div>
        </Panel>

        {/* ── Back Button ── */}
        <Panel position="top-left">
          <button
            onClick={onBack}
            style={{
              background: 'rgba(12,12,18,0.90)',
              color: '#e8e8ea',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            ← Back
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function GamePlanFlow() {
  const [selectedPosition, setSelectedPosition] = useState<PositionKey | null>(null);

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#09090d' }}>
      {selectedPosition === null ? (
        <DefaultView onSelect={setSelectedPosition} />
      ) : (
        <ReactFlowProvider>
          <GamePlanFlowInner
            selectedPosition={selectedPosition}
            onBack={() => setSelectedPosition(null)}
          />
        </ReactFlowProvider>
      )}
    </div>
  );
}
