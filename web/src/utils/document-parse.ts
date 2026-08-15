export const getMimeType = (file: File): string => {
  if (file.type) return file.type;
  if (file.name.endsWith(".pdf")) return "application/pdf";
  if (file.name.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return "";
};
