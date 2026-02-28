'use client';

import React, { useState } from 'react';
// @xyflow/react kept as dependency but not used in drill-down view
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type {} from '@xyflow/react';

// ─── Types ────────────────────────────────────────────────────────────────────

type OptionType = 'submission' | 'transition' | 'takedown';

interface Option {
  label: string;
  type: OptionType;
  targetId?: string;   // if transition/takedown, which position to push
  edgeLabel?: string;  // context label, e.g. "hip bump sweep"
}

interface PositionData {
  id: string;
  emoji: string;
  label: string;
  options: Option[];
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
      { label: 'Head and Arm Triangle', type: 'submission' },
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
      { label: 'Head and Arm Triangle', type: 'submission' },
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
};

// ─── Starting Position Cards ──────────────────────────────────────────────────

const DEFENDING_POSITIONS = [
  { id: 'closed-guard',       emoji: '🥋', label: 'Closed Guard'  },
  { id: 'half-guard',         emoji: '½',  label: 'Half Guard'    },
  { id: 'side-control-bottom',emoji: '😬', label: 'Side Control'  },
  { id: 'mount-bottom',       emoji: '😰', label: 'Mount'         },
  { id: 'back-bottom',        emoji: '😱', label: 'Back Taken'    },
  { id: 'standing',           emoji: '🤼', label: 'Standing'      },
];

const ATTACKING_POSITIONS = [
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
      {/* Header */}
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#e8e8ea', textAlign: 'center', lineHeight: 1.3 }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

// ─── Option Card ──────────────────────────────────────────────────────────────

function OptionCard({
  option,
  onTap,
}: {
  option: Option;
  onTap: () => void;
}) {
  const isSubmission = option.type === 'submission';
  const isTakedown   = option.type === 'takedown';

  return (
    <div
      onClick={onTap}
      style={{
        backgroundColor: isSubmission ? '#1a0505' : isTakedown ? '#120820' : '#0d1a0d',
        border: `1.5px solid ${isSubmission ? '#7f1d1d' : isTakedown ? '#4c1d95' : '#14532d'}`,
        borderRadius: '12px',
        padding: '14px 16px',
        marginBottom: '10px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div>
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#e8e8ea' }}>
          {option.label}
        </div>
        {option.edgeLabel && (
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '3px' }}>
            {option.edgeLabel}
          </div>
        )}
      </div>
      <div style={{ fontSize: '18px', marginLeft: '12px', flexShrink: 0 }}>
        {isSubmission ? '🔴' : isTakedown ? '🟣' : '→'}
      </div>
    </div>
  );
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

function Breadcrumb({
  stack,
  onJump,
}: {
  stack: string[];       // array of position IDs
  onJump: (idx: number) => void; // jump to stack[idx] (idx = -1 = home)
}) {
  // Build segments: Home + each stack item
  const segments: { label: string; idx: number }[] = [
    { label: 'Home', idx: -1 },
    ...stack.map((id, i) => ({
      label: POSITION_GRAPH[id]?.label ?? id,
      idx: i,
    })),
  ];

  // Show last 3 segments; if more, prefix with "..."
  const visible = segments.length > 3 ? segments.slice(-3) : segments;
  const hasOverflow = segments.length > 3;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'nowrap',
        overflow: 'hidden',
        gap: '4px',
        fontSize: '12px',
        color: '#6b7280',
        minWidth: 0,
      }}
    >
      {hasOverflow && (
        <>
          <span style={{ color: '#4b5563' }}>…</span>
          <span style={{ color: '#4b5563' }}>›</span>
        </>
      )}
      {visible.map((seg, i) => {
        const isLast = i === visible.length - 1;
        return (
          <React.Fragment key={seg.idx}>
            {i > 0 && <span style={{ color: '#4b5563', flexShrink: 0 }}>›</span>}
            <span
              onClick={() => !isLast && onJump(seg.idx)}
              style={{
                color: isLast ? '#e8e8ea' : '#7c3aed',
                fontWeight: isLast ? 700 : 500,
                cursor: isLast ? 'default' : 'pointer',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '120px',
              }}
            >
              {seg.label}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Position View ────────────────────────────────────────────────────────────

function PositionView({
  stack,
  onBack,
  onPush,
  onJump,
}: {
  stack: string[];
  onBack: () => void;
  onPush: (id: string) => void;
  onJump: (idx: number) => void;
}) {
  const posId = stack[stack.length - 1];
  const pos = POSITION_GRAPH[posId];

  if (!pos) {
    return (
      <div style={{ padding: '24px', color: '#e8e8ea' }}>
        Position not found: {posId}
      </div>
    );
  }

  const handleOption = (option: Option) => {
    if (option.type === 'submission' || option.type === 'takedown') {
      const query = encodeURIComponent(`bjj ${option.label} tutorial`);
      window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
    } else if (option.targetId) {
      onPush(option.targetId);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#09090d',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Sticky Header ── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: '#09090d',
          borderBottom: '1px solid #1a1a26',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
        }}
      >
        <button
          onClick={onBack}
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
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          ← Back
        </button>
        <Breadcrumb stack={stack} onJump={onJump} />
      </div>

      {/* ── Scrollable Content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {/* Position title */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#e8e8ea', letterSpacing: '-0.3px' }}>
            {pos.emoji} {pos.label}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px', fontStyle: 'italic' }}>
            — position before submission —
          </div>
        </div>

        {/* Option cards */}
        {pos.options.map((option, i) => (
          <OptionCard key={i} option={option} onTap={() => handleOption(option)} />
        ))}
      </div>
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export default function GamePlanFlow() {
  const [navStack, setNavStack] = useState<string[]>([]);

  const handleSelect = (id: string) => {
    setNavStack([id]);
  };

  const handleBack = () => {
    setNavStack((stack) => stack.slice(0, -1));
  };

  const handlePush = (id: string) => {
    setNavStack((stack) => [...stack, id]);
  };

  // Jump to a specific index in the stack (-1 = home)
  const handleJump = (idx: number) => {
    if (idx === -1) {
      setNavStack([]);
    } else {
      setNavStack((stack) => stack.slice(0, idx + 1));
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#09090d' }}>
      {navStack.length === 0 ? (
        <DefaultView onSelect={handleSelect} />
      ) : (
        <PositionView
          stack={navStack}
          onBack={handleBack}
          onPush={handlePush}
          onJump={handleJump}
        />
      )}
    </div>
  );
}
