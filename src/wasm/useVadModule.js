import { useState, useEffect } from 'react';

export default function useVadModule() {
  const [vadModule, setVadModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadModule = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Wait for global module to load
        let createVADModule;
        let attempts = 0;
        const maxAttempts = 100; // Wait up to 10 seconds
        
        while (!createVADModule && attempts < maxAttempts) {
          createVADModule = window.createVADModule;
          if (!createVADModule) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
        }
        
        if (!createVADModule) {
          throw new Error('createVADModule not found. Please ensure ten_vad.js is loaded correctly.');
        }
        
        // Load WASM binary file
        const wasmResponse = await fetch('/wasm/ten_vad.wasm');
        if (!wasmResponse.ok) {
          throw new Error('Failed to load WASM file');
        }
        const wasmBinary = await wasmResponse.arrayBuffer();
        
        // Initialize module
        const module = await createVADModule({ 
          wasmBinary,
          locateFile: (filePath) => {
            if (filePath.endsWith('.wasm')) {
              return '/wasm/ten_vad.wasm';
            }
            return filePath;
          },
          noInitialRun: false,
          noExitRuntime: true
        });
        
        if (isMounted) {
          setVadModule(module);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    loadModule();
    
    return () => { 
      isMounted = false; 
    };
  }, []);

  return { vadModule, loading, error };
} 