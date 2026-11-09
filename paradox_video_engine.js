// Paradox Video Engine: the panel inside ComfyUI. It draws the engine's controls in the ParadoxAI look and writes
// every change straight into the node's own widgets, which stay the source of truth (they are what the workflow
// saves and what Python reads). Nothing here knows the engine's words: those come from getparadoxai.com.
import { app } from "../../scripts/app.js";

const NODE = "ParadoxVideoEngine";
const VERSION = "1.3";

// The two dials members set: the strength of their block of words (0 is off). Everything else (motion, the scene,
// the iPhone look and its finish) is built in, at strengths that come with the engine's words.
const DIALS = [
  { name: "realism", label: "Realism", icon: "spark", desc: "Her skin, eyes, hair and clothes look real: pores, fine hair, fabric texture. Lower it if the skin looks too rough." },
  { name: "identity_lock", label: "Identity Lock", icon: "lock", desc: "She stays the same person in every frame: her face, body and hands. Raise it if she drifts." },
];
const TEXTS = [
  { name: "video_prompt", label: "Video Prompt", rows: 4, from: "VIDEO PROMPT", hint: "One prompt for the whole video. Start with your trigger word, then what she does." },
  { name: "second_half", label: "Later Parts", rows: 2, from: "LATER PARTS (SECOND HALF)", hint: "Optional: only what changes after the start." },
  { name: "her_look", label: "Her Look", rows: 2, hint: "What she always has, for example: short black hair, bob style, goth." },
];

const ICONS = {
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  hd: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9v6M7 12h3M10 9v6M14 9v6h2a3 3 0 000-6z"/>',
  master: '<circle cx="12" cy="12" r="8"/><path d="M12 12l4-4"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  play: '<rect x="2.5" y="4.5" width="19" height="15" rx="3"/><path d="M10 9l5 3-5 3z"/>',
};
const icon = (k, cls = "pve-ic") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg>`;

const CSS = `
.pve { --v:#7B2CF9; --b:#4A6BFF; --c:#12E3FF; --ink:#ECEAFF; --mute:#9C98C8; --line:rgba(122,99,255,.28);
  position:relative; box-sizing:border-box; width:100%; height:100%; overflow:hidden auto; color:var(--ink);
  font:12px/1.45 "Instrument Sans", system-ui, -apple-system, "Segoe UI", sans-serif; border-radius:12px;
  background:radial-gradient(120% 60% at 0% 0%, rgba(123,44,249,.22), transparent 60%), radial-gradient(90% 50% at 100% 100%, rgba(18,227,255,.12), transparent 60%), #07061a;
  border:1px solid var(--line); box-shadow:0 0 0 1px rgba(18,227,255,.08) inset, 0 0 24px rgba(123,44,249,.25); scrollbar-width:thin; scrollbar-color:var(--v) transparent; }
