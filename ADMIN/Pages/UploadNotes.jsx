import React, { useState, useEffect, useCallback, useRef } from "react";
import { db, storage } from "../Firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import styles from "./UploadNotes.module.css"; // Import module CSS
import { useNavigate } from "react-router-dom";

const UploadNotes = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [uploadedNotes, setUploadedNotes] = useState([]);
  const [deletePassword, setDeletePassword] = useState("");
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
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

      setName("");
      setEmail("");
      setPassword("");
      setDescription("");
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      alert("Your file has been uploaded");
      fetchNotes();
    }
  };

  const extractFileName = (url) => {
    const decodedURL = decodeURIComponent(url);
    const parts = decodedURL.split("/");
    const fileWithParams = parts[parts.length - 1];
    return fileWithParams.split("?")[0];
  };

  const handleDeleteNote = (note) => {
    setNoteToDelete(note);
    setShowConfirmDelete(true);
  };

  const confirmDeleteNote = async () => {
    if (deletePassword === noteToDelete.password) {
      await deleteDoc(doc(db, "UploadNotes", noteToDelete.id));
      const fileRef = ref(
        storage,
        `uploads/${extractFileName(noteToDelete.fileURL)}`
      );
      await deleteObject(fileRef);

      setDeletePassword("");
      setShowConfirmDelete(false);
      setNoteToDelete(null);

      alert("Your file has been deleted");
      fetchNotes();
    } else {
      alert("Incorrect password. Please try again.");
    }
  };

  const [isOpen, setIsOpen] = useState(false);

  const toggleDiv = () => {
    setIsOpen((prevState) => !prevState);
  };

  return (
    <>
      <div className={styles.uploadNotesContainer}>
        <div className={styles.formSection}>
          <h4 className={styles.formTitle}>Upload Notes</h4>
          <form onSubmit={handleSubmit} className={styles.formDesign}>
            <div className={styles.formGroup}>
              <input
                type="text"
                className={styles.formControl}
                placeholder="File Owner"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="email"
                className={styles.formControl}
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="password"
                className={styles.formControl}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className={styles.descButton}>
              <div className={styles.formGroup}>
                <textarea
                  className={styles.formControl}
                  placeholder="Description of file"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className={styles.formGroup}>
                <input
                  type="file"
                  className={styles.formControlFile}
                  onChange={(e) => {
                    setFile(e.target.files[0]);
                  }}
                  ref={fileInputRef}
                  required
                />
              </div>
            </div>

            <button type="submit" className={styles.submitBtn}>
              Submit
            </button>
          </form>
        </div>
      </div>

      <div className={styles.uploadedNotesSection}>
        <div className={styles.head1}>
          <h4>Uploaded Notes</h4>
          <span className={styles.HideAndShow} onClick={toggleDiv}>{isOpen ? "Hide" : "Show"}</span>
        </div>

        {isOpen && (
          <div className={styles.tableResponsive}>
            <table className={styles.notesTable}>
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
                      <button className={styles.downloadBtn1}>
                        <a
                          href={note.fileURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.downloadBtn}
                        >
                          Download
                        </a>
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note)}
                        className={styles.deleteBtn1}
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

      {showConfirmDelete && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h5>Confirm Delete</h5>
            <p>Enter the password to confirm deletion:</p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              required
            />
            <button onClick={confirmDeleteNote} className={styles.confirmBtn}>
              Confirm
            </button>
            <button
              onClick={() => setShowConfirmDelete(false)}
              className={styles.cancelBtn}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UploadNotes;
