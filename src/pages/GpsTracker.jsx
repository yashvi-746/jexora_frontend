import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const liveIcon = L.divIcon({
  html: `<div style="width:26px;height:26px;border-radius:50%;background:#6366f1;border:4px solid white;box-shadow:0 0 0 4px rgba(99,102,241,0.3),0 2px 12px rgba(99,102,241,0.5)">
    <div style="position:absolute;inset:-8px;border-radius:50%;border:2px solid rgba(99,102,241,0.4);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite"></div>
  </div>`,
  className: '', iconSize: [26, 26], iconAnchor: [13, 13],
});
const startIcon = L.divIcon({
  html: `<div style="width:20px;height:20px;border-radius:50%;background:#10b981;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:11px">S</div>`,
  className: '', iconSize: [20, 20], iconAnchor: [10, 10],
});
const midIcon = L.divIcon({
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#a78bfa;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.2)"></div>`,
  className: '', iconSize: [14, 14], iconAnchor: [7, 7],
});

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom || map.getZoom(), { animate: true });
  }, [center, zoom, map]);
  return null;
}

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 1) {
      try { map.fitBounds(L.latLngBounds(positions), { padding: [50, 50], maxZoom: 15 }); } catch {}
    }
  }, [positions.length]);
  return null;
}

const STATUS_CFG = {
  'Pending':          { c: '#94a3b8', bg: '#f8fafc' },
  'In Transit':       { c: '#f59e0b', bg: '#fffbeb' },
  'Out for Delivery': { c: '#6366f1', bg: '#f5f3ff' },
  'Delivered':        { c: '#10b981', bg: '#ecfdf5' },
  'Delayed':          { c: '#ef4444', bg: '#fef2f2' },
  'Cancelled':        { c: '#6b7280', bg: '#f9fafb' },
};
const STATUSES = Object.keys(STATUS_CFG);

const fmt = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    + ' ' + dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

