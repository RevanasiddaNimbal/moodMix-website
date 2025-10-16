import { Camera, Brain, Headphones } from "lucide-react";
import styles from "./how-it-works.module.css";

const steps = [
  {
    icon: Camera,
    title: "Detect Mood",
    description:
      "Our AI analyzes your facial expressions or you can manually select your current mood",
    step: "01",
  },
  {
    icon: Brain,
    title: "AI Recommendation",
    description:
      "Advanced algorithms curate the perfect playlist based on your emotional state",
    step: "02",
  },
  {
    icon: Headphones,
    title: "Instant Playback",
    description:
      "Start listening immediately to music that perfectly matches your vibe",
    step: "03",
  },
];

export default function HowItWorks() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            How It <span className={styles.titleAccent}>Works</span>
          </h2>
          <p className={styles.description}>
            Three simple steps to discover your perfect soundtrack
          </p>
        </div>

        <div className={styles.grid}>
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className={styles.stepCard}>
                <div className={styles.stepNumber}>{step.step}</div>

                <div className={styles.iconContainer}>
                  <div className={styles.iconWrapper}>
                    <Icon className={styles.icon} />
                  </div>
                </div>

                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>

                {index < steps.length - 1 && (
                  <div className={styles.connector}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
