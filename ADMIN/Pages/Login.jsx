import styles from "./Login.module.css";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import firebaseApp from "../Firebase";
import { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const auth = getAuth(firebaseApp);

  const onSubmitLoginBtn = async(e) =>{
    e.preventDefault();
    setLoading(true);
    try{
      await signInWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
      navigate("/");
    }catch(error){
      alert("Invalid Credentials");
    }finally{
      setLoading(false);
    }
  };
  return (
    <div className={styles.container}>
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      )}
      <div className={styles.formContainer}>
        <h2 className={styles.title}>Sign In</h2>
        <form className={styles.form} onSubmit={onSubmitLoginBtn}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              placeholder="Enter Email"
              onChange={(e) => setEmail(e.target.value)}
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
              name='password'
              value={password}
              placeholder="Enter Password"
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Logging In..." : "Login"}
          </button>
          <span className={styles.Text}>
            Forget Password
            <Link to="/ForgetPass" className={styles.link}>
             Click Here
            </Link>
          </span>
          <span className={styles.Text}>
            Register Here
            <Link to="/Register" className={styles.link}>
              Click Here
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Login;
