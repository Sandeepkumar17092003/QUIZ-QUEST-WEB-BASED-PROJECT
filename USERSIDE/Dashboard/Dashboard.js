import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import firebaseApp from "../Firebase";
import { Link } from "react-router-dom";
import DisplayRoom from "../DisplayRoom/DisplayRoom";
import Leaderboard from "../Leaderboard/Leaderboard";


// PlaylistTable Component to Fetch and Display Data in Table Format
const PlaylistTable = ({ playlists }) => {
  if (playlists.length === 0) {
    return <p>No playlists available.</p>;
  }

  return (
    <div className="display-added-playlist">
      {playlists.map((playlist) => (
        <div className="playlist-here">
          <p key={playlist.id}>
            <p>{playlist.playlistName}</p>
            <p>{playlist.playlistDate}</p>
          </p>
          </div>
        ))}

      </div>
  );
};

// CircularProgress Component to Display Correct Answers Percentage
const CircularProgress = ({ correct, incorrect }) => {
  const total = correct + incorrect;

  // Calculate circumference for the circle
  const radius = 40; // Radius of the circle
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="circular-progress">
      <svg className="progress-ring" width="100" height="100">
        <circle
          className="progress-ring__circle"
          stroke="lightgray"
          strokeWidth="10"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
        <circle
          className="progress-ring__circle progress-ring__circle--correct"
          stroke="#3c1053"
          strokeWidth="10"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (correct / total) * circumference}
          transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }} // Animation
        />
      </svg>
      <div className="progress-text">
        {correct} / {total}
      </div>
    </div>
  );
};

// HistoryCard Component to Display Individual History Entries
const HistoryCard = ({ entry }) => {
  return (
    <div className="history-card">
      <h4>{entry.playlistName}</h4>
      <p>Date: {new Date(entry.date).toLocaleString()}</p>
      <div className="progress-container">
        <CircularProgress
          correct={entry.correctAnswers}
          incorrect={entry.incorrectAnswers}
        />
      </div>
    </div>
  );
};

// HistoryTable Component to Fetch and Display User History
const HistoryTable = ({ history }) => {
  if (history.length === 0) {
    return <p className="hist">No history available.</p>;
  }

  return (
    <div className="history-container">
      {history.map((entry) => (
        <HistoryCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
};

const Dashboard = () => {
  const [username, setUsername] = useState("Guest"); // Default to "Guest"
  const [playlists, setPlaylists] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState(null);

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

  // Fetch user data and history
  useEffect(() => {
    const auth = getAuth(firebaseApp);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch the user data from the "users" collection
        const db = getFirestore(firebaseApp);
        const userRef = collection(db, "users");
        const userQuery = query(userRef, where("uid", "==", user.uid));

        try {
          const userSnapshot = await getDocs(userQuery);
          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();
            setUsername(userData.username || "User"); // Use username from the document
          } else {
            setUsername("User");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUsername("User");
        }

        fetchUserHistory(user.uid);
      } else {
        setUsername("Guest"); // Set username to "Guest" if not logged in
        setHistory([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch user quiz history
  const fetchUserHistory = async (uid) => {
    const db = getFirestore(firebaseApp);
    const historyCollection = collection(db, "History");
    const userHistoryQuery = query(historyCollection, where("userId", "==", uid));

    try {
      const querySnapshot = await getDocs(userHistoryQuery);
      const historyData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHistory(historyData);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="Home-Contain">
      <div className="show-name">
          <span>Welcome </span>
          <span className="name-cl">{username}</span> {/* Displaying username */}
      </div>

      <div className="container-playlist">
      <strong className="strong">Added &nbsp;&nbsp;Quiz</strong>
      <div className="display-added-playlist">
        {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <PlaylistTable playlists={playlists} />
            )}
        </div>
      </div>

      <div>
          <Leaderboard/>
        </div>

      <div className="all-div-contain">
        <div className="left">
          <center className="center-text">Recommended Quiz</center>
          <div className="link-container">
            
            <Link to="/Quiz/Quiz" className="link">Data Arrangements</Link>
            <Link to="/Quiz/Quiz" className="link">Java</Link>
            <Link to="/Quiz/Quiz" className="link">Linux</Link>
            <Link to="/Quiz/Quiz" className="link">MS OFFICE</Link>
            <Link to="/Quiz/Quiz" className="link">Error Detection</Link>
            <Link to="/Quiz/Quiz" className="link">C++</Link>
            <Link to="/Quiz/Quiz" className="link">Synonyms and Antonyms</Link>
           
            <Link to="/Quiz/Quiz" className="link">ShortCut Keys</Link>
            <Link to="/Quiz/Quiz" className="link">Analogies</Link>
            <Link to="/Quiz/Quiz" className="link">Number Series</Link>
            <Link to="/Quiz/Quiz" className="link">C</Link>
            <Link to="/Quiz/Quiz" className="link">Python</Link>
          </div>
        </div>
        <div className="right">
          <center className="center-text">Created - Room </center>
          <div className="display-here">
              <DisplayRoom/>
          </div>
        </div>
      </div>
      <div className="History">
        <center className="center-text1" style={{position: 'sticky', top: 0, zIndex: 1, marginBottom: '1rem'}}>Results Overview </center>
       <div className="history-display">
          {loadingHistory ? (
            <p className="hist">History is not Available</p>
          ) : (
            <HistoryTable history={history} />
          )}
        </div>
     
      </div>
       

    </div>
  );
};

export default Dashboard;
