import React from 'react';
import Logo from './Logo';
import '../pages/Rant.css';

const Footer = () => {
    return (
        <footer className="footer-container" id="footer">
            <div className="footer-divider" />
            <div className="footer-content">
                <div className="footer-left">
                    <Logo />
                    <p className="footer-description">
                        The anonymous space for your unfiltered thoughts. <br />
                        © {new Date().getFullYear()} Rant. All rights reserved.
                    </p>
                </div>
                <div className="footer-right">
                    <p className="footer-note">
                        Made with 💚 for the chronically online.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
