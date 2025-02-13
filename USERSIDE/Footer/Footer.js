import React from "react";
import "./Footer.css";
// import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="footer-container">
         <footer>
    <div className="footerContainer">
        <div className="socialIcons">
            <a href="https://www.facebook.com/profile.php?id=100041645491728"><i className="fa-brands fa-facebook"></i></a>
            <a href="https://www.instagram.com/r_sandy_s/"><i className="fa-brands fa-instagram"></i></a>
            <a href="https://sandeepkumarrai.netlify.app/"><i className="fa-solid fa-user"></i></a>
            <a href="https://www.linkedin.com/in/sandeep-rai-b2a782242/"><i className="fa-brands fa-linkedin"></i></a>
            <a href="https://www.youtube.com/channel/UCKBsiuy5g4N5j-vmERSINwQ"><i className="fa-brands fa-youtube"></i></a>
        </div>
        <div className="footerNav">
            <ul><li><a href="../Dashboard/Dashboard">Home</a></li>
                <li><a href="../Feedback/Feedback">Feedback</a></li>
                <li><a href="../About/About">About</a></li>
                <li><a href="../Contact/Contact">Contact Us</a></li>
                <li><a href="../Privacy/Privacy">Privacy Policy</a></li>
            </ul>
        </div>
        
    </div>
    <div className="footerBottom">
        <p>Copyright &copy; 2025 : <span className="designer">QuizQuest</span></p>
    </div>
</footer>
    </div>
  );
};

export default Footer;
