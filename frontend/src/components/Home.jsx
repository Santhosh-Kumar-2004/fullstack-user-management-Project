import React from 'react';
import '../styles/Home.css';
import Navbar from './Navbar';
import Footer from './Footer';
import fireworkslike from '../assets/fireworkslike.jpg';
import rainbowlike from '../assets/rainbowlike.jpg';
import attitude from '../assets/attitudeboy.jpg';
import underground from '../assets/underground.jpg';
import { Link } from 'react-router-dom';

function Home() {

    return (
        <>
            <title>Home - UserVerse</title>
            <Navbar />
            <div className="homeContainer">
                <img src={fireworkslike} alt="Background" className="backgroundImage" />

                <div className="overlayContent">
                    <h1>Welcome to Our Platform</h1>
                    <p>
                        Build. Collaborate. Grow. Everything you need in one place — simple, powerful, and connected.
                    </p>
                    <Link to='/myprofile' className="homeButton">Get Started</Link>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Home;
