/// <reference types="vite/client" />

declare module 'html2pdf.js' {
  type Options = {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: { type?: string; quality?: number };
    html2canvas?: { scale?: number; useCORS?: boolean };
    jsPDF?: { unit?: string; format?: string | number[]; orientation?: 'portrait' | 'landscape' };
    pagebreak?: { mode?: string[] | string };
  };
  interface Html2Pdf {
    set: (options: Options) => Html2Pdf;
    from: (element: Element | string) => Html2Pdf;
    save: () => Promise<void>;
    outputPdf: () => Promise<Blob>;
    toPdf: () => Html2Pdf;
    get: (key: string, instance?: any) => any;
  }
  const html2pdf: Html2Pdf & ((element?: Element | string) => Html2Pdf);
  export default html2pdf;
}
