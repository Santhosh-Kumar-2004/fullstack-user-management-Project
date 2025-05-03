import React, { useState, useEffect } from 'react';
import '../styles/Navbar.css';
import logo from '../assets/logo-no-background.png';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { useAppContext } from '../contexts/AppContext';

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [token] = useState(localStorage.getItem("token") || "");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { setCurrentPage } = useAppContext();


    useEffect(() => {
        if (!token) return;

        try {
            const decoded = jwtDecode(token);
            const user_id = decoded.user_id;

            axios
                .get(`http://localhost:8000/User_Management/${user_id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((res) => {
                    setUserData(res.data);
                    setLoading(false);
                })
                .catch((err) => {
                    setError("Failed to load profile.");
                    setLoading(false);
                    console.error(err);
                });
        } catch (err) {
            setError("Invalid token.");
            setLoading(false);
        }
    }, [token]);

  const toggleMenu = (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMenu = (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
  };

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8000/User_Management/logout", {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
    } catch (err) {
      console.error("Logout failed or already logged out", err);
    }
  
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbarContainer">
      <div className="navbaLeft">
        <img src={logo} alt="Logo" className="headerLogo" />
        <span className="mainTitle">UserVerse</span>
      </div>

      <div className="hamburgerIcon" onClick={toggleMenu}>
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </div>

      <ul className={`navbarRight ${isMobileMenuOpen ? 'active' : ''}`}>
        <Link to="/home" className="navLinks" onClick={ () => setCurrentPage('home')}>Home</Link>
        <Link to="/aboout" className="navLinks" onClick={ () => setCurrentPage('about')}>About</Link>
        <Link to="/services" className="navLinks" onClick={ () => setCurrentPage('services')}>Services</Link>
        <Link to="/myprofile" className="navLinks" onClick={ () => setCurrentPage('myprofile')}>My Profile</Link>
        {userData?.role === 'admin' && (
          <Link to="/allprofiles" className="navLinks" onClick={ () => setCurrentPage('allprofiles')} style={{
            color: "yellow",
            fontWeight: "bold"
          }}>Admin Dashboard</Link>
        )}
        <Link className='navLinks' onClick={handleLogout}>Log out</Link>
        
      </ul>
    </nav>
  );
}

export default Navbar;
