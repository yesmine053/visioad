// pages/api/contact.js
export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Méthode non autorisée' 
    });
  }

  console.log('Contact API called:', req.body);

  try {
    // Forward to PHP backend
    const phpResponse = await fetch('http://127.0.0.1:8080/Visioad/contact.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    const data = await phpResponse.json();
    
    // Return PHP response
    res.status(phpResponse.ok ? 200 : 500).json(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur de connexion au serveur',
      error: error.message
    });
  }
}