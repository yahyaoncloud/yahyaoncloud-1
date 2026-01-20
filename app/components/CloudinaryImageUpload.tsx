import { useState, useRef, useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface CloudinaryImageUploadProps {
  slug: string;
  type: "cover" | "gallery";
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string; // For cover image preview
  label?: string;
  className?: string; // Additional classes
}

export default function CloudinaryImageUpload({
  slug,
  type,
  onUploadComplete,
  currentImageUrl,
  label = "Upload Image",
  className = ""
}: CloudinaryImageUploadProps) {
  const fetcher = useFetcher();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [isHovering, setIsHovering] = useState(false);

  const isUploading = fetcher.state !== "idle";

  useEffect(() => {
    // Handle fetcher response
    if (fetcher.state === "idle" && fetcher.data) {
        let data: any = fetcher.data;
        
        // Handle Single Fetch raw stream if decoding failed on client side
        // Format: [{"_1":rootIndex}, ...keys/values]
        // Example: [{"_1":2},"data",{"_3":4,"_5":6,"_7":8},"success",true,"url","https..."]
        if (Array.isArray(data) && data.length > 0 && data[0]?._1) {
            try {
                const rootIndex = data[0]._1;
                const rootObject = data[rootIndex];
                
                // Reconstruct object from the stream map
                const decoded: any = {};
                if (rootObject && typeof rootObject === 'object') {
                    Object.keys(rootObject).forEach(key => {
                        if (key.startsWith('_')) {
                            const keyIndex = parseInt(key.substring(1)); // e.g. _3 -> 3
                            const valIndex = rootObject[key]; // e.g. 4
                            
                            const realKey = data[keyIndex];
                            const realVal = data[valIndex];
                            decoded[realKey] = realVal;
                        }
                    });
                     console.log("Decoded raw stream:", decoded);
                     data = decoded;
                }
            } catch (e) {
                console.error("Failed to decode raw stream:", e);
            }
        }

        if (data.success && data.url) {
            toast.success("Image uploaded successfully!");
            onUploadComplete(data.url);
            if (type === 'cover') {
                setPreview(data.url);
            }
        } else if (data.error) {
            console.error("Upload error:", data.error);
            toast.error(data.error);
        } else {
             // If we got here, it's neither success nor explicit error, so log it
             console.log("Unexpected upload response:", data);
        }
    }
  }, [fetcher.state, fetcher.data]);

  // Update preview if prop changes
  useEffect(() => {
     if (currentImageUrl) setPreview(currentImageUrl);
  }, [currentImageUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!slug) {
        toast.error("Please enter a Title first to generate a Slug.");
        return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
    }

    // Determine type optimistically for preview
    if (type === 'cover') {
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
    }

    // Submit
    const formData = new FormData();
    formData.append("file", file);
    formData.append("slug", slug);
    formData.append("type", type);
    
    fetcher.submit(formData, { 
        method: "post", 
        action: "/admin/api/upload", 
        encType: "multipart/form-data" 
    });
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onUploadComplete(""); // Clear URL
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Hidden Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Preview / upload area */}
      {preview && type === 'cover' ? (
        <div 
            className="relative group cursor-pointer rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800"
            onClick={() => fileInputRef.current?.click()}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
          <img
            src={preview}
            alt="Preview"
            className={`w-full h-48 object-cover transition-opacity ${isUploading ? 'opacity-50' : ''}`}
          />
          
          {(isHovering || isUploading) && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity">
                {isUploading ? (
                    <Loader2 className="animate-spin text-white" />
                ) : (
                    <span className="text-white font-medium flex items-center gap-2">
                        <Upload size={16} /> Change
                    </span>
                )}
             </div>
          )}
          
          {!isUploading && (
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-md hover:bg-red-600 transition-colors z-10 opacity-0 group-hover:opacity-100"
                title="Remove image"
              >
                <X size={14} />
              </button>
          )}
        </div>
      ) : (
        <div
          onClick={() => {
              if (!slug) {
                toast.error("Please enter a Title first."); 
                return;
              }
              fileInputRef.current?.click();
          }}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
            ${isUploading ? 'bg-zinc-50 dark:bg-zinc-900 border-zinc-300' : 'hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 border-zinc-300 dark:border-zinc-700'}
          `}
        >
          {isUploading ? (
             <div className="flex flex-col items-center text-zinc-500">
                <Loader2 className="animate-spin mb-2" size={24} />
                <p className="text-sm">Uploading...</p>
             </div>
          ) : (
             <div className="flex flex-col items-center text-zinc-500 dark:text-zinc-400">
                <Upload size={24} className="mb-2" />
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{label}</p>
                <p className="text-xs mt-1">Click to upload (Max 5MB)</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
