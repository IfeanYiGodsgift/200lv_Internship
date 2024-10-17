// src/components/VideoThumbnail.tsx
//import React, { useState } from "react";
import styled from "styled-components";

// Styled-component for the wrapper around each video thumbnail
const ThumbnailWrapper = styled.div`
  position: relative;
  display: inline-block;
  margin: 10px;
`;

// Styled-component for the description that appears when hovering over the thumbnail
const Description = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  text-align: center;
  opacity: 0; // Initially hidden
  transition: opacity 0.3s ease-in-out; // Smooth transition for showing/hiding
  padding: 5px;
`;

// Styled-component for the thumbnail image
const Thumbnail = styled.img`
  width: 200px;
  height: 150px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease; // Smooth transitions for hover effects
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6); // Initial shadow

  &:hover {
    transform: translateY(-10px); // Moves the image up slightly
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.8); // Intensifies the shadow
  }

  // Show the description when hovering over the thumbnail
  &:hover + ${Description} {
    opacity: 1; // Makes the description visible
  }
`;

// Props for the VideoThumbnail component
interface VideoThumbnailProps {
  src: string; // Source URL of the video thumbnail image
  description: string; // Description of the video
  onClick: () => void; // Click handler function
}

// Functional component for rendering a video thumbnail with a description
const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  src,
  description,
  onClick,
}) => {
  return (
    <ThumbnailWrapper>
      {/* Thumbnail image with click handler */}
      <Thumbnail src={src} onClick={onClick} />
      {/* Description that appears on hover */}
      <Description>{description}</Description>
    </ThumbnailWrapper>
  );
};

export default VideoThumbnail;
