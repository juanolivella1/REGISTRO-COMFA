// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [cedula, setCedula] = useState('');
  const [participantData, setParticipantData] = useState(null);
  const [error, setError] = useState('');

  const handleSearchByCedula = async () => {
    if (!cedula) {
      setError('Por favor, ingresa una cédula.');
      return;
    }

    try {
      const response = await fetch('http://90.3.3.6:8787/api/collections/empleados/records?perPage=10000');
      const data = await response.json();
      const participant = data.items.find(item => item.cedula === cedula);

      if (!participant) {
        setError('No se encontró un participante con esta cédula.');
        setParticipantData(null);
        return;
      }

      // Verificar si ya está registrado
      if (participant.asistencia) {
        setError('El participante ya ha sido registrado.');
        setParticipantData(null); // Limpiar los datos del participante
        return;
      }

      // Si no está registrado, actualizar la asistencia
      await updateAttendance(participant.id);

      setParticipantData({
        nombre: participant.nombre,
        dependencia: participant.dependencia,
        sede: participant.sede,
      });
      setError('');
    } catch (error) {
      console.error('Error buscando participante:', error);
      setError('Ocurrió un error al buscar el participante.');
    }
  };

  const updateAttendance = async (participantId) => {
    try {
      const response = await fetch(`http://90.3.3.6:8787/api/collections/empleados/records/${participantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ asistencia: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error updating attendance:', errorData);
        throw new Error('Error updating attendance');
      }

      console.log('Attendance updated successfully');
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const handleReset = () => {
    setCedula('');
    setParticipantData(null);
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchByCedula();
    }
  };

  return (
    <div className="container">
      <img src="img/comfacesar-1.png" alt="Logo Comfacesar" className="logo" />
      <h1>Registro de Asistencia</h1>
      <input
        type="text"
        placeholder="Ingresa tu cédula"
        value={cedula}
        onChange={(e) => setCedula(e.target.value)}
        onKeyDown={handleKeyPress} // Detectar tecla Enter
        className="input-cedula"
      />
      <button onClick={handleSearchByCedula} className="btn-register">Registrar Asistencia</button>
      <button onClick={handleReset} className="btn-reset">Limpiar</button>

      {error && <p className="error">{error}</p>}

      {participantData && (
        <div className="participant-info">
          <h2>Datos del Participante</h2>
          <p><strong>Nombre:</strong> {participantData.nombre}</p>
          <p><strong>Dependencia:</strong> {participantData.dependencia}</p>
          <p><strong>Sede:</strong> {participantData.sede}</p>
          <p><strong>Asistencia:</strong> Sí</p>
        </div>
      )}
    </div>
  );
};

export default App;
