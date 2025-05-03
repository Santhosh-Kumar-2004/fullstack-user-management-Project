import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavbarHalf from './NavbarHalf';
import Footer from './Footer';
import validator from 'validator';
import PasswordChecklist from "react-password-checklist";
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import darkforest from '../assets/dark-forest.jpg';
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

function RegisterForm() {
    const [formData, setFormData] = useState({
        name: 'Santhosh',
        email: '',
        password: '',
    });
    const [error, setError] = useState(null);
    const [passwordAgain, setPasswordAgain] = useState("");

    const navigate = useNavigate();

    const handleChange = (e) => {
        const name = e.target.name; // the name attribute of the input field
        const value = e.target.value; // the current text/value typed inside that input.
        // console.log(e.target)
        // console.log(e.target.className)
        // console.log(e.target.type)
        setFormData({ ...formData, [name]: value }); //Three dots = spread operator. name = static, value = dynamic
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validator.isEmail(formData.email)) { // If user's typed email is NOT a valid email format,
            setError('Please enter a valid email address');
            toast.error('Invalid email format');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8000/User_Management/register', formData);
            const token = response.data.access_token;
            console.log(token);

            const decoded = jwtDecode(token);
            console.log("User registered:", decoded);

            setError(null);
            toast.success('Registration successful! Redirecting...');

            setTimeout(() => {
                navigate('/regsuccess');
            }, 2000);

        } catch (err) {
            console.error("Registration error:", err.response?.data || err.message);
            const status = err.response?.status;
            let message = 'Registration failed.';

            if (status === 409) {
                message = "User with this email or name already exists.";
            } else if (status === 400) {
                message = "Missing or invalid fields. Please check your input.";
            } else if (status === 500) {
                message = "Server error. Please try again later.";
            } else if (err.response?.data?.detail) {
                message = err.response.data.detail;
            }

            setError(message);
            toast.error(message);
        }
    };

    return (
        <>
            <div className="loginContainer">
                <NavbarHalf />
                <title>Register - UserVerse</title>
                <img src={darkforest} alt="Background image" className="backgroundImage" />
                <div className="loginBox">
                    <h2 className="loginTitle">Register to UserVerse!</h2>
                    <form className="loginForm" onSubmit={handleSubmit}>
                        <label className="loginLabel">Name</label>
                        <input
                            type="text"
                            name="name"
                            className="loginInput"
                            placeholder="Enter your name"
                            // value={formData.name}
                            defaultValue={formData.name}
                            // onChange={handleChange}
                            onBlur={handleChange}
                        // required
                        />

                        <label className="loginLabel">Email</label>
                        <input
                            type="text"
                            name="email"
                            className="loginInput"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                        // required
                        />
                        {error && (
                            <p className="loginError" style={{ color: "red" }}>{error}</p>
                        )}

                        <label className="loginLabel">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="loginInput"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                        // required
                        />

                        <label className="loginLabel">Confirm Password</label>
                        <input
                            type="password"
                            className="loginInput"
                            placeholder="Re-enter your password"
                            value={passwordAgain}
                            onChange={(e) => setPasswordAgain(e.target.value)}
                            required
                        />

                        <PasswordChecklist
                            rules={["minLength", "specialChar", "number", "capital", "match"]}
                            minLength={8}
                            value={formData.password}
                            valueAgain={passwordAgain}
                            messages={{
                                minLength: "Password has at least 8 characters.",
                                specialChar: "Password includes a special character.",
                                number: "Password includes a number.",
                                capital: "Password includes an uppercase letter.",
                                match: "Passwords match.",
                            }}
                        />

                        {error && !error.includes('email') && (
                            <p className="loginError" style={{ color: "red" }}>{error}</p>
                        )}

                        <button type="submit" className="loginButton">Register</button>

                        <div className="loginFooter">
                            <p>Already have an account? <Link to="/login" onClick={() => setCurrentPage('login')}>Login now!</Link></p>
                        </div>
                    </form>
                </div>
            </div>

            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />

            <Footer />
        </>
    );
}

export default RegisterForm;
