# AridSmart — PART 3 of 6: Add / Edit Field Wizard

> **Depends on:** Part 0 (wizard frame, crop icons, toast, confirm dialog) and Part 2 (the Leaflet
> map stack — Step 1 reuses it for pin-drop / polygon-draw).
> **Covers:** Page 3 only. Heavy enough to stand alone: 3-step form + map drawing + validation +
> edit/delete mode + offline save.

## Foundation recap — DO NOT VIOLATE (full detail in Part 0)

- Mobile-first 360×640; `kaa` default; **no hardcoded strings** (validation messages too);
  render Karakalpak special chars; design for Russian ~30% longer.
- Tap targets ≥48×48, body ≥16px, WCAG AA, sunlight-readable.
- SVG icons only. Crop / soil / irrigation-method icons come from Part 0.
- Offline state required; toast + confirm-dialog components come from Part 0.

---

## PAGE 3 — Add / Edit Field (3-step wizard)

**Purpose:** capture everything the agronomy engine needs, nothing more. **One thing per screen,**
progress dots at top (1 of 3), Back/Next buttons fixed at bottom. Use the Part 0 **Wizard frame**.

### Step 1 — Location
Full-screen map (reuse Part 2's Leaflet setup). Two modes (toggle):
- **"Drop a pin"** — engine treats the field as a point + area number.
- **"Draw boundary"** — tap to add polygon corners, **undo button**, computed area shown **live in ha**.
- **Manual lat/long entry** link for when GPS/map fails.

### Step 2 — Field & crop
- **Field name** (text)
- **Crop** (large icon grid, single select): Cotton, Winter wheat, Rice, Alfalfa, Maize,
  Melon/gourds, Vegetables (other)
- **Sowing/planting date** (date picker)
- **Area in ha** (pre-filled if polygon drawn, editable)
- **Soil texture** (3 big options with simple SVG illustrations): Sandy / Loam / Clay
- **Irrigation method** (icon select): Furrow / Drip / Sprinkler / Flood

### Step 3 — Farmer & SMS
- **Farmer name** (text)
- **Phone number** (tel input, **+998** prefix shown)
- **SMS language** (segmented): Qaraqalpaqsha [default] / Oʻzbekcha / Русский
- **SMS frequency** (radio): "Only when action needed" [default] / "Daily summary"
- **Review card** summarizing all entries + **"Save field"** primary button

### Validation
Inline, per field, in the user's language; **Next disabled until step valid.**

### Edit mode
Same wizard pre-filled, entered from **Field Report ⋮ menu (Part 4)**; adds a **"Delete field"**
action at the bottom of Step 3 with a **confirm dialog** (Part 0).

### Offline state
Form fully usable; on save without network show toast:
**"Saved on this device — will sync when online"**.

---

## Backend contract for this part (from handoff §7)

The wizard reads/writes the field shape (full shape in Part 1):

- `POST /fields` → create (new-field wizard payload).
- `PUT /fields/{id}` → update (edit mode, pre-filled).
- `DELETE /fields/{id}` → delete (Step 3 action + confirm dialog).

Payload fields the wizard must produce: `name`, `crop`, `area_ha`, `lat`, `lon`, `polygon?`, plus
the agronomy inputs (sowing date, soil texture, irrigation method) and SMS settings (farmer name,
phone `+998…`, sms language, sms frequency). Offline save = queue locally, sync when online.

---

## Acceptance checklist for Part 3 (done when…)

- [ ] Progress dots "1 of 3"; Back/Next fixed at bottom; Next disabled until the step is valid.
- [ ] Step 1: pin-drop AND polygon-draw both work; undo on polygon; live ha; manual lat/long fallback.
- [ ] Step 2: crop icon grid (7 options), soil 3-option, irrigation method 4-option all single-select.
- [ ] Step 2: area pre-fills from a drawn polygon and stays editable.
- [ ] Step 3: phone shows +998 prefix; SMS language defaults to Qaraqalpaqsha; frequency defaults to "Only when action needed".
- [ ] Step 3: review card summarizes every entry; "Save field" issues POST (or PUT in edit mode).
- [ ] Validation messages are inline, per-field, and localized.
- [ ] Edit mode pre-fills from Part 4's ⋮ menu and exposes "Delete field" → confirm dialog → DELETE.
- [ ] Offline save shows "Saved on this device — will sync when online" toast; queues for sync.
- [ ] Verified at 360×640 with `kaa` strings.
