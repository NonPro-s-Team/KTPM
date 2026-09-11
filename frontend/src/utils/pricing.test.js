import assert from "node:assert/strict";
import test from "node:test";

import { calculateDiscountPercent } from "./pricing.js";

test("calculates a 100 percent discount when sale price is zero", () => {
  assert.equal(calculateDiscountPercent(100000, 0), "100.0");
  assert.equal(calculateDiscountPercent("100000", "0"), "100.0");
});

test("returns zero when either price is missing or original price is zero", () => {
  assert.equal(calculateDiscountPercent("", 0), "0");
  assert.equal(calculateDiscountPercent(100000, null), "0");
  assert.equal(calculateDiscountPercent(0, 0), "0");
});
