import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Terminal as TerminalIcon, X, Minus, Maximize2 } from 'lucide-react';

interface TerminalModalProps {
  open: boolean;
  onClose: () => void;
}

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MIN_WIDTH = 420;
const MIN_HEIGHT = 260;

type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getInitialBox(): Box {
  const width = clamp(Math.round(window.innerWidth * 0.6), MIN_WIDTH, window.innerWidth - 40);
  const height = clamp(Math.round(window.innerHeight * 0.55), MIN_HEIGHT, window.innerHeight - 40);
  return {
    width,
    height,
    x: Math.round((window.innerWidth - width) / 2),
    y: Math.round((window.innerHeight - height) / 2),
  };
}

export function TerminalModal({ open, onClose }: TerminalModalProps) {
  const [box, setBox] = useState<Box>(getInitialBox);
  const [maximized, setMaximized] = useState(false);
  const preMaxBox = useRef<Box | null>(null);

  // Drag / resize interaction state kept in a ref so listeners stay stable.
  const interaction = useRef<
    | { type: 'drag'; startX: number; startY: number; origin: Box }
    | { type: 'resize'; dir: ResizeDir; startX: number; startY: number; origin: Box }
    | null
  >(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const onPointerMove = useCallback((e: PointerEvent) => {
    const act = interaction.current;
    if (!act) return;
    const dx = e.clientX - act.startX;
    const dy = e.clientY - act.startY;

    if (act.type === 'drag') {
      const maxX = window.innerWidth - act.origin.width;
      const maxY = window.innerHeight - act.origin.height;
      setBox({
        ...act.origin,
        x: clamp(act.origin.x + dx, 0, Math.max(0, maxX)),
        y: clamp(act.origin.y + dy, 0, Math.max(0, maxY)),
      });
      return;
    }

    // resize
    const o = act.origin;
    let { x, y, width, height } = o;
    const dir = act.dir;

    if (dir.includes('e')) {
      width = clamp(o.width + dx, MIN_WIDTH, window.innerWidth - o.x);
    }
    if (dir.includes('s')) {
      height = clamp(o.height + dy, MIN_HEIGHT, window.innerHeight - o.y);
    }
    if (dir.includes('w')) {
      const proposed = clamp(o.width - dx, MIN_WIDTH, o.x + o.width);
      x = o.x + (o.width - proposed);
      width = proposed;
    }
    if (dir.includes('n')) {
      const proposed = clamp(o.height - dy, MIN_HEIGHT, o.y + o.height);
      y = o.y + (o.height - proposed);
      height = proposed;
    }
    setBox({ x, y, width, height });
  }, []);

  const endInteraction = useCallback(() => {
    interaction.current = null;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', endInteraction);
    document.body.style.userSelect = '';
  }, [onPointerMove]);

  const beginDrag = useCallback(
    (e: React.PointerEvent) => {
      if (maximized) return;
      e.preventDefault();
      interaction.current = { type: 'drag', startX: e.clientX, startY: e.clientY, origin: box };
      document.body.style.userSelect = 'none';
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', endInteraction);
    },
    [box, maximized, onPointerMove, endInteraction]
  );

  const beginResize = useCallback(
    (dir: ResizeDir) => (e: React.PointerEvent) => {
      if (maximized) return;
      e.preventDefault();
      e.stopPropagation();
      interaction.current = { type: 'resize', dir, startX: e.clientX, startY: e.clientY, origin: box };
      document.body.style.userSelect = 'none';
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', endInteraction);
    },
    [box, maximized, onPointerMove, endInteraction]
  );

  const toggleMaximize = useCallback(() => {
    setMaximized((m) => {
      if (!m) {
        preMaxBox.current = box;
        return true;
      }
      if (preMaxBox.current) setBox(preMaxBox.current);
      return false;
    });
  }, [box]);

  useEffect(() => () => endInteraction(), [endInteraction]);

  // Force-stop any active drag/resize when the modal is closed mid-interaction.
  useEffect(() => {
    if (!open) endInteraction();
  }, [open, endInteraction]);

  if (!open) return null;

  const style: React.CSSProperties = maximized
    ? { top: 12, left: 12, right: 12, bottom: 12, width: 'auto', height: 'auto' }
    : { top: box.y, left: box.x, width: box.width, height: box.height };

  const handles: { dir: ResizeDir; className: string }[] = [
    { dir: 'n', className: 'top-0 left-2 right-2 h-1.5 cursor-ns-resize' },
    { dir: 's', className: 'bottom-0 left-2 right-2 h-1.5 cursor-ns-resize' },
    { dir: 'e', className: 'top-2 bottom-2 right-0 w-1.5 cursor-ew-resize' },
    { dir: 'w', className: 'top-2 bottom-2 left-0 w-1.5 cursor-ew-resize' },
    { dir: 'ne', className: 'top-0 right-0 w-3 h-3 cursor-nesw-resize' },
    { dir: 'nw', className: 'top-0 left-0 w-3 h-3 cursor-nwse-resize' },
    { dir: 'se', className: 'bottom-0 right-0 w-3 h-3 cursor-nwse-resize' },
    { dir: 'sw', className: 'bottom-0 left-0 w-3 h-3 cursor-nesw-resize' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Terminal"
      className="fixed z-[100] flex flex-col overflow-hidden rounded-xl border border-[rgba(0,229,195,0.25)] bg-[rgba(8,12,16,0.82)] shadow-[0_20px_60px_rgba(0,0,0,0.55),0_0_30px_rgba(0,229,195,0.12)] backdrop-blur-2xl"
      style={style}
    >
      {/* Title bar */}
      <div
        onPointerDown={beginDrag}
        onDoubleClick={toggleMaximize}
        className={`flex items-center justify-between gap-2 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(0,229,195,0.04)] px-3 py-2 ${
          maximized ? '' : 'cursor-move'
        }`}
      >
        <div className="flex items-center gap-2 text-[#00e5c3]">
          <TerminalIcon size={14} />
          <span className="font-mono text-xs tracking-wider text-[rgba(255,255,255,0.75)]">terminal</span>
        </div>
        <div className="flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
          <button
            onClick={toggleMaximize}
            data-testid="button-terminal-maximize"
            title={maximized ? 'Restore' : 'Maximize'}
            className="rounded p-1 text-[rgba(255,255,255,0.5)] transition-colors hover:bg-[rgba(255,255,255,0.08)] hover:text-[#00e5c3]"
          >
            {maximized ? <Minus size={13} /> : <Maximize2 size={13} />}
          </button>
          <button
            onClick={onClose}
            data-testid="button-terminal-close"
            title="Close"
            className="rounded p-1 text-[rgba(255,255,255,0.5)] transition-colors hover:bg-[rgba(248,113,113,0.15)] hover:text-red-400"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Terminal mount slot — OOTB SSH terminal component goes here */}
      <div className="relative flex-1 overflow-hidden bg-[rgba(2,4,6,0.6)]">
        <div
          data-testid="terminal-mount"
          className="flex h-full w-full items-center justify-center p-6 font-mono text-xs text-[rgba(255,255,255,0.4)]"
        >
          <div className="text-center">
            <TerminalIcon size={28} className="mx-auto mb-3 text-[rgba(0,229,195,0.5)]" />
            <p className="text-[rgba(255,255,255,0.55)]">Terminal ready</p>
            <p className="mt-1 text-[10px] text-[rgba(255,255,255,0.3)]">
              SSH terminal component mounts here
            </p>
          </div>
        </div>
      </div>

      {/* Resize handles */}
      {!maximized &&
        handles.map((h) => (
          <div
            key={h.dir}
            onPointerDown={beginResize(h.dir)}
            className={`absolute z-10 ${h.className}`}
          />
        ))}
    </div>
  );
}
