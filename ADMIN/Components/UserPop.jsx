import React, { useState, useEffect, useRef } from "react";
import styles from "./UserPop.module.css";
import { getAuth, signOut } from "firebase/auth";
import firebaseApp from "../Firebase";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";
import { IoCloseCircleOutline } from "react-icons/io5";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";

const UserPop = ({ setShowPopup, setUser }) => {
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  const popupRef = useRef(null);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const user = auth.currentUser;
    if (user) {
      const db = getFirestore(firebaseApp);
      const userQuery = query(
        collection(db, "users"),
        where("uid", "==", user.uid)
      );

      getDocs(userQuery)
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            setUserInfo(doc.data());
          }
        })
        .catch((error) => {
          console.error("Error getting document:", error);
        });
    }

    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowPopup]);

  const handleLogout = async () => {
    setLoading(true);

    setTimeout(async () => {
      const auth = getAuth(firebaseApp);
      try {
        await signOut(auth);
        setUser(null);
        setShowPopup(false);
        navigate("/Login");
        alert("Logged out successfully");
      } catch (error) {
        alert("Logout failed. Please try again.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  return (
    <div className={styles.UserPopup} ref={popupRef}>
      <IoCloseCircleOutline
        onClick={() => setShowPopup(false)}
        className={styles.CloseIcon}
      />
      {userInfo ? (
        <div className={styles.UserInfo}>
          <p>{userInfo.username}</p>
          <p>{userInfo.email}</p>
        </div>
      ) : (
        <p>Loading user information...</p>
      )}
      <div className={styles.LogoutButtonContainer}>  
      <button onClick={handleLogout} className={styles.LogOutBtn}>
        Logout
      </button>
      </div>
      {loading && (
        <div className={styles.LoadingOverlay}>
          <Loading />
        </div>
      )}
    </div>
  );
};

export default UserPop;

