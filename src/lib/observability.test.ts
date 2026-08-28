import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { sanitizeTelemetryAttributes } from "./observability";

describe("telemetry privacy boundary", () => {
  it("keeps operational attributes", () => {
    assert.deepEqual(
      sanitizeTelemetryAttributes({ route: "/dashboard", durationMs: 123, retry: false }),
      { route: "/dashboard", durationMs: 123, retry: false },
    );
  });

  it("drops sensitive and financial attribute keys", () => {
    const safe = sanitizeTelemetryAttributes({
      route: "/dashboard",
      password: "secret",
      accessToken: "abc",
      email: "user@example.com",
      transactionId: "tx-123",
      amount: 999,
      balance: 12345,
      raw: "gastei 45 no mercado",
    });

    assert.deepEqual(safe, { route: "/dashboard" });
  });

  it("removes query strings and fragments", () => {
    const safe = sanitizeTelemetryAttributes({
      source: "/dashboard?email=user@example.com",
      route: "/lancamentos#sensitive",
    });

    assert.equal(safe["source"], "/dashboard");
    assert.equal(safe["route"], "/lancamentos");
  });
});
