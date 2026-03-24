import { db } from './firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { useState, useEffect } from "react";
import { auth } from './firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';

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
@media (max-width: 768px) {
  .sidebar { width: 100%; min-height: auto; position: relative; }
  .main { margin-left: 0; padding: 16px; }
  .layout { flex-direction: column; }
  .stats { grid-template-columns: 1fr 1fr; }
  .clubs-grid { grid-template-columns: 1fr; }
  .adm-grid { grid-template-columns: 1fr; }
}
`;

// Données initiales des clubs
const INITIAL_CLUBS = [
  { id: 1, name: "Club Informatique", icon: "💻", desc: "Développement, hackathons et projets tech entre passionnés.", max: 50, color: "linear-gradient(90deg,#4f6ef7,#a78bfa)", cat: "Tech", c: "#4f6ef7" },
  { id: 2, name: "Club Robotique", icon: "🤖", desc: "Conception et programmation de robots autonomes.", max: 30, color: "linear-gradient(90deg,#2dcb8e,#38f9d7)", cat: "Tech", c: "#2dcb8e" },
  { id: 3, name: "Club Théâtre", icon: "🎭", desc: "Arts dramatiques et expression scénique.", max: 40, color: "linear-gradient(90deg,#f7564a,#ff8c69)", cat: "Culture", c: "#f7564a" },
  { id: 4, name: "Club Photo", icon: "📷", desc: "Photographie numérique, argentique et retouche.", max: 25, color: "linear-gradient(90deg,#f7a825,#ffd32a)", cat: "Art", c: "#f7a825" },
  { id: 5, name: "Club Échecs", icon: "♟️", desc: "Tournois internes, entraînement et stratégie avancée.", max: 30, color: "linear-gradient(90deg,#a78bfa,#c4b5fd)", cat: "Loisir", c: "#a78bfa" },
  { id: 6, name: "Club Musique", icon: "🎵", desc: "Groupes, jam sessions et concerts de fin d'année.", max: 30, color: "linear-gradient(90deg,#f7564a,#4f6ef7)", cat: "Art", c: "#f76c82" },
];

export default function App() {
  const [page, setPage] = useState("accueil");
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [membres, setMembres] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editClub, setEditClub] = useState(null);
  const [membreEdit, setMembreEdit] = useState(null);
  const [votes, setVotes] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ prenom: "", nom: "", email: "", clubId: "", role: "Membre", motiv: "" });
  const [newEv, setNewEv] = useState({ title: "", clubId: "", day: "", month: "", lieu: "" });
  const [ncName, setNcName] = useState("");
  const [ncDesc, setNcDesc] = useState("");
  const [ncIcon, setNcIcon] = useState("🎯");
  const [ncMax, setNcMax] = useState("30");
  const [isMobile, setIsMobile] = useState(false);

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const notify = (msg, icon = "✅") => {
    setToast({ msg, icon });
    setTimeout(() => setToast(null), 3000);
  };

  // Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Membres subscription
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "membres"), (snapshot) => {
      const membresData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setMembres(membresData);
    });
    return () => unsub();
  }, []);

  // Événements subscription
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "evenements"), (snapshot) => {
      setEvents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Clubs subscription - CORRIGÉ
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "clubs"), (snapshot) => {
      const clubsFirebase = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const allClubs = [...INITIAL_CLUBS, ...clubsFirebase];
      const uniqueClubs = allClubs.filter((club, index, self) => 
        index === self.findIndex(c => c.name === club.name)
      );
      setClubs(uniqueClubs);
    });
    return () => unsub();
  }, []);

  // Votes subscription
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "votes"), (snapshot) => {
      setVotes(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Paiements subscription
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "paiements"), (snapshot) => {
      setPaiements(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const totalM = membres.length;

  // Helper pour compter les membres par club
  const getMembreCount = (clubId) => {
    const count = membres.filter(m => {
      // Support à la fois l'ancien format (club) et le nouveau (clubId)
      if (m.clubId !== undefined) return m.clubId === clubId;
      if (m.club !== undefined) {
        const club = clubs.find(c => c.name === m.club);
        return club?.id === clubId;
      }
      return false;
    }).length;
    return count;
  };

  // Helper pour trouver un club par ID
  const getClubById = (clubId) => clubs.find(c => c.id === clubId);

  // Helper pour obtenir le nom du club par ID
  const getClubName = (clubId) => {
    const club = getClubById(clubId);
    return club?.name || clubId;
  };

  // Votes Component
  const Votes = () => {
    const [message, setMessage] = useState("");
    
    const aVote = (clubId) => {
      if (!user?.uid) return false;
      return votes.some(v => v.clubId === clubId && v.etudiantId === user.uid);
    };

    async function voter(clubId, choix) {
      if (!user?.uid) {
        setMessage("❌ Connecte-toi d'abord.");
        return;
      }
      if (aVote(clubId)) {
        setMessage("❌ Tu as déjà voté pour ce club.");
        return;
      }
      await addDoc(collection(db, "votes"), {
        etudiantId: user.uid,
        clubId,
        choix,
        date: new Date(),
      });
      setMessage("✅ Vote enregistré !");
      setTimeout(() => setMessage(""), 3000);
    }

    return (
      <div>
        <div className="topbar">
          <div><div className="page-title">Votes 🗳️</div><div className="page-sub">Votez pour vos clubs préférés</div></div>
        </div>
        {message && <div style={{ background: message.startsWith("✅") ? "rgba(45,203,142,0.1)" : "rgba(247,86,74,0.1)", border: `1px solid ${message.startsWith("✅") ? "#2dcb8e" : "#f7564a"}`, borderRadius: 12, padding: "12px 18px", marginBottom: 20, color: message.startsWith("✅") ? "#1aab73" : "#f7564a", fontWeight: 500 }}>{message}</div>}
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr><th>Club</th><th>Statut</th><th>Mon vote</th><th>Action</th></tr>
            </thead>
            <tbody>
              {clubs.map(c => {
                const monVote = votes.find(v => v.clubId === c.id && v.etudiantId === user?.uid);
                return (
                  <tr key={c.id}>
                    <td><div className="td-flex"><span style={{ fontSize: 20 }}>{c.icon}</span>{c.name}</div></td>
                    <td><span className={`pill ${monVote ? "pill-green" : "pill-blue"}`}>{monVote ? "✅ Voté" : "⏳ En attente"}</span></td>
                    <td>{monVote ? <span style={{ fontWeight: 600 }}>{monVote.choix === "pour" ? "👍 Pour" : "👎 Contre"}</span> : <span style={{ color: "var(--muted)" }}>—</span>}</td>
                    <td>
                      {!monVote ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn btn-sm btn-primary" onClick={() => voter(c.id, "pour")}>👍 Pour</button>
                          <button className="btn btn-sm btn-red" onClick={() => voter(c.id, "contre")}>👎 Contre</button>
                        </div>
                      ) : (
                        <span style={{ color: "var(--muted)", fontSize: 13 }}>Déjà voté</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Paiements Component
  const Paiements = () => {
    const [selectedClubId, setSelectedClubId] = useState("");
    const [montant, setMontant] = useState("");
    const [message, setMessage] = useState("");
    const mesPaiements = paiements.filter(p => p.etudiantId === user?.uid);

    async function soumettrePaiement() {
      if (!user?.uid) {
        setMessage("❌ Connecte-toi d'abord.");
        return;
      }
      if (!selectedClubId || !montant) {
        setMessage("❌ Remplis tous les champs.");
        return;
      }
      await addDoc(collection(db, "paiements"), {
        etudiantId: user.uid,
        clubId: selectedClubId,
        montant: parseFloat(montant),
        date: new Date(),
        statut: "en attente",
      });
      setMessage("✅ Paiement soumis !");
      setSelectedClubId("");
      setMontant("");
      setTimeout(() => setMessage(""), 3000);
    }

    return (
      <div>
        <div className="topbar">
          <div><div className="page-title">Paiements 💰</div><div className="page-sub">Gérez vos cotisations</div></div>
        </div>

        <div className="form-box" style={{ marginBottom: 28 }}>
          <div className="form-box-title">Nouveau paiement</div>
          {message && <div style={{ background: message.startsWith("✅") ? "rgba(45,203,142,0.1)" : "rgba(247,86,74,0.1)", border: `1px solid ${message.startsWith("✅") ? "#2dcb8e" : "#f7564a"}`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, color: message.startsWith("✅") ? "#1aab73" : "#f7564a", fontWeight: 500 }}>{message}</div>}
          <div className="frow">
            <div className="fgroup">
              <label className="flabel">Club</label>
              <select className="fselect" value={selectedClubId} onChange={e => setSelectedClubId(e.target.value)}>
                <option value="">-- Sélectionner --</option>
                {clubs.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div className="fgroup">
              <label className="flabel">Montant (DJF)</label>
              <input className="finput" type="number" placeholder="Ex: 2000" value={montant} onChange={e => setMontant(e.target.value)} />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={soumettrePaiement}>💳 Soumettre</button>
            <button className="btn btn-ghost" onClick={() => { setSelectedClubId(""); setMontant(""); }}>Réinitialiser</button>
          </div>
        </div>

        <div className="sec-head"><div className="sec-title">📋 Mes paiements</div></div>
        {mesPaiements.length === 0 ? (
          <div style={{ background: "var(--card)", borderRadius: 16, padding: 32, textAlign: "center", color: "var(--muted)", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💸</div>
            <div>Aucun paiement enregistré</div>
          </div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr><th>Club</th><th>Montant</th><th>Statut</th><th>Date</th></tr>
              </thead>
              <tbody>
                {mesPaiements.map(p => (
                  <tr key={p.id}>
                    <td>{getClubName(p.clubId)}</td>
                    <td><b>{p.montant}</b> DJF</td>
                    <td><span className={`pill ${p.statut === "payé" ? "pill-green" : "pill-blue"}`}>{p.statut}</span></td>
                    <td style={{ color: "var(--muted)" }}>{p.date?.toDate?.().toLocaleDateString("fr-FR") || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Accueil Component
  const Accueil = () => (
    <div>
      <div className="topbar">
        <div><div className="page-title">Bienvenue 👋</div><div className="page-sub">Voici l'état de la plateforme aujourd'hui</div></div>
        <button className="btn btn-primary" onClick={() => setPage("inscription")}>+ S'inscrire à un club</button>
      </div>
      <div className="stats">
        {[
          { ico: "🏛️", lbl: "Clubs actifs", val: clubs.length, delta: "+2 ce mois" },
          { ico: "👥", lbl: "Membres total", val: totalM, delta: "+15 ce mois" },
          { ico: "📅", lbl: "Événements prévus", val: events.length, delta: "ce semestre" },
          { ico: "🎓", lbl: "Étudiants inscrits", val: membres.length, delta: "+3 cette semaine" }
        ].map((s, i) => (
          <div key={i} className="stat">
            <div className="stat-ico">{s.ico}</div>
            <div className="stat-lbl">{s.lbl}</div>
            <div className="stat-val">{s.val}</div>
            <div className="stat-delta">{s.delta}</div>
          </div>
        ))}
      </div>
      <div className="sec-head">
        <div className="sec-title">🔥 Prochains événements</div>
        <button className="btn btn-ghost btn-sm" onClick={() => setPage("evenements")}>Voir tout →</button>
      </div>
      <div className="events-list">
        {events.slice(0, 3).map(ev => {
          return (
            <div key={ev.id} className="ev-row">
              <div className="ev-date"><div className="ev-day">{ev.day}</div><div className="ev-month">{ev.month}</div></div>
              <div className="ev-info">
                <div className="ev-name">{ev.title}</div>
                <div className="ev-meta">
                  <span className="ev-tag">{getClubName(ev.clubId)}</span>
                  📍 {ev.lieu}
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => notify(`Inscrit à "${ev.title}" !`)}>Participer</button>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Clubs Component - CORRIGÉ avec getMembreCount
  const Clubs = ({ isAdmin = false }) => {
    const fil = clubs.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    return (
      <div>
        <div className="topbar">
          <div><div className="page-title">Clubs 🏛️</div><div className="page-sub">Rejoignez la communauté</div></div>
          {isAdmin && <button className="btn btn-primary" onClick={() => setModal("club")}>+ Nouveau club</button>}
        </div>
        <div className="search-row">
          <input className="search-in" placeholder="🔍 Rechercher un club..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="clubs-grid">
          {fil.map(c => {
            const membreCount = getMembreCount(c.id);
            const isFull = membreCount >= c.max;
            return (
              <div key={c.id} className="club-card">
                <div className="club-stripe" style={{ background: c.color }} />
                <div className="club-ico">{c.icon}</div>
                <div className="club-name">{c.name}</div>
                <div className="club-desc">{c.desc}</div>
                <div className="club-footer">
                  <div className="club-count"><b>{membreCount}</b> / {c.max} membres</div>
                  <span className={`pill ${isFull ? "pill-red" : "pill-green"}`}>{isFull ? "Complet" : "Ouvert"}</span>
                </div>
                <div className="club-btns">
                  <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => {
                    if (!isFull) {
                      setPage("inscription");
                    } else notify("Ce club est complet.", "⚠️");
                  }}>Rejoindre</button>
                  <button className="btn btn-ghost btn-sm">Détails</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Événements Component
  const Evenements = ({ isAdmin = false }) => (
    <div>
      <div className="topbar">
        <div><div className="page-title">Événements 📅</div><div className="page-sub">Tous les événements à venir</div></div>
        {isAdmin && <button className="btn btn-primary" onClick={() => setModal("event")}>+ Nouvel événement</button>}
      </div>
      <div className="events-list">
        {events.map(ev => {
          return (
            <div key={ev.id} className="ev-row">
              <div className="ev-date"><div className="ev-day">{ev.day}</div><div className="ev-month">{ev.month}</div></div>
              <div className="ev-info">
                <div className="ev-name">{ev.title}</div>
                <div className="ev-meta">
                  <span className="ev-tag">{getClubName(ev.clubId)}</span>
                  📍 {ev.lieu}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={() => notify(`Inscrit à "${ev.title}" !`)}>Participer</button>
                {isAdmin && <button className="btn btn-red btn-sm" onClick={() => { deleteDoc(doc(db, "evenements", ev.id)); notify("Événement supprimé.", "🗑️"); }}>🗑</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Membres Component - CORRIGÉ
  const Membres = ({ isAdmin = false }) => {
    const [searchMembre, setSearchMembre] = useState("");
    const [etudiants, setEtudiants] = useState([]);

    useEffect(() => {
      const unsub = onSnapshot(collection(db, "membres"), (snapshot) => {
        setEtudiants(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => unsub();
    }, []);

    const fil = etudiants.filter(m => (m.nom || "").toLowerCase().includes(searchMembre.toLowerCase()));

    return (
      <div>
        <div className="topbar">
          <div><div className="page-title">Membres 👥</div><div className="page-sub">Liste de tous les membres</div></div>
          {isAdmin && <button className="btn btn-primary" onClick={() => { setMembreEdit(null); setForm({ prenom: "", nom: "", email: "", clubId: "", role: "Membre", motiv: "" }); setModal("membre"); }}>+ Ajouter</button>}
        </div>
        <div className="search-row">
          <input className="search-in" placeholder="🔍 Rechercher un membre..." value={searchMembre} onChange={e => setSearchMembre(e.target.value)} />
        </div>
        <div className="tbl-wrap">
          表格
            <thead>
              <tr><th>Nom</th><th>Email</th><th>Club</th><th>Rôle</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {fil.map(m => {
                return (
                  <tr key={m.id}>
                    <td><div className="td-flex"><div className="sm-av" style={{ background: m.c || "#4f6ef7" }}>{(m.nom || "?")[0]}</div>{m.nom}</div></td>
                    <td style={{ color: "var(--muted)" }}>{m.email}</td>
                    <td><span className="pill pill-blue">{getClubName(m.clubId)}</span></td>
                    <td>{m.role}</td>
                    <td>
                      {isAdmin && (
                        <>
                          <button className="btn btn-primary btn-sm" onClick={() => {
                            setMembreEdit(m);
                            setForm({ prenom: m.nom?.split(" ")[0] || "", nom: m.nom?.split(" ")[1] || "", email: m.email, clubId: m.clubId, role: m.role, motiv: "" });
                            setModal("membre");
                          }}>Modifier</button>
                          <button className="btn btn-red btn-sm" onClick={() => { deleteDoc(doc(db, "membres", m.id)); notify("Membre supprimé.", "🗑️"); }}>Supprimer</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          表格
        </div>
      </div>
    );
  };

  // Inscription Component - CORRIGÉ
  const Inscription = () => {
    const [localForm, setLocalForm] = useState({ prenom: "", nom: "", email: "", clubId: "", motiv: "" });

    return (
      <div>
        <div className="topbar"><div><div className="page-title">S'inscrire ✍️</div><div className="page-sub">Rejoignez un club étudiant</div></div></div>
        <div className="form-box">
          <div className="form-box-title">Formulaire d'inscription</div>
          <div className="frow">
            <div className="fgroup"><label className="flabel">Prénom</label><input className="finput" placeholder="Ex: Amira" value={localForm.prenom} onChange={e => setLocalForm({ ...localForm, prenom: e.target.value })} /></div>
            <div className="fgroup"><label className="flabel">Nom</label><input className="finput" placeholder="Ex: Benali" value={localForm.nom} onChange={e => setLocalForm({ ...localForm, nom: e.target.value })} /></div>
          </div>
          <div className="fgroup"><label className="flabel">Email universitaire</label><input className="finput" type="email" placeholder="prenom.nom@univ.dz" value={localForm.email} onChange={e => setLocalForm({ ...localForm, email: e.target.value })} /></div>
          <div className="fgroup"><label className="flabel">Numéro étudiant</label><input className="finput" placeholder="Ex: 2024123456" /></div>
          <div className="fgroup"><label className="flabel">Club souhaité</label>
            <select className="fselect" value={localForm.clubId} onChange={e => setLocalForm({ ...localForm, clubId: e.target.value })}>
              <option value="">-- Choisir un club --</option>
              {clubs.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div className="fgroup"><label className="flabel">Motivation</label><textarea className="ftextarea" placeholder="Pourquoi voulez-vous rejoindre ce club ?" value={localForm.motiv} onChange={e => setLocalForm({ ...localForm, motiv: e.target.value })} /></div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={() => {
              if (localForm.prenom && localForm.email && localForm.clubId) {
                const club = getClubById(localForm.clubId);
                if (club && getMembreCount(club.id) >= club.max) {
                  notify("Ce club est complet !", "⚠️");
                  return;
                }
                addDoc(collection(db, "membres"), {
                  nom: `${localForm.prenom} ${localForm.nom}`,
                  email: localForm.email,
                  clubId: localForm.clubId,
                  role: "Membre",
                  c: "#4f6ef7",
                  dateInscription: new Date()
                });
                notify(`Inscription au ${club?.name || "club"} envoyée !`);
                setLocalForm({ prenom: "", nom: "", email: "", clubId: "", motiv: "" });
              } else notify("Remplissez les champs obligatoires.", "⚠️");
            }}>Soumettre</button>
            <button className="btn btn-ghost" onClick={() => setLocalForm({ prenom: "", nom: "", email: "", clubId: "", motiv: "" })}>Réinitialiser</button>
          </div>
        </div>
      </div>
    );
  };

  // Admin Component - CORRIGÉ
  const Admin = () => {
    const totalMembres = membres.length;
    
    return (
      <div>
        <div className="topbar"><div><div className="page-title">Administration ⚙️</div><div className="page-sub">Gestion complète de la plateforme</div></div></div>
        <div className="adm-grid">
          <div className="adm-card">
            <div className="adm-title">📊 Taux de remplissage</div>
            {clubs.map(c => {
              const membreCount = getMembreCount(c.id);
              const taux = Math.round((membreCount / c.max) * 100);
              return (
                <div key={c.id} className="prog-item">
                  <div className="prog-row"><span>{c.icon} {c.name}</span><span className="prog-pct">{taux}%</span></div>
                  <div className="prog-track"><div className="prog-fill" style={{ width: `${taux}%` }} /></div>
                </div>
              );
            })}
          </div>
          <div className="adm-card">
            <div className="adm-title">👥 Répartition des membres</div>
            {clubs.map(c => {
              const membreCount = getMembreCount(c.id);
              const pourcentage = totalMembres > 0 ? Math.round((membreCount / totalMembres) * 100) : 0;
              return (
                <div key={c.id} className="prog-item">
                  <div className="prog-row"><span>{c.icon} {c.name}</span><span className="prog-pct">{membreCount} membres</span></div>
                  <div className="prog-track"><div className="prog-fill" style={{ width: `${pourcentage}%`, background: c.color }} /></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal modifier club */}
        {editClub && (
          <div className="overlay" onClick={() => setEditClub(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-head"><div className="modal-ttl">✏️ Modifier le club</div><button className="close-btn" onClick={() => setEditClub(null)}>✕</button></div>
              <div className="fgroup"><label className="flabel">NOM</label><input className="finput" value={editClub.name} onChange={e => setEditClub({ ...editClub, name: e.target.value })} /></div>
              <div className="fgroup"><label className="flabel">CATÉGORIE</label><input className="finput" value={editClub.cat} onChange={e => setEditClub({ ...editClub, cat: e.target.value })} /></div>
              <div className="fgroup"><label className="flabel">DESCRIPTION</label><textarea className="ftextarea" value={editClub.desc} onChange={e => setEditClub({ ...editClub, desc: e.target.value })} /></div>
              <div className="fgroup"><label className="flabel">CAPACITÉ MAX</label><input type="number" className="finput" value={editClub.max} onChange={e => setEditClub({ ...editClub, max: Number(e.target.value) })} /></div>
              <div className="form-actions">
                <button className="btn btn-ghost" onClick={() => setEditClub(null)}>Annuler</button>
                <button className="btn btn-primary" onClick={async () => {
                  if (typeof editClub.id === "string") {
                    await updateDoc(doc(db, "clubs", editClub.id), {
                      name: editClub.name,
                      cat: editClub.cat,
                      desc: editClub.desc,
                      max: editClub.max
                    });
                  }
                  notify("Club modifié !", "✏️");
                  setEditClub(null);
                }}>Sauvegarder</button>
              </div>
            </div>
          </div>
        )}

        <div className="sec-head"><div className="sec-title">🏛️ Gestion des clubs</div></div>
        <div className="tbl-wrap">
          {/* Version desktop */}
          <div style={{ display: isMobile ? "none" : "block" }}>
            <table>
              <thead>
                <tr><th>Club</th><th>Catégorie</th><th>Membres</th><th>Statut</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {clubs.map(c => {
                  const membreCount = getMembreCount(c.id);
                  return (
                    <tr key={c.id}>
                      <td><div className="td-flex"><span style={{ fontSize: 20 }}>{c.icon}</span>{c.name}</div></td>
                      <td><span className="pill pill-blue">{c.cat}</span></td>
                      <td>{membreCount} / {c.max}</td>
                      <td><span className={`pill ${membreCount >= c.max ? "pill-red" : "pill-green"}`}>{membreCount >= c.max ? "Complet" : "Actif"}</span></td>
                      <td style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-sm" style={{ background: "linear-gradient(90deg,#4f6ef7,#a78bfa)", color: "white", border: "none" }} onClick={() => setEditClub(c)}>✏️ Modifier</button>
                        <button className="btn btn-red btn-sm" onClick={() => {
                          if (typeof c.id === "string") deleteDoc(doc(db, "clubs", c.id));
                          notify(`Club supprimé.`, "🗑️");
                        }}>Supprimer</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Version mobile */}
          <div style={{ display: isMobile ? "flex" : "none", flexDirection: "column", gap: 12 }}>
            {clubs.map(c => {
              const membreCount = getMembreCount(c.id);
              return (
                <div key={c.id} style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{c.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{c.name}</div>
                      <span className="pill pill-blue">{c.cat}</span>
                    </div>
                    <span className={`pill ${membreCount >= c.max ? "pill-red" : "pill-green"}`}>{membreCount >= c.max ? "Complet" : "Actif"}</span>
                  </div>
                  <div style={{ color: "#555", fontSize: 14 }}>👥 {membreCount} / {c.max} membres</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-sm" style={{ background: "linear-gradient(90deg,#4f6ef7,#a78bfa)", color: "white", border: "none", flex: 1 }} onClick={() => setEditClub(c)}>✏️ Modifier</button>
                    <button className="btn btn-red btn-sm" style={{ flex: 1 }} onClick={() => {
                      if (typeof c.id === "string") deleteDoc(doc(db, "clubs", c.id));
                      notify(`Club supprimé.`, "🗑️");
                    }}>🗑️ Supprimer</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section votes admin */}
        <div style={{ marginTop: 32 }}>
          <div className="sec-head"><div className="sec-title">🗳️ Résultats des votes</div></div>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr><th>Club</th><th>👍 Pour</th><th>👎 Contre</th><th>Total</th></tr>
              </thead>
              <tbody>
                {clubs.map(c => {
                  const votesPour = votes.filter(v => v.clubId === c.id && v.choix === "pour").length;
                  const votesContre = votes.filter(v => v.clubId === c.id && v.choix === "contre").length;
                  const total = votesPour + votesContre;
                  return (
                    <tr key={c.id}>
                      <td><div className="td-flex"><span style={{ fontSize: 20 }}>{c.icon}</span>{c.name}</div></td>
                      <td><span className="pill pill-green">👍 {votesPour}</span></td>
                      <td><span className="pill pill-red">👎 {votesContre}</span></td>
                      <td><b>{total}</b> vote{total > 1 ? "s" : ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section paiements admin */}
        <div style={{ marginTop: 32 }}>
          <div className="sec-head"><div className="sec-title">💰 Tous les paiements</div></div>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr><th>Étudiant</th><th>Club</th><th>Montant</th><th>Date</th><th>Statut</th><th>Action</th></tr>
              </thead>
              <tbody>
                {paiements.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: 24 }}>Aucun paiement enregistré</td></tr>
                ) : paiements.map(p => {
                  const membre = membres.find(m => m.id === p.etudiantId || m.etudiantId === p.etudiantId);
                  const nomMembre = membre?.nom || p.etudiantId?.slice(0, 8) + "...";
                  return (
                    <tr key={p.id}>
                      <td><div className="td-flex"><div className="sm-av" style={{ background: "#4f6ef7" }}>{nomMembre[0]?.toUpperCase()}</div>{nomMembre}</div></td>
                      <td>{getClubName(p.clubId)}</td>
                      <td><b>{p.montant}</b> DJF</td>
                      <td style={{ color: "var(--muted)" }}>{p.date?.toDate?.().toLocaleDateString("fr-FR") || "—"}</td>
                      <td><span className={`pill ${p.statut === "payé" ? "pill-green" : "pill-blue"}`}>{p.statut}</span></td>
                      <td>
                        {p.statut !== "payé" ? (
                          <button className="btn btn-sm" style={{ background: "rgba(45,203,142,0.15)", color: "#1aab73", border: "1px solid rgba(45,203,142,0.3)" }} onClick={async () => {
                            await updateDoc(doc(db, "paiements", p.id), { statut: "payé" });
                            notify("Paiement confirmé ✅");
                          }}>✅ Confirmer</button>
                        ) : (
                          <button className="btn btn-sm btn-red" onClick={async () => {
                            await updateDoc(doc(db, "paiements", p.id), { statut: "en attente" });
                            notify("Paiement annulé", "⚠️");
                          }}>↩️ Annuler</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Login Component
  const Login = () => {
    const [nom, setNom] = useState("");
    const [prenom, setPrenom] = useState("");
    const [emailPerso, setEmailPerso] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mode, setMode] = useState(null);

    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundImage: "url('https://tse3.mm.bing.net/th/id/OIP.JFwaQEZsfFSfKq3phQ3zYQHaEa?rs=1&pid=ImgDetMain&o=7&rm=3')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div style={{ background: "white", borderRadius: 24, padding: 40, width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 50, marginBottom: 8 }}>🏛️</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#1a1d2e", fontFamily: "Syne" }}>UniClubs</div>
            <div style={{ color: "#888", fontSize: 14, marginTop: 4 }}>Université de Djibouti</div>
          </div>

          {!mode && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button style={{ padding: "14px", borderRadius: 10, background: "linear-gradient(90deg,#4f6ef7,#a78bfa)", color: "white", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }} onClick={() => setMode("admin")}>🔐 Connexion Administrateur</button>
              <button style={{ padding: "14px", borderRadius: 10, background: "linear-gradient(90deg,#2dcb8e,#38f9d7)", color: "white", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }} onClick={() => setMode("etudiant")}>👨‍🎓 Connexion Étudiant</button>
            </div>
          )}

          {mode === "admin" && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>EMAIL</label>
                <input style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14, outline: "none", boxSizing: "border-box" }} placeholder="email@uniclubs.dz" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>MOT DE PASSE</label>
                <input style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14, outline: "none", boxSizing: "border-box" }} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <button style={{ width: "100%", padding: "14px", borderRadius: 10, background: "linear-gradient(90deg,#4f6ef7,#a78bfa)", color: "white", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }} onClick={() => signInWithEmailAndPassword(auth, email, password).catch(() => alert("Email ou mot de passe incorrect !"))}>Se connecter 🔐</button>
              <button style={{ width: "100%", marginTop: 10, padding: "10px", borderRadius: 10, background: "transparent", color: "#888", border: "1px solid #e0e0e0", cursor: "pointer" }} onClick={() => setMode(null)}>← Retour</button>
            </div>
          )}

          {mode === "etudiant" && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>NUMÉRO ÉTUDIANT</label>
                <input style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14, outline: "none", boxSizing: "border-box" }} placeholder="Ex: 2024123456" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>MOT DE PASSE</label>
                <input style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14, outline: "none", boxSizing: "border-box" }} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <button style={{ width: "100%", padding: "14px", borderRadius: 10, background: "linear-gradient(90deg,#2dcb8e,#38f9d7)", color: "white", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }} onClick={async () => {
                try {
                  const cred = await signInWithEmailAndPassword(auth, `${email}@uniclubs.dz`, password);
                  const { getDoc, doc } = await import("firebase/firestore");
                  const snap = await getDoc(doc(db, "etudiants", cred.user.uid));
                  if (!snap.exists()) {
                    await auth.signOut();
                    alert("Votre ancien compte a été supprimé. Veuillez créer un nouveau compte.");
                  }
                } catch (e) {
                  alert("Numéro étudiant ou mot de passe incorrect !");
                }
              }}>Se connecter 👨‍🎓</button>
              <button style={{ width: "100%", marginTop: 10, padding: "10px", borderRadius: 10, background: "transparent", color: "#888", border: "1px solid #e0e0e0", cursor: "pointer" }} onClick={() => setMode(null)}>← Retour</button>
              <div style={{ textAlign: "center", marginTop: 16, color: "#888", fontSize: 14 }}>
                Nouveau étudiant ? <span style={{ color: "#2dcb8e", cursor: "pointer", fontWeight: 600 }} onClick={() => setMode("inscription")}>Créer un compte</span>
              </div>
            </div>
          )}

          {mode === "inscription" && (
            <div>
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>PRÉNOM</label>
                  <input style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14, outline: "none", boxSizing: "border-box" }} placeholder="Ex: Ahmed" value={prenom} onChange={e => setPrenom(e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>NOM</label>
                  <input style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14, outline: "none", boxSizing: "border-box" }} placeholder="Ex: Hassan" value={nom} onChange={e => setNom(e.target.value)} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>EMAIL</label>
                <input style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14, outline: "none", boxSizing: "border-box" }} placeholder="Ex: ahmed@gmail.com" value={emailPerso} onChange={e => setEmailPerso(e.target.value)} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>NUMÉRO ÉTUDIANT</label>
                <input style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14, outline: "none", boxSizing: "border-box" }} placeholder="Ex: 2024123456" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>MOT DE PASSE</label>
                <input style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14, outline: "none", boxSizing: "border-box" }} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <button style={{ width: "100%", padding: "14px", borderRadius: 10, background: "linear-gradient(90deg,#2dcb8e,#38f9d7)", color: "white", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }} onClick={() =>
                createUserWithEmailAndPassword(auth, `${email}@uniclubs.dz`, password)
                  .then((userCredential) => {
                    setDoc(doc(db, "etudiants", userCredential.user.uid), {
                      nom: nom,
                      prenom: prenom,
                      email: emailPerso,
                      numeroEtudiant: email,
                      createdAt: new Date()
                    });
                    alert("Compte créé avec succès !");
                  })
                  .catch(() => alert("Erreur lors de la création du compte !"))
              }>Créer mon compte 👨‍🎓</button>
              <button style={{ width: "100%", marginTop: 10, padding: "10px", borderRadius: 10, background: "transparent", color: "#888", border: "1px solid #e0e0e0", cursor: "pointer" }} onClick={() => setMode("etudiant")}>← Retour</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: 18 }}>Chargement...</div>;
  }

  if (!user) return <Login />;

  const isAdmin = user.email === "nasri@uniclubs.dz";
  const nav = [
    { id: "accueil", label: "Tableau de bord", icon: "📊" },
    { id: "clubs", label: "Clubs", icon: "🏛️" },
    { id: "evenements", label: "Événements", icon: "📅" },
    { id: "membres", label: "Membres", icon: "👥", adminOnly: true },
    { id: "inscription", label: "S'inscrire", icon: "✍️" },
    { id: "votes", label: "Votes", icon: "🗳️" },
    { id: "paiements", label: "Paiements", icon: "💰" },
    { id: "admin", label: "Administration", icon: "⚙️", adminOnly: true },
  ].filter(n => !n.adminOnly || isAdmin);

  const Clubs2 = () => <Clubs isAdmin={isAdmin} />;
  const Evenements2 = () => <Evenements isAdmin={isAdmin} />;
  const Membres2 = () => <Membres isAdmin={isAdmin} />;
  const pages = { accueil: Accueil, clubs: Clubs2, evenements: Evenements2, membres: Membres2, inscription: Inscription, votes: Votes, paiements: Paiements, admin: Admin };
  const Page = pages[page];

  return (
    <>
      <style>{CSS}</style>
      <div className="layout">
        <aside className="sidebar">
          <div className="brand">UniClubs<span className="brand-sub">Gestion des clubs</span></div>
          <div className="divider" />
          {nav.map(n => (
            <div key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => { setPage(n.id); setSearch(""); }}>
              <span className="nav-icon">{n.icon}</span>{n.label}
            </div>
          ))}
          <div className="sidebar-bottom">
            <div className="user-card">
              <div className="avatar">{user.email[0].toUpperCase()}</div>
              <div>
                <div className="user-name">{isAdmin ? "Administrateur" : "Étudiant"}</div>
                <div className="user-role" style={{ cursor: "pointer", color: "#f7564a" }} onClick={() => signOut(auth)}>🚪 Déconnexion</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="main"><Page /></main>

        {toast && <div className="toast"><span>{toast.icon}</span><span>{toast.msg}</span></div>}

        {/* MODAL NOUVEAU CLUB */}
        {modal === "club" && (
          <div className="overlay" onClick={() => setModal(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-head"><div className="modal-ttl">Nouveau club</div><button className="close-btn" onClick={() => setModal(null)}>✕</button></div>
              <div className="fgroup"><label className="flabel">Nom du club</label><input className="finput" placeholder="Ex: Club IA" value={ncName} onChange={e => setNcName(e.target.value)} /></div>
              <div className="fgroup"><label className="flabel">Description</label><textarea className="ftextarea" placeholder="Décrivez le club..." value={ncDesc} onChange={e => setNcDesc(e.target.value)} /></div>
              <div className="frow">
                <div className="fgroup"><label className="flabel">Icône</label><input className="finput" placeholder="🎯" value={ncIcon} onChange={e => setNcIcon(e.target.value)} /></div>
                <div className="fgroup"><label className="flabel">Places max</label><input className="finput" type="number" value={ncMax} onChange={e => setNcMax(e.target.value)} /></div>
              </div>
              <div className="form-actions">
                <button className="btn btn-primary" onClick={() => {
                  if (ncName) {
                    addDoc(collection(db, "clubs"), {
                      name: ncName,
                      desc: ncDesc,
                      icon: ncIcon || "🎯",
                      max: parseInt(ncMax) || 30,
                      color: "linear-gradient(90deg,#4f6ef7,#a78bfa)",
                      cat: "Autre",
                      c: "#4f6ef7"
                    });
                    setModal(null);
                    notify(`Club "${ncName}" créé !`);
                    setNcName("");
                    setNcDesc("");
                    setNcIcon("🎯");
                    setNcMax("30");
                  } else notify("Entrez un nom.", "⚠️");
                }}>Créer</button>
                <button className="btn btn-ghost" onClick={() => setModal(null)}>Annuler</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL NOUVEL ÉVÉNEMENT */}
        {modal === "event" && (
          <div className="overlay" onClick={() => setModal(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-head"><div className="modal-ttl">Nouvel événement</div><button className="close-btn" onClick={() => setModal(null)}>✕</button></div>
              <div className="fgroup"><label className="flabel">Titre</label><input className="finput" placeholder="Ex: Hackathon" value={newEv.title} onChange={e => setNewEv({ ...newEv, title: e.target.value })} /></div>
              <div className="fgroup"><label className="flabel">Club organisateur</label>
                <select className="fselect" value={newEv.clubId} onChange={e => setNewEv({ ...newEv, clubId: e.target.value })}>
                  <option value="">-- Choisir --</option>
                  {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="frow">
                <div className="fgroup"><label className="flabel">Jour</label><input className="finput" placeholder="15" value={newEv.day} onChange={e => setNewEv({ ...newEv, day: e.target.value })} /></div>
                <div className="fgroup"><label className="flabel">Mois</label><input className="finput" placeholder="Mar" value={newEv.month} onChange={e => setNewEv({ ...newEv, month: e.target.value })} /></div>
              </div>
              <div className="fgroup"><label className="flabel">Lieu</label><input className="finput" placeholder="Ex: Amphi A" value={newEv.lieu} onChange={e => setNewEv({ ...newEv, lieu: e.target.value })} /></div>
              <div className="form-actions">
                <button className="btn btn-primary" onClick={() => {
                  if (newEv.title && newEv.clubId) {
                    addDoc(collection(db, "evenements"), { ...newEv, nb: 0 });
                    setModal(null);
                    notify(`Événement "${newEv.title}" ajouté !`);
                    setNewEv({ title: "", clubId: "", day: "", month: "", lieu: "" });
                  } else notify("Remplissez titre et club.", "⚠️");
                }}>Ajouter</button>
                <button className="btn btn-ghost" onClick={() => setModal(null)}>Annuler</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL AJOUTER/MODIFIER MEMBRE */}
        {modal === "membre" && (
          <div className="overlay" onClick={() => { setModal(null); setMembreEdit(null); }}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-head">
                <div className="modal-ttl">{membreEdit ? "Modifier un membre" : "Ajouter un membre"}</div>
                <button className="close-btn" onClick={() => { setModal(null); setMembreEdit(null); }}>✕</button>
              </div>
              <div className="fgroup"><label className="flabel">Prénom</label><input className="finput" placeholder="Prénom" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} /></div>
              <div className="fgroup"><label className="flabel">Nom</label><input className="finput" placeholder="Nom" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} /></div>
              <div className="fgroup"><label className="flabel">Email</label><input className="finput" type="email" placeholder="email@univ.dz" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="fgroup"><label className="flabel">Club</label>
                <select className="fselect" value={form.clubId} onChange={e => setForm({ ...form, clubId: e.target.value })}>
                  <option value="">-- Choisir --</option>
                  {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="fgroup"><label className="flabel">Rôle</label>
                <select className="fselect" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  {["Membre", "Président", "Vice-Président", "Trésorier", "Secrétaire"].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-actions">
                <button className="btn btn-primary" onClick={() => {
                  if (form.prenom && form.email && form.clubId) {
                    if (membreEdit) {
                      updateDoc(doc(db, "membres", membreEdit.id), {
                        nom: `${form.prenom} ${form.nom}`,
                        email: form.email,
                        clubId: form.clubId,
                        role: form.role
                      });
                      notify("Membre modifié ✅");
                    } else {
                      addDoc(collection(db, "membres"), {
                        nom: `${form.prenom} ${form.nom}`,
                        email: form.email,
                        clubId: form.clubId,
                        role: form.role,
                        c: "#4f6ef7",
                        dateInscription: new Date()
                      });
                      notify("Membre ajouté !");
                    }
                    setModal(null);
                    setMembreEdit(null);
                    setForm({ prenom: "", nom: "", email: "", clubId: "", role: "Membre", motiv: "" });
                  } else notify("Remplissez tous les champs.", "⚠️");
                }}>{membreEdit ? "Enregistrer" : "Ajouter"}</button>
                <button className="btn btn-ghost" onClick={() => { setModal(null); setMembreEdit(null); }}>Annuler</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}