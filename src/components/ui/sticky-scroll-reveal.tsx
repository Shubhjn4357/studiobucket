"use client";
import React, { useMemo, useRef } from "react";
import { useMotionValueEvent, useScroll, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StickyScrollProps {
  content: {
    title: string;
    description: string;
    content?: React.ReactNode;
  }[];
  contentClassName?: string;
}

export const StickyScroll = ({
  content,
  contentClassName,
}: StickyScrollProps) => {
  const [activeCard, setActiveCard] = React.useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: ref,
    offset: ["start start", "end start"],
  });
  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0,
    );
    setActiveCard(closestBreakpointIndex);
  });

  const backgroundColors = [
    "var(--background)",
    "var(--surface)",
    "var(--secondary)",
  ];
  
  const linearGradients = useMemo(() => [
    "linear-gradient(to bottom right, var(--primary), var(--primary-foreground))",
    "linear-gradient(to bottom right, var(--accent), var(--secondary))",
    "linear-gradient(to bottom right, var(--primary), var(--background))",
  ], []);

  const backgroundGradient = linearGradients[activeCard % linearGradients.length];

  return (
    <motion.div
      animate={{
        backgroundColor: backgroundColors[activeCard % backgroundColors.length],
      }}
      className="relative flex h-[30rem] justify-center space-x-10 overflow-y-auto rounded-md p-10 border border-border bg-surface transition-colors duration-500"
      ref={ref}
    >
      <div className="absolute inset-0 industrial-grid opacity-5 pointer-events-none" />
      
      <div className="relative flex items-start px-4 z-10">
        <div className="max-w-2xl">
          {content.map((item, index) => (
            <div key={item.title + index} className="my-20">
              <motion.h2
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.2,
                }}
                className="text-3xl font-black text-foreground italic uppercase tracking-tighter"
              >
                {item.title}
              </motion.h2>
              <motion.p
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.2,
                }}
                className="text-xs mt-4 max-w-sm text-muted-foreground font-bold uppercase tracking-wide opacity-80"
              >
                {item.description}
              </motion.p>
            </div>
          ))}
          <div className="h-40" />
        </div>
      </div>
      <div
        style={{ background: backgroundGradient }}
        className={cn(
          "sticky top-10 hidden h-60 w-80 overflow-hidden rounded-md bg-background lg:block border border-border shadow-sm transition-all duration-500",
          contentClassName,
        )}
      >
        <div className="absolute inset-0 industrial-grid opacity-10 pointer-events-none" />
        {content[activeCard].content ?? null}
      </div>
    </motion.div>
  );
};

