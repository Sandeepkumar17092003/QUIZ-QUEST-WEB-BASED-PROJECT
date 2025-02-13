import React, { useState, useEffect } from "react";
import firebaseApp, { db } from "../Firebase";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { jsPDF } from "jspdf";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";
import DisplayPlaylist from "./DisplayPlaylist";
const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [rooms, setRooms] = useState([]); // Store rooms data
  const [userCount, setUserCount] = useState(null);
  const [roomCount, setRoomCount] = useState(null);
  const [filteredRooms, setFilteredRooms] = useState([]); // Added filteredRooms state
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Fetch rooms and participants count, and listen for updates
  useEffect(() => {
    // Update the current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Listen for real-time updates to the rooms collection
    const unsubscribeRooms = onSnapshot(
      collection(db, "Rooms"),
      (querySnapshot) => {
        const roomsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRooms(roomsData);
        setFilteredRooms(roomsData); // Update filteredRooms
        setRoomCount(roomsData.length);
      },
      (error) => {
        console.error("Error listening to rooms:", error);
        setRoomCount(0); // Default to 0 if there's an error
      }
    );

    // Listen for real-time updates to the 'users' collection
    const unsubscribeUsers = onSnapshot(
      collection(db, "users"),
      (querySnapshot) => {
        setUserCount(querySnapshot.size);
      },
      (error) => {
        console.error("Error listening to user count:", error);
        setUserCount(0);
      }
    );

    // Cleanup listeners when the component is unmounted
    return () => {
      clearInterval(timer);
      unsubscribeRooms();
      unsubscribeUsers();
    };
  }, []);

  // Format the current date
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format the current time
  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Function to generate the PDF report
  const generatePDF = async (roomId) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Subject: ${room.roomSubject}`, 20, 20);
    doc.text("Participants:", 20, 30);

    const participantsRef = collection(db, `Rooms/${roomId}/Participants`);
    const snapshot = await getDocs(participantsRef);
    let yPos = 40;
    snapshot.docs.forEach((participantDoc) => {
      const participant = participantDoc.data();
      doc.text(
        `Name: ${participant.name}, Score: ${participant.score}`,
        20,
        yPos
      );
      yPos += 10;
    });

    doc.save(`Room_${roomId}_Results.pdf`);
  };

  useEffect(() => {
    const auth = getAuth();
    const fetchUser = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        alert("login is required");
        navigate("/Login");
      }
    });
    return () => fetchUser();
  }, [navigate]);

  const handleDeleteRoom = async (roomId) => {
    const confirmation = window.confirm(
      "Are you sure you want to delete this room?"
    );
    if (!confirmation) return;

    try {
      const roomRef = doc(db, "Rooms", roomId);
      await deleteDoc(roomRef);
      // Update filteredRooms after deletion
      setFilteredRooms(filteredRooms.filter((room) => room.id !== roomId));
    } catch (error) {
      console.error("Error deleting room: ", error);
    }
  };

  return (
    <>
      <div className={styles.dashboard}>
        <div className={styles.left}>
          <div className={styles.timeDate}>
            <div className={styles.time}>{formatTime(currentTime)}</div>
            <div className={styles.date}>{formatDate(currentTime)}</div>
          </div>
        </div>
        <div className={styles.middleCenter}>
          {/* Display the user count */}
          {userCount !== null ? (
            <div>
              <h3>Total Users: {userCount}</h3>
            </div>
          ) : (
            <div>Loading user count...</div>
          )}
        </div>
        <div className={styles.middleCenter}>
          {/* Display the room count */}
          {roomCount !== null ? (
            <div>
              <h3>Created Quiz Rooms: {roomCount}</h3>
            </div>
          ) : (
            <div>Loading room count...</div>
          )}
        </div>
        <div className={styles.right}>
          <span className={styles.textTitle}>Get participant results</span>
          <div className={styles.roomList}>
            {rooms.length === 0 ? (
              <p>Loading rooms...</p>
            ) : (
              rooms.map((room) => (
                <div key={room.id} className={styles.room}>
                  <div className={styles.roomHeader}>
                    <strong>
                      {room.roomSubject} | {room.ownerName}
                    </strong>
                  </div>
                  <span
                    onClick={() => generatePDF(room.id)}
                    className={styles.resultButton}
                  >
                    Result
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className={styles.ContainNotify}>
        <div className={styles.ContainNotify1}>
          <DisplayPlaylist/>
        </div>

        <div className={styles.ContainNotify2}>
          <h4 className={styles.notTitle}>Delete Room </h4>
          <div>
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
                  {user && room.uid === user.uid && (
                    <button onClick={() => handleDeleteRoom(room.id)}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
