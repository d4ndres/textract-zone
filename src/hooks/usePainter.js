import imageCompression from 'browser-image-compression';

export async function comprimirImagen(file) {
  const opciones = {
      maxSizeMB: 1, // Tamaño máximo en MB
      maxWidthOrHeight: 800, // Dimensión máxima
      useWebWorker: true,
  };
  try {
    const imageCompressed = await imageCompression(file, opciones);
    const originalSize = file.size;
    const compressedSize = imageCompressed.size;
    const compressionPercentage = ((originalSize - compressedSize) / originalSize) * 100;
    console.log(`Compression Percentage: ${compressionPercentage.toFixed(2)}%`);  
    return imageCompressed;
    
  } catch (error) {
      console.error('Error al comprimir la imagen:', error);
  }
}

export function quitarTildesYEspacios(input) {
  let sinTildes = input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let sinEspacios = sinTildes.replace(/\s+/g, "");
  return sinEspacios;
}
