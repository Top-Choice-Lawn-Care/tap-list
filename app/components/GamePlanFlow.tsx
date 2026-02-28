'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  Background,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ─── Types ────────────────────────────────────────────────────────────────────

type OptionType = 'submission' | 'transition' | 'takedown';

interface Option {
  label: string;
  type: OptionType;
  targetId?: string;
  edgeLabel?: string;
}

interface PositionData {
  id: string;
  emoji: string;
  label: string;
  options: Option[];
}

// ─── Professor Quotes ─────────────────────────────────────────────────────────

type ProfessorQuote = {
  id: string;
  category: 'general' | 'position' | 'submission' | 'training';
  positionId?: string;
  text: string;
  attribution: string;
};

const PROFESSOR_QUOTES: ProfessorQuote[] = [
  {
    id: 'prof-001',
    category: 'general',
    text: 'Jiu-jitsu is a language. Until you speak it under pressure, you\'re reciting phrases you memorized.',
    attribution: '— Professor Max',
  },
  {
    id: 'prof-002',
    category: 'general',
    text: 'Progress arrives when you\'ve earned it. The schedule is not yours to set.',
    attribution: '— Professor Max',
  },
  {
    id: 'prof-003',
    category: 'general',
    text: 'Composure under pressure is a skill. Train it like everything else.',
    attribution: '— Professor Max',
  },
  {
    id: 'prof-004',
    category: 'general',
    text: 'Movement is not progress. Efficiency is the elimination of everything that doesn\'t contribute.',
    attribution: '— Professor Max',
  },
  {
    id: 'prof-005',
    category: 'general',
    text: 'Jiu-jitsu punishes urgency. The man who rushes to finish usually finishes second.',
    attribution: '— Professor Max',
  },
  {
    id: 'prof-006',
    category: 'general',
    text: 'Back mount is the highest position. Argue with geometry if you disagree.',
    attribution: '— Professor Max',
  },
  {
    id: 'prof-007',
    category: 'general',
    text: 'You came here to learn to fight. Stay long enough and you\'ll learn to think.',
    attribution: '— Professor Max',
  },
  {
    id: 'prof-008',
    category: 'general',
    text: 'Teach your body the wrong movement ten thousand times and you\'ve built a very reliable losing machine.',
    attribution: '— Professor Max',
  },
  {
    id: 'prof-009',
    category: 'general',
    text: 'Every technique fails in the wrong context. Knowing the technique isn\'t enough.',
    attribution: '— Professor Max',
  },
  {
    id: 'prof-010',
    category: 'general',
    text: 'Roll with people who make you uncomfortable. That discomfort is the training working.',
    attribution: '— Professor Max',
  },
  {
    id: 'prof-011',
    category: 'position',
    positionId: 'closed-guard',
    text: 'The guard is a weapon. Create threats or get passed — there is no third option.',
    attribution: '— Professor Max',
  },
  {
    id: 'prof-012',
    category: 'position',
    positionId: 'half-guard',
    text: 'Half guard without the underhook is just slow side control.',
    attribution: '— Professor Max',
  },
  {
    id: 'prof-013',
    category: 'position',
    positionId: 'side-control-bottom',
    text: 'Frame first. Always. Collapse it and you\'ve collapsed every option at once.',
    attribution: '— Professor Max',
  },
  {
    id: 'prof-014',
    category: 'position',
    positionId: 'mount-bottom',
    text: 'The elbow-knee escape has survived fifty years of hard testing. It works. Your version might not.',
    attribution: '— Professor Max',
  },
  {
    id: 'prof-015',
    category: 'position',
    positionId: 'back-bottom',
    text: 'Protect your neck above everything else. Your continued consciousness depends on it.',
    attribution: '— Professor Max',
  },
  {
    id: 'prof-016',
    category: 'position',
    positionId: 'standing',
    text: 'Off-balance them first. Always first. The takedown is a theft, not a movement.',
    attribution: '— Professor Max',
  },
  {
    id: 'prof-017',
    category: 'position',
    positionId: 'mount-top',
    text: 'Maintain. Improve. Finish. In that order. Invert the list and you\'ll lose the mount.',
    attribution: '— Professor Max',
  },
  {
    id: 'prof-018',
    category: 'position',
    positionId: 'side-control-top',
    text: 'Pressure breaks spirits. Make them choose between suffering and moving — then punish the movement.',
    attribution: '— Professor Max',
  },
  {
    id: 'prof-019',
    category: 'position',
    positionId: 'back-mount-top',
    text: 'Hooks first, choke second. A back without hooks is a gift you\'re about to return.',
    attribution: '— Professor Max',
  },
  {
    id: 'prof-020',
    category: 'position',
    positionId: 'guard-top',
    text: 'Guard passing is a hip problem. Control the hips and the guard collapses on its own.',
    attribution: '— Professor Max',
  },
  {
    id: 'prof-021',
    category: 'submission',
    text: 'Position first. Submission second. Chase the finish too early and you\'ll lose both.',
    attribution: '— Professor Max',
  },
  {
    id: 'prof-022',
    category: 'submission',
    text: 'A joint lock asks for a tap. A proper strangulation removes the question entirely.',
    attribution: '— Professor Max',
  },
  {
    id: 'prof-023',
    category: 'training',
    text: 'Drilling installs the movement. Sparring tests the installation. You need both.',
    attribution: '— Professor Max',
  },
  {
    id: 'prof-024',
    category: 'training',
    text: 'If you\'re never uncomfortable on the mat, the mat isn\'t teaching you anything.',
    attribution: '— Professor Max',
  },
  {
    id: 'prof-025',
    category: 'training',
    text: 'The long game is invisible to beginners and self-evident to veterans. Trust the process.',
    attribution: '— Professor Max',
  },
];

