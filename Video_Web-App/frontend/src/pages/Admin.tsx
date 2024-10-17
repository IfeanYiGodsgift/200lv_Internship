import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";

// Define the Video interface
interface Video {
  _id?: string;
  src: string;
  description: string;
  categories: string[];
  album: string;
}

// Container for the admin page
const AdminContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2em;
  max-width: 800px;
  margin: 0 auto;
`;

// Header styling
const AdminHeader = styled.h1`
  font-size: 2.5em;
  margin-bottom: 1em;
`;

// Form styling
const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1em; /* Space between form elements */
  width: 100%;
  max-width: 600px;
  margin-bottom: 2em;
`;

// Styling for input fields and textarea
const Input = styled.input`
  padding: 0.5em;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

// Styling for text area
/* const TextArea = styled.textarea`
  padding: 0.5em;
  border: 1px solid #ccc;
  border-radius: 5px;
`; */

// Styling for buttons
const Button = styled.button`
  padding: 0.5em 1em;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

// List container
const ListContainer = styled.div`
  width: 100%;
  max-width: 600px;
`;

// List item styling
const ListItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 0.5em;
  border-bottom: 1px solid #ddd;
`;

// Login form styling
const LoginForm = styled(FormContainer)`
  max-width: 300px;
  margin: 0 auto;
`;

// Admin page component
const Admin: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [newVideo, setNewVideo] = useState<Video>({
    src: "",
    description: "",
    categories: [],
    album: "",
  });
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    // Fetch video data from backend API
    const fetchVideos = async () => {
      try {
        const response = await axios.get<Video[]>(
          "http://localhost:5000/videos"
        );
        setVideos(response.data);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };

    fetchVideos();
  }, []);

  // Handle file selection and set the src as the file path
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setNewVideo({ ...newVideo, src: URL.createObjectURL(file) }); // Set the file URL as the video source
    }
  };

  // Handle adding a new video (this can be updated to send the file to the backend)
  const handleAddVideo = async () => {
    if (!selectedFile) {
      console.error("No video file selected!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile); // Send the selected video file
    formData.append("description", newVideo.description);
    formData.append("categories", newVideo.categories.join(",")); // Convert array to string
    formData.append("album", newVideo.album);

    try {
      const response = await axios.post(
        "http://localhost:5000/videos",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setVideos([...videos, response.data]);
      setNewVideo({
        src: "",
        description: "",
        categories: [],
        album: "",
      });
      setSelectedFile(null); // Reset file input after upload
    } catch (error) {
      console.error("Error adding video:", error);
    }
  };

  // Handle updating a video
  const handleUpdateVideo = async () => {
    if (!editingVideo || !editingVideo._id) return;

    try {
      const response = await axios.put<Video>(
        `http://localhost:5000/videos/${editingVideo._id}`,
        editingVideo
      );
      setVideos(
        videos.map((video) =>
          video._id === response.data._id ? response.data : video
        )
      );
      setEditingVideo(null);
    } catch (error) {
      console.error("Error updating video:", error);
    }
  };

  // Handle deleting a video
  const handleDeleteVideo = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/videos/${id}`);
      setVideos(videos.filter((video) => video._id !== id));
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  // Handle changes in input fields
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Video
  ) => {
    if (editingVideo) {
      setEditingVideo({ ...editingVideo, [field]: e.target.value });
    } else {
      setNewVideo({ ...newVideo, [field]: e.target.value });
    }
  };

  // Handle changes in categories
  const handleCategoriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const categories = e.target.value.split(",").map((cat) => cat.trim());
    if (editingVideo) {
      setEditingVideo({ ...editingVideo, categories });
    } else {
      setNewVideo({ ...newVideo, categories });
    }
  };

  // Set video for editing
  const startEditing = (video: Video) => {
    setEditingVideo(video);
    setNewVideo({
      src: video.src,
      description: video.description,
      categories: video.categories,
      album: video.album,
    });
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/login", {
        username,
        password,
      });
      if (response.data.success) {
        setIsAuthenticated(true);
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("An error occurred during login");
    }
  };

  // Render login form or admin controls based on authentication status
  if (!isAuthenticated) {
    return (
      <AdminContainer>
        <AdminHeader>Admin Login</AdminHeader>
        <LoginForm>
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={handleLogin}>Login</Button>
        </LoginForm>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <AdminHeader>Admin Interface</AdminHeader>

      {/* Form for Adding/Editing Video */}
      <FormContainer>
        <h2>{editingVideo ? "Edit Video" : "Add New Video"}</h2>

        {/* Video Source Input and File Selection */}
        <div style={{ display: "flex", gap: "0.5em" }}>
          <Input
            type="text"
            placeholder="Video Source"
            value={editingVideo ? editingVideo.src : newVideo.src}
            onChange={(e) => handleInputChange(e, "src")}
          />
          <Button as="label">
            Choose Video
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              style={{ display: "none" }} // Hide the actual input
            />
          </Button>
        </div>

        <Input
          type="text"
          placeholder="Description"
          value={editingVideo ? editingVideo.description : newVideo.description}
          onChange={(e) => handleInputChange(e, "description")}
        />
        <Input
          type="text"
          placeholder="Categories (comma separated)"
          value={
            editingVideo
              ? editingVideo.categories.join(", ")
              : newVideo.categories.join(", ")
          }
          onChange={handleCategoriesChange}
        />
        <Input
          type="text"
          placeholder="Album"
          value={editingVideo ? editingVideo.album : newVideo.album}
          onChange={(e) => handleInputChange(e, "album")}
        />
        <Button onClick={editingVideo ? handleUpdateVideo : handleAddVideo}>
          {editingVideo ? "Update Video" : "Add Video"}
        </Button>
        {editingVideo && (
          <Button onClick={() => setEditingVideo(null)}>Cancel</Button>
        )}
      </FormContainer>

      {/* List of Videos with Edit/Delete Options */}
      <ListContainer>
        <h2>Existing Videos</h2>
        <ul>
          {videos.map((video) => (
            <ListItem key={video._id}>
              <p>{video.description}</p>
              <div>
                <Button onClick={() => startEditing(video)}>Edit</Button>
                <Button onClick={() => handleDeleteVideo(video._id || "")}>
                  Delete
                </Button>
              </div>
            </ListItem>
          ))}
        </ul>
      </ListContainer>
    </AdminContainer>
  );
};

export default Admin;
