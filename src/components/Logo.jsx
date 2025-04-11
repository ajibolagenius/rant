import React from 'react';
import '../pages/Rant.css';


const Logo = () => {
    return (
        <div className="logo-container">
            <span className="logo-text-wrapper">
                <span className="logo-text gradient-text-brand">rant</span>
            </span>
            <img
                className="logo-emoji"
                src="/assets/images/_emoji_speech_balloon.svg"
                alt="speech balloon emoji"
            />
        </div>
    );
};

export default Logo;
