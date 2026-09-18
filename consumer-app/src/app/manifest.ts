import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JurisShorts - 60s Legal Intelligence",
    short_name: "JurisShorts",
    description: "60-word daily judicial rulings, bare acts, and legal awareness for lawyers and citizens.",
    start_url: "/",
    display: "standalone",
    background_color: "#090D16",
    theme_color: "#0F172A",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
