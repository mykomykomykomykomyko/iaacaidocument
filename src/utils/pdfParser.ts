// Assumes pdfjsLib is globally available from HTML
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

const configurePdfWorker = () => {
  try {
    const pdfjsLib = window.pdfjsLib;
    if (!pdfjsLib) {
      throw new Error('pdfjsLib is not available globally. Make sure PDF.js scripts are loaded.');
    }

    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      // Use CDN worker path
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.mjs';
    }

    // Configure OpenJPEG WASM for JPX decoding, if available
    if (typeof pdfjsLib.JpxImage !== 'undefined') {
      console.debug('JpxImage available, configuring WASM for JPX decoding');
      try {
        // Primary WASM URL
        pdfjsLib.JpxImage.wasmUrl = 'https://unpkg.com/pdfjs-dist@5.3.31/wasm/openjpeg.wasm';
        // Prevent JS fallback errors
        pdfjsLib.JpxImage.noWasmFallback = true;
        // Test WASM availability
        fetch(pdfjsLib.JpxImage.wasmUrl).then(response => {
          if (!response.ok) {
            console.warn(`WASM fetch failed: ${response.status}. Falling back to disable JPX.`);
            pdfjsLib.disableJpx = true;
          }
        }).catch(error => {
          console.warn(`WASM fetch error: ${error.message}. Falling back to disable JPX.`);
          pdfjsLib.disableJpx = true;
        });
      } catch (error) {
        console.warn(`Failed to configure WASM: ${error.message}. Disabling JPX decoding.`);
        pdfjsLib.disableJpx = true;
      }
    } else {
      console.debug('JpxImage not available in pdfjsLib, JPX decoding disabled');
      pdfjsLib.disableJpx = true;
    }
  } catch (error) {
    console.error(`Failed to configure PDF.js worker: ${error.message}`);
    throw error;
  }
};

// Initialize worker configuration
configurePdfWorker();

export const rasterizePdfPage = async (pdfArrayBuffer: ArrayBuffer, pageIndex: number): Promise<string> => {
  try {
    console.log(`Rasterizing PDF page ${pageIndex + 1}`);

    const pdfjsLib = window.pdfjsLib;
    if (!pdfjsLib) {
      throw new Error('pdfjsLib is not available globally');
    }

    // Create a copy of the ArrayBuffer to avoid detachment issues
    const pdfData = new Uint8Array(pdfArrayBuffer).buffer;

    // Load the PDF document with JPX fallback
    const loadingTask = pdfjsLib.getDocument({
      data: pdfData,
      disableJpx: pdfjsLib.disableJpx || typeof pdfjsLib.JpxImage === 'undefined' // Disable JPX if configured or JpxImage unavailable
    });
    const pdf = await loadingTask.promise;

    // Get the specific page (PDF.js uses 1-based indexing)
    const page = await pdf.getPage(pageIndex + 1);

    // Set up canvas with high scale for good quality
    const scale = 2.5;
    const viewport = page.getViewport({ scale });

    // Create canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (!context) {
      throw new Error('Could not get canvas context');
    }

    // Render the page with error handling for JPX issues
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      enableWebGL: true
    };

    try {
      await page.render(renderContext).promise;
      console.debug(`Page ${pageIndex + 1} rendered successfully`);
    } catch (renderError) {
      console.warn(`Partial rendering for page ${pageIndex + 1} due to error: ${renderError.message}`);
      // Continue with partial rendering (text and non-JPX content)
    }

    // Convert canvas to data URL with high quality
    const dataUrl = canvas.toDataURL('image/png', 0.95);
    console.log(`Successfully rasterized page ${pageIndex + 1}`);

    // Clean up
    canvas.remove();

    return dataUrl;
  } catch (error) {
    console.error(`Error rasterizing PDF page ${pageIndex + 1}:`, error);
    throw error; // Rethrow to allow calling code to handle
  }
};

export const extractPDFText = async (arrayBuffer: ArrayBuffer) => {
  if (!arrayBuffer) throw new Error('Invalid PDF input');

  const pdfjsLib = window.pdfjsLib;
  if (!pdfjsLib) {
    throw new Error('pdfjsLib is not available globally');
  }

  // Create a copy of the ArrayBuffer to avoid detachment issues
  const pdfData = new Uint8Array(arrayBuffer).buffer;

  const loadingTask = pdfjsLib.getDocument({
    data: pdfData,
    disableJpx: pdfjsLib.disableJpx || typeof pdfjsLib.JpxImage === 'undefined'
  });
  const pdf = await loadingTask.promise;
  const textContent = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContentItems = await page.getTextContent({
      includeMarkedContent: true,
      disableCombineTextItems: false,
    });
    const pageText = textContentItems.items
      .map((item: any) => item.str || '')
      .join(' ')
      .trim();
    textContent.push(pageText);
  }

  return { pagesText: textContent };
};

export const rasterizePDF = async (arrayBuffer: ArrayBuffer) => {
  if (!arrayBuffer) throw new Error('Invalid PDF input');

  const pdfjsLib = window.pdfjsLib;
  if (!pdfjsLib) {
    throw new Error('pdfjsLib is not available globally');
  }

  // Create a copy of the ArrayBuffer to avoid detachment issues
  const pdfData = new Uint8Array(arrayBuffer).buffer;

  const loadingTask = pdfjsLib.getDocument({
    data: pdfData,
    disableJpx: pdfjsLib.disableJpx || typeof pdfjsLib.JpxImage === 'undefined'
  });
  const pdf = await loadingTask.promise;
  const pages = [];
  const scale = 2.5;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Could not get canvas context');
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    try {
      await page.render({
        canvasContext: context,
        viewport,
        enableWebGL: true,
      }).promise;
      console.debug(`Page ${i} rendered successfully`);
    } catch (renderError) {
      console.warn(`Partial rendering for page ${i} due to error: ${renderError.message}`);
      // Continue with partial rendering
    }

    const dataUrl = canvas.toDataURL('image/png', 0.95);
    const pageContent = `
<div class="pdf-page" style="position: relative; width: ${viewport.width}px; height: ${viewport.height}px; margin: 20px 0;">
<img src="${dataUrl}" style="width: 100%; height: 100%; user-select: none;" alt="Page ${i}" />
</div>
    `;
    pages.push(pageContent);
    canvas.remove();
  }

  return { pages };
};