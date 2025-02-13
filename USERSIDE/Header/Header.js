import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

import firebaseApp from "../Firebase";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import "./Header.css"; // Ensure this import is correct
// Define constants for route paths
const DASHBOARD_PATH = "/Dashboard/Dashboard";
const ROOM_PATH = "/Room/Room";
const QUIZ_PATH = "/Quiz/Quiz";
const POST_QUESTION_PATH = "/Notes/Notes";
const FEEDBACK_PATH = "Feedback/Feedback";
const CONTACT_PATH = "/Contact/contact";
// const ADMINISTRATOR_PATH = "/Adminstrator/Adminstrator";

const Header = () => {
  const [sidebarActive, setSidebarActive] = useState(window.innerWidth > 900);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("Guest User");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Get the current location

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const db = getFirestore(firebaseApp);

    const fetchUser = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setDropdownVisible(false); // Ensure dropdown is hidden on user login

        const usersCollection = collection(db, "users");
        const userQuery = query(usersCollection, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(userQuery);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setUsername(userData.username);
        } else {
          console.log("No user found with this UID");
          setUsername("Guest User");
        }
      } else {
        setUser(null);
        setUsername("Guest User");
        setDropdownVisible(false); // Ensure dropdown is hidden on user logout
      }
    });

    return () => fetchUser();
  }, []);

  const handleLogout = async () => {
    const auth = getAuth(firebaseApp);
    try {
      await signOut(auth);
      setUser(null);
      setUsername("Guest User");
      setDropdownVisible(false); // Hide dropdown on logout
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible((prevState) => !prevState);
  };

  const toggleSidebar = () => {
    setSidebarActive((prevState) => {
      const newState = !prevState;
      document.body.classList.toggle("active", newState);
      return newState;
    });
  };

  const closeSidebar = () => {
    setSidebarActive(false);
    document.body.classList.remove("active");
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      closeSidebar();
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setSidebarActive(false);
        document.body.classList.remove("active");
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <div className="Header">
        <div className="NavBar">
          <div className="Navbar-contain">
            <span className="logo_name1">
              <img src="/logo/logo1.jpg" alt="logo" className="logo" />
              <div className="text1">
                <span>Q</span>
                <span>u</span>
                <span>i</span>
                <span>z</span>
                <span className="r">Q</span>
                <span className="r">u</span>
                <span className="r">e</span>
                <span className="r">s</span>
                <span className="r">t</span>
              </div>
            </span>
            <div className="LoginMenu">
              <div className="Login_signup">
                <ul>
                  <li className="notificationNavbar">
                
                    {user ? (
                      <div className="user-dropdown-container">
                        <div className="after-login" onClick={toggleDropdown}>
                          <i className="fa-solid fa-user"></i>
                        </div>

                        <div
                          className={`profile ${
                            dropdownVisible ? "active" : ""
                          }`}
                        >

                          <h2 className="username">
                            {username || "Guest User"}
                          </h2>
                          <h4 className="email">{user.email}</h4>

                          <Link
                            to={"/Login/login"}
                            onClick={handleLogout}
                            className="logout-link"
                          >
                            Logout
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <Link to={"/Login/login"}>Login</Link>
                    )}
                    
                  </li>
                </ul>
              </div>
              <span className="menu_icon" onClick={toggleSidebar}>
                <i className="fa-solid fa-bars"></i>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={`sideBar ${sidebarActive ? "active" : ""}`}>
        <span className="logoandtext">
          <div className="logo-container">
            <img src="/logo/logo1.jpg" alt="logo" />
          </div>
          <center className="logo-text">
            Quiz<span>Quest</span>
          </center>
        </span>
        <div className="sidebar-container">
          <Link
            to={DASHBOARD_PATH}
            className={`link-tag ${
              location.pathname === DASHBOARD_PATH ? "active" : ""
            }`}
            onClick={handleLinkClick}
          >
            <i className="fa-sharp fa-solid fa-table-cells"></i> &nbsp;Dashboard
          </Link>
          <Link
            to={ROOM_PATH}
            className={`link-tag ${
              location.pathname === ROOM_PATH ? "active" : ""
            }`}
            onClick={handleLinkClick}
          >
            <i className="fa-solid fa-house"></i> &nbsp;Created Room
          </Link>
          <Link
            to={QUIZ_PATH}
            className={`link-tag ${
              location.pathname === QUIZ_PATH ? "active" : ""
            }`}
            onClick={handleLinkClick}
          >
            <i className="fas fa-question-circle"></i> &nbsp;Quiz Practice 
          </Link>
          <Link
            to={POST_QUESTION_PATH}
            className={`link-tag ${
              location.pathname === POST_QUESTION_PATH ? "active" : ""
            }`}
            onClick={handleLinkClick}
          >
           <i class="fas fa-book"></i> &nbsp;Notes
          </Link>
          
          <Link
            to={CONTACT_PATH}
            className={`link-tag ${
              location.pathname === CONTACT_PATH ? "active" : ""
            }`}
            onClick={handleLinkClick}
          >
            <i className="fa-solid fa-user"></i> &nbsp;Contact
          </Link>
          <Link
            to={FEEDBACK_PATH}
            className={`link-tag ${
              location.pathname === FEEDBACK_PATH ? "active" : ""
            }`}
            onClick={handleLinkClick}
          >
            <i className="fa-solid fa-envelope"></i> &nbsp;Feedback
          </Link>
          {/* {user?.email === "sandy80772@gmail.com" && (
            <Link
              to={ADMINISTRATOR_PATH}
              className={`link-tag ${
                location.pathname === ADMINISTRATOR_PATH ? "active" : ""
              }`}
              onClick={handleLinkClick}
            >
              <i class="fas fa-user-shield admin-icon"></i> &nbsp;Administrator
            </Link>
          )} */}
          <button
            className="close-btn"
            onClick={closeSidebar}
            title="Close Sidebar"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;
