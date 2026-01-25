import React from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

interface Observation {
  id: string;
  input?: any;
  output?: any;
  timestamp?: string | number;
}

interface TraceObservationStepperProps {
  observations: Observation[];
}


const renderJsonOrString = (data: any, maxHeight = 240) => {
  let parsed = data;
  if (typeof data === "string") {
    try {
      parsed = JSON.parse(data);
    } catch {
      // keep as string
    }
  }
  if (typeof parsed === "object") {
    return (
      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 13, maxHeight, overflow: "auto", margin: 0 }}>
        {JSON.stringify(parsed, null, 2)}
      </pre>
    );
  }
  return (
    <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 13, maxHeight, overflow: "auto", margin: 0 }}>
      {String(parsed).replace(/\\n/g, "\n")}
    </pre>
  );
};

// Helper to check if input is a message array format
const isMessageArray = (input: any) => {
  if (!input) return false;
  let obj = input;
  if (typeof input === 'string') {
    try {
      obj = JSON.parse(input);
    } catch {
      return false;
    }
  }
  return (
    obj &&
    typeof obj === 'object' &&
    Array.isArray(obj.messages) &&
    obj.messages.every((m: any) => m.role && m.content)
  );
};

// Message viewer for input with collapsible blocks
const MessageViewer = ({
  input,
  expanded,
  onToggle
}: {
  input: any;
  expanded: boolean[];
  onToggle: (idx: number) => void;
}) => {
  let obj = input;
  if (typeof input === 'string') {
    try {
      obj = JSON.parse(input);
    } catch {
      return renderJsonOrString(input);
    }
  }
  if (!obj || !Array.isArray(obj.messages)) return renderJsonOrString(input);
  return (
    <div
      style={{
        maxHeight: 256,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        background: '#fff',
        padding: 4
      }}
    >
      {obj.messages.map((msg: any, idx: number) => (
        <div
          key={idx}
          style={{
            background: '#f5f5f5',
            borderRadius: 6,
            borderLeft: `4px solid ${msg.role === 'user' ? '#1976d2' : '#43a047'}`
          }}
        >
          <div
            style={{
              fontWeight: 600,
              color: msg.role === 'user' ? '#1976d2' : '#43a047',
              marginBottom: 4,
              cursor: 'pointer',
              padding: 8,
              display: 'flex',
              alignItems: 'center',
              userSelect: 'none'
            }}
            onClick={() => onToggle(idx)}
          >
            <span style={{ marginRight: 8 }}>{expanded[idx] ? '▼' : '▶'}</span>
            {msg.role}
          </div>
          {expanded[idx] && (
            <div
              style={{
                whiteSpace: 'pre-wrap',
                fontSize: 13,
                padding: 8,
                borderTop: '1px solid #e0e0e0'
              }}
            >
              {String(msg.content).replace(/\\n/g, '\n')}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const TraceObservationStepper: React.FC<TraceObservationStepperProps> = ({ observations }) => {
  const [selectedIdx, setSelectedIdx] = React.useState<number | null>(null);
  // Filter to only those with input or output, then sort by timestamp ascending (oldest first)
  const filtered = observations.filter(obs => obs.input || obs.output);
  const sorted = [...filtered].sort((a, b) => {
    if (!a.timestamp || !b.timestamp) return 0;
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  return (
    <div style={{ display: "flex", alignItems: "center", overflowX: "auto", padding: 24 }}>
      {sorted.map((obs, idx) => (
        <React.Fragment key={obs.id || idx}>
          <div
            style={{
              minWidth: 120,
              minHeight: 80,
              background: "#f5f5f5",
              border: "2px solid #1976d2",
              borderRadius: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 16,
              position: "relative",
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              cursor: "pointer",
              transition: "box-shadow 0.2s",
              borderColor: selectedIdx === idx ? "#1565c0" : "#1976d2"
            }}
            onClick={() => setSelectedIdx(idx)}
          >
            <div style={{ fontWeight: 600, color: "#1976d2", fontSize: 16 }}>Obs {idx + 1}</div>
            {obs.timestamp && (
              <div style={{ fontSize: 12, color: "#555", marginTop: 8 }}>{new Date(obs.timestamp).toLocaleString()}</div>
            )}
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
              {obs.input ? "Input" : ""}
              {obs.input && obs.output ? " / " : ""}
              {obs.output ? "Output" : ""}
            </div>
          </div>
          {idx < sorted.length - 1 && (
            <div style={{ display: "flex", alignItems: "center", marginRight: 16 }}>
              <svg width="32" height="24" style={{ display: "block" }}>
                <line x1="0" y1="12" x2="28" y2="12" stroke="#1976d2" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <defs>
                  <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L6,3 Z" fill="#1976d2" />
                  </marker>
                </defs>
              </svg>
            </div>
          )}
        </React.Fragment>
      ))}
      <ObservationDialog
        open={selectedIdx !== null}
        onClose={() => setSelectedIdx(null)}
        observation={selectedIdx !== null ? sorted[selectedIdx] : null}
      />
    </div>
  );
};

const ObservationDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  observation: Observation | null;
}> = ({ open, onClose, observation }) => {
  const [showMessageView, setShowMessageView] = React.useState(true);
  const [expanded, setExpanded] = React.useState<boolean[]>([]);

  React.useEffect(() => {
    // Reset view and expanded state when dialog opens or observation changes
    if (observation) {
      let obj = observation.input;
      if (isMessageArray(obj)) {
        if (typeof obj === 'string') {
          try {
            obj = JSON.parse(obj);
          } catch {
            obj = null;
          }
        }
        if (obj && Array.isArray(obj.messages)) {
          setExpanded(obj.messages.map(() => false));
        }
        setShowMessageView(true);
      } else {
        setShowMessageView(false);
        setExpanded([]);
      }
    }
  }, [observation]);

  if (!observation) return null;
  const hasMessageView = isMessageArray(observation.input);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Observation Detail</DialogTitle>
      <DialogContent>
        {observation.input && (
          <div style={{ marginBottom: 16 }}>
            <b>Input:</b>
            {hasMessageView && (
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <Button
                  size="small"
                  variant={showMessageView ? 'contained' : 'outlined'}
                  sx={{ mr: 1 }}
                  onClick={() => setShowMessageView(true)}
                >
                  Message View
                </Button>
                <Button
                  size="small"
                  variant={!showMessageView ? 'contained' : 'outlined'}
                  onClick={() => setShowMessageView(false)}
                >
                  JSON View
                </Button>
              </div>
            )}
            <div style={{ background: "#f5f5f5", borderRadius: 6, padding: 8, marginTop: 4, maxHeight: 240, overflow: "auto" }}>
              {hasMessageView && showMessageView ? (
                <MessageViewer
                  input={observation.input}
                  expanded={expanded}
                  onToggle={idx => setExpanded(prev => prev.map((v, i) => (i === idx ? !v : v)))}
                />
              ) : (
                renderJsonOrString(observation.input)
              )}
            </div>
          </div>
        )}
        {observation.output && (
          <div style={{ marginBottom: 8 }}>
            <b>Output:</b>
            <div style={{ background: "#f5f5f5", borderRadius: 6, padding: 8, marginTop: 4, maxHeight: 240, overflow: "auto" }}>
              {renderJsonOrString(observation.output)}
            </div>
          </div>
        )}
        {observation.timestamp && (
          <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
            {new Date(observation.timestamp).toLocaleString()}
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TraceObservationStepper;