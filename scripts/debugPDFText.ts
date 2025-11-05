import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function debugPDF() {
  const data = new Uint8Array(fs.readFileSync('attached_assets/amateur_basic_questions_en_2025-07-15_1762335694399.pdf'));
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;
  
  // Just look at page 4 (first page with questions)
  const page = await pdf.getPage(4);
  const textContent = await page.getTextContent();
  
  console.log('=== First 200 text items from page 4 ===\n');
  textContent.items.slice(0, 200).forEach((item: any, index) => {
    console.log(`${index}: "${item.str}"`);
  });
}

debugPDF().catch(console.error);
