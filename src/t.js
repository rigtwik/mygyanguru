import React, { useEffect, useMemo, useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Menu,
  SunMedium,
  Moon,
  PlayCircle,
  Search,
  Star,
  Clock,
  Users,
  Bell,
  Bookmark,
  LogIn,
  UserPlus,
  MessageCircle,
  ChevronLeft,
  Download,
  Shield,
  Globe,
  Settings,
  LogOut,
  Eye,
  EyeOff,
} from "lucide-react";

/* ======================================================
   Single-file React app: Udemy-style features (JSX)
   - Dark theme (persisted)
   - Auth (signup / OTP / login) - mock flow
   - Course grid, course detail with video + curriculum
   - Mentor chat UI
   - Side drawer & mobile bottom nav
   - Responsive + Tailwind classes
   ====================================================== */

/* ---------- Theme helper (persist) ---------- */
function usePersistedTheme(key = "theme") {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem(key) === "dark";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
    try {
      localStorage.setItem(key, dark ? "dark" : "light");
    } catch {}
  }, [dark, key]);
  return [dark, setDark];
}

/* ---------- Sample data ---------- */
const sampleCourses = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  title:
    i % 4 === 0
      ? `Mastering UI/UX — Project ${i + 1}`
      : i % 4 === 1
      ? `Python Bootcamp ${i + 1}`
      : i % 4 === 2
      ? `Mathematics Tricks ${i + 1}`
      : `Science Explorations ${i + 1}`,
  instructor: ["Alex Sharma", "Priya Verma", "Jordan Lee", "Neha Kapoor"][i % 4],
  rating: +(3.8 + ((i * 13) % 14) / 10).toFixed(1),
  reviews: 200 + (i * 123) % 4200,
  price: i % 3 === 0 ? 0 : 399,
  currency: "₹",
  level: ["Beginner", "Intermediate", "Advanced", "All Levels"][i % 4],
  category: ["UI/UX", "Programming", "Maths", "Science"][i % 4],
  duration: `${3 + (i % 7)} Weeks`,
  students: 500 + (i * 567) % 12000,
  thumbnail: `https://picsum.photos/seed/palak${i}/800/500`,
  bestseller: i % 5 === 0,
  lang: "Hindi, English",
  desc: "Learn by doing — projects, quizzes and mentor support.",
}));

/* ---------- Small UI atoms ---------- */
function IconButton({ children, onClick, title }) {
  return (
    <button onClick={onClick} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800" title={title}>
      {children}
    </button>
  );
}

/* ---------- Navbar (includes theme toggle + auth links) ---------- */
function Navbar({ onOpenDrawer, dark, toggleTheme }) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur dark:bg-zinc-900/80 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 py-3 md:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button className="md:hidden p-2" onClick={onOpenDrawer}><Menu className="w-5 h-5" /></button>
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <PlayCircle className="h-6 w-6 text-violet-600" />
            <span className="font-bold text-lg">My Gyan Guru</span>
          </button>
        </div>

        <div className="hidden md:block w-full max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input className="w-full rounded-full border px-10 py-2 dark:bg-zinc-800 dark:text-white focus:outline-none" placeholder="Search courses, topics, mentors..." />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <IconButton onClick={toggleTheme} title="Toggle theme">{dark ? <SunMedium className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</IconButton>
          <IconButton title="Notifications"><Bell className="h-5 w-5" /></IconButton>
          <button onClick={() => navigate("/auth")} className="hidden md:inline-flex items-center gap-2 rounded-full bg-violet-600 px-3 py-1 text-white"><LogIn className="h-4 w-4" /> Login</button>
          <button onClick={() => navigate("/signup")} className="rounded-full bg-violet-600 px-3 py-1 text-white md:ml-2"><UserPlus className="h-4 w-4" /> Sign up</button>
        </div>
      </div>
    </header>
  );
}

