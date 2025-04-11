import React from 'react';
import Logo from './Logo';
import '../pages/Rant.css';


const Footer = () => {
    return (
        <footer className="footer-container" id="footer">
            <div className="footer-logo-container">
                <Logo />
                <span className="footer-description">
                    The anonymous space for your unfiltered thoughts.
                </span>
            </div>
            <span className="footer-note">
                Made with 💚 for the chronically online.
                © {new Date().getFullYear()} Rant. All rights reserved.
            </span>
        </footer>
    );
};

export default Footer;
