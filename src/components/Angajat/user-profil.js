import React, { useState, useEffect } from 'react';
import imagine from '../../photos/imagine-profil.jpg';

const UserProfil = ({ userDetails, updateUserDetails }) => {
  const [editMode, setEditMode] = useState(false);
  // Inițializăm userDetails cu un obiect gol pentru a preveni erorile
  const [editedUserDetails, setEditedUserDetails] = useState({});

  useEffect(() => {
    // Setăm editedUserDetails doar atunci când userDetails este definit
    if (userDetails) {
      setEditedUserDetails(userDetails);
    }
  }, [userDetails]);

  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (editMode) {
      // Verificăm dacă userDetails este definit înainte de a salva modificările
      if (userDetails) {
        updateUserDetails(editedUserDetails);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Ne asigurăm că nu setăm starea pe un obiect undefined
    setEditedUserDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  // Randăm conținutul doar dacă userDetails este definit
  if (!userDetails) {
    return <div>Încărcarea profilului...</div>;
  }

  return (
    <div className="user-profile">
      <img src={editedUserDetails.profilePicture || imagine} alt="Profil" className="imagine" />
      {!editMode ? (
        <div className="user-details">
          <h2>{editedUserDetails.fullName || 'N/A'}</h2>
          <p>Email: {userDetails.email}</p>
          <p>Departament: {userDetails.department}</p>
          <p>Funcție: {userDetails.position}</p>
          <p>Data angajării: {userDetails.hireDate}</p>
          <button onClick={handleEditToggle}>Modifică profil</button>
        </div>
      ) : (
        <div className="edit-user-details">
          <input
            type="text"
            name="fullName"
            value={editedUserDetails.fullName}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            value={editedUserDetails.email}
            onChange={handleChange}
          />
          <input
            type="text"
            name="department"
            value={editedUserDetails.department}
            onChange={handleChange}
          />
          <input
            type="text"
            name="position"
            value={editedUserDetails.position}
            onChange={handleChange}
          />
          <input
            type="text"
            name="hireDate"
            value={editedUserDetails.hireDate}
            onChange={handleChange}
          />
          <button onClick={handleEditToggle}>Salvează modificările</button>
        </div>
      )}
    </div>
  );
};

export default UserProfil;
