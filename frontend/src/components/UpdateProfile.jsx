import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../styles/UpdateProfile.css";
import Navbar from './Navbar';
import Footer from './Footer';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UpdateProfile = () => {
    const [token] = useState(localStorage.getItem("token") || "");
    const [userData, setUserData] = useState(null);

    const [updatedName, setUpdatedName] = useState("");
    const [updatedEmail, setUpdatedEmail] = useState("");
    const [updatedPassword, setUpdatedPassword] = useState("");

    useEffect(() => {
        if (!token) {
            toast.error("Unauthorized Access - Please login.");
            setError("Unauthorized Access");
            setLoading(false);
            return;
        }

        const decoded = jwtDecode(token);
        const user_id = decoded.user_id;

        axios.get(`http://localhost:8000/User_Management/${user_id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
            .then(res => {
                setUserData(res.data);
                setUpdatedName(res.data.name);
                setUpdatedEmail(res.data.email);
            })
            .catch(err => {
                console.error("Profile loading error:", err.response?.data || err.message);
                const status = err.response?.status;
                let message = 'Failed to load profile.';

                if (status === 404) {
                    message = "Profile not found.";
                } else if (status === 500) {
                    message = "Server error. Please try again later.";
                }

                setError(message);
                setLoading(false);
                toast.error(message);
            });
    }, [token]);

    const navigate = useNavigate();

    const handleUpdate = (e) => {
        e.preventDefault();

        const decoded = jwtDecode(token);
        const user_id = decoded.user_id;

        axios.put(`http://localhost:8000/User_Management/${user_id}`, {
            name: updatedName,
            email: updatedEmail,
            password: updatedPassword,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
            .then(() => {
                toast.success("Profile updated successfully! Redirecting...");
                setTimeout(() => {
                    navigate('/myprofile');
                }, 2000);
            })
            .catch(err => {
                console.error("Update failed:", err.response?.data || err.message);

                const status = err.response?.status;
                let message = "Update failed. Please try again.";

                if (status === 400) {
                    message = "Invalid data. Please check your input.";
                } else if (status === 404) {
                    message = "User not found. Please try again.";
                } else if (status === 500) {
                    message = "Server error. Please try again later.";
                }

                toast.error(message);
                setError(message)
            });
    };

    return (
        <>
            <Navbar />
            <title>Update Profile - Userverse</title>
            <div className="pageContainer">
                <div className="formWrapper">
                    <h1 className="formTitle">Update Your Profile</h1>
                    <form className="updateForm" onSubmit={handleUpdate}>
                        <div className="formGroup">
                            <label htmlFor="name" className="updateLabel">Name</label>
                            {/* htmlFor in React is the equivalent of the HTML for attribute.
                                    It associates the label with the input field that has an id="name". */}
                            <input
                                className="inputField"
                                type="text"
                                id="name"
                                value={updatedName}
                                onChange={(e) => setUpdatedName(e.target.value)}
                                placeholder="Enter your name"
                            />
                        </div>
                        <div className="formGroup">
                            <label htmlFor="email" className="updateLabel">Email</label>
                            <input
                                className="inputField"
                                type="email"
                                id="email"
                                value={updatedEmail}
                                onChange={(e) => setUpdatedEmail(e.target.value)}
                                placeholder="Enter your email"
                            />
                        </div>
                        <div className="formGroup">
                            <label htmlFor="password" className="updateLabel">Password</label>
                            <input
                                className="inputField"
                                type="password"
                                id="password"
                                value={updatedPassword}
                                onChange={(e) => setUpdatedPassword(e.target.value)}
                                placeholder="Enter a new password"
                            />
                        </div>
                        <div className="buttonGroup">
                            <button className="btn primaryBtn" type="submit">Save Changes</button>
                            <button className="secondaryBtn">
                                <Link to='/myprofile' className="cancelBtn">Cancel</Link>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
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
};

export default UpdateProfile;
