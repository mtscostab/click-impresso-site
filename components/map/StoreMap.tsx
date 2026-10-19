"use client";

import { useEffect, useImperativeHandle, useRef, useState, type RefObject } from "react";
import * as maplibregl from "maplibre-gl";
type MLMap = maplibregl.Map;
type Marker = maplibregl.Marker;

// O worker é servido de /public para não depender do bundler
maplibregl.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
import "maplibre-gl/dist/maplibre-gl.css";
import { stores, telHref, type Store } from "@/lib/stores";
import { VIEWS, type MapView } from "./views";

export type StoreMapHandle = {
  fly: (v: MapView, duration?: number) => void;
  focus: (s: Store) => void;
};

const STYLE = "https://tiles.openfreemap.org/styles/liberty";

type Props = {
  handle?: RefObject<StoreMapHandle | null>;
  initial?: MapView;
  interactive?: boolean;
  active?: string;
  onSelect?: (s: Store) => void;
};

export function StoreMap({ handle, initial = VIEWS.sul, interactive = true, active, onSelect }: Props) {
    const box = useRef<HTMLDivElement>(null);
    const map = useRef<MLMap | null>(null);
    const markers = useRef<Map<string, { m: Marker; el: HTMLElement }>>(new Map());
    const [failed, setFailed] = useState(false);
    const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const select = useRef(onSelect);
    select.current = onSelect;

    useEffect(() => {
      if (!box.current) return;
      let m: MLMap;
      try {
        m = new maplibregl.Map({
          container: box.current,
          style: STYLE,
          center: initial.center,
          zoom: initial.zoom,
          pitch: initial.pitch,
          bearing: initial.bearing,
          attributionControl: { compact: true },
          interactive,
          cooperativeGestures: interactive,
          maxPitch: 75,
        });
      } catch {
        setFailed(true);
        return;
      }
      map.current = m;
      if (interactive) m.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");
      m.on("error", (e) => {
        if (String(e?.error?.message ?? "").includes("Failed to fetch")) setFailed(true);
      });
      m.on("load", () => {
        // prédios em 3D com a cor do papel e um toque de luz
        const layer = m.getStyle().layers?.find((l) => l.type === "fill-extrusion");
        if (layer) {
          m.setPaintProperty(layer.id, "fill-extrusion-color", "#e9e6e1");
          m.setPaintProperty(layer.id, "fill-extrusion-opacity", 0.92);
        }
      });
      stores.forEach((s) => {
        if (!s.coords) return;
        const el = document.createElement("button");
        el.className = "pin" + (s.email.startsWith("atendimento") ? " hq" : "");
        el.setAttribute("aria-label", s.name);
        el.type = "button";
        const popup = new maplibregl.Popup({ offset: 18, closeButton: false }).setHTML(
          `<strong>${s.name}</strong>${s.address}<br/><a href="${telHref(s.phone)}">${s.phone}</a>`,
        );
        const marker = new maplibregl.Marker({ element: el }).setLngLat(s.coords).setPopup(popup).addTo(m);
        el.addEventListener("click", () => select.current?.(s));
        markers.current.set(s.email, { m: marker, el });
      });
      return () => {
        if (popupTimer.current) clearTimeout(popupTimer.current);
        markers.current.clear();
        m.remove();
        map.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      markers.current.forEach(({ el }, k) => el.classList.toggle("on", k === active));
    }, [active]);

    useImperativeHandle(handle, () => ({
      fly(v, duration = 2600) {
        map.current?.flyTo({ ...v, duration, essential: false, curve: 1.5 });
      },
      focus(s) {
        if (!s.coords || !map.current) return;
        map.current.flyTo({ center: s.coords, zoom: 15.8, pitch: 62, bearing: -20, duration: 2200, essential: false });
        markers.current.forEach(({ m }) => m.getPopup()?.remove());
        const mk = markers.current.get(s.email);
        if (popupTimer.current) clearTimeout(popupTimer.current);
        if (mk) popupTimer.current = setTimeout(() => {
          if (map.current && !mk.m.getPopup()?.isOpen()) mk.m.togglePopup();
        }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 900);
      },
    }));

    return (
      <div className="map-canvas">
        {/* o MapLibre força position: relative no próprio container, por isso ele fica num filho de altura total */}
        <div ref={box} style={{ width: "100%", height: "100%" }} />
        {failed && <div className="map-fallback">Não foi possível carregar o mapa agora. A lista de lojas continua ao lado.</div>}
      </div>
    );
  }
