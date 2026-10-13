import QRCode from 'qrcode';

export interface QrMatrix {
  text: string;
  getSvgString(size?: number): string;
}

export function createQrMatrix(text: string): QrMatrix {
  return {
    text,
    getSvgString(size: number = 256): string {
      let svg = '';
      try {
        QRCode.toString(text, { type: 'svg', width: size, margin: 2 }, (err, str) => {
          if (!err && str) svg = str;
        });
      } catch {
        // Fallback gracefully on parsing error
      }
      return svg;
    },
  };
}

export function generateQrSvgDataUri(text: string, size: number = 256): string {
  const svg = createQrMatrix(text).getSvgString(size);
  if (!svg) {
    const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="#f3f4f6"/></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fallbackSvg)}`;
  }
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
