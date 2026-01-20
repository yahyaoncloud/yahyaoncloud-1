// Image Upload Component for Homepage Cards
import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadFile, validateFileType, validateFileSize } from '~/utils/supabase-storage.client';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
  bucket?: string;
}

export default function ImageUpload({ 
  onUploadComplete, 
  currentImageUrl,
  bucket = 'homepage-cards'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validateFileType(file, allowedTypes)) {
      setError('Please upload a JPG, PNG, or WebP image');
      return;
    }

    // Validate file size (2MB max)
    if (!validateFileSize(file, 2)) {
      setError('Image must be less than 2MB');
      return;
    }

    try {
      setUploading(true);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name}`;
      const publicUrl = await uploadFile(file, bucket, fileName);

      onUploadComplete(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploadComplete('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-zinc-300 dark:border-zinc-700 group-hover:opacity-75 transition-opacity"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-lg">
             <span className="text-white font-medium text-sm flex items-center gap-2">
                <Upload size={16} /> Change Image
             </span>
          </div>
          <button
            onClick={(e) => {
                e.stopPropagation();
                handleRemove();
            }}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors z-10"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-8 text-center cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
        >
          <ImageIcon size={48} className="mx-auto mb-4 text-zinc-400" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
            Click to upload image
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            JPG, PNG or WebP • Max 2MB • 1200x630px recommended
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploading && (
        <p className="text-sm text-indigo-600 dark:text-indigo-400">Uploading...</p>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
