import React, { useState } from 'react';

export default function VideoAnalyzer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    setSelectedFile(file ?? null);
    setResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a video file first.');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append('videoFile', selectedFile);

    try {
      const response = await fetch('http://localhost:3001/analyze-video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data.result ?? JSON.stringify(data));
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to analyze video. Check the backend console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Gemini Video Analyzer</h2>

      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        disabled={loading}
        className="mb-3"
      />

      <div className="mb-4">
        <button
          onClick={handleUpload}
          disabled={!selectedFile || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze Video with Gemini'}
        </button>
      </div>

      {selectedFile && (
        <p className="text-sm mb-2">
          Selected File: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
        </p>
      )}

      {error && (
        <div className="text-red-600 border border-red-200 p-3 rounded mb-3">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="border border-gray-200 p-4 rounded">
          <h3 className="font-medium mb-2">Analysis Result from Gemini API:</h3>
          <p className="whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </div>
  );
}
