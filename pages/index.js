import { useState } from 'react';
import ConfirmacionForm from '../components/ConfirmacionForm';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Home() {
  const [codigo, setCodigo] = useState('');
  const [bloques, setBloques] = useState(null);
  const [yaConfirmado, setYaConfirmado] = useState(false);

  const buscar = async () => {
    if (!codigo) {
      alert('⚠️ Ingresa tu código');
      return;
    }

    const res = await fetch(`/api/get-profesor?codigo=${codigo}`);
    const json = await res.json();

    if (!json || !json.bloques || json.bloques.length === 0) {
      alert('❌ No se encontraron bloques para este código');
      return;
    }

    const confirmados = json.bloques.filter(b => b.confirmacion).length;
    setYaConfirmado(confirmados > 0);
    setBloques(json.bloques);
  };

  const descargarPDF = (bloques) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Carga Académica Confirmada', 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [['Bloque', 'Curso', 'Día']],
      body: bloques.map(b => [b.bloque, b.curso, b.dia]),
    });

    doc.save('carga_confirmada.pdf');
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

      {yaConfirmado && (
        <div style={{ marginTop: '1rem', color: '#28a745', fontWeight: 'bold' }}>
          ✅ Ya confirmaste tu carga.
          <br />
          Puedes descargar tu asignación aceptada en PDF:
          <br />
          <button
            onClick={() => {
              const aceptados = bloques.filter(b => b.confirmacion === 'Aceptado');
              descargarPDF(aceptados);
            }}
            style={{
              marginTop: '0.5rem',
              padding: '10px 20px',
              backgroundColor: '#6c63ff',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '15px',
            }}
          >
            📄 Descargar PDF
          </button>
        </div>
      )}

      {bloques && !yaConfirmado && <ConfirmacionForm bloques={bloques} />}
    </div>
  );
}
