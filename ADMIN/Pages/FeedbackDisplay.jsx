import React, { useEffect, useState, useRef } from 'react';
import { db } from '../Firebase'; // Ensure the path is correct
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import styles from './FeedbackDisplay.module.css'; // Importing module CSS
import { BsThreeDotsVertical } from 'react-icons/bs';

export default function FeedbackDisplay() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = (id) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  const deleteFeedback = async (id) => {
    try {
      await deleteDoc(doc(db, 'feedback', id));
      setFeedbackList(feedbackList.filter(feedback => feedback.id !== id));
      setActiveMenu(null);
      alert('Feedback Successfully Deleted');
    } catch (error) {
      console.error('Error deleting feedback: ', error);
    }
  };

  return (
    <div className={styles.feedbackDisplayContainer}>
      {loading ? (
        <p>Loading feedback...</p>
      ) : feedbackList.length === 0 ? (
        <p>No feedback available.</p>
      ) : (
        <ul className={styles.feedbackList}>
          {feedbackList.map((feedback) => (
            <li key={feedback.id} className={styles.feedbackItem}>
              <div className={styles.displayFeedbackInput}>
                <div className={styles.feedbackHeader}>
                  <strong className={styles.feedbackUserStrong}>
                    User: {feedback.username}
                  </strong>
                  <div
                    className={styles.menuWrapper}
                    ref={menuRef}
                  >
                    <span
                      onClick={() => toggleMenu(feedback.id)}
                      className={styles.menuButton}
                    >
                      <BsThreeDotsVertical />
                    </span>
                    {activeMenu === feedback.id && (
                      <div className={styles.deleteOption}>
                        <span
                          onClick={() => deleteFeedback(feedback.id)}
                          className={styles.deleteButton}
                        >
                          Delete
                        </span>
                      </div>
                    )}
                  </div>
                </div>
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
