import React from 'react';
import { Link } from 'react-router-dom';
import './styles/App.css';

function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="rows">
          <div className="col-md-4">
            <h4>Date de contact</h4>
            <ul>
              <li><i className="fas fa-map-marker-alt"></i> Adresa: Seini, Maramureș, România</li>
              <li><i className="fas fa-phone"></i> Telefon: 0749******</li>
              <li><i className="fas fa-envelope"></i> Email: worktimemanager@gmail.com</li>
            </ul>
          </div>

          <div className="col-md-4">
            <h4>Urmărește-ne și pe site-urile de socializare</h4>
            <ul className="social-icons">
              <li><a target="_blank"><i className="fab fa-facebook"></i></a></li>
              <li><a target="_blank"><i className="fab fa-twitter"></i></a></li>
              <li><a target="_blank"><i className="fab fa-linkedin"></i></a></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h4>Link-uri Utile</h4>
            <ul>
              <li><Link to="/despre">Despre Noi</Link></li>
              <li><Link to="/login">Log In</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
        </div>
        <br />
        <div className="row">
          <div className="col-md-12">
            <a>&copy; 2023 WorkTimeManager Toate drepturile rezervate.</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
