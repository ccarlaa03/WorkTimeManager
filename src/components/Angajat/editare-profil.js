import React, { useState, useEffect } from 'react';

const EditareProfil = ({ profil, isOpen, onClose, onSave }) => {
  const [dateTemporare, setDateTemporare] = useState(profil);

  useEffect(() => {
    setDateTemporare(profil);
  }, [profil]);

  const handleChange = (e) => {
    setDateTemporare({ ...dateTemporare, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(dateTemporare);
  };

  if (!isOpen) return null;
  
    return (
        <div>
          <h2>Editare Profil</h2>
          <form onSubmit={handleSubmit}>
            <label>Nume:</label>
            <input
              type="text"
              name="nume"
              value={dateTemporare.nume}
              onChange={handleChange}
            />
            {/* Adaugă aici alte câmpuri necesare */}
            <label>Departament:</label>
            <input
              type="text"
              name="departament"
              value={dateTemporare.departament}
              onChange={handleChange}
            />
            <label>Domeniu de activitate:</label>
            <input
              type="text"
              name="post"
              value={dateTemporare.post}
              onChange={handleChange}
            />
            <button type="submit">Salvează Modificările</button>
            <button type="button" onClick={onClose}>Închide</button>
          </form>
        </div>
    );
  };
  
  export default EditareProfil;