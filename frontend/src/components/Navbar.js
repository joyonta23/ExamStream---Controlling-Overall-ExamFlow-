import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser, logout } from "../services/authService";

const ExamStreamLogo = () => (
  <svg
    viewBox="0 0 100 100"
    width="50"
    height="50"
    xmlns="http://www.w3.org/2000/svg"
    className="logo-svg"
  >
    {/* Modern E shape */}
    <rect x="15" y="20" width="40" height="12" fill="#667eea" rx="2" />
    <rect x="15" y="44" width="35" height="12" fill="#667eea" rx="2" />
    <rect x="15" y="68" width="40" height="12" fill="#667eea" rx="2" />
    <rect x="15" y="20" width="10" height="60" fill="#667eea" rx="2" />

    {/* Checkmark accent */}
    <g transform="translate(55, 40)">
      <path
        d="M 5 15 L 15 25 L 35 5"
        stroke="#764ba2"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>

    {/* Accent circle */}
    <circle cx="85" cy="25" r="6" fill="#764ba2" opacity="0.6" />
    <circle cx="22" cy="12" r="4" fill="#764ba2" opacity="0.4" />
  </svg>
);

const Navbar = () => {
  const user = getCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const getDashboardPath = () => {
    if (!user) return "/";
    if (user.role === "admin") return "/admin";
    if (user.role === "instructor") return "/instructor";
    return "/student";
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-content">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          <ExamStreamLogo />
          <span className="logo-text">ExamStream</span>
        </Link>

        <div
          className={`nav-links ${menuOpen ? "open" : ""} ${user ? "auth-links" : "guest-links"}`}
        >
          {user ? (
            <>
              <span className="welcome-text">Welcome, {user.name}</span>
              <span className="role-badge">{user.role}</span>
              <Link to={getDashboardPath()} onClick={closeMenu}>
                Dashboard
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  closeMenu();
                }}
                className="btn-logout"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu}>
                Login
              </Link>
              <Link to="/register" onClick={closeMenu}>
                Register
              </Link>
            </>
          )}
        </div>

        <div className="toggle-btn" onClick={toggleMenu}>
          <span className={`hamburger ${menuOpen ? "active" : ""}`}></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
