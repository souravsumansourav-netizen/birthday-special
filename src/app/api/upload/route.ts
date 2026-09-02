import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// A simple hardcoded passcode for the admin panel
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'firstfrost2026';

const uploadImage = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: storageError } = await supabase
    .storage
    .from('surprise-images')
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false
    });

  if (storageError) throw storageError;

  const { data: { publicUrl } } = supabase
    .storage
    .from('surprise-images')
    .getPublicUrl(fileName);

  return publicUrl;
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const passcode = formData.get('passcode');
    const title = formData.get('title') as string;
    const sub_text = formData.get('sub_text') as string | null;
    const image = formData.get('image') as File;
    const image2 = formData.get('image2') as File | null;

    if (passcode !== ADMIN_PASSCODE) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!title || !image) {
      return NextResponse.json({ error: 'Title and image are required' }, { status: 400 });
    }

    const publicUrl = await uploadImage(image);
    let publicUrl2 = null;
    if (image2 && image2.size > 0) {
      publicUrl2 = await uploadImage(image2);
    }

    // Insert into database
    const { data: dbData, error: dbError } = await supabase
      .from('surprises')
      .insert([
        {
          title: title,
          sub_text: sub_text || null,
          image_url: publicUrl,
          image_url_2: publicUrl2,
        }
      ])
      .select();

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, surprise: dbData[0] });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const passcode = formData.get('passcode');
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const sub_text = formData.get('sub_text') as string | null;
    const image = formData.get('image') as File | null;
    const image2 = formData.get('image2') as File | null;

    if (passcode !== ADMIN_PASSCODE) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!id || !title) {
      return NextResponse.json({ error: 'ID and title are required' }, { status: 400 });
    }

    const updateData: any = {
      title,
      sub_text: sub_text || null,
    };

    if (image && image.size > 0) {
      updateData.image_url = await uploadImage(image);
    }
    
    if (image2 && image2.size > 0) {
      updateData.image_url_2 = await uploadImage(image2);
    }

    const { data: dbData, error: dbError } = await supabase
      .from('surprises')
      .update(updateData)
      .eq('id', id)
      .select();

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, surprise: dbData[0] });

  } catch (error: any) {
    console.error('Update error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
