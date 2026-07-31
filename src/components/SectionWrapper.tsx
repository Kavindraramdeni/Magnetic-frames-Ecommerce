import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

interface SectionWrapperProps {
  children: React.ReactNode;
  backgroundImage: string;
  overlayColor?: string;
  parallaxSpeed?: number;
}

export default function SectionWrapper({ 
  children, 
  backgroundImage, 
  overlayColor = 'rgba(250, 248, 245, 0.85)', 
  parallaxSpeed = 0.2 
}: SectionWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Calculate parallax movement
  // Move from -10% to 10% of height based on scroll
  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);

  return (
    <section 
      ref={containerRef}
      className="relative w-full overflow-hidden min-h-[400px]"
    >
      {/* Parallax Background Layer */}
      <motion.div 
        style={{ 
          y,
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        className="absolute inset-0 z-0 scale-110"
      />
      
      {/* Refined Overlay to maintain readability */}
      <div 
        style={{ backgroundColor: overlayColor }}
        className="absolute inset-0 z-10 backdrop-blur-[2px]"
      />

      {/* Content Layer with Reveal Animation */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="relative z-20"
      >
        {children}
      </motion.div>
    </section>
  );
}
