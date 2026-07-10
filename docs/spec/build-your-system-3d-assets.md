# Build Your System — 3D Asset Pipeline (STEP → .glb)

> Purpose: turn Ultradyne's engineering **STEP** files into web-ready **.glb** 3D models
> for the "Build Your System" configurator (rotate / zoom / snap-together / recolor).
> Status: 🔲 Draft guide for whoever prepares the 3D assets.

## The pipeline

```
STEP (.step/.stp)  →  convert to mesh  →  optimize + materials + attach points  →  .glb  →  configurator
   (Blake has)          (FreeCAD)              (Blender)                          (dev)
```

- **STEP files** are precise engineering geometry — too heavy and material-less for the web.
- The goal per part: one **.glb** file, lightweight, correctly colored, with a consistent
  origin/orientation so parts assemble automatically.

---

## Part A — Convert ONE STEP → .glb (free, DIY test)

Goal: prove the pipeline on a single part (start with the **chassis**). Rough is fine for the test.

### Tools (both free)
- **FreeCAD** (https://www.freecad.org) — opens STEP and tessellates it to a mesh.
- **Blender** (https://www.blender.org) — optimize, add materials, export .glb.

(Blender cannot import STEP natively, which is why we go through FreeCAD first.)

### Steps

**1. FreeCAD: STEP → OBJ**
1. Open FreeCAD → File → Open → select the `.step` file.
2. In the model tree, select the imported part(s).
3. Switch the Workbench dropdown (top toolbar) to **Mesh**.
4. Menu: **Meshes → Create mesh from shape…** → choose **Standard**, tessellation/deviation ~0.1mm
   (smaller = smoother but heavier). Click OK.
5. Select the new mesh in the tree.
6. Menu: **File → Export…** → file type **Wavefront (*.obj)** → save as e.g. `chassis.obj`.

**2. Blender: OBJ → .glb**
1. Open Blender → delete the default cube (select it, press X).
2. **File → Import → Wavefront (.obj)** → pick `chassis.obj`.
3. Check scale: the part should be a sensible size. If it imported in mm it may be huge —
   select it, press `S`, type `0.001`, Enter to scale down (mm → meters), then `Ctrl+A → Scale` to apply.
4. Center it: **Object → Set Origin → Origin to Geometry**, then `Alt+G` to move to world origin.
5. **File → Export → glTF 2.0 (.glb)** → format **glb** → enable **Compression (Draco)** →
   export as `chassis.glb`.



---

## Part B — Do it PROPERLY (brief for the 3D artist / production pass)

For the real configurator (not just a test), each part needs the following. Hand this section to
whoever preps the assets.

### 1. Optimize (web performance — critical)
- **Reduce polygons.** STEP tessellation produces millions of triangles; the web needs far fewer.
  Use Blender's **Decimate** modifier (Collapse) or a remesh.
  - Target: **≤ ~50k triangles per part**; full assembled rifle ideally **under ~300k total**.
- **Draco compression** on glTF export.
- **File size target:** each part roughly **200 KB – 2 MB**. Anything tens of MB is too heavy,
  especially on phones.
- Remove internal geometry the customer will never see (hidden screws, internal cavities).

### 2. Materials / finishes (so colors work)
- STEP carries **no color/material** — set up **PBR** materials (Metallic/Roughness).
- Anodized / Cerakote look: **metallic ≈ 0.6–0.9, roughness ≈ 0.3–0.5**.
- Give the main body **one named material** (e.g. `finish`) so the configurator can recolor it at
  runtime. Provide the finish palette to match the catalog:
  **Armor Black, Coyote Tan (FDE), OD Green, Midnight Bronze, Sniper Grey, Anodized** (confirm list with catalog).
- Small hardware (screws, springs) can keep fixed metal materials.

### 3. Attach points / consistent placement (so parts snap together) — MOST IMPORTANT
This is what lets the buttstock land on the chassis automatically. Pick ONE convention and apply it
to EVERY part:
- **Consistent units + scale:** model in **meters**, apply scale (`Ctrl+A → Scale`) so everything
  matches real-world proportion (a buttstock should not import bigger than a chassis).
- **Consistent orientation:** align the **bore axis along the same world axis** for every part
  (recommend the length of the rifle runs along **+X**, top of part faces **+Z**).
- **Consistent origin = the connection face.** Set each part's origin to the point where it attaches
  to the next part. Examples:
  - Chassis: origin at the **rear attach face** (where the buttstock mounts).
  - Buttstock: origin at its **front collar** (the face that meets the chassis rear).
  - Grip: origin at its **mounting face** (where it bolts to the chassis).
- Optional but ideal: add named **Empty** objects as explicit markers (e.g. `attach_rear`,
  `attach_grip`) so the dev can position by marker instead of guessing.

### 4. Export
- **One `.glb` per part** (binary glTF, textures embedded).
- **Draco compression** on.
- **+Y up** (glTF standard — Blender's exporter handles this).
- **Consistent file names** matching the product, e.g. `chassis-ud.glb`, `buttstock-gen2.glb`,
  `grip-adjustable.glb`.

### Deliverable checklist (per part)
- [ ] One optimized `.glb`, ≤ ~2 MB, ≤ ~50k tris
- [ ] Draco compressed
- [ ] PBR materials; recolorable body material named `finish`
- [ ] Meters scale, scale applied
- [ ] Bore axis along +X, top +Z (consistent with all parts)
- [ ] Origin at the connection face (+ optional named attach empties)
- [ ] Named clearly per product

---

## First milestone (de-risk before investing)
1. Blake sends **one chassis `.step`**.
2. Convert to `.glb` via Part A (even rough).
3. Dev drops it into a WebGL/Three.js viewer in the build page → confirm it rotates/zooms.
4. Add a buttstock, prove **snap-together** using the Part B conventions.
5. Then roll out the remaining parts with the full Part B treatment.
