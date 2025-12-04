import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractTransactions = async (base64Data: string, mimeType: string): Promise<Transaction[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: `You are a high-precision financial data extractor. Your job is to digitize bank statements with 100% accuracy.

            Analyze the document image/PDF and extract the transaction table.

            ### CRITICAL INSTRUCTIONS:

            1. **Multi-line Description Handling (MOST IMPORTANT)**:
               - Bank statements often split long descriptions across multiple lines.
               - If a line of text appears under a transaction but has **NO Date** and **NO Amount**, it is a continuation of the previous row.
               - **MERGE** this text into the 'details' field of the previous transaction.
               - **DO NOT** create a new transaction entry for these continuation lines.

            2. **Column Separation**:
               - **Date**: Extract exactly as visible (e.g., 11MAY18).
               - **Payment Type**: Identify the short code (e.g., CR, BP, DD, SO, VIS, TFR, CHQ) that often appears between the Date and the Description. Extract this code separately. If no code exists, return null.
               - **Details**: The main description of the transaction. *Exclude* the Payment Type code from this field.
               - **Paid Out**: The withdrawal/debit amount. If empty, return null.
               - **In**: The deposit/credit amount. If empty, return null.
               - **Balance**: The running balance amount. If empty, return null.

            3. **Data Integrity**:
               - Do not hallucinate values. If a cell is visually empty, the JSON value must be null.
               - Ensure precise alignment of 'Paid Out' vs 'In' columns.

            ### EXAMPLE BEHAVIOR:
            
            **Input Visual:**
            15MAY18 CR A Tuakanangaro           1750.00
                       4 RAILWAY COTTAGES

            **Correct Output Object:**
            {
              "date": "15MAY18",
              "paymentType": "CR",
              "details": "A Tuakanangaro 4 RAILWAY COTTAGES",
              "paidOut": null,
              "paidIn": 1750.00,
              "balance": null
            }
            `
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              paymentType: { type: Type.STRING, description: "Short payment code (CR, BP, DD, etc.) found before details", nullable: true },
              details: { type: Type.STRING, description: "Full transaction description, including merged lines" },
              paidOut: { type: Type.NUMBER, description: "Amount paid out", nullable: true },
              paidIn: { type: Type.NUMBER, description: "Amount paid in (In)", nullable: true },
              balance: { type: Type.NUMBER, description: "Balance", nullable: true },
            },
            required: ["date", "details"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as Transaction[];
  } catch (error: any) {
    console.error("Gemini Extraction Error:", error);
    throw new Error(error.message || "Failed to extract data from document");
  }
};