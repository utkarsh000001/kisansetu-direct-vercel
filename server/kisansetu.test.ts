import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const styleSource = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

describe("KisanSetu Direct pilot experience", () => {
  it("keeps the five required demo roles available", () => {
    expect(homeSource).toContain('const roleOrder: Role[] = ["farmer", "fpo", "buyer", "consumer", "admin"]');
    expect(homeSource).toContain("Farmer view");
    expect(homeSource).toContain("FPO operations");
    expect(homeSource).toContain("Buyer view");
    expect(homeSource).toContain("Consumer view");
    expect(homeSource).toContain("Admin oversight");
  });

  it("covers the marketplace acceptance path from lot to settlement", () => {
    for (const marker of [
      "Verified inventory",
      "See breakup",
      "simulated payment authorized",
      "Settlement is simulated for the pilot.",
      "Route optimized",
      "Farmer payout ledger",
      "Demand forecast",
    ]) {
      expect(homeSource).toContain(marker);
    }
  });

  it("includes responsive and reduced-motion safeguards", () => {
    expect(styleSource).toContain("@media (max-width: 760px)");
    expect(styleSource).toContain("@media (prefers-reduced-motion: reduce)");
    expect(styleSource).toContain("focus-visible");
  });
});
