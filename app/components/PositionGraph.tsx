'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';

// ─── Types ────────────────────────────────────────────────────────────────────

type Belt = 'white' | 'blue' | 'purple' | 'brown' | 'black';

interface PositionDef {
  id: string;
  label: string;
}

interface SubmissionEdgeDef {
  from: string;
  submission: string;
  belt: Belt;
  setup: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const POSITIONS: PositionDef[] = [
  { id: 'closed-guard-bottom', label: 'Closed Guard (Bottom)' },
  { id: 'open-guard-bottom',   label: 'Open Guard (Bottom)'   },
  { id: 'half-guard-bottom',   label: 'Half Guard (Bottom)'   },
  { id: 'mount-top',           label: 'Mount (Top)'           },
  { id: 'back-mount-top',      label: 'Back Mount (Top)'      },
  { id: 'side-control-top',    label: 'Side Control (Top)'    },
  { id: 'north-south-top',     label: 'North-South (Top)'     },
  { id: 'turtle-top',          label: 'Turtle (Top)'          },
  { id: 'top-half-guard',      label: 'Top Half Guard'        },
  { id: 'leg-entangle',        label: 'Leg Entanglement'      },
];

const SUBMISSION_EDGES: SubmissionEdgeDef[] = [
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
  { from: 'side-control-top',    submission: "D'Arce Choke",            belt: 'blue',   setup: 'near-side arm trapped → brabo grip' },
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
  { from: 'turtle-top',          submission: "D'Arce Choke",            belt: 'blue',   setup: 'near-arm underhook entry'          },
  { from: 'turtle-top',          submission: 'Bow and Arrow Choke',     belt: 'blue',   setup: 'collar + leg after back take'      },
  { from: 'turtle-top',          submission: 'Japanese Necktie',        belt: 'purple', setup: 'front headlock → necktie'          },
  { from: 'turtle-top',          submission: 'Peruvian Necktie',        belt: 'purple', setup: 'front headlock → circle under'     },
  { from: 'turtle-top',          submission: 'Von Flue Choke',          belt: 'white',  setup: 'after failed guillotine'           },
  { from: 'top-half-guard',      submission: "D'Arce Choke",            belt: 'blue',   setup: 'when they give the underhook'      },
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

const BELT_COLORS: Record<Belt, { bg: string; border: string; text: string; glow: string }> = {
  white:  { bg: '#1c1c28', border: '#9ca3af', text: '#d1d5db', glow: 'rgba(156,163,175,0.3)' },
  blue:   { bg: '#111d36', border: '#3b82f6', text: '#93c5fd', glow: 'rgba(59,130,246,0.35)'  },
  purple: { bg: '#1d1030', border: '#7c3aed', text: '#c4b5fd', glow: 'rgba(124,58,237,0.35)'  },
  brown:  { bg: '#231500', border: '#d97706', text: '#fbbf24', glow: 'rgba(217,119,6,0.35)'   },
  black:  { bg: '#0a0a0a', border: '#4b5563', text: '#9ca3af', glow: 'rgba(75,85,99,0.3)'     },
};

const BELT_ORDER: Belt[] = ['white', 'blue', 'purple', 'brown', 'black'];

// ─── Node Dimensions ──────────────────────────────────────────────────────────

const POS_W = 170;
const POS_H = 60;
const SUB_W = 152;
const SUB_H = 48;

// ─── Dagre Layout ─────────────────────────────────────────────────────────────

function applyDagreLayout(
  nodes: Node[],
  edges: Edge[],
): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: 'LR',
    nodesep: 28,
    ranksep: 90,
    edgesep: 12,
  });

  for (const node of nodes) {
    const w = node.type === 'position' ? POS_W : SUB_W;
    const h = node.type === 'position' ? POS_H : SUB_H;
    g.setNode(node.id, { width: w, height: h });
  }
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  return nodes.map((node) => {
    const n = g.node(node.id);
    if (!n) return node;
    const w = node.type === 'position' ? POS_W : SUB_W;
    const h = node.type === 'position' ? POS_H : SUB_H;
    return {
      ...node,
      position: {
        x: n.x - w / 2,
        y: n.y - h / 2,
      },
    };
  });
}

// ─── Custom Nodes ─────────────────────────────────────────────────────────────

