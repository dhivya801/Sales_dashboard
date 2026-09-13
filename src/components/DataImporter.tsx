import React, { useState } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import type { SalesRecord, QualityReport } from '../types/sales';

import { validateAndCleanRecord, autoCleanDataset, computeQualityReport, autoMapHeaders } from '../utils/dataCleaner';

interface DataImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (records: SalesRecord[]) => void;
}

export const DataImporter: React.FC<DataImporterProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [parsedRecords, setParsedRecords] = useState<SalesRecord[] | null>(null);
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;


  const handleFileUpload = (file: File) => {
    setIsProcessing(true);
    setFileName(file.name);

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    
    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet);

          processParsedRows(jsonRows);
        } catch (err) {
          alert('Error reading Excel file. Please ensure it is a valid .xlsx or .xls file.');
          setIsProcessing(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // CSV file
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          processParsedRows(results.data);
        },
        error: () => {
          alert('Error reading CSV file.');
          setIsProcessing(false);
        },
      });
    }
  };

  const processParsedRows = (rows: any[]) => {
    if (!rows.length) {
      alert('The uploaded file appears to be empty.');
      setIsProcessing(false);
      return;
    }

    const map = autoMapHeaders(rows[0]);
    const cleaned = rows.map((row, idx) => validateAndCleanRecord(row, idx, map));
    setParsedRecords(cleaned);
    setQualityReport(computeQualityReport(cleaned));
    setIsProcessing(false);
  };


  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleAutoCleanAndApply = () => {
    if (!parsedRecords) return;
    const autoCleaned = autoCleanDataset(parsedRecords);
    onImportComplete(autoCleaned);
    onClose();
  };

  const handleApplyAsIs = () => {
    if (!parsedRecords) return;
    onImportComplete(parsedRecords);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-3xl rounded-2xl border border-gray-700/80 p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Import Sales Data</h2>
              <p className="text-xs text-gray-400">Upload Excel (.xlsx, .xls) or CSV with automatic data validation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="py-6 overflow-y-auto space-y-6 flex-1">
          {!parsedRecords ? (
            /* Upload Drop Area */
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-700 hover:border-blue-500/80 rounded-2xl p-10 text-center transition-all bg-gray-900/40 hover:bg-blue-950/20 group cursor-pointer"
            >
              <input
                type="file"
                id="fileInput"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                }}
              />
              <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center">
                <div className="p-4 rounded-2xl bg-gray-800/80 group-hover:bg-blue-600/20 text-blue-400 mb-4 transition-transform group-hover:scale-110">
                  <FileSpreadsheet className="h-10 w-10" />
                </div>
                <h3 className="text-sm font-semibold text-gray-200">
                  {isProcessing ? 'Processing File...' : 'Drag & Drop your file here, or click to browse'}
                </h3>
                <p className="text-xs text-gray-400 mt-1 max-w-sm">
                  Supports standard sales columns: Date, Product, Category, Quantity, Unit Price, Revenue, Region, Salesperson
                </p>
                <div className="flex gap-3 mt-4">
                  <span className="text-[11px] px-2.5 py-1 rounded-md bg-gray-800 text-gray-300 font-mono">.xlsx</span>
                  <span className="text-[11px] px-2.5 py-1 rounded-md bg-gray-800 text-gray-300 font-mono">.csv</span>
                </div>
              </label>
            </div>
          ) : (
            /* File Analyzed & Quality Preview */
            <div className="space-y-6">
              {/* File Info */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-900/80 border border-gray-800">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-400" />
                  <div>
                    <div className="text-sm font-semibold text-white">{fileName}</div>
                    <div className="text-xs text-gray-400">{parsedRecords.length} sales rows loaded</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setParsedRecords(null);
                    setQualityReport(null);
                  }}
                  className="text-xs text-gray-400 hover:text-blue-400 underline"
                >
                  Choose another file
                </button>
              </div>

              {/* Quality Audit Cards */}
              {qualityReport && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                    Data Quality Audit Results
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                      <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        Clean Rows
                      </div>
                      <div className="text-lg font-bold text-white mt-1">{qualityReport.cleanRows}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30">
                      <div className="flex items-center gap-1.5 text-amber-400 text-xs font-medium">
                        <AlertTriangle className="h-4 w-4" />
                        Warnings / Outliers
                      </div>
                      <div className="text-lg font-bold text-white mt-1">{qualityReport.warningRows}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30">
                      <div className="flex items-center gap-1.5 text-rose-400 text-xs font-medium">
                        <X className="h-4 w-4" />
                        Missing Prices
                      </div>
                      <div className="text-lg font-bold text-white mt-1">{qualityReport.missingValuesCount}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30">
                      <div className="flex items-center gap-1.5 text-purple-400 text-xs font-medium">
                        <Sparkles className="h-4 w-4" />
                        Health Score
                      </div>
                      <div className="text-lg font-bold text-white mt-1">
                        {Math.round((qualityReport.cleanRows / (qualityReport.totalRows || 1)) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Preview Snippet Table */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Sample Record Preview (First 4 rows)
                </h4>
                <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900/60">
                  <table className="w-full text-xs text-left text-gray-300">
                    <thead className="bg-gray-800/80 text-gray-400 uppercase text-[10px]">
                      <tr>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Product</th>
                        <th className="px-3 py-2">Category</th>
                        <th className="px-3 py-2">Qty</th>
                        <th className="px-3 py-2">Price</th>
                        <th className="px-3 py-2">Revenue</th>
                        <th className="px-3 py-2">Region</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {parsedRecords.slice(0, 4).map((r, i) => (
                        <tr key={i} className="hover:bg-gray-800/40">
                          <td className="px-3 py-2 font-mono text-gray-400">{r.date}</td>
                          <td className="px-3 py-2 font-medium text-white">{r.productName}</td>
                          <td className="px-3 py-2">{r.category}</td>
                          <td className="px-3 py-2">{r.quantity}</td>
                          <td className="px-3 py-2">${r.unitPrice}</td>
                          <td className="px-3 py-2 text-emerald-400 font-semibold">${r.revenue}</td>
                          <td className="px-3 py-2">{r.region}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {parsedRecords && (
          <div className="pt-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={handleApplyAsIs}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium transition-colors"
            >
              Apply Raw Data (Without Auto-Clean)
            </button>
            
            <button
              onClick={handleAutoCleanAndApply}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              Auto-Clean & Load into Dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
