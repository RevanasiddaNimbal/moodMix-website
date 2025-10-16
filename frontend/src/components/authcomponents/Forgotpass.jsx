import axios from "../../api/axios";
import { useState } from "react";
import styles from "./Forgotpass.module.css";
import { useNavigate } from "react-router-dom";

export default function Forgotpass() {
  const [User, setUser] = useState({ email: "", newpassword: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [showpass, setshowpass] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/forgot-password", User);
      if (res.status === 200 || res.data?.success) {
        alert(res.data?.message || "Password has been reset successfully.");
        navigate("/login");
      }
    } catch (err) {
      console.log(err.response?.data);
      alert(err.response?.data?.error || err.message);
      // setUser({ newpassword: "", confirm: "" });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Reset password </h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="email">Email :</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Enter your email"
            value={User.email}
            onChange={(e) => setUser({ ...User, email: e.target.value })}
            required
          />
          <label htmlFor="newpass">New Password :</label>
          <div className={styles.hidepassword}>
            <input
              type={showPass ? "text" : "password"}
              name="newpassword"
              id="newpass"
              placeholder="Enter your new password"
              value={User.newpassword}
              onChange={(e) =>
                setUser({ ...User, newpassword: e.target.value })
              }
              required
            />
            <span
              className={styles.hideicon}
              onClick={() => setShowPass(!showPass)}
            ></span>
          </div>
          <label htmlFor="confirm">confirm Password :</label>
          <div className={styles.hidepassword}>
            <input
              type={showpass ? "text" : "password"}
              name="confirm"
              id="confirm"
              placeholder="Re-enter your new password"
              value={User.confirm}
              onChange={(e) => setUser({ ...User, confirm: e.target.value })}
            />
            <span
              className={styles.hideicon}
              onClick={() => setshowpass(!showpass)}
            ></span>
          </div>
          <button type="submit" className={styles.submitBtn}>
            submit
          </button>
        </form>
      </div>
    </div>
  );
}
