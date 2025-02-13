import React from 'react'
import { NavLink } from 'react-router-dom'
import pop from './SidebarPop.module.css'
import { RxDashboard } from "react-icons/rx";
import { FaNotesMedical } from "react-icons/fa6";
import { AiFillQuestionCircle } from "react-icons/ai";
import { VscFeedback } from "react-icons/vsc";
import { GiTeacher } from "react-icons/gi";
// import sidebarStyle from "./Sidebar.module.css";


function Sidebar({ onClose }) {
    const getActiveClass = ({ isActive }) => isActive ? `${pop.Link} ${pop.Active}` : pop.Link;
  return (
    <div className={pop.sidebar}>
      <button className={pop.closeBtn} onClick={onClose}>×</button>
      <div className={pop.NavbarItems}>
        <div className={pop.NavbarText}>  
          <NavLink to="/" className={getActiveClass}>
            <RxDashboard className={pop.Icon} /> 
            Dashboard
          </NavLink>
        </div>
        <div className={pop.NavbarText}>
          <NavLink to="/createQuiz" className={getActiveClass}>
            <AiFillQuestionCircle className={pop.Icon} />  
            Create Quiz
          </NavLink>
        </div>

        <div className={pop.NavbarText}>
          <NavLink to="/createRoom" className={getActiveClass}>
            <GiTeacher  className={pop.Icon} />  
            Create Room
          </NavLink>
        </div>

        <div className={pop.NavbarText}>
          <NavLink to="/addNotes" className={getActiveClass}>
            <FaNotesMedical className={pop.Icon} />
            Add Notes
          </NavLink>
        </div>
        <div className={pop.NavbarText}>
          <NavLink to="/Feedback" className={getActiveClass}>
            <VscFeedback className={pop.Icon} />
            Feedback
          </NavLink>
        </div>
      </div>
    </div>
  )
}

export default Sidebar

