import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import firebaseApp from "../Firebase";
import { FaTrash } from "react-icons/fa"; // Import delete icon
import design from "./DisplayPlaylist.module.css"; // Assuming the styles are defined in this file

const CreatePlaylistAndAddQuestion = () => {
  // State for playlists and loading state
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true); // Toggle for visibility of playlists

  // Fetch playlists from Firestore
  const fetchPlaylists = async () => {
    const db = getFirestore(firebaseApp);
    const playlistsCollection = collection(db, "playlists");

    try {
      const querySnapshot = await getDocs(playlistsCollection);
      const playlistsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPlaylists(playlistsData.reverse()); // Reverse to show latest at the end
    } catch (error) {
      console.error("Error fetching playlists: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete playlist
  const handleDelete = async (id, playlistName) => {
    const db = getFirestore(firebaseApp);

    try {
      // Delete the playlist document
      await deleteDoc(doc(db, "playlists", id));
      alert("Playlist deleted successfully!");

      // Delete associated questions (if any)
      const questionsCollection = collection(db, playlistName);
      const questionsSnapshot = await getDocs(questionsCollection);
      const deletePromises = questionsSnapshot.docs.map((questionDoc) =>
        deleteDoc(doc(questionsCollection, questionDoc.id))
      );
      await Promise.all(deletePromises);

      fetchPlaylists(); // Refresh playlists after deletion
    } catch (error) {
      console.error("Error deleting playlist or questions: ", error);
    }
  };

  // Toggle visibility of playlists
  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  useEffect(() => {
    fetchPlaylists(); // Fetch playlists when component mounts
  }, []);

  return (
    <>
      <div className={design.PlayListAll}>
        <h2 className={design.titleText}>
          <p className={design.title} >Delete Playlists</p>
          <p onClick={toggleVisibility} className={design.textButton}>
            {isVisible ? 'Hide' : 'Show'}
          </p>
        </h2>

        {isVisible ? (
          <div className={design.playlists}>
            {loading ? (
              <p>Loading playlists...</p>
            ) : playlists.length === 0 ? (
              <p>No playlists available.</p>
            ) : (
              playlists.map((playlist) => (
                <div key={playlist.id} className={design.playlistItem}>
                  <h3>{playlist.playlistName}</h3> {/* Display the playlist name */}
                  <p>{playlist.ownerName}</p> {/* Display the owner name */}
                  <div className={design.playlistActions}>
                    <button
                      onClick={() => handleDelete(playlist.id, playlist.playlistName)}
                      className={design.deleteBtn}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ):<h3 className={design.ButtonHide}>Click on Show</h3>}
      </div>
    </>
  );
};

export default CreatePlaylistAndAddQuestion;
