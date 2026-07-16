'use client';

import dynamic from 'next/dynamic';
import { type PointerEvent as ReactPointerEvent, useRef, useState, useTransition } from 'react';

import { addBuildToCart } from '../actions';
import type { BuilderProduct, BuilderStep, BuildSelectionItem } from '../page-data';

// 3D viewer is client-only (WebGL) and heavy, so load it lazily.
const ModelViewer = dynamic(
  () => import('./model-viewer').then((mod) => mod.ModelViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center text-sm text-contrast-400">
        Loading 3D preview…
      </div>
    ),
  },
);

// 3D model files (in /public/models). We only have one model per category so
// far, so a given slot's model is shown for any product in that slot.
const SLOT_MODEL: Record<string, string> = {
  chassis: '/models/Chassis.opt.glb', // optimized (Draco): 10.5MB → 281KB
  buttstock: '/models/ButtStock.opt.glb', // optimized: 31MB → 764KB
  grips: '/models/Grip.opt.glb', // optimized: 8.5MB → 285KB
};

// Per-PRODUCT model overrides, keyed by product entityId. Add an entry here as
// Blake delivers a .glb for a specific product, so different grips/buttstocks/etc.
// show their own model instead of the shared slot default above.
const PRODUCT_MODEL: Record<string, string> = {
  '442': '/models/Grip.opt.glb', // UD Adjustable Grip
};

interface Selection {
  product: BuilderProduct;
  // optionEntityId -> chosen optionValueEntityId
  options: Record<number, number>;
}

function colorOptionOf(product: BuilderProduct) {
  return product.options.find((option) => option.isColor);
}

/** The label of the currently-chosen color for a selection, if any (e.g. "Black"). */
function selectedColorLabel(selection: Selection): string | null {
  const colorOption = colorOptionOf(selection.product);

  if (!colorOption) return null;

  const chosenId = selection.options[colorOption.entityId];

  return colorOption.values.find((value) => value.entityId === chosenId)?.label ?? null;
}

/** Build the default option selections for a product (each option's default value). */
function defaultOptionsFor(product: BuilderProduct): Record<number, number> {
  const options: Record<number, number> = {};

  for (const option of product.options) {
    const chosen = option.values.find((value) => value.isDefault) ?? option.values[0];

    if (chosen) options[option.entityId] = chosen.entityId;
  }

  return options;
}

