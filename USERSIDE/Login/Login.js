import React, { useState } from 'react';
// import Header from '../Header/Header';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import firebaseApp from '../Firebase';
import './Login.css';

const Login = () => {
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const auth = getAuth(firebaseApp);

    const onSubmitLoginBtn = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            alert('All fields are required');
            return;
        }
        if (password.length < 6) {
          alert('Please enter a 6-digit password.');
          return;
        }

        try {
            await signInWithEmailAndPassword(auth, username, password);

            alert('Login Successful!');
            navigate('/');  // Redirect to home page
        } catch (error) {
            console.error('Error logging in:', error);
            alert('Login failed. Please try again.');
        }
    }

    return (
        <>
            {/* <Header /> */}
            <div className='Login'>
                <form onSubmit={onSubmitLoginBtn}>
                    <h3>Login</h3>
                    <div className='field'>
                        <label htmlFor='username'>Username</label>
                        <input
                            type='text'
                            name='username'
                            placeholder='Enter Your Username'
                            id='username'
                            value={username}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                        />
                    </div>
                    <div className='field'>
                        <label htmlFor='password'>Password</label>
                        <input
                            type='password'
                            name='password'
                            placeholder='Enter Your Password'
                            id='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className='forgotBtn'>
                        <Link to='/Login/ForgotPassword'>Forgot Password</Link>
                    </div>
                    <div className='submitBtn'>
                        <button type='submit' className='btn'>Submit</button>
                    </div>
                    <div className='signBtn'>
                        <span>
                            I don't have an account? <Link className='button-small' to={'/Login/Register'}>Sign Up</Link>
                        </span>
                    </div>
                </form>
            </div>
        </>
    );
};

export default Login;
