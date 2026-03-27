const ImageInput: React.FC<{ url: string; onChange: (url: string) => void }> = ({ url, onChange }) => {
  const [drag, setDrag]           = useState(false);
  const [tab, setTab]             = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image trop grande (max 5MB)');
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem('access_token') || '';
      const fd = new FormData();
      fd.append('file', file);
      fd.append('action', 'upload');

      const res = await fetch('http://localhost:8089/visioad/backend/api/media.php', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json();

      if (data.success && data.media?.url) {
        // ✅ فقط URL من السيرفر
        onChange(data.media.url);
      } else {
        alert("Erreur upload image ❌");
      }

    } catch (err) {
      alert("Serveur inaccessible ❌");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        <button type="button" onClick={() => setTab('url')}
          className={`px-4 py-1.5 text-xs font-medium rounded-lg transition ${tab === 'url' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
          🔗 URL
        </button>
        <button type="button" onClick={() => setTab('upload')}
          className={`px-4 py-1.5 text-xs font-medium rounded-lg transition ${tab === 'upload' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
          📁 Importer
        </button>
      </div>

      {tab === 'url' && (
        <input
          type="text"
          value={url}
          onChange={e => onChange(e.target.value)}
          placeholder="/uploads/image.jpg"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
        />
      )}

      {tab === 'upload' && (
        <div
          onDrop={e => {
            e.preventDefault();
            setDrag(false);
            const f = e.dataTransfer.files[0];
            if (f) uploadFile(f);
          }}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          className={`border-2 border-dashed rounded-xl p-6 text-center ${drag ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
        >
          {uploading ? (
            <p>Upload...</p>
          ) : (
            <>
              <p>Glissez image ici ou</p>
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) uploadFile(f);
                }}
              />
            </>
          )}
        </div>
      )}

      {url && (
        <img
          src={url}
          className="w-full h-52 object-cover rounded-xl"
          onError={e => {
            (e.target as HTMLImageElement).src = '/images/blog/default.jpg';
          }}
        />
      )}
    </div>
  );
};