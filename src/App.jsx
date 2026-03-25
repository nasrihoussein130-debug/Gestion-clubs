import { db } from './firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { useState, useEffect, useRef } from "react";
import { auth } from './firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM — Obsidian Glass aesthetic
   Dark luxury with luminous accents, frosted glass, silk motion
═══════════════════════════════════════════════════════════════ */
const CSS = `
/* ======================
   VARIABLES
====================== */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  /* ── COLORS ── */
  --bg: #020b18; --bg2: #051529; --surface: rgba(255,255,255,0.04);
  --glass: rgba(255,255,255,0.06); --glass2: rgba(255,255,255,0.09);
  --border: rgba(255,255,255,0.08); --border2: rgba(255,255,255,0.14);

  --gold: #e8c97a; --gold2: #f5e0a0;
  --teal: #4ecdc4; --rose: #ff6b8a;
  --violet: #9b7fe8; --sky: #60aff0;

  --text: #f0f0f8; --text2: #9098b8; --text3: #5a6080;

  /* ── RADIUS ── */
  --r-sm: 10px; --r-md: 16px; --r-lg: 24px; --r-xl: 32px;

  /* ── SHADOWS ── */
  --shadow-glow: 0 0 40px rgba(232,201,122,0.08);
  --shadow-card: 0 8px 40px rgba(0,0,0,0.4);
  --shadow-lg: 0 20px 60px rgba(0,0,0,0.5);
}

/* ── GLOBAL ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: 'DM Sans', sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  overflow-x: hidden;
}

/* ── TRANSITION UTILS ── */
.transition-all { transition: all 0.25s cubic-bezier(.22,.61,.36,1); }
.transition-fast { transition: all 0.15s ease; }

/* ── SCROLLBAR ── */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 99px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
scrollbar-width: thin; scrollbar-color: var(--border2) transparent;

/* ======================
   LAYOUT
====================== */
.layout { display: flex; min-height: 100vh; position: relative; flex-direction: row; }
.main { flex: 1; margin-left: 260px; padding: 40px 48px; min-height: 100vh;
  background:
    radial-gradient(ellipse at 80% 0%, rgba(78,205,196,0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 0% 100%, rgba(155,127,232,0.04) 0%, transparent 50%),
    var(--bg);
}

/* ======================
   SIDEBAR
====================== */
.sidebar {
  width: 260px; height: 100vh; position: fixed; top: 0; left: 0;
  background: var(--bg2); border-right: 1px solid var(--border);
  display: flex; flex-direction: column; padding: 0; z-index: 100; overflow: hidden;
}
.sidebar::before {
  content: ''; position: absolute; top: -120px; left: -60px;
  width: 280px; height: 280px;
  background: radial-gradient(circle, rgba(232,201,122,0.07) 0%, transparent 70%);
  pointer-events: none;
}
.brand-area { padding: 32px 28px 24px; border-bottom: 1px solid var(--border); }
.brand-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
.brand-icon {
  width: 38px; height: 38px; border-radius: 10px;
  background: linear-gradient(135deg, var(--gold), #c9a84c);
  display: flex; align-items: center; justify-content: center; font-size: 18px;
  flex-shrink: 0; box-shadow: 0 4px 16px rgba(232,201,122,0.3);
}
.brand-name {
  font-family: 'Playfair Display', serif;
  font-size: 22px; font-weight: 700; color: var(--text); letter-spacing: -0.5px;
}

/* NAVIGATION */
.nav-section { padding: 20px 16px 0; flex: 1; overflow-y: auto; min-height: 0; }
.nav-item {
  display: flex; align-items: center; gap: 12px; padding: 10px 14px;
  border-radius: var(--r-sm); font-size: 14px; color: var(--text2);
  cursor: pointer; border: 1px solid transparent; position: relative; overflow: hidden;
}
.nav-item:hover { background: var(--glass); color: var(--text); border-color: var(--border); }
.nav-item.active {
  background: rgba(232,201,122,0.08);
  border-color: rgba(232,201,122,0.2); color: var(--gold2); font-weight: 500;
}
.nav-item.active::before {
  content: ''; position: absolute; left: 0; top: 20%; height: 60%; width: 2px;
  background: var(--gold); border-radius: 0 2px 2px 0;
}

/* SIDEBAR FOOTER */
.sidebar-footer {
  padding: 20px 16px; border-top: 1px solid var(--border); flex-shrink: 0;
  display: flex; align-items: center; gap: 12px;
}
.user-pill { padding: 12px 14px; border-radius: var(--r-md); background: var(--glass); border: 1px solid var(--border); display: flex; align-items: center; gap: 12px; }
.u-avatar { width: 34px; height: 34px; border-radius: 9px; background: linear-gradient(135deg, var(--gold), var(--violet)); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 14px; }

/* ======================
   BUTTONS
====================== */
.btn { display: inline-flex; align-items: center; gap: 7px; padding: 10px 20px; border-radius: var(--r-sm); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; border: none; white-space: nowrap; }
.btn-gold { background: linear-gradient(135deg, var(--gold), #c9a84c); color: #1a1200; box-shadow: 0 4px 20px rgba(232,201,122,0.25); }
.btn-gold:hover { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(232,201,122,0.35); }

/* ======================
   CARDS
====================== */
.card, .stat-card, .club-card { background: var(--glass); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 24px; transition: all 0.25s cubic-bezier(.22,.61,.36,1); }
.card:hover, .stat-card:hover, .club-card:hover { border-color: var(--border2); transform: translateY(-2px); box-shadow: var(--shadow-card); }

/* ======================
   FORM
====================== */
.finput, .fselect, .ftextarea { width: 100%; padding: 11px 14px; border: 1.5px solid var(--border); border-radius: var(--r-sm); background: rgba(255,255,255,0.04); color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; transition: border-color 0.25s, background 0.25s; }
.finput:focus, .fselect:focus, .ftextarea:focus { border-color: var(--gold); background: rgba(255,255,255,0.06); box-shadow: 0 0 8px var(--gold2); }

/* ======================
   LOGIN
====================== */
.login-wrap { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: radial-gradient(ellipse at 20% 50%, rgba(155,127,232,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(78,205,196,0.06) 0%, transparent 50%), var(--bg); position: relative; overflow: hidden; }
.login-card { width: 400px; padding: 44px 40px; border-radius: var(--r-xl); background: rgba(2,15,35,0.95); border: 1px solid var(--border2); box-shadow: var(--shadow-lg), 0 0 80px rgba(232,201,122,0.04); }

/* ======================
   MODAL / OVERLAY
====================== */
.overlay { position: fixed; inset: 0; background: rgba(2,11,24,0.8); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 200; }
.modal { background: #041020; border-radius: var(--r-xl); border: 1px solid var(--border2); padding: 30px; width: 100%; max-width: 460px; box-shadow: var(--shadow-lg); }

/* ======================
   MEDIA QUERIES
====================== */
@media (max-width: 768px) {
  .layout { flex-direction: column; }
  .sidebar { width: 100%; height: auto; bottom: 0; top: auto; flex-direction: row; border-top: 1px solid var(--border); }
  .sidebar-footer { position: fixed; bottom: 70px; right: 12px; }
  .main { margin-left: 0; padding: 20px 16px 90px; }
  .stats-grid { grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
  .clubs-grid { grid-template-columns: 1fr; }
  table { min-width: 500px; }
  .login-card { width: calc(100% - 32px); padding: 32px 24px; }
}
`;