// Session-level tracking — resets on page reload, persists across nav
const _shownQuoteIds = new Set<string>();
const _visitedPositions = new Set<string>();

function getGeneralQuote(): ProfessorQuote | null {
  const generals = PROFESSOR_QUOTES.filter(
    (q) => q.category === 'general' && !_shownQuoteIds.has(q.id)
  );
  if (generals.length === 0) return null;
  const q = generals[Math.floor(Math.random() * generals.length)];
  _shownQuoteIds.add(q.id);
  return q;
}

function getPositionQuote(positionId: string): ProfessorQuote | null {
  if (_visitedPositions.has(positionId)) return null;
  _visitedPositions.add(positionId);
  const match = PROFESSOR_QUOTES.find(
    (q) => q.category === 'position' && q.positionId === positionId && !_shownQuoteIds.has(q.id)
  );
  if (match) _shownQuoteIds.add(match.id);
  return match ?? null;
}

// ─── Professor Toast ──────────────────────────────────────────────────────────

function ProfessorToast({
  quote,
  onDismiss,
}: {
  quote: ProfessorQuote;
  onDismiss: () => void;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const dismissTimer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(dismissTimer);
  }, []);

  useEffect(() => {
    if (!visible) {
      const removeTimer = setTimeout(onDismiss, 300);
      return () => clearTimeout(removeTimer);
    }
  }, [visible, onDismiss]);

  const handleTap = () => setVisible(false);

  return (
    <>
      <style>{`
        @keyframes profSlideUp   { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes profSlideDown { from { transform: translateY(0); }    to { transform: translateY(100%); } }
      `}</style>
      <div
        onClick={handleTap}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          height: '80px',
          backgroundColor: '#13131a',
          borderTop: '1px solid #2a2a3a',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '0 16px',
          boxSizing: 'border-box',
          cursor: 'pointer',
          animation: visible
            ? 'profSlideUp 0.25s ease forwards'
            : 'profSlideDown 0.3s ease forwards',
        }}
      >
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <span style={{ fontSize: '20px', lineHeight: 1 }}>🥋</span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#9333ea', letterSpacing: '0.03em' }}>
            Prof. Max
          </span>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <p style={{
            margin: 0,
            fontSize: '13px',
            lineHeight: '1.4',
            color: '#ffffff',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
          }}>
            &ldquo;{quote.text}&rdquo;
          </p>
        </div>
      </div>
    </>
  );
}

// ─── Full Position Graph ──────────────────────────────────────────────────────

