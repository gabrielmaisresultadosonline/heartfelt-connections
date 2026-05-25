type CutoutProgress = {
  message: string;
  progress: number;
};

function bytesToBase64(bytes: Uint8Array) {
  let output = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    output += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(output);
}

export async function createPhotoCutout(
  file: File,
  onProgress?: (progress: CutoutProgress) => void,
) {
  const { removeBackground } = await import("@imgly/background-removal");

  onProgress?.({ message: "Preparando o recorte da sua foto...", progress: 8 });

  const blob = await removeBackground(file, {
    device: "cpu",
    model: "isnet_quint8",
    output: {
      format: "image/png",
      quality: 1,
    },
    progress: (_key, current, total) => {
      const ratio = total > 0 ? current / total : 0;
      onProgress?.({
        message: "Baixando o motor de recorte da foto...",
        progress: 10 + Math.round(ratio * 55),
      });
    },
  });

  onProgress?.({ message: "Finalizando sua foto sem fundo...", progress: 88 });

  const bytes = new Uint8Array(await blob.arrayBuffer());

  return {
    base64: bytesToBase64(bytes),
    mime: (blob.type || "image/png") as "image/png",
  };
}
