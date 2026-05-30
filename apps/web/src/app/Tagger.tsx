"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { setTags } from "@demo/sdk";

function getFeature(pathname: string): string {
  if (pathname === "/") return "home";
  if (pathname === "/hotels") return "hotels";
  if (pathname.startsWith("/hotels/")) return "hotel_detail";
  if (pathname === "/payment") return "payment";
  if (pathname === "/checkout") return "checkout";
  const seg = pathname.split("/").filter(Boolean)[0];
  return seg ?? "unknown";
}

function getRouteTag(pathname: string): string {
  if (pathname.startsWith("/hotels/") && pathname !== "/hotels") return "/hotels/[hotelId]";
  return pathname;
}

export default function Tagger() {
  const pathname = usePathname();
  const pageRoute = useMemo(() => getRouteTag(pathname), [pathname]);
  const feature = useMemo(() => getFeature(pathname), [pathname]);

  useEffect(() => {
    setTags({ service: "fe", "page.route": pageRoute, feature });
  }, [pageRoute, feature]);

  return null;
}
