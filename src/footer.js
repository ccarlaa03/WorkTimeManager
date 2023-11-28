import React from 'react';
import './styles/App.css'; 

function Footer() {
    return (
      <footer>
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <h4>Contact</h4>
              <p>
                <i className="fas fa-map-marker-alt"></i> Adresa: Seini, Maramureș, România<br />
                <i className="fas fa-phone"></i> Telefon: 0749******<br />
                <i className="fas fa-envelope"></i> Email: worktimemanager@gmail.com
              </p>
            </div>
            <div className="col-md-4">
              <h4>Follow</h4>
              <ul className="social-icons">
                <li><a href="#" target="_blank"><i className="fab fa-facebook"></i></a></li>
                <li><a href="#" target="_blank"><i className="fab fa-twitter"></i></a></li>
                <li><a href="#" target="_blank"><i className="fab fa-linkedin"></i></a></li>
              </ul>
            </div>
            <div className="col-md-4">
              <h4>Link-uri Utile</h4>
              <ul>
                <li><a href="#">Acasă</a></li>
                <li><a href="#">Despre Noi</a></li>
                <li><a href="#">Servicii</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <p>&copy; 2023 WorkTimeManager Toate drepturile rezervate.</p>
            </div>
          </div>
        </div>
      </footer>
    );
  }
  
  export default Footer;