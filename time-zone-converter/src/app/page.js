import TimeZoneConverter from "@/components/TimeZoneConverter";
import style from "./page.module.css";

export default function Home() {
  return (
    <main className="wrapper"
	style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      padding: "2rem",
      background: "url('/images/palm_trees.webp') center / cover no-repeat fixed",
      color: "var(--fg, #f5f5f5)",
      fontFamily: "system-ui, sans-serif",
    }}>
      <TimeZoneConverter />
    </main>
  );
}
