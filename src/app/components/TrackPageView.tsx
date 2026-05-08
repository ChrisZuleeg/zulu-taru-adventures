"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SKIP = ["/stats", "/write", "/checkin"];

export default function TrackPageView() {
  const pathname = usePathname();
  useEffect(() => {
    if (SKIP.includes(pathname)) return;
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: pathname }),
    }).catch(() => {});
  }, [pathname]);
  return null;
}
