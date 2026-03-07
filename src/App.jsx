 import { useState } from "react";
 import { db } from './firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { useState, useEffect } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #f0f2f8; --surface: #fff; --card: #fff; --sidebar: #1a1d2e;
  --accent: #4f6ef7; --accent2: #f7564a; --accent3: #2dcb8e; --accent4: #f7a825;
  --text: #1a1d2e; --muted: #8b90a7; --border: #e4e7f0;
  --shadow: 0 2px 12px rgba(79,110,247,0.08);
}
body { font-family: 'Outfit', sans-serif; background: var(--bg); color: var(--text); }
.layout { display: flex; min-height: 100vh; }
.sidebar { width: 240px; min-height: 100vh; background: var(--sidebar); display: flex; flex-direction: column; padding: 28px 0; position: fixed; top: 0; left: 0; z-index: 50; }
.brand { padding: 0 24px 24px; font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: #fff; }
.brand-sub { font-size: 10px; font-weight: 400; color: #5a6080; letter-spacing: 2px; text-transform: uppercase; display: block; margin-top: 2px; }
.divider { height: 1px; background: #252840; margin: 0 24px 14px; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 11px 24px; color: #6b7194; font-size: 14px; cursor: pointer; transition: all 0.18s; border-left: 3px solid transparent; }
.nav-item:hover { background: #252840; color: #fff; }
.nav-item.active { background: rgba(79,110,247,0.12); color: #7d9bff; border-left-color: #4f6ef7; font-weight: 500; }
.nav-icon { font-size: 17px; width: 22px; text-align: center; }
.sidebar-bottom { margin-top: auto; padding: 0 16px; }
.user-card { background: #252840; border-radius: 12px; padding: 12px 14px; display: flex; align-items: center; gap: 10px; }
.avatar { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg,#4f6ef7,#a78bfa); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 15px; flex-shrink: 0; }
.user-name { font-size: 13px; color: #fff; font-weight: 500; }
.user-role { font-size: 11px; color: #5a6080; }
.main { margin-left: 240px; flex: 1; padding: 36px 40px; }
.topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.page-title { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; }
.page-sub { font-size: 14px; color: var(--muted); margin-top: 2px; }
.stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 30px; }
.stat { background: var(--card); border-radius: 16px; padding: 20px; border: 1px solid var(--border); box-shadow: var(--shadow); position: relative; overflow: hidden; }
.stat::after { content:''; position:absolute; width:80px; height:80px; border-radius:50%; top:-20px; right:-20px; opacity:.1; }
.stat:nth-child(1)::after{background:#4f6ef7;} .stat:nth-child(2)::after{background:#2dcb8e;} .stat:nth-child(3)::after{background:#f7564a;} .stat:nth-child(4)::after{background:#f7a825;}
.stat-ico { font-size: 24px; margin-bottom: 8px; }
.stat-lbl { font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; color: var(--muted); margin-bottom: 5px; }
.stat-val { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; }
.stat-delta { font-size: 12px; color: var(--accent3); margin-top: 3px; font-weight: 500; }
.sec-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.sec-title { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; }
.btn { padding: 9px 18px; border-radius: 10px; font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; border: none; transition: all 0.18s; }
.btn-primary { background: var(--accent); color: #fff; box-shadow: 0 3px 12px rgba(79,110,247,0.3); }
.btn-primary:hover { background: #3d5ce0; transform: translateY(-1px); }
.btn-ghost { background: var(--bg); color: var(--text); border: 1px solid var(--border); }
.btn-ghost:hover { border-color: var(--accent); color: var(--accent); }
.btn-red { background: rgba(247,86,74,0.1); color: var(--accent2); border: 1px solid rgba(247,86,74,0.2); }
.btn-red:hover { background: rgba(247,86,74,0.18); }
.btn-sm { padding: 6px 13px; font-size: 12px; border-radius: 8px; }
.clubs-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.club-card { background: var(--card); border: 1px solid var(--border); border-radius: 18px; padding: 22px; transition: all 0.22s; box-shadow: var(--shadow); }
.club-card:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(79,110,247,0.13); border-color: var(--accent); }
.club-stripe { height: 5px; border-radius: 3px; margin-bottom: 16px; }
.club-ico { font-size: 28px; margin-bottom: 8px; }
.club-name { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; margin-bottom: 5px; }
.club-desc { font-size: 13px; color: var(--muted); line-height: 1.6; margin-bottom: 14px; }
.club-footer { display: flex; justify-content: space-between; align-items: center; }
.club-count { font-size: 12px; color: var(--muted); }
.club-count b { color: var(--text); }
.pill { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.pill-green { background: rgba(45,203,142,0.12); color: #1aab73; }
.pill-red { background: rgba(247,86,74,0.1); color: var(--accent2); }
.pill-blue { background: rgba(79,110,247,0.1); color: var(--accent); }
.club-btns { display: flex; gap: 8px; margin-top: 14px; }
.events-list { display: flex; flex-direction: column; gap: 10px; }
.ev-row { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 14px 18px; display: flex; align-items: center; gap: 16px; box-shadow: var(--shadow); transition: border-color 0.18s; }
.ev-row:hover { border-color: var(--accent); }
.ev-date { min-width: 52px; text-align: center; background: rgba(79,110,247,0.07); border-radius: 10px; padding: 7px 5px; border: 1px solid rgba(79,110,247,0.15); }
.ev-day { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: var(--accent); line-height: 1; }
.ev-month { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
.ev-info { flex: 1; }
.ev-name { font-weight: 600; font-size: 14px; margin-bottom: 3px; }
.ev-meta { font-size: 12px; color: var(--muted); display: flex; align-items: center; gap: 10px; }
.ev-tag { background: rgba(79,110,247,0.08); color: var(--accent); padding: 2px 9px; border-radius: 20px; font-size: 11px; }
.tbl-wrap { background: var(--card); border: 1px solid var(--border); border-radius: 18px; overflow: hidden; box-shadow: var(--shadow); }
table { width: 100%; border-collapse: collapse; }
th { padding: 11px 18px; text-align: left; font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; background: #f7f8fc; border-bottom: 1px solid var(--border); }
td { padding: 12px 18px; font-size: 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
tr:last-child td { border-bottom: none; }
tr:hover td { background: #f7f8fc; }
.td-flex { display: flex; align-items: center; gap: 10px; }
.sm-av { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff; font-size: 13px; flex-shrink: 0; }
.form-box { background: var(--card); border: 1px solid var(--border); border-radius: 20px; padding: 28px; max-width: 560px; box-shadow: var(--shadow); }
.form-box-title { font-family: 'Syne', sans-serif; font-size: 19px; font-weight: 700; margin-bottom: 22px; }
.fgroup { margin-bottom: 16px; }
.flabel { display: block; font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
.finput,.fselect,.ftextarea { width:100%; background:var(--bg); border:1.5px solid var(--border); border-radius:10px; padding:10px 13px; font-family:'Outfit',sans-serif; font-size:14px; color:var(--text); outline:none; transition:border-color 0.18s; }
.finput:focus,.fselect:focus,.ftextarea:focus { border-color:var(--accent); background:#fff; }
.ftextarea { resize:vertical; min-height:88px; }
.frow { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.form-actions { display:flex; gap:10px; margin-top:20px; }
.adm-grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-bottom:26px; }
.adm-card { background:var(--card); border:1px solid var(--border); border-radius:18px; padding:20px; box-shadow:var(--shadow); }
.adm-title { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; margin-bottom:16px; }
.prog-item { margin-bottom:12px; }
.prog-row { display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px; }
.prog-pct { color:var(--accent); font-weight:600; }
.prog-track { height:6px; background:var(--border); border-radius:4px; overflow:hidden; }
.prog-fill { height:100%; border-radius:4px; background:linear-gradient(90deg,#4f6ef7,#a78bfa); transition:width 0.5s; }
.search-row { display:flex; gap:12px; margin-bottom:18px; }
.search-in { flex:1; background:var(--card); border:1.5px solid var(--border); border-radius:10px; padding:9px 14px; font-family:'Outfit',sans-serif; font-size:14px; color:var(--text); outline:none; }
.search-in:focus { border-color:var(--accent); }
.search-in::placeholder { color:var(--muted); }
.overlay { position:fixed; inset:0; background:rgba(26,29,46,0.55); backdrop-filter:blur(6px); z-index:200; display:flex; align-items:center; justify-content:center; }
.modal { background:var(--card); border:1px solid var(--border); border-radius:20px; padding:26px; width:100%; max-width:450px; box-shadow:0 20px 60px rgba(0,0,0,0.12); }
.modal-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
.modal-ttl { font-family:'Syne',sans-serif; font-size:18px; font-weight:700; }
.close-btn { background:var(--bg); border:1px solid var(--border); color:var(--muted); width:30px; height:30px; border-radius:8px; cursor:pointer; font-size:15px; display:flex; align-items:center; justify-content:center; }
.toast { position:fixed; bottom:26px; right:26px; background:#1a1d2e; color:#fff; padding:12px 18px; border-radius:12px; font-size:14px; z-index:999; box-shadow:0 8px 30px rgba(0,0,0,0.2); animation:tin 0.3s ease; display:flex; align-items:center; gap:10px; }
@keyframes tin { from{transform:translateY(20px);opacity:0;} to{transform:translateY(0);opacity:1;} }
`;

const CLUBS = [
  { id:1, name:"Club Informatique", icon:"💻", desc:"Développement, hackathons et projets tech entre passionnés.", members:0, max:50, color:"linear-gradient(90deg,#4f6ef7,#a78bfa)", cat:"Tech",    c:"#4f6ef7" },
  { id:2, name:"Club Robotique",    icon:"🤖", desc:"Conception et programmation de robots autonomes.",          members:0, max:30, color:"linear-gradient(90deg,#2dcb8e,#38f9d7)", cat:"Tech",    c:"#2dcb8e" },
  { id:3, name:"Club Théâtre",      icon:"🎭", desc:"Arts dramatiques et expression scénique.",                  members:0, max:40, color:"linear-gradient(90deg,#f7564a,#ff8c69)", cat:"Culture", c:"#f7564a" },
  { id:4, name:"Club Photo",        icon:"📷", desc:"Photographie numérique, argentique et retouche.",           members:0, max:25, color:"linear-gradient(90deg,#f7a825,#ffd32a)", cat:"Art",     c:"#f7a825" },
  { id:5, name:"Club Échecs",       icon:"♟️", desc:"Tournois internes, entraînement et stratégie avancée.",    members:0, max:30, color:"linear-gradient(90deg,#a78bfa,#c4b5fd)", cat:"Loisir",  c:"#a78bfa" },
  { id:6, name:"Club Musique",      icon:"🎵", desc:"Groupes, jam sessions et concerts de fin d'année.",         members:0, max:30, color:"linear-gradient(90deg,#f7564a,#4f6ef7)", cat:"Art",     c:"#f76c82" },
];

const EVENTS_INIT = [
  { id:1, title:"Hackathon 48h",       club:"Club Informatique", day:"15", month:"Mar", lieu:"Amphi A",          nb:80  },
  { id:2, title:"Concours de Robots",  club:"Club Robotique",    day:"20", month:"Mar", lieu:"Hall Technique",   nb:40  },
  { id:3, title:"Soirée Théâtre",      club:"Club Théâtre",      day:"28", month:"Mar", lieu:"Auditorium",       nb:200 },
  { id:4, title:"Expo Photo Annuelle", club:"Club Photo",        day:"05", month:"Avr", lieu:"Galerie centrale", nb:120 },
  { id:5, title:"Tournoi Échecs",      club:"Club Échecs",       day:"12", month:"Avr", lieu:"Salle B12",        nb:32  },
];

const MEMBRES_INIT = [
  { id:1, nom:"Amira Benali",   email:"a.benali@univ.dz",  club:"Club Informatique", role:"Président",       c:"#4f6ef7" },
  { id:2, nom:"Karim Hadj",     email:"k.hadj@univ.dz",    club:"Club Robotique",    role:"Membre",          c:"#2dcb8e" },
  { id:3, nom:"Lina Meslem",    email:"l.meslem@univ.dz",  club:"Club Théâtre",      role:"Vice-Présidente", c:"#f7564a" },
  { id:4, nom:"Yacine Zidane",  email:"y.zidane@univ.dz",  club:"Club Photo",        role:"Membre",          c:"#f7a825" },
  { id:5, nom:"Sara Oukaci",    email:"s.oukaci@univ.dz",  club:"Club Musique",      role:"Trésorière",      c:"#a78bfa" },
  { id:6, nom:"Mohamed Bouzid", email:"m.bouzid@univ.dz",  club:"Club Échecs",       role:"Secrétaire",      c:"#f76c82" },
];

export default function App() {
  const [page, setPage]       = useState("accueil");
  const [clubs, setClubs]     = useState(CLUBS);
  const [events, setEvents]   = useState(EVENTS_INIT);
const [membres, setMembres] = useState([]);

useEffect(() => {
  const unsub = onSnapshot(collection(db, "membres"), (snapshot) => {
    setMembres(snapshot.docs.map(d => ({id: d.id, ...d.data()})));
  });
  return () => unsub();
}, []);
  const [search, setSearch]   = useState("");
  const [toast, setToast]     = useState(null);
  const [modal, setModal]     = useState(null);
  const [form, setForm]       = useState({ prenom:"", nom:"", email:"", club:"", role:"Membre", motiv:"" });
  const [newEv, setNewEv]     = useState({ title:"", club:"", day:"", month:"", lieu:"" });
  const [ncName, setNcName]   = useState(""); const [ncDesc, setNcDesc] = useState(""); const [ncIcon, setNcIcon] = useState("🎯"); const [ncMax, setNcMax] = useState("30");

  const notify = (msg, icon="✅") => { setToast({msg,icon}); setTimeout(()=>setToast(null),3000); };
  const totalM = clubs.reduce((a,c)=>a+c.members,0);

  const nav = [
    {id:"accueil",label:"Tableau de bord",icon:"📊"},
    {id:"clubs",label:"Clubs",icon:"🏛️"},
    {id:"evenements",label:"Événements",icon:"📅"},
    {id:"membres",label:"Membres",icon:"👥"},
    {id:"inscription",label:"S'inscrire",icon:"✍️"},
    {id:"admin",label:"Administration",icon:"⚙️"},
  ];

  // ── ACCUEIL
  const Accueil = () => (
    <div>
      <div className="topbar">
        <div><div className="page-title">Bienvenue 👋</div><div className="page-sub">Voici l'état de la plateforme aujourd'hui</div></div>
        <button className="btn btn-primary" onClick={()=>setPage("inscription")}>+ S'inscrire à un club</button>
      </div>
      <div className="stats">
        {[{ico:"🏛️",lbl:"Clubs actifs",val:clubs.length,delta:"+2 ce mois"},{ico:"👥",lbl:"Membres total",val:totalM,delta:"+15 ce mois"},{ico:"📅",lbl:"Événements prévus",val:events.length,delta:"ce semestre"},{ico:"🎓",lbl:"Étudiants inscrits",val:membres.length,delta:"+3 cette semaine"}].map((s,i)=>(
          <div key={i} className="stat"><div className="stat-ico">{s.ico}</div><div className="stat-lbl">{s.lbl}</div><div className="stat-val">{s.val}</div><div className="stat-delta">{s.delta}</div></div>
        ))}
      </div>
      <div className="sec-head"><div className="sec-title">🔥 Prochains événements</div><button className="btn btn-ghost btn-sm" onClick={()=>setPage("evenements")}>Voir tout →</button></div>
      <div className="events-list">
        {events.slice(0,3).map(ev=>(
          <div key={ev.id} className="ev-row">
            <div className="ev-date"><div className="ev-day">{ev.day}</div><div className="ev-month">{ev.month}</div></div>
            <div className="ev-info"><div className="ev-name">{ev.title}</div><div className="ev-meta"><span className="ev-tag">{ev.club}</span>📍 {ev.lieu} · 👤 {ev.nb} places</div></div>
            <button className="btn btn-primary btn-sm" onClick={()=>notify(`Inscrit à "${ev.title}" !`)}>Participer</button>
          </div>
        ))}
      </div>
    </div>
  );

  // ── CLUBS
  const Clubs = () => {
    const fil = clubs.filter(c=>c.name.toLowerCase().includes(search.toLowerCase()));
    return (
      <div>
        <div className="topbar"><div><div className="page-title">Clubs 🏛️</div><div className="page-sub">Rejoignez la communauté</div></div><button className="btn btn-primary" onClick={()=>setModal("club")}>+ Nouveau club</button></div>
        <div className="search-row"><input className="search-in" placeholder="🔍  Rechercher un club..." value={search} onChange={e=>setSearch(e.target.value)} /></div>
        <div className="clubs-grid">
          {fil.map(c=>(
            <div key={c.id} className="club-card">
              <div className="club-stripe" style={{background:c.color}}/>
              <div className="club-ico">{c.icon}</div>
              <div className="club-name">{c.name}</div>
              <div className="club-desc">{c.desc}</div>
              <div className="club-footer"><div className="club-count"><b>{c.members}</b> / {c.max} membres</div><span className={`pill ${c.members>=c.max?"pill-red":"pill-green"}`}>{c.members>=c.max?"Complet":"Ouvert"}</span></div>
              <div className="club-btns">
                <button className="btn btn-primary btn-sm" style={{flex:1}} onClick={()=>{if(c.members<c.max){setClubs(p=>p.map(x=>x.id===c.id?{...x,members:x.members+1}:x));notify(`Rejoint ${c.name} !`);}else notify("Ce club est complet.","⚠️");}}>Rejoindre</button>
                <button className="btn btn-ghost btn-sm">Détails</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── ÉVÉNEMENTS
  const Evenements = () => (
    <div>
      <div className="topbar"><div><div className="page-title">Événements 📅</div><div className="page-sub">Tous les événements à venir</div></div><button className="btn btn-primary" onClick={()=>setModal("event")}>+ Nouvel événement</button></div>
      <div className="events-list">
        {events.map(ev=>(
          <div key={ev.id} className="ev-row">
            <div className="ev-date"><div className="ev-day">{ev.day}</div><div className="ev-month">{ev.month}</div></div>
            <div className="ev-info"><div className="ev-name">{ev.title}</div><div className="ev-meta"><span className="ev-tag">{ev.club}</span>📍 {ev.lieu} · 👤 {ev.nb} places</div></div>
            <div style={{display:"flex",gap:8}}>
              <button className="btn btn-primary btn-sm" onClick={()=>notify(`Inscrit à "${ev.title}" !`)}>Participer</button>
              <button className="btn btn-red btn-sm" onClick={()=>{setEvents(p=>p.filter(x=>x.id!==ev.id));notify("Événement supprimé.","🗑️");}}>🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── MEMBRES
  const Membres = () => {
    const [searchMembre, setSearchMembre] = useState("");
    const fil = membres.filter(m=>m.nom.toLowerCase().includes(searchMembre.toLowerCase()));
    return (
      <div>
        <div className="topbar"><div><div className="page-title">Membres 👥</div><div className="page-sub">Liste de tous les membres</div></div><button className="btn btn-primary" onClick={()=>setModal("membre")}>+ Ajouter</button></div>
        <div className="search-row"><input className="search-in" placeholder="🔍  Rechercher un membre..." value={searchMembre} onChange={e=>setSearchMembre(e.target.value)} /></div>
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Nom</th><th>Email</th><th>Club</th><th>Rôle</th><th>Actions</th></tr></thead>
            <tbody>
              {fil.map(m=>(
                <tr key={m.id}>
                  <td><div className="td-flex"><div className="sm-av" style={{background:m.c}}>{m.nom[0]}</div>{m.nom}</div></td>
                  <td style={{color:"var(--muted)"}}>{m.email}</td>
                  <td><span className="pill pill-blue">{m.club}</span></td>
                  <td>{m.role}</td>
                  <td><button className="btn btn-red btn-sm" onClick={()=>{setMembres(p=>p.filter(x=>x.id!==m.id));notify("Membre supprimé.","🗑️");}}>Supprimer</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // ── INSCRIPTION
  const Inscription = () => {
  const [localForm, setLocalForm] = useState({ prenom:"", nom:"", email:"", club:"", motiv:"" });
  
  return (
    <div>
      <div className="topbar"><div><div className="page-title">S'inscrire ✍️</div><div className="page-sub">Rejoignez un club étudiant</div></div></div>
      <div className="form-box">
        <div className="form-box-title">Formulaire d'inscription</div>
        <div className="frow">
          <div className="fgroup"><label className="flabel">Prénom</label><input className="finput" placeholder="Ex: Amira" value={localForm.prenom} onChange={e=>setLocalForm({...localForm,prenom:e.target.value})}/></div>
          <div className="fgroup"><label className="flabel">Nom</label><input className="finput" placeholder="Ex: Benali" value={localForm.nom} onChange={e=>setLocalForm({...localForm,nom:e.target.value})}/></div>
        </div>
        <div className="fgroup"><label className="flabel">Email universitaire</label><input className="finput" type="email" placeholder="prenom.nom@univ.dz" value={localForm.email} onChange={e=>setLocalForm({...localForm,email:e.target.value})}/></div>
        <div className="fgroup"><label className="flabel">Numéro étudiant</label><input className="finput" placeholder="Ex: 2024123456"/></div>
        <div className="fgroup"><label className="flabel">Club souhaité</label>
          <select className="fselect" value={localForm.club} onChange={e=>setLocalForm({...localForm,club:e.target.value})}>
            <option value="">-- Choisir un club --</option>
            {clubs.map(c=><option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div className="fgroup"><label className="flabel">Motivation</label><textarea className="ftextarea" placeholder="Pourquoi voulez-vous rejoindre ce club ?" value={localForm.motiv} onChange={e=>setLocalForm({...localForm,motiv:e.target.value})}/></div>
        <div className="form-actions">
          <button className="btn btn-primary" onClick={()=>{
            if(localForm.prenom&&localForm.email&&localForm.club){
              setMembres(p=>[...p,{id:Date.now(),nom:`${localForm.prenom} ${localForm.nom}`,email:localForm.email,club:localForm.club,role:"Membre",c:"#4f6ef7"}]);
              notify(`Inscription au ${localForm.club} envoyée !`);
              setLocalForm({prenom:"",nom:"",email:"",club:"",motiv:""});
            } else notify("Remplissez les champs obligatoires.","⚠️");
          }}>Soumettre</button>
          <button className="btn btn-ghost" onClick={()=>setLocalForm({prenom:"",nom:"",email:"",club:"",motiv:""})}>Réinitialiser</button>
        </div>
      </div>
    </div>
  );
};

  // ── ADMIN
  const Admin = () => (
    <div>
      <div className="topbar"><div><div className="page-title">Administration ⚙️</div><div className="page-sub">Gestion complète de la plateforme</div></div></div>
      <div className="adm-grid">
        <div className="adm-card">
          <div className="adm-title">📊 Taux de remplissage</div>
          {clubs.map(c=>(
            <div key={c.id} className="prog-item">
              <div className="prog-row"><span>{c.icon} {c.name}</span><span className="prog-pct">{Math.round(c.members/c.max*100)}%</span></div>
              <div className="prog-track"><div className="prog-fill" style={{width:`${c.members/c.max*100}%`}}/></div>
            </div>
          ))}
        </div>
        <div className="adm-card">
          <div className="adm-title">👥 Répartition des membres</div>
          {clubs.map(c=>(
            <div key={c.id} className="prog-item">
              <div className="prog-row"><span>{c.icon} {c.name}</span><span className="prog-pct">{c.members} membres</span></div>
              <div className="prog-track"><div className="prog-fill" style={{width:`${c.members/totalM*100}%`,background:c.color}}/></div>
            </div>
          ))}
        </div>
      </div>
      <div className="sec-head"><div className="sec-title">🏛️ Gestion des clubs</div></div>
      <div className="tbl-wrap">
        <table>
          <thead><tr><th>Club</th><th>Catégorie</th><th>Membres</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            {clubs.map(c=>(
              <tr key={c.id}>
                <td><div className="td-flex"><span style={{fontSize:20}}>{c.icon}</span>{c.name}</div></td>
                <td><span className="pill pill-blue">{c.cat}</span></td>
                <td>{c.members} / {c.max}</td>
                <td><span className={`pill ${c.members>=c.max?"pill-red":"pill-green"}`}>{c.members>=c.max?"Complet":"Actif"}</span></td>
                <td><button className="btn btn-red btn-sm" onClick={()=>{setClubs(p=>p.filter(x=>x.id!==c.id));notify(`Club supprimé.`,"🗑️");}}>Supprimer</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const pages = {accueil:Accueil,clubs:Clubs,evenements:Evenements,membres:Membres,inscription:Inscription,admin:Admin};
  const Page = pages[page];

  return (
    <>
      <style>{CSS}</style>
      <div className="layout">

        <aside className="sidebar">
          <div className="brand">UniClubs<span className="brand-sub">Gestion des clubs</span></div>
          <div className="divider"/>
          {nav.map(n=>(
            <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={()=>{setPage(n.id);setSearch("");}}>
              <span className="nav-icon">{n.icon}</span>{n.label}
            </div>
          ))}
          <div className="sidebar-bottom">
            <div className="user-card">
              <div className="avatar">A</div>
              <div><div className="user-name">Admin</div><div className="user-role">Responsable clubs</div></div>
            </div>
          </div>
        </aside>

        <main className="main"><Page/></main>

        {toast && <div className="toast"><span>{toast.icon}</span><span>{toast.msg}</span></div>}

        {/* MODAL NOUVEAU CLUB */}
        {modal==="club" && (
          <div className="overlay" onClick={()=>setModal(null)}>
            <div className="modal" onClick={e=>e.stopPropagation()}>
              <div className="modal-head"><div className="modal-ttl">Nouveau club</div><button className="close-btn" onClick={()=>setModal(null)}>✕</button></div>
              <div className="fgroup"><label className="flabel">Nom du club</label><input className="finput" placeholder="Ex: Club IA" value={ncName} onChange={e=>setNcName(e.target.value)}/></div>
              <div className="fgroup"><label className="flabel">Description</label><textarea className="ftextarea" placeholder="Décrivez le club..." value={ncDesc} onChange={e=>setNcDesc(e.target.value)}/></div>
              <div className="frow">
                <div className="fgroup"><label className="flabel">Icône</label><input className="finput" placeholder="🎯" value={ncIcon} onChange={e=>setNcIcon(e.target.value)}/></div>
                <div className="fgroup"><label className="flabel">Places max</label><input className="finput" type="number" value={ncMax} onChange={e=>setNcMax(e.target.value)}/></div>
              </div>
              <div className="form-actions">
                <button className="btn btn-primary" onClick={()=>{
                  if(ncName){setClubs(p=>[...p,{id:Date.now(),name:ncName,desc:ncDesc,icon:ncIcon||"🎯",members:0,max:parseInt(ncMax)||30,color:"linear-gradient(90deg,#4f6ef7,#a78bfa)",cat:"Autre",c:"#4f6ef7"}]);setModal(null);notify(`Club "${ncName}" créé !`);setNcName("");setNcDesc("");setNcIcon("🎯");setNcMax("30");}else notify("Entrez un nom.","⚠️");
                }}>Créer</button>
                <button className="btn btn-ghost" onClick={()=>setModal(null)}>Annuler</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL NOUVEL ÉVÉNEMENT */}
        {modal==="event" && (
          <div className="overlay" onClick={()=>setModal(null)}>
            <div className="modal" onClick={e=>e.stopPropagation()}>
              <div className="modal-head"><div className="modal-ttl">Nouvel événement</div><button className="close-btn" onClick={()=>setModal(null)}>✕</button></div>
              <div className="fgroup"><label className="flabel">Titre</label><input className="finput" placeholder="Ex: Hackathon" value={newEv.title} onChange={e=>setNewEv({...newEv,title:e.target.value})}/></div>
              <div className="fgroup"><label className="flabel">Club organisateur</label>
                <select className="fselect" value={newEv.club} onChange={e=>setNewEv({...newEv,club:e.target.value})}>
                  <option value="">-- Choisir --</option>
                  {clubs.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="frow">
                <div className="fgroup"><label className="flabel">Jour</label><input className="finput" placeholder="15" value={newEv.day} onChange={e=>setNewEv({...newEv,day:e.target.value})}/></div>
                <div className="fgroup"><label className="flabel">Mois</label><input className="finput" placeholder="Mar" value={newEv.month} onChange={e=>setNewEv({...newEv,month:e.target.value})}/></div>
              </div>
              <div className="fgroup"><label className="flabel">Lieu</label><input className="finput" placeholder="Ex: Amphi A" value={newEv.lieu} onChange={e=>setNewEv({...newEv,lieu:e.target.value})}/></div>
              <div className="form-actions">
                <button className="btn btn-primary" onClick={()=>{
                  if(newEv.title&&newEv.club){setEvents(p=>[...p,{id:Date.now(),...newEv,nb:0}]);setModal(null);notify(`Événement "${newEv.title}" ajouté !`);setNewEv({title:"",club:"",day:"",month:"",lieu:""});}else notify("Remplissez titre et club.","⚠️");
                }}>Ajouter</button>
                <button className="btn btn-ghost" onClick={()=>setModal(null)}>Annuler</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL AJOUTER MEMBRE */}
        {modal==="membre" && (
          <div className="overlay" onClick={()=>setModal(null)}>
            <div className="modal" onClick={e=>e.stopPropagation()}>
              <div className="modal-head"><div className="modal-ttl">Ajouter un membre</div><button className="close-btn" onClick={()=>setModal(null)}>✕</button></div>
              <div className="fgroup"><label className="flabel">Nom complet</label><input className="finput" placeholder="Prénom Nom" value={form.prenom} onChange={e=>setForm({...form,prenom:e.target.value})}/></div>
              <div className="fgroup"><label className="flabel">Email</label><input className="finput" type="email" placeholder="email@univ.dz" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
              <div className="fgroup"><label className="flabel">Club</label>
                <select className="fselect" value={form.club} onChange={e=>setForm({...form,club:e.target.value})}>
                  <option value="">-- Choisir --</option>
                  {clubs.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="fgroup"><label className="flabel">Rôle</label>
                <select className="fselect" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
                  {["Membre","Président","Vice-Président","Trésorier","Secrétaire"].map(r=><option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-actions">
                <button className="btn btn-primary" onClick={()=>{
                  if(form.prenom&&form.email&&form.club){setMembres(p=>[...p,{id:Date.now(),nom:form.prenom,email:form.email,club:form.club,role:form.role,c:"#4f6ef7"}]);setModal(null);notify("Membre ajouté !");setForm({prenom:"",nom:"",email:"",club:"",role:"Membre",motiv:""});}else notify("Remplissez tous les champs.","⚠️");
                }}>Ajouter</button>
                <button className="btn btn-ghost" onClick={()=>setModal(null)}>Annuler</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
