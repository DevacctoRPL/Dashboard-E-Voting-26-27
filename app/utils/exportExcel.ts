import * as XLSX from 'xlsx'

export interface ExportRow {
  'No': number
  'NISN': string
  'Nama': string
  'Kelas': string
  'Pilihan OSIS': string
  'Pilihan MPK': string
  'Status': string
}

export function exportSiswaToExcel(rows: ExportRow[], sheetName = 'Data Pemilih') {
  const timestamp = new Date().toISOString().slice(0, 10)
  const worksheet = XLSX.utils.json_to_sheet(rows)
  worksheet['!cols'] = [
    { wch: 5 },
    { wch: 14 },
    { wch: 22 },
    { wch: 8 },
    { wch: 24 },
    { wch: 24 },
    { wch: 14 }
  ]
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, `data-pemilih-${timestamp}.xlsx`)
}
