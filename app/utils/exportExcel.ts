// ponytail: dynamic import — xlsx ~800KB, hanya saat klik Export.
export interface ExportRow {
  'No': number
  'NIS': string
  'Nama': string
  'Role': string
  'Status': string
  'Info Voting': string
  'Jenis Dipilih': string
}

export async function exportSiswaToExcel(rows: ExportRow[], sheetName = 'Data Pemilih') {
  const XLSX = await import('xlsx')
  const timestamp = new Date().toISOString().slice(0, 10)
  const worksheet = XLSX.utils.json_to_sheet(rows)
  worksheet['!cols'] = [
    { wch: 5 },
    { wch: 14 },
    { wch: 24 },
    { wch: 10 },
    { wch: 14 },
    { wch: 22 },
    { wch: 18 }
  ]
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, `data-pemilih-${timestamp}.xlsx`)
}
