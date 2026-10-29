import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Dame de Bijoux World — bijoux et accessoires à petits prix à Lomé";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Visuel de partage (WhatsApp, Facebook, TikTok bio…) : logo + promesse.
export default async function OpengraphImage() {
  const photo = await readFile(join(process.cwd(), "public/produits/chaine-coquillages-etoiles.jpg"));
  const src = `data:image/jpeg;base64,${photo.toString("base64")}`;
  const embleme = await readFile(join(process.cwd(), "public/marque/embleme-or.png"));
  const logo = `data:image/png;base64,${embleme.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#150b11",
          color: "#fbf7f1",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 70px",
            backgroundImage:
              "radial-gradient(60% 70% at 80% 20%, rgba(201,162,94,0.28), transparent 60%), radial-gradient(50% 60% at 0% 100%, rgba(179,52,94,0.22), transparent 60%)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt="" width={96} height={102} style={{ marginBottom: 30 }} />
          <div style={{ fontSize: 22, letterSpacing: 8, color: "#e6cb94", textTransform: "uppercase" }}>
            Gros… petit prix · Lomé
          </div>
          <div style={{ fontSize: 60, lineHeight: 1.02, marginTop: 28, letterSpacing: 2 }}>DAME DE BIJOUX</div>
          <div style={{ fontSize: 30, letterSpacing: 18, color: "#c9a25e", marginTop: 8 }}>WORLD</div>
          <div style={{ fontSize: 30, lineHeight: 1.35, marginTop: 40, color: "rgba(251,247,241,0.8)", maxWidth: 560 }}>
            Bijoux et accessoires de beauté, en gros et au détail. Commande en un clic sur WhatsApp.
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" width={420} height={630} style={{ objectFit: "cover" }} />
      </div>
    ),
    size,
  );
}