function PositionNode({ data }: NodeProps) {
  const isSelected = !!(data.selectedPosition)
    ? data.selectedPosition === data.positionId
    : false;

  return (
    <>
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      <div
        style={{
          width: POS_W,
          height: POS_H,
          background: isSelected
            ? 'linear-gradient(135deg, #1e3a5f 0%, #1a3050 100%)'
            : 'linear-gradient(135deg, #16253a 0%, #111e2e 100%)',
          border: `2px solid ${isSelected ? '#3b82f6' : '#2a4a6b'}`,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: '8px 12px',
          boxSizing: 'border-box',
          boxShadow: isSelected
            ? '0 0 20px rgba(59,130,246,0.4), 0 4px 16px rgba(0,0,0,0.6)'
            : '0 2px 10px rgba(0,0,0,0.5)',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{
          color: isSelected ? '#93c5fd' : '#c8d6e8',
          fontSize: '12px',
          fontWeight: 700,
          textAlign: 'center',
          lineHeight: 1.3,
        }}>
          {data.label as string}
        </div>
      </div>
    </>
  );
}

function SubmissionNode({ data }: NodeProps) {
  const belt = data.belt as Belt;
  const colors = BELT_COLORS[belt];
  const dimmed = data.dimmed as boolean;

  return (
    <>
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <div
        style={{
          width: SUB_W,
          height: SUB_H,
          background: colors.bg,
          border: `1.5px solid ${dimmed ? 'rgba(255,255,255,0.06)' : colors.border}`,
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: '4px 10px',
          boxSizing: 'border-box',
          boxShadow: dimmed ? 'none' : `0 0 8px ${colors.glow}, 0 2px 8px rgba(0,0,0,0.4)`,
          opacity: dimmed ? 0.25 : 1,
          transition: 'all 0.2s ease',
          gap: '3px',
        }}
      >
        <div style={{
          color: dimmed ? '#4b5563' : colors.text,
          fontSize: '10px',
          fontWeight: 700,
          textAlign: 'center',
          lineHeight: 1.25,
          transition: 'color 0.2s ease',
        }}>
          {data.label as string}
        </div>
        <div style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          backgroundColor: dimmed ? '#374151' : colors.border,
          boxShadow: dimmed ? 'none' : `0 0 4px ${colors.border}`,
          transition: 'all 0.2s ease',
        }} />
      </div>
    </>
  );
}

const nodeTypes = {
  position: PositionNode as React.ComponentType<NodeProps>,
  submission: SubmissionNode as React.ComponentType<NodeProps>,
};

// ─── Belt Filters ─────────────────────────────────────────────────────────────

type BeltFilter = Belt | 'all';

const BELT_FILTER_OPTIONS: Array<{ key: BeltFilter; label: string; color: string }> = [
  { key: 'all',    label: 'All',       color: '#9ca3af' },
  { key: 'white',  label: '🤍 White',  color: '#d1d5db' },
  { key: 'blue',   label: '💙 Blue',   color: '#3b82f6' },
  { key: 'purple', label: '💜 Purple', color: '#7c3aed' },
  { key: 'brown',  label: '🤎 Brown',  color: '#d97706' },
  { key: 'black',  label: '🖤 Black',  color: '#4b5563' },
];

// ─── Graph Builder ────────────────────────────────────────────────────────────

