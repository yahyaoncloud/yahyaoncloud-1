import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData, useActionData, Form, useNavigation } from '@remix-run/react';
import { getLinktree, getLinktreeUrl, updateLinktreeQR } from '~/Services/linktree.prisma.server';
import { BusinessCard } from '~/components/BusinessCard';
import { FlipBusinessCard } from '~/components/FlipBusinessCard';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Download, RefreshCw, Upload, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const linktree = await getLinktree();
  const linktreeUrl = getLinktreeUrl(linktree.shortCode || "");

  // Generate QR Code if not already saved
  let qrCodeDataUri = linktree.qrCodeUrl;
  
  if (!qrCodeDataUri) {
    try {
      qrCodeDataUri = await QRCode.toDataURL(linktreeUrl, {
        margin: 1,
        width: 200,
        color: {
          dark: '#4c1d95', // Violet-900 for high contrast + theme match
          light: '#FFFFFF'
        }
      });
    } catch (err) {
      console.error("QR Gen Error", err);
    }
  }

  return json({ linktree, linktreeUrl, qrCodeDataUri });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  
  const linktree = await getLinktree();
  const linktreeUrl = getLinktreeUrl(linktree.shortCode || "");

  if (intent === "regenerate") {
    // Regenerate QR from linktree URL
    try {
      const qrCodeDataUri = await QRCode.toDataURL(linktreeUrl, {
        margin: 1,
        width: 200,
        color: {
          dark: '#4c1d95', // Violet-900
          light: '#FFFFFF'
        }
      });
      
      await updateLinktreeQR(linktree.id, qrCodeDataUri);
      return json({ success: true, message: "QR code regenerated!" });
    } catch (err) {
      return json({ success: false, error: "Failed to regenerate QR code" });
    }
  }

  if (intent === "custom-url") {
    // Use custom QR image URL
    const customUrl = formData.get("customUrl") as string;
    if (!customUrl) {
      return json({ success: false, error: "Please provide a URL" });
    }
    
    await updateLinktreeQR(linktree.id, customUrl);
    return json({ success: true, message: "Custom QR code saved!" });
  }

  if (intent === "custom-upload") {
    // Handle base64 upload from client
    const base64Data = formData.get("base64Data") as string;
    if (!base64Data) {
      return json({ success: false, error: "No image data received" });
    }
    
    await updateLinktreeQR(linktree.id, base64Data);
    return json({ success: true, message: "QR code uploaded!" });
  }

  return json({ success: false, error: "Invalid action" });
};

export default function AdminBusinessCard() {
  const { linktree, linktreeUrl, qrCodeDataUri } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  const [customUrl, setCustomUrl] = useState("");

  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success && 'message' in actionData) {
      toast.success(actionData.message as string);
    }
    if (actionData && 'error' in actionData && actionData.error) {
      toast.error(actionData.error as string);
    }
  }, [actionData]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Submit via hidden form
      const form = document.createElement('form');
      form.method = 'POST';
      form.innerHTML = `
        <input type="hidden" name="intent" value="custom-upload" />
        <input type="hidden" name="base64Data" value="${base64}" />
      `;
      document.body.appendChild(form);
      form.submit();
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
      {/* Print Styles */}
      <style>{`
        @media print {
          nav, aside, header, .no-print {
            display: none !important;
          }
          body { margin: 0; padding: 0; background: white; }
          .print-container { padding: 0 !important; margin: 0 !important; }
        }
      `}</style>
      
      <div className="max-w-4xl mx-auto p-8 space-y-10 print-container">
        
        {/* Header */}
        <div className="no-print flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Business Card</h1>
            <p className="text-zinc-500 text-sm mt-1">Minimalist design with QR code</p>
          </div>
          <Button onClick={() => window.print()} variant="outline" className="gap-2">
            <Download size={16} />
            Print / Save PDF
          </Button>
        </div>

        {/* QR Code Settings */}
        <section className="no-print bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">QR Code</h3>
          
          <div className="flex gap-6 items-start">
            {/* Current QR Preview */}
            <div className="w-24 h-24 bg-white rounded-lg p-1 border border-zinc-200 dark:border-zinc-700 flex-shrink-0">
              {qrCodeDataUri ? (
                <img src={qrCodeDataUri} alt="QR" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">No QR</div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex-1 space-y-4">
              {/* Regenerate */}
              <Form method="post">
                <input type="hidden" name="intent" value="regenerate" />
                <Button type="submit" variant="outline" size="sm" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  Regenerate from {linktreeUrl.replace(/^https?:\/\//, '')}
                </Button>
              </Form>
              
              {/* Upload Image */}
              <div>
                <Label htmlFor="qr-upload" className="text-xs text-zinc-500 mb-1 block">Upload custom QR image</Label>
                <div className="flex gap-2">
                  <Input 
                    id="qr-upload"
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload}
                    className="text-xs"
                  />
                </div>
              </div>
              
              {/* Or use URL */}
              <Form method="post" className="flex gap-2">
                <input type="hidden" name="intent" value="custom-url" />
                <Input 
                  name="customUrl"
                  type="url" 
                  placeholder="Or paste image URL..."
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="text-sm flex-1"
                />
                <Button type="submit" size="sm" variant="secondary" disabled={isSubmitting || !customUrl}>
                  Use URL
                </Button>
              </Form>
            </div>
          </div>
        </section>

        {/* Interactive Flip Card */}
        <section className="no-print space-y-4">
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Interactive Preview</h2>
          <p className="text-sm text-zinc-500">Click the card to flip between front and back</p>
          <div className="bg-zinc-900 rounded-2xl p-12 flex justify-center items-center">
            <FlipBusinessCard 
              profile={linktree} 
              qrCodeUrl={qrCodeDataUri || ""} 
              linktreeUrl={linktreeUrl}
            />
          </div>
        </section>

        {/* Printable Version */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 no-print">Printable Version</h2>
          <p className="text-sm text-zinc-500 no-print">Front and back side by side (7" x 2" total)</p>
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-8 flex justify-center items-center overflow-auto">
            <BusinessCard 
              profile={linktree} 
              qrCodeUrl={qrCodeDataUri || ""} 
              linktreeUrl={linktreeUrl}
            />
          </div>
        </section>

        {/* Print Instructions */}
        <section className="no-print bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-3">Print Instructions</h3>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>• Use "Save as PDF" option in print dialog</li>
            <li>• Enable "Background graphics" in print settings</li>
            <li>• Cut cards along the center line (each side is 3.5" × 2")</li>
            <li>• Print on cardstock (300gsm recommended)</li>
          </ul>
        </section>
        
      </div>
    </div>
  );
}
