import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/PageNotFound.css';
import Navbar from './Navbar';
import Footer from './Footer';
import bulb from '../assets/bulb.jpg';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PageNotFound = () => {
    
    useEffect(() => {
        toast.error('Hey User! the page you"re looking for doesn"t exists.')
    }, [])
    
    return (
        <>
            <title>Page ! Found - UserVerse</title>
            <Navbar />
            <div className="pageFoundCont">
                <img src={bulb} alt="Background" className="backgroundImage" />
                <div className='pageFoundBox'>
                    <h1 className='pageFoundTitle'>404</h1>
                    <h2>Page Not Found</h2>
                    <p>Sorry, the page you are looking for does not exist.</p>
                    <Link to="/" className="homeLink">
                        Go Back to Home
                    </Link>
                </div>
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

export default PageNotFound;