.pve * { box-sizing:border-box; }
.pve [hidden] { display:none !important; }
.pve-in { padding:14px 14px 10px; }
.pve-ic { width:15px; height:15px; fill:none; stroke:currentColor; stroke-width:1.7; stroke-linecap:round; stroke-linejoin:round; flex:none; }
.pve-head { display:flex; align-items:center; justify-content:center; gap:10px; padding:2px 0 4px; }
.pve-head .pve-ic { width:26px; height:26px; color:var(--c); filter:drop-shadow(0 0 6px rgba(18,227,255,.6)); }
.pve-title { font-weight:800; letter-spacing:.14em; font-size:15px; text-transform:uppercase; }
.pve-title b { background:linear-gradient(90deg,var(--v),var(--b),var(--c)); -webkit-background-clip:text; background-clip:text; color:transparent; }
.pve-sub { text-align:center; font:600 10px/1 "IBM Plex Mono", ui-monospace, monospace; letter-spacing:.24em; color:var(--mute); margin:2px 0 12px; }
.pve-card { border:1px solid var(--line); border-radius:10px; padding:10px 12px; margin:0 0 12px; background:linear-gradient(135deg, rgba(123,44,249,.16), rgba(18,227,255,.05)); }
.pve-badge { display:inline-flex; align-items:center; gap:6px; font:700 10px/1 "IBM Plex Mono", ui-monospace, monospace; letter-spacing:.14em; color:var(--c); padding:4px 7px; border-radius:6px; background:rgba(18,227,255,.08); border:1px solid rgba(18,227,255,.25); margin-bottom:6px; }
.pve-card p { margin:0; color:#CFCBF5; }
.pve-sec { display:flex; align-items:center; gap:8px; margin:14px 0 6px; font:700 10px/1 "IBM Plex Mono", ui-monospace, monospace; letter-spacing:.18em; color:var(--mute); }
.pve-sec::after { content:""; flex:1; height:1px; background:var(--line); }
.pve-row { display:grid; grid-template-columns:104px 1fr; align-items:center; gap:10px; margin:7px 0; }
.pve-lab { display:flex; align-items:center; gap:6px; justify-content:flex-end; color:#C7C3F0; font-weight:600; text-align:right; }
.pve-field, .pve-area { width:100%; background:rgba(4,3,16,.75); border:1px solid var(--line); color:var(--ink); border-radius:8px; padding:7px 9px; font:inherit; outline:none; }
.pve-area { resize:vertical; min-height:38px; }
.pve-field:focus, .pve-area:focus { border-color:var(--c); box-shadow:0 0 0 3px rgba(18,227,255,.12); }
.pve-keybox { display:flex; gap:6px; }
.pve-keybox .pve-field { font-family:"IBM Plex Mono", ui-monospace, monospace; letter-spacing:.06em; }
.pve-btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; border:1px solid var(--line); background:rgba(4,3,16,.75); color:var(--ink); border-radius:8px; padding:0 10px; min-height:32px; cursor:pointer; font:inherit; }
.pve-btn:hover { border-color:var(--c); }
.pve-linked { display:flex; align-items:center; gap:7px; color:var(--mute); border:1px dashed var(--line); border-radius:8px; padding:7px 9px; }
.pve-linked i { width:7px; height:7px; border-radius:50%; background:var(--c); box-shadow:0 0 8px var(--c); flex:none; }
.pve-dial { border:1px solid var(--line); border-radius:10px; padding:9px 10px 8px; margin:7px 0; background:rgba(4,3,16,.45); transition:border-color .2s, background .2s; }
.pve-dial.on { border-color:rgba(18,227,255,.35); background:linear-gradient(90deg, rgba(123,44,249,.14), rgba(18,227,255,.04)); }
.pve-dial-top { display:flex; align-items:center; gap:9px; }
.pve-dial-top .pve-ic { color:var(--mute); }
.pve-dial.on .pve-dial-top .pve-ic { color:var(--c); }
.pve-dial-name { font-weight:700; min-width:104px; }
.pve-desc { color:var(--mute); font-size:11px; margin:5px 0 0 24px; }
.pve-range { -webkit-appearance:none; appearance:none; flex:1; min-width:60px; height:6px; border-radius:6px; outline:none; cursor:pointer;
  background:linear-gradient(90deg,var(--v),var(--b),var(--c)) 0/var(--p,50%) 100% no-repeat, rgba(255,255,255,.08); }
.pve-range::-webkit-slider-thumb { -webkit-appearance:none; width:16px; height:16px; border-radius:50%; background:#fff; border:2px solid var(--b); box-shadow:0 0 10px rgba(18,227,255,.7); }
.pve-range::-moz-range-thumb { width:14px; height:14px; border-radius:50%; background:#fff; border:2px solid var(--b); }
.pve-val { min-width:44px; text-align:right; font:700 12px/1 "IBM Plex Mono", ui-monospace, monospace; color:var(--c); }
.pve-val.off { color:var(--mute); }
.pve-seg { display:inline-flex; border:1px solid var(--line); border-radius:9px; overflow:hidden; }
.pve-seg button { border:0; background:transparent; color:var(--mute); font-family:inherit; font-size:12px; font-weight:700; padding:0 14px; min-height:32px; cursor:pointer; }
.pve-seg button[aria-pressed="true"] { color:#fff; background:linear-gradient(90deg,var(--v),var(--b)); }
.pve-built { display:flex; gap:9px; align-items:flex-start; border:1px solid rgba(18,227,255,.25); border-radius:10px; padding:9px 10px; margin:7px 0; background:rgba(18,227,255,.05); }
.pve-built .pve-ic { color:var(--c); margin-top:1px; }
.pve-built b { display:block; font-weight:700; }
.pve-built span { color:var(--mute); font-size:11px; }
.pve-foot { display:flex; justify-content:space-between; margin-top:12px; padding-top:8px; border-top:1px solid var(--line); color:var(--mute); font:600 10px/1 "IBM Plex Mono", ui-monospace, monospace; letter-spacing:.12em; }
@media (prefers-reduced-motion: reduce) { .pve * { transition:none !important; } }
`;

function injectCss() {
  if (document.getElementById("pve-css")) return;
  const s = document.createElement("style");
  s.id = "pve-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function panelHtml() {
  const texts = TEXTS.map((t) => `
      <div class="pve-row" data-text="${t.name}">
        <span class="pve-lab">${esc(t.label)}</span>
        <div><textarea class="pve-area" rows="${t.rows}" placeholder="${esc(t.hint)}" data-input="${t.name}"></textarea>
          <div class="pve-linked" data-linked="${t.name}" hidden><i></i>From the ${esc(t.from || "")} box</div></div>
      </div>`).join("");
  const dials = DIALS.map((d) => `
      <div class="pve-dial" data-dial="${d.name}">
        <div class="pve-dial-top">
          ${icon(d.icon)}<span class="pve-dial-name">${esc(d.label)}</span>
          <input class="pve-range" type="range" min="0" max="1.6" step="0.05" data-range="${d.name}" aria-label="${esc(d.label)} strength">
          <span class="pve-val" data-val="${d.name}"></span>
        </div>
        <div class="pve-desc">${esc(d.desc)}</div>
      </div>`).join("");
  return `
    <div class="pve-in">
      <div class="pve-head">${icon("play")}<div class="pve-title"><b>Paradox</b> Video Engine</div></div>
      <div class="pve-sub">V${VERSION} · WAN MOTION PIPELINE · IPHONE REALISM</div>
      <div class="pve-card">
        <span class="pve-badge">${icon("spark")}MADE FOR PARADOX MOTION AND PARADOX ECHO</span>
        <p>One prompt in Wan's language, real skin and motion, a living scene and the same person in every frame. It reads the workflow and its Replacement Mode, and loads its words from getparadoxai.com with your key.</p>
      </div>
      <div class="pve-row">
        <span class="pve-lab">${icon("key")}VIP Key</span>
        <div class="pve-keybox"><input class="pve-field" type="password" autocomplete="off" spellcheck="false" placeholder="Your ParadoxAI key (Pro or Studio)" data-input="license_key">
          <button class="pve-btn" type="button" data-show-key title="Show or hide the key" aria-label="Show or hide the key">${icon("eye")}</button></div>
      </div>
      ${texts}
      <div class="pve-sec">REALISM</div>
      ${dials}
      <div class="pve-built" data-built="iphone">${icon("phone")}<div><b>iPhone look, built in</b>
        <span>Every video gets the look of a real iPhone video, measured against real phone clips: phone colours and exposure, the phone's softer fine detail, sharpening and noise reduction, the reference clip's own frame rate (usually 30, like an iPhone), and light sensor grain.</span></div></div>
      <div class="pve-sec">OUTPUT</div>
      <div class="pve-dial on" data-out="base_quality">
        <div class="pve-dial-top">${icon("hd")}<span class="pve-dial-name">Base Quality</span>
          <div class="pve-seg" role="group" aria-label="Base Quality"><button type="button" data-quality="1x">1x</button><button type="button" data-quality="HD 1080p">HD 1080p</button></div></div>
        <div class="pve-desc">HD 1080p delivers the video at an iPhone's 1080p size (1080 x 1920), the size Reels and TikTok use. 1x keeps the size it renders, for quick tests.</div>
      </div>
      <div class="pve-dial on" data-out="master_strength">
        <div class="pve-dial-top">${icon("master")}<span class="pve-dial-name">Master Strength</span>
          <input class="pve-range" type="range" min="0.5" max="1.5" step="0.05" data-range="master_strength" aria-label="Master Strength">
          <span class="pve-val" data-val="master_strength"></span></div>
        <div class="pve-desc">How strongly Wan follows the whole prompt. 1.00 is normal.</div>
      </div>
      <div class="pve-foot"><span>PARADOXAI</span><span>GETPARADOXAI.COM</span></div>
    </div>`;
}

app.registerExtension({
  name: "ParadoxAI.VideoEngine",
  nodeCreated(node) {
    if (node.comfyClass !== NODE) return;
    injectCss();
    const root = document.createElement("div");
    root.className = "pve";
    root.innerHTML = panelHtml();
    const $ = (sel) => root.querySelector(sel);
    const $$ = (sel) => [...root.querySelectorAll(sel)];
    const widget = (name) => node.widgets?.find((w) => w.name === name);
    const linked = (name) => node.inputs?.some((i) => i.name === name && i.link != null);
    const set = (name, value) => {
      const w = widget(name);
      if (!w) return;
      w.value = value;
      w.callback?.(value);
      node.setDirtyCanvas?.(true, true);
    };
    // Hide the plain widgets: the panel shows them. They keep their values, so the workflow saves as usual.
    const shown = new Set(["license_key", ...TEXTS.map((t) => t.name), ...DIALS.map((d) => d.name), "base_quality", "master_strength", "replacement_mode"]);
    for (const w of node.widgets || []) {
      if (!shown.has(w.name)) continue;
      w.hidden = true;
      w.computeSize = () => [0, -4];
    }

    let height = 760;
    node.addDOMWidget?.("paradox_video_engine_panel", "pve-panel", root, { serialize: false, getMinHeight: () => height, getMaxHeight: () => height });
    const inner = $(".pve-in");
    const fit = () => requestAnimationFrame(() => {
      if (!inner.offsetHeight) return;
      height = inner.offsetHeight + 4;
      const size = node.computeSize?.() || node.size;
      node.setSize?.([Math.max(node.size?.[0] || 0, 520), size[1]]);
      node.setDirtyCanvas?.(true, true);
    });
    if (typeof ResizeObserver !== "undefined") new ResizeObserver(fit).observe(inner);

    const paintRange = (r) => r.style.setProperty("--p", `${((r.value - r.min) / (r.max - r.min)) * 100}%`);

    function sync() {
      const key = widget("license_key")?.value ?? "";
      $('[data-input="license_key"]').value = key === "ENTER_VIP_KEY_HERE" ? "" : key;
      for (const t of TEXTS) {
        const isLinked = linked(t.name);
        const area = $(`[data-input="${t.name}"]`);
        area.hidden = isLinked;
        $(`[data-linked="${t.name}"]`).hidden = !isLinked;
        area.value = widget(t.name)?.value ?? "";
      }
      for (const d of DIALS) {
        const v = Number(widget(d.name)?.value ?? 0);
        const on = v > 0;
        $(`[data-dial="${d.name}"]`).classList.toggle("on", on);
        const r = $(`[data-range="${d.name}"]`);
        r.value = v;
        paintRange(r);
        const val = $(`[data-val="${d.name}"]`);
        val.textContent = on ? v.toFixed(2) : "OFF";
        val.classList.toggle("off", !on);
      }
      const q = widget("base_quality")?.value ?? "HD 1080p";
      for (const b of $$("[data-quality]")) b.setAttribute("aria-pressed", String(b.dataset.quality === q));
      const m = Number(widget("master_strength")?.value ?? 1);
      const mr = $('[data-range="master_strength"]');
      mr.value = m;
      paintRange(mr);
      $('[data-val="master_strength"]').textContent = m.toFixed(2);
    }

    // Typing: the key and the texts.
    $('[data-input="license_key"]').addEventListener("input", (e) => set("license_key", e.target.value.trim() || "ENTER_VIP_KEY_HERE"));
    $("[data-show-key]").addEventListener("click", () => {
      const f = $('[data-input="license_key"]');
      f.type = f.type === "password" ? "text" : "password";
    });
    for (const t of TEXTS) $(`[data-input="${t.name}"]`).addEventListener("input", (e) => set(t.name, e.target.value));
    // The sliders set the strengths (0 turns a dial's words off); Base Quality is one of two buttons.
    for (const name of [...DIALS.map((d) => d.name), "master_strength"]) {
      $(`[data-range="${name}"]`).addEventListener("input", (e) => { set(name, Number(e.target.value)); sync(); });
    }
    for (const b of $$("[data-quality]")) b.addEventListener("click", () => { set("base_quality", b.dataset.quality); sync(); });
    // Keys typed in the panel must not reach ComfyUI's shortcuts (Delete would remove the box).
    root.addEventListener("keydown", (e) => e.stopPropagation());

    const onConfigure = node.onConfigure;
    node.onConfigure = function (...args) {
      const r = onConfigure?.apply(this, args);
      setTimeout(() => { sync(); fit(); }, 60);
      return r;
    };
    const onConnectionsChange = node.onConnectionsChange;
    node.onConnectionsChange = function (...args) {
      const r = onConnectionsChange?.apply(this, args);
      setTimeout(sync, 0);
      return r;
    };
    setTimeout(() => { sync(); fit(); }, 100);
  },
});
