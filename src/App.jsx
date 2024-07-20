// App.jsx
import { useState } from 'react';
import MapComponent from './components/Map.jsx';
import OpenAI from "openai";
import { Input, Button, ButtonGroup } from '@chakra-ui/react'
import Card from './components/Card.jsx';
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
            "content": "Necesito que seas un guía turístico de la ciudad de Encarnación, Paraguay. Cuando el usuario te pida lugares, devuelvas en formato JSON estos datos: resultado: [ { 'key': 'Nombre del lugar', 'type': 'El tipo del lugar. Categorías: Turístico, Comida, Desayunos y meriendas, Alojamiento, Tecnología, Compras, Otros', 'description': 'Una descripción con un texto devuelto por el chat-bot explicando por qué el lugar fue incluido en la lista', 'address': 'Dirección del lugar', 'location': { 'lat': xx.xxxxx, 'lng': xx.xxxxx } }, ... ]. El campo location es muy importante y debe contener la información de la latitud y longitud para poder pintar los marcadores en el mapa. Los valores de lat y lng deben ser numéricos, no cadenas de texto. Solo puedes proporcionar información para Encarnación, Paraguay. Si el usuario te saluda, dar una respuesta de bienvenida diciendo: 'Hola, soy tu guía turística, ¿dónde te apetece ir hoy? y cuando te pida lugares le des de respuesta claro, acontinuacion te muestro esos lugares antes de json debe ir esta respuesta'"
          },
          {
            "role": "user",
            "content": input // Utiliza el valor del input del usuario
          }
        ],
        temperature: 0.5,
      });

      // Extrae y analiza el JSON de la respuesta
      const responseText = response.choices[0].message.content;
      console.log(responseText);


      // Intentar analizar el JSON de la respuesta
      let places;
      try {
        const jsonString = responseText.match(/\[.*\]/s)[0];
        places = JSON.parse(jsonString.replace(/'/g, '"'));
        if (!Array.isArray(places)) {
          throw new Error('El formato de los datos no es correcto');
        }
      } catch (error) {
        console.error('Error al analizar el contenido JSON:', error);
        return; // Salir si hay un error al analizar el contenido
      }

      // Actualiza el estado de mensajes y agrega los lugares obtenidos
      setMessages([...messages, { text: input, user: true }, { text: places, user: false }]);
      console.log(places);
      setInput('');
      onAddPlace(places); // Pasa solo el array de lugares
    } catch (error) {
      console.error('Error al enviar el mensaje a OpenAI:', error);
    }
    finally {
      setLoading(false);
    }
  };


  return (
    <>
      <div className='flex flex-col'>
        <div>
          {messages.map((msg, idx) => (
            <div key={idx}>
              {!msg.user && msg.text.map((place, idx) => (
                <Card key={idx} nombre={place.key} descripcion={place.description} tipo={place.type} direccion={place.address} />
              ))}
              {msg.user && (<p>{msg.text}</p>)}
            </div>
          ))}

        </div>
        <div className='m-4 flex'>
          <div className='mr-4 grow'>
            <Input value={input} onChange={(e) => setInput(e.target.value)} />
          </div>
          <Button onClick={handleSendMessage} colorScheme='blue'>Enviar</Button>
          <LoaderModal isOpen={loading} text="Cargando..." />
        </div>
      </div>
    </>
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
