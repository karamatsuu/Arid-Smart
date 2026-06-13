export type UnitPrimary = "mm" | "m3ha";

const UNIT_KEY = "aridsmart:unitPrimary";

export function getUnitPrimary(): UnitPrimary {
  return localStorage.getItem(UNIT_KEY) === "m3ha" ? "m3ha" : "mm";
}

export function setUnitPrimary(unit: UnitPrimary) {
  localStorage.setItem(UNIT_KEY, unit);
  window.dispatchEvent(new CustomEvent("aridsmart:unit", { detail: unit }));
}

export function subscribeUnitPrimary(fn: (unit: UnitPrimary) => void): () => void {
  const onStorage = () => fn(getUnitPrimary());
  const onUnit = (event: Event) =>
    fn((event as CustomEvent<UnitPrimary>).detail ?? getUnitPrimary());
  window.addEventListener("storage", onStorage);
  window.addEventListener("aridsmart:unit", onUnit);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("aridsmart:unit", onUnit);
  };
}

export function cacheSizeBytes(): number {
  let total = 0;
  for (const key of Object.keys(localStorage)) {
    if (!key.startsWith("aridsmart:")) continue;
    total += key.length + (localStorage.getItem(key)?.length ?? 0);
  }
  return total * 2;
}
