import '../styles/RegSuccess.css';
import React from 'react';
import { Link } from 'react-router-dom';
import Footer from './Footer';
import NavbarHalf from './NavbarHalf';

function RegisterSuccess() {
    
    return (
        <div className="loginContainer">
            <NavbarHalf />
            <title>Register Success - UserVerse</title>
            <div className="loginBox">
                <h1 className="loginTitle">Registeration Successfull!</h1>
                <h2 className="regTitle">Welcome to UserVerse.</h2>
                <h4 className="regTitle2">You can now Login to our Web App using the Same Credentials.</h4>
                <Link className="regButton" to='/login'>Go to Login</Link>
            </div>
            <Footer />
        </div>
    );
}

export default RegisterSuccess;
