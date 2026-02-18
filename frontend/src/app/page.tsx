"use client";

import React, { useState } from "react";
import NavigationMenuDemo from "./recursos/drawer";
import Geolocalizacion from "./geolocation/geolocation";
import MapaLeaflet from "./geolocation/leaflet";
import MostrarPuntos from "./geolocation/mostrarPuntos";
import CalcularDistancia from "./geolocation/distancia";
import GuardarUbicacion from "./geolocation/guardarUbicacion";
import RedesSociales from "./redes_sociales/redesSociales";
import BaseDeDatos from "./base_de_datos/baseDeDatos";

// Tipos para las vistas disponibles
type VistaType = 
  | "inicio"
  | "geolocation-texto"
  | "geolocation-leaflet"
  | "geolocation-dos-puntos"
  | "geolocation-distancia"
  | "geolocation-guardar"
  | "redes-sociales"
  | "base-datos";

export default function Home() {
  const [vistaActual, setVistaActual] = useState<VistaType>("inicio");

  const renderContenido = () => {
    switch (vistaActual) {
      case "geolocation-texto":
        return <Geolocalizacion />;
      
      case "geolocation-leaflet":
        return <MapaLeaflet />;
      
      case "geolocation-dos-puntos":
        return <MostrarPuntos />;
      
      case "geolocation-distancia":
        return <CalcularDistancia />;
      
      case "geolocation-guardar":
        return <GuardarUbicacion />;
      
      case "redes-sociales":
        return <RedesSociales />;
      
      case "base-datos":
        return <BaseDeDatos />;
      
      case "inicio":
      default:
        return (
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold mb-4">Bienvenido</h1>
            <p className="text-muted-foreground">
              Selecciona una opción del menú superior para comenzar
            </p>
          </div>
        );
    }
  };

  return (
    <main className="container mx-auto p-6 space-y-6 max-w-5xl">
      <NavigationMenuDemo onVistaChange={setVistaActual} />
      <div>
        {renderContenido()}
      </div>
    </main>
  );
}