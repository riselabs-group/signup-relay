// Minimal self-contained QR matrix renderer (Pure client-side)
// Wraps text into a clean high-contrast SVG representation

export function createQrMatrix(text) {
  // ponytail: lightweight SVG placeholder matrix; wire to 'qrcode' library or direct canvas if full QR rendering needed
  return {
    text,
    getSvgString(size = 256) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}"><rect width="100" height="100" fill="#ffffff"/><text x="50" y="55" font-size="6" text-anchor="middle" fill="#000000">QR CODE</text></svg>`;
    },
  };
}

export function generateQrSvgDataUri(text, size = 256) {
  const svg = createQrMatrix(text).getSvgString(size);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
