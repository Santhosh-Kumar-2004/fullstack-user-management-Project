import React, { useEffect, useState } from "react";
import "../styles/MyProfile.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import menprofile from "../assets/men-profile.jpg";
import womenprofile from "../assets/women-profile.jpg";
import { Link, useNavigate } from "react-router-dom";
import Modal from "./Model";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MyProfile = () => {
    const [token] = useState(localStorage.getItem("token") || "");
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [open, setOpen] = useState(false)

    const navigate = useNavigate();

    useEffect(() => {
        //   Step | What happens inside
        // 1 | Check if there is a token (from localStorage).
        // 2 | If token exists ➔ Decode it using jwtDecode to get the user's ID.
        // 3 | Send a GET request to backend to fetch the user's profile.
        // 4 | Set the userData with the profile info, or show an error if something fails.
        if (!token) {
            toast.error("Unauthorized Access - Please login.");
            setError("Unauthorized Access");
            setLoading(false);
            return;
        }

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
                    // toast.info('This is Your Profile, Now You Can Make any Changes...');
                })
                .catch((err) => {
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
        } catch (err) {
            setError("Invalid token.");
            setLoading(false);
        }
    }, [token]);

    const handleDelete = (e) => {
        // Decodes token to get user ID.
        // Sends a DELETE request to backend.
        // Removes the token from browser storage (logout).
        // Redirects user to the /register page (since their account is deleted).
        e.preventDefault();

        const decoded = jwtDecode(token);
        const user_id = decoded.user_id;

        axios.delete(`http://localhost:8000/User_Management/${user_id}`, {
            headers: {                                                      //This sets the Authorization header in the request.
                Authorization: `Bearer ${token}`,
            }
        })
            .then(res => {
                console.log("Profile Deleted successfully: ", res);
                localStorage.removeItem("token");

                setError(null);
                toast.success('You Profile has Been Deleted Successfully. Redirecting...');

                setTimeout(() => {
                    navigate('/register');
                }, 2000);
            })
            .catch(err => {
                console.error("Deletion error:", err.response?.data || err.message);
                const status = err.response?.status;
                let message = 'Profile deletion failed.';
            
                 if (status === 404) {
                    message = "Profile not found. Cannot delete.";
                } else if (status === 500) {
                    message = "Server error. Please try again later.";
                } 

                setError(message);
                setLoading(false);
                toast.error(message);
            });
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    return (
        <div className="profilePage">
            <title>My profile - UserVerse</title>
            <Navbar />
            <div className="profileContainer">
                {loading ? (
                    <div className="loader">Loading profile...</div>
                ) : error ? (
                    <div className="error">{error}</div>
                ) : (
                    <div className="profileCard">
                        <div
                            className="profileBanner"
                            style={{ backgroundImage: `url(${menprofile})` }}
                        ></div>
                        <div className="profileContent">
                            <h2 className="myProfileTitle">Hello, {userData.name}</h2>
                            <p><strong>Email:</strong> {userData.email}</p>
                            <p><strong>Role:</strong> {userData.role}</p>
                            <p><strong>Followers:</strong> {Math.floor(Math.random() * 1001)}</p>
                            <p><strong>Following:</strong> {Math.floor(Math.random() * 1001)}</p>
                            {/* 
                                Math.random() ➔ generates a random number between 0 and 1 (example: 0.37812).
                                Math.random() * 1001 ➔ makes it 0 to 1000 (1001 exclusive).
                                Math.floor(...) ➔ removes decimal part (only keep integer). 
                            */}
                            <p><strong>Profile created at:</strong> {new Date(userData.created_at).toLocaleDateString()}</p>
                            <p><strong>Last Updated at at:</strong> {new Date(userData.updated_at).toLocaleDateString()}</p>

                            {!loading && !error && (
                                <button className="primaryBtn">
                                    <Link to='/updateprofile' className="Linkbtn">Update Profile</Link>
                                </button>
                            )}

                            {!loading && !error && (
                                <>
                                    {userData?.role === 'user' && (
                                        <>
                                            <button onClick={handleOpen} className="deleteButton">
                                                Delete Profile
                                            </button>
                                            <Modal isOpen={open} onClose={handleClose}>
                                                <h2 className='modelTitle'>Are you sure Wanna Delete you Profile?</h2>
                                                <button className='modelButton btn1' onClick={handleDelete}>Delete</button>
                                                <button className='modelButton btn2' onClick={handleClose}>Cancel</button>
                                            </Modal>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <ToastContainer
                position="top-right"
                autoClose={2000}
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
        </div>
    );
};

export default MyProfile;
