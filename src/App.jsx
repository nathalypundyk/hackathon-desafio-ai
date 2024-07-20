import { useState } from 'react';
import MapComponent from './components/Map.jsx';
import OpenAI from "openai";
import LoaderModal from './components/LoaderModal.jsx';
const ChatBot = ({ onAddPlace }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false); 

  const handleSendMessage = async () => {
    const openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
    setLoading(true);
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            "role": "system",
            "content": "Necesito que seas un guía turístico de la ciudad de Encarnación, Paraguay. Cuando el usuario te pida lugares, devuelvas en formato JSON estos datos: resultado: [ { 'key': 'Nombre del lugar', 'type': 'El tipo del lugar. Categorías: Turístico, Comida, Desayunos y meriendas, Alojamiento, Tecnología, Compras, Otros', 'description': 'Una descripción con un texto devuelto por el chat-bot explicando por qué el lugar fue incluido en la lista', 'address': 'Dirección del lugar', 'location': { 'lat': xx.xxxxx, 'lng': xx.xxxxx } }, ... ]. El campo location es muy importante y debe contener la información de la latitud y longitud para poder pintar los marcadores en el mapa. Los valores de lat y lng deben ser numéricos, no cadenas de texto. Solo puedes proporcionar información para Encarnación, Paraguay. Si el usuario te saluda, dar una respuesta de bienvenida diciendo: 'Hola, soy tu guía turística, ¿dónde te apetece ir hoy?'"
          },
          {
            "role": "user",
            "content": input 
          }
        ],
        temperature: 0.5,
      });

      
      const responseText = response.choices[0].message.content;
      console.log('Contenido de la respuesta:', responseText);
      let places;
      try {
        const jsonString = responseText.match(/\[.*\]/s)[0];
        places = JSON.parse(jsonString.replace(/'/g, '"'));
        if (!Array.isArray(places)) {
          throw new Error('El formato de los datos no es correcto');
        }
      } catch (error) {
        console.error('Error al analizar el contenido JSON:', error);
        alert('Hubo un error al realizar la consulta. Intenta nuevamente.');
        return; // Salir si hay un error al analizar el contenido
      }

      
      setMessages([...messages, { text: input, user: true }, { text: JSON.stringify(places, null, 2), user: false }]);
      setInput('');
      onAddPlace(places); // Pasa solo el array de lugares
    } catch (error) {
      console.error('Error al enviar el mensaje a OpenAI:', error);
      alert('Hubo un error al enviar el mensaje a OpenAI. Intenta nuevamente.');
    }
    finally {
      setLoading(false); 
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.user ? 'right' : 'left' }}>
            {msg.text}
          </div>
        ))}
      </div>
      <input  value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={handleSendMessage}>Enviar</button>
      <LoaderModal isOpen={loading} text="Cargando..." />
    </div>
  );
};

const App = () => {
  const [places, setPlaces] = useState([]);

  const addPlace = (newPlaces) => {
    if (Array.isArray(newPlaces)) {
      setPlaces(prevPlaces => [...prevPlaces, ...newPlaces]);
    } else {
      console.error('Se esperaba un array de lugares');
    }
  };

  return (
    <div className="w-screen h-screen m-0 p-3">
      <MapComponent locations={places} />
      <ChatBot onAddPlace={addPlace} />
    </div>
  );
};

export default App;