import { useState } from "react";
import axios from "../../api/axios";
import styles from "./RegisterForm.module.css";
import { useNavigate } from "react-router-dom";
import { showMessage } from "../Message";

export default function RegisterForm() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phonenumber: "",
    password: "",
  });
  const [loading, setloading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setloading(true);

    try {
      const res = await axios.post("/auth/register", user);
      if (res.status === 201 || res.data.success) {
        await showMessage("Registeration successfull.");
        navigate("/verify-otp", { state: { email: user.email } });
      } else {
        await showMessage(res.data?.error || "Failed to register. Try again.");
      }
    } catch (err) {
      console.error(err);
      await showMessage(
        err.response?.data?.error || "Failed to register. Try again."
      );
    }
    setloading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Register</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Enter your name"
            value={user.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Enter your email"
            value={user.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="phonenumber">Phone Number</label>
          <input
            type="text"
            name="phonenumber"
            id="phonenumber"
            placeholder="Enter your phone number"
            value={user.phonenumber}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">Password</label>
          <div className={styles.hidepassword}>
            <input
              type={showPass ? "text" : "password"}
              name="password"
              id="password"
              placeholder="Enter your password"
              value={user.password}
              onChange={handleChange}
              required
            />
            <span
              className={styles.hideicon}
              onClick={() => setShowPass(!showPass)}
            ></span>
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
            <button
              type="reset"
              className={styles.resetBtn}
              onClick={() =>
                setUser({ name: "", email: "", phonenumber: "", password: "" })
              }
            >
              Reset
            </button>
          </div>
        </form>
        <p className={styles.loginText}>
          Already have an account?
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
