import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import firebaseApp from "../Firebase";
import { FaTrash, FaEdit } from "react-icons/fa"; // Icons for delete and update
import design from "./CreateQuiz.module.css";
// import "./AddQuestion.css";

// Upload file function
const uploadFile = async (file) => {
  const storage = getStorage(firebaseApp);
  const storageRef = ref(storage, `thumbnilImage/${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

const CreatePlaylistAndAddQuestion = () => {
  // Create Playlist State
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    playlistName: "",
    playlistDate: "",
    playlistThumbnail: null,
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPlaylistId, setCurrentPlaylistId] = useState(null);
  const [previousPlaylistName, setPreviousPlaylistName] = useState(""); // Store previous playlist name

  // Add Question State
  const [questionFormData, setQuestionFormData] = useState({
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correctOption: "",
    category: "", // This will hold the selected category
  });

  const [isOpen, setIsOpen] = useState(false); // Toggle for playlist display
  const [selectedFileForQuestion, setSelectedFileForQuestion] = useState(null);

  // Handle input change for both forms
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (
      event.target.name === "category" ||
      event.target.name === "question" ||
      event.target.name === "option1" ||
      event.target.name === "option2" ||
      event.target.name === "option3" ||
      event.target.name === "option4" ||
      event.target.name === "correctOption"
    ) {
      setQuestionFormData({ ...questionFormData, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle file change for both forms
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (event.target.name === "playlistThumbnail") {
      setSelectedFile(file);
      setFormData({ ...formData, playlistThumbnail: file });
    } else {
      setSelectedFileForQuestion(file);
      setQuestionFormData({ ...questionFormData, playlistThumbnail: file });
    }
  };

  // Create Playlist Submit
  const handlePlaylistSubmit = async (event) => {
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
      fetchPlaylists();
    } catch (error) {
      console.error("Error uploading file or saving metadata: ", error);
    }
  };

  // Add Question Submit
  const handleQuestionSubmit = async (event) => {
    event.preventDefault();

    const db = getFirestore(firebaseApp);

    try {
      // Check if category is selected
      if (!questionFormData.category) {
        alert("Please select a category");
        return;
      }

      // Find the selected playlist object to get its name
      const selectedPlaylist = playlists.find(
        (playlist) => playlist.id === questionFormData.category
      );

      if (!selectedPlaylist) {
        alert("Selected category is invalid.");
        return;
      }

      const collectionName = selectedPlaylist.playlistName;

      // Add the question data to the relevant category collection in Firestore
      await addDoc(collection(db, collectionName), {
        question: questionFormData.question,
        options: [
          questionFormData.option1,
          questionFormData.option2,
          questionFormData.option3,
          questionFormData.option4,
        ],
        correctOption: questionFormData.correctOption,
        playlistId: questionFormData.category,
      });

      alert(`Question successfully added to ${collectionName}!`);

      // Clear the form after submission
      setQuestionFormData({
        question: "",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        correctOption: "",
        category: "",
      });
    } catch (error) {
      console.error("Error adding question: ", error);
      alert("Failed to add question. Please try again.");
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
      // Reverse playlists to ensure the latest playlist is shown at the end
      setPlaylists(playlistsData.reverse());
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

  useEffect(() => {
    fetchPlaylists();
  }, []);

// Show or hide

const [isVisible, setIsVisible] = useState(true); // State to toggle visibility

  // Toggle function
  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };




  return (
    <>
      <div>
        <div className={design.CreateAdd}>
          {/* Create Playlist Section */}
          <div className={design.Aptitude}>
            <center className={design.AppTitle}>
              {isUpdating ? "Update Playlist" : "Create Playlist"}
            </center>
            <form onSubmit={handlePlaylistSubmit} className={design.FormDesign}>
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
              <label htmlFor="file-upload" className={design.CustomFile}>
                {selectedFile ? selectedFile.name : "Upload Thumbnail"}
              </label>
              <input
                id="file-upload"
                type="file"
                name="playlistThumbnail"
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: "none" }}
              />

              <br />
              <button type="submit" className={design.buttonSubmit}>
                {isUpdating ? "Update" : "Submit"}
              </button>
            </form>
          </div>

          {/* Add Question Section */}
          <div className={design.technical}>
            <center className={design.AppTitle}>Add Question</center>
            <form onSubmit={handleQuestionSubmit} className={design.FormDesign}>
              <input
                type="text"
                placeholder="Enter the question"
                name="question"
                className="question"
                value={questionFormData.question}
                onChange={handleInputChange}
                required
              />
              <br />

              <input
                type="text"
                placeholder="First Option"
                name="option1"
                className="opt1"
                value={questionFormData.option1}
                onChange={handleInputChange}
                required
              />
              <br />

              <input
                type="text"
                placeholder="Second Option"
                name="option2"
                className="opt2"
                value={questionFormData.option2}
                onChange={handleInputChange}
                required
              />
              <br />

              <input
                type="text"
                placeholder="Third Option"
                name="option3"
                className="opt3"
                value={questionFormData.option3}
                onChange={handleInputChange}
                required
              />
              <br />

              <input
                type="text"
                placeholder="Fourth Option"
                name="option4"
                className="opt4"
                value={questionFormData.option4}
                onChange={handleInputChange}
                required
              />
              <br />

              <input
                type="text"
                name="correctOption"
                placeholder="Write Correct Option not Option number"
                className="crt"
                value={questionFormData.correctOption}
                onChange={handleInputChange}
                required
              />

              <div className={design.DivSelect}>
                <select
                  name="category"
                  className={design.dropDown}
                  value={questionFormData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Playlist</option>
                  {loading ? (
                    <option value="">Loading categories...</option>
                  ) : playlists.length > 0 ? (
                    playlists.map((playlist) => (
                      <option key={playlist.id} value={playlist.id}>
                        {playlist.playlistName}
                      </option>
                    ))
                  ) : (
                    <option value="">No categories available</option>
                  )}
                </select>
              </div>
              <button type="submit" className="submit-button">
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className={design.PlayListAll}>
      <h2 className={design.titleText}><p>Uploaded Playlists</p> <p  onClick={toggleVisibility} className={design.textButton}>{isVisible ? 'Hide' : 'Show'}</p></h2>
     
        {isVisible && <div className={design.playlists}>
          
          {loading ? (
            <p>Loading playlists...</p>
          ) : playlists.length === 0 ? (
            <p>No playlists available.</p>
          ) : (
            playlists.map((playlist) => (
              <div key={playlist.id} className={design.playlistItem}>
                <img
                  src={playlist.playlistThumbnail}
                  alt="Thumbnail"
                  className={design.playlistThumbnail}
                />
                <h3>{playlist.playlistName}</h3>
                <p>{playlist.playlistDate}</p>
                <div className={design.playlistActions}>
                  <button
                    onClick={() => handleUpdate(playlist.id)}
                    className={design.updateBtn}
                  >
                    <FaEdit /> Update
                  </button>
                  <button
                    onClick={() =>
                      handleDelete(playlist.id, playlist.playlistName)
                    }
                    className={design.deleteBtn}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>}
      </div>
    </>
  );
};

export default CreatePlaylistAndAddQuestion;
