import React, { useState, useEffect } from "react";
import "./Aptitude.css";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  getFirestore,
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import firebaseApp from "../Firebase";
import { FaTrash, FaEdit } from "react-icons/fa"; // Icons for delete and update

const uploadFile = async (file) => {
  const storage = getStorage(firebaseApp);
  const storageRef = ref(storage, `thumbnilImage/${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

const Aptitude = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State to store form data
  const [formData, setFormData] = useState({
    playlistName: "",
    playlistDate: "",
    playlistThumbnail: null,
  });

  // State to store selected file and update mode
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPlaylistId, setCurrentPlaylistId] = useState(null);
  const [previousPlaylistName, setPreviousPlaylistName] = useState(""); // Store previous playlist name

  // Handle file change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setFormData({ ...formData, playlistThumbnail: file });
  };

  // Handle input change
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      let fileURL = formData.playlistThumbnail;
      if (selectedFile) {
        fileURL = await uploadFile(selectedFile);
      }

      const firestore = getFirestore(firebaseApp);

      if (isUpdating) {
        // Update the existing playlist
        const docRef = doc(firestore, "playlists", currentPlaylistId);
        await updateDoc(docRef, {
          playlistName: formData.playlistName,
          playlistDate: formData.playlistDate,
          playlistThumbnail: fileURL,
        });

        // If the playlist name has changed, update associated questions and collection
        if (formData.playlistName !== previousPlaylistName) {
          const oldCollection = collection(firestore, previousPlaylistName);
          const newCollectionName = formData.playlistName;

          const questionsSnapshot = await getDocs(oldCollection);
          const createNewCollectionPromises = questionsSnapshot.docs.map(
            (questionDoc) =>
              setDoc(doc(firestore, newCollectionName, questionDoc.id), {
                ...questionDoc.data(),
              })
          );

          await Promise.all(createNewCollectionPromises);

          // Delete the old collection
          const deleteOldCollectionPromises = questionsSnapshot.docs.map(
            (questionDoc) =>
              deleteDoc(doc(firestore, previousPlaylistName, questionDoc.id))
          );
          await Promise.all(deleteOldCollectionPromises);

          // alert("Playlist and associated collection updated successfully!");
        }

        alert("Playlist updated successfully!");
      } else {
        // Add new document to Firestore
        await addDoc(collection(firestore, "playlists"), {
          playlistName: formData.playlistName,
          playlistDate: formData.playlistDate,
          playlistThumbnail: fileURL,
        });
        alert("Playlist added successfully!");
      }

      // Reset form state after submission
      setFormData({
        playlistName: "",
        playlistDate: "",
        playlistThumbnail: null,
      });
      setSelectedFile(null);
      setIsUpdating(false);
      setCurrentPlaylistId(null);
      setPreviousPlaylistName(""); // Reset previous playlist name

      // Fetch updated playlists after submission
      fetchPlaylists();
    } catch (error) {
      console.error("Error uploading file or saving metadata: ", error);
    }
  };

  // Fetch playlist data
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

  // Delete playlist and associated questions
  const handleDelete = async (id, playlistName) => {
    const db = getFirestore(firebaseApp);

    try {
      // Delete the playlist document
      await deleteDoc(doc(db, "playlists", id));
      alert("Playlist deleted successfully!");

      // Delete associated questions
      const questionsCollection = collection(db, playlistName);
      const questionsSnapshot = await getDocs(questionsCollection);
      const deletePromises = questionsSnapshot.docs.map((questionDoc) =>
        deleteDoc(doc(questionsCollection, questionDoc.id))
      );
      await Promise.all(deletePromises);
      // alert("Associated questions deleted successfully!");

      fetchPlaylists(); // Refresh after deletion
    } catch (error) {
      console.error("Error deleting playlist or questions: ", error);
    }
  };

  // Update playlist (fill form with selected playlist data)
  const handleUpdate = (id) => {
    const playlistToUpdate = playlists.find((playlist) => playlist.id === id);
    setFormData({
      playlistName: playlistToUpdate.playlistName,
      playlistDate: playlistToUpdate.playlistDate,
      playlistThumbnail: playlistToUpdate.playlistThumbnail, // Prepopulate with existing thumbnail
    });
    setSelectedFile(null); // Clear file input, let user upload a new file if desired
    setIsUpdating(true);
    setCurrentPlaylistId(id);
    setPreviousPlaylistName(playlistToUpdate.playlistName); // Store previous playlist name
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchPlaylists();
  }, []);

  // PlaylistList Component to Fetch and Display Data in Table Format
  const PlaylistList = ({ playlists }) => {
    if (playlists.length === 0) {
      return <p>No playlists available.</p>;
    }

    return (
      <table className="table">
        <thead>
          <tr>
            <th className="th" >
              Playlist Name
            </th>
            <th className="th1" >
              Date
            </th>
            <th className="th2" >
              Update 
            </th>
            <th className="th3">
              Delete
            </th>
          </tr>
        </thead>
        <tbody>
          {playlists.map((playlist) => (
            <tr key={playlist.id}>
              <td className="td1" >
                {playlist.playlistName}
              </td>
              <td className="td2">
                {playlist.playlistDate}
              </td>
              <td className="td3">
                <FaEdit
                  onClick={() => handleUpdate(playlist.id)}
                />
              </td>
              <td className="td4">
              <FaTrash className="delete-icon"
                  onClick={() =>
                    handleDelete(playlist.id, playlist.playlistName)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Toggle open and close function
  const [isOpen, setIsOpen] = useState(false);

  const toggleDiv = () => {
    setIsOpen((prevState) => !prevState);
  };

  // End here

  return (
    <>
      <div className="Aptitude">
        <center>{isUpdating ? "Update Playlist" : "Create Playlist"}</center>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="playlistName"
            value={formData.playlistName}
            onChange={handleInputChange}
            placeholder="Enter Playlist Name"
            required
          />
          <br />
          <input
            type="date"
            name="playlistDate"
            value={formData.playlistDate}
            onChange={handleInputChange}
            required
          />
          <br />
          <label htmlFor="file-upload" className="custom-file-upload">
            {selectedFile ? selectedFile.name : "Upload Thumbnail"}
          </label>
          <input
            id="file-upload"
            type="file"
            name="playlistThumbnail"
            onChange={handleFileChange}
            accept="image/*" // Accepts all image formats
          />
          <br />
          <button type="submit" className="Button-toggle">
            {isUpdating ? "Update" : "Submit"}
          </button>
        </form>
      </div>

      <div className="added-playlist">
        <center className="center-text1">You can see added-playlists here</center>

        <button className="Button-toggle" onClick={toggleDiv}>
          {isOpen ? "Hide" : "Show"}
        </button>
        {isOpen && (
          <div className="playlist-display">
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <PlaylistList playlists={playlists} />
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Aptitude;
