"use client";

import { useEffect, useRef } from "react";

type Stop = {
  id: number;
  order_num: number;
  name: string;
  state: string;
  lat: number;
  lng: number;
  visited: boolean;
};

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function RouteMap({ stops }: { stops: Stop[] }) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!stops.length) return;

    window.initMap = () => {
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 6,
        center: { lat: 37.5, lng: -111.0 },
        mapTypeId: "terrain",
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
        ],
      });

      const path = stops.map((s) => ({ lat: s.lat, lng: s.lng }));

      new window.google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: "#6B7A2A",
        strokeOpacity: 0.6,
        strokeWeight: 3,
        map,
      });

      stops.forEach((stop) => {
        const marker = new window.google.maps.Marker({
          position: { lat: stop.lat, lng: stop.lng },
          map,
          title: stop.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: stop.visited ? "#6B7A2A" : "#E8D5A3",
            fillOpacity: 1,
            strokeColor: "#6B7A2A",
            strokeWeight: 2,
            scale: stop.visited ? 10 : 8,
          },
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div style="font-family:sans-serif;padding:4px 2px">
            <strong>${stop.name}</strong>, ${stop.state}
            ${stop.visited ? '<br/><span style="color:#6B7A2A;font-size:12px">✓ Visited</span>' : ""}
          </div>`,
        });

        marker.addListener("click", () => infoWindow.open(map, marker));
      });
    };

    if (!document.getElementById("google-maps-script")) {
      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initMap`;
      script.async = true;
      document.head.appendChild(script);
    } else if (window.google) {
      window.initMap();
    }
  }, [stops]);

  return (
    <div
      ref={mapRef}
      className="w-full rounded-2xl overflow-hidden shadow-sm border border-taru-cream/60"
      style={{ height: "480px" }}
    />
  );
}
