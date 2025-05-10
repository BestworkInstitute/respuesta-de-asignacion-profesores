import { useState } from 'react';
import ConfirmacionForm from '../components/ConfirmacionForm';

export default function Home() {
  const [codigo, setCodigo] = useState('');
  const [bloques, setBloques] = useState(null);

  const buscar = async () => {
    const res = await fetch(`/api/get-profesor?codigo=${codigo}`);
    const json = await res.json();
    setBloques(json.bloques);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Segoe UI' }}>
      <h1>🎓 Confirmación de Talleres</h1>
      <p>Bienvenido profesor. Ingrese su código para revisar sus asignaciones:</p>

      <input
        value={codigo}
        onChange={e => setCodigo(e.target.value)}
        placeholder="Ej: FQUI382"
        style={{ padding: '10px', width: '250px', marginRight: '1rem' }}
      />
      <button onClick={buscar}>Buscar</button>

      {bloques && <ConfirmacionForm bloques={bloques} />}
    </div>
  );
}
