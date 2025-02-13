import { Link,useNavigate } from "react-router-dom";
import Styles from "./Navbar.module.css";
import UserPop from "./UserPop";
import { MdMenu } from "react-icons/md";
import { FaCircleUser } from "react-icons/fa6";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import firebaseApp from "../Firebase";
import { useEffect, useState } from "react";
import SidebarPop from "./SideBarPop"

const Navbar = () =>{
    const [user, setUser] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);

    const togglePopup = () => {
        setShowPopup((prev) => !prev);
    };  
    useEffect(() =>{
        const auth = getAuth(firebaseApp);
        const fetchUser = onAuthStateChanged(auth, async(user) =>{
            if(user){
                setUser(user);
            }
            else{
                setUser(null);
            }
        });
        return () =>fetchUser();
    },[]);

   

 return(
    <div className={Styles.Navbar}>
        <div className={Styles.NavbarItems}>
           <div className={Styles.LeftNav}>
            <span className={Styles.LogoText}>Quiz<span>Quest</span></span>
           </div>
           <div className={Styles.RightNav}>
            {user ?<FaCircleUser onClick={togglePopup} 
                className={Styles.UserIcon}  />:<Link to="/Login" className={Styles.Link1}>Login</Link>}
             <MdMenu className={Styles.MenuIcon} onClick={() => setShowSidebar(true)}/>
            </div>
        </div>
            {showPopup && <UserPop setUser={setUser} setShowPopup={setShowPopup}/>}
            {showSidebar && <SidebarPop onClose={() => setShowSidebar(false)} />}

    </div>
 );
};
export default Navbar;