import { describe, it, expect } from "vitest";
import { jakartaDateParts, jakartaMonthRange } from "./datetime";

describe("jakartaDateParts", () => {
  it("returns the WIB date, which is a day ahead of UTC between 00:00-07:00 WIB", () => {
    // 2026-05-12 00:30 WIB = 2026-05-11 17:30 UTC
    expect(jakartaDateParts(new Date("2026-05-11T17:30:00.000Z"))).toEqual({
      year: 2026,
      month: 5,
      day: 12,
    });
  });

  it("rolls over year at midnight WIB", () => {
    expect(jakartaDateParts(new Date("2026-12-31T16:59:59.999Z"))).toEqual({
      year: 2026,
      month: 12,
      day: 31,
    });
    expect(jakartaDateParts(new Date("2026-12-31T17:00:00.000Z"))).toEqual({
      year: 2027,
      month: 1,
      day: 1,
    });
  });
});

describe("jakartaMonthRange", () => {
  it("returns month boundaries at 00:00 WIB (17:00 UTC the day before)", () => {
    const { start, end } = jakartaMonthRange(new Date("2026-11-19T05:00:00.000Z"));
    expect(start.toISOString()).toBe("2026-10-31T17:00:00.000Z");
    expect(end.toISOString()).toBe("2026-11-30T17:00:00.000Z");
  });

  it("uses the new WIB month when UTC is still on the last day of the previous month", () => {
    // 2026-12-01 01:00 WIB = 2026-11-30 18:00 UTC
    const { start, end } = jakartaMonthRange(new Date("2026-11-30T18:00:00.000Z"));
    expect(start.toISOString()).toBe("2026-11-30T17:00:00.000Z");
    expect(end.toISOString()).toBe("2026-12-31T17:00:00.000Z");
  });

  it("crosses into the next year for December", () => {
    const { end } = jakartaMonthRange(new Date("2026-12-15T00:00:00.000Z"));
    expect(end.toISOString()).toBe("2026-12-31T17:00:00.000Z");
  });
});
