import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/LoginForm.css';
import Footer from './Footer';
import NavbarHalf from './NavbarHalf';
import cardark from '../assets/car-dark-bg.jpg';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function LoginForm() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const name = e.target.name; // the name attribute of the input field
        const value = e.target.value; // the current text/value typed inside that input.
        setFormData({ ...formData, [name]: value }); //Three dots = spread operator. name = static, value = dynamic
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:8000/User_Management/login', {
                email: formData.email,
                password: formData.password
            });

            const token = response.data.access_token;
            console.log('Token received:', token);

            localStorage.setItem('token', token);

            const decoded = jwtDecode(token);
            console.log('Decoded user:', decoded);

            toast.success('Login Successful! Redirecting...');

            setTimeout(() => { // To give the user some time to see the success toast before moving to home page.
                navigate('/home');
            }, 2000);

            setError(null);

        } catch (err) { //err here is the Error Object thrown by axios if API call fails.   
            console.error('Login failed:', err.response?.data || err.message); //? = Optional Chaining. if true go inside of it, else Undefined

            const status = err.response?.status;
            let message = "Login failed. Please try again.";

            // Customize error message based on status code
            if (status === 401) {
                message = "Invalid email or password. Please check your credentials.";
            } else if (status === 500) {
                message = "Server error. Please try again later.";
            } else if (err.response?.data) {
                message = err.response.data;
            }

            // Show error toast
            toast.error(message);
            setError(message)
        }
    };
    //Uncontrolled Components are the components that do not rely on the React state and are handled by the DOM (Document Object Model)
    //Controlled Components are those in which form’s data is handled by the component’s state.

    return (
        <>
            <div className="loginContainer">
                <NavbarHalf />
                <title>Login - UserVerse</title>
                <img src={cardark} alt="Background image" className="backgroundImage" />

                <div className="loginBox">
                    <h2 className="loginTitle">Welcome Back</h2>
                    <form className="loginForm" onSubmit={handleSubmit}>
                        <label className="loginLabel">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="loginInput"
                            placeholder="Enter your username"
                            defaultValue={formData.email}
                            onBlur={handleChange}
                            required
                        />

                        <label className="loginLabel">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="loginInput"
                            placeholder="Enter your password"
                            defaultValue={formData.password}
                            onBlur={handleChange}
                            required
                        />

                        {error && <p className="loginError">{error}</p>}

                        <button type="submit" className="loginButton">Login</button>

                        <div className="loginFooter">
                            <p>Don't have an account? <Link to='/register'>Register</Link></p>
                        </div>
                    </form>
                </div>
            </div>

            {/* Toast container to render notifications */}
            {/* it is a manager in the background. */}
            <ToastContainer  
                position="top-right"
                autoClose={5000}  // Closes toast after 5 seconds
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

export default LoginForm;

// Controlled                                                           | Uncontrolled
// React controls the input value.                                      | Browser controls the input value.
// You use value and onChange.                                          | You use defaultValue and onBlur.
// You always know what the user typed.                                 | You only know later, when user finishes typing.
// More code, but better control.                                       | Less code, but less control.
// Example: Form validation, instant checking, disabling button, etc.   | Example: Simple form, not much interaction needed.
