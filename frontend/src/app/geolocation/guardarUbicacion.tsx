/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";

type LeafletMap = any;
type LeafletModule = any;

const GuardarUbicacion: React.FC = () => {
    const [ubicacionCargada, setUbicacionCargada] = useState<string>("");
    const mapRef = useRef<LeafletMap | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [L, setL] = useState<LeafletModule | null>(null);
    const [isLoadingMapa, setIsLoadingMapa] = useState(false);
    const [isLoadingGuardar, setIsLoadingGuardar] = useState(false);
    const [isLoadingUbicaciones, setIsLoadingUbicaciones] = useState(false);
    const [latActual, setLatActual] = useState<string>("");
    const [lonActual, setLonActual] = useState<string>("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            import("leaflet").then((leafletModule) => {
                setL(leafletModule.default);
                
                // Fix para iconos de Leaflet en Next.js
                delete (leafletModule.default.Icon.Default.prototype as any)._getIconUrl;
                leafletModule.default.Icon.Default.mergeOptions({
                    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
                    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
                    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
                });
            }).catch(error => {
                console.error("Error cargando Leaflet:", error);
            });
        }
    }, []);

    const mostrarMapa = () => {
        setIsLoadingMapa(true);
        
        if (!navigator.geolocation) {
            alert("Tu navegador no soporta geolocalización.");
            setIsLoadingMapa(false);
            return;
        }

        if (!L) {
            alert("Leaflet aún no está cargado. Intenta de nuevo.");
            setIsLoadingMapa(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (posicion) => {
                const lat = posicion.coords.latitude;
                const lon = posicion.coords.longitude;
                setUbicacionCargada(`Latitud: ${lat.toFixed(6)}, Longitud: ${lon.toFixed(6)}`);
                setLatActual(lat.toString());
                setLonActual(lon.toString());
                crearMapa(lat, lon);
                setIsLoadingMapa(false);
            },
            (error) => {
                console.error("Error obteniendo ubicación para mapa:", error);
                setUbicacionCargada(getErrorMessage(error));
                setIsLoadingMapa(false);
            }
        );
    };

    const guardarUbicacion = () => {
        setIsLoadingGuardar(true);

        if (!latActual || !lonActual) {
            alert("Primero obtén una ubicación.");
            setIsLoadingGuardar(false);
            return;
        }

        if (typeof window === "undefined") {
            alert("LocalStorage no está disponible.");
            setIsLoadingGuardar(false);
            return;
        }

        try {
            const ubicacionesString = localStorage.getItem("ubicaciones");
            const ubicaciones = ubicacionesString ? JSON.parse(ubicacionesString) : [];

            ubicaciones.push({
                lat: latActual,
                lon: lonActual,
                fecha: new Date().toLocaleString()
            });

            localStorage.setItem("ubicaciones", JSON.stringify(ubicaciones));

            alert("Ubicación guardada correctamente.");
        } catch (error) {
            console.error("Error guardando ubicación:", error);
            alert("Error al guardar la ubicación.");
        }
        
        setIsLoadingGuardar(false);
    };

    const mostrarUbicaciones = () => {
        setIsLoadingUbicaciones(true);

        if (typeof window === "undefined") {
            alert("LocalStorage no está disponible.");
            setIsLoadingUbicaciones(false);
            return;
        }

        if (!mapRef.current || !L) {
            alert("Primero debes mostrar el mapa.");
            setIsLoadingUbicaciones(false);
            return;
        }

        try {
            const ubicacionesString = localStorage.getItem("ubicaciones");
            
            if (!ubicacionesString) {
                alert("No hay ubicaciones guardadas.");
                setIsLoadingUbicaciones(false);
                return;
            }

            const ubicaciones = JSON.parse(ubicacionesString);

            if (!ubicaciones || ubicaciones.length === 0) {
                alert("No hay ubicaciones guardadas.");
                setIsLoadingUbicaciones(false);
                return;
            }

            ubicaciones.forEach((u: any, index: number) => {
                L.marker([parseFloat(u.lat), parseFloat(u.lon)])
                    .addTo(mapRef.current)
                    .bindPopup(
                        `<strong>Punto ${index + 1}</strong><br>` +
                        `Fecha: ${u.fecha}<br>` +
                        `Lat: ${parseFloat(u.lat).toFixed(6)}<br>` +
                        `Lon: ${parseFloat(u.lon).toFixed(6)}`
                    );
            });

            alert(`${ubicaciones.length} ubicación(es) cargada(s) en el mapa.`);
        } catch (error) {
            console.error("Error cargando ubicaciones:", error);
            alert("Error al cargar las ubicaciones.");
        }
        
        setIsLoadingUbicaciones(false);
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
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
                    Guardar mis ubicaciones.
                </CardTitle>
                <CardDescription>
                    Base de datos localstorage de las ubicaciones que hemos guardado en la aplicación.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                        variant="outline" 
                        onClick={mostrarMapa}
                        disabled={isLoadingMapa || !L}
                    >
                        {isLoadingMapa && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoadingMapa ? "Cargando mapa..." : "Mostrar mi ubicación"}
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={guardarUbicacion}
                        disabled={isLoadingGuardar || !L}
                    >
                        {isLoadingGuardar && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoadingGuardar ? "Guardando..." : "Guardar ubicación actual"}
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={mostrarUbicaciones}
                        disabled={isLoadingUbicaciones || !L}
                    >
                        {isLoadingUbicaciones && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoadingUbicaciones ? "Cargando ubicaciones..." : "Cargar ubicaciones guardadas"}
                    </Button>
                </div>

                {ubicacionCargada && (
                    <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm font-mono">Ubicación Actual | {ubicacionCargada}</p>
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

export default GuardarUbicacion;