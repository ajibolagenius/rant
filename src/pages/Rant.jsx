import React, { useState } from "react";
import Logo from "../components/Logo";
import IntroSection from "../components/IntroSection";
import RantForm from "../components/RantForm";
import RantList from "../components/RantList";
import Footer from "../components/Footer";
import ParticleBackground from '../components/ParticleBackground.jsx';
import "./Rant.css";

const Rant = () => {
    const [newRant, setNewRant] = useState(null);

    const handleRantSubmitted = (rant) => {
        setNewRant(rant);
    };

    return (
        <div className="rant-page-container">
            <ParticleBackground />
            <main className="main-container">
                <Logo />
                <section className="content-container">
                    <header className="header-section">
                        <IntroSection />
                        <RantForm onRantSubmitted={handleRantSubmitted} />
                    </header>
                    <RantList newRant={newRant} />
                    <Footer />
                </section>
            </main>
        </div>
    );
};

export default Rant;
