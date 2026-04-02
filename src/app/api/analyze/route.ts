import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('mri_image') as Blob;

    const pythonFormData = new FormData();
    pythonFormData.append('file', file);

    const response = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      body: pythonFormData,
    });

    if (!response.ok) return NextResponse.json({ success: false }, { status: 500 });

    const data = await response.json();
    return NextResponse.json(data);

  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}