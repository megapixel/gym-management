import { useState, useEffect, useRef } from "react";

// ── Design tokens ────────────────────────────────────────────────────────────
const C = {
  nav:      "#1A1F2E",
  navHover: "#252B3B",
  teal:     "#00C9A7",
  tealDim:  "#00A88C",
  tealBg:   "#E6FAF6",
  amber:    "#F6AD55",
  amberBg:  "#FFF8ED",
  red:      "#FC5C65",
  redBg:    "#FFF0F1",
  blue:     "#4A90D9",
  blueBg:   "#EBF4FF",
  bg:       "#F0F2F7",
  card:     "#FFFFFF",
  border:   "#E2E8F0",
  txt:      "#1A202C",
  sub:      "#718096",
  muted:    "#A0AEC0",
};

// ── Mock data ────────────────────────────────────────────────────────────────
const TRAINERS = [
  { id: 1, name: "Marcus Tan",    clients: 12, sessions: 87, balance: 234, revenue: 4680, status: "active",   avatar: "MT" },
  { id: 2, name: "Priya Sharma",  clients: 9,  sessions: 61, balance: 112, revenue: 3050, status: "active",   avatar: "PS" },
  { id: 3, name: "Kevin Loh",     clients: 7,  sessions: 43, balance:  38, revenue: 2150, status: "low",      avatar: "KL" },
  { id: 4, name: "Sarah Ng",      clients: 14, sessions: 99, balance: 301, revenue: 4950, status: "active",   avatar: "SN" },
  { id: 5, name: "Rajan Pillai",  clients: 5,  sessions: 22, balance:   8, revenue: 1100, status: "critical", avatar: "RP" },
];

const CLIENTS = [
  { id: 1, name: "Alicia Wong",    sessions: 18, remaining: 32, lastSeen: "Today, 09:14",  pkg: "Block 50" },
  { id: 2, name: "Bernard Koh",    sessions: 24, remaining: 26, lastSeen: "Yesterday",     pkg: "Block 50" },
  { id: 3, name: "Chen Wei Lin",   sessions:  6, remaining: 44, lastSeen: "Today, 08:52",  pkg: "Block 50" },
  { id: 4, name: "Diana Lim",      sessions: 31, remaining: 19, lastSeen: "2 days ago",    pkg: "Block 50" },
  { id: 5, name: "Eric Seah",      sessions: 12, remaining: 38, lastSeen: "Today, 10:05",  pkg: "Block 50" },
];

const LIVE_FEED = [
  { id: 1, name: "Alicia Wong",   trainer: "Marcus Tan",   time: "10:14 AM", type: "in",  method: "Face" },
  { id: 2, name: "Chen Wei Lin",  trainer: "Marcus Tan",   time: "10:08 AM", type: "in",  method: "Face" },
  { id: 3, name: "James Ho",      trainer: "Sarah Ng",     time: "10:02 AM", type: "out", method: "Finger" },
  { id: 4, name: "Maya Patel",    trainer: "Priya Sharma", time: "09:58 AM", type: "in",  method: "QR" },
  { id: 5, name: "Tom Zhang",     trainer: "Kevin Loh",    time: "09:44 AM", type: "in",  method: "Face" },
  { id: 6, name: "Linda Sim",     trainer: "Sarah Ng",     time: "09:31 AM", type: "out", method: "Face" },
];

const BOOKINGS = [
  { id: 1, time: "08:00–09:00", zone: "Zone A",    trainer: "Sarah Ng",     status: "confirmed", day: "Mon" },
  { id: 2, time: "09:00–10:00", zone: "Zone B",    trainer: "Marcus Tan",   status: "confirmed", day: "Mon" },
  { id: 3, time: "10:00–11:00", zone: "Zone A",    trainer: "Priya Sharma", status: "confirmed", day: "Mon" },
  { id: 4, time: "10:00–11:00", zone: "Zone B",    trainer: "Kevin Loh",    status: "confirmed", day: "Mon" },
  { id: 5, time: "11:00–12:00", zone: "Zone A",    trainer: null,           status: "open",      day: "Mon" },
  { id: 6, time: "11:00–12:00", zone: "Zone B",    trainer: null,           status: "open",      day: "Mon" },
  { id: 7, time: "14:00–15:00", zone: "Zone A",    trainer: "Rajan Pillai", status: "confirmed", day: "Mon" },
  { id: 8, time: "14:00–15:00", zone: "Zone B",    trainer: null,           status: "open",      day: "Mon" },
  { id: 9, time: "15:00–16:00", zone: "Zone A",    trainer: null,           status: "open",      day: "Mon" },
  { id:10, time: "15:00–16:00", zone: "Zone B",    trainer: "Sarah Ng",     status: "confirmed", day: "Mon" },
];

