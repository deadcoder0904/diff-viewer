import { describe, expect, test } from "bun:test";
import { calculateDiffStats, calculateLcsLength } from "./diffUtils";

describe("calculateLcsLength", () => {
  test("returns 0 when one input is empty", () => {
    expect(calculateLcsLength([], ["a", "b"])).toBe(0);
    expect(calculateLcsLength(["a"], [])).toBe(0);
  });

  test("returns the length of the longest common subsequence", () => {
    expect(calculateLcsLength(["a", "b", "c"], ["a", "c"])).toBe(2);
    expect(calculateLcsLength(["x", "y", "z"], ["a", "b", "c"])).toBe(0);
    expect(calculateLcsLength(["a", "b", "c"], ["a", "b", "c"])).toBe(3);
  });
});

describe("calculateDiffStats", () => {
  test("returns zeros when both texts are empty", () => {
    expect(calculateDiffStats("", "")).toEqual({ added: 0, removed: 0 });
  });

  test("calculates added and removed line counts", () => {
    const original = ["one", "two", "three"].join("\n");
    const changed = ["one", "three", "four", "five"].join("\n");

    expect(calculateDiffStats(original, changed)).toEqual({ added: 2, removed: 1 });
  });
});
