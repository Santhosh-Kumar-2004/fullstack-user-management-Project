import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AllProfiles.css';
import { jwtDecode } from "jwt-decode";
import Navbar from './Navbar';
import Footer from './Footer';
import Modal from './Model';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AllProfiles = () => {


  //This block is to retireve the Logged in user credentials and tell the admin hii
  // -----------------------------------------------------------------------------------------
  const [token1] = useState(localStorage.getItem("token") || "");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false)
  const [showForm, setShowForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);


  useEffect(() => {
    if (!token) {
      toast.error("Unauthorized Access - Please login.");
      setError("Unauthorized Access");
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token1);
      const user_id = decoded.user_id;

      axios
        .get(`http://localhost:8000/User_Management/${user_id}`, {
          headers: {
            Authorization: `Bearer ${token1}`,
          },
        })
        .then((res) => {
          console.log("Fetched users:", res.data);
          setUserData(res.data);
          setLoading(false);
          // toast.warn('Hey Admin!, You Can Update or Delete any User you Want...');
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
  }, []);

  // -----------------------------------------------------------------------------------------

  //This block is for Retrieving all the suers formt he database
  // -----------------------------------------------------------------------------------------
  const [users, setUsers] = useState([]);
  const [token] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    if (!token) return;
    const decoded = jwtDecode(token);
    console.log("Decoded user:", decoded);

    axios.get('http://localhost:8000/User_Management/', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => setUsers(res.data))
      .catch(err => {
        console.error("Failed to fetch users", err);
        if (err.response?.status === 401) {
          toast.error("You're not authorized. Please log in again.");
        } else if (err.response?.status === 403) {
          toast.error("You dont Have Permission to access this resource.")
        }
      });
  }, []);
  // -----------------------------------------------------------------------------------------

  const handleDelete = (e, userId) => {
    e.preventDefault();

    axios.delete(`http://localhost:8000/User_Management/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then(res => {
        console.log("User deleted successfully:", res);
        setUsers(users.filter(user => user.user_id !== userId)); // Remove the user from UI
        setOpen(false);  // Close modal
        setSelectedUserId(null);  // Clear the selected user
      })
      .catch(err => {
        console.error("Deletion failed", err);
        alert("Something went wrong!");

        console.error("Deletion failed:", err.response?.data || err.message);
        const status = err.response?.status;
        let message = 'Failed to Delete profile.';

        if (status === 404) {
          message = "Profile not found.";
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


  return (
    <>
      <Navbar />
      <title>All Users - UserVerse</title>
      <div className="allProfilesPage">
        <h1>All Users</h1>
        {/* <h1>Hello Admin! <b>{userData.name}</b></h1> */}
        <div className="cardGrid">
          {users.map(user => (
            // users is an array (fetched from backend).
            // .map() goes through each user in that array.
            // For each user, it returns a <div> (user card) with user info.
            <div className="userCard" key={user.user_id}>
              <h3>{user.name}</h3>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Created at:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
              <p className='paraFifth'><strong>Updated at:</strong> {new Date(user.updated_at).toLocaleDateString()}</p>

              {/* When .map() is looping through each user, the user variable represents the current user in that iteration.
              When the admin clicks “Update” for Bob, only Bob's data is passed into state={{ selectedUser: user }}. */}

              {/* Because inside the map(), every button is generated with its user’s data.
              So clicking a specific button sends only that user's data through the router. */}
                <button className="primaryBtnBtn">
                  <Link
                    to="/updateprofile4admin"
                    state={{ selectedUser: user }}
                    className="LinkbtnBtn"
                  >

                    Update Profile
                  </Link>
                </button>

              <button
                className="deleteButtonBtn"
                onClick={() => {
                  console.log("Selected for deletion:", user.user_id);
                  setSelectedUserId(user.user_id);
                  setOpen(true);
                }}
              >
                Delete Profile
              </button>
            </div>
          ))}

        </div>
        {open && (
          <Modal isOpen={open} onClose={handleClose}>
            <h2 className="modelTitle">Are you sure you want to delete this profile?</h2>
            <button
              className="modelButton btn1"
              onClick={(e) => handleDelete(e, selectedUserId)}
            >
              Delete
            </button>
            <button className="modelButton btn2" onClick={handleClose}>
              Cancel
            </button>
          </Modal>
        )}

      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}  // Close toast after 5 seconds
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

export default AllProfiles;
