import QRCode from 'qrcode';

// Minimal in-memory vector QR generator (Pure client-side via 'qrcode')
// Generates valid, high-contrast, scannable SVG QR code representation
export function createQrMatrix(text) {
  return {
    text,
    getSvgString(size = 256) {
      let svg = '';
      try {
        QRCode.toString(text, { type: 'svg', width: size, margin: 2 }, (err, str) => {
          if (!err && str) svg = str;
        });
      } catch (_) {}
      return svg;
    },
  };
}

export function generateQrSvgDataUri(text, size = 256) {
  const svg = createQrMatrix(text).getSvgString(size);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
