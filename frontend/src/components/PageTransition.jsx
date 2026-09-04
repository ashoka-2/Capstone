import { motion } from "framer-motion";

export default function PageTransition({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
      className={`w-full h-full flex flex-col ${className}`}
    >
      {children}
    </motion.div>
  );
}
