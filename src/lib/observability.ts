export type TelemetryValue = string | number | boolean;

type OtlpAttribute = {
  key: string;
  value: { stringValue?: string; intValue?: string; boolValue?: boolean };
};

const MAX_ATTRIBUTES = 24;
const MAX_STRING_LENGTH = 120;
const BLOCKED_ATTRIBUTE_KEY = /(password|passwd|secret|token|authorization|cookie|email|phone|cpf|card|account|transaction|amount|balance|income|expense|raw|description|message|stack|name)/i;

let initialized = false;
let lastRoute: string | null = null;

function randomHex(bytes: number): string {
  const values = new Uint8Array(bytes);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => value.toString(16).padStart(2, "0")).join("");
}

function configuredSampleRate(): number {
  const raw = Number(import.meta.env.VITE_OTEL_SAMPLE_RATE ?? "1");
  if (!Number.isFinite(raw)) return 1;
  return Math.min(1, Math.max(0, raw));
}

function isEnabled(): boolean {
  const configured = String(import.meta.env.VITE_OTEL_ENABLED ?? "true").toLowerCase();
  return configured !== "false" && configured !== "0";
}

function endpoint(): string | null {
  if (!isEnabled()) return null;
  const configured = import.meta.env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT as string | undefined;
  if (!configured) return null;

  try {
    const normalized = configured.replace(/\/$/, "");
    const url = new URL(normalized.endsWith("/v1/traces") ? normalized : `${normalized}/v1/traces`);
    const localHttp = url.protocol === "http:" && /^(localhost|127\.0\.0\.1)$/i.test(url.hostname);
    if (url.protocol !== "https:" && !localHttp) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function sanitizeString(value: string): string {
  return value
    .replace(/[?#].*$/, "")
    .replace(/[\r\n\t]+/g, " ")
    .trim()
    .slice(0, MAX_STRING_LENGTH);
}

export function sanitizeTelemetryAttributes(
  input: Record<string, TelemetryValue | undefined>,
): Record<string, TelemetryValue> {
  const safe: Record<string, TelemetryValue> = {};

  for (const [key, value] of Object.entries(input)) {
    if (Object.keys(safe).length >= MAX_ATTRIBUTES) break;
    if (value === undefined || BLOCKED_ATTRIBUTE_KEY.test(key)) continue;

    const normalizedKey = key.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 80);
    if (!normalizedKey) continue;

    if (typeof value === "string") {
      const sanitized = sanitizeString(value);
      if (!sanitized) continue;
      safe[normalizedKey] = sanitized;
    } else {
      safe[normalizedKey] = value;
    }
  }

  return safe;
}

function toAttributes(input: Record<string, TelemetryValue | undefined>): OtlpAttribute[] {
  return Object.entries(sanitizeTelemetryAttributes(input)).map(([key, value]) => {
    if (typeof value === "boolean") return { key, value: { boolValue: value } };
    if (typeof value === "number") return { key, value: { intValue: String(value) } };
    return { key, value: { stringValue: value } };
  });
}

function shouldSample(): boolean {
  return Math.random() <= configuredSampleRate();
}

function routePath(): string {
  if (typeof window === "undefined") return "/";
  return window.location.pathname.slice(0, 160) || "/";
}

export function captureTelemetry(
  name: string,
  attributes: Record<string, TelemetryValue | undefined> = {},
  status: "ok" | "error" = "ok",
) {
  if (typeof window === "undefined" || !shouldSample()) return;
  const url = endpoint();
  if (!url) return;

  const now = Date.now();
  const safeName = name.replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 120) || "app.event";
  const payload = {
    resourceSpans: [{
      resource: {
        attributes: toAttributes({
          "service.name": (import.meta.env.VITE_OTEL_SERVICE_NAME as string | undefined) ?? "finanzzi-web",
          "deployment.environment": import.meta.env.MODE ?? "production",
          "service.version": import.meta.env.VITE_APP_VERSION as string | undefined,
        }),
      },
      scopeSpans: [{
        scope: { name: "finanzzi-observability", version: "1" },
        spans: [{
          traceId: randomHex(16),
          spanId: randomHex(8),
          name: safeName,
          kind: 1,
          startTimeUnixNano: String(now * 1_000_000),
          endTimeUnixNano: String((now + 1) * 1_000_000),
          attributes: toAttributes({ route: routePath(), ...attributes }),
          status: { code: status === "error" ? 2 : 1 },
        }],
      }],
    }],
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
    // Observability must never break the product.
  }
}

function captureRouteIfChanged() {
  const route = routePath();
  if (route === lastRoute) return;
  lastRoute = route;
  captureTelemetry("ui.route_view", { route });
}

function instrumentRouteChanges() {
  captureRouteIfChanged();

  const notify = () => window.dispatchEvent(new Event("finanzzi:route-change"));
  const originalPushState = window.history.pushState.bind(window.history);
  const originalReplaceState = window.history.replaceState.bind(window.history);

  window.history.pushState = (...args) => {
    originalPushState(...args);
    notify();
  };

  window.history.replaceState = (...args) => {
    originalReplaceState(...args);
    notify();
  };

  window.addEventListener("popstate", notify);
  window.addEventListener("finanzzi:route-change", captureRouteIfChanged);
}

function instrumentNavigationTiming() {
  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  if (!navigation) return;

  captureTelemetry("web.navigation", {
    domContentLoadedMs: Math.round(navigation.domContentLoadedEventEnd),
    loadMs: Math.round(navigation.loadEventEnd),
    transferSize: navigation.transferSize,
  });
}

export function initObservability() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  captureTelemetry("app.bootstrap");
  instrumentRouteChanges();

  window.addEventListener("error", (event) => {
    const errorType = event.error instanceof Error ? event.error.name : typeof event.error;
    captureTelemetry("browser.error", {
      errorType: String(errorType).slice(0, 80),
      line: event.lineno,
      column: event.colno,
    }, "error");
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reasonType = event.reason instanceof Error ? event.reason.name : typeof event.reason;
    captureTelemetry("browser.unhandled_rejection", {
      reasonType: String(reasonType).slice(0, 80),
    }, "error");
  });

  instrumentNavigationTiming();
}
