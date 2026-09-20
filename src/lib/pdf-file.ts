export function pickPdfFile(files: FileList | File[] | null | undefined): File | undefined {
  if (!files) return undefined;
  return [...files].find((file) => file.type === 'application/pdf' || /\.pdf$/i.test(file.name));
}
