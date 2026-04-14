import { useState } from 'react';

export default function DebugFetch() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('IDLE'); // IDLE, CONNECTING, CONNECTED, ERROR
  const [rawResponse, setRawResponse] = useState(null);

  const testFetch = async () => {
    setStatus('CONNECTING');
    setError(null);
    setData(null);
    setRawResponse(null);

    // 5. FIX FRONTEND API LAYER: Ensure correct URL is used (localhost for local testing)
    const targetUrl = 'http://localhost:3000/data';

    try {
      // Create controller for timeout edge case
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 sec timeout

      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      setRawResponse(`Status: ${response.status} ${response.statusText}`);

      // Check for Network Error / Server Down Error (handled by catch below if completely down)
      // If server is up but returns 404/500
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      // Check for parsing error
      let json;
      try {
        json = await response.json();
      } catch (parseError) {
        throw new Error('Invalid JSON format from server');
      }

      setData(json);
      setStatus('CONNECTED');
    } catch (err) {
      setStatus('ERROR');
      
      // 4. CHECK NETWORK ERRORS
      if (err.name === 'AbortError') {
        setError('Timeout: Device took too long to respond. Ensure simulator is running.');
      } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        // This is typically CORS or the server is completely down
        setError('Network Error / CORS Issue: "Device not reachable". Make sure esp-sim.js is running on port 3000 and has CORS enabled.');
      } else {
        setError(`Error: ${err.message}`);
      }
    }
  };

  return (
    <div className="p-4 bg-gray-900 border border-gray-700 rounded-xl max-w-md mx-auto my-4 text-white font-mono">
      <h3 className="text-xl font-bold mb-4 text-teal-400">Simulator Debug UI</h3>
      
      <div className="flex gap-4 items-center mb-4">
        <button 
          onClick={testFetch}
          className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded font-bold transition-colors"
        >
          FETCH DATA
        </button>
        <div className={`px-3 py-1 rounded text-sm font-bold ${
          status === 'CONNECTED' ? 'bg-green-500/20 text-green-400' :
          status === 'ERROR' ? 'bg-red-500/20 text-red-400' :
          status === 'CONNECTING' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-gray-800 text-gray-400'
        }`}>
          {status}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-3 rounded mb-4">
          <p className="text-red-400 text-xs font-bold uppercase mb-1">Exact Error Message</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {rawResponse && (
        <div className="bg-gray-800 p-2 rounded mb-4 text-xs">
          <span className="text-gray-400">Raw Response:</span> {rawResponse}
        </div>
      )}

      {data && (
        <div className="bg-gray-800 p-3 rounded">
          <table className="w-full text-sm">
            <tbody>
              <tr><td className="text-gray-400 py-1">Temperature:</td><td className="font-bold">{data.temperature} °C</td></tr>
              <tr><td className="text-gray-400 py-1">Density:</td><td className="font-bold">{data.density} g/cm³</td></tr>
              <tr><td className="text-gray-400 py-1">Wavelength:</td><td className="font-bold">{data.wavelength} nm</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
