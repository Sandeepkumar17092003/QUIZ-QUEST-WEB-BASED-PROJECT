import React, { useEffect, useState } from 'react';
import { db } from '../Firebase'; // Ensure the path is correct
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import "./FeedbackDisplay.css";

export default function FeedbackDisplay() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      const feedbackCollection = collection(db, 'feedback');
      const feedbackSnapshot = await getDocs(feedbackCollection);
      const feedbackData = feedbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFeedbackList(feedbackData);
      setLoading(false);
    };

    fetchFeedback();
  }, []);

  const toggleMenu = (id) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  const deleteFeedback = async (id) => {
    try {
      await deleteDoc(doc(db, 'feedback', id));
      setFeedbackList(feedbackList.filter(feedback => feedback.id !== id));
      setActiveMenu(null);
      alert("Feedback Successfully Deleted");
    } catch (error) {
      console.error("Error deleting feedback: ", error);
    }
  };

  return (
    <div className="feedback-display-container">
      {loading ? (
        <p>Loading feedback...</p>
      ) : feedbackList.length === 0 ? (
        <p>No feedback available.</p>
      ) : (
        <ul className="feedback-list">
          {feedbackList.map((feedback) => (
            <li key={feedback.id} className="feedback-item">
              <div className='display-feedback-input'>
                <p className="feedback-user">
                  <strong>User:{feedback.username}</strong>
                  <button onClick={() => toggleMenu(feedback.id)} className="menu-button">
                    <i className="fa-solid fa-ellipsis-h"></i> {/* Three-dot icon */}
                  </button>
                  {activeMenu === feedback.id && (
                    <div className="delete-option">
                      <button onClick={() => deleteFeedback(feedback.id)} className="delete-button">
                        Delete
                      </button>
                    </div>
                  )}
                </p>
                <p><strong>Difficulty:</strong> {feedback.difficulty}</p>
                <p><strong>Content Quality:</strong> {feedback.contentQuality}</p>
                <p><strong>Experience:</strong> {feedback.userExperience}</p>
                <p><strong>Improvements:</strong> {feedback.improvements}</p>
                <p><strong>Email:</strong> {feedback.email || 'Not provided'}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

