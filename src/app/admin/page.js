"use client";
import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, getDoc, setDoc, deleteDoc, getDocs } from "firebase/firestore";
import "./admin.css";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="admin-layout">
      <div className="sidebar">
        <div className="brand-header">
          <span className="logo-icon">▲</span> Attendify OS
        </div>
        <nav className="nav-menu">
          <button className={`nav-item ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>Dashboard Overview</button>
          <button className={`nav-item ${activeTab === "sessions" ? "active" : ""}`} onClick={() => setActiveTab("sessions")}>Sessions & Codes</button>
          <button className={`nav-item ${activeTab === "kiosk" ? "active" : ""}`} onClick={() => setActiveTab("kiosk")}>QR Kiosk Mode</button>
          <button className={`nav-item ${activeTab === "roster" ? "active" : ""}`} onClick={() => setActiveTab("roster")}>Master Roster (Print)</button>
          <button className={`nav-item ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")}>Settings & Security</button>
        </nav>
      </div>

      <div className="main-content">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "sessions" && <SessionsTab />}
        {activeTab === "kiosk" && <KioskTab />}
        {activeTab === "roster" && <RosterTab />}
        {activeTab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}

function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const snap = await getDoc(doc(db, "config", "settings"));
    const actualPassword = snap.exists() && snap.data().adminPassword ? snap.data().adminPassword : "admin123";
    
    if (password === actualPassword) {
      onLogin();
    } else {
      setError(true);
      setPassword("");
    }
  };

  return (
    <div className="admin-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="panel" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <div className="brand-header mb-4" style={{ justifyContent: 'center', borderBottom: 'none' }}>
          <span className="logo-icon">▲</span> Attendify Admin
        </div>
        <p className="text-sub mb-4">Please enter the master password to access the dashboard.</p>
        <form onSubmit={handleLogin}>
          <input 
            type="password" className="input-field mb-4" placeholder="Enter password..."
            value={password} onChange={(e) => { setPassword(e.target.value); setError(false); }} autoFocus
          />
          {error && <p className="text-danger" style={{ fontSize: 14, marginTop: -10, marginBottom: 15 }}>Incorrect password.</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login to Dashboard</button>
        </form>
      </div>
    </div>
  );
}

