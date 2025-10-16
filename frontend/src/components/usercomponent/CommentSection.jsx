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
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjp0D4qksdRwetC85qVWg0XVhQxDHG-oBeBg&s",
  },
  {
    name: "Elena Rodriguez",
    role: "Wellness Coach",
    content:
      "I recommend MoodTune to all my clients. It's like having a personal DJ who understands your emotional journey.",
    rating: 5,
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRUosWkU8Vl6KpoupDCiqHO9U3XnmvW64IiQ&s",
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
