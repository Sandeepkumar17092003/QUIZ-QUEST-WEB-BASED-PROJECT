import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import firebaseApp from '../Firebase';
import Styles from './ForgetPass.module.css'; // Import the CSS module

const ForgotPassword = () => {
    const [email, setEmail] = useState(''); // New state for email

    const handlePasswordReset = async (e) => {
        e.preventDefault(); // Prevent the form from reloading
        if (!email) {
            alert('Please enter your email address.');
            return;
        }
        const auth = getAuth(firebaseApp);
        try {
            await sendPasswordResetEmail(auth, email);
            alert('Password reset email sent! Check your inbox.');
        } catch (error) {
            console.error('Error sending password reset email:', error);
            alert('Error sending password reset email. Please try again.');
        }
    };

    return (
        <div className={Styles.container}>
            <form onSubmit={handlePasswordReset} className={Styles.form}>
                <h3 className={Styles.heading}>Forgot Your Password?</h3>
                <div className={Styles.field}>
                    <label htmlFor="email" className={Styles.label}>Your Email</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter Your Email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={Styles.input}
                    />
                </div>
                <div className={Styles.submitBtn}>
                    <button type="submit" className={Styles.btn}>Submit</button>
                </div>
                <div className={Styles.signBtn}>
                    <span>
                        Remember your password?{' '}
                        <Link className={Styles.link} to="/Login">Login</Link>
                    </span>
                </div>
            </form>
        </div>
    );
};

export default ForgotPassword;
