import { db } from './firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { useState, useEffect, useRef } from "react";
import { auth } from './firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM — Obsidian Glass aesthetic
═══════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:       #0a1628;
  --bg2:      #0d1f3c;
  --surface:  rgba(255,255,255,0.04);
  --glass:    rgba(255,255,255,0.06);
  --glass2:   rgba(255,255,255,0.09);
  --border:   rgba(255,255,255,0.08);
  --border2:  rgba(255,255,255,0.16);

  --gold:     #FFC107;
  --gold2:    #FFD54F;
  --teal:     #4ecdc4;
  --rose:     #ff6b8a;
  --violet:   #9b7fe8;
  --sky:      #60aff0;

  --text:     #f0f4ff;
  --text2:    #9ab0d0;
  --text3:    #5a7090;

  --r-sm: 10px;
  --r-md: 16px;
  --r-lg: 24px;
  --r-xl: 32px;

  --shadow-glow: 0 0 40px rgba(255,193,7,0.12);
  --shadow-card: 0 8px 40px rgba(0,0,0,0.4);
  --shadow-lg:   0 20px 60px rgba(0,0,0,0.5);
}

html { scroll-behavior: smooth; }

body {
  font-family: 'DM Sans', sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  overflow-x: hidden;
}

::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 99px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

.layout { display: flex; min-height: 100vh; position: relative; }

.sidebar {
  width: 260px; height: 100vh;
  background: var(--bg2);
  border-right: 1px solid rgba(255,193,7,0.15);
  display: flex; flex-direction: column;
  padding: 0; position: fixed; top: 0; left: 0; z-index: 100;
  overflow: hidden;
}
.sidebar::before {
  content: '';
  position: absolute; top: -120px; left: -60px;
  width: 280px; height: 280px;
  background: radial-gradient(circle, rgba(255,193,7,0.08) 0%, transparent 70%);
  pointer-events: none;
}

.brand-area {
  padding: 32px 28px 24px;
  border-bottom: 1px solid rgba(255,193,7,0.12);
}
.brand-logo {
  display: flex; align-items: center; gap: 12px; margin-bottom: 4px;
}
.brand-icon {
  width: 38px; height: 38px; border-radius: 10px;
  background: linear-gradient(135deg, #FFC107, #e6a800);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(255,193,7,0.35);
}
.brand-name {
  font-family: 'Playfair Display', serif;
  font-size: 22px; font-weight: 700;
  color: var(--text);
  letter-spacing: -0.5px;
}
.brand-sub {
  font-size: 11px; color: var(--text3);
  letter-spacing: 2px; text-transform: uppercase;
  margin-left: 50px;
}

.nav-section {
  padding: 20px 16px 0;
  flex: 1; overflow-y: auto; overflow-x: hidden; min-height: 0;
}
.nav-label {
  font-size: 10px; font-weight: 600; color: var(--text3);
  letter-spacing: 2px; text-transform: uppercase;
  padding: 0 12px; margin-bottom: 8px; margin-top: 16px;
}
.nav-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px; border-radius: var(--r-sm);
  color: var(--text2); font-size: 14px; font-weight: 400;
  cursor: pointer; transition: all 0.2s; margin-bottom: 2px;
  border: 1px solid transparent; position: relative;
  overflow: hidden;
}
.nav-item:hover {
  background: var(--glass); color: var(--text);
  border-color: var(--border);
}
.nav-item.active {
  background: rgba(255,193,7,0.1);
  border-color: rgba(255,193,7,0.25);
  color: var(--gold2);
  font-weight: 500;
}
.nav-item.active::before {
  content: '';
  position: absolute; left: 0; top: 20%; height: 60%; width: 2px;
  background: var(--gold); border-radius: 0 2px 2px 0;
}
.nav-icon { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }

.sidebar-footer {
  padding: 20px 16px;
  border-top: 1px solid rgba(255,193,7,0.1);
  flex-shrink: 0;
}
.user-pill {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px;
  background: var(--glass); border: 1px solid var(--border);
  border-radius: var(--r-md);
  transition: all 0.2s;
}
.user-pill:hover { border-color: rgba(255,193,7,0.2); }
.u-avatar {
  width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
  background: linear-gradient(135deg, #FFC107, #1565C0);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 14px; color: #fff;
}
.u-name { font-size: 13px; font-weight: 500; color: var(--text); line-height: 1; margin-bottom: 3px; }
.u-role { font-size: 11px; color: var(--text3); }
.u-logout {
  margin-left: auto; background: none; border: none;
  color: var(--rose); cursor: pointer; font-size: 15px;
  padding: 4px; border-radius: 6px; transition: 0.2s;
  display: flex; align-items: center;
}
.u-logout:hover { background: rgba(255,107,138,0.1); }

.main {
  margin-left: 260px; flex: 1; padding: 40px 48px;
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 80% 0%, rgba(255,193,7,0.05) 0%, transparent 50%),
    radial-gradient(ellipse at 0% 100%, rgba(21,101,192,0.08) 0%, transparent 50%),
    var(--bg);
}

.page-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 36px;
}
.page-eyebrow {
  font-size: 11px; font-weight: 600; color: var(--gold);
  letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 6px;
}
.page-title {
  font-family: 'Playfair Display', serif;
  font-size: 32px; font-weight: 700; color: var(--text);
  letter-spacing: -0.5px; line-height: 1;
}
.page-sub { font-size: 14px; color: var(--text2); margin-top: 6px; }

.btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 20px; border-radius: var(--r-sm);
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
  cursor: pointer; border: none; transition: all 0.2s; white-space: nowrap;
  letter-spacing: 0.1px;
}
.btn-gold {
  background: linear-gradient(135deg, #FFC107, #e6a800);
  color: #1a1200;
  box-shadow: 0 4px 20px rgba(255,193,7,0.3);
}
.btn-gold:hover { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(255,193,7,0.45); }
.btn-ghost {
  background: var(--glass); color: var(--text2);
  border: 1px solid var(--border);
}
.btn-ghost:hover { border-color: var(--border2); color: var(--text); }
.btn-teal {
  background: rgba(78,205,196,0.12); color: var(--teal);
  border: 1px solid rgba(78,205,196,0.2);
}
.btn-teal:hover { background: rgba(78,205,196,0.2); }
.btn-rose {
  background: rgba(255,107,138,0.1); color: var(--rose);
  border: 1px solid rgba(255,107,138,0.18);
}
.btn-rose:hover { background: rgba(255,107,138,0.18); }
.btn-sm { padding: 7px 14px; font-size: 12px; border-radius: 8px; }
.btn-xs { padding: 5px 10px; font-size: 11px; border-radius: 6px; }

.stats-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 16px; margin-bottom: 36px;
}
.stat-card {
  background: var(--glass); border: 1px solid var(--border);
  border-radius: var(--r-lg); padding: 22px 24px;
  position: relative; overflow: hidden;
  transition: all 0.25s;
}
.stat-card:hover { border-color: rgba(255,193,7,0.2); transform: translateY(-2px); box-shadow: var(--shadow-card); }
.stat-accent {
  display: inline-flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 9px;
  font-size: 18px; margin-bottom: 14px;
}
.stat-label {
  font-size: 11px; font-weight: 600; color: var(--text3);
  text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;
}
.stat-value {
  font-family: 'Playfair Display', serif;
  font-size: 38px; font-weight: 700; line-height: 1;
  color: var(--text); margin-bottom: 6px;
}
.stat-delta {
  font-size: 12px; color: var(--gold); font-weight: 500;
  display: flex; align-items: center; gap: 4px;
}

