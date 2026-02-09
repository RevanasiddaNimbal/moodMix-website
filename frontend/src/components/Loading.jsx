import styles from "./Loading.module.css";
export default function LoadingComponent() {
  return (
    <div className={styles["loader-container"]}>
      <div className={styles.loader}></div>
    </div>
  );
}
