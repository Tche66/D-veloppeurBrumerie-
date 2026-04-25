/**
 * Point d'entrée du Dashboard Admin Brumerie
 * URL d'accès : /admin
 */
import { createRoot } from 'react-dom/client';
import AdminDashboard from './AdminDashboard';
import '../styles/index.css';

createRoot(document.getElementById('root')!).render(<AdminDashboard />);
