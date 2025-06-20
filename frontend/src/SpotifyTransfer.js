import React, { useState, useEffect } from 'react';
import './SpotifyTransfer.css';

function SpotifyTransfer() {
  const [playlists, setPlaylists] = useState([]);
  const [youtubeLinks, setYoutubeLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(false);

  // ✅ Vérifie si "?connected=spotify" est dans l'URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "spotify") {
      setSpotifyConnected(true);
      window.history.replaceState({}, document.title, window.location.pathname); // Nettoie l'URL
    }
  }, []);

  // 🔹 Récupération des playlists Spotify
  useEffect(() => {
    fetch('http://127.0.0.1:5000/spotify/playlists')
      .then(res => res.json())
      .then(data => {
        if (data.playlists) setPlaylists(data.playlists);
      })
      .catch(() => {
        alert('❌ Erreur en récupérant les playlists Spotify');
      });
  }, []);

  // 🔹 Lorsqu'on clique sur "Transférer"
  const handleTransfer = async (playlistId) => {
    setLoading(true);
    setYoutubeLinks([]);

    try {
      const res = await fetch(`http://127.0.0.1:5000/spotify/playlist-tracks/${playlistId}`);
      const data = await res.json();

      if (!data.tracks) throw new Error(data.error || 'Erreur récupération musiques playlist');

      const ytRes = await fetch('http://127.0.0.1:5000/youtube/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracks: data.tracks })
      });

      const ytData = await ytRes.json();
      if (ytData.error) throw new Error(ytData.error);

      setYoutubeLinks(ytData.results || []);
    } catch (err) {
      alert(`❌ Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Connexion Spotify
  const handleConnectSpotify = async () => {
    const res = await fetch("http://127.0.0.1:5000/spotify/login");
    const data = await res.json();
    alert("🔐 Une page va s'ouvrir. Connecte-toi, copie-colle le lien si besoin !");
    window.location.href = data.url;
  };

  return (

    
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: '20px' }}>
  <a 
    href="https://youtu.be/IK1IT_c2wx8?si=CHyla29-X-LusyBl" 
    target="_blank" 
    rel="noopener noreferrer"
    style={{ color: '#1DB954', textDecoration: 'none', fontWeight: 'bold' }}
  >
    ▶️ CL1cK M3 4 a yTb TuToR1Al 2 h0W t0 Us3 mY ApP!
  </a>
</div>
      <h2 className="title">Spotify 2 YouTube !</h2>

      {!spotifyConnected && (
        <>
          <p style={{ fontWeight: 'bold' }}>🔐 Connecte-toi à ton compte Spotify</p>
          <button onClick={handleConnectSpotify}>🎵 Se connecter à Spotify</button>
        </>
      )}

      {spotifyConnected && (
        <>
          <p style={{ color: 'green' }}>✅ Connecté à Spotify !</p>
          <p><strong>Choisis une playlist Spotify 🎶</strong></p>

          <div className="playlist-grid">
            {playlists.map((p) => (
              <div key={p.id} className="playlist-card">
                {p.image && <img src={p.image} alt={p.name} />}
                <h4>{p.name}</h4>
                <p>{p.owner} · {p.tracks} morceaux</p>
                <button onClick={() => handleTransfer(p.id)}>🔁 Transférer</button>
              </div>
            ))}
          </div>
        </>
      )}

      {loading && <p>⏳ Chargement en cours...</p>}

      {youtubeLinks.length > 0 && (
        <>
          <h3>🎥 Résultats YouTube</h3>
          <ul>
            {youtubeLinks.map((item, index) => (
              <li key={index}>
                {item.title} - {item.artist}{' '}
                {item.youtubeLink ? (
                  <a href={item.youtubeLink} target="_blank" rel="noreferrer">
                    👉 Voir sur YouTube
                  </a>
                ) : (
                  <span>❌ Aucun résultat</span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default SpotifyTransfer;
