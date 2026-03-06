import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <main className="trend-home">
      <div className="trend-grid" />
      <div className="trend-blur" />

      <div className="trend-corner trend-top-right" />
      <div className="trend-corner trend-bottom-left" />

      <section className="trend-content">
        <div className="trend-mini-nav">
          <p className="trend-brand">ExamStream</p>
          <a
            href="#services"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            <p>Services</p>
          </a>
          <a
            href="#features"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            <p>Features</p>
          </a>
          <a href="#about" style={{ color: "inherit", textDecoration: "none" }}>
            <p>About us</p>
          </a>
        </div>

        <div className="trend-title">
          <p className="stair-1">Push Your Limits,</p>
          <p className="stair-2">Achieve</p>
          <p className="stair-3">Excellence</p>
        </div>

        <div className="trend-actions">
          <Link
            to="/login?role=instructor"
            className="trend-button trend-first"
          >
            Sign In as Instructor
          </Link>
          <Link to="/login?role=student" className="trend-button trend-second">
            Sign In as Student
          </Link>
          <Link to="/register" className="trend-button trend-third">
            Create Account
          </Link>
        </div>

        <div className="trend-caption">
          <h2>Build. Attempt. Evaluate.</h2>
          <p>
            Modern, secure, and timed online exams for students and instructors
            with cloud uploads and grading workflow.
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section" id="services">
        <div className="section-container">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle">
            Comprehensive exam management solutions for modern education
          </p>

          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">📝</div>
              <h3>Exam Creation</h3>
              <p>
                Create comprehensive exams with multiple question types, images,
                and PDF attachments
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">⏱️</div>
              <h3>Timed Assessments</h3>
              <p>
                Real-time countdown timers with automatic submission at deadline
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">☁️</div>
              <h3>Cloud Storage</h3>
              <p>
                Secure cloud storage for all exam materials and student
                submissions
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">✅</div>
              <h3>Smart Grading</h3>
              <p>Efficient grading system with feedback and score management</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="section-container">
          <h2 className="section-title">Key Features</h2>
          <p className="section-subtitle">
            Everything you need for seamless online examinations
          </p>

          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-number">01</div>
              <div className="feature-content">
                <h3>Multi-File Upload</h3>
                <p>Upload up to 10 files per question with drag-and-drop</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-number">02</div>
              <div className="feature-content">
                <h3>Real-Time Monitoring</h3>
                <p>Track exam status and submissions in real-time</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-number">03</div>
              <div className="feature-content">
                <h3>Automated Deadlines</h3>
                <p>Automatic upload restrictions after deadline passes</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-number">04</div>
              <div className="feature-content">
                <h3>Question Management</h3>
                <p>Dynamic question addition with configurable limits</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-number">05</div>
              <div className="feature-content">
                <h3>Role-Based Access</h3>
                <p>Separate dashboards for instructors and students</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-number">06</div>
              <div className="feature-content">
                <h3>Instant Notifications</h3>
                <p>Get notified when exams start or grades are published</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="about-section" id="about">
        <div className="section-container">
          <h2 className="section-title">About Us</h2>
          <p className="section-subtitle">
            Building the future of online education
          </p>

          <div className="about-content">
            <div className="about-text">
              <p>
                ExamStream is a modern, secure online examination platform
                designed to streamline the entire exam workflow for both
                instructors and students. Our mission is to make online
                assessments seamless, efficient, and accessible.
              </p>
              <p>
                With features like real-time monitoring, cloud storage, and
                automated grading, we're revolutionizing how educational
                institutions conduct exams in the digital age.
              </p>

              <div className="about-stats">
                <div className="stat-item">
                  <div className="stat-number">100%</div>
                  <div className="stat-label">Secure</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Available</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">∞</div>
                  <div className="stat-label">Scalable</div>
                </div>
              </div>
            </div>

            <div className="about-connect">
              <h3>Connect With Developer</h3>
              <p>Follow me on social media for updates and tech insights</p>

              <div className="social-links">
                <a
                  href="https://www.facebook.com/joyonto.biswas111111000000/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link facebook"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                </a>

                <a
                  href="https://www.linkedin.com/in/joyonta-biswas-a6525a1b2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link linkedin"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span>LinkedIn</span>
                </a>

                <a
                  href="https://www.instagram.com/joyonto_b"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link instagram"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                  </svg>
                  <span>Instagram</span>
                </a>

                <a
                  href="https://leetcode.com/u/joyonto_23/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link leetcode"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
                  </svg>
                  <span>LeetCode</span>
                </a>

                <a
                  href="https://github.com/joyonta23"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link github"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer
        style={{
          textAlign: "center",
          padding: "20px",
          color: "rgba(255,255,255,0.5)",
          fontSize: "14px",
        }}
      >
        © 2026 ExamStream. All rights reserved.
      </footer>
    </main>
  );
};

export default Home;
