import React, { useMemo } from 'react';
import DashboardCard from './DashboardCard';
import { MapPinIcon } from './icons';
import { Plant } from '../types';

interface PlantsMapProps {
  coordinates: Plant['coordinates'] | undefined;
  t: (key: string) => string;
}

const PlantsMap: React.FC<PlantsMapProps> = ({ coordinates, t }) => {
  const mapEmbedUrl = useMemo(() => {
    const baseUrl = "https://maps.google.com/maps?&output=embed&t=k";

    // If coordinates are provided and valid, center the map on them with a pin.
    if (coordinates && coordinates.lat !== 0) {
      const { lat, lng } = coordinates;
      // The 'q' parameter sets the marker, and 'll' centers the map.
      return `${baseUrl}&z=12&q=${lat},${lng}&ll=${lat},${lng}`;
    }

    // Otherwise, show a default, wider view centered on Southeast Brazil.
    return `${baseUrl}&z=7&ll=-22.95,-44.85`;
  }, [coordinates]);

  return (
    <DashboardCard title={t('config.plantsMapTitle')} icon={<MapPinIcon className="w-6 h-6" />}>
      <div className="w-full h-full min-h-[420px] bg-gray-700 rounded-lg overflow-hidden">
        <iframe
          key={mapEmbedUrl} // Use a key to force iframe re-render on src change
          src={mapEmbedUrl}
          title={t('config.plantsMapTitleIframe')}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </DashboardCard>
  );
};

export default PlantsMap;
