import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Home } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 h-screen w-screen bg-[#0c0a09] flex flex-col items-center justify-center text-stone-100 p-6 select-none relative overflow-hidden">
      <div className="w-16 h-16 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6 shadow-2xl shadow-orange-500/10">
        <Sparkles className="w-8 h-8 text-orange-400" />
      </div>

      <h1 className="text-6xl font-black text-white tracking-tighter mb-2">
        404
      </h1>
      <p className="text-stone-400 text-sm max-w-sm text-center mb-8">
        The workspace or page you are looking for does not exist.
      </p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/")}
        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-black font-semibold text-xs shadow-lg transition-all hover:bg-stone-200"
      >
        <Home className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </motion.button>
    </div>
  );
}
