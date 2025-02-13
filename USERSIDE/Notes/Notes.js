import React, { useEffect, useState } from "react";
import { db } from "../Firebase";
import { collection, getDocs } from "firebase/firestore";
import "./Notes.css";
const Notes = () => {
  const [uploadedNotes, setUploadedNotes] = useState([]);

  const fetchNotes = async () => {
    try {
      const notesCollection = collection(db, "UploadNotes");
      const notesSnapshot = await getDocs(notesCollection);
      const notesList = notesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUploadedNotes(notesList);
    } catch (error) {
      alert("Error Fetching notes:", error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Function to extract the original file name from the URL
  const extractFileName = (url) => {
    const decodedURL = decodeURIComponent(url); // Decode the URL
    const parts = decodedURL.split('/'); // Split by '/'
    return parts[parts.length - 1].split('?')[0]; // Get the last part and remove URL parameters
  };

  return (
    <div className="contain-all-things">
      <div className="display_notes_here_all">
      <h4>Uploaded Notes</h4> {/* Title for the section */}
        <div className="contain">
        {uploadedNotes.length > 0 ? (
          uploadedNotes.map((note) => (
           
           <div key={note.id} className="note-card">
              <div className="file">
                <strong>Subject:</strong> {extractFileName(note.fileURL)}<br></br>
                <strong>Description:</strong> {note.description}

              </div>

              <div className="button-group">
                <a href={note.fileURL} target="_blank"  rel="noopener noreferrer" className="view-btn">
                  View
                </a>
                <a href={note.fileURL} download className="download-btn">
                  Download
                </a>
              </div>
            </div>

            
          ))
        ) : (
          <p>No notes uploaded yet.</p>
        )}


        </div>
      </div>
    </div>
  );
};

export default Notes;
