import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";


function Home() {
  const { t, i18n } = useTranslation();

  return (
    <div className="home fade-page">
      <div className="hero">
        <div className="top-bar">
          <span className="badge">
            🚀 Beta 1.0
          </span>

          <button
            className="flag-btn"
            onClick={() => {
              i18n.changeLanguage("en");
              localStorage.setItem("language", "en");
            }}
          >
            <img
              src="https://flagcdn.com/w40/gb.png"
              alt="English"
            />
          </button>

          <button
            className="flag-btn"
            onClick={() => {
              i18n.changeLanguage("es");
              localStorage.setItem("language", "es");
            }}
          >
            <img
              src="https://flagcdn.com/w40/es.png"
              alt="Español"
            />
          </button>

          <button
            className="flag-btn"
            onClick={() => {
              i18n.changeLanguage("fr");
              localStorage.setItem("language", "fr");
            }}
          >
            <img
              src="https://flagcdn.com/w40/fr.png"
              alt="Français"
            />
          </button>

          <button
            className="flag-btn"
            onClick={() => {
              i18n.changeLanguage("de");
              localStorage.setItem("language", "de");
            }}
          >
            <img
              src="https://flagcdn.com/w40/de.png"
              alt="Deutsch"
            />
          </button>
        </div>

        <h1>{t("homeTitle")}</h1>

        <p>{t("homeDescription")}</p>

        <div className="hero-buttons">
          <Link to="/login">
            <button className="btn-primary">
              {t("signIn")}
            </button>
          </Link>

          <Link to="/register">
            <button className="btn-secondary">
              {t("createAccount")}
            </button>
          </Link>
        </div>

        <div className="features">
          <div className="feature-card">
            🎙️ {t("voiceCommands")}
          </div>

          <div className="feature-card">
            ⚡ {t("realTimeProcessing")}
          </div>

          <div className="feature-card">
            📦 {t("inventoryTracking")}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;