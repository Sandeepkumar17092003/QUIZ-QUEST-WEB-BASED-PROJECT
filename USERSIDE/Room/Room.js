import React, { useState, useEffect, useCallback } from "react";
import firebaseApp, { db } from "../Firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import "./Room.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Room = () => {
  const [rooms, setRooms] = useState([]);
  const [searchPassword, setSearchPassword] = useState("");
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [isEnterRoomModalOpen, setIsEnterRoomModalOpen] = useState(false);
  const [enteredName, setEnteredName] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isQuizVisible, setIsQuizVisible] = useState(false);
  const [quizTimer, setQuizTimer] = useState();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [user, setUser] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false); // To show the alert message
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const fetchUser = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
      } else {
        alert("login is required");
        navigate('/');
      }
    });
    return () => fetchUser();
  }, [navigate]);

  const fetchRooms = async () => {
    const querySnapshot = await getDocs(collection(db, "Rooms"));
    const roomsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setRooms(roomsData);
    setFilteredRooms(roomsData);
  };

  const handleEnterRoom = (roomId) => {
    setIsEnterRoomModalOpen(true);
    setCurrentRoomId(roomId);
  };

  const handleRoomJoin = async () => {
    const room = rooms.find((room) => room.id === currentRoomId);
    if (!room) return;

    if (!enteredName || !enteredPassword) {
      alert("All fields required");
      return;
    }

    const participantsSnapshot = await getDocs(
      collection(db, `Rooms/${currentRoomId}/Participants`)
    );

    const userAlreadyJoined = participantsSnapshot.docs.some(
      (doc) => doc.data().uid === user.uid
    );

    if (userAlreadyJoined) {
      alert("You have already joined this room.");
      setIsEnterRoomModalOpen(false);
      return;
    }

    if (room.password === enteredPassword) {
      await addDoc(collection(db, `Rooms/${currentRoomId}/Participants`), {
        uid: user.uid,
        name: enteredName,
        score: 0,
        submittedAt: Timestamp.fromDate(new Date()),
      });

      const questionsSnapshot = await getDocs(
        collection(db, `Rooms/${currentRoomId}/Questions`)
      );
      const fetchedQuestions = questionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setQuestions(fetchedQuestions);
      setUserAnswers(Array(fetchedQuestions.length).fill("")); 
      setIsQuizVisible(true);
      setIsEnterRoomModalOpen(false);
      setQuizTimer(room.quizDuration);
      setHasSubmitted(false);
      setQuizResult(null);
      setCurrentQuestionIndex(0);
    } else {
      alert("Incorrect password. Please try again.");
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSearch = (e) => {
    setSearchPassword(e.target.value);
    const filtered = rooms.filter((room) =>
      room.password.includes(e.target.value)
    );
    setFilteredRooms(filtered.length ? filtered : rooms);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleQuizSubmit = useCallback(async () => {
    const correctAnswersCount = questions.reduce((acc, question, index) => {
      return acc + (question.correctOption === userAnswers[index] ? 1 : 0);
    }, 0);
    const incorrectAnswersCount = questions.length - correctAnswersCount;

    setQuizResult({
      correct: correctAnswersCount,
      incorrect: incorrectAnswersCount,
    });
    setIsQuizVisible(false);
    setHasSubmitted(true);
    setShowResultModal(true);

    const participantsSnapshot = await getDocs(
      collection(db, `Rooms/${currentRoomId}/Participants`)
    );

    const participantRef = participantsSnapshot.docs.find(
      (doc) => doc.data().uid === user.uid
    );

    if (participantRef) {
      await updateDoc(
        doc(db, `Rooms/${currentRoomId}/Participants`, participantRef.id),
        {
          score: correctAnswersCount,
        }
      );
    }
  }, [questions, userAnswers, currentRoomId, user]);

  useEffect(() => {
    if (isQuizVisible && quizTimer > 0) {
      const intervalId = setInterval(() => {
        setQuizTimer((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(intervalId);
    } else if (quizTimer === 0) {
      handleQuizSubmit();
    }
  }, [isQuizVisible, quizTimer, handleQuizSubmit]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleCloseQuiz = () => {
    setIsQuizVisible(false);
    setHasSubmitted(false);
    setQuizResult(null);
    setCurrentQuestionIndex(0);
    setUserAnswers(Array(questions.length).fill("")); 
  };

  const handleCloseResultModal = () => {
    setShowResultModal(false);
  };

  // Handle the refresh or page navigation
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isQuizVisible && !hasSubmitted) {
        const message = "If you refresh the page, your progress will be lost and your marks will be set to zero!";
        event.returnValue = message; // Standard for most browsers
        return message; // For some older browsers
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isQuizVisible, hasSubmitted]);

  return (
    <div className="room-container">
      <div className="ShowRoom">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by Password Simply enter the password"
            value={searchPassword}
            onChange={handleSearch}
          />
        </div>
        {filteredRooms.map((room) => (
          <div key={room.id} className="room">
            <span>
              <b>Subject: </b>
              {room.roomSubject}
            </span>
            <span>
              <b>Owner: </b>
              {room.ownerName}
            </span>
            <div className="room-buttons">
              <button onClick={() => handleEnterRoom(room.id)}>
                Enter Room
              </button>
            </div>
          </div>
        ))}
      </div>

      {isEnterRoomModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Enter Room</h2>
            <input
              type="text"
              placeholder="Your Name"
              value={enteredName}
              onChange={(e) => setEnteredName(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={enteredPassword}
              onChange={(e) => setEnteredPassword(e.target.value)}
            />
            <button onClick={handleRoomJoin}>Enter</button>
            <button onClick={() => setIsEnterRoomModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {isQuizVisible && (
        <div className="modal">
          <div className="modal-content">
            <h6>Quiz</h6>
            <div className="time-number">
              <p>Time remaining: {formatTime(quizTimer)}</p>
              <p>
                {currentQuestionIndex + 1} / {questions.length}
              </p>
            </div>
            {hasSubmitted ? (
              <div>
                <h3>Your Answers:</h3>
                <ul>
                  {questions.map((q, index) => (
                    <li key={index}>
                      <strong>{q.question}</strong>
                      <br />
                      Your Answer:{" "}
                      {userAnswers[index]
                        ? `Option ${userAnswers[index]}`
                        : "Not answered"}
                      <br />
                      Correct Answer:{" "}
                      {q.correctOption ? `Option ${q.correctOption}` : "N/A"}
                    </li>
                  ))}
                </ul>
                <div className="navigation-buttons">
                  <button onClick={handleCloseQuiz}>Close</button>
                </div>
              </div>
            ) : (
              <>
                <h5>
                  <span className="q">{currentQuestionIndex + 1}</span>
                  <span className="q-print">
                    {questions[currentQuestionIndex]?.question}
                  </span>
                </h5>

                {questions[currentQuestionIndex]?.options.map(
                  (option, optIndex) => (
                    <div key={optIndex} className="option">
                      <input
                        type="radio"
                        name={`question-${currentQuestionIndex}`}
                        value={optIndex + 1}
                        checked={
                          userAnswers[currentQuestionIndex] ===
                          (optIndex + 1).toString()
                        }
                        onChange={(e) => {
                          const newAnswers = [...userAnswers];
                          newAnswers[currentQuestionIndex] = e.target.value;
                          setUserAnswers(newAnswers);
                        }}
                      />
                      <label>{option}</label>
                    </div>
                  )
                )}
                <div className="navigation-buttons1">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    Prev
                  </button>
                  {currentQuestionIndex < questions.length - 1 ? (
                    <button onClick={handleNextQuestion}>Next</button>
                  ) : (
                    <button onClick={handleQuizSubmit}>Submit</button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showResultModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="Result">
              <h2>Quiz Result</h2>
              <p>Correct Answers: {quizResult?.correct}</p>
              <p>Incorrect Answers: {quizResult?.incorrect}</p>
              <div className="progress-container">
                <div
                  className="progress-bar"
                  style={{
                    width: `${
                      (quizResult?.correct /
                        (quizResult?.correct + quizResult?.incorrect)) *
                        100 || 0
                    }%`,
                  }}
                >
                  {(
                    (quizResult?.correct /
                      (quizResult?.correct + quizResult?.incorrect)) *
                      100 || 0
                  ).toFixed(2)}
                  %
                </div>
              </div>
              <button onClick={handleCloseResultModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Room;
