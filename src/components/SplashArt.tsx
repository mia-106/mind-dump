import { motion } from 'framer-motion';

export const SplashArt = () => {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <svg
                viewBox="0 0 400 450"
                className="w-full h-full overflow-visible translate-y-4"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <style>{`
            .neo-stroke { stroke: #000; stroke-width: 3px; stroke-linecap: round; stroke-linejoin: round; }
            .content-block { filter: drop-shadow(4px 4px 0px rgba(0,0,0,0.1)); }
          `}</style>
                </defs>

                {/* --- 1. 散落的背景点缀 (Floating Particles) --- */}
                <motion.g
                    animate={{
                        y: [-5, 5, -5],
                        rotate: [-2, 2, -2]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <circle cx="50" cy="100" r="4" fill="#F4D03F" />
                    <path d="M350 150 L365 150 M357.5 142.5 L357.5 157.5" stroke="#000" strokeWidth="2" />
                    <path d="M80 380 Q95 370 110 380" fill="none" stroke="#64B5F6" strokeWidth="3" strokeLinecap="round" />
                    <rect x="320" y="320" width="12" height="12" fill="#F06292" transform="rotate(45 326 326)" />
                    <circle cx="30" cy="250" r="2.5" fill="#000" />
                </motion.g>

                {/* --- 2. 堆叠的内容物 (The Pile - 倒三角重力感) --- */}
                <g className="content-block">
                    {/* 底部第一层 (最挤) */}
                    <rect x="140" y="100" width="120" height="40" fill="#FFF176" className="neo-stroke" transform="rotate(-5 200 120)" />
                    <rect x="80" y="120" width="90" height="70" fill="#64B5F6" className="neo-stroke" transform="rotate(12 125 155)" />
                    <circle cx="280" cy="160" r="45" fill="#F06292" className="neo-stroke" />

                    {/* 中间层 (溢出) */}
                    <path d="M110 50 L190 140 L40 140 Z" fill="#F4D03F" className="neo-stroke" transform="rotate(-15 115 95)" />
                    <rect x="200" y="60" width="60" height="90" fill="#A8D5BA" className="neo-stroke" transform="rotate(25 230 105)" />

                    {/* 顶端 (摇摇欲坠) */}
                    <rect x="165" y="10" width="45" height="45" fill="#000" className="neo-stroke" transform="rotate(10 187 32)" />
                    <motion.path
                        animate={{ rotate: [10, 15, 10] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        d="M175 10 L150 -30 L200 -30 Z"
                        fill="#FFF"
                        className="neo-stroke"
                    />
                </g>

                {/* --- 3. 敦实的桶身 (The Robust Bin) --- */}
                <motion.path
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    d="M60 160 L340 160 L300 420 L100 420 Z"
                    fill="#FFFFFF"
                    className="neo-stroke"
                />

                {/* 桶身高光 */}
                <path d="M110 190 L105 350" stroke="#E5E7EB" strokeWidth="8" strokeLinecap="round" />
                <path d="M140 190 L135 320" stroke="#E5E7EB" strokeWidth="6" strokeLinecap="round" />

                {/* --- 4. 前排“炸裂”出的元素 (Explosive Tension) --- */}
                <motion.g
                    animate={{
                        x: [-2, 2, -2],
                        y: [-2, 2, -2]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                    <rect x="75" y="145" width="55" height="55" fill="#F06292" className="neo-stroke" transform="rotate(45 102 172)" />
                    <circle cx="210" cy="175" r="30" fill="#64B5F6" className="neo-stroke" />
                    <path d="M280 150 L320 185 L260 185 Z" fill="#F4D03F" className="neo-stroke" transform="rotate(20 290 167)" />
                </motion.g>

                {/* 额外的动态微符号 */}
                <circle cx="370" cy="280" r="3" fill="#000" />
                <path d="M30 330 L45 330" stroke="#000" strokeWidth="2" />
            </svg>
        </div>
    );
};
