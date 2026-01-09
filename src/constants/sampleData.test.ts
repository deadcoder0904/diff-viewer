import { describe, expect, test } from "bun:test";
import { SAMPLE_CHANGED, SAMPLE_ORIGINAL } from "./sampleData";

const lineCount = (value: string) => value.split(/\r?\n/).length;

describe("sample diff data", () => {
  test("is non-empty and multi-line", () => {
    expect(SAMPLE_ORIGINAL.length).toBeGreaterThan(0);
    expect(SAMPLE_CHANGED.length).toBeGreaterThan(0);
    expect(lineCount(SAMPLE_ORIGINAL)).toBeGreaterThan(50);
    expect(lineCount(SAMPLE_ORIGINAL)).toBeLessThan(65);
    expect(lineCount(SAMPLE_CHANGED)).toBeGreaterThan(50);
    expect(lineCount(SAMPLE_CHANGED)).toBeLessThan(65);
  });

  test("changed sample is longer than original", () => {
    expect(lineCount(SAMPLE_CHANGED)).toBeGreaterThan(lineCount(SAMPLE_ORIGINAL));
  });

  test("contains recognizable sections", () => {
    expect(SAMPLE_ORIGINAL).toContain("class UserService");
    expect(SAMPLE_CHANGED).toContain("class UserService");
    expect(SAMPLE_CHANGED).toContain("function UserDashboard");
  });
});
