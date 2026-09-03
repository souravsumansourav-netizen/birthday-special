'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Surprise = {
  id: string;
  title: string;
  sub_text?: string;
  image_url: string;
  image_url_2?: string;
  created_at: string;
};

export default function AdminPage() {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [title, setTitle] = useState('');
  const [subText, setSubText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [surprises, setSurprises] = useState<Surprise[]>([]);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchSurprises = async () => {
    try {
      const res = await fetch(`/api/surprises?revealAll=true&passcode=${encodeURIComponent(passcode)}`);
      const data = await res.json();
      if (res.ok && data.surprises) {
        setSurprises(data.surprises);
      } else if (res.status === 401) {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Failed to fetch surprises", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSurprises();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.length > 0) {
      try {
        const res = await fetch(`/api/surprises?revealAll=true&passcode=${encodeURIComponent(passcode)}`);
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          alert('Invalid passcode');
        }
      } catch (err) {
        alert('Error verifying passcode');
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || (!image && !editingId)) {
      setMessage(editingId ? 'Please provide a title' : 'Please provide both title and image');
      return;
    }
    
    setIsUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('passcode', passcode);
    if (editingId) formData.append('id', editingId);
    formData.append('title', title);
    if (subText) formData.append('sub_text', subText);
    if (image) formData.append('image', image);
    if (image2) formData.append('image2', image2);

    try {
      const res = await fetch('/api/upload', {
        method: editingId ? 'PUT' : 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setMessage(editingId ? 'Updated successfully!' : 'Uploaded successfully!');
      setTitle('');
      setSubText('');
      setImage(null);
      setImage2(null);
      setEditingId(null);
      // Reset file input
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      const fileInput2 = document.getElementById('image2-upload') as HTMLInputElement;
      if (fileInput2) fileInput2.value = '';
      
      fetchSurprises();
    } catch (error: any) {
      setMessage(error.message || 'An error occurred');
      if (error.message === 'Unauthorized') {
        setIsAuthenticated(false); // Force re-login
      }
    } finally {
      setIsUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10 p-4">
        <div className="glass-panel p-8 rounded-2xl w-full max-w-md">
          <h2 className="text-2xl font-serif text-sky-300 mb-6 text-center">Admin Login</h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="Enter passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-200 outline-none focus:border-sky-400"
            />
            <button type="submit" className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-lg transition-colors">
              Enter
            </button>
          </form>
          <div className="mt-6 text-center">
             <Link href="/" className="text-slate-400 hover:text-slate-300 text-sm underline">Back to Countdown</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative z-10 p-4 sm:p-8 flex justify-center">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        
        <div className="flex justify-between items-center bg-slate-800/80 p-4 rounded-xl shadow-lg border border-slate-700">
          <h1 className="text-2xl font-serif text-slate-100">Admin Dashboard</h1>
          <Link href="/" className="text-sky-400 hover:text-sky-300 underline">View Live Site</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Upload Form */}
          <div className="glass-panel p-6 rounded-xl md:col-span-1 h-fit">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif text-sky-300">
                {editingId ? 'Edit Surprise' : 'Add New Surprise'}
              </h2>
              {editingId && (
                <button 
                  onClick={() => {
                    setEditingId(null);
                    setTitle('');
                    setSubText('');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 underline"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            
            {message && (
              <div className={`p-3 mb-4 rounded ${message.includes('success') ? 'bg-green-900/50 text-green-300 border-green-800' : 'bg-red-900/50 text-red-300 border-red-800'} border text-sm`}>
                {message}
              </div>
            )}

            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Title (e.g. Memory #1)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-200 outline-none focus:border-sky-400"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-1">Sub-text (Optional)</label>
                <input
                  type="text"
                  value={subText}
                  onChange={(e) => setSubText(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-200 outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Image 1 {editingId && '(Leave empty to keep current)'}</label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-900 file:text-sky-300 hover:file:bg-sky-800 cursor-pointer"
                  required={!editingId}
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Image 2 (Optional)</label>
                <input
                  id="image2-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage2(e.target.files?.[0] || null)}
                  className="w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-900 file:text-sky-300 hover:file:bg-sky-800 cursor-pointer"
                />
              </div>

              <button 
                type="submit" 
                disabled={isUploading}
                className="mt-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors"
              >
                {isUploading ? (editingId ? 'Updating...' : 'Uploading...') : (editingId ? 'Update Surprise' : 'Upload Surprise')}
              </button>
            </form>
          </div>

          {/* List of uploaded surprises */}
          <div className="glass-panel p-6 rounded-xl md:col-span-2">
            <h2 className="text-xl font-serif text-sky-300 mb-4">Uploaded Surprises ({surprises.length}/32)</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {surprises.map((surprise, index) => (
                <div key={surprise.id} className="bg-slate-800/60 p-3 rounded-lg border border-slate-700 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs bg-sky-900/60 text-sky-300 px-2 py-1 rounded">Day {index + 1}</span>
                    <span className="text-xs text-slate-500">{new Date(surprise.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className={`w-full ${surprise.image_url_2 ? 'h-48' : 'h-32'} relative rounded overflow-hidden mb-2 flex gap-2`}>
                    <img src={surprise.image_url} alt={surprise.title} className="flex-1 w-full h-full object-contain bg-slate-900/50 rounded" />
                    {surprise.image_url_2 && (
                      <img src={surprise.image_url_2} alt={surprise.title + " 2"} className="flex-1 w-full h-full object-contain bg-slate-900/50 rounded" />
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200 truncate">{surprise.title}</h3>
                  {surprise.sub_text && (
                    <p className="text-xs text-slate-400 truncate mt-1">{surprise.sub_text}</p>
                  )}
                  <button 
                    onClick={() => {
                      setEditingId(surprise.id);
                      setTitle(surprise.title);
                      setSubText(surprise.sub_text || '');
                      setImage(null);
                      setImage2(null);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="mt-3 w-full bg-slate-700/50 hover:bg-slate-600 text-sky-300 text-xs py-1.5 rounded transition-colors border border-slate-600"
                  >
                    Edit
                  </button>
                </div>
              ))}
              
              {surprises.length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-500">
                  No surprises uploaded yet.
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
