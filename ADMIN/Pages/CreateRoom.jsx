import React, { useState, useEffect, useCallback } from "react";
import firebaseApp, { db } from "../Firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import styles from "./CreateRoom.module.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const CreateRoom = () => {
  const [ownerName, setOwnerName] = useState("");
  const [password, setPassword] = useState("");
  const [roomSubject, setRoomSubject] = useState("");
  const [quizDuration, setQuizDuration] = useState();
  const [rooms, setRooms] = useState([]);
  const [searchPassword, setSearchPassword] = useState("");
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnterRoomModalOpen, setIsEnterRoomModalOpen] = useState(false);
  const [enteredName, setEnteredName] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isQuizVisible, setIsQuizVisible] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false); // Updated state to show participants modal
  const [quizTimer, setQuizTimer] = useState();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [user, setUser] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const navigate = useNavigate();

  const [isQuizInProgress, setIsQuizInProgress] = useState(false);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const fetchUser = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
      } else {
        alert("login is required");
        navigate('/Login');
      }
    });
    return () => fetchUser();
  }, [navigate]);

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState("");

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ownerName || !password || !roomSubject || !quizDuration || !user)
      return;

    try {
      const docRef = await addDoc(collection(db, "Rooms"), {
        ownerName,
        password,
        roomSubject,
        quizDuration,
        uid: user.uid,
        createdAt: Timestamp.fromDate(new Date()),
      });
      alert("Room successfully created");
      setCurrentRoomId(docRef.id);
      setOwnerName("");
      setPassword("");
      setRoomSubject("");
      setQuizDuration(0);
      fetchRooms();
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const fetchRooms = async () => {
    const querySnapshot = await getDocs(collection(db, "Rooms"));
    const roomsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setRooms(roomsData);
    setFilteredRooms(roomsData);
  };

  const handleAddQuestion = (roomId) => {
    setIsModalOpen(true);
    setCurrentRoomId(roomId);
  };

  const handleQuestionSubmit = async () => {
    if (
      question === "" ||
      options.some((opt) => opt === "") ||
      correctOption === ""
    ) {
      alert("Please fill in all fields.");
      return;
    }

    const questionsRef = collection(db, `Rooms/${currentRoomId}/Questions`);

    try {
      await addDoc(questionsRef, {
        question,
        options,
        correctOption,
      });

      setQuestion("");
      setOptions(["", "", "", ""]);
      setCorrectOption("");
      fetchRooms();
    } catch (error) {
      console.error("Error adding question: ", error);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    const confirmation = window.confirm(
      "Are you sure you want to delete this room?"
    );
    if (!confirmation) return;

    try {
      const roomRef = doc(db, "Rooms", roomId);
      const questionsRef = collection(db, `Rooms/${roomId}/Questions`);
      const participantsRef = collection(db, `Rooms/${roomId}/Participants`);

      const questionsSnapshot = await getDocs(questionsRef);
      const deleteQuestionsPromises = questionsSnapshot.docs.map(
        (questionDoc) => deleteDoc(doc(questionsRef, questionDoc.id))
      );

      const participantsSnapshot = await getDocs(participantsRef);
      const deleteParticipantsPromises = participantsSnapshot.docs.map(
        (participantDoc) => deleteDoc(doc(participantsRef, participantDoc.id))
      );

      await Promise.all([
        ...deleteQuestionsPromises,
        ...deleteParticipantsPromises,
      ]);
      await deleteDoc(roomRef);
      fetchRooms();
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
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

      const shuffledQuestions = shuffleArray(fetchedQuestions);

      setQuestions(shuffledQuestions);
      setUserAnswers(Array(shuffledQuestions.length).fill(""));
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

  const handleViewParticipants = async (roomId) => {
    const participantsSnapshot = await getDocs(
      collection(db, `Rooms/${roomId}/Participants`)
    );
    const participantsData = participantsSnapshot.docs.map((doc) => doc.data());
    setParticipants(participantsData);
    setShowParticipants(true); // Show the participants modal
  };

  useEffect(() => {
    fetchRooms();
  }, []);

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

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchPassword(value);
    const filtered = rooms.filter((room) =>
      room.password && room.password.includes(value)
    );
    setFilteredRooms(filtered.length ? filtered : rooms);
  };

  return (
    <div className={styles.roomContainer}>
      <div className={styles.createRoom}>
        <center className={styles.titleText1}>Create Room Here</center>
        {user && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="text"
              placeholder="Room Owner"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password For Room"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="text"
              placeholder="Room Subject"
              value={roomSubject}
              onChange={(e) => setRoomSubject(e.target.value)}
            />
            <input
              type="number"
              placeholder="Quiz Duration (seconds)"
              value={quizDuration}
              onChange={(e) => setQuizDuration(e.target.value)}
            />
            <button type="submit" className={styles.submitBtn}>Create Room</button>
          </form>
        )}
      </div>

      <div className={styles.showRoom}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search by Password Simply enter the password"
            value={searchPassword}
            onChange={handleSearch}
          />
        </div>
        {filteredRooms.map((room) => (
          <div key={room.id} className={styles.room}>
            <div className={styles.roomHeader}>
              <span>
                <b>Subject: </b>
                {room.roomSubject}
              </span>
              <span>
                <b>Owner: </b>
                {room.ownerName}
              </span>
            </div>
            <div className={styles.roomButtons}>
              {user && room.uid === user.uid ? (
                <>
                  <button onClick={() => handleAddQuestion(room.id)}>
                    Add Question
                  </button>
                  <button onClick={() => handleViewParticipants(room.id)}>
                    Participants
                  </button>
                  <button onClick={() => handleDeleteRoom(room.id)}>
                    Delete
                  </button>
                </>
              ) : (
                <button onClick={() => handleEnterRoom(room.id)}>
                  Enter Room
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Add Question</h2>
            <input
              type="text"
              placeholder="Question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            {options.map((opt, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Option ${index + 1}`}
                value={opt}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[index] = e.target.value;
                  setOptions(newOptions);
                }}
              />
            ))}
            <input
              type="text"
              placeholder="Correct Option (1-4)"
              value={correctOption}
              onChange={(e) => setCorrectOption(e.target.value)}
            />
            <div className={styles.buttonCollect}>
            <button onClick={() => setIsModalOpen(false)} className={styles.closeQuestionButton}>Close</button>
            <button onClick={handleQuestionSubmit} className={styles.AddQuestionButton}>Submit Question</button>
            </div>
          </div>
        </div>
      )}

      {isEnterRoomModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
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
            <button onClick={() => setIsEnterRoomModalOpen(false)}  className={styles.closeQuestionButton}>
              Close
            </button>
          </div>
        </div>
      )}

      {showParticipants && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Participants</h2>
            <ul>
              {participants.map((participant, index) => (
                <li key={index}>
                  <strong>{participant.name}</strong> - Score:{" "}
                  {participant.score}
                </li>
              ))}
            </ul>
            <button onClick={() => setShowParticipants(false)}  className={styles.closeParticipant}>Close</button>
          </div>
        </div>
      )}

      {isQuizVisible && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h6>Quiz</h6>
            <div className={styles.timeNumber}>
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
                <div className={styles.navigationButtons}>
                  <button onClick={handleCloseQuiz}>Close</button>
                </div>
              </div>
            ) : (
              <div>
                <h4>{questions[currentQuestionIndex].question}</h4>
                <div className={styles.options}>
                  {questions[currentQuestionIndex].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const updatedAnswers = [...userAnswers];
                        updatedAnswers[currentQuestionIndex] = index + 1;
                        setUserAnswers(updatedAnswers);
                      }}
                      className={
                        userAnswers[currentQuestionIndex] === index + 1
                          ? styles.selected
                          : ""
                      }
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className={styles.navigationButtons}>
                  {currentQuestionIndex > 0 && (
                    <button onClick={handlePrevQuestion}>Previous</button>
                  )}
                  {currentQuestionIndex < questions.length - 1 ? (
                    <button onClick={handleNextQuestion}>Next</button>
                  ) : (
                    <button onClick={handleQuizSubmit}>Submit</button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showResultModal && quizResult && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Quiz Results</h2>
            <p>Correct Answers: {quizResult.correct}</p>
            <p>Incorrect Answers: {quizResult.incorrect}</p>
            <button onClick={handleCloseResultModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateRoom;
