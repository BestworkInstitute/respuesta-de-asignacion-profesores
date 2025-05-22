// /pages/api/submit-confirmacion.js
import { google } from 'googleapis';

export default async function handler(req, res) {
  const { datos } = req.body;

  if (!Array.isArray(datos) || datos.length === 0) {
    return res.status(400).json({ error: 'Faltan los datos de confirmación' });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const sheetName = 'TALLERES ASIGNADOS PROFESORES';

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${sheetName}!A1:H`,
    });

    const [headers, ...rows] = result.data.values;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const idBloque = row[3];  // D = ID Bloque
      const codigo = row[6];    // G = Código profesor

      const match = datos.find(d => d.idBloque === idBloque && d.codigo === codigo);

      if (match) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: process.env.SPREADSHEET_ID,
          range: `${sheetName}!H${i + 2}`, // Columna H = 8va columna (índice 7)
          valueInputOption: 'RAW',
          requestBody: {
            values: [[match.estado]],
          },
        });
      }
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('💥 Error en /submit-confirmacion:', err);
    res.status(500).json({ error: 'Error al actualizar confirmación' });
  }
}
