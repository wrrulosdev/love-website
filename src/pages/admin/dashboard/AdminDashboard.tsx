import React from 'react';
import './AdminDashboard.css';
import {
  ArrowRightIcon,
  Edit2Icon,
  Edit3Icon,
  HeartIcon,
  ImageIcon,
  LogOutIcon,
  MailIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const AdminDashboardPage: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const dashboardCards = [
    {
      id: 'upload-images',
      title: 'Subir Imágenes',
      description: 'Añade nuevas fotografías a nuestra galería estelar',
      icon: <ImageIcon size={30} />,
      action: () => navigate('/admin/upload-image'),
      gradient: 'gradient-1',
    },
    {
      id: 'edit-images',
      title: 'Editar Imágenes',
      description: 'Modifica las constelaciones de recuerdos capturados',
      icon: <Edit2Icon size={30} />,
      action: () => navigate('/admin/edit-image'),
      gradient: 'gradient-2',
    },
    {
      id: 'upload-cards',
      title: 'Subir Cartas',
      description: 'Mensajes que viajan a la velocidad de la luz entre corazones',
      icon: <MailIcon size={30} />,
      action: () => navigate('/admin/upload-card'),
      gradient: 'gradient-3',
    },
    {
      id: 'edit-cards',
      title: 'Editar Cartas',
      description: 'Ajusta las palabras que brillan en nuestro universo íntimo',
      icon: <Edit3Icon size={30} />,
      action: () => navigate('/admin/edit-card'),
      gradient: 'gradient-4',
    },
  ];

  return (
    <section className="admin-dashboard-page">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-icon">
              <HeartIcon size={30} />
            </div>
            <div className="header-text">
              <h1>Nuestro Universo</h1>
              <p>Panel de Administración</p>
            </div>
          </div>

          <button className="logout-button" onClick={() => auth.logout()}>
            <LogOutIcon />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="welcome-section">
            <h2>Bienvenido al cosmos de administración</h2>
            <p>
              Cada estrella es un recuerdo, cada galaxia una aventura, y cada momento brilla con la
              magia de nuestro amor infinito.
            </p>
          </div>

          <div className="cards-grid">
            {dashboardCards.map((card) => (
              <div
                key={card.id}
                className={`dashboard-card ${card.gradient}`}
                onClick={card.action}
              >
                <div className="card-icon">{card.icon}</div>
                <div className="card-content">
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
                <div className="card-arrow">
                  <ArrowRightIcon />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </section>
  );
};

export default AdminDashboardPage;
