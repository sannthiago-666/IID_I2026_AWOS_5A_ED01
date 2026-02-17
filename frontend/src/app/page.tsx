import Image from "next/image";
import Geolocalizacion from "./geolocation/geolocation";
import MapaLeaflet from "./geolocation/leaflet";
// import MostrarPuntos from "./geolocation/mostrarPuntos";

export default function Home() {
  return (
    <main className="container mx-auto p-6 space-y-6 max-w-5xl">
        <Geolocalizacion />
        <MapaLeaflet />
        {/* <MostrarPuntos /> */}
        <Image src="/1a32ac7b-0c7b-418f-b9ea-d9ce71282a5f.jpg" alt="description" width={500} height={500} />
    </main>
  );
}
