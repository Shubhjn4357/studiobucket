"use client";

import { IconArrowLeft, IconArrowRight, IconVideo } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo, useCallback } from "react";

type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

export const AnimatedTestimonials = ({
  testimonials,
  autoplay = false,
}: {
  testimonials: Testimonial[];
  autoplay?: boolean;
}) => {
  const [active, setActive] = useState(0);

  const handleNext = useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const handlePrev = useCallback(() => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  const isActive = (index: number) => {
    return index === active;
  };

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay, handleNext]);

  // Use a stable random seed based on indices to avoid render-time Math.random()
  const randomRotations = useMemo(() => 
    testimonials.map((_, i) => ((i * 7) % 21) - 10),
    [testimonials]
  );

  return (
    <div className="mx-auto max-w-sm px-4 py-12 font-sans antialiased md:max-w-4xl md:px-8 lg:px-12">
      <div className="relative grid grid-cols-1 gap-12 md:grid-cols-2">
        <div>
          <div className="relative h-72 w-full">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.src}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    z: -100,
                    rotate: randomRotations[index],
                  }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.7,
                    scale: isActive(index) ? 1 : 0.95,
                    z: isActive(index) ? 0 : -100,
                    rotate: isActive(index) ? 0 : randomRotations[index],
                    zIndex: isActive(index)
                      ? 40
                      : testimonials.length + 2 - index,
                    y: isActive(index) ? [0, -60, 0] : 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    z: 100,
                    rotate: randomRotations[index],
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 origin-bottom"
                >
                  <div className="h-full w-full rounded-2xl bg-secondary/10 border border-border flex flex-col items-center justify-center relative overflow-hidden group/card shadow-sm">
                    <div className="absolute inset-0 industrial-grid opacity-20" />
                    <div className="relative z-10 space-y-4 text-center">
                      <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 inline-block">
                         <IconVideo className="h-8 w-8 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-primary tracking-widest uppercase">Verified_Operator</p>
                        <p className="text-[8px] text-muted-foreground font-mono uppercase opacity-50">UID: {testimonial.src}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex flex-col justify-between py-2">
          <motion.div
            key={active}
            initial={{
              y: 10,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: -10,
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
          >
            <h3 className="text-xl font-black text-foreground italic uppercase tracking-tight">
              {testimonials[active].name}
            </h3>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">
              {testimonials[active].designation}
            </p>
            <motion.p className="mt-6 text-base text-muted-foreground font-medium leading-relaxed">
              {testimonials[active].quote.split(" ").map((word, index) => (
                <motion.span
                  key={index}
                  initial={{
                    filter: "blur(8px)",
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    filter: "blur(0px)",
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut",
                    delay: 0.02 * index,
                  }}
                  className="inline-block"
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </motion.p>
          </motion.div>
          <div className="flex gap-3 pt-8 md:pt-0">
            <button
              onClick={handlePrev}
              className="group flex h-8 w-8 items-center justify-center rounded-lg bg-surface border border-border hover:bg-primary/10 hover:border-primary/20 transition-all"
            >
              <IconArrowLeft className="h-4 w-4 text-foreground transition-transform duration-300 group-hover:-rotate-12" />
            </button>
            <button
              onClick={handleNext}
              className="group flex h-8 w-8 items-center justify-center rounded-lg bg-surface border border-border hover:bg-primary/10 hover:border-primary/20 transition-all"
            >
              <IconArrowRight className="h-4 w-4 text-foreground transition-transform duration-300 group-hover:rotate-12" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

