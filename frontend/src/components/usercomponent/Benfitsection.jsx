import styles from "./Benfitsection.module.css";
const benefits = [
  {
    icon: "🎭",
    title: "AI Mood Detection",
    text: "Instantly detects your mood and picks the right music & videos.",
  },
  {
    icon: "🎶",
    title: "Music + Videos",
    text: "Enjoy both audio and video playlists in one place.",
  },
  {
    icon: "⚡",
    title: "Quick & Easy",
    text: "Just one click and your vibe is matched automatically.",
  },
  {
    icon: "🧘",
    title: "Mental Wellness",
    text: "Calm, focus, or energize yourself with curated exercises.",
  },
];
export default function BenfitSection() {
  return (
    <section className={styles.benefitsSection}>
      <h2 className={styles.heading}>✨ Why Choose Us?</h2>
      <div className={styles.grid}>
        {benefits.map((benefit, i) => (
          <div key={i} className={styles.card}>
            <span className={styles.icon}>{benefit.icon}</span>
            <h3>{benefit.title}</h3>
            <p>{benefit.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
