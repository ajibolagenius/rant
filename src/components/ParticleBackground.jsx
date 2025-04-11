import React from 'react';
import Particles from '@tsparticles/react';
import { loadFull } from 'tsparticles';

const ParticleBackground = () => {
    const particlesInit = async (engine) => {
        console.log(engine); // Debugging: Log the engine instance
        await loadFull(engine); // Ensure the engine is initialized correctly
    };

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            options={{
                fullScreen: { enable: true, zIndex: -1 },
                background: { color: { value: '#0d1117' } },
                fpsLimit: 60,
                interactivity: {
                    events: {
                        onHover: { enable: true, mode: 'repulse' },
                        onClick: { enable: true, mode: 'push' },
                        resize: true
                    },
                    modes: {
                        push: { quantity: 4 },
                        repulse: { distance: 100, duration: 0.4 }
                    }
                },
                particles: {
                    number: { value: 80, density: { enable: true, area: 800 } },
                    color: { value: '#ffffff' },
                    shape: { type: 'star' },
                    opacity: { value: 0.7, random: false },
                    size: { value: 2, random: true },
                    links: { enable: true, distance: 150, color: '#ffffff', opacity: 0.4, width: 1 },
                    move: { enable: true, speed: 1.2, direction: 'none', outModes: { default: 'bounce' } }
                },
                detectRetina: true
            }}
        />
    );
};

export default ParticleBackground;
