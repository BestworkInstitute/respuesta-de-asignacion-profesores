import { google } from 'googleapis';

export default async function handler(req, res) {
  const { codigo } = req.query;

  if (!codigo) return res.status(400).json({ error: 'Falta el código' });

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'TALLERES ASIGNADOS PROFESORES!A1:H',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron datos' });
    }

    const [headers, ...data] = rows;

    const bloques = data
<<<<<<< HEAD
      .filter(row => row[6] === codigo) // CLAVE PROFESOR
=======
      .filter(row => row[6]?.trim().toUpperCase() === codigo.trim().toUpperCase())
>>>>>>> 70ce3af (💾 Proyecto actualizado: Confirmación de talleres funcional con PDF y Google Sheets)
      .map(row => ({
        bloque: row[0],
        curso: row[1],
        dia: row[2],
        idBloque: row[3],
        cuenta: row[4],
        profesor: row[5],
        codigo: row[6],
        confirmacion: row[7] || '',
      }));

    const nombreProfesor = bloques[0]?.profesor || 'Profesor desconocido';
    res.status(200).json({ bloques, nombreProfesor });

  } catch (err) {
    console.error('❌ Error en get-profesor:', err);
    res.status(500).json({ error: 'Error interno' });
  }
}
