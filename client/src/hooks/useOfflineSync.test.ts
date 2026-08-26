import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const offlineSyncSource = readFileSync(
  resolve(process.cwd(), "client/src/hooks/useOfflineSync.ts"),
  "utf8"
);
const serviceWorkerSource = readFileSync(
  resolve(process.cwd(), "client/public/sw.js"),
  "utf8"
);

describe("Service Worker lifecycle", () => {
  it("unregisters old KizunaSync workers and caches during development", () => {
    expect(offlineSyncSource).toContain("import.meta.env.DEV");
    expect(offlineSyncSource).toContain("getRegistrations()");
    expect(offlineSyncSource).toContain("registration.unregister()");
    expect(offlineSyncSource).toContain('cacheName.startsWith("kizuna-sync-")');
  });

  it("uses a versioned cache without serving application modules cache-first", () => {
    expect(serviceWorkerSource).toContain('const CACHE_NAME = "kizuna-sync-v2"');
    expect(serviceWorkerSource).toContain("request.mode === \"navigate\"");
    expect(serviceWorkerSource).toContain('url.pathname.startsWith("/src/")');
    expect(serviceWorkerSource).toContain('url.searchParams.has("t")');
  });
});
