'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import L from "leaflet";

const Geolocalizacion: React.FC = () => {
    const [ubicacion, setUbicacion] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [lat, setLat] = useState<number | null>(null);
    const [lon, setLon] = useState<number | null>(null);

    const obtenerUbicacion = () => {
        // Verificar si el navegador soporta geolocalización
        if (!navigator.geolocation) {
            setError("Tu navegador no soporta geolocalización.");
            return;
        }

        // Solicitar ubicación
        navigator.geolocation.getCurrentPosition(
            (posicion) => {
                const latitude = posicion.coords.latitude;
                const longitude = posicion.coords.longitude;
                setLat(latitude);
                setLon(longitude);
                setUbicacion(`Latitud: ${latitude}, Longitud: ${longitude}`);
                setError('');
            },
            (error) => {
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        setError("Permiso denegado para acceder a la ubicación.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setError("Ubicación no disponible.");
                        break;
                    case error.TIMEOUT:
                        setError("La solicitud de ubicación ha caducado.");
                        break;
                    default:
                        setError("Error desconocido.");
                }
                setUbicacion('');
            }
        );
    };

    const mostrarMapa = (lat: number, lon: number) => {
        const mapa = L.map("mapa").setView([lat, lon], 15);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors"
        }).addTo(mapa);

        L.marker([lat, lon])
            .addTo(mapa)
            .bindPopup("Tu ubicación actual")
            .openPopup();
    };

    return (
        <div>
            <h1>Mi ubicación actual</h1>
            <Button id="btn_geo1" variant="outline" onClick={obtenerUbicacion}>
                Mostrar mi ubicación
            </Button>
            <h1>Mi ubicación en Leaflet</h1>
            <Button id="btn_geo2" variant="outline" onClick={() => lat !== null && lon !== null && mostrarMapa(lat, lon)}>
                Mostrar mi ubicación
            </Button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {ubicacion && <p>{ubicacion}</p>}
        </div>
    );
};

export default Geolocalizacion;