// src/components/AlbumList.tsx
import React from "react";
import styled from "styled-components";

// Styled-component for the album list wrapper
const AlbumListWrapper = styled.div`
  width: 200px; // Set the width of the album list
  padding: 10px; // Add padding around the album list
  border-right: 1px solid #ccc; // Add a right border
`;

// Styled-component for each album item
const AlbumItem = styled.div<{ selected: boolean }>`
  padding: 10px; // Add padding inside each album item
  cursor: pointer; // Change cursor to pointer on hover
  background-color: ${({ selected }) =>
    selected
      ? "#ddd"
      : "transparent"}; // Change background color if the item is selected
  &:hover {
    background-color: #eee; // Change background color on hover
  }
`;

// Props interface for the AlbumList component
interface AlbumListProps {
  albums: string[]; // Array of album names
  selectedAlbum: string | null; // Currently selected album
  onAlbumChange: (album: string | null) => void; // Function to handle album change
}

// AlbumList functional component
const AlbumList: React.FC<AlbumListProps> = ({
  albums,
  selectedAlbum,
  onAlbumChange,
}) => {
  return (
    <AlbumListWrapper>
      <h2>Albums</h2> {/* Heading for the album list */}
      {albums.map((album) => (
        <AlbumItem
          key={album} // Unique key for each album item
          selected={selectedAlbum === album} // Check if the current album is selected
          onClick={() => onAlbumChange(selectedAlbum === album ? null : album)} // Toggle album selection on click
        >
          {album} {/* Display the album name */}
        </AlbumItem>
      ))}
    </AlbumListWrapper>
  );
};

export default AlbumList;
