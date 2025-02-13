import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // To handle auth
import firebaseApp from "../Firebase";
import "./playlistQuizPage.css";

const PlaylistQuizPage = () => {
  const location = useLocation();
  const { playlistId, playlistName } = location.state || {};
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState(new Array(30).fill(null)); // Assuming max 30 questions
  const [timer, setTimer] = useState(1800); // 30 minutes in seconds
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [user, setUser] = useState(null); // Store logged-in user info
  const [historyExists, setHistoryExists] = useState(false); // To track if history exists

  const navigate = useNavigate();

  // Function to check if user has taken the quiz before, now memoized
  const checkQuizHistory = useCallback(async (user) => {
    const db = getFirestore(firebaseApp);
    const historyRef = collection(db, "History");
    const q = query(
      historyRef,
      where("userId", "==", user.uid),
      where("playlistId", "==", playlistId)
    );

    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setHistoryExists(true); // User has quiz history
      }
    } catch (error) {
      console.error("Error checking quiz history:", error);
    }
  }, [playlistId]);

  // useEffect to check if user is logged in and call checkQuizHistory
  useEffect(() => {
    const auth = getAuth(firebaseApp);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        checkQuizHistory(user); // Check if user has taken this quiz before
      } else {
        setUser(null); // No user logged in
      }
    });
  }, [checkQuizHistory]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const db = getFirestore(firebaseApp);
      const questionsRef = collection(db, playlistName);
      const q = query(questionsRef, where("playlistId", "==", playlistId));

      try {
        const querySnapshot = await getDocs(q);
        const questionsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQuestions(questionsData);
      } catch (error) {
        setError("Error fetching questions: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    if (playlistId && playlistName) {
      fetchQuestions();
    } else {
      setError("No playlist ID or name provided.");
      setLoading(false);
    }
  }, [playlistId, playlistName]);

  const storeQuizHistory = useCallback(async (user, correctAnswers, incorrectAnswers) => {
    const db = getFirestore(firebaseApp);

    try {
      const historyData = {
        userId: user.uid,
        userName: user.displayName || user.email,
        playlistId: playlistId,
        playlistName: playlistName,
        correctAnswers: correctAnswers,
        incorrectAnswers: incorrectAnswers,
        date: new Date().toISOString(), // Store current date
      };

      await addDoc(collection(db, "History"), historyData);
      console.log("History saved successfully");
    } catch (error) {
      console.error("Error saving quiz history:", error);
    }
  }, [playlistId, playlistName]);

  const calculateResults = useCallback(() => {
    const correctAnswers = questions.reduce((count, question, index) => {
      return userAnswers[index] === question.correctOption ? count + 1 : count;
    }, 0);

    const incorrectAnswers = questions.length - correctAnswers;
    setResult({ correct: correctAnswers, incorrect: incorrectAnswers });
    setQuizCompleted(true);

    // Store the quiz result in history if user is logged in and no history exists
    if (user && !historyExists) {
      storeQuizHistory(user, correctAnswers, incorrectAnswers);
    }
  }, [questions, userAnswers, user, historyExists, storeQuizHistory]);

  useEffect(() => {
    if (timer > 0 && !quizCompleted) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setQuizCompleted(true);
      calculateResults(); // Automatically calculate results when time runs out
    }
  }, [timer, quizCompleted, calculateResults]);

  const handleAnswerSelect = (option) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = option; // Save the selected answer for the current question
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleSubmit = () => {
    calculateResults();
  };

  const handleBackToHome = () => {
    navigate("/Quiz/Quiz");
  };

  const noQuestions = questions.length === 0;

  return (
    <>
      <h2 className="title">Exam Subject: {playlistName}</h2>
      <div className="playlist_question">
        <div className="quiz-section">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : noQuestions ? (
            <p>No questions available for this playlist.</p>
          ) : quizCompleted && result ? (
            <div className="results-container">
              <div className="result-box">
                <h3 className="result-title">Quiz Results</h3>
                <div className="result-stats">
                  <p className="correct-answer">
                    <span className="label">Correct Answers:</span>{" "}
                    <span className="value">{result.correct}</span>
                  </p>
                  <p className="incorrect-answer">
                    <span className="label">Incorrect Answers:</span>{" "}
                    <span className="value">{result.incorrect}</span>
                  </p>
                </div>
                <button className="home-button" onClick={handleBackToHome}>
                  Back to Home
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="timer">
                Time Left: {Math.floor(timer / 60)}:
                {("0" + (timer % 60)).slice(-2)}
              </div>
              <div className="question-container">
                <p className="question">
                  Q{currentQuestionIndex + 1}:{" "}
                  {questions[currentQuestionIndex]?.question}
                </p>
                <div className="options-container">
                  <ul>
                    {questions[currentQuestionIndex]?.options &&
                      questions[currentQuestionIndex].options.map(
                        (option, index) => (
                          <li key={index}>
                            <button
                              onClick={() => handleAnswerSelect(option)}
                              className={`option-button ${
                                userAnswers[currentQuestionIndex] === option
                                  ? "selected"
                                  : ""
                              }`}
                            >
                              {option}
                            </button>
                          </li>
                        )
                      )}
                  </ul>
                </div>
              </div>
              <div className="navigation-buttons">
                <button
                  className="nav-button"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </button>
                <button
                  className="nav-button"
                  onClick={
                    currentQuestionIndex === questions.length - 1
                      ? handleSubmit
                      : handleNext
                  }
                >
                  {currentQuestionIndex === questions.length - 1
                    ? "Submit"
                    : "Next"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PlaylistQuizPage;
