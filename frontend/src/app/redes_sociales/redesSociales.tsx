"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";

const Geolocalizacion: React.FC = () => {
    const [ubicacionText, setUbicacionText] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const obtenerUbicacion = () => {
        setIsLoading(true);
        
        if (!navigator.geolocation) {
            setUbicacionText("Tu navegador no soporta geolocalización.");
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (posicion) => {
                const lat = posicion.coords.latitude;
                const lon = posicion.coords.longitude;
                setUbicacionText(`Latitud: ${lat.toFixed(6)}, Longitud: ${lon.toFixed(6)}`);
                setIsLoading(false);
            },
            (error) => {
                console.error("Error obteniendo ubicación:", error);
                setUbicacionText(getErrorMessage(error));
                setIsLoading(false);
            }
        );
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

    return (
        <div>
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
                        onClick={obtenerUbicacion}
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? "Obteniendo ubicación..." : "Mostrar mi ubicación"}
                    </Button>

                    {ubicacionText && (
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm font-mono">{ubicacionText}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>      
    );
};

export default Geolocalizacion;