import React, { useEffect, useState } from "react";
import { db } from "../Firebase"; // Import Firestore db instance
import { collection, onSnapshot } from "firebase/firestore"; // Firestore v9+ real-time API
import "./Leaderboard.css"; // Import CSS for styling

const Leaderboard = () => {
  const [leaderboards, setLeaderboards] = useState({});
  const [loading, setLoading] = useState(true); // Loading state
  const [selectedSubject, setSelectedSubject] = useState(null); // For filtering leaderboard by subject

  useEffect(() => {
    // Real-time listener for users and history collections
    const unsubscribeUsers = onSnapshot(
      collection(db, "users"),
      (usersSnapshot) => {
        const usersMap = {};
        usersSnapshot.forEach((doc) => {
          const user = doc.data();
          usersMap[user.uid] = user.username; // Create a map: userId -> username
        });

        // Fetch history data in real-time
        const unsubscribeHistory = onSnapshot(
          collection(db, "History"),
          (historySnapshot) => {
            const historyData = [];
            historySnapshot.forEach((doc) => {
              historyData.push(doc.data()); // Collect history data
            });

            // Group history data by subject and keep only the highest score per user
            const groupedData = historyData.reduce((acc, entry) => {
              if (!acc[entry.playlistName]) {
                acc[entry.playlistName] = {};
              }

              if (
                !acc[entry.playlistName][entry.userId] ||
                acc[entry.playlistName][entry.userId].correctAnswers <
                  entry.correctAnswers
              ) {
                acc[entry.playlistName][entry.userId] = entry;
              }

              return acc;
            }, {});

            // Sort the leaderboard by score (correctAnswers) and FCFS if scores are equal
            const sortedLeaderboards = Object.keys(groupedData).reduce(
              (acc, subject) => {
                const sortedUsers = Object.values(groupedData[subject])
                  .map((user) => ({
                    ...user,
                    userName: usersMap[user.userId] || "Unknown User", // Add username from usersMap
                  }))
                  .sort((a, b) => {
                    if (b.correctAnswers === a.correctAnswers) {
                      return a.userId.localeCompare(b.userId); // FCFS if scores are equal
                    }
                    return b.correctAnswers - a.correctAnswers; // Sort by score (correctAnswers) descending
                  });

                acc[subject] = sortedUsers;
                return acc;
              },
              {}
            );

            setLeaderboards(sortedLeaderboards); // Update the leaderboard
            setSelectedSubject(Object.keys(sortedLeaderboards)[0]); // Default to the first subject
            setLoading(false); // Stop loading
          }
        );

        // Cleanup function to unsubscribe from real-time listeners
        return () => {
          unsubscribeHistory();
        };
      }
    );

    // Initial cleanup
    return () => {
      unsubscribeUsers();
    };
  }, []); // Empty dependency array to run only once when the component is mounted

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading Leaderboard...</p>
        {/* Add a spinner if desired */}
      </div>
    );
  }

  return (
    <div className="All-contain-leader">
      <h3 className="head-title">Leaderboard</h3>
      <div className="subjects-scroll-container">
        {Object.keys(leaderboards).map((subject) => (
          <button
            key={subject}
            className={`subject-button ${
              selectedSubject === subject ? "active" : ""
            }`}
            onClick={() => setSelectedSubject(subject)}
          >
            {subject}
          </button>
        ))}
      </div>
      <div className="con">
        {selectedSubject && leaderboards[selectedSubject] && (
          <div className="con-table">
            <h6>{selectedSubject}😎🫣</h6>
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboards[selectedSubject].map((user, index) => (
                  <tr key={user.userId}>
                    <td>{index + 1}</td>
                    <td>{user.userName}</td>
                    <td>{user.correctAnswers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
