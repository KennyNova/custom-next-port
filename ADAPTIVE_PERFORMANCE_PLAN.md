# Adaptive Performance Strategy

This document captures the agreed-upon plan for keeping the current rich UX **unchanged for users on capable devices** while *automatically* degrading costly visuals and network work on low-end devices or slow connections.

---

## 1. Goals

1. Maintain existing animations, backdrop-blur effects and background art for users with good CPU/GPU, memory and network.
2. Detect when a visitor is likely to experience jank (weak hardware, data-saver, slow network, or prefers-reduced-motion) and:  
   • Skip heavy components (e.g. `WhispyBackground`)  
   • Remove expensive CSS (blur, animated box-shadow)  
   • Cancel/bypass aggressive data prefetch  
   • Respect `prefers-reduced-motion` **without** changing default behaviour for others.
3. Keep implementation incremental, non-breaking, and easy to roll back.

---

## 2. Capability Detection

Use a tiny **client-only provider** to gather run-time hints and expose booleans:

| Signal | API | Threshold |
| ------ | --- | --------- |
| Slow network | `navigator.connection.effectiveType` | `"slow-2g"`, `"2g"`, `"3g"` |
| Save-data | `navigator.connection.saveData` | `true` |
| Low CPU threads | `navigator.hardwareConcurrency` | ≤ 4 |
| Low RAM | `navigator.deviceMemory` | ≤ 2 GB |
| Reduced motion | `matchMedia('(prefers-reduced-motion: reduce)')` | `true` |

If **any** of these are true we call the environment *constrained*.

---

## 3. Implementation Tasks

### 3.1  Add provider & hook

- **File**: `src/components/providers/perf-provider.tsx` (new)
- Expose `{ lowEndDevice, slowNetwork, saveData, reducedMotion }` in context.
- On mount, set corresponding `data-*` attributes on `<html>` (e.g. `data-low-end`).

### 3.2  Register provider globally

- **File**: `src/app/layout.tsx`
  1. `import { PerfProvider } from '@/components/providers/perf-provider'`
  2. Wrap existing providers: `<PerfProvider>{children}</PerfProvider>`.

### 3.3  Gate heavy React components

- **`WhispyBackground`**: early-return `null` when any constraint flag is true.
- **Prefetch logic** (`src/app/page.tsx` & others):
  ```ts
  const conn = (navigator as any).connection;
  if (conn?.saveData || ['slow-2g','2g','3g'].includes(conn?.effectiveType)) return; // skip
  ```
- Any other large animation islands can follow the same pattern via `usePerf()` or dynamic import guards.

### 3.4  CSS fallbacks

1. Target constrained devices using the data attributes:
   ```css
   html[data-low-end] .backdrop-ok,
   html[data-slow-net] .backdrop-ok {
     backdrop-filter: none !important;
     background-color: rgba(0,0,0,.4); /* cheap fallback */
   }
   ```
2. Disable global heavy animations for reduced-motion:
   ```css
   @media (prefers-reduced-motion: reduce) {
     .heavy-anim { animation: none !important; transition: none !important; }
   }
   ```
3. Remove transition blanket rules and switch to opt-in classes (`transition-base`).

### 3.5  Optional lazy-loading

Use `next/dynamic` + `usePerf` to only import heavy bundles on capable devices, e.g.:
```tsx
const WhispyBackground = dynamic(() => import('@/components/layout/whispy-background'), { ssr: false });
...
return allowFancy && <WhispyBackground />;
```

---

## 4. Files to Change / Add

| Type | Path |
| ---- | ---- |
| ➕ new | `src/components/providers/perf-provider.tsx` |
| ✏️ update | `src/app/layout.tsx` |
| ✏️ update | `src/components/layout/whispy-background.tsx` |
| ✏️ update | `src/app/page.tsx` (prefetch guard) |
| ✏️ update | other pages/components with aggressive prefetch/animations |
| ✏️ update | `src/styles/globals.css` (remove blanket transitions, add fallback rules) |
| ➕ new (option) | route `loading.tsx` skeletons |

---

## 5. Testing Checklist

- [ ] Load site on desktop Chrome with fast connection → **full effects visible**.
- [ ] Emulate "Fast 3G" + "4 CPU throttling" in DevTools → Whispy background absent, blur replaced, site remains usable.
- [ ] Enable *Save-data* in DevTools → no background prefetch requests.
- [ ] Toggle *prefers-reduced-motion* in DevTools → Animations stop.
- [ ] Lighthouse performance score should improve on mobile config.

## Implementation Status ✅

**Completed:**
- ✅ Created `PerfProvider` with device/network capability detection
- ✅ Added provider to app layout with data attributes on `<html>`
- ✅ Gated `WhispyBackground` component for constrained environments
- ✅ Added network-aware prefetch guards using `requestIdleCallback`
- ✅ Reduced global CSS transitions to opt-in only
- ✅ Added performance constraint fallbacks (backdrop-blur, animations)
- ✅ Applied `backdrop-ok` classes to key components for graceful degradation

**Debug logging:** Console will show detected constraints and when features are disabled.

---

## 6. Roll-back / future work

The provider approach is non-intrusive—delete the provider import + data attributes to revert.  Future optimisations:  
* Convert pages to Server Components + island hydrating.  
* Replace Framer Motion with CSS keyframes where feasible.  
* Audit bundle size with `next build --profile`.
