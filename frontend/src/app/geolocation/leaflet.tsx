"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";

type LeafletMap = any;
type LeafletModule = any;

const MapaLeaflet: React.FC = () => {
    const mapRef = useRef<LeafletMap | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [L, setL] = useState<LeafletModule | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            import('leaflet').then((leafletModule) => {
                setL(leafletModule.default);
                
                // Fix para iconos de Leaflet en Next.js
                delete (leafletModule.default.Icon.Default.prototype as any)._getIconUrl;
                leafletModule.default.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                });
            }).catch(error => {
                console.error("Error cargando Leaflet:", error);
            });
        }
    }, []);

    const mostrarMapa = () => {
        setIsLoading(true);
        
        if (!navigator.geolocation) {
            alert("Tu navegador no soporta geolocalización.");
            setIsLoading(false);
            return;
        }

        if (!L) {
            alert("Leaflet aún no está cargado. Intenta de nuevo.");
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (posicion) => {
                const lat = posicion.coords.latitude;
                const lon = posicion.coords.longitude;
                crearMapa(lat, lon);
                setIsLoading(false);
            },
            (error) => {
                console.error("Error obteniendo ubicación para mapa:", error);
                alert(getErrorMessage(error));
                setIsLoading(false);
            }
        );
    };

    const crearMapa = (lat: number, lon: number) => {
        if (!L || !mapContainerRef.current) {
            console.error("No se puede crear el mapa - falta L o contenedor");
            return;
        }

        // Limpiar mapa anterior si existe
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }

        try {
            // Crear mapa
            const mapa = L.map(mapContainerRef.current).setView([lat, lon], 15);
            mapRef.current = mapa;

            // Añadir tiles de OpenStreetMap
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
            }).addTo(mapa);

            // Añadir marcador
            L.marker([lat, lon])
                .addTo(mapa)
                .bindPopup("Tu ubicación actual")
                .openPopup();
            
        } catch (error) {
            console.error("Error creando el mapa:", error);
        }
    };

    const getErrorMessage = (error: GeolocationPositionError): string => {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                return "Permiso denegado para acceder a la ubicación.";
            case error.POSITION_UNAVAILABLE:
                return "Ubicación no disponible.";
            case error.TIMEOUT:
                return "La solicitud de ubicación ha caducado.";
            default:
                return "Error desconocido.";
        }
    };

    // Limpiar mapa al desmontar componente
    useEffect(() => {
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
            }
        };
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Mi ubicación actual (Mapa)
                </CardTitle>
                <CardDescription>
                    Visualiza tu ubicación en un mapa interactivo
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button 
                    variant="outline" 
                    onClick={mostrarMapa}
                    disabled={isLoading || !L}
                >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? "Cargando mapa..." : "Mostrar mi ubicación con Leaflet"}
                </Button>

                {/* Contenedor del mapa */}
                <div 
                    ref={mapContainerRef}
                    id="map" 
                    className="w-full h-100 rounded-lg border border-border overflow-hidden"
                />
            </CardContent>
        </Card>
    );
};

export default MapaLeaflet;