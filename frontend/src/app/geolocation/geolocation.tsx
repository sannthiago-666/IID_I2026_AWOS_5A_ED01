"use client";

import React from "react";
import { Button } from "@/components/ui/button";
const L = typeof window !== 'undefined' ? require('leaflet') : null;
import "leaflet/dist/leaflet.css";

const Geolocalizacion: React.FC = () => {

    const ubicacionTextContent = () => {
        var ubicacionTextContent = document.getElementById("ubicacionTextContent");

        // Verificar si el navegador soporta geolocalización
        verificarSoporteGeolocalizacion(ubicacionTextContent);

        // Solicitar ubicación
        navigator.geolocation.getCurrentPosition(
            (posicion) => {
                const lat = posicion.coords.latitude;
                const lon = posicion.coords.longitude;
                if (ubicacionTextContent) {
                    ubicacionTextContent.textContent = `Latitud: ${lat}, Longitud: ${lon}`;
                }
            },
            (error) => {
                errorHandler(error, ubicacionTextContent);
            }
        );
    };

    function ubicacionLeaflet() {

        const resultado = document.getElementById("ubicacionLeaflet");

        // Verificar si el navegador soporta geolocalización
        verificarSoporteGeolocalizacion(resultado);

        // Solicitar ubicación
        navigator.geolocation.getCurrentPosition(
            (posicion) => {
                const lat = posicion.coords.latitude;
                const lon = posicion.coords.longitude;
                
                mostrarMapa(lat, lon);
                
            },
            (error) => {
                errorHandler(error, resultado);
            }
        );

        function mostrarMapa(lat: number,lon: number) {

            const mapa = L.map("map").setView([lat, lon], 15);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap contributors"
            }).addTo(mapa);

            L.marker([lat, lon])
                .addTo(mapa)
                .bindPopup("Tu ubicación actual")
                .openPopup();
        }
    }

    const verificarSoporteGeolocalizacion = (resultado: HTMLElement | null) => {
        if (!navigator.geolocation) {
            if (resultado) {
                resultado.textContent = "Tu navegador no soporta geolocalización.";
            }
            return;
        }
    };

    const errorHandler = (error: GeolocationPositionError, resultado: HTMLElement | null) => {
        if (!resultado) return;
                
        switch(error.code) {
            case error.PERMISSION_DENIED:
                resultado.textContent = "Permiso denegado para acceder a la ubicación.";
                break;
            case error.POSITION_UNAVAILABLE:
                resultado.textContent = "Ubicación no disponible.";
                break;
            case error.TIMEOUT:
                resultado.textContent = "La solicitud de ubicación ha caducado.";
                break;
            default:
                resultado.textContent = "Error desconocido.";
        }
    };

    return (
        <main>
            <div>
                <h1>Mi ubicación actual</h1>
                
                <Button variant="outline" onClick={ubicacionTextContent}>
                    Mostrar mi ubicación
                </Button>

                <p id="ubicacionTextContent"></p>
            </div>
            <div>
                <h1>Mi ubicación actual</h1>
                
                <Button variant="outline" onClick={ubicacionLeaflet}>
                    Mostrar mi ubicación con Leaflet
                </Button>

                <div id="map"></div>
            </div>
        </main>
    );
};

export default Geolocalizacion;