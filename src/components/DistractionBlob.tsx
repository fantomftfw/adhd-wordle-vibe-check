import React from 'react';

interface DistractionBlobProps {
  onClick: () => void;
  style: React.CSSProperties;
}

export const DistractionBlob = ({ onClick, style }: DistractionBlobProps) => {
  return (
    <div
      className="fixed w-16 h-16 rounded-full cursor-pointer z-40 animate-pulse-slow shadow-lg"
      style={{
        ...style,
        background: 'radial-gradient(circle, #ff7e5f, #feb47b)',
        boxShadow: '0 0 15px 5px #ff7e5f, 0 0 25px 15px #feb47b',
        transform: 'translate(-50%, -50%)',
      }}
      onClick={onClick}
    />
  );
};