function formatPrice(value: number | null, currency: string): string {
  if (value == null) return '—';

  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

/**
 * Whether a part is compatible with the chosen chassis.
 *
 * There is no structured compatibility data (which parts fit which chassis) yet,
 * so for now everything is treated as compatible — nothing is wrongly blocked.
 * When the compatibility chart is available, implement the real rule here using
 * the chassis + candidate, and the "Incompatible" greying becomes accurate.
 */
function arePartsCompatible(_chassis: BuilderProduct, _candidate: BuilderProduct): boolean {
  return true;
}

interface AssemblyLayout {
  left: number;
  top: number;
  width: number;
  z: number;
}

/**
 * PROOF OF CONCEPT assembly layout — where each part's photo sits in the
 * composite "assembled" preview, as % of the stage. The photos have white
 * backgrounds, so we drop them out with mix-blend-multiply. Positions are
 * hand-tuned per part; only chassis + buttstock are mapped for now.
 */
const ASSEMBLY_LAYOUT: Record<string, AssemblyLayout> = {
  chassis: { left: 28.3, top: 13.5, width: 76, z: 2 },
  buttstock: { left: 7.6, top: 39.7, width: 33, z: 1 },
  grips: { left: 29.2, top: 50, width: 28, z: 1 },
};

/**
 * Per-PRODUCT position overrides, keyed by product entityId. Each product photo
 * is framed differently, so a specific part (e.g. a particular grip) can need
 * its own position instead of the slot default above. Filled in as parts are aligned.
 */
const PRODUCT_LAYOUT: Record<string, AssemblyLayout> = {
  '442': { left: 27.2, top: 41.8, width: 28, z: 1 },
};

export function BuildYourSystem({ steps }: { steps: BuilderStep[] }) {
  // Pre-select the required base part when there's only one option (e.g. a single
  // chassis), so the builder opens straight into configuring it rather than picking it.
  const [selections, setSelections] = useState<Record<string, Selection>>(() => {
    const base = steps.find((step) => !step.optional);
    const only = base?.products.length === 1 ? base.products[0] : undefined;

    if (base && only) {
      return { [base.id]: { product: only, options: defaultOptionsFor(only) } };
    }

    return {};
  });
  const [activeStepId, setActiveStepId] = useState<string>(steps[0]?.id ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Align tool (proof-of-concept): drag parts in the preview to find their layout numbers.
  const [alignMode, setAlignMode] = useState(false);
  const [layoutMap, setLayoutMap] = useState<Record<string, AssemblyLayout>>(PRODUCT_LAYOUT);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
  } | null>(null);

  const activeStep = steps.find((step) => step.id === activeStepId) ?? steps[0];

  const selectedEntries = steps
    .map((step) => ({ step, selection: selections[step.id] }))
    .filter((entry): entry is { step: BuilderStep; selection: Selection } => Boolean(entry.selection));

  const total = selectedEntries.reduce((sum, { selection }) => sum + (selection.product.price ?? 0), 0);
  const currency = selectedEntries[0]?.selection.product.currency ?? 'USD';

  const missingRequired = steps.some((step) => !step.optional && !selections[step.id]);
  const canAddToCart = selectedEntries.length > 0 && !missingRequired;

  const baseStep = steps.find((step) => !step.optional);
  const baseSelection = baseStep ? selections[baseStep.id] : undefined;

  function isCompatible(stepId: string, product: BuilderProduct): boolean {
    if (!baseStep || !baseSelection || stepId === baseStep.id) return true;

    return arePartsCompatible(baseSelection.product, product);
  }

  function selectProduct(stepId: string, product: BuilderProduct) {
    setSelections((prev) => {
      const next = { ...prev, [stepId]: { product, options: defaultOptionsFor(product) } };

      if (baseStep && stepId === baseStep.id) {
        for (const step of steps) {
          if (step.id === baseStep.id) continue;

          const existing = next[step.id];

          if (existing && !arePartsCompatible(product, existing.product)) {
            delete next[step.id];
          }
        }
      }

      return next;
    });
  }

  function clearStep(stepId: string) {
    setSelections((prev) => {
      const next = { ...prev };

      delete next[stepId];

      return next;
    });
  }

  function setOption(stepId: string, optionEntityId: number, valueEntityId: number) {
    setSelections((prev) => {
      const selection = prev[stepId];

      if (!selection) return prev;

      return {
        ...prev,
        [stepId]: {
          ...selection,
          options: { ...selection.options, [optionEntityId]: valueEntityId },
        },
      };
    });
  }

  function handleAddToCart() {
    setError(null);

    const items: BuildSelectionItem[] = Object.values(selections).map((selection) => ({
      productEntityId: selection.product.entityId,
      multipleChoices: Object.entries(selection.options).map(([optionEntityId, valueEntityId]) => ({
        optionEntityId: Number(optionEntityId),
        optionValueEntityId: valueEntityId,
      })),
    }));

    startTransition(async () => {
      const result = await addBuildToCart(items);

      if (result.ok) {
        window.location.assign('/cart');
      } else {
        setError(result.error ?? 'Something went wrong.');
      }
    });
  }

  if (!activeStep) return null;

  const activeSelection = selections[activeStep.id];
  // Show every option per item, including each item's own Color/finish.
  const activeConfigurableOptions = activeSelection?.product.options;
  const activeIndex = steps.findIndex((step) => step.id === activeStep.id);

  // The large preview shows the active component's chosen product, or its first
  // product as a preview hint when nothing is selected yet.
  const stageProduct = activeSelection?.product ?? activeStep.products[0];

  // 3D models for the currently selected parts. A per-product model wins over
  // the slot default, so specific products can carry their own .glb.
  const modelUrls = selectedEntries
    .map(({ step, selection }) => PRODUCT_MODEL[String(selection.product.entityId)] ?? SLOT_MODEL[step.id])
    .filter((url): url is string => Boolean(url));

  // Resolve a part's layout: a per-product override wins over the slot default.
  function layoutFor(step: BuilderStep, product: BuilderProduct): AssemblyLayout | undefined {
    return layoutMap[String(product.entityId)] ?? ASSEMBLY_LAYOUT[step.id];
  }

  // Layers for the composite "assembled" preview (parts that have a layout + image).
  const assemblyLayers = selectedEntries
    .map(({ step, selection }) => ({
      step,
      selection,
      productId: String(selection.product.entityId),
      layout: layoutFor(step, selection.product),
    }))
    .filter(
      (
        entry,
      ): entry is {
        step: BuilderStep;
        selection: Selection;
        productId: string;
        layout: AssemblyLayout;
      } => Boolean(entry.layout) && entry.selection.product.image !== null,
    )
    .sort((a, b) => a.layout.z - b.layout.z);

  function goToStep(offset: number) {
    const next = steps[activeIndex + offset];

    if (next) setActiveStepId(next.id);
  }

  function startDrag(event: ReactPointerEvent<HTMLImageElement>, id: string, base: AssemblyLayout) {
    if (!alignMode) return;

    event.preventDefault();
    dragRef.current = {
      id,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: base.left,
      startTop: base.top,
    };
    // Seed a per-product override so dragging edits this specific product.
    setLayoutMap((prev) => (prev[id] ? prev : { ...prev, [id]: base }));
  }

  function onStagePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const stage = stageRef.current;

    if (!drag || !stage) return;

    const rect = stage.getBoundingClientRect();
    const dx = ((event.clientX - drag.startX) / rect.width) * 100;
    const dy = ((event.clientY - drag.startY) / rect.height) * 100;

    setLayoutMap((prev) => {
      const current = prev[drag.id];

      if (!current) return prev;

      return {
        ...prev,
        [drag.id]: {
          ...current,
          left: Math.round((drag.startLeft + dx) * 10) / 10,
          top: Math.round((drag.startTop + dy) * 10) / 10,
        },
      };
    });
  }

  function endDrag() {
    dragRef.current = null;
  }

  function setLayoutField(
    id: string,
    base: AssemblyLayout,
    field: 'left' | 'top' | 'width',
    value: number,
  ) {
    setLayoutMap((prev) => {
      const current = prev[id] ?? base;

      return { ...prev, [id]: { ...current, [field]: value } };
    });
  }

  return (
    <div className="pb-10">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 py-6 lg:h-[calc(100vh-7rem)] lg:grid-cols-[1.4fr_1fr] lg:overflow-hidden">
          {/* ---------- LEFT: visual stage (locked; does not scroll) ---------- */}
          <div className="lg:flex lg:h-full lg:flex-col lg:overflow-hidden">
            <div
              className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-contrast-100 bg-white lg:aspect-auto lg:min-h-0 lg:flex-1"
              onPointerLeave={endDrag}
              onPointerMove={onStagePointerMove}
              onPointerUp={endDrag}
            >
              {modelUrls.length > 0 ? (
                // 3D preview (WebGL) — real .glb models, rotate/zoom.
                <div className="absolute inset-0">
                  <ModelViewer urls={modelUrls} />
                </div>
              ) : assemblyLayers.length > 0 ? (
                // Composite "assembled" preview inside a FIXED aspect-ratio box so the
                // percentage positions never drift on zoom/resize. Part photos are
                // stacked and their white backgrounds dropped via mix-blend-multiply.
                <div className="aspect-[16/7] w-full" ref={stageRef}>
                  <div className="relative h-full w-full">
                    {assemblyLayers.map(({ selection, productId, layout }) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt={selection.product.name}
                        className={`absolute object-contain mix-blend-multiply ${
                          alignMode ? 'cursor-move outline-dashed outline-1 outline-primary' : ''
                        }`}
                        draggable={false}
                        key={productId}
                        onPointerDown={(event) => startDrag(event, productId, layout)}
                        src={selection.product.image ?? ''}
                        style={{
                          left: `${layout.left}%`,
                          top: `${layout.top}%`,
                          width: `${layout.width}%`,
                          zIndex: layout.z,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : stageProduct?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={stageProduct.name}
                  className="h-full w-full object-contain p-6 mix-blend-multiply"
                  src={stageProduct.image}
                />
              ) : (
                <span className="px-6 text-center text-sm text-contrast-400">
                  Pick a part to preview your build
                </span>
              )}

              <div className="absolute left-4 top-4 z-10 rounded-lg bg-foreground/80 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-background">
                {assemblyLayers.length > 0
                  ? 'Your build'
                  : `${activeStep.title}${activeSelection ? '' : ' · preview'}`}
              </div>

              {assemblyLayers.length > 0 ? (
                <button
                  className="absolute right-3 top-3 z-10 rounded-md border border-contrast-200 bg-background/90 px-3 py-1 text-xs font-medium text-contrast-500 hover:border-foreground hover:text-foreground"
                  onClick={() => setAlignMode((value) => !value)}
                  type="button"
                >
                  {alignMode ? 'Done aligning' : 'Align'}
                </button>
              ) : null}
            </div>

            <div className="mt-4 shrink-0">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-contrast-400">
                Your build · {selectedEntries.length} part{selectedEntries.length === 1 ? '' : 's'}
              </p>
              {selectedEntries.length === 0 ? (
                <p className="text-sm text-contrast-300">Nothing added yet.</p>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {selectedEntries.map(({ step, selection }) => (
                    <button
                      className={`w-24 shrink-0 rounded-lg border p-1 text-left transition-colors ${
                        step.id === activeStep.id
                          ? 'border-primary'
                          : 'border-contrast-100 hover:border-contrast-300'
                      }`}
                      key={step.id}
                      onClick={() => setActiveStepId(step.id)}
                      type="button"
                    >
                      <div className="aspect-square w-full overflow-hidden rounded bg-contrast-100">
                        {selection.product.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt={selection.product.name}
                            className="h-full w-full object-cover"
                            src={selection.product.image}
                          />
                        ) : null}
                      </div>
                      <p className="mt-1 truncate text-[10px] uppercase tracking-wide text-contrast-400">
                        {step.title}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ---------- RIGHT: configuration panel (scrolls inside itself) ---------- */}
          <div className="lg:h-full lg:overflow-y-auto lg:pb-6 lg:pr-2">
            {/* Component nav */}
            <div className="mb-5 flex flex-wrap gap-2">
              {steps.map((step, index) => {
                const selection = selections[step.id];
                const active = step.id === activeStep.id;

                return (
                  <button
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                      active
                        ? 'border-primary bg-primary text-foreground'
                        : 'border-contrast-200 text-contrast-500 hover:border-primary'
                    }`}
                    key={step.id}
                    onClick={() => setActiveStepId(step.id)}
                    type="button"
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                        selection
                          ? 'bg-foreground text-background'
                          : 'bg-contrast-100 text-contrast-500'
                      }`}
                    >
                      {selection ? '✓' : index + 1}
                    </span>
                    {step.title}
                  </button>
                );
              })}
            </div>

            {/* Active component heading */}
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-contrast-400">
                  Step {activeIndex + 1} of {steps.length}
                </p>
                <h3 className="font-heading text-2xl font-bold uppercase text-foreground">
                  {activeStep.title}
                </h3>
              </div>
              <span className="text-sm font-medium text-contrast-400">
                {activeStep.optional ? 'Optional' : 'Required'}
              </span>
            </div>

            {/* Products */}
            {activeStep.products.length === 0 ? (
              <p className="rounded-lg border border-contrast-100 bg-contrast-100/40 p-6 text-contrast-500">
                No products found for this section yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {activeStep.optional ? (
                  <button
                    className={`flex min-h-[7rem] items-center justify-center rounded-xl border text-sm font-medium transition-all ${
                      !activeSelection
                        ? 'border-primary ring-2 ring-primary'
                        : 'border-contrast-100 text-contrast-400 hover:border-contrast-300'
                    }`}
                    onClick={() => clearStep(activeStep.id)}
                    type="button"
                  >
                    None
                  </button>
                ) : null}

                {activeStep.products.map((product) => {
                  const isSelected = activeSelection?.product.entityId === product.entityId;
                  const incompatible = !isCompatible(activeStep.id, product);

                  return (
                    <button
                      className={`flex flex-col overflow-hidden rounded-xl border bg-background text-left transition-all duration-200 ${
                        incompatible
                          ? 'cursor-not-allowed border-contrast-100 opacity-40'
                          : isSelected
                            ? 'border-primary ring-2 ring-primary'
                            : 'border-contrast-100 hover:-translate-y-1 hover:border-contrast-300 hover:shadow-lg'
                      }`}
                      disabled={incompatible}
                      key={product.entityId}
                      onClick={() => selectProduct(activeStep.id, product)}
                      type="button"
                    >
                      <div className="aspect-square w-full bg-contrast-100">
                        {product.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt={product.name}
                            className="h-full w-full object-cover"
                            src={product.image}
                          />
                        ) : null}
                      </div>
                      <div className="flex flex-1 flex-col gap-1 p-3">
                        <span className="line-clamp-2 text-sm font-medium text-foreground">
                          {product.name}
                        </span>
                        {incompatible ? (
                          <span className="mt-auto text-xs font-medium text-error">Incompatible</span>
                        ) : (
                          <span className="mt-auto font-semibold text-foreground">
                            {formatPrice(product.price, product.currency)}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Options for the chosen product, including its own color/finish */}
            {activeSelection && activeConfigurableOptions && activeConfigurableOptions.length > 0 ? (
              <div className="mt-6 flex flex-col gap-5 rounded-xl border border-contrast-100 p-5">
                <h4 className="font-heading text-base font-semibold uppercase text-foreground">
                  Configure {activeStep.title}
                </h4>
                {activeConfigurableOptions.map((option) => {
                  const chosen = activeSelection.options[option.entityId];

                  return (
                    <div key={option.entityId}>
                      <p className="mb-2 text-sm font-medium text-foreground">{option.displayName}</p>
                      <div className="flex flex-wrap gap-2">
                        {option.values.map((value) => {
                          const isChosen = chosen === value.entityId;
                          const swatch = option.isColor && value.hexColors.length > 0;

                          return (
                            <button
                              className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors ${
                                isChosen
                                  ? 'border-primary bg-primary/10 font-semibold text-foreground'
                                  : 'border-contrast-200 text-contrast-500 hover:border-primary'
                              }`}
                              key={value.entityId}
                              onClick={() => setOption(activeStep.id, option.entityId, value.entityId)}
                              type="button"
                            >
                              {swatch ? (
                                <span
                                  className="h-4 w-4 rounded-full border border-contrast-200"
                                  style={{ backgroundColor: value.hexColors[0] }}
                                />
                              ) : null}
                              {value.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}

            {/* Back / Next */}
            <div className="mt-6 flex justify-between">
              <button
                className="rounded-md border border-contrast-200 px-5 py-2 text-sm font-medium text-contrast-500 enabled:hover:border-foreground enabled:hover:text-foreground disabled:opacity-40"
                disabled={activeIndex === 0}
                onClick={() => goToStep(-1)}
                type="button"
              >
                ← Back
              </button>
              <button
                className="rounded-md border border-contrast-200 px-5 py-2 text-sm font-medium text-contrast-500 enabled:hover:border-foreground enabled:hover:text-foreground disabled:opacity-40"
                disabled={activeIndex === steps.length - 1}
                onClick={() => goToStep(1)}
                type="button"
              >
                Next →
              </button>
            </div>

          </div>
        </div>

        {/* ---------- Your Configuration: full-width section below both columns ---------- */}
        <section className="mt-8 rounded-xl border border-contrast-100 p-6">
          <h2 className="mb-4 font-heading text-2xl font-bold uppercase text-foreground">
            Your Configuration
          </h2>

          {selectedEntries.length === 0 ? (
            <p className="text-sm text-contrast-400">No parts selected yet.</p>
          ) : (
            <ul className="divide-y divide-contrast-100">
              {selectedEntries.map(({ step, selection }) => {
                const color = selectedColorLabel(selection);

                return (
                  <li className="flex items-center gap-4 py-4" key={step.id}>
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-contrast-100">
                      {selection.product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt={selection.product.name}
                          className="h-full w-full object-cover"
                          src={selection.product.image}
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs uppercase tracking-wide text-contrast-400">
                        {step.title}
                      </p>
                      <p className="font-medium text-foreground">
                        {selection.product.name}
                        {color ? ` - ${color}` : ''}
                      </p>
                      <p className="text-xs text-contrast-400">
                        {selection.product.sku ? `SKU: ${selection.product.sku} • ` : ''}
                        <span className={selection.product.inStock ? 'text-success' : 'text-error'}>
                          {selection.product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </p>
                    </div>
                    <span className="shrink-0 font-semibold text-foreground">
                      {formatPrice(selection.product.price, selection.product.currency)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-contrast-200 pt-6">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wide text-contrast-400">Total</span>
              <span className="font-heading text-2xl font-bold text-foreground">
                {formatPrice(total, currency)}
              </span>
            </div>

            <div className="flex flex-col items-end gap-1">
              {error ? <span className="text-sm text-error">{error}</span> : null}
              {missingRequired ? (
                <span className="text-xs text-contrast-400">Choose a chassis to continue.</span>
              ) : null}
              <button
                className="rounded-md bg-primary px-10 py-3 font-semibold uppercase text-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!canAddToCart || isPending}
                onClick={handleAddToCart}
                type="button"
              >
                {isPending ? 'Adding…' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ---------- Align tool panel (proof-of-concept) ---------- */}
      {alignMode ? (
        <div className="fixed bottom-4 right-4 z-50 w-72 rounded-xl border border-contrast-200 bg-background p-4 shadow-xl">
          <p className="mb-1 text-xs font-semibold uppercase text-foreground">Align mode</p>
          <p className="mb-3 text-xs text-contrast-400">
            Drag parts in the preview, or fine-tune below, then send me these numbers.
          </p>
          {assemblyLayers.length === 0 ? (
            <p className="text-xs text-contrast-400">Select a chassis and a buttstock first.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {assemblyLayers.map(({ step, selection, productId, layout }) => (
                <div className="rounded-lg border border-contrast-100 p-2" key={productId}>
                  <p className="mb-1 text-xs font-medium text-foreground">
                    {step.title}: {selection.product.name}{' '}
                    <span className="text-contrast-400">#{productId}</span>
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['left', 'top', 'width'] as const).map((field) => (
                      <label
                        className="flex flex-col text-[10px] uppercase text-contrast-400"
                        key={field}
                      >
                        {field}
                        <input
                          className="rounded border border-contrast-200 px-1 py-0.5 text-xs text-foreground"
                          onChange={(event) =>
                            setLayoutField(productId, layout, field, Number(event.target.value))
                          }
                          step={0.5}
                          type="number"
                          value={layout[field]}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <pre className="mt-3 max-h-32 overflow-auto rounded bg-contrast-100 p-2 text-[10px] text-foreground">
            {JSON.stringify(layoutMap, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
