import React, { useEffect, useState } from "react";
import "../styles/MyProfile.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import womenprofile from "../assets/women-profile.jpg";

const MyProfile4Boy = () => {
    const [token] = useState(localStorage.getItem("token") || "");
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    return (
        <div className="profile-page">
            <Navbar />
            <div className="profile-container">
                {loading ? (
                    <div className="loader">Loading profile...</div>
                ) : error ? (
                    <div className="error">{error}</div>
                ) : (
                    <div className="profile-card">
                        <div
                            className="profile-banner"
                            style={{ backgroundImage: `url(${womenprofile})` }}
                        ></div>
                        <div className="profile-avatar">
                            <img src={womenprofile} alt="Profile avatar" />
                        </div>
                        <div className="profile-content">
                            <h2>Hello, {userData.name}</h2>
                            <p><strong>Email:</strong> {userData.email}</p>
                            <p><strong>Role:</strong> {userData.role}</p>
                            <p><strong>Followers:</strong> {Math.floor(Math.random() * 1001)}</p>
                            <p><strong>Following:</strong> {Math.floor(Math.random() * 1001)}</p>
                            <p><strong>Profile created at:</strong> {new Date(userData.created_at).toLocaleDateString()}</p>
                            <p><strong>Last Updated at:</strong> {new Date(userData.updated_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default MyProfile4Boy;
