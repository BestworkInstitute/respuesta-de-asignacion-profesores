import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Home() {
  const [codigo, setCodigo] = useState('');
  const [bloques, setBloques] = useState([]);
  const [seleccion, setSeleccion] = useState([]);
  const [nombreProfesor, setNombreProfesor] = useState('');
  const [yaConfirmado, setYaConfirmado] = useState(false);
  const [modo, setModo] = useState(null);
  const [estadoEnvio, setEstadoEnvio] = useState(null);

  const buscar = async () => {
    if (!codigo) return alert('⚠️ Ingresa tu código');

    const res = await fetch(`/api/get-profesor?codigo=${codigo}`);
    const json = await res.json();

    if (!json || !json.bloques || json.bloques.length === 0) {
      return alert('❌ No se encontraron bloques');
    }

    const confirmados = json.bloques.filter(b => b.confirmacion).length;
    setYaConfirmado(confirmados > 0);
    setBloques(json.bloques);
    setSeleccion(json.bloques.map(b => ({ ...b, estado: '' })));
    setNombreProfesor(json.nombreProfesor || '');
  };

  const aceptarTodos = () => {
    setModo('aceptar_todo');
    setSeleccion(prev => prev.map(b => ({ ...b, estado: 'Aceptado' })));
  };

  const seleccionarRechazos = () => {
    setModo('personalizado');
    setSeleccion(prev => prev.map(b => ({ ...b, estado: '' })));
  };

  const setEstadoIndividual = (i, estado) => {
    const nueva = [...seleccion];
    nueva[i].estado = estado;
    setSeleccion(nueva);
  };

  const enviarConfirmacion = async () => {
    const confirmados = seleccion.filter(b => ['Aceptado', 'Rechazado'].includes(b.estado));
    if (confirmados.length === 0) return alert('⚠️ Selecciona al menos un bloque');

    setEstadoEnvio('enviando');
    try {
      const res = await fetch('/api/submit-confirmacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datos: confirmados }),
      });

      const json = await res.json();
      if (json.success) {
        setYaConfirmado(true);
        setEstadoEnvio('finalizado');

        const aceptados = confirmados.filter(b => b.estado === 'Aceptado');
        descargarPDF(aceptados);

        setTimeout(() => {
<<<<<<< HEAD
          alert('✅ Su carga ha sido enviada con éxito y su PDF se ha descargado.');
          setCodigo('');
          setBloques([]);
          setSeleccion([]);
          setModo(null);
          setEstadoEnvio(null);
          setYaConfirmado(false);
          setNombreProfesor('');
          setConfirmadoRecientemente(false);
        }, 4000);
=======
          alert('✅ Confirmación enviada y PDF descargado.');
          setCodigo('');
          setBloques([]);
          setSeleccion([]);
          setNombreProfesor('');
          setModo(null);
        }, 2000);
>>>>>>> 70ce3af (💾 Proyecto actualizado: Confirmación de talleres funcional con PDF y Google Sheets)
      } else {
        alert('❌ Error al enviar confirmación');
        setEstadoEnvio(null);
      }
    } catch (err) {
      console.error('🚨', err);
      alert('🚨 Error de red');
      setEstadoEnvio(null);
    }
  };

  const descargarPDF = (bloquesPDF) => {
    const doc = new jsPDF();
    const now = new Date();
    const fecha = now.toLocaleDateString('es-CL');
    const hora = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

    doc.setFontSize(16);
    doc.text(' Carga Académica Confirmada', 14, 20);
    doc.setFontSize(12);
    doc.text(`${nombreProfesor}`, 14, 30);
    doc.text(`Fecha de descarga: ${fecha} ${hora}`, 14, 37);

    autoTable(doc, {
<<<<<<< HEAD
      startY: 42,
      head: [['Bloque', 'Curso', 'Día', 'Cuenta']],
      body: bloquesParaPDF.map(b => [
        b.bloque,
        b.curso,
        b.dia,
        b.cuenta || '',
      ]),
=======
      startY: 45,
      head: [['Bloque', 'Curso', 'Día', 'Cuenta']],
      body: bloquesPDF.map(b => [b.bloque, b.curso, b.dia, b.cuenta]),
>>>>>>> 70ce3af (💾 Proyecto actualizado: Confirmación de talleres funcional con PDF y Google Sheets)
    });

    const filename = `confirmacion_${nombreProfesor.replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Segoe UI' }}>
      <h1>🎓 Bienvenido Profesor/a</h1>
      <p>Ingrese su código para revisar y confirmar sus asignaciones académicas:</p>

      <input
        value={codigo}
        onChange={e => setCodigo(e.target.value)}
        placeholder="Ej: CVEL503"
        style={{ padding: '10px', width: '250px', marginRight: '1rem' }}
      />
      <button onClick={buscar}>🔍 Buscar</button>

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
            style={styles.btnPdf}
          >
            📄 Descargar PDF
          </button>
        </div>
      )}

      {!yaConfirmado && bloques.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Bloques asignados</h2>

          <div style={{ marginBottom: '1rem' }}>
            <button onClick={aceptarTodos}>✅ Aceptar todos</button>{' '}
            <button onClick={seleccionarRechazos}>✏️ Seleccionar Rechazos</button>
          </div>

          <ul style={{ listStyle: 'none', padding: 0 }}>
            {seleccion.map((b, i) => (
              <li key={i} style={styles.item(b.estado)}>
                <span>{b.dia} {b.bloque} - {b.curso} | {b.estado || 'Sin confirmar'}</span>
                {modo === 'personalizado' && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                    <button onClick={() => setEstadoIndividual(i, 'Aceptado')} style={styles.btnOk}>✅ Aceptar</button>
                    <button onClick={() => setEstadoIndividual(i, 'Rechazado')} style={styles.btnNo}>❌ Rechazar</button>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <button
            onClick={enviarConfirmacion}
            disabled={estadoEnvio === 'enviando'}
            style={estadoEnvio === 'enviando' ? styles.btnDisabled : styles.btnSend}
          >
            {estadoEnvio === 'enviando' ? '⏳ Enviando...' : '🚀 Enviar Confirmación'}
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  item: estado => ({
    padding: '10px',
    marginBottom: '10px',
    backgroundColor:
      estado === 'Aceptado' ? '#d4fcd4' :
      estado === 'Rechazado' ? '#fcd4d4' : '#f1f1f1',
    border: '1px solid #ccc',
    borderRadius: '5px',
  }),
  btnSend: {
    marginTop: '1rem',
    padding: '12px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  btnDisabled: {
    marginTop: '1rem',
    padding: '12px 20px',
    backgroundColor: '#aaa',
    color: '#fff',
    borderRadius: '5px',
    fontSize: '16px',
  },
  btnOk: {
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    cursor: 'pointer',
  },
  btnNo: {
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    cursor: 'pointer',
  },
  btnPdf: {
    marginTop: '0.5rem',
    padding: '10px 16px',
    backgroundColor: '#6c63ff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};
