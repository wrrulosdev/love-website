import { BookIcon, ClockIcon, HeartIcon, ImageIcon, MailIcon, SettingsIcon } from 'lucide-react';
import './HomePage.css';
import PageCard from './PageCard';
import HomeFooter from '../../../footers/HomeFooter';

const HomePage: React.FC = () => {
  return (
    <>
      <section className="home-page">
        <h1 className="home-title text-gradient-violet">Nuestro Universo</h1>
        <HeartIcon className="home-icon" />
        <p className="home-subtitle">
          Un cosmos íntimo donde cada estrella es un recuerdo, cada galaxia una aventura, y cada
          momento brilla con la magia de nuestro amor infinito.
        </p>
        <article className="subpages">
          <PageCard
            icon={BookIcon}
            title="Nuestro libro"
            description="Páginas mágicas que cobran vida, fotografías que susurran secretos de amor y momentos que danzan entre las hojas de nuestra historia."
            to="/book"
          />
          <PageCard
            icon={ImageIcon}
            title="Galeria Estelar"
            description="Constelaciones de recuerdos capturados, cada imagen una ventana a momentos que brillan eternamente en nuestro corazón."
            to="/galery"
          />
          <PageCard
            icon={ClockIcon}
            title="Linea Temporal"
            description="Un viaje cósmico a través del tiempo, donde cada fecha especial marca una nueva estrella en nuestra constelación de amor."
            to="/timeline"
          />
          <PageCard
            icon={MailIcon}
            title="Cartas Cosmicas"
            description="Mensajes que viajan a la velocidad de la luz entre nuestros corazones, palabras que brillan como supernovas en nuestro universo íntimo."
            to="/cards"
          />
          <PageCard
            icon={BookIcon}
            title="En desarrollo"
            description="Añade nuevos momentos estelares a nuestro universo, cada foto una nueva aventura que expande nuestro cosmos de recuerdos."
            to="/home"
          />
          <PageCard
            icon={SettingsIcon}
            title="Administracion"
            description="Añade nuevos momentos estelares a nuestro universo, cada foto una nueva aventura que expande nuestro cosmos de recuerdos."
            to="/admin"
          />
        </article>
      </section>
      <section className="home-footer-layout">
        <HomeFooter />
      </section>
    </>
  );
};

export default HomePage;
