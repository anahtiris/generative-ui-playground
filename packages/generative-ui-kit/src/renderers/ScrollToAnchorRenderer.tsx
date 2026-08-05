"use client";

import { useEffect } from "react";

// No visible output — this renderer's only job is the scroll side effect,
// triggered once per anchorId via the same render pipeline every other tool uses.
export function ScrollToAnchorRenderer({ anchorId }: { anchorId: string }) {
  useEffect(() => {
    document.getElementById(anchorId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [anchorId]);

  return null;
}
