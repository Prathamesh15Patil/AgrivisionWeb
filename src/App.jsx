import { useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'
import farmerGif1 from './assets/farmer.gif'
import farmerGif2 from './assets/farmer2.gif'
import farmerGif3 from './assets/farmer3.gif'

const farmerGifs = [farmerGif1, farmerGif2, farmerGif3]

/* ── Loading animation with rotating farmer GIFs ── */
function LoadingAnimation({ text = 'Processing...' }) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setIdx(i => (i + 1) % farmerGifs.length), 2000)
    return () => clearInterval(timer)
  }, [])
  return (
    <div className="loading-anim">
      <img src={farmerGifs[idx]} alt="Loading" />
      <p>{text}</p>
    </div>
  )
}

/* ── red marker icon for leaflet ── */
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://agrivisionbackend-judy.onrender.com'
const languages = [
  ['en', 'English'], ['hi', 'Hindi'], ['mr', 'Marathi'], ['kn', 'Kannada'],
]
const copy = {
  en: {
    title: 'Farming Assistant', subtitle: 'Select your preferred language.', continue: 'Continue',
    welcome: 'Welcome', homeSubtitle: 'AGRIVISION HOME', greeting: 'Hello, Farmer,', overview: 'Here is your regional overview.',
    cards: [['🌿', 'Disease Detection', 'Scan crops instantly', 'scan'], ['🔬', 'Soil Labs', 'Find nearby labs', 'labs'], ['📰', 'News', 'Daily farming updates', 'news'], ['🏛️', 'Government Schemes', 'Browse subsidies', 'schemes']],
    assistantTag: 'HELP AT YOUR FINGERTIPS', assistant: 'Farming Assistant', openChat: 'Open Chatbot',
    ask: 'Ask about crops, pests...', send: 'Send', back: 'Back to Home', search: 'Enter location',
    detectLocation: 'Detect my location', detecting: 'Detecting...', playAudio: '🔊 Play',
  },
  hi: { title: 'कृषि सहायक', subtitle: 'अपनी पसंदीदा भाषा चुनें।', continue: 'जारी रखें', welcome: 'स्वागत है', homeSubtitle: 'एग्रीविज़न होम', greeting: 'नमस्ते किसान,', overview: 'यहाँ आपके क्षेत्र का विवरण है।', cards: [['🌿', 'रोग पहचान', 'फसलों को तुरंत स्कैन करें', 'scan'], ['🔬', 'मिट्टी प्रयोगशाला', 'नज़दीकी लैब खोजें', 'labs'], ['📰', 'समाचार', 'दैनिक कृषि समाचार', 'news'], ['🏛️', 'सरकारी योजनाएँ', 'सब्सिडी देखें', 'schemes']], assistantTag: 'आपकी मदद के लिए', assistant: 'कृषि सहायक', openChat: 'चैटबॉट खोलें', ask: 'फसल और कीटों के बारे में पूछें...', send: 'भेजें', back: 'होम पर जाएँ', search: 'स्थान दर्ज करें', detectLocation: 'मेरा स्थान पता करें', detecting: 'पता लगा रहे हैं...', playAudio: '🔊 सुनें' },
  mr: { title: 'शेती सहाय्यक', subtitle: 'तुमची पसंतीची भाषा निवडा.', continue: 'पुढे जा', welcome: 'स्वागत', homeSubtitle: 'ॲग्रीव्हिजन होम', greeting: 'नमस्कार शेतकरी,', overview: 'तुमच्या प्रदेशाचा आढावा येथे आहे.', cards: [['🌿', 'रोग निदान', 'पिके त्वरित स्कॅन करा', 'scan'], ['🔬', 'माती प्रयोगशाळा', 'जवळच्या प्रयोगशाळा शोधा', 'labs'], ['📰', 'बातम्या', 'दैनिक शेती अपडेट्स', 'news'], ['🏛️', 'सरकारी योजना', 'अनुदाने पहा', 'schemes']], assistantTag: 'तुमच्या मदतीसाठी', assistant: 'शेती सहाय्यक', openChat: 'चॅटबॉट उघडा', ask: 'पिके आणि कीटकांबद्दल विचारा...', send: 'पाठवा', back: 'मुख्यपृष्ठावर जा', search: 'ठिकाण टाका', detectLocation: 'माझे स्थान शोधा', detecting: 'शोधत आहे...', playAudio: '🔊 ऐका' },
  kn: { title: 'ಕೃಷಿ ಸಹಾಯಕ', subtitle: 'ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.', continue: 'ಮುಂದುವರಿಸಿ', welcome: 'ಸ್ವಾಗತ', homeSubtitle: 'ಅಗ್ರಿವಿಷನ್ ಹೋಮ್', greeting: 'ನಮಸ್ಕಾರ ರೈತರೆ,', overview: 'ನಿಮ್ಮ ಪ್ರದೇಶದ ವಿವರ ಇಲ್ಲಿದೆ.', cards: [['🌿', 'ರೋಗ ಪತ್ತೆ', 'ಬೆಳೆಗಳನ್ನು ತಕ್ಷಣ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ', 'scan'], ['🔬', 'ಮಣ್ಣಿನ ಪ್ರಯೋಗಾಲಯ', 'ಹತ್ತಿರದ ಲ್ಯಾಬ್ ಹುಡುಕಿ', 'labs'], ['📰', 'ಸುದ್ದಿ', 'ದೈನಂದಿನ ಕೃಷಿ ಮಾಹಿತಿ', 'news'], ['🏛️', 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು', 'ಸಬ್ಸಿಡಿ ವೀಕ್ಷಿಸಿ', 'schemes']], assistantTag: 'ನಿಮ್ಮ ಸಹಾಯಕ್ಕೆ', assistant: 'ಕೃಷಿ ಸಹಾಯಕ', openChat: 'ಚಾಟ್‌ಬಾಟ್ ತೆರೆಯಿರಿ', ask: 'ಬೆಳೆ ಮತ್ತು ಕೀಟಗಳ ಬಗ್ಗೆ ಕೇಳಿ...', send: 'ಕಳುಹಿಸಿ', back: 'ಮುಖಪುಟಕ್ಕೆ', search: 'ಸ್ಥಳ ನಮೂದಿಸಿ', detectLocation: 'ನನ್ನ ಸ್ಥಳ ಪತ್ತೆ', detecting: 'ಪತ್ತೆ ಮಾಡುತ್ತಿದೆ...', playAudio: '🔊 ಪ್ಲೇ' },
}

/* ── Reverse-geocode coords to city name ── */
async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`)
    const data = await res.json()
    return data.address?.city || data.address?.town || data.address?.village || data.address?.county || data.display_name?.split(',')[0] || ''
  } catch { return '' }
}

/* ── Geolocation helper hook ── */
function useAutoLocation(setter) {
  const [detecting, setDetecting] = useState(false)
  const detect = async () => {
    if (!navigator.geolocation) return
    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const name = await reverseGeocode(pos.coords.latitude, pos.coords.longitude)
        if (name) setter(name)
        setDetecting(false)
      },
      () => setDetecting(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }
  return { detecting, detect }
}

async function post(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || `Request failed (${response.status})`)
  return response.json()
}

function LanguageScreen({ language, setLanguage, onContinue }) {
  const t = copy[language]
  return <div className="language-screen">
    <span className="brand-badge">AGRIVISION</span>
    <h1>{t.title}</h1><p>{t.subtitle}</p>
    <div className="language-grid">{languages.map(([code, label]) => <button className={language === code ? 'language-button active' : 'language-button'} key={code} onClick={() => setLanguage(code)}>{label}</button>)}</div>
    <button className="primary-button" onClick={onContinue}>{t.continue}</button>
  </div>
}

function Settings({ language, setLanguage, onClose }) {
  return <div className="modal-backdrop"><div className="modal-card"><h2>Change Language</h2><div className="language-grid">{languages.map(([code, label]) => <button className={language === code ? 'language-button active' : 'language-button'} key={code} onClick={() => { setLanguage(code); onClose() }}>{label}</button>)}</div><button className="text-button" onClick={onClose}>Close</button></div></div>
}

/* ── 1. Back button added to Screen wrapper ── */
function Screen({ children, language, setLanguage, onBack }) {
  const [settings, setSettings] = useState(false)
  return <div className={`mobile-screen${onBack ? ' has-back' : ''}`}>
    {onBack && <button className="back-button" aria-label="Go back" onClick={onBack}>←</button>}
    <button className="settings-button" aria-label="Settings" onClick={() => setSettings(true)}>⚙️</button>
    {children}
    {settings && <Settings language={language} setLanguage={setLanguage} onClose={() => setSettings(false)} />}
  </div>
}

function Home({ language, setLanguage, navigate }) {
  const t = copy[language]
  return <Screen language={language} setLanguage={setLanguage}><main className="home-screen"><header className="home-header"><strong>{t.welcome}</strong><small>{t.homeSubtitle}</small></header><h2>{t.greeting}</h2><p className="muted">{t.overview}</p><div className="feature-grid">{t.cards.map(([icon, title, description, route]) => <button className={`feature-card card-${route}`} key={route} onClick={() => navigate(route)}><span className="feature-icon">{icon}</span><strong>{title}</strong><small>{description}</small></button>)}</div></main></Screen>
}

function Scan({ language, setLanguage, navigate }) {
  const t = copy[language]; const [file, setFile] = useState(null); const [loading, setLoading] = useState(false); const [error, setError] = useState('')
  const choose = (event) => { const selected = event.target.files?.[0]; if (selected) setFile({ raw: selected, url: URL.createObjectURL(selected) }) }
  const detect = async () => {
    if (!file) { setError('Please select an image first'); return }
    setLoading(true); setError('')
    try { const base64 = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1]); reader.onerror = reject; reader.readAsDataURL(file.raw) }); const result = await post('/api/disease', { image: base64, query: 'Analyze this crop and suggest treatment', language }); navigate('result', { result, image: file.url }) } catch (err) { setError(err.message) } finally { setLoading(false) }
  }
  if (loading) return <Screen language={language} setLanguage={setLanguage} onBack={() => navigate('home')}><main className="content-screen"><LoadingAnimation text="Analyzing your crop..." /></main></Screen>
  return <Screen language={language} setLanguage={setLanguage} onBack={() => navigate('home')}><main className="content-screen"><h1>🔬 Disease Detection</h1><p className="subtitle">Capture a clear photo of the affected plant area to begin the diagnostic analysis.</p><div className="preview-card">{file ? <img src={file.url} alt="Selected crop" /> : <><span>🖼️</span><strong>No Image Selected</strong><small>Real-time preview will appear here</small></>}</div><div className="action-row"><label className="action-card"><span>📷</span><strong>Click Photo</strong><small>Use Device Camera</small><input type="file" accept="image/*" capture="environment" onChange={choose} /></label><label className="action-card"><span>📁</span><strong>Choose Gallery</strong><small>Upload Existing File</small><input type="file" accept="image/*" onChange={choose} /></label></div><div className="tips-card"><span>ℹ️</span><div><strong>For accurate detection:</strong><p>• Ensure the leaf is properly focused</p><p>• Capture the main symptom area</p><p>• Use good natural lighting</p></div></div>{error && <p className="error">{error}</p>}<button className="primary-button" disabled={!file || loading} onClick={detect}>{`🔍 ${t.cards[0][1]}`}</button></main></Screen>
}

function Result({ data, image, navigate, language, setLanguage }) {
  const analysis = data?.analysis || ''
  const [preview, setPreview] = useState(false)
  return <Screen language={language} setLanguage={setLanguage} onBack={() => navigate('scan')}>
    <main className="content-screen result-screen">
      {image && <>
        <img className="result-thumb" src={image} alt="Analyzed crop" onClick={() => setPreview(true)} title="Click to enlarge" />
        {preview && <div className="image-lightbox" onClick={() => setPreview(false)}>
          <img src={image} alt="Analyzed crop – full" />
          <button onClick={() => setPreview(false)}>✕</button>
        </div>}
      </>}
      {analysis ? (
        <div className="analysis-md bot-md"><ReactMarkdown>{analysis}</ReactMarkdown></div>
      ) : (
        <p className="muted">No analysis available</p>
      )}
      {data?.recommended_products?.length > 0 && <>
        <h2>Recommended Products</h2>
        {data.recommended_products.map(product => (
          <article className="product-card" key={product.name}>
            {product.image_url && <img className="product-image" src={product.image_url} alt={product.name} />}
            <div>
              <strong>{product.name}</strong>
              <p>{product.price}</p>
              <a href={product.buy_link?.startsWith('http') ? product.buy_link : `https://${product.buy_link}`} target="_blank" rel="noreferrer">Buy Now</a>
            </div>
          </article>
        ))}
      </>}
      <button className="primary-button" onClick={() => navigate('home')}>Back to Home</button>
    </main>
  </Screen>
}


