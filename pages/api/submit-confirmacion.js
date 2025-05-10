import { google } from 'googleapis';

export default async function handler(req, res) {
  const { datos } = req.body;

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
    range: `${sheetName}!A1:G`,
  });

  const [headers, ...rows] = result.data.values;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const id = row[5]; // ID PROFESOR

    const match = datos.find(d =>
      d.idBloque === row[3] && d.codigo === id
    );

    if (match) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: `${sheetName}!G${i + 2}`, // columna G = 7ma
        valueInputOption: 'RAW',
        requestBody: {
          values: [[match.estado]],
        },
      });
    }
  }

  res.status(200).json({ success: true });
}
