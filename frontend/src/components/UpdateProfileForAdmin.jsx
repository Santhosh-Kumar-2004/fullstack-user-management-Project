import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/UpdateProfile.css";
import Navbar from './Navbar';
import Footer from './Footer';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Import useLocation to access state

const UpdateProfile4Admin = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [userUpdatedName, setUserUpdatedName] = useState('');
    const [userUpdatedEmail, setUserUpdatedEmail] = useState('');
    const [userUpdatedPassword, setUserUpdatedPassword] = useState('');
    const [token] = useState(localStorage.getItem("token") || "");

    // Access the state passed through the Link
    const location = useLocation();

    useEffect(() => {
        const stateUser = location.state?.selectedUser;
        // When the admin clicks “Update” from the AllProfiles page, 
        // a specific user object is passed via React Router's Link using state={{ selectedUser: user }}.
        // This hook runs once when the component loads.
        if (stateUser) {
            setSelectedUser(stateUser);
            setUserUpdatedName(stateUser.name);
            setUserUpdatedEmail(stateUser.email);
        }
    }, [location]);

    const navigate = useNavigate()

    const handleUpdate = (e) => {
        e.preventDefault();

        console.log("Selected user from state:", selectedUser);

        if (!selectedUser || !selectedUser.user_id) {
            console.error("No selected user ID!");
            return;
        }

        axios.put(`http://localhost:8000/User_Management/${selectedUser.user_id}`, {
            name: userUpdatedName,
            email: userUpdatedEmail,
            password: userUpdatedPassword,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
            .then(() => {
                alert("Profile updated successfully!");
                navigate('/allprofiles')
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
            <title>Update Profile 4 Admins - Userverse</title>
            <div className="pageContainer">
                <div className="formWrapper">
                    <h1 className="formTitle">Update Profile for {selectedUser?.name || "Loading..."}</h1> {/* Displaying name using Optional Chaining */}
                    <form className="updateForm" onSubmit={handleUpdate}>
                        <div className="formGroup">
                            <label htmlFor="name">Name</label>
                            <input
                                className="inputField"
                                type="text"
                                id="name"
                                value={userUpdatedName}
                                onChange={(e) => setUserUpdatedName(e.target.value)}
                                placeholder="Enter your name"
                            />
                        </div>
                        <div className="formGroup">
                            <label htmlFor="email">Email</label>
                            <input
                                className="inputField"
                                type="email"
                                id="email"
                                value={userUpdatedEmail}
                                onChange={(e) => setUserUpdatedEmail(e.target.value)}
                                placeholder="Enter your email"
                            />
                        </div>
                        <div className="formGroup">
                            <label htmlFor="password">Password</label>
                            <input
                                className="inputField"
                                type="password"
                                id="password"
                                value={userUpdatedPassword}
                                onChange={(e) => setUserUpdatedPassword(e.target.value)}
                                placeholder="Enter new password"
                            />
                        </div>
                        <div className="buttonGroup">
                            <button className="btn primaryBtn" type="submit">Save Changes</button>
                            <button className="secondaryBtn">
                                <Link to='/allprofiles' className="cancelBtn">Cancel</Link>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default UpdateProfile4Admin;
