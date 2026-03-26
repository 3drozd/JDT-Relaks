"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface SelectedElement {
  el: HTMLElement;
  tag: string;
  classes: string;
  path: string;
}

interface EditableProps {
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  width: string;
  height: string;
  fontSize: number;
  gap: number;
}

interface ChangeEntry {
  selector: string;
  path: string;
  prop: string;
  cssProp: string;
  from: number;
  to: number;
}

function parsePixelValue(val: string): number {
  return parseFloat(val) || 0;
}

function getEditableProps(el: HTMLElement): EditableProps {
  const cs = getComputedStyle(el);
  return {
    marginTop: parsePixelValue(cs.marginTop),
    marginBottom: parsePixelValue(cs.marginBottom),
    marginLeft: parsePixelValue(cs.marginLeft),
    marginRight: parsePixelValue(cs.marginRight),
    paddingTop: parsePixelValue(cs.paddingTop),
    paddingBottom: parsePixelValue(cs.paddingBottom),
    paddingLeft: parsePixelValue(cs.paddingLeft),
    paddingRight: parsePixelValue(cs.paddingRight),
    width: cs.width,
    height: cs.height,
    fontSize: parsePixelValue(cs.fontSize),
    gap: parsePixelValue(cs.gap),
  };
}

function pxToTailwind(px: number): string {
  const rem = px / 16;
  const twMap: Record<number, string> = {
    0: "0", 0.25: "1", 0.5: "2", 0.75: "3", 1: "4", 1.25: "5", 1.5: "6",
    1.75: "7", 2: "8", 2.25: "9", 2.5: "10", 2.75: "11", 3: "12", 3.5: "14",
    4: "16", 5: "20", 6: "24", 7: "28", 8: "32", 9: "36", 10: "40",
    11: "44", 12: "48", 13: "52", 14: "56", 15: "60", 16: "64",
  };
  return twMap[rem] !== undefined ? twMap[rem] : `[${px}px]`;
}

const cssMap: Record<string, string> = {
  marginTop: "margin-top",
  marginBottom: "margin-bottom",
  marginLeft: "margin-left",
  marginRight: "margin-right",
  paddingTop: "padding-top",
  paddingBottom: "padding-bottom",
  paddingLeft: "padding-left",
  paddingRight: "padding-right",
  fontSize: "font-size",
  gap: "gap",
};

const twPrefixMap: Record<string, string> = {
  marginTop: "mt", marginBottom: "mb", marginLeft: "ml", marginRight: "mr",
  paddingTop: "pt", paddingBottom: "pb", paddingLeft: "pl", paddingRight: "pr",
  fontSize: "text", gap: "gap",
};

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setEditValue(String(Math.round(value * 100) / 100));
    setEditing(true);
  };

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commitEdit = () => {
    setEditing(false);
    const parsed = parseFloat(editValue);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#aaa", marginBottom: 1 }}>
        <span>{label}</span>
        {editing ? (
          <input
            ref={inputRef}
            data-dev-panel
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEdit();
              if (e.key === "Escape") setEditing(false);
            }}
            style={{
              width: 50,
              fontSize: 10,
              color: "#4fc3f7",
              background: "#333",
              border: "1px solid #4fc3f7",
              borderRadius: 2,
              padding: "0 3px",
              textAlign: "right",
              outline: "none",
              fontFamily: "monospace",
            }}
          />
        ) : (
          <span
            onClick={startEdit}
            style={{ color: "#4fc3f7", cursor: "text", borderBottom: "1px dashed #4fc3f755" }}
            title="Kliknij aby edytować"
          >
            {Math.round(value * 100) / 100}{unit}
          </span>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: "#4fc3f7", height: 14 }}
      />
    </div>
  );
}

// Highlight overlay
function HighlightOverlay({ rect, color }: { rect: DOMRect | null; color: string }) {
  if (!rect) return null;
  return (
    <div
      style={{
        position: "fixed",
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        border: `2px solid ${color}`,
        borderRadius: 2,
        pointerEvents: "none",
        zIndex: 9998,
        transition: "all 0.05s",
      }}
    />
  );
}

