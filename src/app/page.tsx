"use client";
import dynamic from "next/dynamic";

const CinemaApp = dynamic(() => import("@/components/CinemaApp"), {
  ssr: false,
  loading: () => (
    <div style={{
      background: "#f5f0e8",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, sans-serif",
      color: "#7a8c72"
    }}>
      Loading…
    </div>
  ),
});

export default function Home() {
  return <CinemaApp />;
}