/* ---------- Drawer (mobile) ---------- */
function SideDrawer({ open, onClose, goto }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid grid-cols-[260px_1fr] bg-black/40" onClick={onClose}>
      <aside className="m-3 rounded-2xl bg-white p-4 dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3"><img src="https://i.pravatar.cc/40?img=12" className="h-10 w-10 rounded-full" alt="avatar" /><div className="font-semibold">Palak</div></div>
          <button onClick={onClose}><ChevronLeft className="h-5 w-5" /></button>
        </div>
        <nav className="flex flex-col gap-2">
          <button onClick={() => goto("/")} className="text-left rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800">Home</button>
          <button onClick={() => goto("/chat")} className="text-left rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800">Chat</button>
          <button onClick={() => goto("/my-courses")} className="text-left rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800">My Courses</button>
          <button className="text-left rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800">Downloads</button>
          <button className="text-left rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800">Legal</button>
          <button className="text-left rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800">Settings</button>
        </nav>
        <div className="mt-6">
          <button className="w-full rounded-lg border px-3 py-2" onClick={() => goto("/auth")}>Login / Logout</button>
        </div>
      </aside>
      <div onClick={onClose} />
    </div>
  );
}

/* ---------- CourseCard ---------- */
function CourseCard({ course, onOpen }) {
  return (
    <div className="group rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md dark:bg-zinc-900">
      <button onClick={() => onOpen(course)} className="text-left">
        <div className="aspect-[16/10] w-full overflow-hidden">
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-[1.02] transform transition" />
        </div>
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-zinc-500 dark:text-zinc-300">{course.level}</div>
            <div className="inline-flex items-center gap-1 text-xs bg-white/90 px-2 py-1 rounded-full dark:bg-zinc-800">
              <Star className="h-4 w-4 text-yellow-400" /> <span className="font-semibold">{course.rating}</span>
            </div>
          </div>
          <h3 className="font-semibold text-sm line-clamp-2">{course.title}</h3>
          <p className="text-xs text-zinc-500 mt-1">by {course.instructor}</p>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-lg font-bold">{course.price === 0 ? <span className="text-emerald-600">Free</span> : <span>{course.currency}{course.price}</span>}</div>
            {course.bestseller && <div className="text-xs bg-amber-400 px-2 py-1 rounded-full">Popular</div>}
          </div>
        </div>
      </button>
    </div>
  );
}

/* ---------- Pages: Home ---------- */
function Home({ onOpenCourse }) {
  const [state, setState] = useState({ category: "All", freeOnly: false, query: "" });
  const filtered = useMemo(() => {
    let list = [...sampleCourses];
    if (state.query.trim()) {
      const q = state.query.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
    }
    if (state.freeOnly) list = list.filter((c) => c.price === 0);
    if (state.category !== "All") list = list.filter((c) => c.category === state.category);
    return list;
  }, [state]);

  const categories = ["All", "UI/UX", "Programming", "Maths", "Science"];

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <div className="mb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">Learn anything, anytime</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Curated courses, mentors and tests.</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button className="rounded-full border px-3 py-1">Teach</button>
            <button className="rounded-full border px-3 py-1">Cart</button>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3 overflow-auto">
        <input value={state.query} onChange={(e) => setState(s => ({ ...s, query: e.target.value }))} placeholder="Search courses..." className="flex-1 rounded-full border px-4 py-2 dark:bg-zinc-800" />
        <div className="hidden md:flex items-center gap-2">
          <button onClick={() => setState(s => ({ ...s, freeOnly: !s.freeOnly }))} className={`rounded-full px-3 py-1 ${state.freeOnly ? "bg-zinc-900 text-white" : ""}`}>Free only</button>
        </div>
      </div>

      <div className="mb-4 flex gap-2 overflow-auto">
        {categories.map(c => <button key={c} onClick={() => setState(s => ({ ...s, category: c }))} className={`px-3 py-1 rounded-full ${state.category === c ? "bg-zinc-900 text-white" : "bg-white dark:bg-zinc-800"}`}>{c}</button>)}
      </div>

      <section>
        <h2 className="mb-3 text-xl font-bold dark:text-white">Available Courses</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(c => <CourseCard key={c.id} course={c} onOpen={onOpenCourse} />)}
        </div>
      </section>

      <section className="mt-12 rounded-2xl border bg-gradient-to-r from-violet-50 to-yellow-50 p-6 dark:from-zinc-800 dark:to-zinc-900">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h3 className="text-2xl font-extrabold">Become an instructor</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Share your knowledge, earn and build a community.</p>
            <div className="mt-4">
              <button className="rounded-full bg-violet-600 px-4 py-2 text-white">Start teaching</button>
            </div>
          </div>
          <div className="aspect-video overflow-hidden rounded-xl"><img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600&auto=format&fit=crop" className="w-full h-full object-cover" alt="teach" /></div>
        </div>
      </section>
    </main>
  );
}

