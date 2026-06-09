import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data));
        navigate("/dashboard");
      } else {
        alert(data.msg);
      }
    } catch (error) {
      console.error(error);
      alert("Server connection error");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);

      const user = result.user;

      // Enviar al backend
      const response = await fetch(
        "http://127.0.0.1:5000/google-login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            name: user.displayName,
            photo: user.photoURL,
            uid: user.uid,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Google login failed");
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          email: user.email,
          name: user.displayName,
          photo: user.photoURL,
          uid: user.uid,
        })
      );

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert(error.message || "Google login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p>Sign in to continue to VoxStock.</p>

        <form onSubmit={handleLogin}>
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="auth-button" type="submit">
            Sign In
          </button>
        </form>

        <div className="divider">
          <span>or continue with</span>
        </div>

        <button
          className="google-btn"
          type="button"
          onClick={handleGoogleLogin}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            width="20"
          />
          Continue with Google
        </button>

        <button
          className="apple-btn"
          type="button"
          disabled
          style={{
            opacity: 0.6,
            cursor: "not-allowed",
          }}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
            alt="Apple"
            width="18"
          />
          Apple Sign In (Coming Soon)
        </button>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;