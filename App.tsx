import React, { useState } from 'react';
import { DropZone } from './components/DropZone';
import { StatementViewer } from './components/TextViewer';
import { extractTransactions } from './services/geminiService';
import { AppState, UploadedFile, Transaction } from './types';
import { fileToBase64, formatFileSize } from './utils/fileHelpers';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [extractedData, setExtractedData] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = (fileData: UploadedFile) => {
    setUploadedFile(fileData);
    setAppState(AppState.IDLE); 
    setError(null);
  };

  const handleProcessFile = async () => {
    if (!uploadedFile) return;

    setAppState(AppState.PROCESSING);
    setError(null);

    try {
      // 1. Convert to Base64
      const base64Data = await fileToBase64(uploadedFile.file);
      
      // 2. Send to Gemini
      const transactions = await extractTransactions(base64Data, uploadedFile.file.type);
      
      setExtractedData(transactions);
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      setAppState(AppState.ERROR);
      setError(err.message || 'An unexpected error occurred while processing the file.');
    }
  };

  const handleClear = () => {
    setAppState(AppState.IDLE);
    setUploadedFile(null);
    setExtractedData([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-800">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
             </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Statement Extractor</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
              Gemini 2.5 Flash
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Upload & Info */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Intro Text */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">Upload Statement</h2>
              <p className="text-slate-500">
                Upload your PDF or Image bank statement to extract transactions into a clean table.
              </p>
            </div>

            {/* Drop Zone */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               {appState !== AppState.SUCCESS ? (
                  <DropZone 
                    onFileSelected={handleFileSelected} 
                    disabled={appState === AppState.PROCESSING}
                  />
               ) : (
                 <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">Extraction Complete!</h3>
                      <p className="text-sm text-slate-500">Your data is ready to view.</p>
                    </div>
                    <button 
                      onClick={handleClear}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                      Process another file
                    </button>
                 </div>
               )}

               {/* File Info Card */}
               {uploadedFile && appState !== AppState.SUCCESS && (
                 <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3 overflow-hidden">
                       <div className="w-10 h-10 rounded-lg bg-indigo-100 flex-shrink-0 flex items-center justify-center">
                          {uploadedFile.file.type.startsWith('image/') ? (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                               <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                             </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                          )}
                       </div>
                       <div className="min-w-0">
                         <p className="text-sm font-medium text-slate-900 truncate">{uploadedFile.file.name}</p>
                         <p className="text-xs text-slate-500">{formatFileSize(uploadedFile.file.size)}</p>
                       </div>
                    </div>
                    
                    {appState === AppState.IDLE || appState === AppState.ERROR ? (
                       <button
                        onClick={() => setUploadedFile(null)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Remove file"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                         </svg>
                       </button>
                    ) : null}
                 </div>
               )}
            </div>

            {/* Actions */}
            {uploadedFile && appState !== AppState.SUCCESS && (
              <div className="flex flex-col gap-4">
                 <button
                    onClick={handleProcessFile}
                    disabled={appState === AppState.PROCESSING}
                    className={`
                      w-full py-3.5 px-6 rounded-xl font-semibold text-white shadow-lg shadow-indigo-200 transition-all transform active:scale-[0.98]
                      flex items-center justify-center gap-2
                      ${appState === AppState.PROCESSING 
                        ? 'bg-indigo-400 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl'}
                    `}
                 >
                    {appState === AppState.PROCESSING ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Scanning...
                      </>
                    ) : (
                      <>
                        <span>Extract Transactions</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                 </button>
                 
                 {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                       </svg>
                       <span>{error}</span>
                    </div>
                 )}
              </div>
            )}
            
            {/* Features Info */}
             <div className="mt-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                <h4 className="font-semibold text-slate-800 text-sm mb-2">Supported Columns</h4>
                <ul className="text-xs text-slate-500 space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                    Date
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                    Payment Type and Details
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                    Paid Out & Paid In
                  </li>
                   <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                    Balance
                  </li>
                </ul>
             </div>

          </div>

          {/* Right Panel: Result */}
          <div className="lg:col-span-8 flex flex-col h-[600px] lg:h-[calc(100vh-140px)] min-h-[500px]">
            {extractedData.length > 0 ? (
              <StatementViewer data={extractedData} onClear={handleClear} />
            ) : (
              <div className="h-full w-full bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                 <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                   </svg>
                 </div>
                 <p className="font-medium text-slate-500">No transactions loaded</p>
                 <p className="text-sm mt-2 max-w-xs">Upload a statement to visualize the table here.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;