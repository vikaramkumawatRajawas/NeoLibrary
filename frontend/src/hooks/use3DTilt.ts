import { useState, useRef, useCallback, useEffect } from 'react';

interface TiltState {
  rotateX: number;
  rotateY: number;
  scale: number;
  glowX: number;
  glowY: number;
}

export function use3DTilt(maxTiltDegrees: number = 10) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  const [tilt, setTilt] = useState<TiltState>({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    glowX: 50,
    glowY: 50,
  });

  useEffect(() => {
    const touchCheck = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouch(touchCheck);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate mouse position relative to center of card (-1 to 1)
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;

    // Calculate rotation angles (inverted Y for intuitive 3D movement)
    const rotateX = -mouseY * maxTiltDegrees * 2;
    const rotateY = mouseX * maxTiltDegrees * 2;

    // Calculate glow light coordinates in percentage
    const glowX = ((e.clientX - rect.left) / width) * 100;
    const glowY = ((e.clientY - rect.top) / height) * 100;

    setTilt({
      rotateX,
      rotateY,
      scale: 1.03,
      glowX,
      glowY,
    });
  }, [isTouch, maxTiltDegrees]);

  const handleMouseLeave = useCallback(() => {
    setTilt({
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      glowX: 50,
      glowY: 50,
    });
  }, []);

  return {
    cardRef,
    tiltStyle: isTouch ? {} : {
      transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${tilt.scale})`,
      transition: tilt.scale === 1 ? 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'transform 0.1s ease-out',
    },
    glowStyle: {
      background: `radial-gradient(circle at ${tilt.glowX}% ${tilt.glowY}%, rgba(124, 58, 237, 0.25) 0%, rgba(37, 99, 235, 0.1) 45%, transparent 70%)`,
    },
    handleMouseMove,
    handleMouseLeave,
    isTouch,
  };
}
