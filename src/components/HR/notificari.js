// Presupunând că ai un context pentru notificări
const NotificariContext = React.createContext();

// În componenta principală a aplicației tale
const App = () => {
  const [notificari, setNotificari] = useState([]);

  // Funcție pentru adăugarea unei noi notificări
  const adaugaNotificare = (notificare) => {
    setNotificari([...notificari, notificare]);
  };

  return (
    <NotificariContext.Provider value={{ notificari, adaugaNotificare }}>
      {/* Restul aplicației tale */}
    </NotificariContext.Provider>
  );
};

// Într-o componentă unde dorești să trimiți o notificare
const SomeComponent = () => {
  const { adaugaNotificare } = useContext(NotificariContext);

  // Când vrei să adaugi o notificare
  adaugaNotificare({
    mesaj: "Concediul tău a fost aprobat.",
    tip: "succes" // sau "eroare", "informare", etc.
  });

  // Restul componentei
};
