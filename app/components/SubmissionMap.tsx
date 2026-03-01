'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ─── Types ────────────────────────────────────────────────────────────────────

type Belt = 'white' | 'blue' | 'purple' | 'brown' | 'black';

interface SubmissionEdge {
  from: string;
  submission: string;
  belt: Belt;
  setup: string;
}

interface Position {
  id: string;
  label: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const POSITIONS: Position[] = [
  { id: 'closed-guard-bottom', label: 'Closed Guard\n(Bottom)' },
  { id: 'open-guard-bottom',   label: 'Open Guard\n(Bottom)'   },
  { id: 'half-guard-bottom',   label: 'Half Guard\n(Bottom)'   },
  { id: 'mount-top',           label: 'Mount\n(Top)'           },
  { id: 'back-mount-top',      label: 'Back Mount\n(Top)'      },
  { id: 'side-control-top',    label: 'Side Control\n(Top)'    },
  { id: 'north-south-top',     label: 'North-South\n(Top)'     },
  { id: 'turtle-top',          label: 'Turtle\n(Top)'          },
  { id: 'top-half-guard',      label: 'Top Half\nGuard'        },
  { id: 'leg-entangle',        label: 'Leg\nEntanglement'      },
];

const SUBMISSION_EDGES: SubmissionEdge[] = [
  { from: 'closed-guard-bottom', submission: 'Triangle Choke',          belt: 'white',  setup: 'arm across + hip out'              },
  { from: 'closed-guard-bottom', submission: 'Armbar',                  belt: 'white',  setup: 'control wrist + hip escape'        },
  { from: 'closed-guard-bottom', submission: 'Guillotine (High Elbow)', belt: 'white',  setup: 'under chin + high elbow'           },
  { from: 'closed-guard-bottom', submission: 'Kimura',                  belt: 'white',  setup: 'figure-four from guard'            },
  { from: 'closed-guard-bottom', submission: 'Cross Collar Choke',      belt: 'white',  setup: 'two cross grips + pull'            },
  { from: 'closed-guard-bottom', submission: 'Omoplata',                belt: 'blue',   setup: 'shin across back + rotate'         },
  { from: 'closed-guard-bottom', submission: 'Gogoplata',               belt: 'purple', setup: 'mission control → instep choke'    },
  { from: 'closed-guard-bottom', submission: 'Buggy Choke',             belt: 'purple', setup: 'underhook + roll to closed guard'  },
  { from: 'open-guard-bottom',   submission: 'Triangle Choke',          belt: 'white',  setup: 'open guard → closed → triangle'    },
  { from: 'open-guard-bottom',   submission: 'Kneebar',                 belt: 'blue',   setup: 'when opponent stands'              },
  { from: 'open-guard-bottom',   submission: 'Toe Hold',                belt: 'blue',   setup: 'figure-four on foot'               },
  { from: 'open-guard-bottom',   submission: 'Loop Choke',              belt: 'purple', setup: 'collar grip loop as they posture'  },
  { from: 'open-guard-bottom',   submission: 'Worm Guard Choke',        belt: 'black',  setup: 'worm guard lapel control'          },
  { from: 'half-guard-bottom',   submission: 'Kimura',                  belt: 'white',  setup: 'underhook roll to kimura'          },
  { from: 'half-guard-bottom',   submission: 'Electric Chair',          belt: 'purple', setup: 'crotch rip from deep half'         },
  { from: 'half-guard-bottom',   submission: 'Banana Split',            belt: 'purple', setup: 'lockdown position'                 },
  { from: 'half-guard-bottom',   submission: 'Twister',                 belt: 'purple', setup: '10th planet lockdown → twister'    },
  { from: 'mount-top',           submission: 'Armbar',                  belt: 'white',  setup: 'high mount + arm isolated'         },
  { from: 'mount-top',           submission: 'Americana',               belt: 'white',  setup: 'low mount + near-side arm'         },
  { from: 'mount-top',           submission: 'Kimura',                  belt: 'white',  setup: 'mount → kimura trap'               },
  { from: 'mount-top',           submission: 'Ezekiel Choke',           belt: 'blue',   setup: 'sleeve grip through collar'        },
  { from: 'mount-top',           submission: 'Cross Collar Choke',      belt: 'white',  setup: 'double lapel grip from mount'      },
  { from: 'mount-top',           submission: 'Mounted Triangle',        belt: 'blue',   setup: 'high mount → triangle from top'    },
  { from: 'back-mount-top',      submission: 'Rear Naked Choke',        belt: 'white',  setup: 'hooks in + blade of arm on neck'   },
  { from: 'back-mount-top',      submission: 'Bow and Arrow Choke',     belt: 'blue',   setup: 'collar grip + leg hook'            },
  { from: 'back-mount-top',      submission: 'Arm-In Guillotine',       belt: 'blue',   setup: 'arm trapped inside choke'          },
  { from: 'back-mount-top',      submission: 'Gift Wrap',               belt: 'white',  setup: 'pin arm across face + control'     },
  { from: 'back-mount-top',      submission: 'Truck Roll',              belt: 'black',  setup: 'back → truck position'             },
  { from: 'side-control-top',    submission: 'Kimura',                  belt: 'white',  setup: 'far-side arm figure-four'          },
  { from: 'side-control-top',    submission: 'Americana',               belt: 'white',  setup: 'near-side arm chicken wing'        },
  { from: 'side-control-top',    submission: 'North-South Choke',       belt: 'blue',   setup: 'slide to north-south → arm under chin' },
  { from: 'side-control-top',    submission: 'D\'Arce Choke',           belt: 'blue',   setup: 'near-side arm trapped → brabo grip' },
  { from: 'side-control-top',    submission: 'Anaconda Choke',          belt: 'blue',   setup: 'underhook side → anaconda roll'    },
  { from: 'side-control-top',    submission: 'Head and Arm Triangle',   belt: 'blue',   setup: 'near-side arm + head trapped'      },
  { from: 'side-control-top',    submission: 'Peruvian Necktie',        belt: 'purple', setup: 'front headlock from turtle'        },
  { from: 'side-control-top',    submission: 'Wristlock',               belt: 'blue',   setup: 'palm down wrist bend'              },
  { from: 'side-control-top',    submission: 'Belly Down Armbar',       belt: 'brown',  setup: 'far arm isolated → step over'      },
  { from: 'north-south-top',     submission: 'North-South Choke',       belt: 'blue',   setup: 'under chin arm slide'              },
  { from: 'north-south-top',     submission: 'Kimura',                  belt: 'white',  setup: 'isolate near arm figure-four'      },
  { from: 'north-south-top',     submission: 'Anaconda Choke',          belt: 'blue',   setup: 'roll to turtle side'               },
  { from: 'north-south-top',     submission: 'Marceloplata',            belt: 'black',  setup: 'north-south → modified omoplata'   },
  { from: 'turtle-top',          submission: 'Clock Choke',             belt: 'blue',   setup: 'collar grip + clock hand pressure' },
  { from: 'turtle-top',          submission: 'D\'Arce Choke',           belt: 'blue',   setup: 'near-arm underhook entry'          },
  { from: 'turtle-top',          submission: 'Bow and Arrow Choke',     belt: 'blue',   setup: 'collar + leg after back take'      },
  { from: 'turtle-top',          submission: 'Japanese Necktie',        belt: 'purple', setup: 'front headlock → necktie'          },
  { from: 'turtle-top',          submission: 'Peruvian Necktie',        belt: 'purple', setup: 'front headlock → circle under'     },
  { from: 'turtle-top',          submission: 'Von Flue Choke',          belt: 'white',  setup: 'after failed guillotine'           },
  { from: 'top-half-guard',      submission: 'D\'Arce Choke',           belt: 'blue',   setup: 'when they give the underhook'      },
  { from: 'top-half-guard',      submission: 'Anaconda Choke',          belt: 'blue',   setup: 'roll over the top'                 },
  { from: 'top-half-guard',      submission: 'Baseball Bat Choke',      belt: 'blue',   setup: 'two collar grips + leverage'       },
  { from: 'top-half-guard',      submission: 'Paper Cutter Choke',      belt: 'blue',   setup: 'collar cross grip + posting arm'   },
  { from: 'top-half-guard',      submission: 'Kimura',                  belt: 'white',  setup: 'underhook half → kimura'           },
  { from: 'top-half-guard',      submission: 'Calf Slicer',             belt: 'blue',   setup: 'shin across calf when they turtle' },
  { from: 'leg-entangle',        submission: 'Straight Ankle Lock',     belt: 'white',  setup: 'basic ashi garami + ankle lock'    },
  { from: 'leg-entangle',        submission: 'Inside Heel Hook',        belt: 'purple', setup: 'inside ashi + heel hook'           },
  { from: 'leg-entangle',        submission: 'Outside Heel Hook',       belt: 'purple', setup: 'outside ashi / 411 + outside hook' },
  { from: 'leg-entangle',        submission: 'Kneebar',                 belt: 'blue',   setup: 'straight line on knee joint'       },
  { from: 'leg-entangle',        submission: 'Toe Hold',                belt: 'blue',   setup: 'figure-four foot + torsion'        },
  { from: 'leg-entangle',        submission: 'Calf Slicer',             belt: 'blue',   setup: 'shin across calf + compression'    },
  { from: 'leg-entangle',        submission: 'Electric Chair',          belt: 'purple', setup: 'crotch rip from deep lockdown'     },
  { from: 'leg-entangle',        submission: 'Suloev Stretch',          belt: 'brown',  setup: 'hip flexor stretch / saddle'       },
  { from: 'leg-entangle',        submission: 'Estima Lock',             belt: 'brown',  setup: 'foot trapped + rotate outward'     },
  { from: 'leg-entangle',        submission: 'Banana Split',            belt: 'purple', setup: 'splits compression'                },
];

// ─── Belt Colors ──────────────────────────────────────────────────────────────

const BELT_COLORS: Record<Belt, { bg: string; border: string; text: string }> = {
  white:  { bg: '#1e1e2a', border: '#6b7280', text: '#d1d5db' },
  blue:   { bg: '#1a2440', border: '#3b82f6', text: '#93c5fd' },
  purple: { bg: '#2a1a40', border: '#a855f7', text: '#d8b4fe' },
  brown:  { bg: '#2a1e10', border: '#d97706', text: '#fcd34d' },
  black:  { bg: '#0a0a12', border: '#6b7280', text: '#9ca3af' },
};

// ─── Layout Constants ─────────────────────────────────────────────────────────

const POSITION_X = 60;
const SUBMISSION_X = 380;
const POSITION_W = 160;
const POSITION_H = 72;
const SUBMISSION_W = 160;
const SUBMISSION_H = 56;
const POSITION_GAP = 130;
const SUBMISSION_GAP = 76;

// ─── Build unique submission list ordered by belt then name ───────────────────

function getUniqueSubmissions(beltFilter: Belt | 'all'): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  const beltOrder: Belt[] = ['white', 'blue', 'purple', 'brown', 'black'];

