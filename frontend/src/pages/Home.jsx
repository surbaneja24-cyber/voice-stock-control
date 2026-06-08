import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home">
      <div className="hero">
        <span className="badge">🚀 Beta 1.0</span>

        <h1>
          Control your inventory
          <br />
          with your voice
        </h1>

        <p>
          VoxStock transforms voice commands into inventory actions,
          making warehouse management faster and smarter.
        </p>

        <div className="hero-buttons">
          <Link to="/login">
            <button className="btn-primary">
              Sign In
            </button>
          </Link>

          <Link to="/register">
            <button className="btn-secondary">
              Create Account
            </button>
          </Link>
        </div>

        <div className="features">
          <div className="feature-card">
            🎙️ Voice Commands
          </div>

          <div className="feature-card">
            ⚡ Real-Time Processing
          </div>

          <div className="feature-card">
            📦 Inventory Tracking
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;