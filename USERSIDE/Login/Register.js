import React, { useState } from 'react';
import './Login.css';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { collection, addDoc, getFirestore } from 'firebase/firestore';
import firebaseApp from '../Firebase';

const Register = () => {
    const [username, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const onSubmitBtn = async (e) => {
        e.preventDefault();
        if (!username || !email || !password) {
            alert('All fields are required');
            return;
        }
        if (password.length < 6) {
            alert('Please enter a 6-digit password.');
            return;
        }

        const auth = getAuth(firebaseApp);
        const firestore = getFirestore(firebaseApp);

        try {
            // Attempt to create a new user with Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Store user data in Firestore
            await addDoc(collection(firestore, 'users'), {
                uid: user.uid,
                username: username,
                email: email,
            });

            alert('Sign Up Successful!');
            setUserName('');
            setEmail('');
            setPassword('');
            navigate('/');
        } catch (error) {
            // Check for specific Firebase Authentication errors
            if (error.code === 'auth/email-already-in-use') {
                alert('Email is already registered. Please use a different email.');
            } else {
                console.error('Error registering new user:', error);
                alert('Registration failed. Please try again.');
            }
        }
    }

    return (
        <div>
            <div className='register'>
                <form onSubmit={onSubmitBtn}>
                    <h3>Sign Up</h3>
                    <div className='field1'>
                        <label htmlFor='username1'>Name</label>
                        <input
                            type='text'
                            name='username'
                            placeholder='Enter Your Username'
                            id='username1'
                            value={username}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                        />
                    </div>
                    <div className='field1'>
                        <label htmlFor='email'>Email ID</label>
                        <input
                            type='email'
                            name='email'
                            placeholder='Enter Your Email'
                            id='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className='field1'>
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
                    <div className='submitBtn'>
                        <button type='submit' className='btn'>Submit</button>
                    </div>
                    <div className='signBtn1'>
                        <span>
                            I have an account? <Link className='button-small' to={'/Login/Login'}>Login</Link>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;
