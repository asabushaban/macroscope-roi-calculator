# Macroscope ROI Calculator

A polished, conservative single-page calculator for estimating the measurable return from Macroscope. It updates instantly, stores inputs only in the browser, works without a backend, and exports a Markdown summary.

The model deliberately separates:

- **Direct cash savings:** spend expected to be eliminated, such as replaced software or reduced outside labor.
- **Measurable capacity value:** the loaded value of employee hours returned to higher-value work. This is not automatically payroll savings.
- **Potential impact:** assumption-based outcomes such as avoided incidents, faster delivery, or deferred hiring. These remain separate unless the user explicitly enables an expanded modeled ROI.

Results are estimates based on user-provided assumptions and are not guarantees.

## Install and run

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Vite prints the local URL, normally `http://localhost:5173`.

## Test, check, and build

```bash
npm test
npm run lint
npm run build
```

The production bundle is written to `dist/`. To preview it locally:

```bash
npx vite preview
```

## Calculation model

Core, type-safe formulas live in [`src/calculations.ts`](src/calculations.ts). Input and result interfaces are in [`src/types.ts`](src/types.ts), and defaults/example presets are in [`src/defaults.ts`](src/defaults.ts).

The primary model is:

```text
Total measurable annual value = direct cash savings + measurable capacity value
Net measurable annual value = total measurable annual value − annual Macroscope cost
ROI = net measurable annual value ÷ annual Macroscope cost × 100
Payback months = annual Macroscope cost ÷ total measurable annual value × 12
FTE-equivalent capacity = annual returned hours ÷ annual productive hours per employee
```

When cost is zero, ROI and payback display as “Not available.” The implementation clamps negative inputs to zero and safely handles zero denominators.

Potential-impact scenarios are calculated independently. Only the expected scenario appears in the separate expanded modeled ROI when explicitly enabled; it never replaces the primary result.

## Add or modify a metric

1. Add typed input fields to `Inputs` in `src/types.ts`.
2. Add defaults in `src/defaults.ts`.
3. Implement the pure calculation in `src/calculations.ts`, returning both hours and value where applicable.
4. Add the inputs and helper text in `src/App.tsx`.
5. Add focused unit tests in `src/calculations.test.ts`.
6. Check that the metric does not overlap an existing category. Add a warning or exclude it from the primary result if double counting is possible.

## Privacy and persistence

No information is submitted or sent to an API. Inputs are saved in browser `localStorage` under `macroscope-roi-inputs-v1`. “Reset calculator” clears that saved state. Export creates a local Markdown download, and print uses print-specific CSS.
