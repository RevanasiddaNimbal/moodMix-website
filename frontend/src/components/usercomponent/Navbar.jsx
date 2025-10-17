import { useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import styles from "./Navbar.module.css";
import { useEffect, useState } from "react";
import axios from "../../api/axios";

export default function Navbar() {
  const [query, setquery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthed(false);
      return;
    }

    axios
      .get("/auth/verify", {
        headers: { "x-verify-token": token },
      })
      .then((res) => {
        if (res.data.success) {
          setIsAuthed(true);
        }
      })
      .catch((err) => {
        console.log(err);
        setIsAuthed(false);
        localStorage.removeItem("token");
      });
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const sidebar = document.getElementById("mobileSidebar");
      const hamburger = document.getElementById("hamburger");
      if (
        sidebar &&
        !sidebar.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;

    const lowerQurey = query.toLowerCase();
    let path;

    if (location.pathname.startsWith("/videos")) path = "/videos";
    else if (location.pathname.startsWith("/musics")) path = "/musics";
    else if (location.pathname.startsWith("/exercise")) path = "/exercise";
    else {
      const musicKeywords = [
        "music",
        "musics",
        "song",
        "songs",
        "track",
        "tracks",
        "album",
        "remix",
        "karaoke",
      ];
      const exerciseKeywords = [
        "exercise",
        "workout",
        "yoga",
        "gym",
        "fitness",
        "training",
        "meditation",
      ];

      if (musicKeywords.some((keyword) => lowerQurey.includes(keyword)))
        path = "/musics";
      else if (exerciseKeywords.some((keyword) => lowerQurey.includes(keyword)))
        path = "/exercise";
      else path = "/videos";
    }

    if (isAuthed) {
      navigate(`${path}?search=${encodeURIComponent(query)}`);
      setquery("");
    } else {
      alert("Please login.");
      navigate("/login");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post("/auth/logout");
      if (response.status === 200 || response.data?.success) {
        localStorage.removeItem("token");
        setIsAuthed(false);
        navigate("/login");
      }
    } catch (err) {
      console.error(err.response?.data.message || err.message);
      alert("An error occurred while logging out.");
    }
  };

  return (
    <>
      <nav className={`${styles.navbar} ${isAuthed ? styles.authNavbar : ""}`}>
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

        <div
          className={`${styles.searchWrapper} ${
            isAuthed ? styles.authSearchWrapper : ""
          }`}
        >
          <Search className={styles.searchBtn} onClick={handleSearch} />

          <input
            type="text"
            placeholder="Search music or videos..."
            className={`${styles.searchBox} ${
              isAuthed ? styles.authSearchBox : ""
            }`}
            value={query}
            onChange={(e) => setquery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        <ul
          className={`${styles.navLinks} ${
            isAuthed ? styles.authNavLinks : ""
          }`}
        >
          <li onClick={() => navigate("/")}>Home</li>
          <li
            onClick={() => (isAuthed ? navigate("/musics") : navigate("login"))}
          >
            Musics
          </li>
          <li
            onClick={() => (isAuthed ? navigate("/videos") : navigate("login"))}
          >
            Videos
          </li>
          <li
            onClick={() =>
              isAuthed ? navigate("/exercise") : navigate("login")
            }
          >
            Exercise
          </li>
          <li
            onClick={() =>
              isAuthed ? navigate("/contact") : navigate("login")
            }
          >
            Contact
          </li>
        </ul>

        {!isAuthed ? (
          <div className={styles.bottonGroup}>
            <button
              className={styles.loginBtn}
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button
              className={styles.signinBtn}
              onClick={() => navigate("/register")}
            >
              Sign In
            </button>
          </div>
        ) : (
          <div className={styles.bottonGroup}>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Logout
            </button>
            {location.pathname == "/" && (
              <button
                className={styles.signinBtn}
                onClick={() => navigate("/capture-face")}
              >
                Get Started
              </button>
            )}
          </div>
        )}
        <div
          className={styles.hamburger}
          id="hamburger"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          <div></div>
          <div></div>
          <div></div>
        </div>
      </nav>

      <div
        className={`${styles.mobileSidebar} ${
          mobileMenuOpen ? styles.showSidebar : ""
        }`}
        id="mobileSidebar"
      >
        <ul>
          <li
            onClick={() => {
              navigate("/");
              setMobileMenuOpen(false);
            }}
          >
            Home
          </li>
          <li
            onClick={() => {
              navigate("/musics");
              setMobileMenuOpen(false);
            }}
          >
            Musics
          </li>
          <li
            onClick={() => {
              navigate("/videos");
              setMobileMenuOpen(false);
            }}
          >
            Videos
          </li>
          <li
            onClick={() => {
              navigate("/exercise");
              setMobileMenuOpen(false);
            }}
          >
            Exercise
          </li>
          <li
            onClick={() => {
              navigate("/contact");
              setMobileMenuOpen(false);
            }}
          >
            Contact
          </li>
          {!isAuthed ? (
            <>
              <li
                onClick={() => {
                  navigate("/login");
                  setMobileMenuOpen(false);
                }}
              >
                Login
              </li>
              <li
                onClick={() => {
                  navigate("/register");
                  setMobileMenuOpen(false);
                }}
              >
                Sign In
              </li>
            </>
          ) : (
            <li onClick={handleLogout}>Logout</li>
          )}
        </ul>
      </div>
    </>
  );
}
