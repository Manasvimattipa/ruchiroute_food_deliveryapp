import { getAuth } from 'firebase/auth';
import { app, adminApp } from './firebase';

export const auth = getAuth(app);
export const adminAuth = getAuth(adminApp);
