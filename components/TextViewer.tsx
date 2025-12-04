import React, { useState } from 'react';
import { Transaction } from '../types';

interface StatementViewerProps {
  data: Transaction[];
  onClear: () => void;
}

export const StatementViewer: React.FC<StatementViewerProps> = ({ data, onClear }) => {
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedTable, setCopiedTable] = useState(false);

  const formatCurrency = (val?: number | null) => {
    if (val === undefined || val === null) return '';
    return new Intl.NumberFormat('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleCopyTable = async () => {
    try {
      // Generate Tab-Separated Values (TSV) for easy pasting into Excel/Google Sheets
      const headers = ['Date', 'Type', 'Details', 'Paid Out', 'In', 'Balance'];
      const tsvContent = [
        headers.join('\t'),
        ...data.map(row => {
          return [
            row.date,
            row.paymentType || '',
            (row.details || '').replace(/\t/g, ' ').replace(/\n/g, ' '), // Clean tabs/newlines
            row.paidOut || '',
            row.paidIn || '',
            row.balance || ''
          ].join('\t');
        })
      ].join('\n');
      
      await navigator.clipboard.writeText(tsvContent);
      setCopiedTable(true);
      setTimeout(() => setCopiedTable(false), 2000);
    } catch (err) {
      console.error('Failed to copy table: ', err);
    }
  };

  const handleDownloadCsv = () => {
    const headers = ['Date', 'Type', 'Details', 'Paid Out', 'In', 'Balance'];
    const csvContent = [
      headers.join(','),
      ...data.map(row => {
        return [
          `"${row.date}"`,
          `"${row.paymentType || ''}"`,
          `"${row.details.replace(/"/g, '""')}"`,
          row.paidOut || '',
          row.paidIn || '',
          row.balance || ''
        ].join(',');
      })
    ].join('\n');

    const element = document.createElement("a");
    const file = new Blob([csvContent], {type: 'text/csv'});
    element.href = URL.createObjectURL(file);
    element.download = "statement_export.csv";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50 gap-3">
        <div className="flex items-center gap-2">
           <div className="p-1.5 bg-green-100 rounded text-green-700">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
           </div>
          <span className="font-semibold text-slate-700 text-sm">Spreadsheet View ({data.length} rows)</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleCopyTable}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 hover:text-green-700 hover:border-green-300 transition-colors shadow-sm"
          >
            {copiedTable ? (
               <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Copied
               </>
            ) : (
               <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy for Excel
               </>
            )}
          </button>
          
          <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block"></div>

          <button 
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
          >
             CSV
          </button>
          <button 
            onClick={handleCopyJson}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
          >
             {copiedJson ? 'Copied' : 'JSON'}
          </button>
           <button 
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 rounded hover:bg-red-50 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto custom-scrollbar bg-white relative">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm text-slate-700">
            <tr>
              <th className="px-1 py-2 border border-slate-300 bg-slate-100 text-center w-8 text-xs font-normal text-slate-500">#</th>
              <th className="px-2 py-2 font-semibold border border-slate-300 w-24">Date</th>
              <th className="px-2 py-2 font-semibold border border-slate-300 w-16 text-center">Type</th>
              <th className="px-2 py-2 font-semibold border border-slate-300 min-w-[200px]">Details</th>
              <th className="px-2 py-2 font-semibold border border-slate-300 text-right w-24">Paid Out</th>
              <th className="px-2 py-2 font-semibold border border-slate-300 text-right w-24">In</th>
              <th className="px-2 py-2 font-semibold border border-slate-300 text-right w-24">Balance</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-blue-50 transition-colors group">
                <td className="px-1 py-1.5 border border-slate-200 text-center text-xs text-slate-400 bg-slate-50">{index + 1}</td>
                <td className="px-2 py-1.5 border border-slate-200 text-slate-700 font-mono text-xs whitespace-nowrap">{row.date}</td>
                <td className="px-2 py-1.5 border border-slate-200 text-slate-700 font-medium text-xs text-center">
                  {row.paymentType || ''}
                </td>
                <td className="px-2 py-1.5 border border-slate-200 text-slate-800 font-medium text-xs break-words max-w-md">{row.details}</td>
                <td className="px-2 py-1.5 border border-slate-200 text-slate-600 text-right font-mono text-xs tabular-nums">
                  {row.paidOut ? <span className="text-red-700">-{formatCurrency(row.paidOut)}</span> : ''}
                </td>
                <td className="px-2 py-1.5 border border-slate-200 text-slate-600 text-right font-mono text-xs tabular-nums">
                   {row.paidIn ? <span className="text-emerald-700">+{formatCurrency(row.paidIn)}</span> : ''}
                </td>
                <td className="px-2 py-1.5 border border-slate-200 text-slate-900 text-right font-mono text-xs font-semibold tabular-nums bg-slate-50/30">
                  {formatCurrency(row.balance)}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                  No transactions found in this document.
                </td>
              </tr>
            )}
            {/* Empty rows to fill space for "spreadsheet" feel if list is short */}
            {data.length > 0 && data.length < 15 && Array.from({ length: 15 - data.length }).map((_, i) => (
               <tr key={`empty-${i}`}>
                <td className="px-1 py-1.5 border border-slate-100 text-center text-xs text-slate-300 bg-slate-50/50">{data.length + i + 1}</td>
                <td className="border border-slate-100"></td>
                <td className="border border-slate-100"></td>
                <td className="border border-slate-100"></td>
                <td className="border border-slate-100"></td>
                <td className="border border-slate-100"></td>
                <td className="border border-slate-100"></td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};