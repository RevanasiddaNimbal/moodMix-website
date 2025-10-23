import styles from "./Loading.module.css";
export default function LoadingComponent() {
  return (
    <div className={styles.loadingWrapper}>
      <div className={styles.loadingContainer}>
        <p className={styles.loadingText}>loading</p>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
      </div>
    </div>
  );
}
