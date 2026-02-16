"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";

type LeafletMap = any;
type LeafletModule = any;

const Geolocalizacion: React.FC = () => {
    const mapRef = useRef<LeafletMap | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [L, setL] = useState<LeafletModule | null>(null);
    const [ubicacionText, setUbicacionText] = useState<string>("");

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
        if (!navigator.geolocation) {
            setUbicacionText("Tu navegador no soporta geolocalización.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (posicion) => {
                const lat = posicion.coords.latitude;
                const lon = posicion.coords.longitude;
                console.log("✅ Ubicación obtenida:", lat, lon);
                setUbicacionText(`Latitud: ${lat.toFixed(6)}, Longitud: ${lon.toFixed(6)}`);
            },
            (error) => {
                console.error("❌ Error obteniendo ubicación:", error);
                setUbicacionText(getErrorMessage(error));
            }
        );
    };

    const ubicacionLeaflet = () => {
        console.log("🗺️ Intentando mostrar mapa...");
        console.log("¿Leaflet cargado?", L !== null);
        console.log("¿Contenedor existe?", mapContainerRef.current !== null);
        
        if (!navigator.geolocation) {
            alert("Tu navegador no soporta geolocalización.");
            return;
        }

        if (!L) {
            alert("Leaflet aún no está cargado. Intenta de nuevo.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (posicion) => {
                const lat = posicion.coords.latitude;
                const lon = posicion.coords.longitude;
                console.log("✅ Ubicación para mapa:", lat, lon);
                mostrarMapa(lat, lon);
            },
            (error) => {
                console.error("❌ Error obteniendo ubicación para mapa:", error);
                alert(getErrorMessage(error));
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

        // Limpiar mapa existente
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
        <main className="p-8 space-y-8">
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">Mi ubicación actual (Texto)</h1>
                
                <Button variant="outline" onClick={ubicacionTextContent}>
                    Mostrar mi ubicación
                </Button>

                {ubicacionText && (
                    <p className="text-sm text-gray-700">{ubicacionText}</p>
                )}
            </div>

            <div className="space-y-4">
                <h1 className="text-2xl font-bold">Mi ubicación actual (Mapa)</h1>
                
                <Button variant="outline" onClick={ubicacionLeaflet}>
                    Mostrar mi ubicación con Leaflet
                </Button>

                <div 
                    ref={mapContainerRef}
                    id="map" 
                    style={{ 
                        width: '100%', 
                        height: '400px',
                        backgroundColor: '#e0e0e0',
                        border: '2px solid #333'
                    }}
                />
            </div>
        </main>
    );
};

export default Geolocalizacion;