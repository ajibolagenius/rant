import { useToast } from "@/hooks/use-toast"
import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from "@/components/ui/toast"
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function Toaster() {
    const { toasts } = useToast();

    return (
        <ToastProvider>
            <div className="fixed bottom-0 right-0 z-50 p-4 pointer-events-none max-w-xs w-full flex flex-col-reverse gap-4" style={{ minHeight: '0' }}>
                <AnimatePresence>
                    {toasts.map(function ({ id, title, description, action, ...props }, index) {
                        return (
                            <motion.div
                                key={id}
                                className={cn(
                                    "pointer-events-auto bg-background-secondary border border-border-subtle rounded-lg shadow-high p-4 max-w-xs w-full backdrop-blur-sm relative",
                                    "flex flex-col space-y-3"
                                )}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            >
                                <div className="flex items-center justify-between">
                                    {title && <ToastTitle className="text-sm font-medium text-text-primary">{title}</ToastTitle>}
                                    <ToastClose className="h-6 w-6 rounded-full text-text-muted hover:text-text-primary hover:bg-background-hover" />
                                </div>
                                {description && (
                                    <ToastDescription className="text-xs text-text-muted">{description}</ToastDescription>
                                )}
                                {action && <div className="pt-1">{action}</div>}
                                {/* Progress bar */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-background-dark rounded-b-lg overflow-hidden">
                                    <motion.div
                                        className="h-full bg-accent-teal"
                                        initial={{ width: "100%" }}
                                        animate={{ width: "0%" }}
                                        transition={{ duration: 5, ease: "linear" }}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
            <ToastViewport />
        </ToastProvider>
    );
}