const POSITION_GRAPH: Record<string, PositionData> = {
  'closed-guard': {
    id: 'closed-guard', emoji: '🥋', label: 'Closed Guard',
    options: [
      { label: 'Triangle Choke',  type: 'submission' },
      { label: 'Armbar',          type: 'submission' },
      { label: 'Kimura',          type: 'submission' },
      { label: 'Omoplata',        type: 'submission' },
      { label: 'Guillotine',      type: 'submission', edgeLabel: 'if they posture up' },
      { label: 'Mount (top)',     type: 'transition', targetId: 'mount-top',     edgeLabel: 'hip bump sweep' },
      { label: 'Half Guard',      type: 'transition', targetId: 'half-guard',    edgeLabel: 'they pass' },
      { label: 'Open Guard',      type: 'transition', targetId: 'open-guard',    edgeLabel: 'open up' },
    ],
  },
  'open-guard': {
    id: 'open-guard', emoji: '🦵', label: 'Open Guard',
    options: [
      { label: 'Triangle Choke',    type: 'submission' },
      { label: 'Omoplata',          type: 'submission' },
      { label: 'Back Mount (top)',  type: 'transition', targetId: 'back-mount-top', edgeLabel: 'back take' },
      { label: 'Closed Guard',      type: 'transition', targetId: 'closed-guard',   edgeLabel: 'close guard' },
      { label: 'Half Guard',        type: 'transition', targetId: 'half-guard',      edgeLabel: 'they pass' },
    ],
  },
  'half-guard': {
    id: 'half-guard', emoji: '½', label: 'Half Guard',
    options: [
      { label: 'Kimura',               type: 'submission' },
      { label: 'Back Mount (top)',     type: 'transition', targetId: 'back-mount-top',      edgeLabel: 'take back' },
      { label: 'Closed Guard',         type: 'transition', targetId: 'closed-guard',         edgeLabel: 'recover guard' },
      { label: 'Open Guard',           type: 'transition', targetId: 'open-guard',           edgeLabel: 'knee shield' },
      { label: 'Side Control (bottom)',type: 'transition', targetId: 'side-control-bottom',  edgeLabel: 'they flatten you' },
    ],
  },
  'side-control-bottom': {
    id: 'side-control-bottom', emoji: '😬', label: 'Side Control',
    options: [
      { label: 'Closed Guard',  type: 'transition', targetId: 'closed-guard',  edgeLabel: 'shrimp out' },
      { label: 'Half Guard',    type: 'transition', targetId: 'half-guard',    edgeLabel: 'get underhook' },
      { label: 'Turtle',        type: 'transition', targetId: 'turtle',        edgeLabel: 'roll to turtle' },
      { label: 'Mount (bottom)',type: 'transition', targetId: 'mount-bottom',  edgeLabel: 'they advance' },
    ],
  },
  'mount-bottom': {
    id: 'mount-bottom', emoji: '😰', label: 'Mount (bottom)',
    options: [
      { label: 'Closed Guard',         type: 'transition', targetId: 'closed-guard',        edgeLabel: 'elbow-knee escape' },
      { label: 'Half Guard',           type: 'transition', targetId: 'half-guard',           edgeLabel: 'trap and roll' },
      { label: 'Side Control (bottom)',type: 'transition', targetId: 'side-control-bottom',  edgeLabel: 'bridge escape' },
    ],
  },
  'back-bottom': {
    id: 'back-bottom', emoji: '😱', label: 'Back Taken',
    options: [
      { label: 'Side Control (bottom)',type: 'transition', targetId: 'side-control-bottom', edgeLabel: 'escape to side' },
      { label: 'Turtle',               type: 'transition', targetId: 'turtle',              edgeLabel: 'chin tuck' },
      { label: 'Closed Guard',         type: 'transition', targetId: 'closed-guard',        edgeLabel: 'sit through' },
    ],
  },
  'turtle': {
    id: 'turtle', emoji: '🐢', label: 'Turtle',
    options: [
      { label: 'Closed Guard',         type: 'transition', targetId: 'closed-guard',        edgeLabel: 'sit out' },
      { label: 'Side Control (bottom)',type: 'transition', targetId: 'side-control-bottom',  edgeLabel: 'flatten out' },
      { label: 'Back Mount (top)',     type: 'transition', targetId: 'back-mount-top',       edgeLabel: 'granby roll offense' },
    ],
  },
  'standing': {
    id: 'standing', emoji: '🤼', label: 'Standing',
    options: [
      { label: 'Double Leg',          type: 'takedown',   edgeLabel: 'level change' },
      { label: 'Single Leg',          type: 'takedown',   edgeLabel: 'level change' },
      { label: 'Guillotine',          type: 'submission', edgeLabel: 'snap down' },
      { label: 'Closed Guard',        type: 'transition', targetId: 'closed-guard',        edgeLabel: 'guard pull' },
      { label: 'Side Control (top)',  type: 'transition', targetId: 'side-control-top',    edgeLabel: 'takedown lands' },
      { label: 'Back Mount (top)',    type: 'transition', targetId: 'back-mount-top',      edgeLabel: 'arm drag' },
    ],
  },
  'mount-top': {
    id: 'mount-top', emoji: '💪', label: 'Mount (top)',
    options: [
      { label: 'Armbar',            type: 'submission' },
      { label: 'Americana',         type: 'submission' },
      { label: 'Ezekiel Choke',     type: 'submission' },
      { label: 'Back Mount (top)', type: 'transition', targetId: 'back-mount-top',   edgeLabel: 'take back' },
      { label: 'Side Control (top)',type: 'transition', targetId: 'side-control-top', edgeLabel: 'they roll' },
    ],
  },
  'side-control-top': {
    id: 'side-control-top', emoji: '🤛', label: 'Side Control (top)',
    options: [
      { label: 'Americana',         type: 'submission' },
      { label: 'Kimura',            type: 'submission' },
      { label: "D'Arce Choke",      type: 'submission' },
      { label: 'North-South Choke', type: 'submission' },
      { label: 'Mount (top)',       type: 'transition', targetId: 'mount-top',        edgeLabel: 'advance to mount' },
      { label: 'Back Mount (top)', type: 'transition', targetId: 'back-mount-top',   edgeLabel: 'take back' },
    ],
  },
  'back-mount-top': {
    id: 'back-mount-top', emoji: '🎯', label: 'Back Mount (top)',
    options: [
      { label: 'Rear Naked Choke', type: 'submission' },
      { label: 'Bow & Arrow',      type: 'submission' },
      { label: 'Armbar',           type: 'submission' },
      { label: 'Collar Choke',     type: 'submission' },
      { label: 'Mount (top)',      type: 'transition', targetId: 'mount-top', edgeLabel: 'they escape to front' },
    ],
  },
  'guard-top': {
    id: 'guard-top', emoji: '🦅', label: 'Guard (top)',
    options: [
      { label: 'Torreando Pass',       type: 'transition', targetId: 'side-control-top', edgeLabel: 'pass guard' },
      { label: 'Double Under Pass',    type: 'transition', targetId: 'side-control-top', edgeLabel: 'stack & pass' },
      { label: 'Leg Drag Pass',        type: 'transition', targetId: 'side-control-top', edgeLabel: 'drag & pass' },
      { label: 'Over-Under Pass',      type: 'transition', targetId: 'side-control-top', edgeLabel: 'grind through' },
      { label: 'Knee Slice Pass',      type: 'transition', targetId: 'side-control-top', edgeLabel: 'slice through' },
      { label: 'Back Take',            type: 'transition', targetId: 'back-mount-top',   edgeLabel: 'if they turn' },
      { label: 'Footlock / Heel Hook', type: 'submission',                                edgeLabel: 'leg entanglement' },
    ],
  },
};

