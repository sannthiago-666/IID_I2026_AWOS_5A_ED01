"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react"; // Iconos opcionales
import "leaflet/dist/leaflet.css";

type LeafletMap = any;
type LeafletModule = any;

const Geolocalizacion: React.FC = () => {
    const mapRef = useRef<LeafletMap | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [L, setL] = useState<LeafletModule | null>(null);
    const [ubicacionText, setUbicacionText] = useState<string>("");
    const [isLoadingText, setIsLoadingText] = useState(false);
    const [isLoadingMap, setIsLoadingMap] = useState(false);

    useEffect(() => {
        console.log("🔍 Intentando cargar Leaflet...");
        if (typeof window !== 'undefined') {
            import('leaflet').then((leafletModule) => {
                console.log("✅ Leaflet cargado correctamente", leafletModule);
                setL(leafletModule.default);
                
                delete (leafletModule.default.Icon.Default.prototype as any)._getIconUrl;
                leafletModule.default.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                });
            }).catch(error => {
                console.error("❌ Error cargando Leaflet:", error);
            });
        }
    }, []);

    const ubicacionTextContent = () => {
        console.log("📍 Solicitando ubicación (texto)...");
        setIsLoadingText(true);
        
        if (!navigator.geolocation) {
            setUbicacionText("Tu navegador no soporta geolocalización.");
            setIsLoadingText(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (posicion) => {
                const lat = posicion.coords.latitude;
                const lon = posicion.coords.longitude;
                console.log("✅ Ubicación obtenida:", lat, lon);
                setUbicacionText(`Latitud: ${lat.toFixed(6)}, Longitud: ${lon.toFixed(6)}`);
                setIsLoadingText(false);
            },
            (error) => {
                console.error("❌ Error obteniendo ubicación:", error);
                setUbicacionText(getErrorMessage(error));
                setIsLoadingText(false);
            }
        );
    };

    const ubicacionLeaflet = () => {
        console.log("🗺️ Intentando mostrar mapa...");
        console.log("¿Leaflet cargado?", L !== null);
        console.log("¿Contenedor existe?", mapContainerRef.current !== null);
        
        setIsLoadingMap(true);
        
        if (!navigator.geolocation) {
            alert("Tu navegador no soporta geolocalización.");
            setIsLoadingMap(false);
            return;
        }

        if (!L) {
            alert("Leaflet aún no está cargado. Intenta de nuevo.");
            setIsLoadingMap(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (posicion) => {
                const lat = posicion.coords.latitude;
                const lon = posicion.coords.longitude;
                console.log("✅ Ubicación para mapa:", lat, lon);
                mostrarMapa(lat, lon);
                setIsLoadingMap(false);
            },
            (error) => {
                console.error("❌ Error obteniendo ubicación para mapa:", error);
                alert(getErrorMessage(error));
                setIsLoadingMap(false);
            }
        );
    };

    const mostrarMapa = (lat: number, lon: number) => {
        console.log("🎯 Ejecutando mostrarMapa...", lat, lon);
        console.log("Leaflet disponible:", L);
        console.log("Contenedor:", mapContainerRef.current);
        
        if (!L || !mapContainerRef.current) {
            console.error("❌ No se puede crear el mapa - falta L o contenedor");
            return;
        }

        if (mapRef.current) {
            console.log("🧹 Limpiando mapa anterior...");
            mapRef.current.remove();
            mapRef.current = null;
        }

        try {
            console.log("🗺️ Creando mapa...");
            const mapa = L.map(mapContainerRef.current).setView([lat, lon], 15);
            mapRef.current = mapa;
            console.log("✅ Mapa creado:", mapa);

            console.log("🔲 Añadiendo capa de tiles...");
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
            }).addTo(mapa);
            console.log("✅ Tiles añadidos");

            console.log("📍 Añadiendo marcador...");
            L.marker([lat, lon])
                .addTo(mapa)
                .bindPopup("Tu ubicación actual")
                .openPopup();
            console.log("✅ Marcador añadido");
            
        } catch (error) {
            console.error("❌ Error creando el mapa:", error);
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

    useEffect(() => {
        return () => {
            if (mapRef.current) {
                console.log("🧹 Limpiando mapa al desmontar componente");
                mapRef.current.remove();
            }
        };
    }, []);

    return (
        <main className="container mx-auto p-6 space-y-6 max-w-5xl">
            {/* Card para ubicación en texto */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Mi ubicación actual (Texto)
                    </CardTitle>
                    <CardDescription>
                        Obtén tus coordenadas geográficas actuales
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button 
                        variant="outline" 
                        onClick={ubicacionTextContent}
                        disabled={isLoadingText}
                    >
                        {isLoadingText && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoadingText ? "Obteniendo ubicación..." : "Mostrar mi ubicación"}
                    </Button>

                    {ubicacionText && (
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm font-mono">{ubicacionText}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Card para mapa */}
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
                        onClick={ubicacionLeaflet}
                        disabled={isLoadingMap || !L}
                    >
                        {isLoadingMap && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoadingMap ? "Cargando mapa..." : "Mostrar mi ubicación con Leaflet"}
                    </Button>

                    {/* Contenedor del mapa */}
                    <div 
                        ref={mapContainerRef}
                        id="map" 
                        className="w-full h-100 rounded-lg border border-border overflow-hidden"
                    />
                </CardContent>
            </Card>
        </main>
    );
};

export default Geolocalizacion;