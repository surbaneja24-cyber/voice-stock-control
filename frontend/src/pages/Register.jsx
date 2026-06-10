import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle, FaApple } from "react-icons/fa";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.msg);
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify(data)
      );

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Server connection error");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(
        auth,
        googleProvider
      );

      const user = result.user;

      const response = await fetch(
        "http://127.0.0.1:5000/google-login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.msg || "Google login failed"
        );
      }

      localStorage.setItem(
        "user",
        JSON.stringify(data)
      );

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Google login failed");
    }
  };

  return (
    <div className="auth-page fade-page">
      <div className="auth-card">
        <h1>Create your account</h1>
        <p>
          Join VoxStock and manage inventory with
          your voice.
        </p>

        <form onSubmit={handleRegister}>
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
            required
          />

          <button
            className="auth-button"
            type="submit"
          >
            Create Account
          </button>

          <div className="divider">
            <span>or continue with</span>
          </div>

          <button
            className="google-btn"
            type="button"
            onClick={handleGoogleLogin}
          >
            <FaGoogle />
            Continue with Google
          </button>

          <button
            className="apple-btn"
            type="button"
            disabled
            style={{ opacity: 0.6, cursor: "not-allowed" }}
          >
            <FaApple />
            Apple Sign In (Coming Soon)
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;