import { LoopingPreview } from "./looping-preview";
import styles from "./harbor-preview.module.css";

export function HarborPreview({ children }: { children: React.ReactNode }) {
  return (
    <LoopingPreview compact label="harbor preview">
      {children}
      <div className={styles.harbor} data-harbor-preview aria-hidden="true">
        <div className={styles.water} />
        <div className={styles.blue}><div /></div>
        <div className={styles.green}><div /></div>
        <div className={styles.red}><div /></div>
      </div>
    </LoopingPreview>
  );
}
