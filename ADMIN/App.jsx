// App.jsx
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import AppStyles from "./App.module.css";
import Sidebar from "./Components/Sidebar";
import Dashboard from "./Pages/Dashboard";
import Navbar from "./Components/Navbar";
import Login from "./Pages/Login";
import Register from "./Pages/Register"
import ForgetPass from "./Pages/ForgetPass";
import Feedback from "./Pages/FeedbackDisplay";
import UploadNotes from "./Pages/UploadNotes";
import CreateRoom from "./Pages/CreateRoom";
import CreateQuiz from "./Pages/CreateQuiz";
const App = () => {
  return (
    <Router>
      <div className={AppStyles.MainContainer}>
        <div className={AppStyles.LeftDiv}>
          <Sidebar />
        </div>
        <div className={AppStyles.RightDiv}>
          <div className={AppStyles.RightDiv1}><Navbar /></div>
          <div className={AppStyles.RightDiv2}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/Login" element={<Login />} />
              <Route path="/Register" element={<Register />} />
              <Route path="/ForgetPass" element={<ForgetPass />} />
              <Route path="/Feedback" element={<Feedback />} />
              <Route path="/addNotes" element={<UploadNotes />} />
              <Route path="/createRoom" element={<CreateRoom />} />
              <Route path="/createQuiz" element={<CreateQuiz />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
