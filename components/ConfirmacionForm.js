import { useEffect, useState } from 'react';

export default function ConfirmacionForm({ bloques }) {
  const [seleccion, setSeleccion] = useState([]);
  const [modo, setModo] = useState(null); // null | 'aceptar_todo' | 'personalizado'
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    setSeleccion(bloques.map(b => ({ ...b, estado: '' })));
  }, [bloques]);

  const aceptarTodos = () => {
    setModo('aceptar_todo');
    setSeleccion(prev => prev.map(b => ({ ...b, estado: 'Aceptado' })));
  };

  const seleccionarRechazos = () => {
    setModo('personalizado');
    setSeleccion(prev => prev.map(b => ({ ...b, estado: '' })));
  };

  const setEstadoIndividual = (i, estado) => {
    setSeleccion(prev => {
      const nueva = [...prev];
      nueva[i].estado = estado;
      return nueva;
    });
  };

  const enviarConfirmacion = async () => {
    const confirmados = seleccion.filter(b => b.estado === 'Aceptado' || b.estado === 'Rechazado');

    if (confirmados.length === 0) {
      alert('⚠️ Debes confirmar al menos un bloque.');
      return;
    }

    const res = await fetch('/api/submit-confirmacion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ datos: confirmados }),
    });

    const json = await res.json();
    if (json.success) {
      setModalVisible(true);
      setTimeout(() => setModalVisible(false), 5000); // Cierra modal en 5s
    } else {
      alert('❌ Error al enviar confirmación');
    }
  };

  return (
    <div style={{ marginTop: '2rem', position: 'relative' }}>
      <h2>📋 Bloques asignados</h2>

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
                <button
                  onClick={() => setEstadoIndividual(i, 'Aceptado')}
                  style={{
                    backgroundColor: '#d4fcd4',
                    border: '1px solid #ccc',
                    padding: '6px 10px',
                    cursor: 'pointer',
                  }}
                >
                  ✅ Aceptar
                </button>
                <button
                  onClick={() => setEstadoIndividual(i, 'Rechazado')}
                  style={{
                    backgroundColor: '#fcd4d4',
                    border: '1px solid #ccc',
                    padding: '6px 10px',
                    cursor: 'pointer',
                  }}
                >
                  ❌ Rechazar
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <button
        onClick={enviarConfirmacion}
        style={{
          marginTop: '2rem',
          padding: '12px 24px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        🚀 Enviar Confirmación
      </button>

      {/* ✅ MODAL EMERGENTE */}
      {modalVisible && (
        <div style={modalStyles.backdrop} onClick={() => setModalVisible(false)}>
          <div style={modalStyles.modal}>
            <h3>🎉 Confirmación enviada</h3>
            <p>Tu respuesta fue registrada correctamente. ¡Gracias!</p>
            <button style={modalStyles.closeBtn} onClick={() => setModalVisible(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

const modalStyles = {
  backdrop: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
    minWidth: '300px'
  },
  closeBtn: {
    marginTop: '1rem',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#007bff',
    color: '#fff',
    cursor: 'pointer'
  }
};
