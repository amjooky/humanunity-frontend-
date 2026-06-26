"use client";

import * as React from "react";

export function RegisterSW() {
  React.useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Register the service worker with update-on-reload behavior
    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .then((registration) => {
        console.log("[SW] Registered with scope:", registration.scope);

        // Check for updates immediately on page load
        registration.update();

        // If there's a waiting worker, activate it immediately
        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        // Listen for new service workers becoming available
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New SW is installed and there's an existing one — activate immediately
              newWorker.postMessage({ type: "SKIP_WAITING" });
              console.log("[SW] New version activated");
            }
          });
        });
      })
      .catch((error) => {
        console.error("[SW] Registration failed:", error);
      });

    // When the controlling SW changes, reload to get the new version
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        console.log("[SW] Controller changed — reloading for fresh content");
        window.location.reload();
      }
    });
  }, []);

  return null;
}
