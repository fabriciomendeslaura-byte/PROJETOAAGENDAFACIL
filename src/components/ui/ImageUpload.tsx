"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('logos')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      onChange(publicUrl);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert("Erro ao fazer upload da imagem.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        className={`relative w-32 h-32 rounded-full overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 transition-all ${!disabled && "hover:border-[#0284c7] hover:bg-blue-50/30 cursor-pointer"}`}
      >
        {/* Transparent input overlay for better mobile touch support */}
        {!disabled && !loading && (
          <input
            type="file"
            onChange={handleUpload}
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            disabled={disabled || loading}
            title="Escolher imagem"
          />
        )}

        {value ? (
          <>
            <img src={value} alt="Logo preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center z-10">
              <Upload className="w-6 h-6 text-white" />
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute top-1 right-1 p-1.5 bg-white rounded-full shadow-md text-slate-500 hover:text-red-500 transition-colors z-30"
                title="Remover imagem"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center text-slate-400">
            {loading ? (
              <Loader2 className="w-8 h-8 animate-spin text-[#0284c7]" />
            ) : (
              <>
                <ImageIcon className="w-8 h-8 mb-1" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-center px-2">Carregar Logo</span>
              </>
            )}
          </div>
        )}
      </div>

      {!value && !loading && (
        <div className="relative">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            disabled={disabled}
            className="flex items-center gap-2 pointer-events-none"
          >
            <Upload className="w-4 h-4" />
            Escolher Arquivo
          </Button>
          <input
            type="file"
            onChange={handleUpload}
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={disabled || loading}
          />
        </div>
      )}
      
      <p className="text-[10px] text-slate-400 text-center max-w-[200px]">
        Recomendado: Quadrado (1:1), PNG ou JPG de até 2MB.
      </p>
    </div>
  );
}
