import React, { useEffect, useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import { UserContext } from "../../context/UserContext";
import "./Navbar.scss";

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const { pathname } = useLocation();
  const navigate = useNavigate();


  const handleLogout = async () => {
    try {
      await newRequest.post("/auth/logout");
      setCurrentUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const renderUserOptions = () => (
    <div className="user" onClick={() => setMenuOpen(!menuOpen)}>
      <img src={currentUser.img || "/img/noavatar.jpg"} alt="User" />
      <span>{currentUser.username}</span>
      {menuOpen && (
        <div className="options">
          {currentUser.role !== "USER" && (
            <>
              <Link to="/mygigs" className="link">Gigs</Link>
              {currentUser.role === "SELLER" && (
                <Link to="/add/post" className="link">Add Gig</Link>
              )}
              {currentUser.role === "ADMIN" && (
                <Link to="/admin" className="link">Admin Page</Link>
              )}
            </>
          )}
          <Link to="/orders" className="link">Orders</Link>
          <span onClick={handleLogout} className="link">Logout</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="navbar">
      <div className="container">
        <div className="logo">
          <Link to="/" className="link">
            <span className="text">Home</span>
          </Link>
        </div>

        <div className="links">
        
          {currentUser ? (
            renderUserOptions()
          ) : (
            <>
              <Link to="/login" className="link">Sign in</Link>
              <Link to="/register" className="link">
                <button>Join</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
