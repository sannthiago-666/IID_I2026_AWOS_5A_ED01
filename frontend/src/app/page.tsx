import DistanciaPuntos from "./geolocation/distancia";
import Geolocalizacion from "./geolocation/geolocation";
import GuardarUbicacion from "./geolocation/guardarUbicacion";
import MapaLeaflet from "./geolocation/leaflet";
import MostrarPuntos from "./geolocation/mostrarPuntos";

export default function Home() {
  return (
    <main className="container mx-auto p-6 space-y-6 max-w-5xl">
        <Geolocalizacion />
        <MapaLeaflet />
        <MostrarPuntos />
        <DistanciaPuntos />
        <GuardarUbicacion />
    </main>
  );
}
