import React, { useState, useEffect, useCallback, useRef } from "react";
import { db, storage } from "../Firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore"; // Import doc for deleting notes
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import "./UploadNotes.css"; // Import the CSS file for styling
import { useNavigate } from "react-router-dom"; // Change here

const UploadNotes = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [uploadedNotes, setUploadedNotes] = useState([]);
  const [deletePassword, setDeletePassword] = useState(""); // State for delete password
  const [noteToDelete, setNoteToDelete] = useState(null); // State to hold note to delete
  const [showConfirmDelete, setShowConfirmDelete] = useState(false); // State to control the confirmation modal
  const navigate = useNavigate(); // Change here
  const fileInputRef = useRef(null); // Create a ref for the file input
  const notesCollection = collection(db, "UploadNotes");

  const fetchNotes = useCallback(async () => {
    const data = await getDocs(notesCollection);
    const notes = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setUploadedNotes(notes);
  }, [notesCollection]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (file) {
      const fileRef = ref(storage, `uploads/${file.name}`);
      await uploadBytes(fileRef, file);
      const fileURL = await getDownloadURL(fileRef);

      await addDoc(notesCollection, {
        name,
        email,
        password,
        description,
        fileURL,
      });

      // Clear form fields after submission
      setName("");
      setEmail("");
      setPassword("");
      setDescription("");
      setFile(null);

      // Reset the file input using the ref
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset the file input
      }

      // Refresh the notes list
      alert("Your file has been uploaded"); // Change alert text
      fetchNotes();
      navigate("/Adminstrator/Adminstrator");
    }
  };

  // Function to extract the actual file name from the URL
  const extractFileName = (url) => {
    const decodedURL = decodeURIComponent(url);
    const parts = decodedURL.split("/");
    const fileWithParams = parts[parts.length - 1];
    return fileWithParams.split("?")[0];
  };

  const handleDeleteNote = (note) => {
    setNoteToDelete(note);
    setShowConfirmDelete(true); // Show confirmation modal
  };

  const confirmDeleteNote = async () => {
    if (deletePassword === noteToDelete.password) {
      // Check if the entered password matches
      // Delete from Firestore
      await deleteDoc(doc(db, "UploadNotes", noteToDelete.id));
      // Delete from Storage
      const fileRef = ref(
        storage,
        `uploads/${extractFileName(noteToDelete.fileURL)}`
      );
      await deleteObject(fileRef);

      // Reset the delete password and close the modal
      setDeletePassword("");
      setShowConfirmDelete(false);
      setNoteToDelete(null);

      // Refresh the notes list
      alert("Your file has been uploaded"); // Change alert text
      fetchNotes();
      navigate("/Adminstrator/Adminstrator");
    } else {
      alert("Incorrect password. Please try again."); // Alert for incorrect password
    }
  };

  // Toggle is open and close
  const [isOpen, setIsOpen] = useState(false);

  const toggleDiv = () => {
    setIsOpen((prevState) => !prevState);
  };

  // End here

  return (
    <div className="upload-notes-container">
      <div className="form-section">
        <h4>Upload Notes</h4>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                placeholder="File Owner"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="desc-button">
            <div className="form-group">
              <textarea
                className="form-control"
                placeholder="Description of file"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="form-group">
              <input
                type="file"
                className="form-control-file"
                onChange={(e) => {
                  setFile(e.target.files[0]);
                }}
                ref={fileInputRef}
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-btn">
            Submit
          </button>
        </form>
      </div>

      <div className="uploaded-notes-section">
        <div className="head-1">
          <h4>Uploaded Notes</h4>
          <button onClick={toggleDiv}>{isOpen ? "Hide" : "Show"}</button>
        </div>

        {isOpen && (
          <div className="table-responsive">
            <table className="notes-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>File</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {uploadedNotes.map((note) => (
                  <tr key={note.id}>
                    <td>{note.name}</td>
                    <td>{extractFileName(note.fileURL)}</td>
                    <td>{note.description}</td>
                    <td>
                      <button className="download-btn1">
                        <a
                          href={note.fileURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="download_btn"
                        >
                          Download
                        </a>
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note)}
                        className="delete-btn1"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation modal for deleting a note */}
      {showConfirmDelete && (
        <div className="modal">
          <div className="modal-content">
            <h5>Confirm Delete</h5>
            <p>Enter the password to confirm deletion:</p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              required
            />
            <button onClick={confirmDeleteNote} className="confirm-btn">
              Confirm
            </button>
            <button
              onClick={() => setShowConfirmDelete(false)}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadNotes;
