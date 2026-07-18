import { Router, Request, Response } from 'express';
import https from 'https';
import http from 'http';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

// ---------- Cloudinary fetch ----------

function fetchCloudinary(url: URL): Promise<{ stream: http.IncomingMessage; contentType: string }> {
  return new Promise((resolve, reject) => {
    const fetcher = url.protocol === 'https:' ? https : http;
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
      },
    };

    fetcher.get(options, (cloudinaryRes) => {
      const status = cloudinaryRes.statusCode || 0;

      if (status >= 300 && status < 400 && cloudinaryRes.headers.location) {
        cloudinaryRes.resume();
        try {
          const redirectUrl = new URL(cloudinaryRes.headers.location, url.origin);
          return resolve(fetchCloudinary(redirectUrl));
        } catch {
          return reject(new Error(`Invalid redirect: ${cloudinaryRes.headers.location}`));
        }
      }

      if (status !== 200) {
        cloudinaryRes.resume();
        return reject(new Error(`Cloudinary returned status ${status}`));
      }

      resolve({ stream: cloudinaryRes, contentType: cloudinaryRes.headers['content-type'] || 'application/octet-stream' });
    }).on('error', (err) => reject(new Error(`Network error: ${err.message}`)));
  });
}

// ---------- Supabase fetch ----------

async function fetchSupabase(supabaseUrl: string): Promise<{ stream: http.IncomingMessage; contentType: string; filename: string } | null> {
  if (!supabase) return null;

  // Format: supabase://bucket/path
  const parts = supabaseUrl.replace('supabase://', '').split('/');
  const bucket = parts[0];
  const path = parts.slice(1).join('/');
  if (!bucket || !path) return null;

  const filename = path.split('/').pop() || 'download';

  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);

  if (error || !data) {
    console.error('Supabase download error:', error?.message);
    return null;
  }

  // Convert the Blob to a ReadableStream-compatible format
  const buffer = Buffer.from(await data.arrayBuffer());
  const { Readable } = require('stream');
  const stream = Readable.from(buffer);

  return {
    stream: stream as unknown as http.IncomingMessage,
    contentType: data.type || 'application/octet-stream',
    filename,
  };
}

// ---------- Main download endpoint ----------

router.get('/download', async (req: Request, res: Response) => {
  const fileUrl = req.query.url as string;
  const isPreview = req.query.preview === '1' || req.query.preview === 'true';
  if (!fileUrl) {
    return res.status(400).json({ message: 'Missing url query parameter' });
  }

  const disposition = isPreview ? 'inline' : 'attachment';

  // --- Supabase private bucket ---
  if (fileUrl.startsWith('supabase://')) {
    const result = await fetchSupabase(fileUrl);
    if (result) {
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `${disposition}; filename="${result.filename}"`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      result.stream.pipe(res);
      return;
    }
    return res.status(502).json({ message: 'Failed to fetch file from Supabase' });
  }

  // --- Cloudinary ---
  if (!fileUrl.includes('cloudinary.com')) {
    return res.status(400).json({ message: 'Invalid URL' });
  }

  const filename = decodeURIComponent(fileUrl.split('/').pop()?.split('?')[0] || 'download');

  try {
    const { stream, contentType } = await fetchCloudinary(new URL(fileUrl));
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `${disposition}; filename="${filename}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    stream.pipe(res);
  } catch {
    if (!res.headersSent) {
      res.redirect(fileUrl);
    }
  }
});

export default router;
