// src/components/Header/Header.jsx
import { Link } from "react-router-dom";
import Navigation from "./Navigation";
import ActionButtons from "./ActionButtons";
import AnnounceBanner from "./AnnounceBanner";
import Logo from "./Logo";

const Header = () => {
  return (
    <header className="bg-[#111318] sticky top-0 z-50">
      <AnnounceBanner />
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-[60px]">
        <div className="flex items-center gap-8">
          <Logo />
          <Navigation />
        </div>
        <ActionButtons />
      </div>
    </header>
  );
};

export default Header;