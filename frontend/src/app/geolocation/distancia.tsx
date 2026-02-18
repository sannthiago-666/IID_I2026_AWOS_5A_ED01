/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Loader2, Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

type LeafletMap = any;
type LeafletModule = any;

const DistanciaPuntos: React.FC = () => {
    const [ubicacionCargada, setUbicacionCargada] = useState<string>("");
    const [ubicacionActual, setUbicacionActual] = useState<{lat: number, lon: number} | null>(null);
    const mapRef = useRef<LeafletMap | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [L, setL] = useState<LeafletModule | null>(null);
    const [isLoadingUbicacion, setIsLoadingUbicacion] = useState(false);
    const [isLoadingMapa, setIsLoadingMapa] = useState(false);

    const [latB, setLatB] = useState<string>("");
    const [lonB, setLonB] = useState<string>("");
    const [distancia, setDistancia] = useState<number | null>(null);

    const [errorValidacion, setErrorValidacion] = useState<string>("");

    useEffect(() => {
        if (typeof window !== 'undefined') {
            import('leaflet').then((leafletModule) => {
                setL(leafletModule.default);
                
                //Fix para iconos de Leaflet en Next.js
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

    const obtenerUbicacionActual = () => {
        setIsLoadingUbicacion(true);
        
        if (!navigator.geolocation) {
            alert("Tu navegador no soporta geolocalización.");
            setIsLoadingUbicacion(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (posicion) => {
                const lat = posicion.coords.latitude;
                const lon = posicion.coords.longitude;
                setUbicacionActual({lat, lon});
                setUbicacionCargada(`Latitud: ${lat.toFixed(6)}, Longitud: ${lon.toFixed(6)}`);
                setIsLoadingUbicacion(false);
            },
            (error) => {
                console.error("Error obteniendo ubicación:", error);
                setUbicacionCargada(getErrorMessage(error));
                setIsLoadingUbicacion(false);
            }
        );
    };

    const calcularDistancia = () => {
        setIsLoadingMapa(true);
        setErrorValidacion(""); // Limpiar errores previos
        
        if (!ubicacionActual) {
            setErrorValidacion("Por favor, primero obtén tu ubicación actual.");
            setIsLoadingMapa(false);
            return;
        }

        if (!latB || !lonB) {
            setErrorValidacion("Por favor, ingresa latitud y longitud del punto B.");
            setIsLoadingMapa(false);
            return;
        }

        const latBNum = parseFloat(latB);
        const lonBNum = parseFloat(lonB);

        // Validar que sean números válidos
        if (isNaN(latBNum) || isNaN(lonBNum)) {
            setErrorValidacion("Las coordenadas deben ser números válidos.");
            setIsLoadingMapa(false);
            return;
        }

        // Validar rangos de coordenadas
        if (latBNum < -90 || latBNum > 90) {
            setErrorValidacion("La latitud debe estar entre -90 y 90.");
            setIsLoadingMapa(false);
            return;
        }

        if (lonBNum < -180 || lonBNum > 180) {
            setErrorValidacion("La longitud debe estar entre -180 y 180.");
            setIsLoadingMapa(false);
            return;
        }

        if (!L) {
            setErrorValidacion("Leaflet aún no está cargado. Intenta de nuevo.");
            setIsLoadingMapa(false);
            return;
        };

        setDistancia(haversine(latBNum, lonBNum));

        crearMapa(latBNum, lonBNum);
        setIsLoadingMapa(false);
    };

    const haversine = (latB: number, lonB: number) => {
        const R = 6371; // km
        const dLat = (latB - ubicacionActual!.lat) * Math.PI / 180;
        const dLon = (lonB - ubicacionActual!.lon) * Math.PI / 180;

        const a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(ubicacionActual!.lat * Math.PI / 180) *
            Math.cos(latB * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const crearMapa = (latBNum: number, lonBNum: number) => {

        if (!ubicacionActual || !latBNum || !lonBNum ) {
            setIsLoadingMapa(false);
            return alert("Por favor, cargue correctamente los datos");
        }

        if (!L || !mapContainerRef.current) {
            alert("No se puede crear el mapa - falta L o contenedor")
            console.error("No se puede crear el mapa - falta L o contenedor");
            return;
        }

        // Limpiar mapa anterior si existe
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }

        try {
            const limites = L.latLngBounds([ubicacionActual, {latBNum, lonBNum}]);

            //Crear mapa
            const mapa = L.map(mapContainerRef.current).fitBounds(limites, {padding: [50,50]});
            mapRef.current = mapa;

            //Añadir tiles de OpenStreetMap
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
            }).addTo(mapa);

            //Añadir marcador
            L.marker(ubicacionActual)
                .addTo(mapa)
                .bindPopup("Tu ubicación actual")
            L.marker([latBNum, lonBNum])
                .addTo(mapa)
                .bindPopup("Punto B")

            //Recta de distancia
            L.polyline([ubicacionActual, [latB, lonB]]).addTo(mapa);
            
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
                    Calcular la distancia entre dos puntos en el mapa.
                </CardTitle>
                <CardDescription>
                    Calcula y muestra la distancia en un mapa entre tu ubicación actual y otro punto definido en los siguientes inputs.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <Button 
                    variant="outline" 
                    onClick={obtenerUbicacionActual}
                    disabled={isLoadingUbicacion}
                >
                    {isLoadingUbicacion && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoadingUbicacion ? "Obteniendo ubicación..." : "Obtener mi ubicación"}
                </Button>
                
                {ubicacionCargada && (
                    <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm font-mono">{ubicacionCargada}</p>
                    </div>
                )}

                {/* Inputs para LatB y LonB */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Punto B - Latitud</label>
                    <Input
                        type="number" 
                        placeholder="Ej: 40.7128" 
                        value={latB}
                        onChange={(e) => setLatB(e.target.value)}
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-sm font-medium">Punto B - Longitud</label>
                    <Input
                        type="number" 
                        placeholder="Ej: -74.0060" 
                        value={lonB}
                        onChange={(e) => setLonB(e.target.value)}
                        step="0.000001"
                    />
                </div>

                {errorValidacion && (
                    <Alert variant="destructive">
                        <AlertDescription>{errorValidacion}</AlertDescription>
                    </Alert>
                )}

                {/* Botón para mostrar el mapa */}
                <Button 
                    variant="outline" 
                    onClick={calcularDistancia}
                    disabled={isLoadingMapa || !L}
                >
                    {isLoadingMapa && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoadingMapa ? "Calculando distancia..." : "Calcular distancia y mostrar en el mapa"}
                </Button>

                {distancia && (
                    <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm font-mono">{distancia}km</p>
                    </div>
                )}

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

export default DistanciaPuntos;