import React, { useState } from 'react';
import imagine4 from '../../photos/img4.jpg';


function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Formular trimis:', formData);
  };
  return (
    <div>
    <div className="contact-page">
      <img src={imagine4} alt="Imagine4" className="imagine4" />
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <h1>Scrie-ne un mesaj:</h1>
          <label htmlFor="name">Nume:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">Mesaj:</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            required
          />
        </div>

        <button type="submit">Trimite</button>
      </form>
    </div>
    </div>
  );
}

export default Contact;