/* ═══════════════════════════════════════════════════════════════
   STATIC DATA
═══════════════════════════════════════════════════════════════ */
const CLUBS = [
  { id:1, name:"Club Informatique", icon:"💻", desc:"Développement, hackathons et projets tech entre passionnés du numérique.",   max:50, color:"linear-gradient(135deg,#4f6ef7,#a78bfa)", c:"#4f6ef7", cat:"Tech"    },
  { id:2, name:"Club Robotique",    icon:"🤖", desc:"Conception et programmation de robots autonomes pour compétitions et démos.", max:30, color:"linear-gradient(135deg,#2dcb8e,#38f9d7)", c:"#2dcb8e", cat:"Tech"    },
  { id:3, name:"Club Théâtre",      icon:"🎭", desc:"Arts dramatiques, expression scénique et mises en scène originales.",         max:40, color:"linear-gradient(135deg,#ff6b8a,#ff8c69)", c:"#ff6b8a", cat:"Culture" },
  { id:4, name:"Club Photo",        icon:"📷", desc:"Photographie numérique, argentique, retouche et expositions.",                 max:25, color:"linear-gradient(135deg,#e8c97a,#f5e0a0)", c:"#e8c97a", cat:"Art"     },
  { id:5, name:"Club Échecs",       icon:"♟️", desc:"Tournois internes, entraînement tactique et stratégie avancée.",              max:30, color:"linear-gradient(135deg,#9b7fe8,#c4b5fd)", c:"#9b7fe8", cat:"Loisir"  },
  { id:6, name:"Club Musique",      icon:"🎵", desc:"Groupes, jam sessions, covers et concerts de fin d'année.",                   max:30, color:"linear-gradient(135deg,#ff6b8a,#9b7fe8)", c:"#ff6b8a", cat:"Art"     },
];

const BADGE_CAT = { Tech:"badge-sky", Culture:"badge-violet", Art:"badge-gold", Loisir:"badge-teal" };

