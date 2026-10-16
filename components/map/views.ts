export type MapView = { center: [number, number]; zoom: number; pitch: number; bearing: number };

export const VIEWS: Record<string, MapView> = {
  sul: { center: [-50.3, -27.9], zoom: 5.9, pitch: 38, bearing: 0 },
  "Porto Alegre": { center: [-51.19, -30.04], zoom: 11.6, pitch: 58, bearing: -18 },
  "Região Metropolitana": { center: [-51.14, -29.84], zoom: 9.5, pitch: 50, bearing: 12 },
  Curitiba: { center: [-49.283, -25.4477], zoom: 15.6, pitch: 62, bearing: -30 },
};
