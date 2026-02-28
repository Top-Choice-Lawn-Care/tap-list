'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

// ─── Professor Quotes ─────────────────────────────────────────────────────────
// Inlined for self-containment (best 25 of 40)

type ProfessorQuote = {
  id: string;
  category: 'general' | 'position' | 'submission' | 'training';
  positionId?: string;
  text: string;
  attribution: string;
};

const PROFESSOR_QUOTES: ProfessorQuote[] = [
  // General philosophy
  {
    id: 'prof-001',
    category: 'general',
    text: 'Jiu-jitsu is not a collection of techniques. It is a language — and until you learn to speak it fluently under pressure, you are merely reciting phrases you memorized from a book.',
    attribution: '— The Professor',
  },
  {
    id: 'prof-002',
    category: 'general',
    text: 'Progress in this art does not arrive on a schedule. It arrives when you have earned it through repetition that would bore most people senseless, applied with a precision most people are too impatient to develop.',
    attribution: '— The Professor',
  },
  {
    id: 'prof-003',
    category: 'general',
    text: 'The man who can remain emotionally calm while his body is under duress has a catastrophic advantage over the man who cannot. Composure is not a personality trait. It is a skill, and it is trained.',
    attribution: '— The Professor',
  },
  {
    id: 'prof-004',
    category: 'general',
    text: 'Efficiency is not laziness. Efficiency is the elimination of everything that does not contribute to the outcome. Most people fight with tremendous effort and terrible results precisely because they confuse movement with progress.',
    attribution: '— The Professor',
  },
  {
    id: 'prof-005',
    category: 'general',
    text: 'Jiu-jitsu punishes urgency. The man who rushes to finish is the man who has surrendered control in his haste to demonstrate that he has it.',
    attribution: '— The Professor',
  },
  {
    id: 'prof-006',
    category: 'general',
    text: 'The hierarchy of positions exists not as a matter of preference, but as a mathematical consequence of what the human body can and cannot do. Back mount is highest. Argue with geometry if you disagree.',
    attribution: '— The Professor',
  },
  {
    id: 'prof-007',
    category: 'general',
    text: 'You came here to learn to fight. What you will discover, if you stay long enough, is that you are really learning to think. The mats are just where the thinking becomes consequential.',
    attribution: '— The Professor',
  },
  {
    id: 'prof-008',
    category: 'general',
    text: 'Your body learns what you teach it. Teach it the correct movement ten thousand times and it will execute under pressure. Teach it the wrong movement ten thousand times and you have built a very reliable machine for losing.',
    attribution: '— The Professor',
  },
  {
    id: 'prof-009',
    category: 'general',
    text: 'Every technique you know has a context in which it will fail. The mark of an educated grappler is not knowing the technique — it is knowing the context.',
    attribution: '— The Professor',
  },
  {
    id: 'prof-010',
    category: 'general',
    text: 'You will not improve by rolling hard with people your own skill level. You will improve by isolating your weaknesses with focused, humble, slightly humiliating deliberateness. The ego finds this intolerable. That is precisely why it works.',
    attribution: '— The Professor',
  },
  // Position-specific
  {
    id: 'prof-011',
    category: 'position',
    positionId: 'closed-guard',
    text: 'The closed guard is a trap, not a resting place. The moment you treat it as a place to recover your breath, your opponent will begin to treat it as a place to pass. Create threats or be threatened. There is no third option.',
    attribution: '— The Professor',
  },
  {
    id: 'prof-012',
    category: 'position',
    positionId: 'half-guard',
    text: 'Half guard is a position that rewards the underhook with everything and punishes its absence with suffering. Get the underhook or accept that you are merely slowing down a pass that has already begun.',
    attribution: '— The Professor',
  },
  {
    id: 'prof-013',
    category: 'position',
    positionId: 'side-control-bottom',
    text: 'When you are on the bottom of side control, your frame is your entire world. Collapse the frame and you have collapsed all your options simultaneously. This is not the time for courage. This is the time for geometry.',
    attribution: '— The Professor',
  },
  {
    id: 'prof-014',
    category: 'position',
    positionId: 'mount-bottom',
    text: 'Being mounted is not a defeat — it is an invitation to demonstrate patience and precision under the worst conditions. The elbow-knee escape has survived fifty years of hard testing. It works. Your interpretation of it may not.',
    attribution: '— The Professor',
  },
  {
    id: 'prof-015',
    category: 'position',
    positionId: 'back-bottom',
    text: 'When your back is taken, your neck is the most important real estate on your body. Guard it as though your continued participation in consciousness depends on it — because it does. Everything else is secondary to the chin tuck.',
    attribution: '— The Professor',
  },
  {
    id: 'prof-016',
    category: 'position',
    positionId: 'standing',
    text: 'Before you can take anyone down, you must first understand that they do not wish to be taken down. The takedown is not a movement — it is a disruption of balance, a theft of the ground beneath their feet. Off-balance them first. Always first.',
    attribution: '— The Professor',
  },
  {
    id: 'prof-017',
    category: 'position',
    positionId: 'mount-top',
    text: 'Mounted, you have three tasks in ascending order of importance: maintain position, improve position, find a finish. Most people invert this list and lose the mount chasing a finish they had not yet earned the right to attempt.',
    attribution: '— The Professor',
  },
  {
    id: 'prof-018',
    category: 'position',
    positionId: 'side-control-top',
    text: 'Side control is not where you relax. It is where you break the spirit of resistance. Apply consistent, uncomfortable pressure. When they choose between suffering where they are and moving to escape, they will move — and that movement is your invitation.',
    attribution: '— The Professor',
  },
  {
    id: 'prof-019',
    category: 'position',
    positionId: 'back-mount-top',
    text: 'The back is the pinnacle. It is the position from which your opponent cannot see your hands, cannot predict your threats, and cannot address more than one danger at a time. Guard your hooks with as much tenacity as you pursue the choke. A back without hooks is a gift you are about to return.',
    attribution: '— The Professor',
  },
  {
    id: 'prof-020',
    category: 'position',
    positionId: 'guard-passing',
    text: 'Guard passing is fundamentally a problem of control over the hips. The guard player\'s hips are the source of every threat they possess. Pin the hips or redirect them, and the guard collapses not because you defeated it but because you removed the structure that held it up.',
    attribution: '— The Professor',
  },
  // Submissions
  {
    id: 'prof-021',
    category: 'submission',
    text: 'The submission is not the goal. The submission is the reward for achieving positional dominance and maintaining it long enough that an opportunity presents itself. Those who pursue the submission as a goal frequently find that they have sacrificed the position and secured neither.',
    attribution: '— The Professor',
  },
  {
    id: 'prof-022',
    category: 'submission',
    text: 'Among all forms of submission, the strangling arts occupy a special place. A joint lock requires the opponent to feel pain and decide to yield. A properly applied strangulation removes the decision entirely. There is a philosophical elegance to that which I find difficult to overstate.',
    attribution: '— The Professor',
  },
  // Training
  {
    id: 'prof-023',
    category: 'training',
    text: 'Drilling installs the movement in the body. Sparring reveals whether the installation took. These are not competing methods — they are sequential ones. A man who only spars is guessing. A man who only drills has never tested the answer.',
    attribution: '— The Professor',
  },
  {
    id: 'prof-024',
    category: 'training',
    text: 'Roll with people who make you uncomfortable. That discomfort is not a sign the training is going poorly. It is evidence the training is going exactly as it should.',
    attribution: '— The Professor',
  },
  {
    id: 'prof-025',
    category: 'training',
    text: 'The long game of jiu-jitsu development is invisible to the beginner and self-evident to the veteran. Trust the process. It is longer than you want and more rewarding than you can currently conceive.',
    attribution: '— The Professor',
  },
];

