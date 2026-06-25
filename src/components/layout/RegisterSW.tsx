"use client";

import * as React from "react";

export function RegisterSW() {
  React.useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Unregister any stale service workers from the old site (e.g., the coffee shop SW)
      // This fixes the Ctrl+R cache issue where the old site was being served.
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().then((success) => {
            if (success) {
              console.log("[SW] Unregistered stale service worker:", registration.scope);
            }
          });
        }
      });
    }
  }, []);

  return null;
}
