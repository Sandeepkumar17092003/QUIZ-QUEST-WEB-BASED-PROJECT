import React, { useState } from 'react'
import { Link } from 'react-router-dom';
// import Header from '../Header/Header';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import firebaseApp from '../Firebase';
const ForgotPassword = () => {
    const [email, setEmail] = useState(''); // New state for email
    const handlePasswordReset = async () => {
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
    }
  return (
    <>
            {/* <Header /> */}
            <div className='Login' style={{marginTop:'2rem'}}>
                <form onSubmit={handlePasswordReset} style={{height:"16rem"}}>
                    <h3 style={{fontSize:'1rem',padding:".2rem .5rem"}}>Forgot Your Password</h3>
                    <div className='field'>
                        <label htmlFor='username'>Your Email</label>
                        <input
                            type='email'
                            name='username'
                            placeholder='Enter Your Email'
                            id='username'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className='submitBtn'>
                        <button type='submit' className='btn'>Submit</button>
                    </div>
                    <div className='signBtn'>
                        <span>
                            I remember my password ? <Link className='button-small' to={'/Login/Login'}>Login</Link>
                        </span>
                    </div>
                </form>
            </div>
        </>
  )
}

export default ForgotPassword