function OverviewTab() {
  const [stats, setStats] = useState({ total: 124, present: 0, avg: 0 });
  const [liveFeed, setLiveFeed] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "logs"), (snapshot) => {
      const logs = snapshot.docs.map(doc => doc.data());
      const sortedLogs = logs.filter(l => l.timestamp).sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
      
      setLiveFeed(sortedLogs.slice(0, 10));
      // Assuming 5 total students registered for mock purposes, but can be updated
      const totalStudents = 5; 
      setStats({ total: totalStudents, present: logs.length, avg: 0 });
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="tab-container">
      <div className="topbar"><h2>Live Analytics</h2></div>
      <div className="content-area">
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-title">Total Registered</div>
            <div className="metric-value">{stats.total}</div>
          </div>
          <div className="metric-card">
            <div className="metric-title">Total Check-ins</div>
            <div className="metric-value text-secondary">{stats.present}</div>
          </div>
        </div>
        
        <div className="panel">
          <h3>Live Check-in Feed</h3>
          {liveFeed.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, marginTop: 20 }}>
              {liveFeed.map((log, i) => (
                <li key={i} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span className="badge badge-success" style={{ marginRight: 10 }}>{log.session}</span> 
                  Student <strong>{log.rollNo}</strong> checked in just now.
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sub mt-4">Waiting for students to check in...</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SessionsTab() {
  const [activeSession, setActiveSession] = useState("Closed");
  const [codes, setCodes] = useState({
    "Day 1 - Session 1": "", "Day 1 - Session 2": "",
    "Day 2 - Session 1": "", "Day 2 - Session 2": ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "config", "settings")).then(snap => {
      if(snap.exists()) {
        setActiveSession(snap.data().activeSession || "Closed");
        if(snap.data().codes) setCodes(prev => ({...prev, ...snap.data().codes}));
      }
    });
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, "config", "settings"), { activeSession, codes }, { merge: true });
      alert("Live Database Updated Successfully!");
    } catch (e) {
      console.error(e);
      alert("Error updating database.");
    }
    setLoading(false);
  };

  return (
    <div className="tab-container">
      <div className="topbar"><h2>Session Management</h2></div>
      <div className="content-area">
        <div className="panel">
          <h3>Active Session Controller</h3>
          <p className="text-sub mb-4">Select which session students are allowed to check into.</p>
          <select className="input-field mb-4" value={activeSession} onChange={(e) => setActiveSession(e.target.value)}>
            <option value="Closed">Closed</option>
            <option value="Day 1 - Session 1">Day 1 - Session 1</option>
            <option value="Day 1 - Session 2">Day 1 - Session 2</option>
            <option value="Day 2 - Session 1">Day 2 - Session 1</option>
            <option value="Day 2 - Session 2">Day 2 - Session 2</option>
          </select>
        </div>
        
        <div className="panel mt-4">
          <h3>Secret Attendance Codes</h3>
          <p className="text-sub mb-4">Set 4-digit codes for each session.</p>
          <div className="code-grid">
            {Object.keys(codes).map(session => (
              <div className="input-group" key={session}>
                <label>{session}</label>
                <input 
                  type="text" className="input-field" maxLength="4"
                  value={codes[session]}
                  onChange={e => setCodes({...codes, [session]: e.target.value.toUpperCase()})}
                  placeholder="----"
                />
              </div>
            ))}
          </div>
          <button className="btn btn-primary mt-4" onClick={handleUpdate} disabled={loading}>
            {loading ? "Saving..." : "Save All Session Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}

function KioskTab() {
  const [checkInUrl, setCheckInUrl] = useState("");
  const [googleForm, setGoogleForm] = useState("");
  const [savedForm, setSavedForm] = useState("");

  useEffect(() => {
    setCheckInUrl(window.location.origin);
    getDoc(doc(db, "config", "settings")).then(snap => {
      if(snap.exists() && snap.data().googleFormLink) {
        setGoogleForm(snap.data().googleFormLink);
        setSavedForm(snap.data().googleFormLink);
      }
    });
  }, []);

  const saveGoogleForm = async () => {
    await setDoc(doc(db, "config", "settings"), { googleFormLink: googleForm }, { merge: true });
    setSavedForm(googleForm);
    alert("Google Form link saved globally!");
  };

  return (
    <div className="tab-container">
      <div className="topbar"><h2>Presentation Kiosk</h2></div>
      <div className="content-area">
        <div className="kiosk-grid">
          <div className="panel text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3>QR Code Generator</h3>
            <div className="qr-placeholder mt-4">
              {checkInUrl ? <QRCodeSVG value={checkInUrl} size={220} level="H" includeMargin={true} bgColor="#ffffff" fgColor="#0f172a" /> : "[ Loading... ]"}
            </div>
            <button className="btn btn-primary mt-4" onClick={() => document.documentElement.requestFullscreen()}>Enter Fullscreen</button>
          </div>
          
          <div className="panel">
            <h3>Google Form Link</h3>
            <p className="text-sub mb-4">Provide a link to a Google Form for feedback or registration.</p>
            <input type="url" className="input-field mb-4" value={googleForm} onChange={e => setGoogleForm(e.target.value)} placeholder="https://forms.google.com/..." />
            <button className="btn btn-secondary" onClick={saveGoogleForm}>Save Link</button>
            {savedForm && <p className="text-success mt-2">Active Link: {savedForm}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function RosterTab() {
  const [studentsData, setStudentsData] = useState([]);

  useEffect(() => {
    const fetchRoster = async () => {
      const snap = await getDocs(collection(db, "logs"));
      const logs = snap.docs.map(d => d.data());
      
      const roster = {};
      logs.forEach(log => {
        if (!roster[log.rollNo]) roster[log.rollNo] = { id: log.rollNo, name: `Student ${log.rollNo}`, d1s1: '-', d1s2: '-', d2s1: '-', d2s2: '-' };
        if (log.session === "Day 1 - Session 1") roster[log.rollNo].d1s1 = 'Present';
        if (log.session === "Day 1 - Session 2") roster[log.rollNo].d1s2 = 'Present';
        if (log.session === "Day 2 - Session 1") roster[log.rollNo].d2s1 = 'Present';
        if (log.session === "Day 2 - Session 2") roster[log.rollNo].d2s2 = 'Present';
      });
      setStudentsData(Object.values(roster));
    };
    fetchRoster();
  }, []);

  const downloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Roll No,Name,Day 1 - Session 1,Day 1 - Session 2,Day 2 - Session 1,Day 2 - Session 2\\n";
    studentsData.forEach(s => {
      csvContent += `${s.id},${s.name},${s.d1s1},${s.d1s2},${s.d2s1},${s.d2s2}\\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "attendify_roster.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tab-container">
      <div className="topbar">
        <h2>Master Roster</h2>
        <div className="actions">
          <button className="btn btn-outline mr-2" onClick={downloadCSV}>Download CSV</button>
          <button className="btn btn-primary" onClick={() => window.print()}>🖨 Print to PDF</button>
        </div>
      </div>
      <div className="content-area printable-area">
        <table className="data-table">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>D1S1</th>
              <th>D1S2</th>
              <th>D2S1</th>
              <th>D2S2</th>
            </tr>
          </thead>
          <tbody>
            {studentsData.map((s, i) => (
              <tr key={i}>
                <td>{s.id}</td>
                <td>{s.d1s1 === 'Present' ? <span className="badge badge-success">Present</span> : '-'}</td>
                <td>{s.d1s2 === 'Present' ? <span className="badge badge-success">Present</span> : '-'}</td>
                <td>{s.d2s1 === 'Present' ? <span className="badge badge-success">Present</span> : '-'}</td>
                <td>{s.d2s2 === 'Present' ? <span className="badge badge-success">Present</span> : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsTab() {
  const [newPassword, setNewPassword] = useState("");

  const updatePassword = async () => {
    if(!newPassword) return;
    await setDoc(doc(db, "config", "settings"), { adminPassword: newPassword }, { merge: true });
    alert("Admin password updated successfully!");
    setNewPassword("");
  };

  const wipeDatabase = async () => {
    if(confirm("Are you absolutely sure? This will delete ALL check-in logs forever!")) {
      const snap = await getDocs(collection(db, "logs"));
      snap.docs.forEach(async (d) => {
        await deleteDoc(doc(db, "logs", d.id));
      });
      alert("Workshop database wiped clean.");
    }
  };

  return (
    <div className="tab-container">
      <div className="topbar"><h2>Security & Settings</h2></div>
      <div className="content-area">
        <div className="panel">
          <h3>Admin Credentials</h3>
          <div className="input-group">
            <label>New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field mb-4" />
          </div>
          <button className="btn btn-primary" onClick={updatePassword}>Update Password</button>
        </div>
        
        <div className="panel mt-4 border-danger">
          <h3 className="text-danger">Danger Zone</h3>
          <button className="btn btn-danger mt-4" onClick={wipeDatabase}>Reset Workshop Database</button>
        </div>
      </div>
    </div>
  );
}