.card {
  background: var(--glass); border: 1px solid var(--border);
  border-radius: var(--r-lg);
}
.card:hover { border-color: rgba(255,193,7,0.15); }

.section-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 18px;
}
.section-title {
  font-family: 'Playfair Display', serif;
  font-size: 18px; font-weight: 600; color: var(--text);
}

.clubs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.club-card {
  background: var(--glass); border: 1px solid var(--border);
  border-radius: var(--r-lg); padding: 24px;
  cursor: pointer; transition: all 0.28s; position: relative; overflow: hidden;
}
.club-card::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255,193,7,0.05) 0%, transparent 60%);
  pointer-events: none;
}
.club-card:hover {
  border-color: rgba(255,193,7,0.3);
  transform: translateY(-4px); box-shadow: var(--shadow-card);
}
.club-bar {
  height: 3px; border-radius: 2px; margin-bottom: 20px; opacity: 0.8;
}
.club-icon { font-size: 32px; margin-bottom: 10px; display: block; }
.club-name {
  font-family: 'Playfair Display', serif;
  font-size: 17px; font-weight: 600; margin-bottom: 8px; color: var(--text);
}
.club-desc { font-size: 13px; color: var(--text2); line-height: 1.65; margin-bottom: 18px; }
.club-meta {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16px;
}
.club-count { font-size: 12px; color: var(--text3); }
.club-count b { color: var(--text2); }
.club-actions { display: flex; gap: 8px; }

.badge {
  padding: 3px 10px; border-radius: 99px;
  font-size: 11px; font-weight: 600; letter-spacing: 0.3px;
  display: inline-flex; align-items: center; gap: 4px;
}
.badge-teal { background: rgba(78,205,196,0.1); color: var(--teal); border: 1px solid rgba(78,205,196,0.15); }
.badge-rose { background: rgba(255,107,138,0.1); color: var(--rose); border: 1px solid rgba(255,107,138,0.15); }
.badge-gold { background: rgba(255,193,7,0.12); color: var(--gold); border: 1px solid rgba(255,193,7,0.2); }
.badge-violet { background: rgba(155,127,232,0.1); color: var(--violet); border: 1px solid rgba(155,127,232,0.15); }
.badge-sky { background: rgba(96,175,240,0.1); color: var(--sky); border: 1px solid rgba(96,175,240,0.15); }