const APPEALS = [
  { id: "APL-001", trainer: "Kevin Loh",    type: "Wrong deduction",     date: "23 Jun 2026", status: "pending",  detail: "Session deducted on 22 Jun but client did not attend. Biometric scan failed." },
  { id: "APL-002", trainer: "Rajan Pillai", type: "Missed scan",          date: "21 Jun 2026", status: "approved", detail: "Fingerprint reader offline 08:00–09:30. Client attended but scan was not captured." },
  { id: "APL-003", trainer: "Marcus Tan",   type: "Booking dispute",      date: "20 Jun 2026", status: "rejected", detail: "Zone A claimed as double-booked on 19 Jun at 10:00. Logs confirm only one booking exists." },
  { id: "APL-004", trainer: "Priya Sharma", type: "Client no-show",       date: "19 Jun 2026", status: "pending",  detail: "Client booked but did not attend. Requesting session credit reversal." },
];

// ── Reusable components ───────────────────────────────────────────────────────
function Avatar({ initials, size = 36, color = C.teal }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color, color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: size * 0.38, flexShrink: 0,
      fontFamily: "Inter, sans-serif",
    }}>{initials}</div>
  );
}

function Badge({ label, color = C.teal, bg = C.tealBg }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 20,
      background: bg, color, fontSize: 11, fontWeight: 700,
      letterSpacing: "0.04em", textTransform: "uppercase",
    }}>{label}</span>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.card, borderRadius: 12,
      border: `1px solid ${C.border}`,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      ...style
    }}>{children}</div>
  );
}

function StatCard({ label, value, sub, accent = C.teal, icon }) {
  return (
    <Card style={{ padding: "20px 22px", flex: 1, minWidth: 140 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.sub, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: C.txt, lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 5 }}>{sub}</div>}
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: accent + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{icon}</div>
      </div>
    </Card>
  );
}

// ── VIEWS ─────────────────────────────────────────────────────────────────────