function getShortSelector(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase();
  if (el.id) return `${tag}#${el.id}`;
  const cls = el.className && typeof el.className === "string"
    ? "." + el.className.split(" ").slice(0, 2).join(".")
    : "";
  return `${tag}${cls}`;
}

function getDomPath(el: HTMLElement, maxDepth = 4): string {
  const parts: string[] = [];
  let current: HTMLElement | null = el;
  for (let i = 0; i < maxDepth && current && current !== document.body; i++) {
    const tag = current.tagName.toLowerCase();
    if (current.id) {
      parts.unshift(`${tag}#${current.id}`);
      break;
    }
    const ds = current.dataset;
    const dataSection = ds?.section;
    if (dataSection) {
      parts.unshift(`${tag}[data-section="${dataSection}"]`);
      break;
    }
    if (current.hasAttribute("data-section")) {
      parts.unshift(`${tag}[data-section]`);
      break;
    }
    const cls = current.className && typeof current.className === "string"
      ? current.className.split(" ").slice(0, 2).join(".")
      : "";
    parts.unshift(cls ? `${tag}.${cls}` : tag);
    current = current.parentElement;
  }
  return parts.join(" > ");
}

function resolveElementByPath(path: string): HTMLElement | null {
  // Try to find element by walking the path segments
  const parts = path.split(" > ").map((s) => s.trim());
  let current: Element | null = document.body;
  for (const part of parts) {
    if (!current) return null;
    // Handle id selector: tag#id
    const idMatch = part.match(/^(\w+)#(.+)$/);
    if (idMatch) {
      current = document.getElementById(idMatch[2]);
      continue;
    }
    // Handle data-section: tag[data-section="value"] or tag[data-section]
    const dsMatch = part.match(/^(\w+)\[data-section="?([^"\]]*)"?\]$/);
    if (dsMatch) {
      current = current.querySelector(`${dsMatch[1]}[data-section="${dsMatch[2]}"]`) || current.querySelector(`${dsMatch[1]}[data-section]`);
      continue;
    }
    // Handle tag.class1.class2
    const clsMatch = part.match(/^(\w+)\.(.+)$/);
    if (clsMatch) {
      const tag = clsMatch[1];
      const classes = clsMatch[2].split(".");
      const candidates = current.querySelectorAll(tag);
      let found = false;
      for (const el of candidates) {
        if (classes.every((c) => el.classList.contains(c))) {
          current = el;
          found = true;
          break;
        }
      }
      if (!found) return null;
      continue;
    }
    // Plain tag
    const child = current.querySelector(part);
    if (!child) return null;
    current = child;
  }
  return current as HTMLElement;
}

