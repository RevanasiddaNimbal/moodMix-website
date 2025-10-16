import styles from "./Resetpass.module.css";
import { useState } from "react";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function Resetpassword() {
  const [User, setUser] = useState({
    email: "",
    oldpassword: "",
    newpassword: "",
  });
  const [showPass, setshowPass] = useState(false);
  const [showpass, setshowpass] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/reset-password", User);
      if (res.status === 200 || res.success) {
        alert(
          res.data.message || "Password reseted successful. Please login again"
        );
        navigate("/login");
      }
    } catch (err) {
      if (err.response?.status == 401) {
        alert("You are not logged in. Please log in to continue.");
      } else {
        alert(err.response?.data?.error || "Failed to reset password");
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Reset Password</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="email">Email :</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Enter your registered email"
            value={User.email}
            onChange={(e) => setUser({ ...User, email: e.target.value })}
            required
          />

          <label htmlFor="oldpass">Old Password :</label>
          <div className={styles.hidepassword}>
            <input
              type={showPass ? "text" : "password"}
              name="oldpassword"
              id="oldpass"
              value={User.oldpassword}
              placeholder="Enter your current password"
              onChange={(e) =>
                setUser({ ...User, oldpassword: e.target.value })
              }
              required
            />
            <span
              className={styles.hideicon}
              onClick={() => setshowPass(!showPass)}
            ></span>
          </div>

          <label htmlFor="newpass">New Password :</label>
          <div className={styles.hidepassword}>
            <input
              type={showpass ? "text" : "password"}
              name="newpassword"
              id="newpass"
              value={User.newpassword}
              placeholder="Create a new password"
              onChange={(e) =>
                setUser({ ...User, newpassword: e.target.value })
              }
            />
            <span
              className={styles.hideicon}
              onClick={() => setshowpass(!showpass)}
            ></span>
          </div>
          <button type="submit" className={styles.submitBtn}>
            Update Password
          </button>
        </form>
        <p className={styles.loginText}>
          Not logged in?
          <button
            className={styles.loginLink}
            onClick={() => navigate("/login")}
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}
