import { db } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, query, where, serverTimestamp } from 'firebase/firestore';

/**
 * Fetch all registered students
 */
export async function getStudents() {
  const studentsCol = collection(db, 'students');
  const snapshot = await getDocs(studentsCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Get current workshop settings (active session, secret codes, etc)
 */
export async function getSettings() {
  const settingsDoc = doc(db, 'config', 'settings');
  const snapshot = await getDoc(settingsDoc);
  if (snapshot.exists()) {
    return snapshot.data();
  }
  return null;
}

/**
 * Mark a student as present
 */
export async function markPresent(rollNo, session) {
  const logsCol = collection(db, 'logs');
  
  // Check if already checked in to prevent duplicates
  const q = query(logsCol, where('rollNo', '==', rollNo), where('session', '==', session));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    throw new Error('Already checked in for this session');
  }

  await addDoc(logsCol, {
    rollNo,
    session,
    timestamp: serverTimestamp()
  });
}

/**
 * Fetch attendance logs for a specific session
 */
export async function getLogsBySession(session) {
  const logsCol = collection(db, 'logs');
  const q = query(logsCol, where('session', '==', session));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Admin: Update Active Session
 */
export async function updateActiveSession(newSession) {
  const settingsDoc = doc(db, 'config', 'settings');
  await updateDoc(settingsDoc, { activeSession: newSession });
}
