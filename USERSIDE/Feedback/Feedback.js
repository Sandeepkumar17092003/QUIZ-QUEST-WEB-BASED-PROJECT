import React, { useState, useEffect } from 'react';
import { db } from '../Firebase'; // Make sure the path is correct
import { collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './Feedback.css';

export default function QuizFeedbackForm() {
  const [difficulty, setDifficulty] = useState(3);
  const [contentQuality, setContentQuality] = useState(0);
  const [userExperience, setUserExperience] = useState('');
  const [improvements, setImprovements] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [user, setUser] = useState(null);
  
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, [auth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in first.");
      return;
    }; // Ensure the user is logged in

    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'feedback'), {
        uid: user.uid,
        username: user.displayName || user.email, // Adjust as needed
        difficulty,
        contentQuality,
        userExperience,
        improvements,
        email,
      });

      console.log('Feedback submitted:', {
        uid: user.uid,
        username: user.displayName || user.email,
        difficulty,
        contentQuality,
        userExperience,
        improvements,
        email,
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting feedback: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset the form state
    setDifficulty(3);
    setContentQuality(0);
    setUserExperience('');
    setImprovements('');
    setEmail('');
    setIsSubmitted(false); // Hide the thank-you message and go back to the form
  };

  if (isSubmitted) {
    return (
      <div className="feedback-form-container">
        <h2 className="thank-you-title">Thank You for Your Feedback!</h2>
        <p className="thank-you-message">
          We appreciate your input. It helps us improve our quizzes and overall user experience.
        </p>
        <button
          className="close-button"
          onClick={handleClose}
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="feedback-form-container">
      <h2 className="form-title">Feedback</h2>
      <form onSubmit={handleSubmit} className="feedback-form">
        {/* Existing form groups */}
        <div className="form-group">
          <label htmlFor="difficulty" className="form-label">
            Quiz Difficulty
          </label>
            <input type="range" className="form-range" id="difficulty"  min="1" max="5" step="1" value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))}/>
            <div className="range-labels">
                <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
            </div>
        </div>

        <div className="form-group">
          <label className="form-label">Content Quality</label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => setContentQuality(star)} className={`star ${contentQuality >= star ? 'active' : ''}`}>
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">How was your overall experience?</label>
          <div className="radio-group">
            {['positive', 'neutral', 'negative'].map((option) => (
              <label key={option} className="radio-label">
                <input
                  type="radio"
                  name="user-experience"
                  value={option}
                  checked={userExperience === option}
                  onChange={(e) => setUserExperience(e.target.value)}
                  className="form-radio"
                />
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="improvements" className="form-label">
            What can we improve?
          </label>
          <textarea
            id="improvements"
            rows={4}
            placeholder="Please share your suggestions..."
            value={improvements}
            onChange={(e) => setImprovements(e.target.value)}
            className="form-textarea"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email (optional)
          </label>
          <input
            type="email"
            id="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !userExperience}
          className={`form-button ${isSubmitting || !userExperience ? 'disabled' : ''}`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}
