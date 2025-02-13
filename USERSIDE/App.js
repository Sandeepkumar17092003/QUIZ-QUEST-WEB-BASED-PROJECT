import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home/Home";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import Login from "./Login/Login";
import Register from "./Login/Register";
import ForgotPassword from "./Login/ForgotPassword";
import Dashboard from "./Dashboard/Dashboard";
// import Adminstrator from "./Adminstrator/Adminstrator";
import Quiz from "./Quiz/Quiz";
import PlaylistQuizPage from "./playlistQuizPage/PlaylistQuizPage"; // Fixed capitalization
import Contact from "./Contact/Contact";
import Room from"./Room/Room";
import UploadNotes from "./UploadNotes/UploadNotes";
import Notes from "./Notes/Notes";
import Feedback from "./Feedback/Feedback";
import FeedbackDisplay from "./FeedbackDisplay/FeedbackDisplay";
import DisplayRoom from "./DisplayRoom/DisplayRoom";
import About from "./About/About";
import Privacy from "./Privacy/Privacy";
import Leaderboard from "./Leaderboard/Leaderboard";


function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login/Login" element={<Login />} />
        <Route path="/Login/Register" element={<Register />} />
        <Route path="/Login/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/Dashboard/Dashboard" element={<Dashboard />} />
        {/* <Route path="/Adminstrator/Adminstrator" element={<Adminstrator />} /> */}
        <Route path="/Quiz/Quiz" element={<Quiz />} />
        <Route path="/playlistQuizPage" element={<PlaylistQuizPage />} /> 
        <Route path="/Contact/Contact" element={<Contact/>}/>
        <Route path="/Room/Room" element={<Room/>}/>
        <Route path="/UploadNotes/UploadNotes" element={<UploadNotes/>}/>
        <Route path="/Notes/Notes" element={<Notes/>}/>
        <Route path="/Feedback/Feedback" element={<Feedback/>}/>
        <Route path="/FeedbackDisplay/FeedbackDisplay" element={<FeedbackDisplay/>}/>
        <Route path="/DisplayRoom/DisplayRoom" element={<DisplayRoom/>}/>
        <Route path="/About/About" element={<About/>}/>
        <Route path="/Privacy/Privacy" element={<Privacy/>}/>
        <Route path="/Leaderboard/Leaderboard" element={<Leaderboard/>}/>

      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
