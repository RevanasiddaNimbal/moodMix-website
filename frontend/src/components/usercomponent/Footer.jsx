import { Headphones, Twitter, Instagram, Youtube, Github } from "lucide-react";
import styles from "./footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brandSection}>
            <div className={styles.brandHeader}>
              <Headphones className={styles.brandIcon} />
              <span className={styles.brandName}>MoodTune</span>
            </div>
            <p className={styles.brandDescription}>
              AI-powered music recommendations that understand your emotions.
              Discover your perfect soundtrack for every moment.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <Twitter className={`${styles.socialIcon} ${styles.twitter}`} />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <Instagram
                  className={`${styles.socialIcon} ${styles.Instagram}`}
                />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <Youtube className={`${styles.socialIcon} ${styles.Youtube}`} />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <Github className={` ${styles.socialIcon} ${styles.Github}`} />
              </a>
            </div>
          </div>

          <div className={styles.linkSection}>
            <h3 className={styles.linkSectionTitle}>Product</h3>
            <ul className={styles.linkList}>
              <li>
                <a href="#" className={styles.link}>
                  Features
                </a>
              </li>
              <li>
                <a href="#" className={styles.link}>
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className={styles.link}>
                  API
                </a>
              </li>
              <li>
                <a href="#" className={styles.link}>
                  Mobile App
                </a>
              </li>
            </ul>
          </div>

          <div className={styles.linkSection}>
            <h3 className={styles.linkSectionTitle}>Support</h3>
            <ul className={styles.linkList}>
              <li>
                <a href="#" className={styles.link}>
                  Help Center
                </a>
              </li>
              <li>
                <a href="/contact" className={styles.link}>
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className={styles.link}>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className={styles.link}>
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={styles.bottomSection}>
          <div className={styles.bottomContent}>
            <p className={styles.copyright}>
              © 2024 MoodTune. All rights reserved.
            </p>
            <p className={styles.madeWith}>
              Made with ❤️ for music lovers everywhere
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
