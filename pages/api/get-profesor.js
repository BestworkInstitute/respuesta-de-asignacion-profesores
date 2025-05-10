import { google } from 'googleapis';

export default async function handler(req, res) {
  const { codigo } = req.query;

  if (!codigo) return res.status(400).json({ error: 'Falta el código' });

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: 'TALLERES ASIGNADOS PROFESORES!A1:G',
  });

  const [headers, ...rows] = result.data.values;

  const bloques = rows
    .filter(row => row[5] === codigo) // ID PROFESOR está en columna F (índice 5)
    .map(row => ({
      bloque: row[0],
      curso: row[1],
      dia: row[2],
      idBloque: row[3],
      profesor: row[4],
      codigo: row[5],
      confirmacion: row[6] || '',
    }));

  res.status(200).json({ bloques });
}
