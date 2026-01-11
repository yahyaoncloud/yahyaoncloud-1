import { json, type ActionFunctionArgs } from '@remix-run/node';
import { uploadImage } from '~/utils/cloudinary.server';

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export async function action({ request }: ActionFunctionArgs) {
  // TODO: Add authentication check
  // const user = await requireAuth(request);
  // if (!user || user.role !== 'admin') {
  //   return json({ error: 'Unauthorized' }, { status: 401 });
  // }

  const formData = await request.formData();
  const file = formData.get('file') as File;

  // Validate file exists
  if (!file || !file.size) {
    return json({ error: 'No file provided' }, { status: 400 });
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return json({ 
      error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' 
    }, { status: 400 });
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return json({ 
      error: 'File too large. Maximum size is 5MB' 
    }, { status: 400 });
  }

  try {
    // Generate unique public ID with timestamp
    const timestamp = Date.now();
    const sanitizedName = file.name
      .split('.')[0]
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .substring(0, 50);
    const publicId = `blog-images/${timestamp}-${sanitizedName}`;

    // Upload to Cloudinary
    const result = await uploadImage(file, publicId);

    return json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    });

  } catch (error) {
    console.error('Image upload failed:', error);
    return json(
      { error: 'Failed to upload image. Please try again.' },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function loader() {
  return json({ error: 'Method not allowed' }, { status: 405 });
}
