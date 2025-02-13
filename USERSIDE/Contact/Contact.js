
import "./contact.css"

import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('message', formData.message);
    data.append('access_key', 'f9a524cc-c91c-4799-a7d4-0c41267e4d09'); // Add your access key

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: data,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert('Message sent successfully!');
          setFormData({
            name: '',
            email: '',
            message: '',
          });
        //   window.location.href = 'index.html'; // Optional redirect
        } else {
          alert('Error sending message.');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Error sending message.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (

    <div className="containerAllNotesHere">
    <div className="container">
      <div className="content">
        <div className="left-side">
          <div className="address details">
            <i className="fas fa-map-marker-alt"></i>
            <div className="topic">Address</div>
            <div className="text-one">Flat No-7, Dhruvnagar</div>
            <div className="text-two">Nashik, Maharashtra</div>
          </div>
          <div className="phone details">
            <i className="fas fa-phone-alt"></i>
            <div className="topic">Phone</div>
            <div className="text-one">+917385386856</div>
          </div>
          <div className="email details">
            <i className="fas fa-envelope"></i>
            <div className="topic">Email</div>
            <div className="text-one">srai80772@gmail.com</div>
          </div>
        </div>
        <div className="right-side">
          <div className="topic-text">Get in touch</div>
          <p>
            If you have any work from me or any types of queries related to my
            tutorial, you can send me a message from here. It's my pleasure to
            help you.
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              className="input-box"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter name"
            />
            <input
              type="email"
              className="input-box"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter email"
            />
            <textarea
              className="input-box message-box"
              name="message"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              required
              placeholder="Enter message"
            ></textarea>
            <button type="submit" className="button" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Contact;

