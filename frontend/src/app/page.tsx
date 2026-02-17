import Geolocalizacion from "./geolocation/geolocation";
import MapaLeaflet from "./geolocation/leaflet";
// import MostrarPuntos from "./geolocation/mostrarPuntos";

export default function Home() {
  return (
    <main className="container mx-auto p-6 space-y-6 max-w-5xl">
        <Geolocalizacion />
        <MapaLeaflet />
        {/* <MostrarPuntos /> */}
        <img src="/frontend/public/3df5f4d4-5740-4a62-a4da-2b6e7b4e9999.webp"></img>
    </main>
  );
}