// ─── Starting Position Cards ──────────────────────────────────────────────────

const DEFENDING_POSITIONS = [
  { id: 'closed-guard',        emoji: '🥋', label: 'Closed Guard' },
  { id: 'half-guard',          emoji: '½',  label: 'Half Guard'   },
  { id: 'side-control-bottom', emoji: '😬', label: 'Side Control' },
  { id: 'mount-bottom',        emoji: '😰', label: 'Mount'        },
  { id: 'back-bottom',         emoji: '😱', label: 'Back Taken'   },
];

const ATTACKING_POSITIONS = [
  { id: 'standing',         emoji: '🤼', label: 'Standing'           },
  { id: 'guard-top',        emoji: '🦅', label: 'Guard (top)'        },
  { id: 'mount-top',        emoji: '💪', label: 'Mount (top)'        },
  { id: 'side-control-top', emoji: '🤛', label: 'Side Control (top)' },
  { id: 'back-mount-top',   emoji: '🎯', label: 'Back Mount (top)'   },
];

// ─── Home View ────────────────────────────────────────────────────────────────

function DefaultView({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '16px',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '24px', paddingTop: '8px' }}>
        <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
          Where are you?
        </div>
        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
          Tap a position to see your options
        </div>
        <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '6px', fontStyle: 'italic' }}>
          — position before submission —
        </div>
      </div>

      <div style={{ marginBottom: '4px' }}>
        <div
          style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase' as const, color: '#6b7280',
            marginBottom: '10px', paddingLeft: '2px',
          }}
        >
          Defending 🛡️
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {DEFENDING_POSITIONS.map((pos) => (
            <button
              key={pos.id}
              onClick={() => onSelect(pos.id)}
              style={{
                backgroundColor: '#13131a', border: '1.5px solid #2a2a3a',
                borderRadius: '14px', padding: '20px 16px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '10px', fontFamily: 'inherit', transition: 'all 0.15s ease',
                WebkitTapHighlightColor: 'transparent', minHeight: '100px',
              }}
            >
              <span style={{ fontSize: '32px', lineHeight: 1 }}>{pos.emoji}</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#e8e8ea', textAlign: 'center', lineHeight: 1.3 }}>
                {pos.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: '#1e1e2e', margin: '16px 0 12px' }} />

      <div>
        <div
          style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase' as const, color: '#6b7280',
            marginBottom: '10px', paddingLeft: '2px',
          }}
        >
          Attacking ⚔️
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {ATTACKING_POSITIONS.map((pos) => (
            <button
              key={pos.id}
              onClick={() => onSelect(pos.id)}
              style={{
                backgroundColor: '#0d1f12', border: '1.5px solid #1a3a22',
                borderRadius: '14px', padding: '20px 16px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '10px', fontFamily: 'inherit', transition: 'all 0.15s ease',
                WebkitTapHighlightColor: 'transparent', minHeight: '100px',
              }}
            >
              <span style={{ fontSize: '32px', lineHeight: 1 }}>{pos.emoji}</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#e8e8ea', textAlign: 'center', lineHeight: 1.3 }}>
                {pos.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Subgraph Computation ─────────────────────────────────────────────────────

const COL0 = 0;
const COL1 = 320;
const COL2 = 640;

function computeSubgraph(
  positionId: string,
  positionGraph: Record<string, PositionData>
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const center = positionGraph[positionId];
  if (!center) return { nodes, edges };

  const l1Options = center.options;
  const l1Count = l1Options.length;

  // Center node — vertically centered
  const centerY = Math.max((l1Count - 1) * 90, 0) / 2;

  nodes.push({
    id: 'center',
    type: 'default',
    position: { x: COL0, y: centerY },
    data: { label: `${center.emoji} ${center.label}`, type: 'center' },
    style: {
      width: 180,
      height: 64,
      borderRadius: '10px',
      background: '#1e1e3f',
      border: '3px solid #ffffff',
      boxShadow: '0 0 20px rgba(255,255,255,0.25)',
      color: '#ffffff',
      fontWeight: 700,
      fontSize: '13px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center' as const,
      padding: '0 10px',
    },
  });

  // Track L2 y-offsets per L1 node
  let l2GlobalY = 0;

  l1Options.forEach((opt, l1i) => {
    const l1Y = l1i * 90;
    const isSubmission = opt.type === 'submission';
    const isTakedown = opt.type === 'takedown';
    const isTransition = opt.type === 'transition';
    const l1Id = `l1-${l1i}`;

    if (isSubmission || isTakedown) {
      nodes.push({
        id: l1Id,
        type: 'default',
        position: { x: COL1, y: l1Y },
        data: {
          label: `${isTakedown ? '🟣' : '🔴'} ${opt.label.toUpperCase()}`,
          type: isTakedown ? 'takedown' : 'submission',
          label_raw: opt.label,
        },
        style: {
          width: 150,
          height: 40,
          borderRadius: '999px',
          background: isTakedown ? '#1a0a2d' : '#2d0a0a',
          border: `2px solid ${isTakedown ? '#9333ea' : '#dc2626'}`,
          color: isTakedown ? '#d8b4fe' : '#fca5a5',
          fontSize: '11px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center' as const,
          cursor: 'pointer',
          padding: '0 8px',
        },
      });

      edges.push({
        id: `e-center-${l1Id}`,
        source: 'center',
        target: l1Id,
        type: 'smoothstep',
        animated: false,
        label: opt.edgeLabel,
        style: { stroke: '#dc2626', strokeWidth: 2 },
        labelStyle: { fill: '#6b7280', fontSize: 10 },
        labelBgStyle: { fill: 'transparent' },
      });
    } else if (isTransition) {
      nodes.push({
        id: l1Id,
        type: 'default',
        position: { x: COL1, y: l1Y },
        data: {
          label: opt.label,
          type: 'transition',
          targetId: opt.targetId,
        },
        style: {
          width: 160,
          height: 52,
          borderRadius: '10px',
          background: '#0f2d1a',
          border: '2px solid #22c55e',
          color: '#86efac',
          fontSize: '12px',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center' as const,
          padding: '0 8px',
        },
      });

      edges.push({
        id: `e-center-${l1Id}`,
        source: 'center',
        target: l1Id,
        type: 'smoothstep',
        animated: true,
        label: opt.edgeLabel,
        style: { stroke: '#4a7cc7', strokeWidth: 1.5, strokeDasharray: '5,5' },
        labelStyle: { fill: '#6b7280', fontSize: 10 },
        labelBgStyle: { fill: 'transparent' },
      });

      // L2: expand options of this transition node
      if (opt.targetId && positionGraph[opt.targetId]) {
        const l2Pos = positionGraph[opt.targetId];
        const l2Options = l2Pos.options;
        const l2Count = l2Options.length;

        // Group L2 nodes near their L1 parent
        const l2GroupCenter = l1Y;
        const l2StartY = l2GlobalY;

        // Space them 80px apart, centered around the parent if possible
        const l2TotalHeight = (l2Count - 1) * 80;
        const l2GroupTop = l2GroupCenter - l2TotalHeight / 2;

        // Make sure no overlap with previous L2 group
        const actualStart = Math.max(l2StartY, l2GroupTop);

        l2Options.forEach((l2opt, l2i) => {
          const l2Y = actualStart + l2i * 80;
          const l2Id = `l2-${l1i}-${l2i}`;
          const l2IsSubmission = l2opt.type === 'submission';
          const l2IsTakedown = l2opt.type === 'takedown';
          const l2IsTransition = l2opt.type === 'transition';

          if (l2IsSubmission || l2IsTakedown) {
            nodes.push({
              id: l2Id,
              type: 'default',
              position: { x: COL2, y: l2Y },
              data: {
                label: `${l2IsTakedown ? '🟣' : '🔴'} ${l2opt.label.toUpperCase()}`,
                type: l2IsTakedown ? 'takedown' : 'submission',
                label_raw: l2opt.label,
              },
              style: {
                width: 150,
                height: 40,
                borderRadius: '999px',
                background: l2IsTakedown ? '#1a0a2d' : '#2d0a0a',
                border: `2px solid ${l2IsTakedown ? '#9333ea' : '#dc2626'}`,
                color: l2IsTakedown ? '#d8b4fe' : '#fca5a5',
                fontSize: '10px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center' as const,
                cursor: 'pointer',
                padding: '0 8px',
              },
            });

            edges.push({
              id: `e-${l1Id}-${l2Id}`,
              source: l1Id,
              target: l2Id,
              type: 'smoothstep',
              animated: false,
              label: l2opt.edgeLabel,
              style: { stroke: '#dc2626', strokeWidth: 1.5 },
              labelStyle: { fill: '#6b7280', fontSize: 10 },
              labelBgStyle: { fill: 'transparent' },
            });
          } else if (l2IsTransition) {
            nodes.push({
              id: l2Id,
              type: 'default',
              position: { x: COL2, y: l2Y },
              data: {
                label: l2opt.label,
                type: 'transition',
                targetId: l2opt.targetId,
              },
              style: {
                width: 150,
                height: 48,
                borderRadius: '10px',
                background: '#0a1a10',
                border: '1px solid #374151',
                color: '#9ca3af',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center' as const,
                padding: '0 8px',
              },
            });

            edges.push({
              id: `e-${l1Id}-${l2Id}`,
              source: l1Id,
              target: l2Id,
              type: 'smoothstep',
              animated: true,
              label: l2opt.edgeLabel,
              style: { stroke: '#374151', strokeWidth: 1, strokeDasharray: '5,5' },
              labelStyle: { fill: '#6b7280', fontSize: 10 },
              labelBgStyle: { fill: 'transparent' },
            });
          }
        });

        l2GlobalY = actualStart + l2Count * 80 + 20;
      }
    }
  });

  return { nodes, edges };
}

// ─── SubgraphView (inner, uses useReactFlow) ──────────────────────────────────

function SubgraphView({
  positionId,
  positionGraph,
  setNavStack,
  openVideo,
}: {
  positionId: string;
  positionGraph: Record<string, PositionData>;
  navStack: string[];
  setNavStack: React.Dispatch<React.SetStateAction<string[]>>;
  openVideo?: (query: string) => void;
}) {
  const { fitView } = useReactFlow();
  const { nodes, edges } = computeSubgraph(positionId, positionGraph);
  const prevPositionId = useRef<string | null>(null);

  useEffect(() => {
    if (prevPositionId.current !== positionId) {
      prevPositionId.current = positionId;
      const t = setTimeout(() => {
        fitView({ padding: 0.12, duration: 400 });
      }, 60);
      return () => clearTimeout(t);
    }
  }, [positionId, fitView]);

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      const d = node.data as { type: string; targetId?: string; label?: string; label_raw?: string };
      if (d.type === 'transition' && d.targetId) {
        setNavStack((prev) => [...prev, d.targetId!]);
      } else if (d.type === 'submission' || d.type === 'takedown') {
        const raw = (d.label_raw as string) || (d.label as string) || '';
        if (openVideo) {
          openVideo(raw);
        } else {
          window.open(
            `https://www.youtube.com/results?search_query=bjj+${encodeURIComponent(raw)}+tutorial`,
            '_blank'
          );
        }
      }
    },
    [setNavStack, openVideo]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodeClick={onNodeClick}
      fitView
      fitViewOptions={{ padding: 0.12 }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag={true}
      zoomOnScroll={true}
      zoomOnPinch={true}
      minZoom={0.3}
      maxZoom={2}
      style={{ background: '#09090d' }}
      proOptions={{ hideAttribution: true }}
    >
      <Background color="#1e1e2e" gap={24} size={1} />
    </ReactFlow>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export default function GamePlanFlow({ openVideo }: { openVideo?: (query: string) => void }) {
  const [navStack, setNavStack] = useState<string[]>([]);
  const [activeQuote, setActiveQuote] = useState<ProfessorQuote | null>(null);

  // Show a random general quote on first load
  useEffect(() => {
    const q = getGeneralQuote();
    const t = setTimeout(() => setActiveQuote(q), 600);
    return () => clearTimeout(t);
  }, []);

  const dismissQuote = useCallback(() => setActiveQuote(null), []);

  const handleSelect = (id: string) => {
    setNavStack([id]);
    const q = getPositionQuote(id);
    if (q) setActiveQuote(q);
  };

  const handleBack = () => {
    setNavStack((stack) => stack.slice(0, -1));
  };

  const currentPositionId = navStack[navStack.length - 1];
  const currentPosition = currentPositionId ? POSITION_GRAPH[currentPositionId] : null;

  // Build breadcrumb label
  const buildBreadcrumb = () => {
    if (navStack.length <= 1) return null;
    const segments = ['Home', ...navStack.map((id) => POSITION_GRAPH[id]?.label ?? id)];
    // Show last 3
    const visible = segments.length > 3 ? ['…', ...segments.slice(-2)] : segments;
    return visible.join(' › ');
  };

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#09090d', display: 'flex', flexDirection: 'column' }}>
      {navStack.length === 0 ? (
        <DefaultView onSelect={handleSelect} />
      ) : (
        <>
          {/* ── Header ── */}
          <div
            style={{
              flexShrink: 0,
              backgroundColor: '#09090d',
              borderBottom: '1px solid #1a1a26',
              padding: '12px 16px',
              zIndex: 10,
            }}
          >
            {/* Row 1: Back + breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <button
                onClick={handleBack}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  color: '#e8e8ea',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  flexShrink: 0,
                }}
              >
                ← Back
              </button>
              {buildBreadcrumb() && (
                <div style={{ fontSize: '12px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {buildBreadcrumb()}
                </div>
              )}
            </div>
            {/* Row 2: Position title */}
            {currentPosition && (
              <div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#e8e8ea', letterSpacing: '-0.3px' }}>
                  {currentPosition.emoji} {currentPosition.label}
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '3px', fontStyle: 'italic' }}>
                  — position before submission —
                </div>
              </div>
            )}
          </div>

          {/* ── React Flow Canvas ── */}
          <div style={{ flex: 1, position: 'relative' }}>
            <ReactFlowProvider>
              <SubgraphView
                positionId={currentPositionId}
                positionGraph={POSITION_GRAPH}
                navStack={navStack}
                setNavStack={setNavStack}
                openVideo={openVideo}
              />
            </ReactFlowProvider>
          </div>
        </>
      )}

      {/* Professor Toast */}
      {activeQuote && (
        <ProfessorToast quote={activeQuote} onDismiss={dismissQuote} />
      )}
    </div>
  );
}
