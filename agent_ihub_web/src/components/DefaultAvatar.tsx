import React from 'react';
import defaultAvatar from '../assets/images/dedaultAvatar.jpeg';

export interface DefaultAvatarProps {
  size?: number;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

const DefaultAvatar: React.FC<DefaultAvatarProps> = ({
  size = 40,
  alt = 'default avatar',
  className,
  style,
}) => {
  const dimensionStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    objectFit: 'cover',
    display: 'block',
    ...style,
  };

  return (
    <img
      src={defaultAvatar}
      alt={alt}
      className={className}
      style={dimensionStyle}
    />
  );
};

export default DefaultAvatar;
