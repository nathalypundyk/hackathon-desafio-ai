import { useState } from 'react'
import MapComponent from './components/Map.jsx'
import OpenAI from "openai";

const ChatBot = () => {


  return (
      <div>
        <div>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ textAlign: msg.user ? 'right' : 'left' }}>
              {msg.text}
            </div>
          ))}
        </div>
        <input value={input} onChange={(e) => setInput(e.target.value)} />
        <button onClick={handleSendMessage}>Enviar</button>
      </div>
  )
}

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    {
      "role": "system",
      "content": "necesito que seas un guía turístico de la ciudad de Encarnacion-Paraguay, que cuando el usuario te pida lugares para comer por ejemplo cerca de la costanera devuelvas en formato json  estos datos resultado: [ { 'key': 'Nombre del lugar', 'type': 'El tipo del lugar. Catgorias: Turístico, Comida, Desayunos y meriendas, Alojamiento, Tecnología, Compras, Otros', 'description': 'Una descripción con un texto devuelto por el chat-bot explicando por qué el lugar fué incluido en la lista', 'address': 'Dirección del lugar' 'location': { 'lat': xx.xxxxx. Debe ser un valor numérico, 'lng': xx.xxxxx. Debe ser un valor numérico } }, ... ] pero teniendo en cuenta esto El campo location es muy importante, pues debe contener la información de la latitud y longitud para poder pintar los marcadores en el mapa. Los valores de lat y lng deben ser numéricos, no cadenas de texto.ya que vamos a utilizar google maps y con esa respuesta en json el maps mostraria las ubicaciones de acuerdo a lo solicitado por el usuario y no podes ir mas alla de encarnacion-Paraguay, solo de esta ciudad es la app si el usuario te saluda dar una respuesta de bienvenida diciendo : Hola soy tu guia turistica ¿donde te apetece ir hoy?"
    },
    {
      "role": "user",
      "content": "Hola, necesito cines"
    }
  ],
  temperature: 0.5,
});

console.log({ response});

const App = () => {
  let [places, setPlaces] = useState([]);

  return (
    <>
      <div className="w-screen h-screen m-0 p-3 bg-slate-500">
        <MapComponent locations={places} />
      </div>
    </>
  );
};

export default App;