  for (const belt of beltOrder) {
    for (const edge of SUBMISSION_EDGES) {
      if (edge.belt === belt && !seen.has(edge.submission)) {
        seen.add(edge.submission);
        result.push(edge.submission);
      }
    }
  }

  if (beltFilter === 'all') return result;
  // Only include submissions that have at least one edge for this belt
  return result.filter((sub) =>
    SUBMISSION_EDGES.some((e) => e.submission === sub && e.belt === beltFilter)
  );
}

// ─── Custom Position Node ─────────────────────────────────────────────────────

function PositionNode({ data }: NodeProps) {
  const lines = (data.label as string).split('\n');
  return (
    <div style={{
      width: POSITION_W,
      height: POSITION_H,
      background: '#1e1e2a',
      border: '2px solid #4b5563',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'default',
      boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
    }}>
      {lines.map((line, i) => (
        <div key={i} style={{
          color: '#e8e8ea',
          fontSize: i === 0 ? '13px' : '11px',
          fontWeight: i === 0 ? 700 : 500,
          lineHeight: 1.3,
          textAlign: 'center',
          opacity: i === 0 ? 1 : 0.75,
        }}>
          {line}
        </div>
      ))}
    </div>
  );
}

// ─── Custom Submission Node ───────────────────────────────────────────────────

