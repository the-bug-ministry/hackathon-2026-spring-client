/** Расширение .txt (без учёта регистра) — для клиента и согласования с бэкендом */
export function isTxtFile(file: File): boolean {
  return file.name.toLowerCase().endsWith(".txt")
}
