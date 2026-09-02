import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalize, parseQuickEntry } from "./quick-parse";

describe("quick parser primitives", () => {
  it("normalizes accents and casing", () => {
    assert.equal(normalize("Salário MENSAL"), "salario mensal");
  });

  it("keeps plain words stable", () => {
    assert.equal(normalize("mercado 82 reais"), "mercado 82 reais");
  });

  it("calculates quantity times unit price", () => {
    const parsed = parseQuickEntry("comprei 3 óleos de motor de 15 reais", [], [], []);
    assert.equal(parsed.amount, 45);
  });

  it("calculates explicit unit price with cada", () => {
    const parsed = parseQuickEntry("comprei 4 camisetas a 30 reais cada", [], [], []);
    assert.equal(parsed.amount, 120);
  });

  it("keeps an explicit total as total", () => {
    const parsed = parseQuickEntry("comprei 3 óleos por 45 reais", [], [], []);
    assert.equal(parsed.amount, 45);
  });

  it("does not confuse installment count with quantity multiplication", () => {
    const parsed = parseQuickEntry("comprei celular por 1200 reais em 12x", [], [], []);
    assert.equal(parsed.amount, 1200);
  });

  it("sums multiple quantity and unit-price items", () => {
    const parsed = parseQuickEntry(
      "comprei 3 óleos de 15 reais e 2 filtros de 30 reais",
      [],
      [],
      [],
    );
    assert.equal(parsed.amount, 105);
  });

  it("sums natural-language items with each pricing", () => {
    const parsed = parseQuickEntry(
      "peguei 2 pizzas a 40 reais cada e 3 refrigerantes de 8 reais",
      [],
      [],
      [],
    );
    assert.equal(parsed.amount, 104);
  });
});
