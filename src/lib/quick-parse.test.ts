import { describe, expect, test } from "bun:test";
import { normalize } from "./quick-parse";

describe("quick parser primitives", () => {
  test("normalizes accents and casing", () => {
    expect(normalize("Salário MENSAL")).toBe("salario mensal");
  });

  test("keeps plain words stable", () => {
    expect(normalize("mercado 82 reais")).toBe("mercado 82 reais");
  });
});
