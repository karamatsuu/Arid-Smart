import { describe, expect, it } from "vitest";
import { cornersAreaHa, cornersCentroid } from "./fieldUtils";

describe("cornersAreaHa", () => {
  it("returns 0 for fewer than 3 corners", () => {
    expect(cornersAreaHa([])).toBe(0);
    expect(cornersAreaHa([{ lat: 42, lon: 59 }])).toBe(0);
  });

  it("~1 ha square near equator", () => {
    // 100m × 100m square at lat 0
    // 0.001° ≈ 111m at equator; use 0.0009° ≈ 100m
    const d = 100 / 111_320;
    const corners = [
      { lat: 0,  lon: 0 },
      { lat: 0,  lon: d },
      { lat: d,  lon: d },
      { lat: d,  lon: 0 },
    ];
    expect(cornersAreaHa(corners)).toBeCloseTo(1, 0);
  });

  it("~1 ha square at lat 42 (Nukus region)", () => {
    const dLat = 100 / 111_320;
    const dLon = 100 / (111_320 * Math.cos((42 * Math.PI) / 180));
    const corners = [
      { lat: 42,        lon: 59 },
      { lat: 42,        lon: 59 + dLon },
      { lat: 42 + dLat, lon: 59 + dLon },
      { lat: 42 + dLat, lon: 59 },
    ];
    expect(cornersAreaHa(corners)).toBeCloseTo(1, 0);
  });

  it("non-square quadrilateral returns positive area", () => {
    const corners = [
      { lat: 42.46, lon: 59.61 },
      { lat: 42.47, lon: 59.62 },
      { lat: 42.465, lon: 59.63 },
      { lat: 42.455, lon: 59.615 },
    ];
    expect(cornersAreaHa(corners)).toBeGreaterThan(0);
  });
});

describe("cornersCentroid", () => {
  it("throws on empty input", () => {
    expect(() => cornersCentroid([])).toThrow();
  });

  it("single corner returns itself", () => {
    const c = cornersCentroid([{ lat: 42.46, lon: 59.61 }]);
    expect(c.lat).toBeCloseTo(42.46, 6);
    expect(c.lon).toBeCloseTo(59.61, 6);
  });

  it("four corners returns mean lat/lon", () => {
    const c = cornersCentroid([
      { lat: 0, lon: 0 },
      { lat: 0, lon: 2 },
      { lat: 2, lon: 2 },
      { lat: 2, lon: 0 },
    ]);
    expect(c.lat).toBeCloseTo(1, 6);
    expect(c.lon).toBeCloseTo(1, 6);
  });
});