function SubmissionNode({ data, selected }: NodeProps) {
  const belt = data.belt as Belt;
  const colors = BELT_COLORS[belt];
  const isSelected = selected;

  return (
    <div style={{
      width: SUBMISSION_W,
      height: SUBMISSION_H,
      background: colors.bg,
      border: `2px solid ${isSelected ? '#ffffff' : colors.border}`,
      borderRadius: '10px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      gap: '4px',
      padding: '4px 8px',
      boxSizing: 'border-box',
      boxShadow: isSelected
        ? `0 0 16px ${colors.border}88`
        : `0 2px 8px rgba(0,0,0,0.4)`,
      transition: 'all 0.15s ease',
    }}>
      <div style={{
        color: colors.text,
        fontSize: '11px',
        fontWeight: 700,
        textAlign: 'center',
        lineHeight: 1.3,
      }}>
        {data.label as string}
      </div>
      <div style={{
        width: 6, height: 6, borderRadius: '50%',
        backgroundColor: colors.border,
        boxShadow: `0 0 4px ${colors.border}99`,
        flexShrink: 0,
      }} />
    </div>
  );
}

const nodeTypes = {
  position: PositionNode,
  submission: SubmissionNode,
};

// ─── Build nodes & edges ──────────────────────────────────────────────────────

