import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../Firebase"; // Ensure the correct path to your Firebase config
import { useNavigate } from "react-router-dom";
import "./DisplayRoom.css"; // Optional: add styles in a separate CSS file
// import Room from "../Room/Room";
const DisplayRoom = () => {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  const fetchRooms = async () => {
    const querySnapshot = await getDocs(collection(db, "Rooms"));
    const roomsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setRooms(roomsData);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleEnterRoom = (roomId) => {
    navigate(`../Room/Room`); // Redirect to the Room component (or wherever you want)
  };

  return (
    <div className="room-list-container1">
      {rooms.length > 0 ? (
        rooms.map((room) => (
          <div key={room.id} className="room1">
            <span>
              <b>Subject: </b>
              {room.roomSubject}
            </span>
            <span>
              <b>Owner: </b>
              {room.ownerName}
            </span>
            <button onClick={() => handleEnterRoom(room.id)}>Click Here</button>
          </div>
        ))
      ) : (
        <div className="empty">
            <p>No rooms Created</p>
            <span></span>
        </div>
      )}
    </div>
  );
};

export default DisplayRoom;
