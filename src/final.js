import React, { useEffect, useMemo, useRef, useState } from "react";
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

/*
  Full single-file React app (JSX) for a Udemy-like responsive site.
  - Self-contained UI helpers (Button, Input, Card, Badge, etc.)
  - Dark mode persisted
  - Navbar + Drawer
  - Home page, Course detail, Chat, Auth (OTP mock)
  - Bottom mobile nav
  - Uses Tailwind classes for styling (requires Tailwind setup)
*/

/* -------------------------
   UI helpers (self-contained)
   -------------------------*/
function Button({ children, variant = "primary", className = "", ...props }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 font-semibold transition";
  const variants = {
    primary: "bg-violet-600 text-white hover:bg-violet-700",
    outline: "border bg-white dark:bg-zinc-900 dark:border-zinc-700",
    ghost: "bg-transparent",
  };
  return (
    <button {...props} className={`${base} ${variants[variant] || variants.primary} ${className}`}>
      {children}
    </button>
  );
}

function IconButton({ children, title, className = "", ...props }) {
  return (
    <button {...props} title={title} className={`p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 ${className}`}>
      {children}
    </button>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border px-3 py-2 text-sm focus:ring-2 focus:ring-violet-400 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white ${className}`}
    />
  );
}

function Badge({ children, className = "" }) {
  return <span className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}

function Card({ children, className = "" }) {
  return <div className={`rounded-3xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 ${className}`}>{children}</div>;
}
function CardContent({ children, className = "" }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
function CardHeader({ children, className = "" }) {
  return <div className={`p-4 border-b dark:border-zinc-800 ${className}`}>{children}</div>;
}
function CardFooter({ children, className = "" }) {
  return <div className={`p-4 border-t dark:border-zinc-800 ${className}`}>{children}</div>;
}

/* Simple details-based accordion wrapper (keeps semantics)
   We use <details> and <summary> for accessibility and simplicity. */
function Accordion({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

/* -------------------------
   Theme persistence hook
   -------------------------*/
function usePersistedDark(key = "theme") {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem(key) === "dark";
    } catch (e) {
      return false;
    }
  });
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
    try {
      localStorage.setItem(key, dark ? "dark" : "light");
    } catch (e) {}
  }, [dark, key]);
  return [dark, setDark];
}

/* -------------------------
   Small UI blocks
   -------------------------*/
function Pill({ children }) {
  return <span className="rounded-full bg-white/80 px-2 py-1 text-[11px] font-medium shadow-sm dark:bg-white/5 dark:text-white">{children}</span>;
}

/* -------------------------
   Sample data
   -------------------------*/
const sampleCourses = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  title:
    i % 4 === 0
      ? `Mastering UI/UX — Project ${i + 1}`
      : i % 4 === 1
      ? `Python Bootcamp ${i + 1}`
      : i % 4 === 2
      ? `Algebra Made Easy ${i + 1}`
      : `Quantum Basics ${i + 1}`,
  instructor: ["Alex Sharma", "Priya Verma", "Jordan Lee", "Neha Kapoor"][i % 4],
  rating: +(3.8 + ((i * 13) % 14) / 10).toFixed(1),
  reviews: 200 + (i * 123) % 4200,
  price: i % 3 === 0 ? 0 : 499,
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

/* -------------------------
   CourseCard
   -------------------------*/
function CourseCard({ course, onOpen }) {
  return (
    <Card className="group overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
      <button onClick={() => onOpen(course)} className="text-left w-full">
        <div className="relative">
          <div className="aspect-[16/10] w-full overflow-hidden bg-zinc-100">
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-[1.02] transform transition" />
          </div>
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold dark:bg-zinc-900/90">
              <Star className="h-3.5 w-3.5 text-yellow-400" /> {course.rating.toFixed(1)}
            </span>
          </div>
        </div>

        <CardContent>
          <div className="mb-2 flex items-center gap-2 text-[12px]">
            <Pill>{course.lang}</Pill>
            <Pill>{course.level}</Pill>
            <Pill className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {course.duration}</Pill>
          </div>
          <h3 className="text-[15px] font-extrabold line-clamp-2">{course.title}</h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">by {course.instructor}</p>
        </CardContent>
      </button>

      <CardFooter className="flex items-center justify-between">
        <div className="text-lg font-extrabold">{course.price === 0 ? <span className="text-emerald-600">Free</span> : `${course.currency}${course.price}`}</div>
        <div className="flex items-center gap-2">
          {course.bestseller && <Badge className="bg-amber-400 text-black rounded-full px-2">Popular</Badge>}
          <Button variant="ghost" className="rounded-full">Save</Button>
        </div>
      </CardFooter>
    </Card>
  );
}

/* -------------------------
   TopNav
   -------------------------*/
function TopNav({ onOpenDrawer, onToggleTheme, dark, goto }) {
  return (
    <div className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur dark:bg-zinc-900/80 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 py-3 md:px-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button className="md:hidden p-2" onClick={onOpenDrawer}><Menu className="h-5 w-5" /></button>
          <button onClick={() => goto("/")} className="flex items-center gap-2">
            <PlayCircle className="h-6 w-6 text-violet-600" />
            <span className="text-lg font-bold">My Gyan Guru</span>
          </button>
        </div>

        <div className="hidden md:block w-full max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input placeholder="Search courses, topics, mentors" className="pl-9 h-10 rounded-2xl" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <IconButton onClick={onToggleTheme} title="Toggle theme">{dark ? <SunMedium className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</IconButton>
          <IconButton title="Notifications"><Bell className="h-5 w-5" /></IconButton>
          <img src="https://i.pravatar.cc/40?img=12" alt="avatar" className="hidden md:block h-8 w-8 rounded-full" />
          <div className="hidden md:flex gap-2">
            <Button variant="primary" onClick={() => goto("/auth?mode=login")}><LogIn className="h-4 w-4" /> Login</Button>
            <Button variant="primary" onClick={() => goto("/auth?mode=signup")}><UserPlus className="h-4 w-4" /> Sign up</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------
   SideDrawer
   -------------------------*/
function SideDrawer({ open, onClose, goto }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid grid-cols-[260px_1fr] bg-black/40" onClick={onClose}>
      <aside className="m-3 rounded-2xl bg-white p-4 dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src="https://i.pravatar.cc/40?img=12" className="h-10 w-10 rounded-full" alt="avatar" />
            <div className="font-semibold">Palak</div>
          </div>
          <button onClick={onClose}><ChevronLeft className="h-5 w-5" /></button>
        </div>

        <nav className="flex flex-col gap-2 text-sm">
          <button onClick={() => goto("/")} className="text-left rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">Home</button>
          <button onClick={() => goto("/chat")} className="text-left rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">Chat</button>
          <button onClick={() => goto("/my-courses")} className="text-left rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">My Courses</button>
          <button className="text-left rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">Downloads</button>
          <button className="text-left rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">Legal</button>
          <button className="text-left rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">Settings</button>
        </nav>

        <div className="mt-6">
          <Button variant="outline" className="w-full" onClick={() => goto("/auth")}>Login / Logout</Button>
          <div className="mt-2 text-center text-xs text-zinc-500">v1.0.0</div>
        </div>
      </aside>
      <div onClick={onClose} />
    </div>
  );
}

/* -------------------------
   Footer
   -------------------------*/
function AppFooter() {
  return (
    <footer className="mt-12 border-t bg-white dark:bg-zinc-950 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl p-6 text-sm text-zinc-600 dark:text-zinc-400">
        © {new Date().getFullYear()} My Gyan Guru. All rights reserved.
      </div>
    </footer>
  );
}

/* -------------------------
   Pages: Home
   -------------------------*/
function HomePage({ onOpenCourse }) {
  const [filters, setFilters] = useState({ category: "All", price: "all", level: "All Levels", sort: "relevance", bestseller: false });
  const [query, setQuery] = useState("");
  const categories = ["All", "UI/UX", "Programming", "Maths", "Science"];

  const results = useMemo(() => {
    return sampleCourses.filter((c) => {
      if (filters.category !== "All" && c.category !== filters.category) return false;
      if (filters.price === "free" && c.price !== 0) return false;
      if (filters.price === "paid" && c.price === 0) return false;
      if (filters.bestseller && !c.bestseller) return false;
      if (filters.level !== "All Levels" && c.level !== filters.level) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        if (!((c.title + c.instructor + c.category).toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [filters, query]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <div className="mb-6 grid gap-4 md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Learn anything, anytime</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Curated courses, mentors and tests.</p>
        </div>

        <div className="flex gap-2">
          <Input placeholder="Search courses..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-72" />
          <Button variant="ghost" className="hidden md:inline-flex">Teach</Button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3 overflow-auto">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setFilters((s) => ({ ...s, category: cat }))} className={`px-3 py-1 rounded-full ${filters.category === cat ? "bg-zinc-900 text-white" : "bg-white dark:bg-zinc-800"}`}>
            {cat}
          </button>
        ))}
      </div>

      <section>
        <h2 className="mb-3 text-xl font-extrabold dark:text-white">Available Courses</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((c) => (
            <CourseCard key={c.id} course={c} onOpen={onOpenCourse} />
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-2xl border bg-gradient-to-r from-violet-50 to-yellow-50 p-6 dark:from-zinc-800 dark:to-zinc-900">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h3 className="text-2xl font-extrabold">Become an instructor</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Share your knowledge, earn and build a community.</p>
            <div className="mt-4">
              <Button>Start teaching</Button>
            </div>
          </div>
          <div className="aspect-video overflow-hidden rounded-xl">
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600&auto=format&fit=crop" className="w-full h-full object-cover" alt="teach" />
          </div>
        </div>
      </section>
    </main>
  );
}

/* -------------------------
   Pages: Course detail
   -------------------------*/
function CourseDetail({ course, back }) {
  if (!course) return <div className="p-6">Pick a course from the homepage.</div>;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <button onClick={back} className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-600 hover:underline dark:text-zinc-300"><ChevronLeft className="w-4 h-4" /> Back</button>
      <div className="grid md:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-4">
          <h1 className="text-2xl font-extrabold dark:text-white">{course.title}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{course.desc}</p>

          <div className="aspect-video rounded-xl overflow-hidden border dark:border-zinc-800">
            <video controls className="w-full h-full bg-black">
              <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
            </video>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold mb-2 dark:text-white">Curriculum</h3>
            {[1, 2, 3].map((sec) => (
              <details key={sec} className="mb-2 rounded-lg border p-3 dark:border-zinc-800">
                <summary className="cursor-pointer font-semibold">Section {sec}: Foundations</summary>
                <ul className="mt-2 space-y-2">
                  {[1, 2, 3, 4].map((lesson) => (
                    <li key={lesson} className="flex items-center justify-between rounded-md border p-2 dark:border-zinc-800">
                      <div className="flex items-center gap-2"><PlayCircle className="w-4 h-4" /> Lesson {sec}.{lesson}</div>
                      <div className="text-xs text-zinc-500">6:0{lesson}</div>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <Card className="p-4">
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
              <Button>Buy Course</Button>
              <Button variant="outline">Save</Button>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-sm font-semibold mb-2">Instructor</div>
            <div className="flex items-center gap-3">
              <img src="https://i.pravatar.cc/48?img=32" className="h-12 w-12 rounded-full" alt="inst" />
              <div>
                <div className="font-semibold">Instructor {course.instructor}</div>
                <div className="text-xs text-zinc-500">Top rated instructor • {Math.round(course.rating)}★</div>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </main>
  );
}

/* -------------------------
   Pages: Chat
   -------------------------*/
function ChatPage() {
  const [messages, setMessages] = useState([
    { id: 1, from: "mentor", text: "Hii Palak... how may I help you?" },
    { id: 2, from: "me", text: "I just finished the Python basics course. What's next?" },
  ]);
  const [text, setText] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages]);

  function send() {
    if (!text.trim()) return;
    setMessages((m) => [...m, { id: Date.now(), from: "me", text }]);
    setText("");
    setTimeout(() => setMessages((m) => [...m, { id: Date.now() + 1, from: "mentor", text: "Great! Try intermediate Python project course." }]), 800);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 md:px-6 flex flex-col h-[70vh]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="font-semibold dark:text-white">Mentor Support</div>
          <div className="text-xs text-emerald-600">Connected</div>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <img src="https://i.pravatar.cc/40?img=65" className="h-8 w-8 rounded-full" alt="mentor" />
        </div>
      </div>

      <div ref={ref} className="flex-1 overflow-y-auto space-y-3 p-3 rounded-xl border dark:border-zinc-800">
        {messages.map((m) => (
          <div key={m.id} className={`max-w-[80%] p-3 rounded-2xl ${m.from === "me" ? "ml-auto bg-violet-600 text-white" : "bg-zinc-100 dark:bg-zinc-800"}`}>{m.text}</div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" />
        <Button onClick={send}>Send</Button>
      </div>
    </main>
  );
}

/* -------------------------
   Pages: Auth (login/signup/otp mock)
   -------------------------*/
function AuthPage({ onComplete }) {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode") || "login"; // login | signup
  const [stage, setStage] = useState(mode === "signup" ? "signup" : "login");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);

  function sendOtp() {
    setStage("otp");
  }
  function verifyOtp() {
    setTimeout(() => {
      onComplete && onComplete();
      window.history.replaceState({}, document.title, "/");
    }, 400);
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <button onClick={() => window.history.back()} className="text-sm text-zinc-500 mb-4 inline-flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Back</button>

      {stage === "otp" ? (
        <div className="rounded-3xl border p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-2xl font-bold mb-2">Verify OTP</h2>
          <p className="text-sm mb-4 text-zinc-500">Enter the 4-digit code sent to {phone || "your phone"}</p>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {otp.map((v, i) => (
              <Input key={i} value={v} onChange={(e) => { const val = e.target.value.replace(/\D/g, "").slice(0,1); setOtp((o) => { const n = [...o]; n[i] = val; return n; }); }} className="h-12 text-center rounded-xl" />
            ))}
          </div>
          <Button onClick={verifyOtp}>Verify & Continue</Button>
          <div className="mt-3 text-sm text-zinc-500">Didn't receive? <button className="underline">Resend</button></div>
        </div>
      ) : (
        <div className="rounded-3xl border p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-2xl font-bold mb-2">{stage === "login" ? "Welcome Back" : "Create an Account"}</h2>
          <div className="grid gap-3">
            {stage === "signup" && <Input placeholder="Full name" />}
            <Input placeholder="Email or phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input placeholder="Password" />
            <Button onClick={() => (stage === "login" ? (onComplete && onComplete()) : sendOtp())}>{stage === "login" ? "Login" : "Send OTP"}</Button>

            <div className="text-center text-sm text-zinc-500">OR</div>
            <div className="grid grid-cols-2 gap-3">
              <button className="rounded-xl border p-2">Continue with Google</button>
              <button className="rounded-xl border p-2">Continue with Apple</button>
            </div>

            <div className="text-center text-sm text-zinc-500">
              {stage === "login" ? <span>New here? <button onClick={() => setStage("signup")} className="underline">Create account</button></span>
                : <span>Already have an account? <button onClick={() => setStage("login")} className="underline">Login</button></span>}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* -------------------------
   Bottom nav (mobile)
   -------------------------*/
function BottomNavMobile() {
  return (
    <nav className="fixed bottom-3 left-1/2 z-40 w-full max-w-md -translate-x-1/2 rounded-3xl bg-white dark:bg-zinc-900/95 border p-2 md:hidden">
      <div className="grid grid-cols-4 gap-2">
        <Link to="/" className="flex flex-col items-center gap-1 py-2 text-xs text-zinc-700 dark:text-zinc-300">
          <PlayCircle size={18} /> <span>Home</span>
        </Link>
        <Link to="/courses" className="flex flex-col items-center gap-1 py-2 text-xs text-zinc-700 dark:text-zinc-300">
          <Bookmark size={18} /> <span>Courses</span>
        </Link>
        <Link to="/chat" className="flex flex-col items-center gap-1 py-2 text-xs text-zinc-700 dark:text-zinc-300">
          <MessageCircle size={18} /> <span>Chat</span>
        </Link>
        <Link to="/auth" className="flex flex-col items-center gap-1 py-2 text-xs text-zinc-700 dark:text-zinc-300">
          <UserPlus size={18} /> <span>Account</span>
        </Link>
      </div>
    </nav>
  );
}

/* -------------------------
   Main App wrapper
   -------------------------*/
export default function App() {
  const [dark, setDark] = usePersistedDark();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  return (
    <Router>
      <MainApp
        dark={dark}
        setDark={setDark}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
      />
    </Router>
  );
}

function MainApp({ dark, setDark, drawerOpen, setDrawerOpen, selectedCourse, setSelectedCourse }) {
  const navigate = useNavigate();

  const goto = (p, payload) => {
    if (typeof p === "string" && p.startsWith("/")) {
      navigate(p);
      return;
    }
    switch (p) {
      case "home":
        navigate("/");
        break;
      case "login":
        navigate("/auth?mode=login");
        break;
      case "signup":
        navigate("/auth?mode=signup");
        break;
      case "chat":
        navigate("/chat");
        break;
      case "course":
        if (payload && payload.id) {
          setSelectedCourse(payload);
          navigate(`/course/${payload.id}`);
        }
        break;
      default:
        navigate(p);
    }
    setDrawerOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <TopNav onOpenDrawer={() => setDrawerOpen(true)} onToggleTheme={() => setDark((d) => !d)} dark={dark} goto={goto} />
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} goto={goto} />

      <Routes>
        <Route path="/" element={<HomePage onOpenCourse={(c) => { setSelectedCourse(c); goto("course", c); }} />} />
        <Route path="/courses" element={<HomePage onOpenCourse={(c) => { setSelectedCourse(c); goto("course", c); }} />} />
        <Route path="/course/:id" element={<CourseDetail course={selectedCourse || sampleCourses[0]} back={() => goto("home")} />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/auth" element={<AuthPage onComplete={() => goto("home")} />} />
      </Routes>

      <AppFooter />
      <BottomNavMobile />
    </div>
  );
}
