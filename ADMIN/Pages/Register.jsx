import styles from "./Register.module.css";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { collection, addDoc, getFirestore } from "firebase/firestore";
import firebaseApp from "../Firebase";
import { useState } from "react";
import Loading from "../Components/Loading";
const Register = () => {
  const [loading, setLoading] = useState(false);
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const onSubmitBtn = async (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(async () => {
      const auth = getAuth(firebaseApp);
      const firestore = getFirestore(firebaseApp);

      try {
        // Attempt to create a new user with Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Store user data in Firestore
        await addDoc(collection(firestore, "users"), {
          uid: user.uid,
          username: username,
          email: email,
        });
        setUserName("");
        setEmail("");
        setPassword("");
        navigate("/");
        alert("Sign Up Successfully");
      } catch (error) {
        // Check for specific Firebase Authentication errors
        if (error.code === "auth/email-already-in-use") {
          alert("Email is already registered. Please use a different email.");
          setEmail("");
        } else {
          console.error("Error registering new user:", error);
          alert("Registration failed. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h2 className={styles.title}>Sign Up</h2>
        <form className={styles.form} onSubmit={onSubmitBtn}>
          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.label}>
              Name
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter Name"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Email"
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className={styles.input}
              required
            />
          </div>
          <button type="submit" className={styles.button}>
            Sign Up
          </button>
          <span className={styles.Text}>
            Login Here
            <Link to="/Login" className={styles.link}>
              Click Here
            </Link>
          </span>
        </form>
        {loading && (
          <div className={styles.LoadingOverlay}>
            <Loading />
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
