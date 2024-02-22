import React, { useState, useEffect } from 'react';
import imagine from '../../photos/imagine-profil.jpg';

const ProfilAngajat = ({ profil, setProfil }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedProfil, setEditedProfil] = useState({ ...profil });

  
  useEffect(() => {
    setEditedProfil({ ...profil });
  }, [profil]);

  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (editMode && profil) {
      setProfil(editedProfil);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProfil((prevProfil) => ({
      ...prevProfil,
      [name]: value,
    }));
  };

  if (!profil) {
    return <div>Încărcarea profilului...</div>;
  }

  return (
    <div className="user-profile">
      <img src={editedProfil.imagine || imagine} alt="Profil" className="imagine" />
      {!editMode ? (
        <div className="user-details">
          <h2>{editedProfil.nume || 'N/A'}</h2>
          <p>Email: {profil.email}</p>
          <p>Departament: {profil.departament}</p>
          <p>Post: {profil.post}</p>
          <p>Data angajării: {profil.data_angajarii}</p>
          <button onClick={handleEditToggle}>Editează profilul</button>
        </div>
      ) : (
        <div className="edit-user-details">
          <input
            type="text"
            name="nume"
            value={editedProfil.nume}
            onChange={handleChange}
          />
          <
            input
            type="text"
            name="post"
            value={editedProfil.post}
            onChange={handleChange}
          />
          <input
            type="text"
            name="departament"
            value={editedProfil.departament}
            onChange={handleChange}
          />
          <input
            type="text"
            name="data_angajarii"
            value={editedProfil.data_angajarii}
            onChange={handleChange}
          />
          <button onClick={() => {
            handleEditToggle();
            setProfil(editedProfil);
          }}>Salvează modificările</button>
          <button onClick={handleEditToggle}>Anulează</button>
        </div>
      )}
    </div>
  );
};

export default ProfilAngajat;