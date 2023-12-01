import React, { useState } from 'react';
import '../../styles/App.css';
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

    <div className="contact-page">

      <div className="contact-page">

        <div className="working-hours">
          <h2>Orar de Lucru</h2>
          <p>Luni - Vineri: 9:00 - 17:00</p>
          <p>Sâmbătă - Duminică: Închis</p>
        </div>

        <div style={{ display: 'grid', placeItems: 'center' }}>
          <h1 align='center'>Scrie-ne un mesaj:</h1>
          <div className="image-container">
            <img src={imagine4} alt="Imagine4" className="imagine4" />
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
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

        <div className="contact-details">
          <h2>Date de contact</h2>
          <p>
            <i className="fas fa-map-marker-alt"></i> Adresa: Seini, Maramureș, România
          </p>
          <p>
            <i className="fas fa-phone"></i> Telefon: 0749 ** ** **
          </p>
          <p>
            <i className="fas fa-envelope"></i> Email:  worktimemanager@gmail.com
          </p>
        </div>

      </div>
    </div>
  );
}

export default Contact;
