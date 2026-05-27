"use client";
import { motion } from "motion/react";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

export const Skeleton = ({ className = "", width, height, circle }: SkeletonProps) => {
  return (
    <div 
      className={`skeleton ${circle ? 'rounded-full' : ''} ${className}`}
      style={{ width, height }}
    />
  );
};