.events-list { display: flex; flex-direction: column; gap: 10px; }
.ev-row {
  background: var(--glass); border: 1px solid var(--border);
  border-radius: var(--r-md); padding: 16px 20px;
  display: flex; align-items: center; gap: 18px;
  transition: all 0.2s;
}
.ev-row:hover { border-color: rgba(255,193,7,0.2); background: var(--glass2); }
.ev-date {
  min-width: 56px; text-align: center;
  background: rgba(255,193,7,0.08);
  border: 1px solid rgba(255,193,7,0.15);
  border-radius: var(--r-sm); padding: 9px 6px;
  flex-shrink: 0;
}
.ev-day {
  font-family: 'Playfair Display', serif;
  font-size: 26px; font-weight: 700; color: var(--gold); line-height: 1;
}
.ev-month {
  font-size: 10px; color: var(--text3);
  text-transform: uppercase; letter-spacing: 1.5px; margin-top: 2px;
}
.ev-info { flex: 1; }
.ev-name { font-weight: 500; font-size: 14px; margin-bottom: 5px; color: var(--text); }
.ev-meta { font-size: 12px; color: var(--text3); display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.ev-tag {
  background: rgba(255,193,7,0.08); color: var(--gold);
  border: 1px solid rgba(255,193,7,0.12);
  padding: 2px 9px; border-radius: 99px; font-size: 11px;
}

.tbl-wrap {
  background: var(--glass); border: 1px solid var(--border);
  border-radius: var(--r-lg); overflow: hidden;
}
table { width: 100%; border-collapse: collapse; }
thead tr { border-bottom: 1px solid rgba(255,193,7,0.1); }
th {
  padding: 13px 20px; text-align: left;
  font-size: 11px; color: var(--text3);
  text-transform: uppercase; letter-spacing: 1.5px;
  font-weight: 600; white-space: nowrap;
}
td {
  padding: 13px 20px; font-size: 13px; color: var(--text2);
  border-bottom: 1px solid rgba(255,255,255,0.04);
  vertical-align: middle;
}
tr:last-child td { border-bottom: none; }
tbody tr { transition: background 0.15s; }
tbody tr:hover td { background: rgba(255,193,7,0.03); color: var(--text); }
.td-name { display: flex; align-items: center; gap: 12px; color: var(--text); font-weight: 500; }

.av {
  width: 34px; height: 34px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 13px; color: #fff; flex-shrink: 0;
}

.search-bar {
  position: relative; margin-bottom: 20px;
}
.search-bar input {
  width: 100%; padding: 11px 16px 11px 44px;
  background: var(--glass); border: 1px solid var(--border);
  border-radius: var(--r-md); font-family: 'DM Sans', sans-serif;
  font-size: 14px; color: var(--text); outline: none;
  transition: border-color 0.2s;
}
.search-bar input:focus { border-color: rgba(255,193,7,0.35); }
.search-bar input::placeholder { color: var(--text3); }
.search-bar::before {
  content: '🔍'; position: absolute; left: 14px; top: 50%;
  transform: translateY(-50%); font-size: 14px;
  pointer-events: none; opacity: 0.5;
}

.form-card {
  background: var(--glass); border: 1px solid var(--border);
  border-radius: var(--r-xl); padding: 32px; max-width: 580px;
}
.form-title {
  font-family: 'Playfair Display', serif;
  font-size: 20px; font-weight: 600; margin-bottom: 24px;
}
.fgroup { margin-bottom: 18px; }
.flabel {
  display: block; font-size: 11px; font-weight: 600;
  color: var(--text3); text-transform: uppercase;
  letter-spacing: 1.2px; margin-bottom: 7px;
}
.finput, .fselect, .ftextarea {
  width: 100%; background: rgba(255,255,255,0.04);
  border: 1.5px solid var(--border);
  border-radius: var(--r-sm); padding: 11px 14px;
  font-family: 'DM Sans', sans-serif; font-size: 14px;
  color: var(--text); outline: none; transition: border-color 0.2s;
}
.finput:focus, .fselect:focus, .ftextarea:focus {
  border-color: rgba(255,193,7,0.45);
  background: rgba(255,255,255,0.06);
}
.finput::placeholder, .ftextarea::placeholder { color: var(--text3); }
.fselect option { background: #0d1f3c; color: var(--text); }
.ftextarea { resize: vertical; min-height: 90px; }
.frow { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-actions { display: flex; gap: 10px; margin-top: 24px; }

.adm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 28px; }
.adm-card {
  background: var(--glass); border: 1px solid var(--border);
  border-radius: var(--r-lg); padding: 22px;
}
.adm-title {
  font-family: 'Playfair Display', serif;
  font-size: 16px; font-weight: 600; margin-bottom: 18px; color: var(--text);
}
.prog-item { margin-bottom: 14px; }
.prog-row {
  display: flex; justify-content: space-between;
  font-size: 13px; color: var(--text2); margin-bottom: 6px;
}
.prog-pct { color: var(--gold); font-weight: 600; font-family: 'JetBrains Mono', monospace; }
.prog-track {
  height: 4px; background: rgba(255,255,255,0.06);
  border-radius: 2px; overflow: hidden;
}
.prog-fill {
  height: 100%; border-radius: 2px;
  background: linear-gradient(90deg, #FFC107, #1565C0);
  transition: width 0.6s cubic-bezier(.22,.61,.36,1);
}

.overlay {
  position: fixed; inset: 0;
  background: rgba(10,22,40,0.85); backdrop-filter: blur(12px);
  z-index: 200; display: flex; align-items: center; justify-content: center;
  animation: fadeIn 0.2s ease;
}
.modal {
  background: #0d1f3c; border: 1px solid rgba(255,193,7,0.2);
  border-radius: var(--r-xl); padding: 30px;
  width: 100%; max-width: 460px;
  box-shadow: var(--shadow-lg);
  animation: slideUp 0.25s cubic-bezier(.22,.61,.36,1);
}
.modal-head {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 22px;
}
.modal-ttl {
  font-family: 'Playfair Display', serif;
  font-size: 19px; font-weight: 600;
}
.close-btn {
  background: var(--glass); border: 1px solid var(--border);
  color: var(--text2); width: 32px; height: 32px;
  border-radius: 8px; cursor: pointer; font-size: 14px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.close-btn:hover { color: var(--rose); border-color: rgba(255,107,138,0.3); }

.toast {
  position: fixed; bottom: 28px; right: 28px;
  background: #0d1f3c; border: 1px solid rgba(255,193,7,0.2);
  color: var(--text); padding: 13px 20px;
  border-radius: var(--r-md); font-size: 13px;
  z-index: 999; box-shadow: var(--shadow-lg);
  animation: slideUp 0.3s cubic-bezier(.22,.61,.36,1);
  display: flex; align-items: center; gap: 10px;
  max-width: 320px;
}
.toast-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--gold); flex-shrink: 0;
  box-shadow: 0 0 8px var(--gold);
}

.empty-state {
  text-align: center; padding: 56px 32px;
  background: var(--glass); border: 1px solid var(--border);
  border-radius: var(--r-lg);
}
.empty-icon { font-size: 48px; margin-bottom: 14px; opacity: 0.6; }
.empty-text { font-size: 15px; color: var(--text2); margin-bottom: 6px; }
.empty-sub { font-size: 13px; color: var(--text3); }

.login-wrap {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(21,101,192,0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(255,193,7,0.08) 0%, transparent 50%),
    var(--bg);
  position: relative; overflow: hidden;
}
.login-bg-text {
  position: absolute; font-family: 'Playfair Display', serif;
  font-size: 320px; font-weight: 700; color: rgba(255,255,255,0.015);
  user-select: none; pointer-events: none; white-space: nowrap;
  top: 50%; left: 50%; transform: translate(-50%, -50%);
  letter-spacing: -10px;
}
.login-card {
  background: rgba(13,31,60,0.97); border: 1px solid rgba(255,193,7,0.2);
  border-radius: var(--r-xl); padding: 44px 40px;
  width: 400px; z-index: 2;
  box-shadow: var(--shadow-lg), 0 0 80px rgba(255,193,7,0.06);
  animation: slideUp 0.4s cubic-bezier(.22,.61,.36,1);
}
.login-logo { text-align: center; margin-bottom: 36px; }
.login-icon {
  width: 60px; height: 60px; border-radius: 16px;
  background: linear-gradient(135deg, #FFC107, #e6a800);
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; margin: 0 auto 16px;
  box-shadow: 0 8px 30px rgba(255,193,7,0.35);
}
.login-brand {
  font-family: 'Playfair Display', serif;
  font-size: 28px; font-weight: 700; color: var(--text);
}
.login-univ { font-size: 13px; color: var(--text3); margin-top: 4px; }

.mode-btns { display: flex; flex-direction: column; gap: 12px; }
.mode-btn {
  padding: 16px 20px; border-radius: var(--r-md); border: 1px solid var(--border);
  cursor: pointer; font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 500; transition: all 0.22s;
  display: flex; align-items: center; gap: 14px; text-align: left;
  background: var(--glass); color: var(--text);
}
.mode-btn:hover { border-color: var(--border2); transform: translateX(4px); }
.mode-btn-admin:hover { border-color: rgba(255,193,7,0.35); background: rgba(255,193,7,0.06); }
.mode-btn-student:hover { border-color: rgba(21,101,192,0.4); background: rgba(21,101,192,0.08); }
.mode-btn-ico {
  width: 40px; height: 40px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; flex-shrink: 0;
}
.mode-btn-admin .mode-btn-ico { background: rgba(255,193,7,0.12); }
.mode-btn-student .mode-btn-ico { background: rgba(21,101,192,0.15); }
.mode-btn-text { font-size: 12px; color: var(--text3); margin-top: 1px; font-weight: 400; }

.login-divider {
  display: flex; align-items: center; gap: 12px;
  margin: 20px 0; color: var(--text3); font-size: 12px;
}
.login-divider::before, .login-divider::after {
  content: ''; flex: 1; height: 1px; background: var(--border);
}

.login-link {
  color: var(--gold); cursor: pointer; font-weight: 500;
  text-decoration: none; transition: color 0.2s;
}
.login-link:hover { color: var(--gold2); }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp {
  from { transform: translateY(16px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
@keyframes pulse {
  0%, 100% { opacity: 1; } 50% { opacity: 0.5; }
}

.vote-row {
  background: var(--glass); border: 1px solid var(--border);
  border-radius: var(--r-md); padding: 16px 20px;
  display: flex; align-items: center; gap: 16px;
  transition: all 0.2s; margin-bottom: 10px;
}
.vote-row:hover { border-color: rgba(255,193,7,0.2); }

.alert {
  border-radius: var(--r-sm); padding: 12px 16px;
  font-size: 13px; font-weight: 500; margin-bottom: 18px;
  display: flex; align-items: center; gap: 10px;
}
.alert-success { background: rgba(255,193,7,0.1); border: 1px solid rgba(255,193,7,0.2); color: var(--gold); }
.alert-error   { background: rgba(255,107,138,0.1); border: 1px solid rgba(255,107,138,0.2); color: var(--rose); }

.back-btn {
  display: inline-flex; align-items: center; gap: 7px;
  background: none; border: none; color: var(--text3);
  font-size: 13px; cursor: pointer; padding: 0;
  margin-bottom: 12px; transition: color 0.2s;
  font-family: 'DM Sans', sans-serif;
}
.back-btn:hover { color: var(--gold); }

@media (max-width: 768px) {
  .sidebar {
    width: 100%; height: 100px;
    position: fixed; top: auto; bottom: 0; left: 0;
    flex-direction: row;
    border-right: none; border-top: 1px solid rgba(255,193,7,0.15);
    padding: 0; overflow: visible;
  }
  .brand-area { display: none; }
  .sidebar-footer {
    display: flex; position: fixed;
    bottom: 70px; right: 12px; z-index: 150;
  }
  .user-pill { padding: 8px 10px; gap: 8px; }
  .u-name, .u-role { display: none; }
  .nav-section {
    display: flex; flex-direction: row;
    overflow-x: auto; padding: 0; width: 100%; gap: 0;
  }
  .nav-label { display: none; }
  .nav-item {
    flex-direction: column; gap: 3px;
    padding: 8px 10px; font-size: 10px;
    border-radius: 0; border: none;
    min-width: 58px; text-align: center;
    margin-bottom: 0; justify-content: center;
  }
  .nav-item.active::before { display: none; }
  .nav-item.active { border-top: 2px solid var(--gold); border-radius: 0; }
  .nav-icon { font-size: 18px; width: auto; }
  .layout { flex-direction: column; }
  .main { margin-left: 0; padding: 20px 16px 90px; min-height: 100vh; }
  .stats-grid { grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
  .clubs-grid { grid-template-columns: 1fr; }
  .frow { grid-template-columns: 1fr; }
  .page-title { font-size: 22px; }
  .page-header { flex-direction: column; gap: 12px; margin-bottom: 20px; }
  .stat-value { font-size: 28px; }
  .tbl-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  table { min-width: 500px; }
  .modal { max-width: calc(100% - 24px); margin: 0 12px; padding: 22px 18px; }
  .form-card { max-width: 100%; padding: 20px 16px; }
  .form-actions { flex-direction: column; }
  .form-actions .btn { justify-content: center; }
  .login-card { width: calc(100% - 32px); padding: 32px 24px; }
  .toast { bottom: 80px; right: 16px; left: 16px; max-width: none; }
  .ev-row { flex-wrap: wrap; padding: 12px 14px; gap: 10px; }
}
`;

/* ═══════════════════════════════════════════════════════════════
   STATIC DATA
═══════════════════════════════════════════════════════════════ */
const CLUBS = [
  { id:"c1", name:"Club Informatique", icon:"💻", desc:"Développement, hackathons et projets tech entre passionnés du numérique.",   max:50, color:"linear-gradient(135deg,#4f6ef7,#a78bfa)", c:"#4f6ef7", cat:"Tech"    },
  { id:"c2", name:"Club Robotique",    icon:"🤖", desc:"Conception et programmation de robots autonomes pour compétitions et démos.", max:30, color:"linear-gradient(135deg,#2dcb8e,#38f9d7)", c:"#2dcb8e", cat:"Tech"    },
  { id:"c3", name:"Club Théâtre",      icon:"🎭", desc:"Arts dramatiques, expression scénique et mises en scène originales.",         max:40, color:"linear-gradient(135deg,#ff6b8a,#ff8c69)", c:"#ff6b8a", cat:"Culture" },
  { id:"c4", name:"Club Photo",        icon:"📷", desc:"Photographie numérique, argentique, retouche et expositions.",                 max:25, color:"linear-gradient(135deg,#e8c97a,#f5e0a0)", c:"#e8c97a", cat:"Art"     },
  { id:"c5", name:"Club Échecs",       icon:"♟️", desc:"Tournois internes, entraînement tactique et stratégie avancée.",              max:30, color:"linear-gradient(135deg,#9b7fe8,#c4b5fd)", c:"#9b7fe8", cat:"Loisir"  },
  { id:"c6", name:"Club Musique",      icon:"🎵", desc:"Groupes, jam sessions, covers et concerts de fin d'année.",                   max:30, color:"linear-gradient(135deg,#ff6b8a,#9b7fe8)", c:"#ff6b8a", cat:"Art"     },
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
  const [newEv, setNewEv]     = useState({ title:"", clubId:"", day:"", month:"", lieu:"" });
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

  // ── HELPER : résoudre le nom d'un club depuis son ID ──
  const nomClub = (id) => clubs.find(c => c.id === id || c.name === id)?.name || id;
  // ── HELPER : compter les membres d'un club par ID ──
  const countMembres = (clubId, clubName) =>
    membres.filter(m => m.clubId === clubId || m.club === clubName).length;

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
          {label:"Clubs actifs",        val:clubs.length,  delta:"+2 ce mois",       ico:"⬡", accent:"rgba(232,201,122,0.1)", c:"var(--gold)"},
          {label:"Membres total",       val:membres.length,delta:"+15 ce mois",      ico:"⊞", accent:"rgba(78,205,196,0.1)",  c:"var(--teal)"},
          {label:"Événements prévus",   val:events.length, delta:"ce semestre",       ico:"◎", accent:"rgba(155,127,232,0.1)", c:"var(--violet)"},
          {label:"Étudiants inscrits",  val:membres.length,delta:"+3 cette semaine",  ico:"◈", accent:"rgba(96,175,240,0.1)",  c:"var(--sky)"},
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
              {/* ✅ CORRIGÉ : utilise nomClub(ev.clubId) au lieu de ev.club */}
              <div className="ev-meta"><span className="ev-tag">{nomClub(ev.clubId || ev.club)}</span><span>📍 {ev.lieu}</span></div>
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
            // ✅ CORRIGÉ : compte par clubId en priorité
            const nb = countMembres(c.id, c.name);
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
              {/* ✅ CORRIGÉ : utilise nomClub(ev.clubId) */}
              <div className="ev-meta"><span className="ev-tag">{nomClub(ev.clubId || ev.club)}</span><span>📍 {ev.lieu}</span><span>👥 {ev.nb||0} places</span></div>
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
                    {/* ✅ CORRIGÉ : affiche le nom via nomClub(m.clubId) */}
                    <td><span className="badge badge-sky">{nomClub(m.clubId || m.club)}</span></td>
                    <td><span className="badge badge-gold">{m.role}</span></td>
                    {isAdmin&&<td><div style={{display:"flex",gap:6}}>
                      <button className="btn btn-teal btn-xs" onClick={()=>{
                        setMembreEdit(m);
                        setForm({prenom:m.nom, email:m.email, club:m.clubId||m.club, role:m.role});
                        setModal("membre");
                      }}>Modifier</button>
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
              {clubs.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div className="fgroup"><label className="flabel">Motivation</label><textarea className="ftextarea" placeholder="Pourquoi souhaitez-vous rejoindre ce club ?" value={f.motiv} onChange={e=>setF({...f,motiv:e.target.value})}/></div>
          <div className="form-actions">
            <button className="btn btn-gold" onClick={()=>{
              if(f.prenom&&f.email&&f.club){
                // ✅ CORRIGÉ : stocke clubId (ID) + etudiantId (UID Firebase)
                const clubObj = clubs.find(c => c.id === f.club);
                addDoc(collection(db,"membres"),{
                  nom:`${f.prenom} ${f.nom}`,
                  email:f.email,
                  clubId: f.club,
                  etudiantId: user.uid,
                  role:"Membre",
                  c: clubObj?.c || "#4f6ef7"
                });
                notify(`Inscription au ${nomClub(f.club)} envoyée !`);
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
  const [elections, setElections]   = useState([]);
  const [newElec, setNewElec]       = useState({ clubId: "", titre: "" });
  const [msg, setMsg]               = useState("");

  useEffect(() => {
    const u = onSnapshot(collection(db, "elections"), s =>
      setElections(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return () => u();
  }, []);

  const notify2 = (txt, ok = true) => {
    setMsg((ok ? "ok:" : "error:") + txt);
    setTimeout(() => setMsg(""), 3500);
  };
  const msgOk = msg.startsWith("ok:");

  // ── Membre connecté ──
  const monProfil = membres.find(m => m.etudiantId === user.uid);

  // ── Créer une élection (admin) ──
  async function creerElection() {
    if (!newElec.clubId || !newElec.titre) {
      notify2("Club et titre requis.", false); return;
    }
    await addDoc(collection(db, "elections"), {
      clubId:      newElec.clubId,
      titre:       newElec.titre,
      statut:      "candidatures",   // candidatures → vote → cloturée
      candidats:   [],               // { membreId, nom, statut: "attente"|"validé"|"refusé", votes }
      votants:     [],
      createdAt:   new Date(),
    });
    notify2("Élection créée — en attente de candidatures !");
    setNewElec({ clubId: "", titre: "" });
  }

  // ── Se proposer comme candidat ──
  async function seProposer(elec) {
    if (!monProfil) { notify2("Vous n'êtes pas encore inscrit à un club.", false); return; }
    if (monProfil.clubId !== elec.clubId) {
      notify2("Vous n'êtes pas membre de ce club.", false); return;
    }
    const dejaCandidrat = (elec.candidats || []).some(c => c.membreId === user.uid);
    if (dejaCandidrat) { notify2("Vous êtes déjà candidat.", false); return; }
    const updated = [...(elec.candidats || []), {
      membreId: user.uid,
      nom:      monProfil.nom,
      statut:   "attente",
      votes:    0,
      id:       Date.now().toString(),
    }];
    await updateDoc(doc(db, "elections", elec.id), { candidats: updated });
    notify2("Candidature soumise ! En attente de validation.");
  }

  // ── Valider ou refuser un candidat (admin) ──
  async function validerCandidat(elec, candidatId, decision) {
    const updated = (elec.candidats || []).map(c =>
      c.id === candidatId ? { ...c, statut: decision } : c
    );
    await updateDoc(doc(db, "elections", elec.id), { candidats: updated });
    notify2(decision === "validé" ? "Candidat validé !" : "Candidat refusé.");
  }

  // ── Lancer le vote (admin) ──
  async function lancerVote(elec) {
    const valides = (elec.candidats || []).filter(c => c.statut === "validé");
    if (valides.length < 2) {
      notify2("Il faut au moins 2 candidats validés pour lancer le vote.", false); return;
    }
    await updateDoc(doc(db, "elections", elec.id), { statut: "vote" });
    notify2("Vote lancé ! Les membres peuvent maintenant voter.");
  }

  // ── Voter pour un candidat ──
  async function voter(elec, candidatId) {
    if (!monProfil || monProfil.clubId !== elec.clubId) {
      notify2("Vous n'êtes pas membre de ce club.", false); return;
    }
    const dejaVote = (elec.votants || []).includes(user.uid);
    if (dejaVote) { notify2("Vous avez déjà voté.", false); return; }
    const updated = (elec.candidats || []).map(c =>
      c.id === candidatId ? { ...c, votes: (c.votes || 0) + 1 } : c
    );
    await updateDoc(doc(db, "elections", elec.id), {
      candidats: updated,
      votants:   [...(elec.votants || []), user.uid],
    });
    notify2("Vote enregistré !");
  }

  // ── Clôturer l'élection (admin) ──
  async function cloturer(elec) {
    const valides = (elec.candidats || []).filter(c => c.statut === "validé");
    const gagnant = [...valides].sort((a, b) => (b.votes || 0) - (a.votes || 0))[0];
    await updateDoc(doc(db, "elections", elec.id), {
      statut:  "cloturée",
      gagnant: gagnant?.nom || "—",
    });
    notify2(`Élection clôturée ! Président élu : ${gagnant?.nom || "—"}`);
  }

  // ── Supprimer une élection (admin) ──
  async function supprimerElection(id) {
    await deleteDoc(doc(db, "elections", id));
    notify2("Élection supprimée.");
  }

  // ── Label du statut ──
  const statutLabel = {
    candidatures: { txt: "📋 Candidatures ouvertes", cls: "badge-sky"    },
    vote:         { txt: "🗳️ Vote en cours",          cls: "badge-teal"   },
    cloturée:     { txt: "🔒 Clôturée",               cls: "badge-rose"   },
  };

  return (
    <div style={{ animation: "slideUp 0.35s ease" }}>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Démocratie étudiante</div>
          <div className="page-title">Élections des présidents</div>
          <div className="page-sub">Candidatez et votez pour élire le président de votre club</div>
        </div>
      </div>

      {msg && (
        <div className={`alert ${msgOk ? "alert-success" : "alert-error"}`}>
          <span>{msgOk ? "✓" : "✗"}</span>{msg.slice(3)}
        </div>
      )}

      {/* ══ PANNEAU ADMIN : créer une élection ══ */}
      {isAdmin && (
        <div className="adm-card" style={{ marginBottom: 28 }}>
          <div className="adm-title">⚙ Créer une élection</div>
          <div className="frow">
            <div className="fgroup">
              <label className="flabel">Club</label>
              <select className="fselect" value={newElec.clubId}
                onChange={e => setNewElec({ ...newElec, clubId: e.target.value })}>
                <option value="">— Choisir un club —</option>
                {clubs.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div className="fgroup">
              <label className="flabel">Titre</label>
              <input className="finput" placeholder="Ex : Élection présidentielle 2026"
                value={newElec.titre}
                onChange={e => setNewElec({ ...newElec, titre: e.target.value })} />
            </div>
          </div>
          <button className="btn btn-gold" onClick={creerElection}>⊕ Lancer l'élection</button>
        </div>
      )}

      {/* ══ LISTE DES ÉLECTIONS ══ */}
      {elections.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🗳️</div>
          <div className="empty-text">Aucune élection en cours</div>
          <div className="empty-sub">L'administrateur peut en créer depuis ce panneau</div>
        </div>
      ) : elections.map(elec => {
        const candidatsValides = (elec.candidats || []).filter(c => c.statut === "validé");
        const candidatsAttente = (elec.candidats || []).filter(c => c.statut === "attente");
        const total     = candidatsValides.reduce((s, c) => s + (c.votes || 0), 0);
        const dejaVote  = (elec.votants || []).includes(user.uid);
        const estCandid = (elec.candidats || []).some(c => c.membreId === user.uid);
        const estMembre = monProfil?.clubId === elec.clubId;
        const sl        = statutLabel[elec.statut] || statutLabel["candidatures"];
        const sorted    = [...candidatsValides].sort((a, b) => (b.votes || 0) - (a.votes || 0));

        return (
          <div key={elec.id} className="card" style={{ padding: 26, marginBottom: 20 }}>

            {/* ── En-tête ── */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
              <div>
                <div style={{ fontSize:11, color:"var(--text3)", textTransform:"uppercase", letterSpacing:2, marginBottom:4 }}>
                  {nomClub(elec.clubId)}
                </div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:19, fontWeight:600, color:"var(--text)" }}>
                  {elec.titre}
                </div>
                <div style={{ marginTop:10, display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                  <span className={`badge ${sl.cls}`}>{sl.txt}</span>
                  {elec.statut === "vote" &&
                    <span style={{ fontSize:12, color:"var(--text3)" }}>{total} vote{total>1?"s":""} exprimé{total>1?"s":""}</span>}
                  {dejaVote && elec.statut==="vote" &&
                    <span className="badge badge-gold">✓ Vous avez voté</span>}
                  {estCandid &&
                    <span className="badge badge-violet">📋 Vous êtes candidat</span>}
                </div>
              </div>

              {/* Actions admin */}
              {isAdmin && (
                <div style={{ display:"flex", gap:8 }}>
                  {elec.statut === "candidatures" &&
                    <button className="btn btn-teal btn-sm" onClick={() => lancerVote(elec)}>
                      🗳️ Lancer le vote
                    </button>}
                  {elec.statut === "vote" &&
                    <button className="btn btn-gold btn-sm" onClick={() => cloturer(elec)}>
                      🏆 Clôturer
                    </button>}
                  <button className="btn btn-rose btn-sm" onClick={() => supprimerElection(elec.id)}>🗑</button>
                </div>
              )}
            </div>

            {/* ── Résultat final ── */}
            {elec.statut === "cloturée" && (
              <div style={{
                background:"rgba(255,193,7,0.08)", border:"1px solid rgba(255,193,7,0.25)",
                borderRadius:14, padding:"16px 22px", marginBottom:22,
                display:"flex", alignItems:"center", gap:16
              }}>
                <span style={{ fontSize:38 }}>🏆</span>
                <div>
                  <div style={{ fontSize:11, color:"var(--text3)", textTransform:"uppercase", letterSpacing:1.5 }}>Président élu</div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:"var(--gold)" }}>
                    {elec.gagnant}
                  </div>
                </div>
              </div>
            )}

            {/* ── Candidatures en attente (admin seulement) ── */}
            {isAdmin && elec.statut === "candidatures" && candidatsAttente.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:12, fontWeight:600, color:"var(--gold)", textTransform:"uppercase",
                  letterSpacing:1.5, marginBottom:10 }}>
                  ⏳ Candidatures en attente de validation
                </div>
                {candidatsAttente.map(c => (
                  <div key={c.id} style={{
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    background:"rgba(255,193,7,0.05)", border:"1px solid rgba(255,193,7,0.15)",
                    borderRadius:10, padding:"12px 16px", marginBottom:8
                  }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div className="av" style={{ background:"#4f6ef7", width:32, height:32, fontSize:12 }}>
                        {c.nom[0]}
                      </div>
                      <span style={{ fontWeight:500, fontSize:14 }}>{c.nom}</span>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button className="btn btn-teal btn-xs"
                        onClick={() => validerCandidat(elec, c.id, "validé")}>✓ Valider</button>
                      <button className="btn btn-rose btn-xs"
                        onClick={() => validerCandidat(elec, c.id, "refusé")}>✗ Refuser</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Bouton "Me proposer" (membre du club) ── */}
            {elec.statut === "candidatures" && estMembre && !estCandid && !isAdmin && (
              <button className="btn btn-gold" style={{ marginBottom:20 }} onClick={() => seProposer(elec)}>
                ✋ Me proposer comme candidat
              </button>
            )}

            {elec.statut === "candidatures" && estCandid && (
              <div className="alert alert-success" style={{ marginBottom:16 }}>
                ✓ Votre candidature est en attente de validation par l'administrateur.
              </div>
            )}

            {/* ── Liste des candidats validés ── */}
            {candidatsValides.length === 0 ? (
              <div style={{ color:"var(--text3)", fontSize:13, textAlign:"center", padding:"16px 0" }}>
                {elec.statut === "candidatures"
                  ? "Aucun candidat validé pour le moment"
                  : "Aucun candidat pour cette élection"}
              </div>
            ) : (
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:"var(--text3)", textTransform:"uppercase",
                  letterSpacing:1.5, marginBottom:12 }}>
                  {elec.statut === "candidatures" ? "Candidats validés" : "Résultats"}
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {sorted.map((c, i) => {
                    const pct      = total > 0 ? Math.round((c.votes || 0) / total * 100) : 0;
                    const isWinner = elec.statut === "cloturée" && i === 0 && c.votes > 0;
                    return (
                      <div key={c.id} style={{
                        background: isWinner ? "rgba(255,193,7,0.07)" : "var(--surface)",
                        border:`1px solid ${isWinner ? "rgba(255,193,7,0.25)" : "var(--border)"}`,
                        borderRadius:12, padding:"14px 18px",
                        display:"flex", alignItems:"center", gap:16
                      }}>
                        {/* Rang */}
                        <div style={{
                          width:32, height:32, borderRadius:9, flexShrink:0,
                          background: isWinner ? "rgba(255,193,7,0.15)" : "rgba(255,255,255,0.05)",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:14, fontWeight:700,
                          color: isWinner ? "var(--gold)" : "var(--text3)"
                        }}>
                          {isWinner ? "🥇" : `#${i+1}`}
                        </div>

                        {/* Nom + barre */}
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                            <span style={{ fontWeight:500, fontSize:14,
                              color: isWinner ? "var(--gold2)" : "var(--text)" }}>
                              {c.nom}
                            </span>
                            {elec.statut !== "candidatures" && (
                              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:"var(--text2)" }}>
                                {c.votes||0} vote{(c.votes||0)>1?"s":""} — {pct}%
                              </span>
                            )}
                          </div>
                          {elec.statut !== "candidatures" && (
                            <div className="prog-track">
                              <div className="prog-fill" style={{
                                width:`${pct}%`,
                                background: isWinner
                                  ? "linear-gradient(90deg,#FFC107,#FFD54F)"
                                  : "linear-gradient(90deg,#4ecdc4,#60aff0)"
                              }}/>
                            </div>
                          )}
                        </div>

                        {/* Bouton voter */}
                        {elec.statut === "vote" && !dejaVote && estMembre && (
                          <button className="btn btn-gold btn-sm" style={{ flexShrink:0 }}
                            onClick={() => voter(elec, c.id)}>
                            Voter
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

  /* ─ PAIEMENTS ─ */
const Paiements = () => {
  const [paiements, setPaiements] = useState([]);
  const [cotisations, setCotisations] = useState({}); // { clubId: montant }
  const [editCotis, setEditCotis] = useState({});
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const u = onSnapshot(collection(db, "paiements"), s =>
      setPaiements(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return () => u();
  }, []);

  useEffect(() => {
    const u = onSnapshot(collection(db, "cotisations"), s => {
      const map = {};
      s.docs.forEach(d => { map[d.id] = d.data().montant; });
      setCotisations(map);
    });
    return () => u();
  }, []);

  const notify2 = (txt, ok = true) => {
    setMsg((ok ? "ok:" : "error:") + txt);
    setTimeout(() => setMsg(""), 3500);
  };
  const msgOk = msg.startsWith("ok:");

  // ── Membre connecté ──
  const monProfil = membres.find(m => m.etudiantId === user.uid);
  const monClub   = clubs.find(c => c.id === monProfil?.clubId);
  const montantDu = monClub ? (cotisations[monClub.id] || 0) : 0;
  const monPaiement = paiements.find(p =>
    p.etudiantId === user.uid && p.clubId === monProfil?.clubId
  );

  // ── Déclarer un paiement (étudiant) ──
  async function declarerPaiement() {
    if (!monProfil) { notify2("Vous n'êtes inscrit à aucun club.", false); return; }
    if (monPaiement) { notify2("Vous avez déjà soumis un paiement.", false); return; }
    if (!montantDu)  { notify2("Aucun montant défini pour ce club.", false); return; }
    await addDoc(collection(db, "paiements"), {
      etudiantId: user.uid,
      nom:        monProfil.nom,
      clubId:     monProfil.clubId,
      montant:    montantDu,
      statut:     "en attente",
      date:       new Date(),
    });
    notify2("Paiement déclaré ! En attente de validation.");
  }

  // ── Valider / Rejeter un paiement (admin) ──
  async function changerStatut(id, statut) {
    await updateDoc(doc(db, "paiements", id), { statut });
    notify2(statut === "payé" ? "Paiement validé ✓" : "Paiement rejeté.");
  }

  // ── Définir montant par club (admin) ──
  async function sauvegarderMontant(clubId) {
    const montant = parseFloat(editCotis[clubId]);
    if (!montant || montant <= 0) { notify2("Montant invalide.", false); return; }
    await setDoc(doc(db, "cotisations", clubId), { montant });
    notify2("Montant mis à jour !");
    setEditCotis(p => ({ ...p, [clubId]: "" }));
  }

  // ── Stats admin ──
  const totalParClub = clubs.map(c => {
    const payes = paiements.filter(p => p.clubId === c.id && p.statut === "payé");
    return { ...c, total: payes.reduce((s, p) => s + (p.montant || 0), 0), nb: payes.length };
  });

  return (
    <div style={{ animation: "slideUp 0.35s ease" }}>
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Cotisations</div>
          <div className="page-title">Paiements</div>
          <div className="page-sub">Gestion des cotisations aux clubs</div>
        </div>
      </div>

      {msg && (
        <div className={`alert ${msgOk ? "alert-success" : "alert-error"}`}>
          <span>{msgOk ? "✓" : "✗"}</span>{msg.slice(3)}
        </div>
      )}

      {/* ══ VUE ÉTUDIANT ══ */}
      {!isAdmin && (
        <>
          {/* Carte ma cotisation */}
          <div className="card" style={{ padding: 28, marginBottom: 24 }}>
            {!monProfil ? (
              <div className="empty-state">
                <div className="empty-icon">💳</div>
                <div className="empty-text">Vous n'êtes inscrit à aucun club</div>
                <div className="empty-sub">Inscrivez-vous d'abord à un club pour payer votre cotisation</div>
                <button className="btn btn-gold" style={{ marginTop: 16 }} onClick={() => setPage("inscription")}>
                  S'inscrire à un club
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>
                      Ma cotisation
                    </div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "var(--text)" }}>
                      {monClub?.icon} {monClub?.name}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>
                      Montant dû
                    </div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: "var(--gold)" }}>
                      {montantDu > 0 ? `${montantDu.toLocaleString()} DJF` : "—"}
                    </div>
                  </div>
                </div>

                {/* Statut paiement */}
                {!monPaiement ? (
                  <div style={{
                    background: "rgba(255,193,7,0.05)", border: "1px solid rgba(255,193,7,0.15)",
                    borderRadius: 12, padding: "20px 24px", marginBottom: 20,
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16
                  }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>Cotisation non payée</div>
                      <div style={{ fontSize: 13, color: "var(--text3)" }}>
                        Payez votre cotisation en espèces auprès de l'administration, puis déclarez-le ici.
                      </div>
                    </div>
                    <button className="btn btn-gold" style={{ flexShrink: 0 }} onClick={declarerPaiement}>
                      ✓ J'ai payé
                    </button>
                  </div>
                ) : (
                  <div style={{
                    borderRadius: 12, padding: "20px 24px",
                    background: monPaiement.statut === "payé"
                      ? "rgba(78,205,196,0.08)" : monPaiement.statut === "rejeté"
                      ? "rgba(255,107,138,0.08)" : "rgba(255,193,7,0.06)",
                    border: `1px solid ${monPaiement.statut === "payé"
                      ? "rgba(78,205,196,0.2)" : monPaiement.statut === "rejeté"
                      ? "rgba(255,107,138,0.2)" : "rgba(255,193,7,0.15)"}`,
                    display: "flex", alignItems: "center", gap: 16
                  }}>
                    <span style={{ fontSize: 32 }}>
                      {monPaiement.statut === "payé" ? "✅" : monPaiement.statut === "rejeté" ? "❌" : "⏳"}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4,
                        color: monPaiement.statut === "payé" ? "var(--teal)"
                          : monPaiement.statut === "rejeté" ? "var(--rose)" : "var(--gold)" }}>
                        {monPaiement.statut === "payé" ? "Paiement validé par l'admin"
                          : monPaiement.statut === "rejeté" ? "Paiement rejeté — contactez l'administration"
                          : "En attente de validation"}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text3)" }}>
                        {monPaiement.montant?.toLocaleString()} DJF —{" "}
                        {monPaiement.date?.toDate?.().toLocaleDateString("fr-FR") || "—"}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* ══ VUE ADMIN ══ */}
      {isAdmin && (
        <>
          {/* Stats totaux par club */}
          <div style={{ marginBottom: 28 }}>
            <div className="section-header">
              <div className="section-title">💰 Total collecté par club</div>
            </div>
            <div className="adm-grid">
              {totalParClub.map(c => (
                <div key={c.id} className="adm-card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontSize: 28 }}>{c.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{c.name}</div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 700, color: "var(--gold)" }}>
                      {c.total.toLocaleString()} DJF
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>
                      {c.nb} paiement{c.nb > 1 ? "s" : ""} validé{c.nb > 1 ? "s" : ""}
                    </div>
                  </div>
                  {/* Définir montant */}
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input
                      className="finput" type="number"
                      style={{ width: 100, padding: "7px 10px", fontSize: 13 }}
                      placeholder={cotisations[c.id] ? `${cotisations[c.id]} DJF` : "Montant"}
                      value={editCotis[c.id] || ""}
                      onChange={e => setEditCotis(p => ({ ...p, [c.id]: e.target.value }))}
                    />
                    <button className="btn btn-teal btn-xs" onClick={() => sauvegarderMontant(c.id)}>
                      ✓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Liste paiements en attente */}
          <div className="section-header">
            <div className="section-title">⏳ Paiements en attente</div>
            <span className="badge badge-gold">
              {paiements.filter(p => p.statut === "en attente").length} en attente
            </span>
          </div>
          <div style={{ marginBottom: 28 }}>
            {paiements.filter(p => p.statut === "en attente").length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✅</div>
                <div className="empty-text">Aucun paiement en attente</div>
              </div>
            ) : (
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr><th>Étudiant</th><th>Club</th><th>Montant</th><th>Date</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {paiements.filter(p => p.statut === "en attente").map(p => (
                      <tr key={p.id}>
                        <td><div className="td-name">
                          <div className="av" style={{ background: "#4f6ef7", width: 32, height: 32, fontSize: 12 }}>
                            {(p.nom || "?")[0]}
                          </div>
                          {p.nom}
                        </div></td>
                        <td><span className="badge badge-sky">{nomClub(p.clubId)}</span></td>
                        <td style={{ fontFamily: "'JetBrains Mono',monospace", color: "var(--gold)", fontWeight: 600 }}>
                          {p.montant?.toLocaleString()} DJF
                        </td>
                        <td style={{ color: "var(--text3)", fontSize: 12 }}>
                          {p.date?.toDate?.().toLocaleDateString("fr-FR") || "—"}
                        </td>
                        <td><div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-teal btn-xs" onClick={() => changerStatut(p.id, "payé")}>✓ Valider</button>
                          <button className="btn btn-rose btn-xs" onClick={() => changerStatut(p.id, "rejeté")}>✗ Rejeter</button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Historique complet */}
          <div className="section-header">
            <div className="section-title">📋 Historique complet</div>
          </div>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr><th>Étudiant</th><th>Club</th><th>Montant</th><th>Statut</th><th>Date</th></tr>
              </thead>
              <tbody>
                {paiements.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text3)", padding: 32 }}>
                    Aucun paiement enregistré
                  </td></tr>
                ) : paiements.map(p => (
                  <tr key={p.id}>
                    <td><div className="td-name">
                      <div className="av" style={{ background: "#4f6ef7", width: 32, height: 32, fontSize: 12 }}>
                        {(p.nom || "?")[0]}
                      </div>
                      {p.nom}
                    </div></td>
                    <td><span className="badge badge-sky">{nomClub(p.clubId)}</span></td>
                    <td style={{ fontFamily: "'JetBrains Mono',monospace", color: "var(--gold)", fontWeight: 600 }}>
                      {p.montant?.toLocaleString()} DJF
                    </td>
                    <td>
                      <span className={`badge ${p.statut === "payé" ? "badge-teal" : p.statut === "rejeté" ? "badge-rose" : "badge-gold"}`}>
                        {p.statut === "payé" ? "✓ Validé" : p.statut === "rejeté" ? "✗ Rejeté" : "⏳ En attente"}
                      </span>
                    </td>
                    <td style={{ color: "var(--text3)", fontSize: 12 }}>
                      {p.date?.toDate?.().toLocaleDateString("fr-FR") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

  };

  /* ─ ADMIN ─ */
  const Admin = () => (
    <div style={{animation:"slideUp 0.35s ease"}}>
      <div className="page-header"><div><div className="page-eyebrow">Système</div><div className="page-title">Administration</div><div className="page-sub">Gestion complète de la plateforme</div></div></div>
      <div className="adm-grid">
        <div className="adm-card">
          <div className="adm-title">Taux de remplissage</div>
          {clubs.map(c=>{
            // ✅ CORRIGÉ : compte par ID
            const nb = countMembres(c.id, c.name);
            return <div key={c.id} className="prog-item">
              <div className="prog-row"><span>{c.icon} {c.name}</span><span className="prog-pct">{Math.round(nb/c.max*100)}%</span></div>
              <div className="prog-track"><div className="prog-fill" style={{width:`${nb/c.max*100}%`}}/></div>
            </div>;
          })}
        </div>
        <div className="adm-card">
          <div className="adm-title">Répartition des membres</div>
          {clubs.map(c=>{
            const nb = countMembres(c.id, c.name);
            return <div key={c.id} className="prog-item">
              <div className="prog-row"><span>{c.icon} {c.name}</span><span className="prog-pct">{nb} membres</span></div>
              <div className="prog-track"><div className="prog-fill" style={{width:`${membres.length?nb/membres.length*100:0}%`,background:c.color}}/></div>
            </div>;
          })}
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
              const nb = countMembres(c.id, c.name);
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
  const Clubs2      = () => <Clubs      isAdmin={isAdmin}/>;
  const Evenements2 = () => <Evenements isAdmin={isAdmin}/>;
  const Membres2    = () => <Membres    isAdmin={isAdmin}/>;
  const pages = { accueil:Accueil, clubs:Clubs2, evenements:Evenements2, membres:Membres2,
                  inscription:Inscription, votes:Votes, paiements:Paiements, admin:Admin };
  const Page = pages[page];

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
                  if(ncName){
                    addDoc(collection(db,"clubs"),{name:ncName,desc:ncDesc,icon:ncIcon||"🎯",max:parseInt(ncMax)||30,color:"linear-gradient(135deg,#4f6ef7,#a78bfa)",cat:"Autre",c:"#4f6ef7"});
                    setModal(null);notify(`Club "${ncName}" créé !`);
                    setNcName("");setNcDesc("");setNcIcon("🎯");setNcMax("30");
                  } else notify("Entrez un nom.",false);
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
                <select className="fselect" value={newEv.clubId} onChange={e=>setNewEv({...newEv,clubId:e.target.value})}>
                  <option value="">— Choisir —</option>
                  {/* ✅ CORRIGÉ : stocke l'ID du club dans clubId */}
                  {clubs.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="frow">
                <div className="fgroup"><label className="flabel">Jour</label><input className="finput" placeholder="15" value={newEv.day} onChange={e=>setNewEv({...newEv,day:e.target.value})}/></div>
                <div className="fgroup"><label className="flabel">Mois</label><input className="finput" placeholder="Avr" value={newEv.month} onChange={e=>setNewEv({...newEv,month:e.target.value})}/></div>
              </div>
              <div className="fgroup"><label className="flabel">Lieu</label><input className="finput" placeholder="Amphi A" value={newEv.lieu} onChange={e=>setNewEv({...newEv,lieu:e.target.value})}/></div>
              <div className="form-actions">
                <button className="btn btn-gold" onClick={()=>{
                  if(newEv.title && newEv.clubId){
                    // ✅ CORRIGÉ : sauvegarde clubId (ID) au lieu de club (nom)
                    addDoc(collection(db,"evenements"),{
                      title: newEv.title,
                      clubId: newEv.clubId,
                      day: newEv.day,
                      month: newEv.month,
                      lieu: newEv.lieu,
                      nb: 0
                    });
                    setModal(null);
                    notify(`"${newEv.title}" ajouté !`);
                    setNewEv({title:"",clubId:"",day:"",month:"",lieu:""});
                  } else notify("Titre et club requis.",false);
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
                  {/* ✅ CORRIGÉ : valeur = ID du club */}
                  {clubs.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
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
                    const clubObj = clubs.find(c => c.id === form.club);
                    if(membreEdit){
                      // ✅ CORRIGÉ : met à jour clubId au lieu de club
                      updateDoc(doc(db,"membres",membreEdit.id),{
                        nom:form.prenom, email:form.email,
                        clubId:form.club, role:form.role
                      });
                    } else {
                      // ✅ CORRIGÉ : stocke clubId + etudiantId
                      addDoc(collection(db,"membres"),{
                        nom:form.prenom, email:form.email,
                        clubId:form.club,
                        etudiantId: user.uid,
                        role:form.role,
                        c: clubObj?.c || "#4f6ef7"
                      });
                    }
                    notify(membreEdit?"Membre modifié !":"Membre ajouté !");
                    setModal(null);setMembreEdit(null);
                    setForm({prenom:"",nom:"",email:"",club:"",role:"Membre"});
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