/* ---------- Course Detail Page ---------- */
function CourseDetail({ course }) {
  if (!course) return <div className="p-6">Course not found.</div>;
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300 mb-4"><ChevronLeft className="w-4 h-4" /> Back</Link>
      <div className="grid md:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-4">
          <h1 className="text-2xl font-extrabold dark:text-white">{course.title}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{course.desc}</p>
          <div className="aspect-video rounded-xl overflow-hidden border dark:border-zinc-800">
            <video controls className="w-full h-full bg-black">
              <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
            </video>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold mb-2 dark:text-white">Curriculum</h3>
            {[1, 2, 3].map(sec => (
              <details key={sec} className="mb-2 rounded-lg border p-3 dark:border-zinc-800">
                <summary className="cursor-pointer font-semibold">Section {sec} — Foundations</summary>
                <ul className="mt-2 space-y-2">
                  {[1,2,3].map(l => (
                    <li key={l} className="flex items-center justify-between rounded-md border p-2 dark:border-zinc-800">
                      <div className="flex items-center gap-2"><PlayCircle className="w-4 h-4" /> Lesson {sec}.{l}</div>
                      <div className="text-xs text-zinc-500">6:0{l}</div>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">This course includes</div>
                <div className="text-xs text-zinc-500">{course.duration} • {course.lang} • {course.level}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{course.price === 0 ? <span className="text-emerald-600">Free</span> : `${course.currency}${course.price}`}</div>
                <div className="text-xs text-zinc-500">one-time</div>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              <button className="rounded-full bg-violet-600 px-4 py-2 text-white">Buy Course</button>
              <button className="rounded-full border px-4 py-2">Save</button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

/* ---------- Chat Page ---------- */
function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, from: "mentor", text: "Hi Palak! How can I help?" },
    { id: 2, from: "me", text: "I completed Python basics. What's next?" },
  ]);
  const [text, setText] = useState("");
  const ref = useRef();
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [messages]);

  function send() {
    if (!text.trim()) return;
    setMessages(m => [...m, { id: Date.now(), from: "me", text }]);
    setText("");
    // mock reply
    setTimeout(() => setMessages(m => [...m, { id: Date.now()+1, from: "mentor", text: "Great! Try intermediate Python project course." }]), 900);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 md:px-6 flex flex-col h-[70vh]">
      <div className="mb-4 flex items-center justify-between">
        <div><div className="font-semibold dark:text-white">Mentor Support</div><div className="text-xs text-emerald-600">Connected</div></div>
        <div className="flex items-center gap-2"><Users className="w-4 h-4" /> <img src="https://i.pravatar.cc/40?img=65" className="h-8 w-8 rounded-full" alt="mentor" /></div>
      </div>
      <div ref={ref} className="flex-1 overflow-y-auto space-y-3 p-3 rounded-xl border dark:border-zinc-800">
        {messages.map(m => (
          <div key={m.id} className={`max-w-[80%] p-3 rounded-2xl ${m.from === "me" ? "ml-auto bg-violet-600 text-white" : "bg-zinc-100 dark:bg-zinc-800"}`}>{m.text}</div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" className="flex-1 rounded-full border px-4 py-2 dark:bg-zinc-800" />
        <button onClick={send} className="rounded-full bg-violet-600 px-4 py-2 text-white">Send</button>
      </div>
    </main>
  );
}

/* ---------- Auth (signup/login/otp) ---------- */
function AuthRoutes() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [stage, setStage] = useState("login"); // login | signup | otp

  function handleSendOTP() {
    // mock: go to otp
    setStage("otp");
  }
  function handleVerifyOTP() {
    // mock verify
    navigate("/");
  }

  if (stage === "otp") {
    return (
      <main className="mx-auto max-w-md px-4 py-8">
        <button onClick={() => setStage("signup")} className="text-sm text-zinc-500 mb-4 inline-flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Back</button>
        <div className="rounded-2xl border p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-2xl font-bold mb-2">Verify OTP</h2>
          <p className="text-sm mb-4 text-zinc-500">Enter the 4-digit code sent to {phone || "your phone"}</p>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {otp.map((v, i) => (
              <input key={i} value={v} onChange={(e) => { const val = e.target.value.replace(/\D/g, "").slice(0,1); setOtp(o => { const n = [...o]; n[i]=val; return n; }); }} className="h-12 rounded-xl text-center dark:bg-zinc-800" />
            ))}
          </div>
          <button onClick={handleVerifyOTP} className="w-full rounded-full bg-violet-600 px-4 py-2 text-white">Verify & Continue</button>
          <div className="mt-3 text-center text-sm text-zinc-500">Didn't receive? <button className="underline">Resend</button></div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <button onClick={() => window.history.back()} className="text-sm text-zinc-500 mb-4 inline-flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Back</button>
      <div className="rounded-2xl border p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{stage === "login" ? "Welcome Back" : "Create Account"}</h2>
          <div className="text-sm text-zinc-500">{stage === "login" ? "New? Sign up" : "Have an account? Login"}</div>
        </div>

        <div className="grid gap-3">
          {stage === "signup" && <input placeholder="Full name" className="p-3 rounded-xl dark:bg-zinc-800" />}
          <input placeholder="Email or phone" className="p-3 rounded-xl dark:bg-zinc-800" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <div className="relative">
            <input type={showPass ? "text" : "password"} placeholder="Password" className="p-3 rounded-xl w-full dark:bg-zinc-800" />
            <button onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">{showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
          </div>

          <button onClick={() => stage === "login" ? navigate("/") : handleSendOTP()} className="mt-2 rounded-full bg-violet-600 px-4 py-2 text-white">{stage === "login" ? "Login" : "Send OTP"}</button>
          <div className="text-center text-sm text-zinc-500">OR</div>
          <div className="grid grid-cols-2 gap-3">
            <button className="rounded-xl border p-2">Continue with Google</button>
            <button className="rounded-xl border p-2">Continue with Apple</button>
          </div>

          <div className="text-center text-sm text-zinc-500">
            {stage === "login" ? <span>New here? <button onClick={() => setStage("signup")} className="underline">Create account</button></span> :
              <span>Already have an account? <button onClick={() => setStage("login")} className="underline">Login</button></span>}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ---------- Simple footer ---------- */
function AppFooter() {
  return (
    <footer className="mt-12 border-t bg-white dark:bg-zinc-950 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl p-6 text-sm text-zinc-600 dark:text-zinc-400">© {new Date().getFullYear()} My Gyan Guru. All rights reserved.</div>
    </footer>
  );
}

/* ---------- Main App (routes + state) ---------- */
export default function App() {
  const [dark, setDark] = usePersistedTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <Navbar onOpenDrawer={() => setDrawerOpen(true)} dark={dark} toggleTheme={() => setDark(d => !d)} />
        <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} goto={(p) => { setDrawerOpen(false); window.location.href = p; }} />

        <Routes>
          <Route path="/" element={<Home onOpenCourse={(c) => { setSelectedCourse(c); window.location.href = `/course/${c.id}`; }} />} />
          <Route path="/course/:id" element={<CourseDetail course={selectedCourse || sampleCourses[0]} />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/auth" element={<AuthRoutes />} />
          <Route path="/signup" element={<AuthRoutes />} />
        </Routes>

        <AppFooter />

        {/* mobile bottom nav */}
        <nav className="fixed bottom-3 left-1/2 z-40 w-full max-w-md -translate-x-1/2 rounded-3xl bg-white dark:bg-zinc-900/95 border p-2 md:hidden">
          <div className="grid grid-cols-4 gap-2">
            <Link to="/" className="flex flex-col items-center text-xs py-2 rounded-xl text-zinc-700 dark:text-zinc-300"><HomeIcon /></Link>
            <Link to="/course/1" className="flex flex-col items-center text-xs py-2 rounded-xl text-zinc-700 dark:text-zinc-300">Courses</Link>
            <Link to="/chat" className="flex flex-col items-center text-xs py-2 rounded-xl text-zinc-700 dark:text-zinc-300"><MessageCircle className="w-5 h-5" /><div className="text-[11px]">Chat</div></Link>
            <Link to="/auth" className="flex flex-col items-center text-xs py-2 rounded-xl text-zinc-700 dark:text-zinc-300"><UserPlus className="w-5 h-5" /><div className="text-[11px]">Account</div></Link>
          </div>
        </nav>
      </div>
    </Router>
  );
}

/* ---------- small Home icon component (inline) ---------- */
function HomeIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path d="M3 11.5L12 4l9 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 21V12h14v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
