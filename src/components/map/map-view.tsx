'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OPPORTUNITY_TYPE_LABELS, OPPORTUNITY_FORMAT_LABELS } from '@/lib/constants';
import { formatSalary } from '@/lib/utils';
import { MapPin } from 'lucide-react';

interface MapOpportunity {
  id: string;
  title: string;
  type: string;
  format: string;
  lat: number;
  lng: number;
  city: string | null;
  salaryFrom: number | null;
  salaryTo: number | null;
  salaryCurrency: string;
  deadline: Date | null;
  company: {
    name: string;
    city: string;
  };
  tags: {
    tag: {
      name: string;
    };
  }[];
}

interface MapViewProps {
  opportunities: MapOpportunity[];
}

// Default center (Moscow)
const DEFAULT_CENTER: [number, number] = [55.7558, 37.6173];

export function MapView({ opportunities }: MapViewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <p>Загрузка карты...</p>
      </div>
    );
  }

  // Filter opportunities with valid coordinates
  const validOpportunities = opportunities.filter(
    (opp) => opp.lat && opp.lng && !isNaN(opp.lat) && !isNaN(opp.lng)
  );

  // Calculate center based on opportunities or use default
  const center = validOpportunities.length > 0
    ? [validOpportunities[0].lat, validOpportunities[0].lng] as [number, number]
    : DEFAULT_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={10}
      scrollWheelZoom={true}
      className="h-full w-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validOpportunities.map((opportunity) => (
        <OpportunityMarker key={opportunity.id} opportunity={opportunity} />
      ))}
    </MapContainer>
  );
}

function OpportunityMarker({ opportunity }: { opportunity: MapOpportunity }) {
  const icon = new Icon({
    iconUrl: '/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: '/marker-shadow.png',
    shadowSize: [41, 41],
  });

  return (
    <Marker position={[opportunity.lat, opportunity.lng]} icon={icon}>
      <Popup>
        <div className="min-w-[200px] p-2">
          <div className="mb-2 flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              {OPPORTUNITY_TYPE_LABELS[opportunity.type as keyof typeof OPPORTUNITY_TYPE_LABELS]}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {OPPORTUNITY_FORMAT_LABELS[opportunity.format as keyof typeof OPPORTUNITY_FORMAT_LABELS]}
            </Badge>
          </div>
          <h3 className="font-semibold text-sm mb-1">{opportunity.title}</h3>
          <p className="text-xs text-gray-600 mb-2">{opportunity.company.name}</p>
          
          {(opportunity.salaryFrom || opportunity.salaryTo) && (
            <p className="text-xs font-medium text-green-600 mb-2">
              {formatSalary(opportunity.salaryFrom, opportunity.salaryTo, opportunity.salaryCurrency)}
            </p>
          )}
          
          <div className="flex flex-wrap gap-1 mb-3">
            {opportunity.tags.slice(0, 3).map(({ tag }, idx) => (
              <span key={idx} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                {tag.name}
              </span>
            ))}
          </div>
          
          <Link href={`/opportunity/${opportunity.id}`}>
            <Button size="sm" className="w-full text-xs">
              Подробнее
            </Button>
          </Link>
        </div>
      </Popup>
    </Marker>
  );
}