function getGeneralQuote(): ProfessorQuote {
  const generals = PROFESSOR_QUOTES.filter((q) => q.category === 'general');
  return generals[Math.floor(Math.random() * generals.length)];
}

function getPositionQuote(positionId: string): ProfessorQuote | null {
  const match = PROFESSOR_QUOTES.find(
    (q) => q.category === 'position' && q.positionId === positionId
  );
  return match ?? null;
}

// ─── Professor Modal ──────────────────────────────────────────────────────────

function ProfessorModal({
  quote,
  onDismiss,
}: {
  quote: ProfessorQuote;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    // Backdrop — tap anywhere outside the card to dismiss
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.55)',
        animation: 'profFadeIn 0.25s ease',
        paddingBottom: '0px',
      }}
    >
      {/* Card — stop click from bubbling */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#0f0f18',
          border: '1px solid #2a2a3a',
          borderRadius: '18px 18px 0 0',
          padding: '24px 22px 32px',
          animation: 'profSlideUp 0.28s cubic-bezier(0.34, 1.2, 0.64, 1)',
          boxSizing: 'border-box',
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#9333ea',
              letterSpacing: '0.02em',
            }}
          >
            🎓 The Professor
          </span>
          <button
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7280',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              padding: '4px 8px',
              borderRadius: '6px',
            }}
          >
            Dismiss
          </button>
        </div>

        {/* Quote text */}
        <p
          style={{
            margin: '0 0 14px',
            fontSize: '14px',
            lineHeight: '1.65',
            color: '#d1d5db',
            fontStyle: 'italic',
          }}
        >
          &ldquo;{quote.text}&rdquo;
        </p>

        {/* Attribution */}
        <div style={{ fontSize: '11px', color: '#6b7280' }}>
          {quote.attribution}
        </div>
      </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes profFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes profSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </div>
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
  const [activeQuote, setActiveQuote] = useState<ProfessorQuote | null>(null);

  // Show a random general quote on first load
  useEffect(() => {
    const q = getGeneralQuote();
    // Small delay so the UI renders first
    const t = setTimeout(() => setActiveQuote(q), 600);
    return () => clearTimeout(t);
  }, []);

  const dismissQuote = useCallback(() => setActiveQuote(null), []);

  const handleSelect = (id: string) => {
    setNavStack([id]);
    // Show position-specific quote if one exists
    const q = getPositionQuote(id);
    if (q) {
      setActiveQuote(q);
    }
  };

  const handleBack = () => {
    setNavStack((stack) => stack.slice(0, -1));
  };

  const handlePush = (id: string) => {
    setNavStack((stack) => [...stack, id]);
    // Show position-specific quote if one exists
    const q = getPositionQuote(id);
    if (q) {
      setActiveQuote(q);
    }
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

      {/* Professor Modal */}
      {activeQuote && (
        <ProfessorModal quote={activeQuote} onDismiss={dismissQuote} />
      )}
    </div>
  );
}
