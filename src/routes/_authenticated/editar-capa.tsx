import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCoverSettings } from '@/hooks/useLibrary';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upsertCoverSettings, uploadCoverImage } from '@/services/library';
import type { Child } from '@/types';

// Predefined pastel colors for baby/parent theme
const PRESET_COLORS = [
  '#FFCDD2', // Soft Pink
  '#F8BBD0', // Light Purple
  '#E1BEE7', // Lavender
  '#BBDEFB', // Baby Blue
  '#C8E6C9', // Mint Green
  '#FFF9C4', // Light Yellow
  '#FFECB3', // Warm Orange
  '#D7CCC8', // Beige
];

// Delicate fonts suitable for babies/kids/maternity
const FONT_OPTIONS = [
  { label: 'Inter', value: 'Inter' },
  { label: 'Playfair Display', value: 'Playfair+Display' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Lora', value: 'Lora' },
  { label: 'Poppins', value: 'Poppins' },
];

export default function EditCoverPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const child = (window as any).currentChild as Child; // assume child is globally set when user arrives here
  const childId = child?.id ?? '';
  const { data: settings, isLoading } = useCoverSettings(childId);
  const [font, setFont] = useState(settings?.font ?? 'Inter');
  const [bgColor, setBgColor] = useState(settings?.background_color ?? '#FFFFFF');
  const [bgImagePath, setBgImagePath] = useState(settings?.background_image_path ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Load selected Google Font dynamically
  useEffect(() => {
    const linkId = 'google-font-link';
    const existing = document.getElementById(linkId);
    if (existing) existing.remove();
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    const fontParam = FONT_OPTIONS.find((f) => f.value === font)?.value || 'Inter';
    link.href = `https://fonts.googleapis.com/css2?family=${fontParam.replace(/\s+/g, '+')}:wght@300;400;500&display=swap`;
    document.head.appendChild(link);
  }, [font]);

  // Show image preview when a new file is selected
  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl('');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      let imagePath = bgImagePath;
      if (imageFile) {
        // upload image and get path
        imagePath = await uploadCoverImage(childId, imageFile);
      }
      await upsertCoverSettings(childId, { font, background_color: bgColor, background_image_path: imagePath });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coverSettings', childId] });
      navigate({ to: '/livro' });
    },
  });

  const handleSave = async () => {
    await saveMutation.mutateAsync();
  };

  if (isLoading) return <div className="flex items-center justify-center p-8">Carregando...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-display text-center">Editar Capa do Livro</h2>

      {/* Font selector */}
      <div className="space-y-2">
        <label className="block font-medium text-muted-foreground">Fonte</label>
        <select
          value={font}
          onChange={(e) => setFont(e.target.value)}
          className="w-full rounded border border-gold/30 bg-gold-soft/10 p-2 text-foreground"
        >
          {FONT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Color picker */}
      <div className="space-y-2">
        <label className="block font-medium text-muted-foreground">Cor de fundo</label>
        <div className="flex items-center gap-2">
          {/* Circle palette */}
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setBgColor(c)}
              className="size-8 rounded-full border border-gold/40"
              style={{ backgroundColor: c, border: c === bgColor ? '3px solid #ffd700' : undefined }}
            />
          ))}
          {/* Hex input */}
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="border border-gold/30 rounded p-1"
          />
          <input
            type="text"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-24 rounded border border-gold/30 bg-gold-soft/10 p-1 text-foreground"
            placeholder="#ffffff"
          />
        </div>
      </div>

      {/* Image upload */}
      <div className="space-y-2">
        <label className="block font-medium text-muted-foreground">Imagem de fundo (opcional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          className="block w-full text-foreground"
        />
        {(previewUrl || bgImagePath) && (
          <div className="mt-2 relative h-48 rounded border border-gold/30 overflow-hidden">
            <img
              src={previewUrl || ''}
              alt="Preview"
              className="object-cover w-full h-full"
            />
            {!previewUrl && bgImagePath && (
              <img
                src={bgImagePath.startsWith('http') ? bgImagePath : ''}
                alt="Current"
                className="object-cover w-full h-full absolute inset-0"
              />
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={() => navigate({ to: '/livro' })}
          className="px-4 py-2 rounded bg-gold-soft/20 text-gold border border-gold/30 hover:bg-gold hover:text-white transition"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saveMutation.isLoading}
          className="px-4 py-2 rounded bg-gold text-foreground border border-gold/40 hover:bg-gold-soft transition"
        >
          {saveMutation.isLoading ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </div>
  );
}
