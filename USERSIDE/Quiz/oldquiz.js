import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import firebaseApp from "../Firebase";
import { useNavigate } from "react-router-dom";
import "./Quiz.css";

// Helper function to determine the text color based on background brightness
const getTextColor = (backgroundColor) => {
  const brightness = parseInt(backgroundColor.replace("#", ""), 16);
  return brightness > 0xffffff / 2 ? "#000" : "#fff";
};

// PlaylistList Component to Display Playlists
const PlaylistList = ({ playlists, onSelectPlaylist }) => {
  if (playlists.length === 0) {
    return <p>No playlists available.</p>;
  }

  return (
    <ul
      style={{
        listStyleType: "none",
        padding: "0",
        margin: "0",
        display: "flex",
        gap: "1.5rem",
        justifyContent: "center",
        alignItems: "flex-start",
        flexWrap: "wrap",
      }}
    >
      {playlists.map((playlist) => {
        const backgroundColor = playlist.backgroundColor || "#ffffff"; // Default background color
        const textColor = getTextColor(backgroundColor);
        return (
          <li
            key={playlist.id}
            style={{
              color: "white",
              borderRadius: "0.75rem",
              background: "#093028",
              backgroundImage: "linear-gradient(to right, #237A57, #093028)",
              padding: "1rem",
              width: "14rem",
              height: "15rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.1)",
              textAlign: "center",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
          >
            <div
              style={{
                borderRadius: "0.5rem",
                width: "100%",
                height: "12rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                marginBottom: "0.5rem",
                position: "relative",
              }}
            >
              {playlist.playlistThumbnail && (
                <img
                  src={playlist.playlistThumbnail}
                  alt="Thumbnail"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.3s ease",
                  }}
                  className="thumbnail-image"
                />
              )}
            </div>
            <h3 style={{ fontSize: "1rem", margin: "0.5rem 0", color: "white" }}>
              {playlist.playlistName}
            </h3>
            <p style={{ fontSize: "0.75rem", margin: "0", color: "white" }}>
              Date: {playlist.playlistDate}
            </p>
            <button
              onClick={() => onSelectPlaylist(playlist)} // Pass the whole playlist object
              style={{
                marginTop: "0.5rem",
                padding: "0.5rem 1rem",
                background: "#7b4397",
                backgroundImage: "linear-gradient(to right, #dc2430, #7b4397)",
                color: textColor,
                border: "none",
                borderRadius: "0.25rem",
                cursor: "pointer",
                transition: "background-color 0.3s",
                fontSize: "1rem",
              }}
            >
              View Content
            </button>
          </li>
        );
      })}
    </ul>
  );
};

const Quiz = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch playlist data
  useEffect(() => {
    const fetchPlaylists = async () => {
      const db = getFirestore(firebaseApp);
      const playlistsCollection = collection(db, "playlists");

      try {
        const querySnapshot = await getDocs(playlistsCollection);
        const playlistsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPlaylists(playlistsData);
      } catch (error) {
        setError("Error fetching data: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  // Function to handle selecting a playlist
  const handleSelectPlaylist = (playlist) => {
    console.log("Selected Playlist ID:", playlist.id); // Log the selected playlist ID
    console.log("Selected Playlist Name:", playlist.playlistName); // Log the selected playlist name

    // Navigate to the playlistQuizPage, passing the playlistId and playlistName
    navigate("/playlistQuizPage", { 
      state: { 
        playlistId: playlist.id, 
        playlistName: playlist.playlistName 
      } 
    });
  };

  return (
    <>
      <center className="text-cont">QuizList</center>
      <div
        style={{
          padding: "2rem",
          display: "flex",
          // justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          backgroundColor: "#FFFFFFFF",
          minHeight: "100vh",
        }}
      >
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <PlaylistList playlists={playlists} onSelectPlaylist={handleSelectPlaylist} />
        )}
      </div>
    </>
  );
};

export default Quiz;
