import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Home() {
  const [codigo, setCodigo] = useState('');
  const [bloques, setBloques] = useState([]);
  const [seleccion, setSeleccion] = useState([]);
  const [modo, setModo] = useState(null);
  const [estadoEnvio, setEstadoEnvio] = useState(null);
  const [yaConfirmado, setYaConfirmado] = useState(false);
  const [nombreProfesor, setNombreProfesor] = useState('');
  const [confirmadoRecientemente, setConfirmadoRecientemente] = useState(false);

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
    setSeleccion(json.bloques.map(b => ({ ...b, estado: '' })));
    setNombreProfesor(json.nombreProfesor || '');
    setConfirmadoRecientemente(false);
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
    const confirmados = seleccion.filter(b => b.estado === 'Aceptado' || b.estado === 'Rechazado');

    if (confirmados.length === 0) {
      alert('⚠️ Debes confirmar al menos un bloque.');
      return;
    }

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
        setConfirmadoRecientemente(true);
        setEstadoEnvio('finalizado');

        const aceptados = confirmados.filter(b => b.estado === 'Aceptado');
        descargarPDF(aceptados);

        setTimeout(() => {
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
      } else {
        alert('❌ Error al enviar confirmación');
        setEstadoEnvio(null);
      }
    } catch (err) {
      alert('🚨 Error de conexión');
      setEstadoEnvio(null);
    }
  };

  const descargarPDF = (bloquesParaPDF) => {
    const doc = new jsPDF();
    const now = new Date();

    const fecha = now.toLocaleDateString('es-CL');
    const hora = now.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    });

    doc.setFontSize(14);
    doc.text('Carga Académica Confirmada', 14, 20);

    doc.setFontSize(11);
    doc.text(`Profesor: ${nombreProfesor}`, 14, 28);
    doc.text(`Fecha de descarga: ${fecha} ${hora}`, 14, 35);

    autoTable(doc, {
      startY: 42,
      head: [['Bloque', 'Curso', 'Día', 'Cuenta']],
      body: bloquesParaPDF.map(b => [
        b.bloque,
        b.curso,
        b.dia,
        b.cuenta || '',
      ]),
    });

    doc.save(`carga_confirmada_${nombreProfesor.replace(/\s+/g, '_')}.pdf`);
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
      <button onClick={buscar}>Buscar</button>

      {yaConfirmado && (
        <div style={{ marginTop: '1rem', color: '#28a745', fontWeight: 'bold' }}>
          ✅ Ya confirmaste tu carga.
          <br />
          Puedes descargar tu asignación aceptada en PDF:
          <br />
          <button
            onClick={() => {
              const aceptados = seleccion.filter(b => b.estado === 'Aceptado' || b.confirmacion === 'Aceptado');
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

      {bloques.length > 0 && !yaConfirmado && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Bloques asignados</h2>

          <div style={{ marginBottom: '1rem' }}>
            <button onClick={aceptarTodos}>✅ Aceptar todos</button>
            <button onClick={seleccionarRechazos}>✏️ Seleccionar Rechazos</button>
          </div>

          <ul style={{ listStyle: 'none', padding: 0 }}>
            {seleccion.map((b, i) => (
              <li
                key={i}
                style={{
                  padding: '10px',
                  marginBottom: '8px',
                  border: '1px solid #ccc',
                  backgroundColor:
                    b.estado === 'Aceptado'
                      ? '#d4fcd4'
                      : b.estado === 'Rechazado'
                      ? '#fcd4d4'
                      : '#f3f3f3',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <span>{b.dia} {b.bloque} - {b.curso} ({b.estado || 'Sin confirmar'})</span>

                {modo === 'personalizado' && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                    <button onClick={() => setEstadoIndividual(i, 'Aceptado')} style={styles.btnOk}>
                      ✅ Aceptar
                    </button>
                    <button onClick={() => setEstadoIndividual(i, 'Rechazado')} style={styles.btnNo}>
                      ❌ Rechazar
                    </button>
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
            {estadoEnvio === 'enviando' ? '⏳ Enviando información...' : '🚀 Enviar Confirmación'}
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  btnSend: {
    marginTop: '2rem',
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  btnDisabled: {
    marginTop: '2rem',
    padding: '12px 24px',
    backgroundColor: '#ccc',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'not-allowed',
  },
  btnOk: {
    backgroundColor: '#d4fcd4',
    border: '1px solid #ccc',
    padding: '6px 10px',
    cursor: 'pointer',
  },
  btnNo: {
    backgroundColor: '#fcd4d4',
    border: '1px solid #ccc',
    padding: '6px 10px',
    cursor: 'pointer',
  }
};
