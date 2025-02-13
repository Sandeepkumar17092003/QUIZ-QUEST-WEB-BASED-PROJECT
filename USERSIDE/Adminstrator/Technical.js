import React, { useState, useEffect } from "react";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore"; // Import Firebase Firestore methods
import firebaseApp from "../Firebase"; // Import Firebase setup

const Technical = () => {
  const [formData, setFormData] = useState({
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correctOption: "",
    category: "", // This will hold the selected category
  });

  const [playlists, setPlaylists] = useState([]); // State to hold playlists
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch playlists from Firestore
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
        console.log("Fetched playlists:", playlistsData); // Log fetched data
        setPlaylists(playlistsData);
      } catch (error) {
        console.error("Error fetching playlists: ", error); // Log error if fetching fails
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  // Handle input change
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission and save to Firebase Firestore
  const insertData = async (event) => {
    event.preventDefault(); // Prevent page refresh

    const db = getFirestore(firebaseApp);

    try {
      // Check if category is selected
      if (!formData.category) {
        alert("Please select a category");
        return;
      }

      // Find the selected playlist object to get its name
      const selectedPlaylist = playlists.find((playlist) => playlist.id === formData.category);
      
      // If the selected playlist is not found, alert the user
      if (!selectedPlaylist) {
        alert("Selected category is invalid.");
        return;
      }

      const collectionName = selectedPlaylist.playlistName; // Get the playlist name to use as the collection name

      // Add the question data to the relevant category collection in Firestore
      await addDoc(collection(db, collectionName), {
        question: formData.question,
        options: [
          formData.option1,
          formData.option2,
          formData.option3,
          formData.option4,
        ],
        correctOption: formData.correctOption,
        playlistId: formData.category, // Save the selected category ID as playlistId
      });

      alert(`Question successfully added to ${collectionName}!`);

      // Clear the form after submission
      setFormData({
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

  return (
    <div className="technical">
      <center className="cent">Add Question</center>
      <form onSubmit={insertData} className="input-contain">
        <span>Enter the question</span>
        <input
          type="text"
          name="question"
          className="question"
          value={formData.question}
          onChange={handleInputChange}
          required
        />

        <span>First Option</span>
        <input
          type="text"
          name="option1"
          className="opt1"
          value={formData.option1}
          onChange={handleInputChange}
          required
        />

        <span>Second Option</span>
        <input
          type="text"
          name="option2"
          className="opt2"
          value={formData.option2}
          onChange={handleInputChange}
          required
        />

        <span>Third Option</span>
        <input
          type="text"
          name="option3"
          className="opt3"
          value={formData.option3}
          onChange={handleInputChange}
          required
        />

        <span>Fourth Option</span>
        <input
          type="text"
          name="option4"
          className="opt4"
          value={formData.option4}
          onChange={handleInputChange}
          required
        />

        <span>Correct Option</span>
        <input
          type="text"
          name="correctOption"
          placeholder="Write Option not Option number"
          className="crt"
          value={formData.correctOption}
          onChange={handleInputChange}
          required
        />

        <div className="dropdown">
          <span>Select Category</span>
          <select
            id="language"
            name="category"
            className="dropdown-select"
            value={formData.category}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Category</option>
            {loading ? (
              <option value="">Loading categories...</option>
            ) : playlists.length > 0 ? (
              playlists.map((playlist) => (
                <option key={playlist.id} value={playlist.id}>
                  {playlist.playlistName}{" "}
                  {/* Change to the actual field name if different */}
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
  );
};

export default Technical;
