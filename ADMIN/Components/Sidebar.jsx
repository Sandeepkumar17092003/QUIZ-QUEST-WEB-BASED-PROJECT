import sidebarStyle from "./Sidebar.module.css";
import { RxDashboard } from "react-icons/rx";
import { FaNotesMedical } from "react-icons/fa6";
import { AiFillQuestionCircle } from "react-icons/ai";
import { VscFeedback } from "react-icons/vsc";
import { GiTeacher } from "react-icons/gi";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  // Common function for active link class handling
  const getActiveClass = ({ isActive }) => isActive ? `${sidebarStyle.Link} ${sidebarStyle.Active}` : sidebarStyle.Link;

  return (
    <div className={sidebarStyle.Sidebar}>
      <div className={sidebarStyle.Logo}>
        <p>ADMIN</p>
      </div>
      <div className={sidebarStyle.NavbarItems}>
        <div className={sidebarStyle.NavbarText}>  
          <NavLink to="/" className={getActiveClass}>
            <RxDashboard className={sidebarStyle.Icon} /> 
            Dashboard
          </NavLink>
        </div>
        <div className={sidebarStyle.NavbarText}>
          <NavLink to="/createQuiz" className={getActiveClass}>
            <AiFillQuestionCircle className={sidebarStyle.Icon} />  
            Create Quiz
          </NavLink>
        </div>

        <div className={sidebarStyle.NavbarText}>
          <NavLink to="/createRoom" className={getActiveClass}>
            <GiTeacher  className={sidebarStyle.Icon} />  
            Create Room
          </NavLink>
        </div>

        <div className={sidebarStyle.NavbarText}>
          <NavLink to="/addNotes" className={getActiveClass}>
            <FaNotesMedical className={sidebarStyle.Icon} />
            Add Notes
          </NavLink>
        </div>
        <div className={sidebarStyle.NavbarText}>
          <NavLink to="/Feedback" className={getActiveClass}>
            <VscFeedback className={sidebarStyle.Icon} />
            User Feedback
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
