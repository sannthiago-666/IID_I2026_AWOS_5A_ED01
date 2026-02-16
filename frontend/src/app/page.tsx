import Geolocalizacion from "./geolocation/geolocation";
import MapaLeaflet from "./geolocation/leaflet";

export default function Home() {
  return (
    <main className="container mx-auto p-6 space-y-6 max-w-5xl">
        <Geolocalizacion />
        <MapaLeaflet />
    </main>
  );
}