export function DevPanel() {
  const [active, setActive] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SelectedElement | null>(null);
  const [props, setProps] = useState<EditableProps | null>(null);
  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null);
  const [selectRect, setSelectRect] = useState<DOMRect | null>(null);
  const [pos, setPos] = useState({ x: window.innerWidth - 300, y: 80 });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Original props when element was first selected (before any changes)
  const originalPropsRef = useRef<EditableProps | null>(null);

  // Changelog: all changes across all elements in this session
  const [changes, setChanges] = useState<ChangeEntry[]>([]);
  const [saved, setSaved] = useState(false);

  // Load saved changes from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("__dev_panel_changes");
      if (!raw) return;
      const saved: ChangeEntry[] = JSON.parse(raw);
      if (!Array.isArray(saved) || saved.length === 0) return;
      setChanges(saved);
      // Apply saved inline styles to matching elements
      requestAnimationFrame(() => {
        for (const c of saved) {
          const el = resolveElementByPath(c.path);
          if (el) {
            el.style.setProperty(c.cssProp, `${c.to}px`);
          }
        }
      });
    } catch { /* ignore */ }
  }, []);

  // Draggable panel
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  }, [pos]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // Hover & click handlers when inspector is active
  useEffect(() => {
    if (!active) {
      setHoverRect(null);
      return;
    }

    const isDevPanel = (el: HTMLElement): boolean => {
      return !!el.closest("[data-dev-panel]");
    };

    const onMouseOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (isDevPanel(el)) {
        setHoverRect(null);
        return;
      }
      setHoverRect(el.getBoundingClientRect());
    };

    const onMouseOut = () => {
      setHoverRect(null);
    };

    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (isDevPanel(el)) return;
      e.preventDefault();
      e.stopPropagation();

      const tag = el.tagName.toLowerCase();
      const classes = el.className && typeof el.className === "string"
        ? el.className.split(" ").slice(0, 3).join(" ")
        : "";

      const path = getDomPath(el);
      setSelected({ el, tag, classes, path });
      const editableProps = getEditableProps(el);
      setProps(editableProps);
      originalPropsRef.current = { ...editableProps };
      setSelectRect(el.getBoundingClientRect());
      setOpen(true);
    };

    document.addEventListener("mouseover", onMouseOver, true);
    document.addEventListener("mouseout", onMouseOut, true);
    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("mouseover", onMouseOver, true);
      document.removeEventListener("mouseout", onMouseOut, true);
      document.removeEventListener("click", onClick, true);
    };
  }, [active]);

  // Update select rect on scroll
  useEffect(() => {
    if (!selected) return;
    const update = () => setSelectRect(selected.el.getBoundingClientRect());
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [selected]);

  const applyProp = useCallback((prop: string, value: string) => {
    if (!selected) return;
    selected.el.style.setProperty(prop, value);
    setSelectRect(selected.el.getBoundingClientRect());
  }, [selected]);

  const updateProp = useCallback((key: keyof EditableProps, value: number) => {
    if (!props || !selected) return;
    setProps((p) => p ? { ...p, [key]: value } : p);

    const cssProp = cssMap[key];
    if (cssProp) {
      applyProp(cssProp, `${value}px`);
    }

    // Track change
    const selector = getShortSelector(selected.el);
    const path = selected.path || getDomPath(selected.el);
    const origVal = originalPropsRef.current ? originalPropsRef.current[key] : value;

    setChanges((prev) => {
      const idx = prev.findIndex((c) => c.path === path && c.prop === key);
      if (Math.abs(value - (origVal as number)) < 0.5) {
        if (idx >= 0) return prev.filter((_, i) => i !== idx);
        return prev;
      }
      const entry: ChangeEntry = {
        selector,
        path,
        prop: key,
        cssProp: cssProp || key,
        from: origVal as number,
        to: value,
      };
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = entry;
        return updated;
      }
      return [...prev, entry];
    });
  }, [props, selected, applyProp]);

  const saveChanges = () => {
    localStorage.setItem("__dev_panel_changes", JSON.stringify(changes));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const clearSavedChanges = () => {
    localStorage.removeItem("__dev_panel_changes");
  };

  const copyChanges = () => {
    if (changes.length === 0) return;
    const grouped: Record<string, ChangeEntry[]> = {};
    for (const c of changes) {
      const key = c.path;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(c);
    }
    const lines: string[] = [];
    for (const [path, entries] of Object.entries(grouped)) {
      lines.push(`=== ${entries[0].selector} ===`);
      lines.push(`path: ${path}`);
      for (const e of entries) {
        const prefix = twPrefixMap[e.prop] || e.prop;
        lines.push(`${e.cssProp}: ${e.from}px → ${e.to}px  (${prefix}-${pxToTailwind(e.to)})`);
      }
      lines.push("");
    }
    navigator.clipboard.writeText(lines.join("\n"));
  };

  const copyValues = () => {
    if (!selected || !props) return;
    const lines = [
      `=== ${selected.tag}.${selected.classes.replace(/ /g, ".")} ===`,
      `path: ${selected.path}`,
      `margin: ${props.marginTop}px ${props.marginRight}px ${props.marginBottom}px ${props.marginLeft}px`,
      `  → mt-${pxToTailwind(props.marginTop)} mr-${pxToTailwind(props.marginRight)} mb-${pxToTailwind(props.marginBottom)} ml-${pxToTailwind(props.marginLeft)}`,
      `padding: ${props.paddingTop}px ${props.paddingRight}px ${props.paddingBottom}px ${props.paddingLeft}px`,
      `  → pt-${pxToTailwind(props.paddingTop)} pr-${pxToTailwind(props.paddingRight)} pb-${pxToTailwind(props.paddingBottom)} pl-${pxToTailwind(props.paddingLeft)}`,
      `font-size: ${props.fontSize}px (${props.fontSize / 16}rem)`,
      `gap: ${props.gap}px → gap-${pxToTailwind(props.gap)}`,
      `width: ${props.width}`,
      `height: ${props.height}`,
    ];
    navigator.clipboard.writeText(lines.join("\n"));
  };

  // Toggle button
  if (!active && !open) {
    return (
      <button
        data-dev-panel
        onClick={() => { setActive(true); setOpen(true); }}
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 9999,
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "#1e1e1e",
          border: "1px solid #444",
          color: "#4fc3f7",
          fontSize: 18,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        title="Dev Inspector"
      >
        ⚙
      </button>
    );
  }

  return (
    <>
      {/* Hover highlight */}
      <HighlightOverlay rect={hoverRect} color="#4fc3f7" />
      {/* Selection highlight */}
      <HighlightOverlay rect={selectRect} color="#ff9800" />

      {/* Panel */}
      {open && (
        <div
          data-dev-panel
          style={{
            position: "fixed",
            left: pos.x,
            top: pos.y,
            zIndex: 9999,
            width: 280,
            maxHeight: "80vh",
            overflowY: "auto",
            background: "#1e1e1eee",
            border: "1px solid #444",
            borderRadius: 8,
            color: "#eee",
            fontSize: 12,
            fontFamily: "monospace",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            userSelect: "none",
          }}
        >
          {/* Title bar */}
          <div
            data-dev-panel
            onMouseDown={onMouseDown}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "6px 10px",
              background: "#333",
              borderRadius: "8px 8px 0 0",
              cursor: "grab",
            }}
          >
            <span style={{ fontWeight: "bold", fontSize: 11 }}>
              Dev Inspector {active ? "🔍" : ""}
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                data-dev-panel
                onClick={() => setActive(!active)}
                style={{
                  background: active ? "#4fc3f7" : "#555",
                  border: "none",
                  color: active ? "#000" : "#ccc",
                  borderRadius: 3,
                  padding: "2px 6px",
                  fontSize: 10,
                  cursor: "pointer",
                }}
              >
                {active ? "ON" : "OFF"}
              </button>
              <button
                data-dev-panel
                onClick={() => {
                  setOpen(false);
                  setActive(false);
                  setSelected(null);
                  setSelectRect(null);
                  setHoverRect(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#999",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                ✕
              </button>
            </div>
          </div>

          <div data-dev-panel style={{ padding: "8px 10px" }}>
            {!selected ? (
              <p style={{ color: "#888", fontSize: 11, textAlign: "center", padding: "16px 0" }}>
                {active ? "Kliknij element na stronie" : "Włącz inspektor (ON) i kliknij element"}
              </p>
            ) : (
              <>
                {/* Element info */}
                <div style={{ marginBottom: 8, padding: "4px 6px", background: "#2a2a2a", borderRadius: 4 }}>
                  <div style={{ fontSize: 10, color: "#ff9800" }}>
                    &lt;{selected.tag}&gt; {selected.classes && <span style={{ color: "#888" }}>.{selected.classes.replace(/ /g, ".")}</span>}
                  </div>
                  <div style={{ fontSize: 9, color: "#666", marginTop: 2, wordBreak: "break-all" }}>
                    {selected.path}
                  </div>
                </div>

                {/* Margin */}
                <div style={{ fontSize: 10, color: "#888", fontWeight: "bold", marginBottom: 4 }}>MARGIN</div>
                <Slider label="top" value={props!.marginTop} min={-200} max={200} step={1} unit="px" onChange={(v) => updateProp("marginTop", v)} />
                <Slider label="bottom" value={props!.marginBottom} min={-200} max={200} step={1} unit="px" onChange={(v) => updateProp("marginBottom", v)} />
                <Slider label="left" value={props!.marginLeft} min={-500} max={200} step={1} unit="px" onChange={(v) => updateProp("marginLeft", v)} />
                <Slider label="right" value={props!.marginRight} min={-200} max={200} step={1} unit="px" onChange={(v) => updateProp("marginRight", v)} />

                {/* Padding */}
                <div style={{ fontSize: 10, color: "#888", fontWeight: "bold", marginTop: 8, marginBottom: 4 }}>PADDING</div>
                <Slider label="top" value={props!.paddingTop} min={0} max={200} step={1} unit="px" onChange={(v) => updateProp("paddingTop", v)} />
                <Slider label="bottom" value={props!.paddingBottom} min={0} max={200} step={1} unit="px" onChange={(v) => updateProp("paddingBottom", v)} />
                <Slider label="left" value={props!.paddingLeft} min={0} max={200} step={1} unit="px" onChange={(v) => updateProp("paddingLeft", v)} />
                <Slider label="right" value={props!.paddingRight} min={0} max={200} step={1} unit="px" onChange={(v) => updateProp("paddingRight", v)} />

                {/* Typography & spacing */}
                <div style={{ fontSize: 10, color: "#888", fontWeight: "bold", marginTop: 8, marginBottom: 4 }}>OTHER</div>
                <Slider label="font-size" value={props!.fontSize} min={8} max={96} step={1} unit="px" onChange={(v) => updateProp("fontSize", v)} />
                <Slider label="gap" value={props!.gap} min={0} max={100} step={1} unit="px" onChange={(v) => updateProp("gap", v)} />

                {/* Size display */}
                <div style={{ fontSize: 10, color: "#666", marginTop: 6 }}>
                  size: {props!.width} × {props!.height}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  <button
                    data-dev-panel
                    onClick={copyValues}
                    style={{ flex: 1, padding: "5px 8px", fontSize: 11, background: "#2196f3", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
                  >
                    Copy All
                  </button>
                  <button
                    data-dev-panel
                    onClick={() => {
                      if (selected) {
                        selected.el.removeAttribute("style");
                        const fresh = getEditableProps(selected.el);
                        setProps(fresh);
                        originalPropsRef.current = { ...fresh };
                        setSelectRect(selected.el.getBoundingClientRect());
                        // Remove changes for this element
                        const path = selected.path || getDomPath(selected.el);
                        setChanges((prev) => prev.filter((c) => c.path !== path));
                      }
                    }}
                    style={{ flex: 1, padding: "5px 8px", fontSize: 11, background: "#444", color: "#ccc", border: "none", borderRadius: 4, cursor: "pointer" }}
                  >
                    Reset
                  </button>
                </div>
              </>
            )}

            {/* Changelog */}
            {changes.length > 0 && (
              <div style={{ marginTop: 12, borderTop: "1px solid #333", paddingTop: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: "#ff9800", fontWeight: "bold" }}>
                    CHANGES ({changes.length})
                  </span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      data-dev-panel
                      onClick={saveChanges}
                      style={{ padding: "2px 6px", fontSize: 9, background: saved ? "#4caf50" : "#4caf50cc", color: "#fff", border: "none", borderRadius: 3, cursor: "pointer", fontWeight: "bold" }}
                    >
                      {saved ? "Saved!" : "Save"}
                    </button>
                    <button
                      data-dev-panel
                      onClick={copyChanges}
                      style={{ padding: "2px 6px", fontSize: 9, background: "#ff9800", color: "#000", border: "none", borderRadius: 3, cursor: "pointer", fontWeight: "bold" }}
                    >
                      Copy
                    </button>
                    <button
                      data-dev-panel
                      onClick={() => { setChanges([]); clearSavedChanges(); }}
                      style={{ padding: "2px 6px", fontSize: 9, background: "#444", color: "#999", border: "none", borderRadius: 3, cursor: "pointer" }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div style={{ maxHeight: 120, overflowY: "auto" }}>
                  {changes.map((c, i) => (
                    <div key={i} style={{ fontSize: 9, color: "#aaa", marginBottom: 3, lineHeight: 1.4 }}>
                      <span style={{ color: "#666" }}>{c.selector}</span>
                      {" "}
                      <span style={{ color: "#4fc3f7" }}>{c.cssProp}</span>
                      {": "}
                      <span style={{ color: "#f44336" }}>{Math.round(c.from)}px</span>
                      {" → "}
                      <span style={{ color: "#4caf50" }}>{Math.round(c.to)}px</span>
                      <span style={{ color: "#666" }}>
                        {" "}({twPrefixMap[c.prop] || c.prop}-{pxToTailwind(c.to)})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