function buildGraph(
  beltFilter: BeltFilter,
  selectedPosition: string | null,
): { nodes: Node[]; edges: Edge[] } {
  const beltIdx: Record<Belt, number> = { white: 0, blue: 1, purple: 2, brown: 3, black: 4 };
  const filterIdx = beltFilter === 'all' ? 4 : beltIdx[beltFilter];

  // Filter edges by belt level (hide techniques harder than selected belt)
  const filtered = SUBMISSION_EDGES.filter(
    (e) => beltFilter === 'all' || beltIdx[e.belt] <= filterIdx
  );

  // Active positions
  const activePosIds = new Set(filtered.map((e) => e.from));

  // Unique submissions after filtering
  const subSet = new Set<string>();
  const subBelt: Record<string, Belt> = {};
  // Order by belt level then alpha
  for (const b of BELT_ORDER) {
    for (const e of filtered) {
      if (e.belt === b && !subSet.has(e.submission)) {
        subSet.add(e.submission);
        subBelt[e.submission] = b;
      }
    }
  }

  // Which submissions are connected to the selected position
  const selectedSubs = selectedPosition
    ? new Set(filtered.filter((e) => e.from === selectedPosition).map((e) => e.submission))
    : null;

  // Position nodes
  const rawPosNodes: Node[] = POSITIONS
    .filter((p) => activePosIds.has(p.id))
    .map((p) => ({
      id: p.id,
      type: 'position',
      position: { x: 0, y: 0 },
      data: {
        label: p.label,
        positionId: p.id,
        selectedPosition: selectedPosition ?? '',
      },
      draggable: false,
      selectable: false,
    }));

  // Submission nodes
  const subs = Array.from(subSet);
  const rawSubNodes: Node[] = subs.map((sub) => ({
    id: `sub-${sub}`,
    type: 'submission',
    position: { x: 0, y: 0 },
    data: {
      label: sub,
      belt: subBelt[sub],
      submissionName: sub,
      dimmed: selectedSubs !== null && !selectedSubs.has(sub),
    },
    draggable: false,
    selectable: false,
  }));

  // Edges
  const edges: Edge[] = filtered.map((e, i) => {
    const belt = e.belt;
    const colors = BELT_COLORS[belt];
    const isHighlighted = selectedSubs?.has(e.submission) && e.from === selectedPosition;
    const isDimmed = selectedSubs !== null && !selectedSubs.has(e.submission);

    return {
      id: `edge-${e.from}-${e.submission}-${i}`,
      source: e.from,
      target: `sub-${e.submission}`,
      type: 'smoothstep',
      animated: isHighlighted ?? false,
      style: {
        stroke: isDimmed ? 'rgba(255,255,255,0.04)' : (isHighlighted ? colors.border : `${colors.border}66`),
        strokeWidth: isHighlighted ? 2 : 1,
        transition: 'all 0.2s ease',
      },
    };
  });

  const allNodes = [...rawPosNodes, ...rawSubNodes];
  const laid = applyDagreLayout(allNodes, edges);

  return { nodes: laid, edges };
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function Legend() {
  return (
    <div style={{
      display: 'flex',
      gap: '10px',
      padding: '6px 12px',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      flexWrap: 'wrap',
      alignItems: 'center',
      flexShrink: 0,
      backgroundColor: '#09090d',
    }}>
      <span style={{ fontSize: '10px', color: '#4b5563', fontWeight: 700, letterSpacing: '0.5px' }}>
        BELT:
      </span>
      {BELT_ORDER.map((b) => (
        <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            backgroundColor: BELT_COLORS[b].border,
            boxShadow: `0 0 4px ${BELT_COLORS[b].glow}`,
          }} />
          <span style={{ fontSize: '10px', color: '#6b7280', textTransform: 'capitalize' }}>{b}</span>
        </div>
      ))}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{
            width: 22, height: 12,
            background: 'linear-gradient(135deg, #16253a 0%, #111e2e 100%)',
            border: '1.5px solid #2a4a6b',
            borderRadius: '4px',
          }} />
          <span style={{ fontSize: '10px', color: '#4b5563' }}>position</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{
            width: 22, height: 12,
            background: '#111d36',
            border: '1.5px solid #3b82f6',
            borderRadius: '6px',
          }} />
          <span style={{ fontSize: '10px', color: '#4b5563' }}>submission</span>
        </div>
      </div>
    </div>
  );
}

// ─── Inner Component ──────────────────────────────────────────────────────────

interface PositionGraphProps {
  openVideo: (query: string) => void;
}

function PositionGraphInner({ openVideo }: PositionGraphProps) {
  const [beltFilter, setBeltFilter] = useState<BeltFilter>('all');
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  const { nodes, edges } = useMemo(
    () => buildGraph(beltFilter, selectedPosition),
    [beltFilter, selectedPosition],
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.type === 'position') {
        const pid = node.data.positionId as string;
        setSelectedPosition((prev) => (prev === pid ? null : pid));
      } else if (node.type === 'submission' && node.data?.submissionName) {
        openVideo(node.data.submissionName as string);
      }
    },
    [openVideo],
  );

  const onPaneClick = useCallback(() => {
    setSelectedPosition(null);
  }, []);

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
        alignItems: 'center',
      }}>
        {BELT_FILTER_OPTIONS.map((f) => {
          const isActive = beltFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => {
                setBeltFilter(f.key);
                setSelectedPosition(null);
              }}
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
        {selectedPosition && (
          <button
            onClick={() => setSelectedPosition(null)}
            style={{
              flexShrink: 0,
              marginLeft: 4,
              padding: '5px 10px',
              fontSize: '11px',
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
              border: '1px solid rgba(59,130,246,0.4)',
              borderRadius: '20px',
              backgroundColor: 'rgba(59,130,246,0.12)',
              color: '#93c5fd',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            ✕ clear
          </button>
        )}
        <div style={{
          flexShrink: 0,
          marginLeft: 'auto',
          fontSize: '10px',
          color: '#374151',
          whiteSpace: 'nowrap',
        }}>
          {selectedPosition
            ? '→ tap submission to watch'
            : 'tap position to filter'}
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          fitView
          fitViewOptions={{ padding: 0.12, duration: 400 }}
          minZoom={0.15}
          maxZoom={3}
          proOptions={{ hideAttribution: true }}
          style={{ background: '#09090d' }}
          panOnScroll={false}
          zoomOnScroll={true}
          panOnDrag={true}
          elementsSelectable={false}
        >
          <Background color="#161620" gap={28} size={1} />
          <Controls
            showInteractive={false}
            style={{
              backgroundColor: '#1c1c24',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
            }}
          />
        </ReactFlow>
      </div>

      <Legend />
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function PositionGraph({ openVideo }: PositionGraphProps) {
  return (
    <ReactFlowProvider>
      <PositionGraphInner openVideo={openVideo} />
    </ReactFlowProvider>
  );
}
