import { describe, expect, it } from "vitest";
import { getChallengeStatus } from "./challenge";

describe("getChallengeStatus", () => {
  it("returns Day 1 on the start date", () => {
    const result = getChallengeStatus("2026-05-13", "2026-08-11", new Date("2026-05-13T10:00:00"));
    expect(result).toEqual({ status: "active", dayNumber: 1, totalDays: 91 });
  });

  it("returns Day 2 one day after start", () => {
    const result = getChallengeStatus("2026-05-13", "2026-08-11", new Date("2026-05-14T10:00:00"));
    expect(result.status).toBe("active");
    if (result.status === "active") expect(result.dayNumber).toBe(2);
  });

  it("returns Day 13 thirteen days after start", () => {
    const result = getChallengeStatus("2026-05-01", "2026-07-30", new Date("2026-05-13T10:00:00"));
    expect(result.status).toBe("active");
    if (result.status === "active") expect(result.dayNumber).toBe(13);
  });

  it("returns pre_challenge when start date is in the future", () => {
    const result = getChallengeStatus("2026-05-18", "2026-08-16", new Date("2026-05-13T10:00:00"));
    expect(result).toEqual({ status: "pre_challenge", daysUntilStart: 5, totalDays: 91 });
  });

  it("returns completed when today is after end date", () => {
    const result = getChallengeStatus("2026-01-01", "2026-04-01", new Date("2026-05-13T10:00:00"));
    expect(result.status).toBe("completed");
  });

  it("handles same start and today regardless of time of day", () => {
    const morning = getChallengeStatus("2026-05-13", "2026-08-11", new Date("2026-05-13T06:00:00"));
    const evening = getChallengeStatus("2026-05-13", "2026-08-11", new Date("2026-05-13T23:00:00"));
    expect(morning).toEqual(evening);
  });
});
