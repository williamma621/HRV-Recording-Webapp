import React from 'react';
import './GettingStarted.css'; // Reusing your existing CSS for consistency

const Resources = () => {
  return (
    <div className="docs-container fade-in">
      <div className="resource-grid">
        {/* GitHub Card */}
        <div className="info-box">
          <div className="resource-icon">🛠️</div>
          <h3>Open Source</h3>
          <p>
            This project is open-source. You can view the code, report bugs, 
            or contribute to the development on GitHub.
          </p>
          <a 
            href="https://github.com/williamma621/HRV-Recording-Webapp" 
            target="_blank" 
            rel="noopener noreferrer"
            className="highlight-btn"
            style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}
          >
            View on GitHub
          </a>
        </div>

        {/* Contact Card */}
        <div className="info-box">
          <div className="resource-icon">📧</div>
          <h3>Contact & Feedback</h3>
          <p>
            Have questions about the HRV calculations or found a bug? 
            Feel free to reach out via email.
          </p>
          <a 
            href="mailto:williamma621@gmail.com" 
            className="highlight-btn"
            style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}
          >
            Send an Email
          </a>
        </div>
      </div>

      <section className="docs-content">
        <h2>HRV Reference Material</h2>
        <p>
          If you are new to Heart Rate Variability, we recommend the following 
          standardized resources to better understand your data:
        </p>
        <ul className="step-list">
          <li>
            <strong>Altini, M. (HRV4Training):</strong> Excellent deep dives into RMSSD and recovery.
          </li>
          <li>
            <strong>Kubios HRV:</strong> The gold standard for scientific HRV analysis software.
          </li>
          <li>
            <strong>Task Force Report (1996):</strong> The original clinical standards for heart rate variability measurements.
          </li>
        </ul>

        <div className="warning" style={{ marginTop: '40px', padding: '15px', border: '1px solid #ff453a', borderRadius: '8px' }}>
          <strong>Disclaimer:</strong> This tool is for research and educational purposes only. 
          It is not a medical device and should not be used to diagnose or treat any heart condition.
        </div>
      </section>
    </div>
  );
};

export default Resources;