function buildGraph(beltFilter: Belt | 'all'): { nodes: Node[]; edges: Edge[] } {
  const filteredEdges = beltFilter === 'all'
    ? SUBMISSION_EDGES
    : SUBMISSION_EDGES.filter((e) => e.belt === beltFilter);

  // Which positions are visible (have at least one edge)
  const activePositionIds = new Set(filteredEdges.map((e) => e.from));

  // Which submissions are visible
  const activeSubmissions = new Set(filteredEdges.map((e) => e.submission));

  // All unique submissions in order
  const allSubs = getUniqueSubmissions(beltFilter);

  // Position nodes
  const positionNodes: Node[] = POSITIONS
    .filter((p) => beltFilter === 'all' || activePositionIds.has(p.id))
    .map((p, i) => ({
      id: p.id,
      type: 'position',
      position: { x: POSITION_X, y: 60 + i * POSITION_GAP },
      data: { label: p.label },
      draggable: true,
      selectable: false,
    }));

  // Submission nodes - layout in 2 columns to keep height manageable
  const visibleSubs = allSubs.filter((s) => activeSubmissions.has(s));
  const midIdx = Math.ceil(visibleSubs.length / 2);

  const submissionNodes: Node[] = visibleSubs.map((sub, i) => {
    const col = i < midIdx ? 0 : 1;
    const row = i < midIdx ? i : i - midIdx;
    const belt = filteredEdges.find((e) => e.submission === sub)?.belt ?? 'white';

    return {
      id: `sub-${sub}`,
      type: 'submission',
      position: {
        x: SUBMISSION_X + col * (SUBMISSION_W + 24),
        y: 40 + row * SUBMISSION_GAP,
      },
      data: {
        label: sub,
        belt,
        submissionName: sub,
      },
      draggable: true,
      selectable: true,
    };
  });

  // Edges
  const edges: Edge[] = filteredEdges.map((e, i) => {
    const belt = e.belt;
    const colors = BELT_COLORS[belt];
    return {
      id: `edge-${e.from}-${e.submission}-${i}`,
      source: e.from,
      target: `sub-${e.submission}`,
      type: 'smoothstep',
      animated: false,
      label: e.setup,
      style: {
        stroke: colors.border,
        strokeWidth: 1.5,
        opacity: 0.6,
      },
      labelStyle: { fill: '#6b7280', fontSize: 9 },
      labelBgStyle: { fill: 'rgba(9,9,13,0.85)' },
      labelBgPadding: [3, 4] as [number, number],
      labelBgBorderRadius: 3,
    };
  });

  return { nodes: [...positionNodes, ...submissionNodes], edges };
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

const BELT_FILTERS: Array<{ key: Belt | 'all'; label: string; color: string }> = [
  { key: 'all',    label: 'All',    color: '#9ca3af' },
  { key: 'white',  label: '🤍 White',  color: '#e5e7eb' },
  { key: 'blue',   label: '💙 Blue',   color: '#3b82f6' },
  { key: 'purple', label: '💜 Purple', color: '#a855f7' },
  { key: 'brown',  label: '🤎 Brown',  color: '#d97706' },
  { key: 'black',  label: '🖤 Black',  color: '#6b7280' },
];

// ─── Main Component ───────────────────────────────────────────────────────────

interface SubmissionMapProps {
  openVideo: (query: string) => void;
}

function SubmissionMapInner({ openVideo }: SubmissionMapProps) {
  const [beltFilter, setBeltFilter] = useState<Belt | 'all'>('all');

  const { nodes, edges } = useMemo(() => buildGraph(beltFilter), [beltFilter]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === 'submission' && node.data?.submissionName) {
      openVideo(node.data.submissionName as string);
    }
  }, [openVideo]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#09090d' }}>
      {/* Filter Bar */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '8px 12px',
        overflowX: 'auto',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
        WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'],
      }}>
        {BELT_FILTERS.map((f) => {
          const isActive = beltFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setBeltFilter(f.key)}
              style={{
                flexShrink: 0,
                padding: '5px 10px',
                fontSize: '11px',
                fontWeight: isActive ? 700 : 500,
                fontFamily: 'inherit',
                cursor: 'pointer',
                border: `1px solid ${isActive ? f.color : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '20px',
                backgroundColor: isActive ? `${f.color}22` : 'transparent',
                color: isActive ? f.color : '#9ca3af',
                transition: 'all 0.15s ease',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {f.label}
            </button>
          );
        })}
        <div style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          marginLeft: 'auto',
          fontSize: '10px',
          color: '#4b5563',
          whiteSpace: 'nowrap',
        }}>
          Tap submission to watch →
        </div>
      </div>

      {/* React Flow Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.2}
          maxZoom={2.5}
          defaultEdgeOptions={{ type: 'smoothstep' }}
          proOptions={{ hideAttribution: true }}
          style={{ background: '#09090d' }}
        >
          <Background color="#1e1e2a" gap={24} size={1} />
          <Controls
            style={{
              backgroundColor: '#1c1c24',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
            }}
          />
        </ReactFlow>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: '12px',
        padding: '6px 12px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        flexWrap: 'wrap',
        flexShrink: 0,
        alignItems: 'center',
      }}>
        <span style={{ fontSize: '10px', color: '#4b5563', fontWeight: 600 }}>DIFFICULTY:</span>
        {(['white', 'blue', 'purple', 'brown', 'black'] as Belt[]).map((b) => (
          <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              backgroundColor: BELT_COLORS[b].border,
              boxShadow: `0 0 4px ${BELT_COLORS[b].border}88`,
            }} />
            <span style={{ fontSize: '10px', color: '#6b7280', textTransform: 'capitalize' }}>{b}</span>
          </div>
        ))}
        <div style={{
          marginLeft: 'auto',
          fontSize: '10px',
          color: '#374151',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <div style={{
            width: 18, height: 10,
            background: '#1e1e2a',
            border: '1px solid #4b5563',
            borderRadius: '3px',
          }} />
          <span>position</span>
          <div style={{
            width: 18, height: 10,
            background: '#1a2440',
            border: '1px solid #3b82f6',
            borderRadius: '3px',
            marginLeft: '6px',
          }} />
          <span>submission</span>
        </div>
      </div>
    </div>
  );
}

export default function SubmissionMap({ openVideo }: SubmissionMapProps) {
  return (
    <ReactFlowProvider>
      <SubmissionMapInner openVideo={openVideo} />
    </ReactFlowProvider>
  );
}