export default function GpsTracker() {
  const [shipments, setShipments] = useState([]);
  const [selected, setSelected]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [liveMode, setLiveMode]   = useState(false);
  const [liveStatus, setLiveStatus] = useState('');
  const [livePos, setLivePos]     = useState(null); // { lat, lng, accuracy }
  const [liveTick, setLiveTick]   = useState(0);    // seconds until next upload
  const [gpsLoading, setGpsLoading] = useState(false);
  const [locLabel, setLocLabel]   = useState('');
  const [locNote, setLocNote]     = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [createForm, setCreateForm] = useState({ title:'', origin:'', destination:'', driver:'', vehicle:'', status:'Pending' });
  const [msg, setMsg]             = useState('');
  const liveRef  = useRef(null);
  const tickRef  = useRef(null);
  const INTERVAL = 30; // seconds between auto-uploads

  const fetchShipments = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const res  = await api.get('/shipments');
      const data = Array.isArray(res.data) ? res.data : [];
      setShipments(data);
      setSelected(prev => prev ? (data.find(s => s._id === prev._id) || prev) : prev);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchShipments(); }, []);

  // ─── LIVE MODE ────────────────────────────────────────────────────────────
  const uploadGps = useCallback((lat, lng, accuracy, label, note) => {
    if (!selected) return;
    api.post(`/shipments/${selected._id}/location`, {
      lat, lng,
      label: label || 'Live Update',
      note: note || `±${Math.round(accuracy)}m accuracy`,
    }).then(() => fetchShipments(true)).catch(console.error);
  }, [selected, fetchShipments]);

  const startLive = useCallback(() => {
    if (!selected) return showMsg('⚠️ Select a shipment first');
    if (!navigator.geolocation) return showMsg('❌ Geolocation not supported');
    setLiveMode(true);
    setLiveStatus('🟢 LIVE — watching position...');
    let secondsLeft = INTERVAL;
    // Watch position
    liveRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        setLivePos({ lat, lng, accuracy });
      },
      (err) => { setLiveStatus('⚠️ ' + err.message); },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    // Upload every INTERVAL seconds
    tickRef.current = setInterval(() => {
      secondsLeft--;
      setLiveTick(secondsLeft);
      if (secondsLeft <= 0) {
        secondsLeft = INTERVAL;
        setLivePos(prev => {
          if (prev) uploadGps(prev.lat, prev.lng, prev.accuracy, 'Auto Live', '');
          return prev;
        });
      }
    }, 1000);
  }, [selected, uploadGps]);

  const stopLive = useCallback(() => {
    if (liveRef.current)  navigator.geolocation.clearWatch(liveRef.current);
    if (tickRef.current)  clearInterval(tickRef.current);
    liveRef.current = null;
    tickRef.current = null;
    setLiveMode(false);
    setLivePos(null);
    setLiveTick(0);
    setLiveStatus('');
    showMsg('🔴 Live tracking stopped');
  }, []);

  // Stop live when component unmounts or shipment changes
  useEffect(() => () => { stopLive(); }, []);
  useEffect(() => { if (liveMode) stopLive(); }, [selected?._id]);

  // ─── MANUAL GPS ──────────────────────────────────────────────────────────
  const captureOnce = () => {
    if (!selected) return showMsg('⚠️ Select a shipment first');
    if (!navigator.geolocation) return showMsg('❌ Geolocation not supported');
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        await uploadGps(lat, lng, accuracy, locLabel || 'GPS Pin', locNote);
        setLocLabel(''); setLocNote('');
        showMsg(`✅ Recorded: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        setGpsLoading(false);
      },
      (e) => { showMsg('❌ ' + (e.code===1?'Location permission denied':e.message)); setGpsLoading(false); },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const addManual = async (e) => {
    e.preventDefault();
    const lat = parseFloat(e.target.lat.value), lng = parseFloat(e.target.lng.value);
    if (isNaN(lat)||isNaN(lng)) return showMsg('❌ Invalid coordinates');
    await api.post(`/shipments/${selected._id}/location`, { lat, lng, label: e.target.label.value||'Manual Pin', note: e.target.note.value });
    e.target.reset(); fetchShipments(true); showMsg('✅ Location added');
  };

  const createShipment = async (e) => {
    e.preventDefault();
    await api.post('/shipments/create', createForm);
    setShowForm(false);
    setCreateForm({ title:'', origin:'', destination:'', driver:'', vehicle:'', status:'Pending' });
    fetchShipments(); showMsg('✅ Shipment created!');
  };

  const updateStatus = async (id, s) => {
    await api.put(`/shipments/${id}`, { status: s }); fetchShipments(true);
  };

  const deleteShipment = async (id) => {
    if (!window.confirm('Delete shipment?')) return;
    await api.delete(`/shipments/${id}`); setSelected(null); fetchShipments();
  };

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3500); };

  const logs   = selected?.locationLog || [];
  const points = logs.map(l => [l.lat, l.lng]);
  // If live mode, prepend current position preview
  const livePoint = liveMode && livePos ? [livePos.lat, livePos.lng] : null;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
      {/* ── LIVE MODE BANNER ── */}
      {liveMode && (
        <div style={{ background:'linear-gradient(90deg,#6366f1,#8b5cf6)', color:'white', padding:'12px 20px', borderRadius:'14px', display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
          <span style={{ animation:'ping 1s ease infinite', display:'inline-block', width:12, height:12, borderRadius:'50%', background:'#fff' }}></span>
          <strong>LIVE TRACKING</strong>
          <span style={{ opacity:0.85, fontSize:'0.88rem' }}>{liveStatus}</span>
          {livePos && <span style={{ opacity:0.8, fontSize:'0.82rem' }}>📍 {livePos.lat.toFixed(5)}, {livePos.lng.toFixed(5)} ±{Math.round(livePos.accuracy)}m</span>}
          <span style={{ opacity:0.8, fontSize:'0.82rem', marginLeft:'auto' }}>Next upload in {liveTick}s</span>
          <button onClick={stopLive} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'white', padding:'6px 14px', borderRadius:'8px', cursor:'pointer', fontWeight:'700', fontFamily:'inherit' }}>
            ⏹ Stop Live
          </button>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="top-section" style={{ marginBottom:0 }}>
        <div className="page-title-wrap">
          <div className="title-icon-box" style={{ background:'#f0f9ff' }}><span style={{ fontSize:'24px' }}>🛰️</span></div>
          <h1 className="page-headline">GPS Live Tracker</h1>
        </div>
        <button className="jex-btn btn-primary" style={{ width:'auto' }} onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '+ New Shipment'}
        </button>
      </div>

      {msg && <div style={{ background:'#ecfdf5', color:'#10b981', padding:'10px 16px', borderRadius:'10px', fontWeight:'600', border:'1px solid #a7f3d0' }}>{msg}</div>}

      {/* ── CREATE FORM ── */}
      {showForm && (
        <div className="creation-card">
          <h3 style={{ fontWeight:'700', marginBottom:'1rem' }}>📦 New Shipment</h3>
          <form onSubmit={createShipment}>
            <div className="creation-grid" style={{ marginBottom:'1rem' }}>
              <div className="input-wrapper" style={{ gridColumn:'span 2' }}>
                <label className="input-label">Title *</label>
                <input className="jex-input" placeholder="e.g. Delivery to Mumbai" required value={createForm.title} onChange={e=>setCreateForm({...createForm,title:e.target.value})}/>
              </div>
              {[['origin','Origin / From','e.g. Surat Warehouse'],['destination','Destination','e.g. Mumbai Store'],['driver','Driver Name','Driver name'],['vehicle','Vehicle No.','GJ-01-AB-1234']].map(([k,l,p])=>(
                <div className="input-wrapper" key={k}>
                  <label className="input-label">{l}</label>
                  <input className="jex-input" placeholder={p} value={createForm[k]} onChange={e=>setCreateForm({...createForm,[k]:e.target.value})}/>
                </div>
              ))}
              <div className="input-wrapper">
                <label className="input-label">Status</label>
                <select className="jex-input jex-select" value={createForm.status} onChange={e=>setCreateForm({...createForm,status:e.target.value})}>
                  {STATUSES.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="jex-btn btn-primary" style={{ width:'auto' }}>🚚 Create</button>
          </form>
        </div>
      )}

      {/* ── MAIN GRID ── */}
      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:'1.2rem', alignItems:'start' }}>

        {/* LEFT — Shipment list */}
        <div style={{ display:'flex', flexDirection:'column', gap:'0.7rem', maxHeight:'80vh', overflowY:'auto' }}>
          <div style={{ fontSize:'0.8rem', fontWeight:'700', color:'var(--jex-text-muted)' }}>{shipments.length} Shipment{shipments.length!==1?'s':''}</div>
          {loading ? <div style={{ textAlign:'center', padding:'2rem', color:'var(--jex-text-muted)' }}>Loading...</div>
          : shipments.length===0 ? <div style={{ textAlign:'center', padding:'2rem', background:'white', borderRadius:'16px', color:'var(--jex-text-muted)' }}>No shipments yet.<br/>Click "+ New Shipment"</div>
          : shipments.map(s => {
            const sc = STATUS_CFG[s.status]||STATUS_CFG.Pending;
            const active = selected?._id===s._id;
            const last = s.locationLog?.[s.locationLog.length-1];
            return (
              <div key={s._id} onClick={()=>setSelected(active?null:s)} style={{ background:active?'rgba(99,102,241,0.06)':'white', border:`2px solid ${active?'var(--jex-primary)':'rgba(0,0,0,0.04)'}`, borderRadius:'14px', padding:'0.9rem', cursor:'pointer', transition:'all 0.2s' }}>
                <div style={{ display:'flex', justifyContent:'space-between', gap:'6px' }}>
                  <span style={{ fontWeight:'700', fontSize:'0.88rem' }}>{s.title}</span>
                  <span style={{ padding:'2px 8px', borderRadius:'6px', fontSize:'0.68rem', fontWeight:'800', background:sc.bg, color:sc.c, whiteSpace:'nowrap' }}>{s.status}</span>
                </div>
                {s.origin&&s.destination&&<div style={{ fontSize:'0.72rem', color:'var(--jex-text-muted)', marginTop:'3px' }}>{s.origin} → {s.destination}</div>}
                {s.driver&&<div style={{ fontSize:'0.7rem', color:'var(--jex-text-light)' }}>🚗 {s.driver}{s.vehicle&&` · ${s.vehicle}`}</div>}
                <div style={{ fontSize:'0.7rem', color:'var(--jex-text-light)', marginTop:'3px' }}>
                  📍 {s.locationLog?.length||0} pts{last&&` · ${fmt(last.recordedAt)}`}
                  {active&&liveMode&&<span style={{ marginLeft:'6px', color:'#6366f1', fontWeight:'800' }}>● LIVE</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT — Map + controls */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {/* MAP */}
          <div style={{ height:'430px', borderRadius:'20px', overflow:'hidden', border:'1px solid var(--jex-border)', boxShadow:'var(--jex-shadow-md)' }}>
            {(points.length>0||livePoint) ? (
              <MapContainer center={livePoint||points[points.length-1]} zoom={13} style={{ width:'100%',height:'100%' }} key={selected?._id}>
                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                {!liveMode && <FitBounds positions={points}/>}
                {liveMode && livePoint && <MapController center={livePoint}/>}
                {points.length>1&&<Polyline positions={points} color="#6366f1" weight={3} opacity={0.7} dashArray="8,4"/>}
                {livePoint&&points.length>0&&<Polyline positions={[points[points.length-1],livePoint]} color="#f59e0b" weight={3} dashArray="4,4" opacity={0.9}/>}
                {logs.map((loc,i)=>{
                  const isLast=i===logs.length-1&&!liveMode;
                  return (
                    <Marker key={i} position={[loc.lat,loc.lng]} icon={isLast?liveIcon:i===0?startIcon:midIcon}>
                      <Popup><strong>{loc.label}</strong><br/>📍{loc.lat.toFixed(5)},{loc.lng.toFixed(5)}<br/>🕐{fmt(loc.recordedAt)}{loc.note&&<><br/>📝{loc.note}</>}</Popup>
                    </Marker>
                  );
                })}
                {livePoint&&(
                  <Marker position={livePoint} icon={liveIcon}>
                    <Popup><strong>📡 LIVE Position</strong><br/>{livePos.lat.toFixed(5)},{livePos.lng.toFixed(5)}<br/>±{Math.round(livePos.accuracy)}m accuracy</Popup>
                  </Marker>
                )}
              </MapContainer>
            ):(
              <div style={{ width:'100%',height:'100%',background:'#f8faff',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'1rem',color:'var(--jex-text-muted)' }}>
                <span style={{ fontSize:'3rem' }}>🗺️</span>
                <p style={{ fontWeight:'600',textAlign:'center' }}>{selected?'No GPS points yet.\nAdd one below.':'Select a shipment to see its map.'}</p>
              </div>
            )}
          </div>

          {/* CONTROLS */}
          {selected&&(
            <div style={{ background:'white',borderRadius:'16px',padding:'1.3rem',boxShadow:'var(--jex-shadow-sm)',border:'1px solid var(--jex-border)' }}>
              {/* Shipment header */}
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',flexWrap:'wrap',gap:'8px' }}>
                <div>
                  <div style={{ fontWeight:'800',fontSize:'1rem' }}>{selected.title}</div>
                  <div style={{ fontSize:'0.75rem',color:'var(--jex-text-muted)' }}>{logs.length} checkpoints</div>
                </div>
                <div style={{ display:'flex',gap:'8px',flexWrap:'wrap' }}>
                  <select className="jex-input jex-select" style={{ padding:'8px 12px',fontSize:'0.82rem',width:'auto' }}
                    value={selected.status} onChange={e=>updateStatus(selected._id,e.target.value)}>
                    {STATUSES.map(s=><option key={s}>{s}</option>)}
                  </select>
                  <button className="action-link link-delete" style={{ margin:0 }} onClick={()=>deleteShipment(selected._id)}>🗑️</button>
                </div>
              </div>

              {/* ── LIVE MODE BUTTON ── */}
              <div style={{ background:liveMode?'linear-gradient(135deg,#f5f3ff,#ede9fe)':'var(--jex-bg)', borderRadius:'14px', padding:'1rem', marginBottom:'1rem', border:`2px solid ${liveMode?'var(--jex-primary)':'transparent'}` }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:liveMode?'0.8rem':'0' }}>
                  <div>
                    <div style={{ fontWeight:'800',fontSize:'0.95rem',color:liveMode?'var(--jex-primary)':'var(--jex-text-main)' }}>
                      {liveMode?'🔴 Live Tracking ON':'📡 Live GPS Tracking'}
                    </div>
                    <div style={{ fontSize:'0.75rem',color:'var(--jex-text-muted)' }}>
                      {liveMode?`Auto-uploads every ${INTERVAL}s · Next: ${liveTick}s`:'Auto-uploads your location every 30 seconds'}
                    </div>
                  </div>
                  <button onClick={liveMode?stopLive:startLive} style={{ padding:'10px 18px', borderRadius:'12px', border:'none', cursor:'pointer', fontWeight:'800', fontFamily:'inherit', fontSize:'0.88rem',
                    background:liveMode?'#ef4444':'var(--jex-btn-gradient)', color:'white', transition:'all 0.2s' }}>
                    {liveMode?'⏹ Stop':'▶ Start Live'}
                  </button>
                </div>
                {liveMode&&livePos&&(
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px',marginTop:'8px' }}>
                    {[['Latitude',livePos.lat.toFixed(6)],['Longitude',livePos.lng.toFixed(6)],['Accuracy',`±${Math.round(livePos.accuracy)}m`]].map(([l,v])=>(
                      <div key={l} style={{ background:'white',borderRadius:'10px',padding:'8px 12px',textAlign:'center' }}>
                        <div style={{ fontSize:'0.68rem',color:'var(--jex-text-muted)',fontWeight:'600' }}>{l}</div>
                        <div style={{ fontWeight:'800',fontSize:'0.88rem',color:'var(--jex-primary)' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── ONE-TIME CAPTURE ── */}
              <div style={{ background:'var(--jex-bg)',borderRadius:'12px',padding:'1rem',marginBottom:'1rem' }}>
                <div style={{ fontWeight:'700',fontSize:'0.85rem',marginBottom:'0.7rem' }}>📍 Capture Current Location (once)</div>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'8px' }}>
                  <input className="jex-input" style={{ padding:'10px',fontSize:'0.85rem' }} placeholder="Label" value={locLabel} onChange={e=>setLocLabel(e.target.value)}/>
                  <input className="jex-input" style={{ padding:'10px',fontSize:'0.85rem' }} placeholder="Note" value={locNote} onChange={e=>setLocNote(e.target.value)}/>
                </div>
                <button className="jex-btn btn-primary" style={{ width:'100%',fontSize:'0.88rem' }} disabled={gpsLoading||liveMode} onClick={captureOnce}>
                  {gpsLoading?'🔄 Getting location...':'📍 Capture My GPS Now'}
                </button>
              </div>

              {/* ── MANUAL ── */}
              <details style={{ marginBottom:'1rem' }}>
                <summary style={{ cursor:'pointer',fontSize:'0.82rem',fontWeight:'600',color:'var(--jex-text-muted)',padding:'4px 0' }}>✏️ Enter coordinates manually</summary>
                <form onSubmit={addManual} style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:'8px',marginTop:'0.8rem' }}>
                  <input name="lat" className="jex-input" style={{ padding:'10px',fontSize:'0.82rem' }} placeholder="Latitude" required/>
                  <input name="lng" className="jex-input" style={{ padding:'10px',fontSize:'0.82rem' }} placeholder="Longitude" required/>
                  <input name="label" className="jex-input" style={{ padding:'10px',fontSize:'0.82rem' }} placeholder="Label"/>
                  <input name="note" className="jex-input" style={{ padding:'10px',fontSize:'0.82rem' }} placeholder="Note"/>
                  <button type="submit" className="jex-btn btn-primary" style={{ gridColumn:'span 4',padding:'10px',fontSize:'0.85rem' }}>📌 Add Manual Location</button>
                </form>
              </details>

              {/* ── HISTORY ── */}
              {logs.length>0&&(
                <div>
                  <div style={{ fontSize:'0.82rem',fontWeight:'700',color:'var(--jex-text-muted)',marginBottom:'8px' }}>📋 Route History ({logs.length})</div>
                  <div style={{ maxHeight:'190px',overflowY:'auto',display:'flex',flexDirection:'column',gap:'5px' }}>
                    {[...logs].reverse().map((loc,i)=>(
                      <div key={i} style={{ background:'#f8faff',borderRadius:'10px',padding:'8px 12px',display:'flex',justifyContent:'space-between',alignItems:'center',border:`1px solid ${i===0?'rgba(99,102,241,0.2)':'transparent'}` }}>
                        <div>
                          <span style={{ fontWeight:'700',fontSize:'0.82rem' }}>{i===0?'📡 ':'📍 '}{loc.label}</span>
                          <div style={{ fontSize:'0.7rem',color:'var(--jex-text-muted)' }}>{loc.lat.toFixed(5)},{loc.lng.toFixed(5)}{loc.note&&` · ${loc.note}`}</div>
                        </div>
                        <span style={{ fontSize:'0.68rem',color:'var(--jex-text-light)',whiteSpace:'nowrap' }}>{fmt(loc.recordedAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes ping { 75%,100%{transform:scale(2);opacity:0} }
      `}</style>
    </div>
  );
}
