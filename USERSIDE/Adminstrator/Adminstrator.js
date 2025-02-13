import React, { useState, useEffect, useCallback } from "react";
import "./Adminstrator.css";
import Technical from "./Technical";
import Aptitude from "./Aptitude";
import UploadNotes from "../UploadNotes/UploadNotes";

import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import firebaseApp from "../Firebase"; // Import Firebase setup
import FeedbackDisplay from "../FeedbackDisplay/FeedbackDisplay";

const App = () => {
  const [questions, setQuestions] = useState([]); // State to hold fetched questions
  const [playlists, setPlaylists] = useState([]); // State to hold playlists
  const [filterCategory, setFilterCategory] = useState(""); // State for filtering category
  const [searchTerm, setSearchTerm] = useState(""); // State for the search term
  const [filteredQuestions, setFilteredQuestions] = useState([]); // State for filtered questions

  const db = getFirestore(firebaseApp);

  // Fetch playlists from Firestore
  const fetchPlaylists = useCallback(async () => {
    const fetchedPlaylists = [];
    try {
      const querySnapshot = await getDocs(collection(db, "playlists"));
      querySnapshot.forEach((doc) => {
        fetchedPlaylists.push({ id: doc.id, ...doc.data() });
      });
      setPlaylists(fetchedPlaylists); // Set playlists
    } catch (error) {
      console.error("Error fetching playlists: ", error);
    }
  }, [db]);

  // Fetch questions from Firestore based on the selected playlist name
  const fetchQuestions = useCallback(
    async (playlistName) => {
      let fetchedQuestions = [];
      try {
        const querySnapshot = await getDocs(collection(db, playlistName)); // Playlist name is used to fetch questions
        querySnapshot.forEach((doc) => {
          fetchedQuestions.push({
            id: doc.id,
            ...doc.data(),
            category: playlistName,
          });
        });

        setQuestions(fetchedQuestions); // Set state with fetched questions
        setFilteredQuestions(fetchedQuestions); // Initialize filtered questions
      } catch (error) {
        console.error("Error fetching questions: ", error);
        setQuestions([]); // Clear questions if there's an error
        setFilteredQuestions([]); // Clear filtered questions
      }
    },
    [db]
  );

  // Fetch playlists once when the component mounts
  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  // Fetch questions when a valid category is selected
  useEffect(() => {
    if (filterCategory) {
      fetchQuestions(filterCategory);
    } else {
      // Clear questions if no valid category is selected
      setQuestions([]);
      setFilteredQuestions([]);
    }
  }, [filterCategory, fetchQuestions]);

  // Function to delete a question from Firestore
  const handleDeleteQuestion = async (id, category) => {
    try {
      await deleteDoc(doc(db, category, id)); // Deletes the document containing the question
      setQuestions(questions.filter((question) => question.id !== id));
      alert("Question deleted successfully!");
      handleSearch(); // Refresh the filtered questions after deletion
    } catch (error) {
      console.error("Error deleting question: ", error);
    }
  };

  // Function to handle search
  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      // If the search box is empty, reset filtered questions to show all questions in the selected category
      setFilteredQuestions(questions);
    } else {
      // Otherwise, filter questions based on the search term
      const results = questions.filter((question) =>
        question.question.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredQuestions(results);
    }
  };


  // toggle open and close function here
  const [isVisible, setIsVisible] = useState(false);

  const toggleFeedback = () => {
    setIsVisible((prev) => !prev);
  };
  // end here

  return (
    <div className="count-visitors">
      <div className="add_question">
        <Technical />
        <Aptitude />
      </div>

      {/* Dropdown for filtering by playlist */}
      <div className="filter-section">
        <center
        className="center-container-1">
          Added question
        </center>

        <label
        className="playlistfilter" htmlFor="playlistFilter">
          Filter by Playlist:
        </label>
        <select
          id="playlistFilter"
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setSearchTerm(""); // Clear search term when changing playlist
            handleSearch(); // Show questions for the selected playlist
          }}
        >
          <option value="" className="value-option">
            Select Playlist
          </option>
          {/* Dynamically render playlists */}
          {playlists.map((playlist) => (
            <option key={playlist.id} value={playlist.playlistName}>
              {playlist.playlistName}
            </option>
          ))}
        </select>

        {/* Search Input with Icon */}
        <div className="sear-box-container">
          <input
            type="text"
            placeholder="Search Question..."
            value={searchTerm}
            className="search-box"
            onChange={(e) => {
              setSearchTerm(e.target.value);
              handleSearch(); // Search as you type
            }}
          />
          <button className="search-btn" onClick={handleSearch}>
            Search
          </button>
        </div>

        {/* Scrollable Table to display questions */}
        <div className="all_question_displayed">
          {filteredQuestions.length > 0 ? (
            <table className="questions-table">
              <thead>
                <tr>
                  <th>
                    Sr. No.
                  </th>
                  <th>
                    Category
                  </th>
                  <th>
                    Question
                  </th>
                  <th>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map((question, index) => (
                  <tr key={question.id}>
                    <td>
                      {index + 1}
                    </td>
                    <td>
                      {question.category}
                    </td>
                    <td>
                      {question.question}
                    </td>
                    <td>
                      <button
                        className="delete-button" onClick={() => handleDeleteQuestion(question.id, question.category)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No questions available for this category.</p>
          )}
        </div>
      </div>

      <div className="Upload-notes-container-all">
        <div className="displyed-noteshere">
          <UploadNotes />
        </div>
      </div>
      <div className="feedback-disply-here">
 
        <p onClick={toggleFeedback}>
          {isVisible ? 'Hide' : 'Show'}
        </p>
        <center className="center-title">Feedback</center>
   
      {isVisible && (
        <div className="container-feedback">
          <FeedbackDisplay />
        </div>
      )}
    </div>
    </div>
  );
};

export default App;