/* ── 2 & 3. Labs with geolocation auto-detect and Leaflet map ── */
function Labs({ language, setLanguage, navigate }) {
  const t = copy[language]; const [place, setPlace] = useState(''); const [labs, setLabs] = useState(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  const { detecting, detect: detectLoc } = useAutoLocation(setPlace)
  const search = async () => { if (!place.trim()) { setError('Please enter a location'); return } setLoading(true); setError(''); try { setLabs(await post('/api/soil', { place, language, lang: language })) } catch (err) { setError(err.message) } finally { setLoading(false) } }
  const all = [...(labs?.government || []), ...(labs?.private || [])]
  /* Collect labs that have coordinates for the map — API uses lat/lon */
  const mappable = all.filter(lab => (lab.lat || lab.latitude) && (lab.lon || lab.lng || lab.longitude))
  const getLat = (l) => Number(l.lat ?? l.latitude)
  const getLon = (l) => Number(l.lon ?? l.lng ?? l.longitude)
  const mapCenter = mappable.length > 0
    ? [mappable.reduce((s, l) => s + getLat(l), 0) / mappable.length, mappable.reduce((s, l) => s + getLon(l), 0) / mappable.length]
    : [20.5937, 78.9629] // default India center

  return <Screen language={language} setLanguage={setLanguage} onBack={() => navigate('home')}><main className="content-screen"><h1>🌾 Soil Labs</h1><small className="eyebrow">PROXIMITY SERVICES</small><p className="subtitle">Discover top-tier agricultural research and testing facilities equipped for specialized crop analysis.</p><div className="search-row"><input value={place} onChange={e => setPlace(e.target.value)} placeholder={t.search} /><button onClick={search}>🔍</button></div><button className="detect-location-btn" onClick={detectLoc} disabled={detecting}>{detecting ? `📍 ${t.detecting}` : `📍 ${t.detectLocation}`}</button>{loading && <LoadingAnimation text="Finding nearby labs..." />}{error && <p className="error">{error}</p>}

    {/* Leaflet map */}
    {labs && mappable.length > 0 && (
      <div className="lab-map-container">
        <MapContainer center={mapCenter} zoom={10} scrollWheelZoom={false} style={{ height: '240px', width: '100%', borderRadius: '16px', marginBottom: '16px' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' />
          {mappable.map((lab, idx) => (
            <Marker key={idx} position={[getLat(lab), getLon(lab)]} icon={redIcon}>
              <Popup><strong>{lab.title}</strong><br />{lab.address}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    )}

    {labs && !all.length && <p className="muted">No labs found for this location</p>}
    {labs?.government?.length > 0 && <h2>🏛️ Government Facilities</h2>}
    {all.map((lab, index) => <article className="lab-card" key={`${lab.title}-${index}`}><div className="lab-heading"><strong>{lab.title}</strong>{labs.government.includes(lab) && <span>VERIFIED GOV</span>}</div><p>📍 {lab.address}</p><footer>📞 {lab.phoneNumber} <span>⭐ {lab.rating} ({lab.ratingCount})</span></footer>{lab.website && <a href={lab.website} target="_blank" rel="noreferrer">Visit portal</a>}</article>)}
  </main></Screen>
}

/* ── 2. News with geolocation auto-detect ── */
function News({ language, setLanguage, navigate }) {
  const t = copy[language]; const [place, setPlace] = useState(''); const [news, setNews] = useState([]); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  const { detecting, detect: detectLoc } = useAutoLocation(setPlace)
  const search = async () => { setLoading(true); setError(''); try { setNews(await post('/api/news', { place, language })) } catch (err) { setError(err.message) } finally { setLoading(false) } }
  return <Screen language={language} setLanguage={setLanguage} onBack={() => navigate('home')}><main className="content-screen"><h1>Local Insights</h1><p className="subtitle">Enter a location to get local news updates</p><div className="search-row"><input value={place} onChange={e => setPlace(e.target.value)} placeholder={t.search} /><button onClick={search}>🔍</button></div><button className="detect-location-btn" onClick={detectLoc} disabled={detecting}>{detecting ? `📍 ${t.detecting}` : `📍 ${t.detectLocation}`}</button>{loading && <LoadingAnimation text="Fetching latest news..." />}{error && <p className="error">{error}</p>}{news.map((item, index) => <article className="news-card" key={`${item.title}-${index}`}><header><span>{item.source}</span><small>{item.date}</small></header><h3>{item.title}</h3><div>{item.snippet}{item.image_url && <img src={item.image_url} alt="" />}</div><a href={item.link} target="_blank" rel="noreferrer">Read more ↗</a></article>)}</main></Screen>
}

function Schemes({ language, setLanguage, navigate }) {
  const schemes = [['PM-KISAN', 'Provides income support of INR 6000 per year to eligible farmer families.', 'Finance', 'https://pmkisan.gov.in/'], ['PMKSY', 'Promotes efficient irrigation and better water management for farms.', 'Irrigation', 'https://pmksy.gov.in/'], ['Soil Health Card', 'Provides soil nutrient status and recommendations to farmers.', 'Soil', 'https://soilhealth.dac.gov.in/'], ['PMFBY', 'Crop insurance scheme protecting farmers from losses.', 'Insurance', 'https://pmfby.gov.in/']]
  return <Screen language={language} setLanguage={setLanguage} onBack={() => navigate('home')}><main className="content-screen"><h1>🏛️ Government Schemes</h1>{schemes.map(([title, description, category, url]) => <article className="scheme-card" key={title}><span>{category.toUpperCase()}</span><h2>{title}</h2><p>{description}</p><footer><small>OFFICIAL PORTAL</small><a href={url} target="_blank" rel="noreferrer">Apply Now →</a></footer></article>)}</main></Screen>
}

/* ── 4, 5, 6. Chat with markdown rendering, mic fix, play-audio button ── */
function Chat({ language, onClose }) {
  const t = copy[language]; const [input, setInput] = useState(''); const [messages, setMessages] = useState([]); const [loading, setLoading] = useState(false); const [error, setError] = useState('')
  const recognitionRef = useRef(null)
  const [listening, setListening] = useState(false)
  const messagesEndRef = useRef(null)
  const audioRef = useRef(null) // track currently playing audio
  const [playingIdx, setPlayingIdx] = useState(null) // which message index is playing

  /* auto-scroll */
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  /* ── 6. Send – store audioUrl but don't auto-play ── */
  const send = async (event) => {
    event?.preventDefault(); if (!input.trim()) return
    const text = input.trim(); setInput('')
    setMessages(prev => [...prev, { sender: 'user', text }])
    setLoading(true); setError('')
    try {
      const response = await post('/api/chat', { query: text, language })
      setMessages(prev => [...prev, { sender: 'bot', text: response.text || '', audioUrl: response.audioUrl || null }])
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  /* ── 5. Web Speech API mic fix ── */
  const voice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) { setError('Voice input is not supported in this browser.'); return }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop()
      setListening(false)
      return
    }

    const rec = new SpeechRecognition()
    rec.lang = language === 'en' ? 'en-IN' : `${language}-IN`
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.continuous = false

    rec.onstart = () => setListening(true)
    rec.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput(prev => prev ? `${prev} ${transcript}` : transcript)
    }
    rec.onerror = (e) => {
      if (e.error !== 'aborted') setError('Voice input could not be processed.')
      setListening(false)
    }
    rec.onend = () => setListening(false)

    recognitionRef.current = rec
    rec.start()
  }

  /* ── 6. Toggle play/stop audio on button click ── */
  const toggleAudio = (url, idx) => {
    // If same audio is playing, stop it
    if (audioRef.current && playingIdx === idx) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
      setPlayingIdx(null)
      return
    }
    // Stop any currently playing audio first
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    const audio = new Audio(url)
    audio.onended = () => { audioRef.current = null; setPlayingIdx(null) }
    audio.play().catch(() => {})
    audioRef.current = audio
    setPlayingIdx(idx)
  }

  return <div className="chat-overlay"><section className="chat-window">
    <header><strong>AgriExpert Chat</strong><button onClick={onClose}>✕</button></header>
    <div className="messages">
      {messages.length === 0 && <p className="muted">Ask your farming question to get started.</p>}
      {messages.map((message, index) => (
        <div className={`message ${message.sender}`} key={index}>
          {message.sender === 'bot'
            ? <div className="bot-md"><ReactMarkdown>{message.text}</ReactMarkdown></div>
            : message.text}
          {/* 6. Show play/stop button for bot messages with audio */}
          {message.sender === 'bot' && message.audioUrl && (
            <button className={`play-audio-btn${playingIdx === index ? ' playing' : ''}`} onClick={() => toggleAudio(message.audioUrl, index)}>
              {playingIdx === index ? '⏹️ Stop' : t.playAudio}
            </button>
          )}
        </div>
      ))}
      {loading && <div className="message bot"><LoadingAnimation text="Thinking..." /></div>}
      <div ref={messagesEndRef} />
    </div>
    {error && <p className="error">{error}</p>}
    <form onSubmit={send}>
      <button type="button" className={listening ? 'mic-active' : ''} onClick={voice}>{listening ? '⏹️' : '🎙️'}</button>
      <input value={input} onChange={e => setInput(e.target.value)} placeholder={t.ask} />
      <button className="send-button">{t.send}</button>
    </form>
  </section></div>
}

function App() {
  const [language, setLanguage] = useState('en'); const [route, setRoute] = useState('language'); const [payload, setPayload] = useState(null)
  const [chatOpen, setChatOpen] = useState(false)
  const navigate = (nextRoute, nextPayload = null) => { setPayload(nextPayload); setRoute(nextRoute) }
  const showFab = route !== 'language'
  const app = useMemo(() => {
    if (route === 'language') return <LanguageScreen language={language} setLanguage={setLanguage} onContinue={() => navigate('home')} />
    if (route === 'home') return <Home language={language} setLanguage={setLanguage} navigate={navigate} />
    if (route === 'scan') return <Scan language={language} setLanguage={setLanguage} navigate={navigate} />
    if (route === 'result') return <Result language={language} setLanguage={setLanguage} navigate={navigate} data={payload?.result} image={payload?.image} />
    if (route === 'labs') return <Labs language={language} setLanguage={setLanguage} navigate={navigate} />
    if (route === 'news') return <News language={language} setLanguage={setLanguage} navigate={navigate} />
    if (route === 'schemes') return <Schemes language={language} setLanguage={setLanguage} navigate={navigate} />
    return <Home language={language} setLanguage={setLanguage} navigate={navigate} />
  }, [language, route, payload])
  return <div className="showcase"><div className="showcase-copy"><span className="showcase-kicker">SMART FARMING, SIMPLIFIED</span><h1>Meet <em>Agrivision</em></h1><p>A multilingual farmer-assistance companion for healthier crops, better decisions, and stronger harvests.</p><a className="install-button" href="https://expo.dev/artifacts/eas/Os8H7oZd1NBhZ8rJBATYKqqxHcNn4EtKGbRLzJijphQ.apk" target="_blank" rel="noreferrer">Install APK</a></div><div className="phone-frame"><div className="phone-speaker" /><div className="phone-screen">{app}{showFab && <div className="chat-fab-wrap">{route === 'home' && <span className="chat-fab-tooltip">Chat with me 🌱</span>}<button className="chat-fab" onClick={() => setChatOpen(true)} aria-label="Open chat">💬</button></div>}{chatOpen && <Chat language={language} onClose={() => setChatOpen(false)} />}</div></div><div className="showcase-features"><strong>Built for every field</strong><span>🌱 Crop health</span><span>🧪 Soil insights</span><span>🌾 Local guidance</span></div></div>
}

export default App
