/// <reference types="@types/google.maps" />
import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

interface RoadPathProps {
  path: google.maps.LatLngLiteral[];
  color: string;
  weight: number;
  opacity?: number;
}

export const RoadPath = ({ path, color, weight, opacity = 0.8 }: RoadPathProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const polyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: opacity,
      strokeWeight: weight,
      map: map
    });

    return () => {
      polyline.setMap(null);
    };
  }, [map, path, color, weight, opacity]);

  return null;
};

interface RiskCircleProps {
  center: google.maps.LatLngLiteral;
  radius: number;
  color: string;
}

export const RiskCircle = ({ center, radius, color }: RiskCircleProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const circle = new google.maps.Circle({
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: color,
      fillOpacity: 0.35,
      map,
      center,
      radius,
    });

    return () => {
      circle.setMap(null);
    };
  }, [map, center, radius, color]);

  return null;
};
