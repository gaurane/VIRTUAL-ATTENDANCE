"use client";
import { useState, useEffect } from "react";
import { getSettings, markPresent } from "@/lib/db";
import "./student.css";

// Temporary Mock Data for names
// Later, this can be fetched from a Firestore 'students' collection
const MOCK_STUDENTS = [
  { id: "25CA5001", name: "Gaurang Rane" },
  { id: "25CA5002", name: "John Doe" },
  { id: "25CA5003", name: "Jane Smith" },
  { id: "25CA5004", name: "Alex Johnson" },
  { id: "25CA5005", name: "Samantha Williams" }
];

export default function StudentDashboard() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [status, setStatus] = useState("idle");
  const [googleForm, setGoogleForm] = useState("");


  // Filter students based on search
  
  useEffect(() => {
    getSettings().then(settings => {
      if(settings && settings.googleFormLink) setGoogleForm(settings.googleFormLink);
    });
  }, []);

  const filteredStudents = MOCK_STUDENTS.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    
    setStatus("loading");
    
    try {
      // 1. Get the current active session and secret code from Firebase
      const settings = await getSettings();
      if (!settings || !settings.activeSession) {
        alert("No active session is currently open for attendance.");
        setStatus("error");
        return;
      }

      const currentSession = settings.activeSession;
      const expectedCode = settings.codes ? settings.codes[currentSession] : null;

      // 2. Verify Secret Code
      if (expectedCode && secretCode.toUpperCase() !== expectedCode.toUpperCase()) {
        setStatus("error");
        return;
      }

      // 3. Mark Present in Firestore
      await markPresent(selectedStudent.id, currentSession);
      setStatus("success");
      
    } catch (error) {
      console.error(error);
      if (error.message === 'Already checked in for this session') {
        alert("You have already checked in for this session!");
        setStatus("idle");
      } else {
        alert("A database error occurred. Please try again.");
        setStatus("error");
      }
    }
  };

  return (
    <div className="student-layout">
      <div className="glass-container">
        <div className="brand-header">
          <span className="logo-icon">▲</span> Attendify
        </div>
        
        <div className="welcome-text">
          <h1>Participant Check-in</h1>
          <p>Find your name and enter the session code to mark your attendance.</p>
        </div>

        {status === "success" ? (
          <div className="success-state">
            <div className="checkmark">✓</div>
            <h2>You're Checked In!</h2>
            <p>Your attendance has been securely recorded. You may now close this page.</p>
            <button className="btn btn-secondary mt-4" onClick={() => { setStatus("idle"); setSelectedStudent(null); setSecretCode(""); }}>
              Check in another session
            </button>
          </div>
        ) : (
          <form className="checkin-form" onSubmit={handleCheckIn}>
            
            <div className="input-group">
              <label>Select Your Name</label>
              
              {!selectedStudent ? (
                <>
                  <input 
                    type="text" 
                    className="input-field mb-2" 
                    placeholder="🔍 Search name or roll number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={status === "loading"}
                  />
                  
                  <div className="student-list">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map(student => (
                        <button 
                          key={student.id} 
                          type="button"
                          className="student-list-item"
                          onClick={() => setSelectedStudent(student)}
                        >
                          <span className="student-name">{student.name}</span>
                          <span className="student-id">{student.id}</span>
                        </button>
                      ))
                    ) : (
                      <div className="empty-state">No students found.</div>
                    )}
                  </div>
                </>
              ) : (
                <div className="selected-student-card">
                  <div>
                    <span className="student-name">{selectedStudent.name}</span>
                    <span className="student-id">{selectedStudent.id}</span>
                  </div>
                  <button type="button" className="clear-btn" onClick={() => setSelectedStudent(null)}>✕</button>
                </div>
              )}
            </div>
            
            <div className="input-group mt-4">
              <label>Session Secret Code</label>
              <input 
                type="text" 
                className="input-field code-input" 
                placeholder="----"
                maxLength="4"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                required
                disabled={status === "loading" || !selectedStudent}
              />
            </div>

            {status === "error" && (
              <div className="error-message">
                Invalid secret code. Please check the projector and try again.
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary checkin-btn mt-4" 
              disabled={status === "loading" || !selectedStudent}
            >
              {status === "loading" ? "Verifying..." : "Mark Attendance"}
            </button>
          </form>
        )}

        {googleForm && (
          <div style={{marginTop: 30, textAlign: "center"}}>
            <a href={googleForm} target="_blank" className="btn btn-secondary">Fill out Workshop Feedback Form</a>
          </div>
        )}
      </div>
    </div>
  );
}