/* ═══════════════════════════════════════════════════════════════
   APP
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage]       = useState("accueil");
  const [clubs, setClubs]     = useState(CLUBS);
  const [events, setEvents]   = useState([]);
  const [membres, setMembres] = useState([]);
  const [user, setUser]       = useState(null);
  const [editClub, setEditClub]     = useState(null);
  const [membreEdit, setMembreEdit] = useState(null);
  const [votes, setVotes]     = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [search, setSearch]   = useState("");
  const [toast, setToast]     = useState(null);
  const [modal, setModal]     = useState(null);
  const [form, setForm]       = useState({ prenom:"", nom:"", email:"", club:"", role:"Membre" });
  const [newEv, setNewEv]     = useState({ title:"", club:"", day:"", month:"", lieu:"" });
  const [ncName, setNcName]   = useState(""); const [ncDesc, setNcDesc] = useState("");
  const [ncIcon, setNcIcon]   = useState("🎯"); const [ncMax, setNcMax] = useState("30");

  useEffect(() => { onAuthStateChanged(auth, u => setUser(u)); }, []);
  useEffect(() => { const u = onSnapshot(collection(db,"membres"),  s => setMembres(s.docs.map(d=>({id:d.id,...d.data()})))); return ()=>u(); }, []);
  useEffect(() => { const u = onSnapshot(collection(db,"evenements"),s => setEvents(s.docs.map(d=>({id:d.id,...d.data()})))); return ()=>u(); }, []);
  useEffect(() => { const u = onSnapshot(collection(db,"clubs"),    s => setClubs([...CLUBS,...s.docs.map(d=>({id:d.id,...d.data()}))])); return ()=>u(); }, []);
  useEffect(() => { const u = onSnapshot(collection(db,"votes"),    s => setVotes(s.docs.map(d=>({id:d.id,...d.data()})))); return ()=>u(); }, []);
  useEffect(() => { const u = onSnapshot(collection(db,"paiements"),s => setPaiements(s.docs.map(d=>({id:d.id,...d.data()})))); return ()=>u(); }, []);

  const notify = (msg, ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3200); };
  const isAdmin = user?.email === "nasri@uniclubs.dz";

  /* ─ NAV ─ */
  const nav = [
    { id:"accueil",    label:"Tableau de bord", icon:"◈",  group:"Principal" },
    { id:"clubs",      label:"Clubs",           icon:"⬡",  group:"Principal" },
    { id:"evenements", label:"Événements",      icon:"◎",  group:"Principal" },
    { id:"inscription",label:"S'inscrire",      icon:"⊕",  group:"Principal" },
    { id:"votes",      label:"Votes",           icon:"◉",  group:"Étudiant"  },
    { id:"paiements",  label:"Paiements",       icon:"◇",  group:"Étudiant"  },
    ...(isAdmin ? [
      { id:"membres",    label:"Membres",         icon:"⊞",  group:"Admin" },
      { id:"admin",      label:"Administration",  icon:"⚙",  group:"Admin" },
    ] : []),
  ];

  /* ─ LOGIN ─ */
  const Login = () => {
    const [nom,setNom]=useState(""); const [prenom,setPrenom]=useState("");
    const [emailPerso,setEmailPerso]=useState(""); const [email,setEmail]=useState("");
    const [password,setPassword]=useState(""); const [mode,setMode]=useState(null);

    const inputStyle = {
      width:"100%", padding:"12px 16px", borderRadius:10,
      background:"rgba(255,255,255,0.04)", border:"1.5px solid rgba(255,255,255,0.1)",
      fontSize:14, color:"#f0f0f8", outline:"none", boxSizing:"border-box",
      fontFamily:"'DM Sans',sans-serif", transition:"border-color 0.2s",
    };
    const lbl = { fontSize:11, fontWeight:600, color:"#5a6080", display:"block",
      marginBottom:6, textTransform:"uppercase", letterSpacing:"1.2px" };

    return (
      <div className="login-wrap">
        <div className="login-bg-text">UC</div>
        <div className="login-card">
          <div className="login-logo">
            <div className="login-icon">🏛️</div>
            <div className="login-brand">UniClubs</div>
            <div className="login-univ">Université de Djibouti</div>
          </div>

          {!mode && (
            <div className="mode-btns">
              <button className="mode-btn mode-btn-admin" onClick={()=>setMode("admin")}>
                <div className="mode-btn-ico">🔐</div>
                <div><div>Administrateur</div><div className="mode-btn-text">Accès complet à la plateforme</div></div>
              </button>
              <button className="mode-btn mode-btn-student" onClick={()=>setMode("etudiant")}>
                <div className="mode-btn-ico">👨‍🎓</div>
                <div><div>Étudiant</div><div className="mode-btn-text">Gérez vos clubs et activités</div></div>
              </button>
            </div>
          )}

          {mode === "admin" && <>
            <button className="back-btn" onClick={()=>setMode(null)}>← Retour</button>
            <div className="fgroup"><label style={lbl}>Email</label><input style={inputStyle} placeholder="email@uniclubs.dz" value={email} onChange={e=>setEmail(e.target.value)}/></div>
            <div className="fgroup" style={{marginBottom:24}}><label style={lbl}>Mot de passe</label><input style={inputStyle} type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)}/></div>
            <button className="btn btn-gold" style={{width:"100%",justifyContent:"center",padding:"14px"}} onClick={()=>signInWithEmailAndPassword(auth,email,password).catch(()=>alert("Identifiants incorrects !"))}>
              Se connecter →
            </button>
          </>}

          {mode === "etudiant" && <>
            <button className="back-btn" onClick={()=>setMode(null)}>← Retour</button>
            <div className="fgroup"><label style={lbl}>Numéro étudiant</label><input style={inputStyle} placeholder="Ex : 2024123456" value={email} onChange={e=>setEmail(e.target.value)}/></div>
            <div className="fgroup" style={{marginBottom:24}}><label style={lbl}>Mot de passe</label><input style={inputStyle} type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)}/></div>
            <button className="btn btn-teal" style={{width:"100%",justifyContent:"center",padding:"14px",marginBottom:14}} onClick={async()=>{
              try { const cred=await signInWithEmailAndPassword(auth,`${email}@uniclubs.dz`,password);
                const {getDoc,doc:fd}=await import("firebase/firestore");
                const snap=await getDoc(fd(db,"etudiants",cred.user.uid));
                if(!snap.exists()){await auth.signOut();alert("Compte introuvable.");}
              } catch{ alert("Numéro étudiant ou mot de passe incorrect !"); }
            }}>Se connecter →</button>
            <div style={{textAlign:"center",fontSize:13,color:"#5a6080"}}>
              Nouveau ? <span className="login-link" onClick={()=>setMode("inscription")}>Créer un compte</span>
            </div>
          </>}

          {mode === "inscription" && <>
            <button className="back-btn" onClick={()=>setMode("etudiant")}>← Retour</button>
            <div style={{display:"flex",gap:12,marginBottom:16}}>
              <div style={{flex:1}}><label style={lbl}>Prénom</label><input style={inputStyle} placeholder="Ahmed" value={prenom} onChange={e=>setPrenom(e.target.value)}/></div>
              <div style={{flex:1}}><label style={lbl}>Nom</label><input style={inputStyle} placeholder="Hassan" value={nom} onChange={e=>setNom(e.target.value)}/></div>
            </div>
            <div className="fgroup"><label style={lbl}>Email</label><input style={inputStyle} placeholder="ahmed@gmail.com" value={emailPerso} onChange={e=>setEmailPerso(e.target.value)}/></div>
            <div className="fgroup"><label style={lbl}>Numéro étudiant</label><input style={inputStyle} placeholder="2024123456" value={email} onChange={e=>setEmail(e.target.value)}/></div>
            <div className="fgroup" style={{marginBottom:24}}><label style={lbl}>Mot de passe</label><input style={inputStyle} type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)}/></div>
            <button className="btn btn-teal" style={{width:"100%",justifyContent:"center",padding:"14px"}} onClick={()=>
              createUserWithEmailAndPassword(auth,`${email}@uniclubs.dz`,password)
                .then(uc=>{setDoc(doc(db,"etudiants",uc.user.uid),{nom,prenom,email:emailPerso,numeroEtudiant:email,createdAt:new Date()});alert("Compte créé !");})
                .catch(()=>alert("Erreur lors de la création."))
            }>Créer mon compte →</button>
          </>}
        </div>
      </div>
    );
  };

  if (!user) return (<><style>{CSS}</style><Login/></>);

  /* ─ ACCUEIL ─ */
  const Accueil = () => (
    <div style={{animation:"slideUp 0.35s ease"}}>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Vue d'ensemble</div>
          <div className="page-title">Tableau de bord</div>
          <div className="page-sub">Bienvenue sur la plateforme UniClubs de Djibouti</div>
        </div>
        <button className="btn btn-gold" onClick={()=>setPage("inscription")}>⊕ S'inscrire à un club</button>
      </div>

      <div className="stats-grid">
        {[
          {label:"Clubs actifs",        val:clubs.length, delta:"+2 ce mois",      ico:"⬡", accent:"rgba(232,201,122,0.1)",  c:"var(--gold)"},
          {label:"Membres total",       val:membres.length,delta:"+15 ce mois",    ico:"⊞", accent:"rgba(78,205,196,0.1)",   c:"var(--teal)"},
          {label:"Événements prévus",   val:events.length, delta:"ce semestre",    ico:"◎", accent:"rgba(155,127,232,0.1)",  c:"var(--violet)"},
          {label:"Étudiants inscrits",  val:membres.length,delta:"+3 cette semaine",ico:"◈",accent:"rgba(96,175,240,0.1)",  c:"var(--sky)"},
        ].map((s,i)=>(
          <div key={i} className="stat-card">
            <div className="stat-accent" style={{background:s.accent,color:s.c}}>{s.ico}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{color:s.c}}>{s.val}</div>
            <div className="stat-delta">↑ {s.delta}</div>
          </div>
        ))}
      </div>

      <div className="section-header">
        <div className="section-title">Prochains événements</div>
        <button className="btn btn-ghost btn-sm" onClick={()=>setPage("evenements")}>Tout voir →</button>
      </div>
      <div className="events-list">
        {events.slice(0,3).map(ev=>(
          <div key={ev.id} className="ev-row">
            <div className="ev-date"><div className="ev-day">{ev.day}</div><div className="ev-month">{ev.month}</div></div>
            <div className="ev-info">
              <div className="ev-name">{ev.title}</div>
              <div className="ev-meta"><span className="ev-tag">{ev.club}</span><span>📍 {ev.lieu}</span></div>
            </div>
            <button className="btn btn-gold btn-sm" onClick={()=>notify(`Inscrit à « ${ev.title} » !`)}>Participer</button>
          </div>
        ))}
        {events.length === 0 && <div className="empty-state"><div className="empty-icon">📅</div><div className="empty-text">Aucun événement pour le moment</div></div>}
      </div>
    </div>
  );

  /* ─ CLUBS ─ */
  const Clubs = ({isAdmin=false}) => {
    const fil = clubs.filter(c=>c.name.toLowerCase().includes(search.toLowerCase()));
    return (
      <div style={{animation:"slideUp 0.35s ease"}}>
        <div className="page-header">
          <div>
            <div className="page-eyebrow">Communauté</div>
            <div className="page-title">Clubs étudiants</div>
            <div className="page-sub">{clubs.length} clubs disponibles à l'Université de Djibouti</div>
          </div>
          {isAdmin && <button className="btn btn-gold" onClick={()=>setModal("club")}>⊕ Nouveau club</button>}
        </div>
        <div className="search-bar"><input placeholder="Rechercher un club..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
        <div className="clubs-grid">
          {fil.map(c=>{
            const nb = membres.filter(m=>m.club===c.name).length;
            const full = nb >= c.max;
            return (
              <div key={c.id} className="club-card">
                <div className="club-bar" style={{background:c.color}}/>
                <span className="club-icon">{c.icon}</span>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div className="club-name">{c.name}</div>
                  <span className={`badge ${BADGE_CAT[c.cat]||"badge-gold"}`}>{c.cat}</span>
                </div>
                <div className="club-desc">{c.desc}</div>
                <div className="club-meta">
                  <div className="club-count"><b>{nb}</b> / {c.max} membres</div>
                  <span className={`badge ${full?"badge-rose":"badge-teal"}`}>{full?"◉ Complet":"◉ Ouvert"}</span>
                </div>
                <div className="club-actions">
                  <button className="btn btn-gold btn-sm" style={{flex:1}} onClick={()=>{if(!full)setPage("inscription");else notify("Ce club est complet.",false);}}>
                    Rejoindre
                  </button>
                  <button className="btn btn-ghost btn-sm">Détails</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* ─ ÉVÉNEMENTS ─ */
  const Evenements = ({isAdmin=false}) => (
    <div style={{animation:"slideUp 0.35s ease"}}>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Agenda</div>
          <div className="page-title">Événements</div>
          <div className="page-sub">Tous les événements à venir ce semestre</div>
        </div>
        {isAdmin && <button className="btn btn-gold" onClick={()=>setModal("event")}>⊕ Nouvel événement</button>}
      </div>
      <div className="events-list">
        {events.map(ev=>(
          <div key={ev.id} className="ev-row">
            <div className="ev-date"><div className="ev-day">{ev.day}</div><div className="ev-month">{ev.month}</div></div>
            <div className="ev-info">
              <div className="ev-name">{ev.title}</div>
              <div className="ev-meta"><span className="ev-tag">{ev.club}</span><span>📍 {ev.lieu}</span><span>👥 {ev.nb||0} places</span></div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button className="btn btn-gold btn-sm" onClick={()=>notify(`Inscrit à « ${ev.title} » !`)}>Participer</button>
              {isAdmin && <button className="btn btn-rose btn-sm" onClick={()=>{deleteDoc(doc(db,"evenements",ev.id));notify("Événement supprimé.");}}>🗑</button>}
            </div>
          </div>
        ))}
        {events.length===0 && <div className="empty-state"><div className="empty-icon">📅</div><div className="empty-text">Aucun événement planifié</div><div className="empty-sub">L'administrateur peut en ajouter depuis le panneau admin</div></div>}
      </div>
    </div>
  );

  /* ─ MEMBRES ─ */
  const Membres = ({isAdmin=false}) => {
    const [sm,setSm]=useState("");
    const fil = membres.filter(m=>(m.nom||"").toLowerCase().includes(sm.toLowerCase()));
    return (
      <div style={{animation:"slideUp 0.35s ease"}}>
        <div className="page-header">
          <div><div className="page-eyebrow">Répertoire</div><div className="page-title">Membres</div><div className="page-sub">{membres.length} membres enregistrés</div></div>
          {isAdmin && <button className="btn btn-gold" onClick={()=>setModal("membre")}>⊕ Ajouter</button>}
        </div>
        <div className="search-bar"><input placeholder="Rechercher un membre..." value={sm} onChange={e=>setSm(e.target.value)}/></div>
        {fil.length===0 ? (
          <div className="empty-state"><div className="empty-icon">👥</div><div className="empty-text">Aucun membre trouvé</div></div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Membre</th><th>Email</th><th>Club</th><th>Rôle</th>{isAdmin&&<th>Actions</th>}</tr></thead>
              <tbody>
                {fil.map(m=>(
                  <tr key={m.id}>
                    <td><div className="td-name"><div className="av" style={{background:m.c||"#4f6ef7"}}>{(m.nom||"?")[0]}</div>{m.nom}</div></td>
                    <td style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12}}>{m.email}</td>
                    <td><span className="badge badge-sky">{m.club}</span></td>
                    <td><span className="badge badge-gold">{m.role}</span></td>
                    {isAdmin&&<td><div style={{display:"flex",gap:6}}>
                      <button className="btn btn-teal btn-xs" onClick={()=>{setMembreEdit(m);setForm({prenom:m.nom,email:m.email,club:m.club,role:m.role});setModal("membre");}}>Modifier</button>
                      <button className="btn btn-rose btn-xs" onClick={()=>{deleteDoc(doc(db,"membres",m.id));notify("Membre supprimé.");}}>Supprimer</button>
                    </div></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  /* ─ INSCRIPTION ─ */
  const Inscription = () => {
    const [f,setF]=useState({prenom:"",nom:"",email:"",club:"",motiv:""});
    return (
      <div style={{animation:"slideUp 0.35s ease"}}>
        <div className="page-header"><div><div className="page-eyebrow">Rejoindre</div><div className="page-title">Inscription à un club</div><div className="page-sub">Complétez le formulaire ci-dessous</div></div></div>
        <div className="form-card">
          <div className="form-title">Formulaire d'inscription</div>
          <div className="frow">
            <div className="fgroup"><label className="flabel">Prénom</label><input className="finput" placeholder="Amira" value={f.prenom} onChange={e=>setF({...f,prenom:e.target.value})}/></div>
            <div className="fgroup"><label className="flabel">Nom</label><input className="finput" placeholder="Benali" value={f.nom} onChange={e=>setF({...f,nom:e.target.value})}/></div>
          </div>
          <div className="fgroup"><label className="flabel">Email universitaire</label><input className="finput" type="email" placeholder="prenom.nom@univ.dj" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/></div>
          <div className="fgroup"><label className="flabel">Numéro étudiant</label><input className="finput" placeholder="2024123456"/></div>
          <div className="fgroup"><label className="flabel">Club souhaité</label>
            <select className="fselect" value={f.club} onChange={e=>setF({...f,club:e.target.value})}>
              <option value="">— Choisir un club —</option>
              {clubs.map(c=><option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div className="fgroup"><label className="flabel">Motivation</label><textarea className="ftextarea" placeholder="Pourquoi souhaitez-vous rejoindre ce club ?" value={f.motiv} onChange={e=>setF({...f,motiv:e.target.value})}/></div>
          <div className="form-actions">
            <button className="btn btn-gold" onClick={()=>{
              if(f.prenom&&f.email&&f.club){
                addDoc(collection(db,"membres"),{nom:`${f.prenom} ${f.nom}`,email:f.email,club:f.club,role:"Membre",c:"#4f6ef7"});
                notify(`Inscription au ${f.club} envoyée !`);
                setF({prenom:"",nom:"",email:"",club:"",motiv:""});
              } else notify("Remplissez les champs obligatoires.",false);
            }}>Soumettre</button>
            <button className="btn btn-ghost" onClick={()=>setF({prenom:"",nom:"",email:"",club:"",motiv:""})}>Réinitialiser</button>
          </div>
        </div>
      </div>
    );
  };

  /* ─ VOTES ─ */
  const Votes = () => {
    const [msg,setMsg]=useState("");
    const aVote = id => votes.some(v=>v.clubId===id&&v.etudiantId===user.uid);
    async function voter(id,choix){
      if(aVote(id)){setMsg("error:Tu as déjà voté pour ce club.");return;}
      await addDoc(collection(db,"votes"),{etudiantId:user.uid,clubId:id,choix,date:new Date()});
      setMsg("ok:Vote enregistré !");setTimeout(()=>setMsg(""),3000);
    }
    const ok = msg.startsWith("ok:");
    return (
      <div style={{animation:"slideUp 0.35s ease"}}>
        <div className="page-header"><div><div className="page-eyebrow">Démocratie</div><div className="page-title">Votes</div><div className="page-sub">Exprimez votre soutien aux clubs</div></div></div>
        {msg && <div className={`alert ${ok?"alert-success":"alert-error"}`}><span>{ok?"✓":"✗"}</span>{msg.slice(3)}</div>}
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Club</th><th>Statut</th><th>Mon vote</th><th>Action</th></tr></thead>
            <tbody>
              {clubs.map(c=>{
                const mv=votes.find(v=>v.clubId===c.id&&v.etudiantId===user.uid);
                return (
                  <tr key={c.id}>
                    <td><div className="td-name"><span style={{fontSize:18}}>{c.icon}</span>{c.name}</div></td>
                    <td><span className={`badge ${mv?"badge-teal":"badge-gold"}`}>{mv?"✓ Voté":"En attente"}</span></td>
                    <td style={{fontWeight:500}}>{mv ? (mv.choix==="pour"?"👍 Pour":"👎 Contre") : <span style={{color:"var(--text3)"}}>—</span>}</td>
                    <td>{!mv ? (
                      <div style={{display:"flex",gap:8}}>
                        <button className="btn btn-teal btn-xs" onClick={()=>voter(c.id,"pour")}>👍 Pour</button>
                        <button className="btn btn-rose btn-xs" onClick={()=>voter(c.id,"contre")}>👎 Contre</button>
                      </div>
                    ) : <span style={{color:"var(--text3)",fontSize:12}}>Déjà voté</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  /* ─ PAIEMENTS ─ */
  const Paiements = () => {
    const [selClub,setSelClub]=useState(""); const [montant,setMontant]=useState(""); const [msg,setMsg]=useState("");
    const mesPaie = paiements.filter(p=>p.etudiantId===user.uid);
    const nomClub = id => clubs.find(c=>c.id===id)?.name||id;
    async function payer(){
      if(!selClub||!montant){setMsg("error:Remplis tous les champs.");return;}
      await addDoc(collection(db,"paiements"),{etudiantId:user.uid,clubId:selClub,montant:parseFloat(montant),date:new Date(),statut:"en attente"});
      setMsg("ok:Paiement soumis !");setSelClub("");setMontant("");setTimeout(()=>setMsg(""),3000);
    }
    const ok=msg.startsWith("ok:");
    return (
      <div style={{animation:"slideUp 0.35s ease"}}>
        <div className="page-header"><div><div className="page-eyebrow">Cotisations</div><div className="page-title">Paiements</div><div className="page-sub">Gérez vos cotisations aux clubs</div></div></div>
        <div className="form-card" style={{marginBottom:28}}>
          <div className="form-title">Nouveau paiement</div>
          {msg && <div className={`alert ${ok?"alert-success":"alert-error"}`}>{msg.slice(3)}</div>}
          <div className="frow">
            <div className="fgroup"><label className="flabel">Club</label>
              <select className="fselect" value={selClub} onChange={e=>setSelClub(e.target.value)}>
                <option value="">— Sélectionner —</option>
                {clubs.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div className="fgroup"><label className="flabel">Montant (DJF)</label><input className="finput" type="number" placeholder="Ex : 2000" value={montant} onChange={e=>setMontant(e.target.value)}/></div>
          </div>
          <div className="form-actions">
            <button className="btn btn-gold" onClick={payer}>Soumettre le paiement</button>
            <button className="btn btn-ghost" onClick={()=>{setSelClub("");setMontant("");}}>Réinitialiser</button>
          </div>
        </div>
        <div className="section-header"><div className="section-title">Historique</div></div>
        {mesPaie.length===0 ? (
          <div className="empty-state"><div className="empty-icon">💸</div><div className="empty-text">Aucun paiement enregistré</div></div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Club</th><th>Montant</th><th>Statut</th><th>Date</th></tr></thead>
              <tbody>
                {mesPaie.map(p=>(
                  <tr key={p.id}>
                    <td>{nomClub(p.clubId)}</td>
                    <td style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:500,color:"var(--gold)"}}>{p.montant} DJF</td>
                    <td><span className={`badge ${p.statut==="payé"?"badge-teal":"badge-gold"}`}>{p.statut}</span></td>
                    <td style={{color:"var(--text3)"}}>{p.date?.toDate?.().toLocaleDateString("fr-FR")||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  /* ─ ADMIN ─ */
  const Admin = () => (
    <div style={{animation:"slideUp 0.35s ease"}}>
      <div className="page-header"><div><div className="page-eyebrow">Système</div><div className="page-title">Administration</div><div className="page-sub">Gestion complète de la plateforme</div></div></div>
      <div className="adm-grid">
        <div className="adm-card">
          <div className="adm-title">Taux de remplissage</div>
          {clubs.map(c=><div key={c.id} className="prog-item">
            <div className="prog-row"><span>{c.icon} {c.name}</span><span className="prog-pct">{Math.round(membres.filter(m=>m.club===c.name).length/c.max*100)}%</span></div>
            <div className="prog-track"><div className="prog-fill" style={{width:`${membres.filter(m=>m.club===c.name).length/c.max*100}%`}}/></div>
          </div>)}
        </div>
        <div className="adm-card">
          <div className="adm-title">Répartition des membres</div>
          {clubs.map(c=><div key={c.id} className="prog-item">
            <div className="prog-row"><span>{c.icon} {c.name}</span><span className="prog-pct">{membres.filter(m=>m.club===c.name).length} membres</span></div>
            <div className="prog-track"><div className="prog-fill" style={{width:`${membres.length?membres.filter(m=>m.club===c.name).length/membres.length*100:0}%`,background:c.color}}/></div>
          </div>)}
        </div>
      </div>

      {editClub && (
        <div className="overlay" onClick={()=>setEditClub(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-head"><div className="modal-ttl">Modifier le club</div><button className="close-btn" onClick={()=>setEditClub(null)}>✕</button></div>
            <div className="fgroup"><label className="flabel">Nom</label><input className="finput" value={editClub.name} onChange={e=>setEditClub({...editClub,name:e.target.value})}/></div>
            <div className="fgroup"><label className="flabel">Catégorie</label><input className="finput" value={editClub.cat} onChange={e=>setEditClub({...editClub,cat:e.target.value})}/></div>
            <div className="fgroup"><label className="flabel">Capacité max</label><input type="number" className="finput" value={editClub.max} onChange={e=>setEditClub({...editClub,max:Number(e.target.value)})}/></div>
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={()=>setEditClub(null)}>Annuler</button>
              <button className="btn btn-gold" onClick={async()=>{
                if(typeof editClub.id==="string") await updateDoc(doc(db,"clubs",editClub.id),{name:editClub.name,cat:editClub.cat,max:editClub.max});
                setClubs(p=>p.map(x=>x.id===editClub.id?editClub:x));
                setEditClub(null); notify("Club modifié !");
              }}>Sauvegarder</button>
            </div>
          </div>
        </div>
      )}

      <div className="section-header"><div className="section-title">Gestion des clubs</div></div>
      <div className="tbl-wrap">
        <table>
          <thead><tr><th>Club</th><th>Catégorie</th><th>Membres</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            {clubs.map(c=>{
              const nb=membres.filter(m=>m.club===c.name).length;
              return (
                <tr key={c.id}>
                  <td><div className="td-name"><span style={{fontSize:18}}>{c.icon}</span>{c.name}</div></td>
                  <td><span className={`badge ${BADGE_CAT[c.cat]||"badge-gold"}`}>{c.cat}</span></td>
                  <td style={{fontFamily:"'JetBrains Mono',monospace"}}>{nb} / {c.max}</td>
                  <td><span className={`badge ${nb>=c.max?"badge-rose":"badge-teal"}`}>{nb>=c.max?"Complet":"Actif"}</span></td>
                  <td><div style={{display:"flex",gap:6}}>
                    <button className="btn btn-teal btn-xs" onClick={()=>setEditClub(c)}>Modifier</button>
                    <button className="btn btn-rose btn-xs" onClick={()=>{if(typeof c.id==="string")deleteDoc(doc(db,"clubs",c.id));else setClubs(p=>p.filter(x=>x.id!==c.id));notify("Club supprimé.");}}>Supprimer</button>
                  </div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  /* ─ ROUTING ─ */
  const Clubs2     = () => <Clubs     isAdmin={isAdmin}/>;
  const Evenements2= () => <Evenements isAdmin={isAdmin}/>;
  const Membres2   = () => <Membres   isAdmin={isAdmin}/>;
  const pages = { accueil:Accueil, clubs:Clubs2, evenements:Evenements2, membres:Membres2,
                  inscription:Inscription, votes:Votes, paiements:Paiements, admin:Admin };
  const Page = pages[page];

  /* ─ GROUP SIDEBAR NAV ─ */
  const groups = [...new Set(nav.map(n=>n.group))];

  return (
    <>
      <style>{CSS}</style>
      <div className="layout">

        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="brand-area">
            <div className="brand-logo">
              <div className="brand-icon">🏛️</div>
              <div className="brand-name">UniClubs</div>
            </div>
            <div className="brand-sub">Université de Djibouti</div>
          </div>
          <div className="nav-section">
            {groups.map(g=>(
              <div key={g}>
                <div className="nav-label">{g}</div>
                {nav.filter(n=>n.group===g).map(n=>(
                  <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={()=>{setPage(n.id);setSearch("");}}>
                    <span className="nav-icon" style={{fontFamily:"monospace"}}>{n.icon}</span>
                    {n.label}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="sidebar-footer">
            <div className="user-pill">
              <div className="u-avatar">{user.email[0].toUpperCase()}</div>
              <div>
                <div className="u-name">{isAdmin?"Administrateur":"Étudiant"}</div>
                <div className="u-role">{user.email}</div>
              </div>
              <button className="u-logout" title="Déconnexion" onClick={()=>signOut(auth)}>⏻</button>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main"><Page/></main>

        {/* TOAST */}
        {toast && (
          <div className="toast">
            <div className="toast-dot" style={{background: toast.ok?"var(--teal)":"var(--rose)", boxShadow:`0 0 8px ${toast.ok?"var(--teal)":"var(--rose)"}`}}/>
            {toast.msg}
          </div>
        )}

        {/* MODAL — NOUVEAU CLUB */}
        {modal==="club" && (
          <div className="overlay" onClick={()=>setModal(null)}>
            <div className="modal" onClick={e=>e.stopPropagation()}>
              <div className="modal-head"><div className="modal-ttl">Nouveau club</div><button className="close-btn" onClick={()=>setModal(null)}>✕</button></div>
              <div className="fgroup"><label className="flabel">Nom du club</label><input className="finput" placeholder="Club IA" value={ncName} onChange={e=>setNcName(e.target.value)}/></div>
              <div className="fgroup"><label className="flabel">Description</label><textarea className="ftextarea" placeholder="Décrivez le club..." value={ncDesc} onChange={e=>setNcDesc(e.target.value)}/></div>
              <div className="frow">
                <div className="fgroup"><label className="flabel">Icône</label><input className="finput" placeholder="🎯" value={ncIcon} onChange={e=>setNcIcon(e.target.value)}/></div>
                <div className="fgroup"><label className="flabel">Places max</label><input className="finput" type="number" value={ncMax} onChange={e=>setNcMax(e.target.value)}/></div>
              </div>
              <div className="form-actions">
                <button className="btn btn-gold" onClick={()=>{
                  if(ncName){addDoc(collection(db,"clubs"),{name:ncName,desc:ncDesc,icon:ncIcon||"🎯",max:parseInt(ncMax)||30,color:"linear-gradient(135deg,#4f6ef7,#a78bfa)",cat:"Autre",c:"#4f6ef7"});setModal(null);notify(`Club "${ncName}" créé !`);setNcName("");setNcDesc("");setNcIcon("🎯");setNcMax("30");}else notify("Entrez un nom.",false);
                }}>Créer le club</button>
                <button className="btn btn-ghost" onClick={()=>setModal(null)}>Annuler</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL — NOUVEL ÉVÉNEMENT */}
        {modal==="event" && (
          <div className="overlay" onClick={()=>setModal(null)}>
            <div className="modal" onClick={e=>e.stopPropagation()}>
              <div className="modal-head"><div className="modal-ttl">Nouvel événement</div><button className="close-btn" onClick={()=>setModal(null)}>✕</button></div>
              <div className="fgroup"><label className="flabel">Titre</label><input className="finput" placeholder="Hackathon 2026" value={newEv.title} onChange={e=>setNewEv({...newEv,title:e.target.value})}/></div>
              <div className="fgroup"><label className="flabel">Club organisateur</label>
                <select className="fselect" value={newEv.club} onChange={e=>setNewEv({...newEv,club:e.target.value})}>
                  <option value="">— Choisir —</option>
                  {clubs.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="frow">
                <div className="fgroup"><label className="flabel">Jour</label><input className="finput" placeholder="15" value={newEv.day} onChange={e=>setNewEv({...newEv,day:e.target.value})}/></div>
                <div className="fgroup"><label className="flabel">Mois</label><input className="finput" placeholder="Avr" value={newEv.month} onChange={e=>setNewEv({...newEv,month:e.target.value})}/></div>
              </div>
              <div className="fgroup"><label className="flabel">Lieu</label><input className="finput" placeholder="Amphi A" value={newEv.lieu} onChange={e=>setNewEv({...newEv,lieu:e.target.value})}/></div>
              <div className="form-actions">
                <button className="btn btn-gold" onClick={()=>{
                  if(newEv.title&&newEv.club){addDoc(collection(db,"evenements"),{...newEv,nb:0});setModal(null);notify(`"${newEv.title}" ajouté !`);setNewEv({title:"",club:"",day:"",month:"",lieu:""});}else notify("Titre et club requis.",false);
                }}>Ajouter</button>
                <button className="btn btn-ghost" onClick={()=>setModal(null)}>Annuler</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL — MEMBRE */}
        {modal==="membre" && (
          <div className="overlay" onClick={()=>{setModal(null);setMembreEdit(null);}}>
            <div className="modal" onClick={e=>e.stopPropagation()}>
              <div className="modal-head">
                <div className="modal-ttl">{membreEdit?"Modifier le membre":"Ajouter un membre"}</div>
                <button className="close-btn" onClick={()=>{setModal(null);setMembreEdit(null);}}>✕</button>
              </div>
              <div className="fgroup"><label className="flabel">Nom complet</label><input className="finput" placeholder="Prénom Nom" value={form.prenom} onChange={e=>setForm({...form,prenom:e.target.value})}/></div>
              <div className="fgroup"><label className="flabel">Email</label><input className="finput" type="email" placeholder="email@univ.dj" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
              <div className="fgroup"><label className="flabel">Club</label>
                <select className="fselect" value={form.club} onChange={e=>setForm({...form,club:e.target.value})}>
                  <option value="">— Choisir —</option>
                  {clubs.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="fgroup"><label className="flabel">Rôle</label>
                <select className="fselect" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
                  {["Membre","Président","Vice-Président","Trésorier","Secrétaire"].map(r=><option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-actions">
                <button className="btn btn-gold" onClick={()=>{
                  if(form.prenom&&form.email&&form.club){
                    if(membreEdit)updateDoc(doc(db,"membres",membreEdit.id),{nom:form.prenom,email:form.email,club:form.club,role:form.role});
                    else addDoc(collection(db,"membres"),{nom:form.prenom,email:form.email,club:form.club,role:form.role,c:"#4f6ef7"});
                    notify(membreEdit?"Membre modifié !":"Membre ajouté !");
                    setModal(null);setMembreEdit(null);setForm({prenom:"",nom:"",email:"",club:"",role:"Membre"});
                  } else notify("Tous les champs sont requis.",false);
                }}>{membreEdit?"Enregistrer":"Ajouter"}</button>
                <button className="btn btn-ghost" onClick={()=>{setModal(null);setMembreEdit(null);}}>Annuler</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
