import React from 'react';
import '../styles/Navbar.css';
import logo from '../assets/logo-no-background.png';

function NavbarHalf() {

  return (
    <nav className="navbarContainer">
      <div className="navbaLeft">
        <img src={logo} alt="Logo" className="headerLogo" />
        <span className="mainTitle">UserVerse</span>
      </div>
    </nav>
  );
}

export default NavbarHalf;