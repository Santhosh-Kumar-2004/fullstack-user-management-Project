import '../styles/Footer.css';
import { FaFacebookF, FaInstagram, FaXTwitter } from 'react-icons/fa6';

function Footer() {
  return (
    <footer className="footerContainer">
      <div className="footerContent">
        <div className="footerBrand">
          <h2 className="footerLogo">UserVerse</h2>
          <p className="footerDescription">
            Empowering users across the universe with innovative tech and great experiences.
          </p>
        </div>

        <div className="footerLinks">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Support</a>
        </div>

        <div className="footerSocials">
          <a href="#" aria-label="Facebook"><FaFacebookF /></a>
          <a href="#" aria-label="Instagram"><FaInstagram /></a>
          <a href="#" aria-label="Twitter"><FaXTwitter /></a>
        </div>
      </div>

      <div className="footerBottom">
        <p>&copy; 2025 UserVerse. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
