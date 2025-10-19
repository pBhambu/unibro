import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Try to use pdf-parse if available, otherwise return error with instructions
    try {
      const pdfParseModule = await import('pdf-parse') as any;
      const pdfParse = pdfParseModule.default || pdfParseModule;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const data = await pdfParse(buffer);
      return NextResponse.json({ text: data.text });
    } catch (importErr: any) {
      if (importErr.code === 'MODULE_NOT_FOUND') {
        return NextResponse.json({ 
          error: 'PDF parsing not configured', 
          message: 'Run: npm install pdf-parse canvas' 
        }, { status: 501 });
      }
      throw importErr;
    }
  } catch (err: any) {
    console.error('PDF parse error:', err);
    return NextResponse.json({ error: 'Failed to parse PDF', details: err.message }, { status: 500 });
  }
}
