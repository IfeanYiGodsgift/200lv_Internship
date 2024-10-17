import React, { useEffect, useState } from "react";
import axios from "axios";
import VideoThumbnail from "../components/VideoThumbnail";
import CategoryFilter from "../components/CategoryFilter";
import AlbumList from "../components/AlbumList";
import styled from "styled-components";

// Define the Video interface
interface Video {
  src: string;
  thumbnail: string;
  description: string;
  categories: string[];
  album: string;
}

// Styled-components for modal and other UI elements
const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2%;
  border-radius: 10px;
  max-width: 80%;
  max-height: 80%;
  overflow: auto;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0.0000000001px; // Ensure the button is positioned above the modal content
  right: 0.0000000000002px; // Adjust the button's distance from the right edge
  background: none;
  border: none;
  color: black;
  font-size: 2em; // Increased font size for better visibility
  cursor: pointer;
  z-index: 1001; // Ensure the button is above all other content
`;

const VideoPlayer = styled.video`
  width: 100%;
  height: auto;
  max-height: 70vh; // Ensure the video doesn't exceed the modal height
`;

const SearchInput = styled.input`
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 50%; // Adjusted width to be shorter
`;

const MainContent = styled.div`
  display: flex;
`;

const VideoListWrapper = styled.div`
  flex: 1;
  padding: 10px;
`;

const VideoList: React.FC = () => {
  // State variables to manage video data, selected video, category, album, search term, loading, and error states
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch video data from backend API
    const fetchVideos = async () => {
      try {
        const response = await axios.get<Video[]>(
          "http://localhost:5000/videos"
        );
        setVideos(response.data);
      } catch (error) {
        setError("Error fetching videos. Please try again later.");
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Function to handle thumbnail click and open the video in a modal
  const handleThumbnailClick = (src: string) => {
    setSelectedVideo(src);
  };

  // Function to close the modal
  const closeModal = () => {
    setSelectedVideo(null);
  };

  // Collect unique categories from the videos
  const categories = Array.from(
    new Set(videos.flatMap((video) => video.categories))
  );

  // Collect unique albums from the videos
  const albums = Array.from(new Set(videos.map((video) => video.album)));

  // Filter videos based on the selected category, album, and search term
  const filteredVideos = videos.filter(
    (video) =>
      (selectedCategory ? video.categories.includes(selectedCategory) : true) &&
      (selectedAlbum ? video.album === selectedAlbum : true) &&
      (searchTerm
        ? video.description.toLowerCase().includes(searchTerm.toLowerCase())
        : true)
  );

  return (
    <div>
      <h1>Video App</h1>
      {/* Search input to filter videos based on description */}
      <SearchInput
        type="text"
        placeholder="Search videos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {/* Category filter to filter videos based on selected category */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <MainContent>
        {/* Album list to filter videos based on selected album */}
        <AlbumList
          albums={albums}
          selectedAlbum={selectedAlbum}
          onAlbumChange={setSelectedAlbum}
        />
        <VideoListWrapper>
          {/* Display loading or error messages, or render video thumbnails based on filtered videos */}
          {loading ? (
            <p>Loading videos...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            filteredVideos.map((video, index) => (
              <VideoThumbnail
                key={index}
                src={video.thumbnail}
                description={video.description}
                onClick={() => handleThumbnailClick(video.src)}
              />
            ))
          )}
        </VideoListWrapper>
      </MainContent>

      {/* Modal to display the selected video */}
      {selectedVideo && (
        <ModalWrapper>
          <ModalContent>
            {/* Close button to exit the modal */}
            <CloseButton onClick={closeModal}>&times;</CloseButton>
            {/* Video player to show the selected video */}
            <VideoPlayer controls src={selectedVideo} />
          </ModalContent>
        </ModalWrapper>
      )}
    </div>
  );
};

export default VideoList;
