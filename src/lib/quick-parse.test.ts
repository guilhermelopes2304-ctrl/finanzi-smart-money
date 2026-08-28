import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalize } from "./quick-parse";

describe("quick parser primitives", () => {
  it("normalizes accents and casing", () => {
    assert.equal(normalize("Salário MENSAL"), "salario mensal");
  });

  it("keeps plain words stable", () => {
    assert.equal(normalize("mercado 82 reais"), "mercado 82 reais");
  });
});
