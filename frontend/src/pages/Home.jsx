import HeroSection from "../components/usercomponent/Herosection";
import styles from "./Home.module.css";
import BenfitSection from "../components/usercomponent/Benfitsection";
import Footer from "../components/usercomponent/Footer";
import HowItWorks from "../components/usercomponent/How-it-works";
import CommentSection from "../components/usercomponent/CommentSection";

export default function Home() {
  return (
    <div className={styles.container}>
      <HeroSection />
      <BenfitSection />
      <HowItWorks />
      <CommentSection />
      <Footer />
    </div>
  );
}
