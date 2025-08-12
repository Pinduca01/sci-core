import { supabase } from '../supabase';

/**
 * Faz upload de um arquivo (Blob) para o Supabase Storage
 * @param path - Caminho onde o arquivo será salvo (ex: 'org/123/occurrences/456/snapshot.png')
 * @param file - Arquivo Blob para upload
 * @returns Promise<string> - URL pública do arquivo
 */
export async function uploadToSupabase(path: string, file: Blob): Promise<string> {
  try {
    // Fazer upload do arquivo
    const { data, error } = await supabase.storage
      .from('occurrences')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Erro no upload:', error);
      throw new Error(`Erro ao fazer upload: ${error.message}`);
    }

    // Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from('occurrences')
      .getPublicUrl(path);

    if (!publicUrlData?.publicUrl) {
      throw new Error('Erro ao obter URL pública do arquivo');
    }

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Erro no uploadToSupabase:', error);
    throw error;
  }
}

/**
 * Gera snapshot estático do mapa usando MapTiler Static Maps API
 * @param lat - Latitude
 * @param lng - Longitude
 * @param zoom - Nível de zoom
 * @param width - Largura da imagem (padrão: 800)
 * @param height - Altura da imagem (padrão: 600)
 * @returns Promise<Blob> - Blob da imagem
 */
export async function generateMapSnapshot(
  lat: number,
  lng: number,
  zoom: number,
  width: number = 800,
  height: number = 600
): Promise<Blob> {
  const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  
  if (!mapTilerKey) {
    throw new Error('NEXT_PUBLIC_MAPTILER_KEY não configurada');
  }

  // URL da API do MapTiler Static Maps
  const staticMapUrl = `https://api.maptiler.com/maps/satellite/static/${lng},${lat},${zoom}/${width}x${height}.png?key=${mapTilerKey}&markers=${lng},${lat},red`;

  try {
    const response = await fetch(staticMapUrl);
    
    if (!response.ok) {
      throw new Error(`Erro na API do MapTiler: ${response.status} ${response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Erro ao gerar snapshot do mapa:', error);
    throw error;
  }
}