"use client"

import * as React from "react"
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react"
import { cn } from "@/lib/utils"
import {
NavigationMenu,
NavigationMenuContent,
NavigationMenuItem,
NavigationMenuLink,
NavigationMenuList,
NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { MapPin, Share2, Database } from "lucide-react";

// Tipo para las vistas
type VistaType = 
| "inicio"
| "geolocation-texto"
| "geolocation-leaflet"
| "geolocation-dos-puntos"
| "geolocation-distancia"
| "geolocation-guardar"
| "redes-sociales"
| "base-datos";

interface NavigationMenuDemoProps {
onVistaChange: (vista: VistaType) => void;
}

const NavigationMenuDemo: React.FC<NavigationMenuDemoProps> = ({ onVistaChange }) => {
return (
    <NavigationMenu>
    <NavigationMenuList>
        {/* Menú de Geolocalización */}
        <NavigationMenuItem>
        <NavigationMenuTrigger>
            <MapPin className="h-4 w-4 mr-2" />
            Geolocalización
        </NavigationMenuTrigger>
        <NavigationMenuContent>
            <ul className="w-400 gap-3 p-4">
            <ListItem 
                onClick={() => onVistaChange("geolocation-texto")}
                title="Geolocalización Texto"
            >
                Obtén tus coordenadas geográficas actuales.
            </ListItem>
            <ListItem 
                onClick={() => onVistaChange("geolocation-leaflet")}
                title="Geolocalización con Leaflet"
            >
                Obtén tus coordenadas geográficas actuales usando Leaflet.
            </ListItem>
            <ListItem 
                onClick={() => onVistaChange("geolocation-dos-puntos")}
                title="Mostrar dos ubicaciones diferentes"
            >
                Muestra un mapa con tu ubicación actual y otro punto definido.
            </ListItem>
            <ListItem 
                onClick={() => onVistaChange("geolocation-distancia")}
                title="Distancia entre dos ubicaciones"
            >
                Calcula y muestra la distancia en un mapa entre dos puntos.
            </ListItem>
            <ListItem 
                onClick={() => onVistaChange("geolocation-guardar")}
                title="Guardar ubicaciones"
            >
                Base de datos localStorage de ubicaciones guardadas.
            </ListItem>
            </ul>
        </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Menú de Redes Sociales */}
        <NavigationMenuItem className="hidden md:flex">
        <NavigationMenuTrigger>
            <Share2 className="h-4 w-4 mr-2" />
            Redes Sociales
        </NavigationMenuTrigger>
        <NavigationMenuContent>
            <ul className="w-400 gap-3 p-4">
            <ListItem 
                onClick={() => onVistaChange("redes-sociales")}
                title="Redes sociales"
            >
                API de redes sociales.
            </ListItem>
            </ul>
        </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Menú de Base de Datos */}
        <NavigationMenuItem>
        <NavigationMenuTrigger>
            <Database className="h-4 w-4 mr-2" />
            Base de Datos
        </NavigationMenuTrigger>
        <NavigationMenuContent>
            <ul className="w-400 gap-3 p-4">
            <ListItem 
                onClick={() => onVistaChange("base-datos")}
                title="Base de datos"
            >
                API de base de datos.
            </ListItem>
            </ul>
        </NavigationMenuContent>
        </NavigationMenuItem>
    </NavigationMenuList>
    </NavigationMenu>
);
};

const ListItem = forwardRef<
ElementRef<"button">,
ComponentPropsWithoutRef<"button"> & { title: string }
>(({ className, title, children, onClick, ...props }, ref) => {
return (
    <li>
    <NavigationMenuLink asChild>
        <button
        ref={ref}
        onClick={onClick}
        className={cn(
            "block w-full text-left select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
        )}
        {...props}
        >
        <div className="text-sm font-medium leading-none">{title}</div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
        </p>
        </button>
    </NavigationMenuLink>
    </li>
);
});

ListItem.displayName = "ListItem";

export default NavigationMenuDemo;