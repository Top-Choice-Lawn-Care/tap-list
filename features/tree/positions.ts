// Twelve-position game tree. Open Guard and Turtle are reached by drilling in.

export type OptionType = 'submission' | 'transition' | 'takedown';

export interface Option {
  label: string;
  type: OptionType;
  targetId?: string;
  edgeLabel?: string;
}

export interface PositionData {
  id: string;
  emoji: string;
  label: string;
  options: Option[];
}

// ─── Full Position Graph ──────────────────────────────────────────────────────

export const POSITION_GRAPH: Record<string, PositionData> = {
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

export const DEFENDING_POSITIONS = [
  { id: 'closed-guard',        emoji: '🥋', label: 'Closed Guard' },
  { id: 'half-guard',          emoji: '½',  label: 'Half Guard'   },
  { id: 'side-control-bottom', emoji: '😬', label: 'Side Control' },
  { id: 'mount-bottom',        emoji: '😰', label: 'Mount'        },
  { id: 'back-bottom',         emoji: '😱', label: 'Back Taken'   },
];

export const ATTACKING_POSITIONS = [
  { id: 'standing',         emoji: '🤼', label: 'Standing'           },
  { id: 'guard-top',        emoji: '🦅', label: 'Guard (top)'        },
  { id: 'mount-top',        emoji: '💪', label: 'Mount (top)'        },
  { id: 'side-control-top', emoji: '🤛', label: 'Side Control (top)' },
  { id: 'back-mount-top',   emoji: '🎯', label: 'Back Mount (top)'   },
];
