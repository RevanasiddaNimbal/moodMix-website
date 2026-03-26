import { useState } from "react";
import axios from "../../api/axios";
import styles from "./Login.module.css";
import { useNavigate } from "react-router-dom";
import { showMessage } from "../Message";

export default function Login() {
  const [user, setuser] = useState({ email: "", password: "" });
  const [showpass, setshowpass] = useState(false);
  const [loading, setloading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setloading(true);
    try {
      const response = await axios.post("/auth/login", user);
      sessionStorage.setItem("isAuth", "true");
      navigate("/");
      await showMessage(response.data?.message || "Login successfull");
      setuser({ email: "", password: "" });
    } catch (err) {
      const data = err.response?.data;

      if (data?.redirect) {
        await showMessage(
          data.message || "Please verify your account.Otp sent to your email.",
        );
        navigate("/verify-otp", { state: { email: data.user.email } });
        setuser({ email: "", password: "" });
        setloading(false);
        return;
      }

      await showMessage(data?.error || "Login failed. Try again.");
      if (
        data?.error.includes(
          "No account found with this email. Please register first.",
        )
      ) {
        navigate("/register");
      }
      setloading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Welcome Back</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={user.email}
            onChange={(e) => setuser({ ...user, email: e.target.value })}
            required
          />
          <div className={styles.hidepassword}>
            <input
              type={showpass ? "text" : "password"}
              placeholder="Enter Password"
              value={user.password}
              onChange={(e) => setuser({ ...user, password: e.target.value })}
              required
            />
            <span
              className={styles.hideicon}
              onClick={() => setshowpass(!showpass)}
            ></span>
          </div>
          <div className={styles.forgotPasswordWrapper}>
            <p
              className={styles.forgotPassword}
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </p>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className={styles.registerText}>
          Don't have an account?{" "}
          <button
            className={styles.registerLink}
            onClick={() => navigate("/register")}
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
}
