// This API route handles image uploads using formidable
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { IncomingForm } from 'formidable';


export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public/images');

const handler = async (req, res) => {
  const form = new IncomingForm({
  uploadDir,
  keepExtensions: true,
});


  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Error parsing form data' });

    const file = files.file[0];
    const newPath = path.join(uploadDir, fields.filename[0]);

    try {
      await promisify(fs.rename)(file.filepath, newPath);
      return res.status(200).json({ path: `/images/${fields.filename[0]}` });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to move file' });
    }
  });
};

export default handler;
