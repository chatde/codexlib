"use client";

import Tilt from "react-parallax-tilt";
import type { ReactNode } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
}

export default function TiltCard({ children, className = "" }: TiltCardProps) {
  return (
    <Tilt
      className={className}
      tiltMaxAngleX={5}
      tiltMaxAngleY={5}
      scale={1.02}
      glareEnable={true}
      glareMaxOpacity={0.08}
      glareColor="#D4A843"
      perspective={1200}
      transitionSpeed={600}
    >
      {children}
    </Tilt>
  );
}
