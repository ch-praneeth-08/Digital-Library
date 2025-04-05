import React from 'react';
import './Homepage.css';

function Homepage() {
  return (
    <div className="homepage-wrapper">
      {/* Background banner */}
      <div className="homepage-hero">
        <div className="overlay">
          <h1 className="hero-title">Explore a World of Knowledge</h1>
          <p className="hero-subtitle">
            Access thousands of academic resources, books, and research papers — all in one place.
          </p>
          <button className="hero-button">Get Started</button>
        </div>
      </div>

      {/* Decorative Section */}
      <section className="image-showcase">
        <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac" alt="Reading" />
        <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b" alt="Digital Library" />
        <img src="https://images.unsplash.com/photo-1550399105-c4db5fb85c18" alt="Books & Study" />
      </section>
    </div>
  );
}

export default Homepage;
