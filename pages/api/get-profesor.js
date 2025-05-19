// pages/api/get-profesor.js
import { google } from 'googleapis';

export default async function handler(req, res) {
  const { codigo } = req.query;

  if (!codigo) return res.status(400).json({ error: 'Falta el código' });

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'TALLERES ASIGNADOS PROFESORES!A1:G',
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron datos en la hoja' });
    }

    const [headers, ...data] = rows;

    const bloques = data
      .filter(row => row[5] === codigo)
      .map(row => ({
        bloque: row[0],
        curso: row[1],
        dia: row[2],
        idBloque: row[3],
        profesor: row[4],
        codigo: row[5],
        confirmacion: row[6] || '',
      }));

    const nombreProfesor = bloques[0]?.profesor || 'Profesor desconocido';
    res.status(200).json({ bloques, nombreProfesor });

  } catch (err) {
    console.error('💥 Error en API /get-profesor:', err);
    res.status(500).json({ error: 'Error al obtener datos del profesor' });
  }
}
