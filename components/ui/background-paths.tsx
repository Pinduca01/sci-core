"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

function FloatingPaths({ direction }: { direction: 'clockwise' | 'counterclockwise' }) {
    // Configurações base
    const centerX = 400;
    const centerY = 300;
    const baseRadius = 80;
    const pathCount = 18;
    
    const paths = useMemo(() => {
        return Array.from({ length: pathCount }, (_, i) => {
            const radius = baseRadius + i * 15;
            const angleOffset = (i * 20) * (Math.PI / 180);
            const directionMultiplier = direction === 'clockwise' ? 1 : -1;
            
            // Pontos de início e fim para criar arco circular
            const startAngle = angleOffset;
            const endAngle = startAngle + (Math.PI * 1.2 * directionMultiplier);
            
            // Arredondar valores para evitar diferenças de precisão
            const startX = Math.round((centerX + Math.cos(startAngle) * radius) * 1000) / 1000;
            const startY = Math.round((centerY + Math.sin(startAngle) * radius) * 1000) / 1000;
            const endX = Math.round((centerX + Math.cos(endAngle) * radius) * 1000) / 1000;
            const endY = Math.round((centerY + Math.sin(endAngle) * radius) * 1000) / 1000;
            
            // Pontos de controle para curvatura suave
            const controlRadius = radius * 1.3;
            const controlAngle1 = startAngle + (Math.PI * 0.4 * directionMultiplier);
            const controlAngle2 = startAngle + (Math.PI * 0.8 * directionMultiplier);
            
            const controlX1 = Math.round((centerX + Math.cos(controlAngle1) * controlRadius) * 1000) / 1000;
            const controlY1 = Math.round((centerY + Math.sin(controlAngle1) * controlRadius) * 1000) / 1000;
            const controlX2 = Math.round((centerX + Math.cos(controlAngle2) * controlRadius) * 1000) / 1000;
            const controlY2 = Math.round((centerY + Math.sin(controlAngle2) * controlRadius) * 1000) / 1000;
            
            return {
                id: i,
                d: `M${startX},${startY} C${controlX1},${controlY1} ${controlX2},${controlY2} ${endX},${endY}`,
                opacity: 0.15 + (i * 0.02),
                width: 1 + (i * 0.05),
                delay: i * 0.1,
            };
        });
    }, [direction]);

    return (
        <svg
            className="w-full h-full"
            viewBox="0 0 800 600"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
        >
            <title>Background Paths</title>
            {paths.map((path) => (
                <motion.path
                    key={path.id}
                    d={path.d}
                    stroke="rgba(251, 146, 60, 0.8)"
                    strokeWidth={path.width}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ 
                        pathLength: 0, 
                        opacity: 0,
                        strokeDasharray: "0 1"
                    }}
                    animate={{
                        pathLength: [0, 1, 0],
                        opacity: [0, path.opacity, 0],
                        strokeDasharray: ["0 1", "1 0", "0 1"]
                    }}
                    transition={{
                        duration: 8 + (path.id * 0.2),
                        delay: path.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatDelay: 1
                    }}
                />
            ))}
        </svg>
    );
}

export function BackgroundPaths({ className = '' }: { className?: string }) {
    return (
        <div className={`fixed inset-0 pointer-events-none z-0 ${className}`}>
            <FloatingPaths direction="clockwise" />
            <FloatingPaths direction="counterclockwise" />
        </div>
    );
}