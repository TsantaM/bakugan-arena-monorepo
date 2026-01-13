export function setImageWithFallback(imgElement: HTMLImageElement | null, src: string, fallbackSrc: string, fallbackAlt: string) {
  if (!imgElement) return;

  imgElement.src = src;
  imgElement.alt = src;

  // Si l'image ne se charge pas, on met le fallback
  imgElement.onerror = () => {
    imgElement.src = fallbackSrc;
    imgElement.alt = fallbackAlt;
  };
}