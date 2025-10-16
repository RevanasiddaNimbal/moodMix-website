const pool = require("../config/db");
const bcrypt = require("bcrypt");

const User = {
  checkUserByEmail: async (email) => {
    try {
      const data = await pool.query("SELECT * FROM users WHERE email=$1", [
        email,
      ]);

      if (data.rows.length != 0) {
        return { error: "User has registered already , please login!" };
      }
      return null;
    } catch (err) {
      return {
        error: "An error occurred on the server while retrieving the data.",
      };
    }
  },

  getUserByEmail: async (email) => {
    try {
      const data = await pool.query("SELECT * FROM users WHERE email=$1", [
        email,
      ]);

      if (data.rows.length == 0) {
        return { error: true };
      }
      return data.rows[0];
    } catch (err) {
      return {
        error: true,
      };
    }
  },

  createUser: async ({ name, email, phonenumber, password }) => {
    try {
      const result = await pool.query(
        "INSERT INTO users(name,email,phonenumber, password) VALUES ($1,$2,$3,$4) returning *",
        [name, email, phonenumber, password]
      );
      if (result.rows.length === 0) {
        return { error: true };
      }
      return result.rows[0];
    } catch (err) {
      // console.error(err.stack);
      return {
        error: true,
      };
    }
  },

  verifyUser: async (email) => {
    try {
      const result = await pool.query(
        "UPDATE users SET is_verified=true , otp=NULL,  otp_expire_at=NULL WHERE email=$1 RETURNING *",
        [email]
      );
      if (result.rows.length === 0) {
        return {
          error: true,
        };
      }
      return result.rows[0];
    } catch (err) {
      return {
        error: true,
      };
    }
  },

  updateOtp: async ({ email, otp, otp_expire_at }) => {
    try {
      const updateotp = await pool.query(
        "UPDATE users SET otp=$1,otp_expire_at=$2 WHERE email=$3 returning *",
        [otp, otp_expire_at, email]
      );

      if (updateotp.rows.length === 0) {
        return {
          error: true,
        };
      }

      return updateotp.rows[0];
    } catch (err) {
      console.error(err.stack);
      return {
        error: true,
      };
    }
  },
  login: async (email, password) => {
    try {
      const result = await pool.query("SELECT * FROM users WHERE email=$1 ", [
        email,
      ]);

      const data = result.rows;

      if (data.length == 0) {
        return {
          error: "No account found with this email. Please register first.",
        };
      }

      const user = data[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return { error: "Invalid email and password.Please try again. " };
      }
      if (user.is_verified === false) {
        return {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            is_verified: false,
          },
          error: "User not verified. Please verify your account.",
        };
      }
      return {
        message: "login successfull",
        user: user,
      };
    } catch (err) {
      return {
        error:
          "An unexpected error occurred while processing login. Please try again later.",
      };
    }
  },

  resetPassword: async ({ newpassword, email }) => {
    try {
      const data = await pool.query(
        "UPDATE users SET password = $1 WHERE email=$2 returning *",
        [newpassword, email]
      );
      if (data.rows.length === 0) {
        return {
          error: true,
        };
      }
      return data.rows[0];
    } catch (err) {
      return { error: true };
    }
  },

  getUsers: async () => {
    try {
      const data = await pool.query("SELECT * FROM users");
      return data.rows;
    } catch (err) {
      return { error: true };
    }
  },
};

module.exports = User;
