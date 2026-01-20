import type { GhostscriptModule } from '../types/index';
export type { GhostscriptModule, GhostscriptModuleFactory } from '../types/index';


export interface GhostscriptLoadOptions {
    /** Base URL to the gs-wasm assets folder (containing gs.js and gs.wasm) */
    baseUrl?: string;
    /** Direct URL to gs.wasm file (overrides baseUrl for WASM) */
    wasmUrl?: string;
    /** Custom locateFile function (overrides baseUrl and wasmUrl) */
    locateFile?: (path: string) => string;
    /** Custom print function for stdout */
    print?: (text: string) => void;
    /** Custom print function for stderr */
    printErr?: (text: string) => void;
}

/**
 * Load Ghostscript WASM module
 * 
 * @param options - Configuration options including base URL for CDN loading
 * @returns Promise resolving to the Ghostscript module
 * 
 * @example
 * // Load from CDN
 * const gs = await loadGhostscriptWASM({
 *     baseUrl: 'https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.0/assets/'
 * });
 * 
 * @example
 * // Load from local path
 * const gs = await loadGhostscriptWASM({
 *     baseUrl: '/ghostscript-wasm/'
 * });
 */
export async function loadGhostscriptWASM(options?: GhostscriptLoadOptions): Promise<GhostscriptModule> {
    // Normalize base URL
    let baseUrl = options?.baseUrl ?? './';
    if (!baseUrl.endsWith('/')) {
        baseUrl += '/';
    }

    // URL for the gs.js module loader
    const jsUrl = `${baseUrl}gs.js`;

    // Dynamic import of the Ghostscript module factory
    const gsModule = await import(/* @vite-ignore */ jsUrl);
    const ModuleFactory = gsModule.default;

    // Create locateFile function
    const locateFile = options?.locateFile ?? ((path: string) => {
        if (path.endsWith('.wasm')) {
            return options?.wasmUrl ?? `${baseUrl}gs.wasm`;
        }
        return `${baseUrl}${path}`;
    });

    // Initialize the module
    return ModuleFactory({
        locateFile,
        print: options?.print,
        printErr: options?.printErr,
    });
}

// Default export for backwards compatibility
export default loadGhostscriptWASM;
