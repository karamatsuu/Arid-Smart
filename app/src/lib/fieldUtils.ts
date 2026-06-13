export interface CornerPoint {
  lat: number;
  lon: number;
}

export function cornersAreaHa(corners: CornerPoint[]): number {
  if (corners.length < 3) return 0;
  let area = 0;
  const n = corners.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += corners[i].lat * corners[j].lon;
    area -= corners[j].lat * corners[i].lon;
  }
  area = Math.abs(area) / 2;
  const meanLat = corners.reduce((s, p) => s + p.lat, 0) / n;
  // Planar approximation — accurate to <1% for fields up to ~5 km across
  const m2 = area * 111_320 * 111_320 * Math.cos((meanLat * Math.PI) / 180);
  return m2 / 10_000;
}

export function cornersCentroid(corners: CornerPoint[]): CornerPoint {
  if (corners.length === 0) throw new Error("cornersCentroid requires at least one corner");
  const lat = corners.reduce((s, p) => s + p.lat, 0) / corners.length;
  const lon = corners.reduce((s, p) => s + p.lon, 0) / corners.length;
  // Vertex mean — adequate for labelling and centroid pin on field-scale polygons
  return { lat, lon };
}