function DashboardView() {
  const [pulse, setPulse] = useState(0);
  const [feedItems, setFeedItems] = useState(LIVE_FEED);

  useEffect(() => {
    const t = setInterval(() => setPulse(p => (p + 1) % 100), 50);
    return () => clearInterval(t);
  }, []);

  const newCheckins = [
    { name: "Eric Seah", trainer: "Marcus Tan", method: "Face" },
    { name: "Nurul Aisyah", trainer: "Sarah Ng", method: "Finger" },
    { name: "Darren Yeo", trainer: "Kevin Loh", method: "QR" },
  ];
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      const entry = newCheckins[i % newCheckins.length];
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit" });
      setFeedItems(prev => [{
        id: Date.now(), name: entry.name, trainer: entry.trainer,
        time: timeStr, type: "in", method: entry.method, fresh: true
      }, ...prev.slice(0, 7)]);
      i++;
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const statusColor = (s) => s === "active" ? C.teal : s === "low" ? C.amber : C.red;
  const statusBg    = (s) => s === "active" ? C.tealBg : s === "low" ? C.amberBg : C.redBg;

  return (
    <div style={{ padding: 28, overflowY: "auto", height: "100%" }}>
      {/* Stats row */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard label="Active Trainers" value="5"    sub="All checked in today" accent={C.teal}  icon="🏋️" />
        <StatCard label="Sessions Today"  value="38"   sub="+4 from yesterday"    accent={C.blue}  icon="✅" />
        <StatCard label="Clients In Gym"  value="11"   sub="Right now"            accent={C.teal}  icon="👤" />
        <StatCard label="Revenue (Jun)"   value="$15,930" sub="vs $14,200 last mo" accent={C.amber} icon="💰" />
        <StatCard label="Open Appeals"    value="2"    sub="Pending review"       accent={C.red}   icon="⚠️" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 18, alignItems: "start" }}>
        {/* Trainer table */}
        <Card>
          <div style={{ padding: "18px 20px 12px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: C.txt }}>Trainer Overview</span>
            <span style={{ fontSize: 12, color: C.sub }}>25 June 2026</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F7F9FC" }}>
                  {["Trainer","Clients","Sessions Used","Balance","Jun Revenue","Status"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: C.sub, fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TRAINERS.map((tr, i) => (
                  <tr key={tr.id} style={{ background: i % 2 === 0 ? "#fff" : "#FAFBFD", transition: "background 0.15s" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar initials={tr.avatar} size={30} color={tr.status === "critical" ? C.red : tr.status === "low" ? C.amber : C.teal} />
                        <span style={{ fontWeight: 600, color: C.txt }}>{tr.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: C.sub }}>{tr.clients}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 60, height: 5, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${Math.min(100, (tr.sessions / 100) * 100)}%`, height: "100%", background: C.teal, borderRadius: 3 }} />
                        </div>
                        <span style={{ color: C.sub }}>{tr.sessions}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: tr.balance < 20 ? C.red : tr.balance < 50 ? C.amber : C.txt }}>{tr.balance}</td>
                    <td style={{ padding: "12px 16px", color: C.txt, fontWeight: 500 }}>S${tr.revenue.toLocaleString()}</td>
                    <td style={{ padding: "12px 16px" }}><Badge label={tr.status} color={statusColor(tr.status)} bg={statusBg(tr.status)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Live feed */}
        <Card>
          <div style={{ padding: "18px 20px 12px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.teal, boxShadow: `0 0 0 3px ${C.tealBg}`, animation: "pulse 1.5s infinite" }} />
            <span style={{ fontWeight: 700, fontSize: 15, color: C.txt }}>Live Attendance Feed</span>
          </div>
          <div style={{ padding: "8px 0", maxHeight: 380, overflowY: "auto" }}>
            {feedItems.map((item, i) => (
              <div key={item.id} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 18px",
                borderBottom: i < feedItems.length - 1 ? `1px solid ${C.border}` : "none",
                background: item.fresh ? C.tealBg : "transparent",
                transition: "background 1s ease",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: item.type === "in" ? C.teal : C.amber,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, color: "#fff"
                }}>{item.type === "in" ? "↓" : "↑"}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: C.txt, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: C.sub }}>{item.trainer} · {item.method}</div>
                </div>
                <div style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>{item.time}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Peak usage chart */}
      <Card style={{ marginTop: 18, padding: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: C.txt, marginBottom: 16 }}>Today's Facility Usage</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
          {[2,3,4,6,9,11,8,7,10,12,11,8,5,4,6,9,7,5].map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: "100%", height: `${(v / 12) * 70}px`,
                background: i === 9 ? C.teal : i >= 7 && i <= 11 ? C.tealBg : C.border,
                borderRadius: "3px 3px 0 0", transition: "height 0.3s",
                border: i === 9 ? `1px solid ${C.teal}` : "none"
              }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          {["6am","8am","10am","12pm","2pm","4pm","6pm","8pm"].map(t => (
            <span key={t} style={{ fontSize: 10, color: C.muted }}>{t}</span>
          ))}
        </div>
      </Card>
    </div>
  );
}

function TrainerPortalView() {
  const [selectedTrainer, setSelectedTrainer] = useState(TRAINERS[0]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", height: "100%", overflow: "hidden" }}>
      {/* Trainer list */}
      <div style={{ borderRight: `1px solid ${C.border}`, overflowY: "auto", background: "#FAFBFD" }}>
        <div style={{ padding: "16px 16px 8px", fontSize: 11, fontWeight: 700, color: C.sub, letterSpacing: "0.07em", textTransform: "uppercase" }}>All Trainers</div>
        {TRAINERS.map(tr => (
          <div key={tr.id} onClick={() => setSelectedTrainer(tr)} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
            cursor: "pointer", borderBottom: `1px solid ${C.border}`,
            background: selectedTrainer.id === tr.id ? C.tealBg : "transparent",
            borderLeft: selectedTrainer.id === tr.id ? `3px solid ${C.teal}` : "3px solid transparent",
            transition: "all 0.15s",
          }}>
            <Avatar initials={tr.avatar} size={34} color={tr.status === "critical" ? C.red : tr.status === "low" ? C.amber : C.teal} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: C.txt }}>{tr.name}</div>
              <div style={{ fontSize: 11, color: C.sub }}>{tr.balance} sessions left</div>
            </div>
            {tr.status !== "active" && (
              <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: tr.status === "critical" ? C.red : C.amber }} />
            )}
          </div>
        ))}
      </div>

      {/* Trainer detail */}
      <div style={{ overflowY: "auto", padding: 24 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
          <Avatar initials={selectedTrainer.avatar} size={52} color={selectedTrainer.status === "critical" ? C.red : selectedTrainer.status === "low" ? C.amber : C.teal} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, color: C.txt }}>{selectedTrainer.name}</div>
            <div style={{ fontSize: 13, color: C.sub }}>Personal Trainer · Active since Jan 2025</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <button style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", fontSize: 13, cursor: "pointer", color: C.txt }}>Download Statement</button>
            <button style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: C.teal, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Top Up Package</button>
          </div>
        </div>

        {/* Package card */}
        <div style={{ background: `linear-gradient(135deg, ${C.nav} 0%, #2D3748 100%)`, borderRadius: 14, padding: 24, color: "#fff", marginBottom: 20, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -20, top: -20, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "#A0AEC0", textTransform: "uppercase", marginBottom: 6 }}>Current Package — Block 100</div>
          <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>{selectedTrainer.balance} <span style={{ fontSize: 16, fontWeight: 400, color: "#A0AEC0" }}>sessions remaining</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
            <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.12)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${(selectedTrainer.balance / 100) * 100}%`, height: "100%", background: selectedTrainer.balance < 20 ? C.red : selectedTrainer.balance < 50 ? C.amber : C.teal, borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 12, color: "#A0AEC0", whiteSpace: "nowrap" }}>{selectedTrainer.sessions} used of 100</span>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: "#A0AEC0" }}>Expires: 31 December 2026</div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
          <Card style={{ flex: 1, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, color: C.sub, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Clients</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: C.txt, marginTop: 4 }}>{selectedTrainer.clients}</div>
          </Card>
          <Card style={{ flex: 1, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, color: C.sub, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Sessions This Month</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: C.txt, marginTop: 4 }}>{selectedTrainer.sessions}</div>
          </Card>
          <Card style={{ flex: 1, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, color: C.sub, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Revenue (Jun)</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: C.teal, marginTop: 4 }}>S${selectedTrainer.revenue.toLocaleString()}</div>
          </Card>
        </div>

        {/* Client table */}
        <Card>
          <div style={{ padding: "14px 18px 10px", borderBottom: `1px solid ${C.border}`, fontWeight: 700, fontSize: 14, color: C.txt }}>Client Attendance</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F7F9FC" }}>
                {["Client","Package","Sessions Used","Remaining","Last Seen","Action"].map(h => (
                  <th key={h} style={{ padding: "9px 16px", textAlign: "left", fontWeight: 600, color: C.sub, fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CLIENTS.map((cl, i) => (
                <tr key={cl.id} style={{ background: i % 2 === 0 ? "#fff" : "#FAFBFD" }}>
                  <td style={{ padding: "11px 16px", fontWeight: 600, color: C.txt }}>{cl.name}</td>
                  <td style={{ padding: "11px 16px", color: C.sub }}>{cl.pkg}</td>
                  <td style={{ padding: "11px 16px", color: C.sub }}>{cl.sessions}</td>
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{ fontWeight: 700, color: cl.remaining < 10 ? C.red : cl.remaining < 20 ? C.amber : C.teal }}>{cl.remaining}</span>
                  </td>
                  <td style={{ padding: "11px 16px", color: C.sub, fontSize: 12 }}>{cl.lastSeen}</td>
                  <td style={{ padding: "11px 16px" }}>
                    <button style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", color: C.sub }}>History</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

function BookingView() {
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const days = ["Mon 23", "Tue 24", "Wed 25", "Thu 26", "Fri 27", "Sat 28"];
  const [activeDay, setActiveDay] = useState("Wed 25");
  const zones = ["Zone A", "Zone B", "Zone C"];
  const times = ["07:00–08:00","08:00–09:00","09:00–10:00","10:00–11:00","11:00–12:00","13:00–14:00","14:00–15:00","15:00–16:00","16:00–17:00","17:00–18:00"];

  const grid = {};
  times.forEach(t => {
    zones.forEach(z => {
      const match = BOOKINGS.find(b => b.time === t.substring(0,11) && b.zone === z);
      grid[`${t}|${z}`] = match || null;
    });
  });

  return (
    <div style={{ padding: 24, overflowY: "auto", height: "100%" }}>
      {/* Day tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {days.map(d => (
          <button key={d} onClick={() => setActiveDay(d)} style={{
            padding: "8px 18px", borderRadius: 8, border: `1px solid ${activeDay === d ? C.teal : C.border}`,
            background: activeDay === d ? C.tealBg : "#fff", color: activeDay === d ? C.teal : C.sub,
            fontWeight: activeDay === d ? 700 : 400, fontSize: 13, cursor: "pointer",
          }}>{d} Jun</button>
        ))}
        <button style={{ marginLeft: "auto", padding: "8px 18px", borderRadius: 8, border: "none", background: C.teal, color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
          onClick={() => setShowModal(true)}>+ New Booking</button>
      </div>

      {/* Grid */}
      <Card style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.nav }}>
              <th style={{ padding: "12px 18px", textAlign: "left", color: "#A0AEC0", fontWeight: 600, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", width: 130 }}>Time</th>
              {zones.map(z => (
                <th key={z} style={{ padding: "12px 18px", textAlign: "left", color: "#fff", fontWeight: 700, fontSize: 13 }}>{z}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map((t, i) => (
              <tr key={t} style={{ background: i % 2 === 0 ? "#fff" : "#FAFBFD", borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: "14px 18px", fontWeight: 600, color: C.sub, fontSize: 12, whiteSpace: "nowrap" }}>{t}</td>
                {zones.map(z => {
                  const slot = grid[`${t}|${z}`];
                  return (
                    <td key={z} style={{ padding: "8px 12px" }}>
                      {slot && slot.status === "confirmed" ? (
                        <div style={{
                          background: C.tealBg, border: `1px solid ${C.teal}`,
                          borderRadius: 8, padding: "8px 12px", cursor: "pointer",
                        }} onClick={() => setSelected(slot)}>
                          <div style={{ fontWeight: 700, fontSize: 12, color: C.teal }}>{slot.trainer}</div>
                          <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>Confirmed</div>
                        </div>
                      ) : (
                        <div style={{
                          background: "#F7F9FC", border: `1.5px dashed ${C.border}`,
                          borderRadius: 8, padding: "8px 12px", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", minHeight: 40,
                        }} onClick={() => setShowModal(true)}>
                          <span style={{ fontSize: 11, color: C.muted }}>+ Book</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, marginTop: 14 }}>
        {[["Confirmed",C.teal,C.tealBg],["Available","#A0AEC0","#F7F9FC"]].map(([l,c,bg]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: bg, border: `1.5px solid ${c}` }} />
            <span style={{ fontSize: 12, color: C.sub }}>{l}</span>
          </div>
        ))}
      </div>

      {/* Booking modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <Card style={{ width: 420, padding: 28 }}>
            <div style={{ fontWeight: 800, fontSize: 17, color: C.txt, marginBottom: 20 }}>New Booking</div>
            {[["Trainer", "Select trainer..."], ["Zone", "Select zone..."], ["Date", "25 June 2026"], ["Time Slot", "Select slot..."]].map(([label, ph]) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.sub, marginBottom: 5 }}>{label}</div>
                <select style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, background: "#fff", color: C.sub }}>
                  <option>{ph}</option>
                </select>
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", fontSize: 13, cursor: "pointer", color: C.sub }}>Cancel</button>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: C.teal, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Confirm Booking</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function AppealView() {
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const statusMeta = {
    pending:  { color: C.amber, bg: C.amberBg, label: "Pending Review" },
    approved: { color: C.teal,  bg: C.tealBg,  label: "Approved" },
    rejected: { color: C.red,   bg: C.redBg,   label: "Rejected" },
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", height: "100%", overflow: "hidden" }}>
      {/* Appeal list */}
      <div style={{ overflowY: "auto", padding: 24, borderRight: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontWeight: 800, fontSize: 17, color: C.txt }}>Appeal Cases</div>
          <button onClick={() => setShowNew(true)} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: C.teal, color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>+ Submit Appeal</button>
        </div>

        {/* Summary pills */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {[["All Cases", 4, C.sub, "#F0F2F7"], ["Pending", 2, C.amber, C.amberBg], ["Approved", 1, C.teal, C.tealBg], ["Rejected", 1, C.red, C.redBg]].map(([l, n, c, bg]) => (
            <div key={l} style={{ padding: "6px 14px", borderRadius: 20, background: bg, fontSize: 12, fontWeight: 600, color: c, cursor: "pointer" }}>{l} ({n})</div>
          ))}
        </div>

        {APPEALS.map(ap => {
          const m = statusMeta[ap.status];
          return (
            <Card key={ap.id} style={{
              marginBottom: 12, padding: "16px 18px", cursor: "pointer",
              borderLeft: `4px solid ${selected?.id === ap.id ? C.teal : "transparent"}`,
              background: selected?.id === ap.id ? "#F7FFFE" : "#fff",
            }} onClick={() => setSelected(ap)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 13, color: C.txt }}>{ap.id}</span>
                  <span style={{ marginLeft: 10, fontSize: 12, color: C.sub }}>· {ap.type}</span>
                </div>
                <Badge label={m.label} color={m.color} bg={m.bg} />
              </div>
              <div style={{ fontWeight: 600, fontSize: 13, color: C.txt, marginBottom: 4 }}>{ap.trainer}</div>
              <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.5 }}>{ap.detail}</div>
              <div style={{ marginTop: 8, fontSize: 11, color: C.muted }}>Submitted: {ap.date}</div>
            </Card>
          );
        })}
      </div>

      {/* Detail panel */}
      <div style={{ overflowY: "auto", padding: 24, background: "#FAFBFD" }}>
        {selected ? (() => {
          const m = statusMeta[selected.status];
          return (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <span style={{ fontWeight: 800, fontSize: 16, color: C.txt }}>{selected.id}</span>
                <Badge label={m.label} color={m.color} bg={m.bg} />
              </div>

              <Card style={{ padding: 18, marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Case Details</div>
                {[["Trainer", selected.trainer], ["Type", selected.type], ["Submitted", selected.date]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 13, color: C.sub }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.txt }}>{v}</span>
                  </div>
                ))}
              </Card>

              <Card style={{ padding: 18, marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Description</div>
                <p style={{ fontSize: 13, color: C.txt, lineHeight: 1.7, margin: 0 }}>{selected.detail}</p>
              </Card>

              {/* Audit trail */}
              <Card style={{ padding: 18, marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Audit Trail</div>
                {[
                  { time: selected.date + ", 09:00", event: "Appeal submitted by " + selected.trainer, color: C.sub },
                  { time: selected.date + ", 11:30", event: "Assigned to Facility Manager", color: C.blue },
                  selected.status !== "pending" && { time: selected.date + ", 14:15", event: selected.status === "approved" ? "Appeal approved — session credit restored" : "Appeal rejected — original deduction stands", color: selected.status === "approved" ? C.teal : C.red },
                ].filter(Boolean).map((ev, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: ev.color, marginTop: 4, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 11, color: C.muted }}>{ev.time}</div>
                      <div style={{ fontSize: 13, color: C.txt, fontWeight: 500 }}>{ev.event}</div>
                    </div>
                  </div>
                ))}
              </Card>

              {selected.status === "pending" && (
                <div style={{ display: "flex", gap: 10 }}>
                  <button style={{ flex: 1, padding: "11px", borderRadius: 8, border: "none", background: C.teal, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>✓ Approve</button>
                  <button style={{ flex: 1, padding: "11px", borderRadius: 8, border: `1px solid ${C.red}`, background: C.redBg, color: C.red, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>✕ Reject</button>
                </div>
              )}
            </>
          );
        })() : (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, opacity: 0.5 }}>
            <div style={{ fontSize: 40 }}>📋</div>
            <div style={{ fontSize: 14, color: C.sub }}>Select a case to review</div>
          </div>
        )}
      </div>

      {/* New appeal modal */}
      {showNew && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <Card style={{ width: 460, padding: 28 }}>
            <div style={{ fontWeight: 800, fontSize: 17, color: C.txt, marginBottom: 20 }}>Submit New Appeal</div>
            {[["Trainer", "select"], ["Appeal Type", "select"], ["Session Date", "date"]].map(([label, type]) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.sub, marginBottom: 5 }}>{label}</div>
                {type === "select" ? (
                  <select style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }}>
                    <option>Select...</option>
                  </select>
                ) : (
                  <input type="date" style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13 }} />
                )}
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.sub, marginBottom: 5 }}>Description</div>
              <textarea rows={4} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, resize: "vertical", fontFamily: "Inter, sans-serif" }} placeholder="Describe the issue..." />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowNew(false)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", fontSize: 13, cursor: "pointer", color: C.sub }}>Cancel</button>
              <button onClick={() => setShowNew(false)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: C.teal, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Submit Appeal</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function BiometricView() {
  const [scanState, setScanState] = useState("idle"); // idle | scanning | success | fail
  const [recentScans, setRecentScans] = useState([
    { name: "Alicia Wong", trainer: "Marcus Tan", time: "10:14 AM", result: "success", method: "Face" },
    { name: "Chen Wei Lin", trainer: "Marcus Tan", time: "10:08 AM", result: "success", method: "Face" },
    { name: "Unknown", trainer: "—", time: "09:55 AM", result: "fail", method: "Face" },
    { name: "Maya Patel", trainer: "Priya Sharma", time: "09:44 AM", result: "success", method: "QR" },
  ]);

  const doScan = () => {
    setScanState("scanning");
    setTimeout(() => {
      setScanState("success");
      setRecentScans(prev => [{ name: "Eric Seah", trainer: "Marcus Tan", time: new Date().toLocaleTimeString("en-SG", {hour:"2-digit",minute:"2-digit"}), result: "success", method: "Face" }, ...prev.slice(0,5)]);
      setTimeout(() => setScanState("idle"), 2500);
    }, 2000);
  };

  const ringColor = scanState === "scanning" ? C.amber : scanState === "success" ? C.teal : scanState === "fail" ? C.red : "#E2E8F0";
  const ringLabel = scanState === "scanning" ? "Scanning…" : scanState === "success" ? "Check-in Confirmed" : scanState === "fail" ? "Not Recognised" : "Ready to Scan";

  return (
    <div style={{ padding: 28, overflowY: "auto", height: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>

        {/* Biometric scanner mockup */}
        <Card style={{ padding: 32, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 24 }}>Biometric Terminal — Rockbell FRS-100</div>

          {/* Face ring */}
          <div onClick={doScan} style={{
            width: 180, height: 180, borderRadius: "50%",
            border: `6px solid ${ringColor}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", marginBottom: 20,
            boxShadow: scanState === "scanning" ? `0 0 0 12px ${C.amberBg}` : scanState === "success" ? `0 0 0 12px ${C.tealBg}` : "none",
            transition: "all 0.4s ease",
            background: scanState === "scanning" ? C.amberBg : scanState === "success" ? C.tealBg : "#F7F9FC",
          }}>
            <div style={{ fontSize: 64 }}>
              {scanState === "scanning" ? "🔍" : scanState === "success" ? "✅" : scanState === "fail" ? "❌" : "👤"}
            </div>
          </div>

          <div style={{ fontWeight: 700, fontSize: 16, color: scanState === "success" ? C.teal : scanState === "fail" ? C.red : C.txt, marginBottom: 8 }}>{ringLabel}</div>
          <div style={{ fontSize: 12, color: C.sub, marginBottom: 28 }}>Click the scanner to simulate a check-in</div>

          {/* Method toggle */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {["Face ID", "Fingerprint", "QR Code"].map((m, i) => (
              <button key={m} style={{
                padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: i === 0 ? C.teal : "#F0F2F7", color: i === 0 ? "#fff" : C.sub, border: "none",
              }}>{m}</button>
            ))}
          </div>

          {scanState === "success" && (
            <div style={{ width: "100%", background: C.tealBg, border: `1px solid ${C.teal}`, borderRadius: 10, padding: "14px 18px" }}>
              <div style={{ fontWeight: 700, color: C.teal, fontSize: 13 }}>Eric Seah — Checked In</div>
              <div style={{ fontSize: 12, color: C.sub, marginTop: 4 }}>Trainer: Marcus Tan · 31 sessions remaining · Package valid</div>
            </div>
          )}
        </Card>

        {/* Recent scans */}
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, fontWeight: 700, fontSize: 14, color: C.txt, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.teal, boxShadow: `0 0 0 3px ${C.tealBg}` }} />
              Recent Scans
            </div>
            {recentScans.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", borderBottom: i < recentScans.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: s.result === "success" ? C.tealBg : C.redBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                  {s.result === "success" ? "✅" : "❌"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: C.txt }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: C.sub }}>{s.trainer} · {s.method}</div>
                </div>
                <div style={{ fontSize: 11, color: C.muted }}>{s.time}</div>
              </div>
            ))}
          </Card>

          {/* Quick stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Card style={{ padding: "16px 18px" }}>
              <div style={{ fontSize: 11, color: C.sub, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Scans Today</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.txt, marginTop: 4 }}>47</div>
              <div style={{ fontSize: 11, color: C.teal, marginTop: 2 }}>45 successful · 2 failed</div>
            </Card>
            <Card style={{ padding: "16px 18px" }}>
              <div style={{ fontSize: 11, color: C.sub, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Recognition Rate</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.teal, marginTop: 4 }}>95.7%</div>
              <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>Last 30 days</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard",       icon: "📊" },
  { id: "biometric", label: "Attendance",       icon: "🖐️" },
  { id: "trainer",   label: "Trainer Portal",   icon: "👤" },
  { id: "booking",   label: "Facility Booking", icon: "📅" },
  { id: "appeal",    label: "Appeals",          icon: "⚖️",  badge: 2 },
];

export default function App() {
  const [view, setView] = useState("dashboard");

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Inter', 'Segoe UI', sans-serif", background: C.bg, fontSize: 14 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #CBD5E0; border-radius: 4px; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>

      {/* Sidebar */}
      <div style={{ width: 220, background: C.nav, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ fontWeight: 900, fontSize: 16, color: "#fff", letterSpacing: "-0.01em" }}>TFMS</div>
          <div style={{ fontSize: 10, color: "#718096", marginTop: 2, letterSpacing: "0.06em", textTransform: "uppercase" }}>Trainer & Facility Portal</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px" }}>
          {NAV_ITEMS.map(item => (
            <div key={item.id} onClick={() => setView(item.id)} style={{
              display: "flex", alignItems: "center", gap: 11, padding: "10px 12px",
              borderRadius: 8, marginBottom: 3, cursor: "pointer",
              background: view === item.id ? "rgba(0,201,167,0.12)" : "transparent",
              borderLeft: view === item.id ? `3px solid ${C.teal}` : "3px solid transparent",
              transition: "all 0.15s",
            }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span style={{ fontSize: 13, fontWeight: view === item.id ? 700 : 400, color: view === item.id ? "#fff" : "#A0AEC0", flex: 1 }}>{item.label}</span>
              {item.badge && <span style={{ background: C.red, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "1px 6px" }}>{item.badge}</span>}
            </div>
          ))}
        </nav>

        {/* Bottom user */}
        <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar initials="FM" size={32} color="#4A5568" />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Facility Manager</div>
            <div style={{ fontSize: 10, color: "#718096" }}>Admin</div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <div style={{ height: 56, background: "#fff", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 24px", gap: 16, flexShrink: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.txt }}>
            {NAV_ITEMS.find(n => n.id === view)?.label}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 12, color: C.sub }}>25 June 2026, Wednesday</div>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.teal, boxShadow: `0 0 0 3px ${C.tealBg}` }} />
            <span style={{ fontSize: 12, color: C.teal, fontWeight: 600 }}>System Online</span>
          </div>
        </div>

        {/* View content */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          {view === "dashboard" && <DashboardView />}
          {view === "biometric" && <BiometricView />}
          {view === "trainer"   && <TrainerPortalView />}
          {view === "booking"   && <BookingView />}
          {view === "appeal"    && <AppealView />}
        </div>
      </div>
    </div>
  );
}
