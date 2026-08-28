type TelemetryValue = string | number | boolean;

type OtlpAttribute = {
  key: string;
  value: { stringValue?: string; intValue?: string; boolValue?: boolean };
};

let initialized = false;

function randomHex(bytes: number): string {
  const values = new Uint8Array(bytes);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => value.toString(16).padStart(2, "0")).join("");
}

function endpoint(): string | null {
  const configured = import.meta.env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT as string | undefined;
  if (!configured) return null;
  return configured.replace(/\/$/, "").endsWith("/v1/traces")
    ? configured.replace(/\/$/, "")
    : `${configured.replace(/\/$/, "")}/v1/traces`;
}

function toAttributes(input: Record<string, TelemetryValue | undefined>): OtlpAttribute[] {
  return Object.entries(input)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      if (typeof value === "boolean") return { key, value: { boolValue: value } };
      if (typeof value === "number") return { key, value: { intValue: String(value) } };
      return { key, value: { stringValue: value } };
    });
}

export function captureTelemetry(
  name: string,
  attributes: Record<string, TelemetryValue | undefined> = {},
  status: "ok" | "error" = "ok",
) {
  if (typeof window === "undefined") return;
  const url = endpoint();
  if (!url) return;

  const start = Date.now();
  const traceId = randomHex(16);
  const spanId = randomHex(8);
  const payload = {
    resourceSpans: [
      {
        resource: {
          attributes: toAttributes({
            "service.name": (import.meta.env.VITE_OTEL_SERVICE_NAME as string | undefined) ?? "finanzzi-web",
            "deployment.environment": (import.meta.env.MODE as string | undefined) ?? "production",
          }),
        },
        scopeSpans: [
          {
            scope: { name: "finanzzi-observability" },
            spans: [
              {
                traceId,
                spanId,
                name,
                kind: 1,
                startTimeUnixNano: String(start * 1_000_000),
                endTimeUnixNano: String((start + 1) * 1_000_000),
                attributes: toAttributes(attributes),
                status: { code: status === "error" ? 2 : 1 },
              },
            ],
          },
        ],
      },
    ],
  };

  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch(url, {
      method: "POST",
      body,
      headers: { "content-type": "application/json" },
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Telemetry must never break the product.
  }
}

export function initObservability() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  captureTelemetry("app.bootstrap");

  window.addEventListener("error", (event) => {
    captureTelemetry(
      "browser.error",
      {
        message: event.message?.slice(0, 180),
        source: event.filename?.slice(-120),
        line: event.lineno,
        column: event.colno,
      },
      "error",
    );
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason instanceof Error ? event.reason.message : String(event.reason ?? "unknown");
    captureTelemetry("browser.unhandled_rejection", { message: reason.slice(0, 180) }, "error");
  });

  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  if (navigation) {
    captureTelemetry("web.navigation", {
      domContentLoadedMs: Math.round(navigation.domContentLoadedEventEnd),
      loadMs: Math.round(navigation.loadEventEnd),
      transferSize: navigation.transferSize,
    });
  }
}
