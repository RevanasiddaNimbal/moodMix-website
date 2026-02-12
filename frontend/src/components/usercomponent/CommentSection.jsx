import { Star } from "lucide-react";
import styles from "./CommentSection.module.css";

const Users = [
  {
    name: "Karthik",
    role: "Music Producer",
    content:
      "MoodTune's AI is incredibly accurate. It picks up on subtle emotional nuances I didn't even realize I was feeling.",
    rating: 5,
    avatar:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/attachments/gen-images/public/young-man-student-avatar-yOtGpe0tRfV8cbd8tj2lj4XaiSNjjk.png",
  },
  {
    name: "Suharna Jasns",
    role: "Student",
    content:
      "Perfect for study sessions. The focus playlists actually help me concentrate better than anything I've tried.",
    rating: 5,
    avatar:
      "https://imgs.search.brave.com/TxHqwvEYSy18vZIjy8LaEsx-TerJJMmIwcJmoM6sLFs/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNDAv/ODMzLzMwNC9zbWFs/bC9haS1nZW5lcmF0/ZWQtcG9ydHJhaXQt/b2YtYS15b3VuZy1j/b25maWRlbnQtYXNp/YW4td29tYW4tcG9z/aW5nLWluLXRoZS1v/ZmZpY2UtYnVzaW5l/c3MtbGFkeS1waG90/by5qcGc",
  },
  {
    name: "Elena Rodriguez",
    role: "Wellness Coach",
    content:
      "I recommend MoodTune to all my clients. It's like having a personal DJ who understands your emotional journey.",
    rating: 5,
    avatar:
      "https://imgs.search.brave.com/6sQ69PBqVr5_yYBTqxqEZ7lXDilmsYnoomiH9Fzvz8c/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wNTcv/Mzc4LzEyMy9zbWFs/bC9idXNpbmVzc3dv/bWFuLWxlYWRpbmct/YS1tZWV0aW5nLWlu/LWEtbW9kZXJuLW9m/ZmljZS1wcm9mZXNz/aW9uYWwtYXR0aXJl/LWluc3BpcmluZy1w/cmVzZW5jZS1waG90/by5qcGc",
  },
];

export default function CommentSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            What Users <span className={styles.titleAccent}>Say</span>
          </h2>
          <p className={styles.description}>
            Join thousands who've discovered their perfect soundtrack
          </p>
        </div>

        <div className={styles.grid}>
          {Users.map((user) => (
            <div key={user.name} className={styles.testimonialCard}>
              <div className={styles.rating}>
                {[...Array(user.rating)].map((_, i) => (
                  <Star key={i} className={styles.star} />
                ))}
              </div>

              <blockquote className={styles.quote}>"{user.content}"</blockquote>

              <div className={styles.author}>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className={styles.avatar}
                />
                <div className={styles.authorInfo}>
                  <div className={styles.authorName}>{user.name}</div>
                  <div className={styles.authorRole}>{user.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
