const AboutView = () => {
  return (
    <div className="about-content" style={{ maxWidth: '800px', margin: 'auto', textAlign: 'left' }}>
      <h2>Technical Documentation</h2>
      <p>This tool is designed for precision HRV logging using the Polar H10.</p>
      
      <h3>Data Processing</h3>
      <ul>
        <li><strong>Artifact Rejection:</strong> Uses a delta-based threshold (default 20%) to filter ectopic beats.</li>
        <li><strong>Formula:</strong> RMSSD is calculated using the square root of the mean of the sum of squares of differences between adjacent RR intervals.</li>
      </ul>

      <h3>Support & Feedback</h3>
      <p>Found a bug? Have a feature request for your lab? Reach out:</p>
      <ul>
        <li>📧 Email: <a href="mailto:your-email@example.com">your-email@example.com</a></li>
        <li>💻 GitHub: <a href="https://github.com/williamma621/HRV-Research-Software" target="_blank">View Repository</a></li>
      </ul>

      <hr />
      <h3>Community Discussion</h3>
      {/* This is where the Giscus script will load */}
      <div className="giscus-container">
        <p>Leave a comment or question below (GitHub account required):</p>
        <div id="giscus-slot"></div>
      </div>
    </div>
  );
};

export default AboutView