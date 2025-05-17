import { useLocation, Link } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import AppHead from "@/components/AppHead";

const NotFound = () => {
    const location = useLocation();

    useEffect(() => {
        console.error(
            "404 Error: User attempted to access non-existent route:",
            location.pathname
        );
    }, [location.pathname]);

    // Staggered text animation
    const text = useMemo(() => "Page not found".split(""), []);

    return (
        <>
            <AppHead title="404 - Page Not Found - Rant" description="Sorry, the page you are looking for does not exist on Rant." />
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#09090B] text-white p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    {/* Animated 404 number */}
                    <motion.h1
                        className="text-[120px] font-bold leading-none text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600"
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 100,
                            damping: 10
                        }}
                    >
                        404
                    </motion.h1>

                    {/* Character by character animation */}
                    <div className="flex justify-center mb-8 h-8 overflow-hidden">
                        {text.map((char, index) => (
                            <motion.span
                                key={index}
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{
                                    delay: 0.5 + index * 0.05,
                                    duration: 0.3
                                }}
                                className="text-xl text-gray-400"
                            >
                                {char === " " ? "\u00A0" : char}
                            </motion.span>
                        ))}
                    </div>

                    {/* Button with hover effect */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.2, type: "spring" }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link
                            to="/"
                            className="inline-block py-2 px-6 rounded-full bg-transparent border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                        >
                            Return home
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </>
    );
};

export default NotFound;
