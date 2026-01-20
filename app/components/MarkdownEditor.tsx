import { useState, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from './ui/button';
import { 
  Bold, 
  Italic, 
  Code, 
  Link as LinkIcon, 
  List, 
  ListOrdered, 
  Quote, 
  Heading1, 
  Heading2, 
  Heading3,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder?: string;
  height?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  onImageUpload,
  placeholder = 'Write your content in Markdown...',
  height = '500px'
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Insert text at cursor position
  const insertAtCursor = useCallback((before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || placeholder;
    
    const newText = 
      value.substring(0, start) + 
      before + selectedText + after + 
      value.substring(end);
    
    onChange(newText);

    // Set cursor position after insert
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [value, onChange]);

  // Toolbar actions
  const toolbarActions = [
    { icon: Bold, label: 'Bold', action: () => insertAtCursor('**', '**', 'bold text') },
    { icon: Italic, label: 'Italic', action: () => insertAtCursor('*', '*', 'italic text') },
    { icon: Code, label: 'Code', action: () => insertAtCursor('`', '`', 'code') },
    { icon: LinkIcon, label: 'Link', action: () => insertAtCursor('[', '](url)', 'link text') },
    { type: 'divider' },
    { icon: Heading1, label: 'H1', action: () => insertAtCursor('\n# ', '\n', 'Heading 1') },
    { icon: Heading2, label: 'H2', action: () => insertAtCursor('\n## ', '\n', 'Heading 2') },
    { icon: Heading3, label: 'H3', action: () => insertAtCursor('\n### ', '\n', 'Heading 3') },
    { type: 'divider' },
    { icon: List, label: 'Bullet List', action: () => insertAtCursor('\n- ', '\n', 'list item') },
    { icon: ListOrdered, label: 'Numbered List', action: () => insertAtCursor('\n1. ', '\n', 'list item') },
    { icon: Quote, label: 'Quote', action: () => insertAtCursor('\n> ', '\n', 'quote') },
  ];

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageUpload) return;

    setUploading(true);
    try {
      const url = await onImageUpload(file);
      insertAtCursor(`\n![${file.name.split('.')[0]}](${url})\n`, '', '');
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle drag and drop
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/') || !onImageUpload) return;

    setUploading(true);
    try {
      const url = await onImageUpload(file);
      insertAtCursor(`\n![${file.name.split('.')[0]}](${url})\n`, '', '');
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const containerClasses = isFullscreen 
    ? 'fixed inset-0 z-50 bg-white dark:bg-zinc-900' 
    : '';

  return (
    <div 
      className={`border rounded-lg overflow-hidden flex flex-col ${containerClasses}`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-gray-50 dark:bg-zinc-800 border-b flex-wrap">
        {toolbarActions.map((item, index) => 
          item.type === 'divider' ? (
            <div key={index} className="w-px h-6 bg-gray-300 dark:bg-zinc-600 mx-1" />
          ) : (
            <Button
              key={index}
              type="button"
              variant="ghost"
              size="sm"
              onClick={item.action}
              title={item.label}
              className="p-2 h-8 w-8"
            >
              <item.icon className="w-4 h-4" />
            </Button>
          )
        )}

        {/* Image Upload */}
        {onImageUpload && (
          <>
            <div className="w-px h-6 bg-gray-300 dark:bg-zinc-600 mx-1" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Insert Image"
              className="p-2 h-8"
            >
              <ImageIcon className="w-4 h-4 mr-1" />
              {uploading ? 'Uploading...' : 'Image'}
            </Button>
          </>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Preview Toggle */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          title={showPreview ? 'Hide Preview' : 'Show Preview'}
          className="p-2 h-8"
        >
          {showPreview ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
          Preview
        </Button>

        {/* Fullscreen Toggle */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          className="p-2 h-8 w-8"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>

      {/* Editor and Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Markdown Editor */}
        <div 
          className={`${showPreview ? 'w-1/2 border-r' : 'w-full'} flex flex-col`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="px-2 py-1 bg-gray-100 dark:bg-zinc-900 border-b text-xs font-medium text-gray-500">
            Markdown
          </div>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 w-full p-4 resize-none focus:outline-none font-mono text-sm bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100"
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="w-1/2 flex flex-col overflow-hidden">
            <div className="px-2 py-1 bg-gray-100 dark:bg-zinc-900 border-b text-xs font-medium text-gray-500">
              Preview
            </div>
            <div className="flex-1 overflow-auto p-4 bg-white dark:bg-zinc-950">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {value || '*No content yet...*'}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-2 py-1 bg-gray-50 dark:bg-zinc-800 border-t text-xs text-gray-500 flex items-center justify-between">
        <span>{value.length} characters</span>
        <span>{value.split(/\s+/).filter(Boolean).length} words</span>
        {uploading && <span className="text-blue-600">Uploading image...</span>}
      </div>
    </div>
  );
}
