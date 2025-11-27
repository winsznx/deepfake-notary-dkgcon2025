import { useEffect, useRef, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import './TargetCursor.css';

const TargetCursor = ({
  targetSelector = 'button, a, .cursor-target',
  hideDefaultCursor = false
}) => {
  const cursorRef = useRef(null);
  const cornersRef = useRef(null);
  const dotRef = useRef(null);

  const isMobile = useMemo(() => {
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const isMobileUserAgent = mobileRegex.test(userAgent.toLowerCase());
    return (hasTouchScreen && isSmallScreen) || isMobileUserAgent;
  }, []);

  const moveCursor = useCallback((x, y) => {
    if (!cursorRef.current) return;
    gsap.to(cursorRef.current, {
      x,
      y,
      duration: 0.15,
      ease: 'power2.out'
    });
  }, []);

  useEffect(() => {
    if (isMobile || !cursorRef.current) return;

    const originalCursor = document.body.style.cursor;
    if (hideDefaultCursor) {
      document.body.style.cursor = 'none';
    }

    const cursor = cursorRef.current;
    cornersRef.current = cursor.querySelectorAll('.target-cursor-corner');

    gsap.set(cursor, {
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    });

    // Initially hide corners
    const corners = Array.from(cornersRef.current);
    corners.forEach(corner => {
      gsap.set(corner, { scale: 0, opacity: 0 });
    });

    const moveHandler = e => moveCursor(e.clientX, e.clientY);
    window.addEventListener('mousemove', moveHandler);

    const enterHandler = e => {
      const target = e.target.closest(targetSelector);
      if (!target || !cursor || !cornersRef.current) return;

      const rect = target.getBoundingClientRect();
      const cursorX = gsap.getProperty(cursor, 'x');
      const cursorY = gsap.getProperty(cursor, 'y');

      const cornerSize = 16;
      const borderWidth = 3; // Match CSS border width

      const cornerPositions = [
        { x: rect.left - borderWidth - cursorX, y: rect.top - borderWidth - cursorY },
        { x: rect.right + borderWidth - cornerSize - cursorX, y: rect.top - borderWidth - cursorY },
        { x: rect.right + borderWidth - cornerSize - cursorX, y: rect.bottom + borderWidth - cornerSize - cursorY },
        { x: rect.left - borderWidth - cursorX, y: rect.bottom + borderWidth - cornerSize - cursorY }
      ];

      corners.forEach((corner, i) => {
        gsap.to(corner, {
          x: cornerPositions[i].x,
          y: cornerPositions[i].y,
          scale: 1,
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      if (dotRef.current) {
        gsap.to(dotRef.current, {
          scale: 1.5,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    const leaveHandler = e => {
      const target = e.target.closest(targetSelector);
      if (!target || !cursor || !cornersRef.current) return;

      corners.forEach(corner => {
        gsap.to(corner, {
          x: 0,
          y: 0,
          scale: 0,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      if (dotRef.current) {
        gsap.to(dotRef.current, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    const mouseDownHandler = e => {
      const target = e.target.closest(targetSelector);
      if (!target) return;

      gsap.to(cursor, { scale: 0.95, duration: 0.1 });
      if (dotRef.current) {
        gsap.to(dotRef.current, { scale: 1.2, duration: 0.1 });
      }
    };

    const mouseUpHandler = e => {
      const target = e.target.closest(targetSelector);
      if (!target) return;

      gsap.to(cursor, { scale: 1, duration: 0.1 });
      if (dotRef.current) {
        gsap.to(dotRef.current, { scale: 1.5, duration: 0.1 });
      }
    };

    document.addEventListener('mouseover', enterHandler);
    document.addEventListener('mouseout', leaveHandler);
    document.addEventListener('mousedown', mouseDownHandler);
    document.addEventListener('mouseup', mouseUpHandler);

    return () => {
      window.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseover', enterHandler);
      document.removeEventListener('mouseout', leaveHandler);
      document.removeEventListener('mousedown', mouseDownHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
      document.body.style.cursor = originalCursor;
    };
  }, [targetSelector, moveCursor, hideDefaultCursor, isMobile]);

  if (isMobile) {
    return null;
  }

  return (
    <div ref={cursorRef} className="target-cursor-wrapper">
      <div ref={dotRef} className="target-cursor-dot" />
      <div className="target-cursor-corner corner-tl" />
      <div className="target-cursor-corner corner-tr" />
      <div className="target-cursor-corner corner-br" />
      <div className="target-cursor-corner corner-bl" />
    </div>
  );
};

export default TargetCursor;
