import React, { useState, useEffect } from "react";
import ReactConfetti from "react-confetti";

interface ConfettiProps {
    active: boolean;
    duration?: number;
}

const Confetti: React.FC<ConfettiProps> = ({ active, duration = 3000 }) => {
    const [windowDimensions, setWindowDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setWindowDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (active) {
            setIsActive(true);
            const timer = setTimeout(() => {
                setIsActive(false);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [active, duration]);

    if (!isActive) return null;

    return (
        <ReactConfetti
            width={windowDimensions.width}
            height={windowDimensions.height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.15}
            colors={["#00C2FF", "#904FFF", "#FF66B2", "#4ADE80", "#F1C40F"]}
        />
    );
};

export default Confetti;
