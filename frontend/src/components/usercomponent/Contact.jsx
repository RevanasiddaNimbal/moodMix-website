import { useNavigate } from "react-router-dom";
import styles from "./Contact.module.css";
export default function Contact() {
  const navigate = useNavigate();
  return (
    <div className={styles.page}>
      <div
        className={styles.logoSection}
        onClick={() => navigate("/")}
        role="button"
      >
        <img
          src="https://d1csarkz8obe9u.cloudfront.net/posterpreviews/music-logo-design-template-b615c48e5016a72b335fc16252cd4993_screen.jpg?ts=1691430592"
          alt="mood Mix"
          className={styles.logo}
        />
        <span className={styles.brand}>MoodMix</span>
      </div>
      <div className={styles.content}>
        <h1>Contact Us</h1>

        <p>
          If you need help, please visit our{" "}
          <a href="https://support.google.com/youtube/">Help Center</a>. There
          you'll find answers to many common questions about creating an
          account, watching and uploading videos, and maintaining your channel.
        </p>

        <p>
          If you're unable to find what you're looking for in the Help Center,
          we suggest visiting our{" "}
          <a href="https://support.google.com/forum/p/youtube">
            Community Help Forum
          </a>
          . Experiencing a bug? Take a look at our{" "}
          <a href="https://support.google.com/youtube/bin/static.py?page=known_issues.cs">
            Current Site Issues
          </a>{" "}
          page to see a list of known issues we're working to fix.
        </p>

        <h2>Media Relations</h2>
        <p>
          <a href="https://about.youtube/">This area</a> contains media contact
          information, press releases, b-roll footage, FAQs, and our interactive
          timeline.
        </p>

        <h2>Partner Program</h2>
        <p>
          If you're interested in joining the YouTube Partner Program, visit our{" "}
          <a href="https://www.youtube.com/yt/creators/get-started.html">
            information page
          </a>{" "}
          to learn more about it.
        </p>

        <h2>Advertising</h2>
        <p>
          Whether an AdAge 100 advertiser or a local retailer, everyone can
          broadcast their ad campaign on YouTube and tap into the world's
          largest online video community.{" "}
          <a href="https://business.google.com/in/ad-solutions/youtube-ads/">
            Learn the basics to advertising on YouTube
          </a>
          .
        </p>

        <h1>Security</h1>
        <h2>Abuse Issues</h2>
        <p>
          For any abuse issues on the site, please contact us through the{" "}
          <a href="https://support.google.com/youtube/bin/topic.py?topic=13044">
            Abuse and Policy Center
          </a>
          .
        </p>

        <h2>Site Security Issues</h2>
        <p>
          If you want to report a security issue with the YouTube site, please{" "}
          <a href="https://support.google.com/youtube/answer/77402">
            visit us here
          </a>
          .
        </p>

        <h1>Legal</h1>
        <h2>Grievance Mechanism for users in India</h2>
        <p>
          If you want to file a Legal complaint against content hosted on
          YouTube under applicable local laws, please visit the dedicated{" "}
          <a href="https://support.google.com/youtube/answer/10728153">
            Grievance Mechanism page
          </a>
          .
        </p>

        <p>
          You may use the Grievance Mechanism to file complaints on a range of
          issues such as (but not limited to) defamation, copyright,
          counterfeit, impersonation, etc.
        </p>

        <h2>Content ID Program</h2>
        <p>
          If you're interested in being part of our Content ID program, please
          visit the <a href="https://support.google.com/">Content ID</a> page.
        </p>

        <h2>Inappropriate Content</h2>
        <p>
          To report an inappropriate video on YouTube, please click the "Flag"
          link under the video. For details on our policy, please{" "}
          <a href="https://support.google.com/">read the Terms of Service</a>.
        </p>

        <h1>Additional Contact Information</h1>
        <h2>Developers</h2>
        <p>
          If you're a developer or interested in our APIs, please visit the{" "}
          <a href="https://support.google.com/">Developer area</a>.
        </p>

        <h2>Submit Additional Content to Google</h2>
        <p>
          <a href="http://www.google.com/submit_content.html">
            See all opportunities
          </a>{" "}
          to distribute your content for free across Google including gadgets,
          product search, local business center and books.
        </p>
      </div>

      <footer className={styles.footer}>
        <h2>Service of Summons or Notices</h2>
        <p>
          Google LLC, D/B/A YouTube <br />
          901 Cherry Ave <br />
          San Bruno, CA 94066 <br />
          USA
        </p>

        <h2>Local Contact Address in India</h2>
        <p>
          Attn: Suraj Rao <br />
          Resident Grievance Officer for YouTube <br />
          Google LLC - India Liaison Office <br />
          Unit No. 26, The Executive Center, <br />
          Level 8, DLFCentre, Sansad Marg, <br />
          Connaught Place, New Delhi - 110001
        </p>

        <p>
          <strong>E-Mail:</strong> support-in@google.com
        </p>
      </footer>
    </div>
  );
}
