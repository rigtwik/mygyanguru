/* App.jsx — Single-file Udemy-like responsive site (plain JS + JSX)
   Dependencies:
     react, react-dom, react-router-dom, framer-motion, lucide-react
   Styling:
     Tailwind CSS (you must have Tailwind configured)
*/

import React, { useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  PlayCircle,
  Search,
  SunMedium,
  Moon,
  Bell,
  LogIn,
  UserPlus,
  MessageCircle,
  ChevronLeft,
  Bookmark,
  Settings,
  LogOut,
  Users,
  Clock,
  Star,
  Download,
  Shield,
  Globe,
  ChevronDown,  
  Play,
  Eye,
  EyeOff,
} from "lucide-react";

/* ---------------------------
   THEME / DESIGN TOKENS
   --------------------------- */
const THEME = {
  colors: {
    deep: "#1F1431",
    deep2: "#24173A",
    primary: "#6B4DE6",
    accent: "#FFC940",
    neutralBg: "#F7F7FB",
    pill: "#EFE9FF",
  },
  radii: {
    card: "1.25rem",
    pill: "9999px",
  },
};

/* ---------------------------
   UTILITIES
   --------------------------- */
function useLocalState(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState];
}

function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 9);
}

/* ---------------------------
   DARK MODE HOOK
   --------------------------- */
function useDarkMode(key = "theme") {
  const [isDark, setIsDark] = useState(() => {
    try {
      const cached = localStorage.getItem(key);
      if (cached) return cached === "dark";
      // default prefer-color-scheme
      if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      return false;
    } catch {
      return false;
    }
  });
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
    try {
      localStorage.setItem(key, isDark ? "dark" : "light");
    } catch {}
  }, [isDark, key]);
  return [isDark, setIsDark];
}

/* ---------------------------
   MOCK DATA
   --------------------------- */
const CATEGORIES = ["All", "UI/UX", "Programming", "Maths", "Science", "Languages", "Business"];
const LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"];

const initialCourses = Array.from({ length: 16 }).map((_, i) => {
  const titles = [
    "Mastering UI/UX Design",
    "Python for Beginners",
    "Algebra Made Easy",
    "Quantum Basics",
    "React from Zero",
    "Data Structures",
    "English Conversation",
    "Startup 101",
  ];
  const instructors = ["A. Sharma", "P. Verma", "Jordan Lee", "Neha Kapoor", "Rohit Jain"];
  return {
    id: i + 1,
    title: titles[i % titles.length] + (i >= titles.length ? ` — Vol ${Math.floor(i / titles.length)}` : ""),
    instructor: instructors[i % instructors.length],
    rating: +(3.7 + ((i * 13) % 30) / 10).toFixed(1),
    reviews: 120 + (i * 53) % 4000,
    price: i % 4 === 0 ? 0 : [299, 399, 499, 699][i % 4],
    currency: "₹",
    level: LEVELS[i % LEVELS.length],
    category: CATEGORIES[(i % (CATEGORIES.length - 1)) + 1],
    duration: `${4 + (i % 8)} Weeks`,
    students: 100 + (i * 317) % 5000,
    thumbnail: `https://picsum.photos/seed/course${i}/800/500`,
    bestseller: i % 5 === 0,
    lang: "Hindi, English",
    desc: "Project-based learning with practical assignments and mentor feedback.",
    curriculum: Array.from({ length: 3 }).map((__, s) => ({
      section: `Section ${s + 1}: Foundations`,
      lessons: Array.from({ length: 4 }).map((___, l) => ({
        id: `${i + 1}-${s + 1}-${l + 1}`,
        title: `Lesson ${s + 1}.${l + 1}: Topic ${l + 1}`,
        duration: `6:0${l + 1}`,
        video: "https://www.w3schools.com/html/mov_bbb.mp4",
      })),
    })),
  };
});

/* ---------------------------
   SMALL UI PRIMITIVES
   --------------------------- */

function Button({ children, className = "", variant = "primary", ...props }) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold transition";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    ghost: "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800",
    outline: "border dark:border-zinc-700 bg-white dark:bg-zinc-900",
  };
  return (
    <button {...props} className={`${base} ${variants[variant] || variants.primary} ${className}`}>
      {children}
    </button>
  );
}

function IconButton({ children, className = "", ...props }) {
  return (
    <button {...props} className={`p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 ${className}`}>
      {children}
    </button>
  );
}

function Input({ className = "", ...props }) {
  return <input {...props} className={`w-full rounded-2xl border px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700 ${className}`} />;
}

function Badge({ children, className = "" }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}>{children}</span>;
}

function Card({ children, className = "" }) {
  return <div className={`rounded-2xl border bg-white dark:bg-zinc-900 dark:border-zinc-800 ${className}`}>{children}</div>;
}

function CardHeader({ children, className = "" }) {
  return <div className={`p-4 border-b dark:border-zinc-800 ${className}`}>{children}</div>;
}
function CardContent({ children, className = "" }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
function CardFooter({ children, className = "" }) {
  return <div className={`p-4 border-t dark:border-zinc-800 ${className}`}>{children}</div>;
}

/* ---------------------------
   LAYOUT: TopBar / Drawer / Footer
   --------------------------- */

function TopBar({ onMenuToggle, onToggleTheme, dark, go }) {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur dark:bg-zinc-900/80 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 py-3 md:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onMenuToggle} className="md:hidden p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <Menu className="h-5 w-5" />
          </button>
          <button onClick={() => go("home")} className="flex items-center gap-2">
            <PlayCircle className="h-6 w-6 text-violet-600" />
            <span className="text-lg font-bold">My Gyan Guru</span>
          </button>
        </div>

        <div className="hidden md:block w-full max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input placeholder="Search courses, topics, mentors" className="pl-9 h-10" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <IconButton onClick={onToggleTheme}>{dark ? <SunMedium className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</IconButton>
          <IconButton>
            <Bell className="h-5 w-5" />
          </IconButton>
          <img src="https://i.pravatar.cc/40?img=12" className="hidden md:block h-8 w-8 rounded-full" alt="avatar" />
          <div className="hidden md:flex gap-2">
            <Button onClick={() => go("login")} variant="outline">Login</Button>
            <Button onClick={() => go("signup")}>Sign up</Button>
          </div>
        </div>
      </div>
    </header>
  );
}

function SideDrawer({ open, onClose, go }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid grid-cols-[260px_1fr] bg-black/40" onClick={onClose}>
      <aside className="m-3 rounded-2xl bg-white p-4 dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src="https://i.pravatar.cc/40?img=12" className="h-10 w-10 rounded-full" alt="me" />
            <div className="text-sm font-semibold">Palak</div>
          </div>
          <button onClick={onClose}><X /></button>
        </div>

        <nav className="flex flex-col gap-2">
          <button onClick={() => go("home")} className="text-left rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">Home</button>
          <button onClick={() => go("chat")} className="text-left rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">Chat</button>
          <button onClick={() => go("my-courses")} className="text-left rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">My Courses</button>
          <button onClick={() => go("downloads")} className="text-left rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">Downloads</button>
          <button onClick={() => go("settings")} className="text-left rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800">Settings</button>
        </nav>

        <div className="mt-6">
          <Button variant="outline" className="w-full" onClick={() => go("login")}><LogOut className="mr-2 h-4 w-4" /> Logout</Button>
          <div className="mt-2 text-center text-xs text-zinc-500">v1.0.0</div>
        </div>
      </aside>
      <div onClick={onClose} />
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-12 border-t bg-white dark:bg-zinc-950 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl p-6 text-sm text-zinc-600 dark:text-zinc-400 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-semibold">
            <PlayCircle className="h-5 w-5 text-violet-600" /> My Gyan Guru
          </div>
          <div>Study smart with friendly design and structured content.</div>
        </div>
        <div className="flex gap-6">
          <div>
            <div className="font-medium mb-2">Company</div>
            <ul className="space-y-1 text-sm">
              <li>About</li>
              <li>Careers</li>
              <li>Blog</li>
            </ul>
          </div>
          <div>
            <div className="font-medium mb-2">Explore</div>
            <ul className="space-y-1 text-sm">
              {CATEGORIES.slice(1).map((c) => <li key={c}>{c}</li>)}
            </ul>
          </div>
        </div>
        <div className="text-sm">
          <div className="font-medium mb-2">Legal</div>
          <ul className="space-y-1">
            <li>Privacy</li>
            <li>Terms</li>
            <li>Cookie policy</li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-zinc-500 dark:text-zinc-400">© {new Date().getFullYear()} My Gyan Guru. All rights reserved.</div>
    </footer>
  );
}

/* ---------------------------
   COURSE CARD + LIST
   --------------------------- */

function CourseCard({ course, onOpen, onToggleSave, saved }) {
  return (
    <Card className="group overflow-hidden shadow-sm hover:shadow-lg">
      <button onClick={() => onOpen(course)} className="text-left w-full">
        <div className="relative">
          <div className="aspect-[16/10] w-full overflow-hidden">
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition group-hover:scale-[1.02]" />
          </div>
          <div className="absolute right-3 top-3">
            <Badge className="bg-white/90 text-zinc-800 dark:bg-zinc-900/80">
              <Star className="h-3.5 w-3.5 text-yellow-400" /> {course.rating.toFixed(1)}
            </Badge>
          </div>
        </div>
        <CardContent>
          <div className="mb-2 flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
            <span className="rounded-full bg-white/80 px-2 py-0.5">{course.lang}</span>
            <span className="rounded-full bg-white/80 px-2 py-0.5">{course.level}</span>
            <span className="rounded-full bg-white/80 px-2 py-0.5 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {course.duration}</span>
          </div>
          <h3 className="text-sm font-extrabold line-clamp-2">{course.title}</h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">by {course.instructor}</p>
        </CardContent>
      </button>
      <CardFooter className="flex items-center justify-between">
        <div className="text-lg font-extrabold">{course.price === 0 ? <span className="text-emerald-600">Free</span> : `${course.currency}${course.price}`}</div>
        <div className="flex items-center gap-2">
          {course.bestseller && <Badge className="bg-amber-400 text-black">Popular</Badge>}
          <button onClick={() => onToggleSave(course)} className="rounded-full px-3 py-1 border dark:border-zinc-700 text-sm">{saved ? "Saved" : "Save"}</button>
        </div>
      </CardFooter>
    </Card>
  );
}

/* ---------------------------
   FILTERS COMPONENT
   --------------------------- */

function Filters({ filters, setFilters }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="hidden md:flex items-center gap-2">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setFilters({ ...filters, category: c })} className={`px-3 py-1 rounded-full ${filters.category === c ? "bg-zinc-900 text-white" : "bg-white dark:bg-zinc-800"}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })} className="rounded-full border px-3 py-1 bg-white dark:bg-zinc-800">
          <option value="relevance">Relevance</option>
          <option value="rating">Highest Rated</option>
          <option value="newest">Newest</option>
          <option value="students">Most Students</option>
          <option value="price_low">Price: Low→High</option>
          <option value="price_high">Price: High→Low</option>
        </select>

        <label className="flex items-center gap-2 rounded-full border px-3 py-1 dark:border-zinc-700">
          <input type="checkbox" checked={filters.popular} onChange={(e) => setFilters({ ...filters, popular: e.target.checked })} />
          <span className="text-sm">Popular only</span>
        </label>
      </div>
    </div>
  );
}

/* ---------------------------
   PAGES
   --------------------------- */

function HomePage({ courses, onOpenCourse, saved, onToggleSave }) {
  const [filters, setFilters] = useState({ category: "All", sort: "relevance", popular: false });
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    let list = [...courses];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((c) => (c.title + c.instructor + c.category).toLowerCase().includes(q));
    }
    if (filters.category && filters.category !== "All") list = list.filter((c) => c.category === filters.category);
    if (filters.popular) list = list.filter((c) => c.bestseller);
    const sorters = {
      relevance: (a, b) => 0,
      rating: (a, b) => b.rating - a.rating,
      newest: (a, b) => b.id - a.id,
      students: (a, b) => b.students - a.students,
      price_low: (a, b) => a.price - b.price,
      price_high: (a, b) => b.price - a.price,
    };
    list.sort(sorters[filters.sort] || sorters.relevance);
    return list;
  }, [courses, filters, query]);

  return (
    <>
      <section>
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <div className="mb-4">
            <div className="text-2xl font-extrabold">Good Morning</div>
            <div className="text-sm font-semibold" style={{ color: THEME.colors.accent }}>Palak Maheshwari</div>
          </div>

          <div className="relative mb-6">
            <div className="rounded-3xl overflow-hidden border shadow-sm dark:border-zinc-800">
              <div className="flex items-center gap-6 p-6" style={{ background: "linear-gradient(324deg, rgb(40 15 232), rgb(111 90 220))" }}>
                <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=400&auto=format&fit=crop" className="hidden md:block h-28 w-28 rounded-2xl object-cover" alt="promo" />
                <div className="flex-1">
                  <div className="text-xs font-semibold uppercase">MY GYAN GURU</div>
                  <h2 className="text-xl font-extrabold">10% OFF <span className="font-medium">All Courses</span></h2>
                  <p className="text-sm">Limited time offer for new learners</p>
                </div>
                <Button>Explore</Button>
              </div>
            </div>
          </div>

          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div><Filters filters={filters} setFilters={setFilters} /></div>
            <div className="flex items-center gap-3">
              <Input placeholder="Search courses" value={query} onChange={(e) => setQuery(e.target.value)} className="h-10" />
              <div className="text-sm text-zinc-500">{results.length} results</div>
            </div>
          </div>

          <main className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((c) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <CourseCard course={c} onOpen={onOpenCourse} onToggleSave={onToggleSave} saved={saved.includes(c.id)} />
              </motion.div>
            ))}
          </main>

          <section className="mt-12 rounded-2xl border bg-gradient-to-r from-[#EDE7FF] to-[#FFF4D6] p-6 dark:from-zinc-800 dark:to-zinc-900">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="text-2xl font-extrabold">Ready to Learn Something New?</h3>
                <p className="text-sm text-zinc-600">Create an account and unlock personalized learning, mentor chat, and test series.</p>
                <div className="mt-4"><Button>Create Account</Button></div>
              </div>
              <div className="aspect-video overflow-hidden rounded-xl">
                <img src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1600&auto=format&fit=crop" className="w-full h-full object-cover" alt="cta" />
              </div>
            </div>
          </section>
        </div>
      </section>
    </>
  );
}

/* ---------------------------
   COURSE DETAIL PAGE
   --------------------------- */

function CourseDetailPage({ course, onBack, onEnroll, onSave, saved }) {
  if (!course) return <div className="p-6">Course not found</div>;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-600">
        <ChevronLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div>
          <h1 className="text-2xl font-extrabold">{course.title}</h1>
          <p className="text-sm text-zinc-600 mt-2">{course.desc}</p>

          <div className="mt-4 aspect-video rounded-2xl overflow-hidden border dark:border-zinc-800">
            <video controls className="w-full h-full bg-black">
              <source src={course.curriculum[0].lessons[0].video} type="video/mp4" />
            </video>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Curriculum</h3>
            {course.curriculum.map((section, idx) => (
              <details key={idx} className="mb-3 rounded-lg border p-3 dark:border-zinc-800">
                <summary className="font-semibold cursor-pointer">{section.section}</summary>
                <ul className="mt-2 space-y-2">
                  {section.lessons.map((l) => (
                    <li key={l.id} className="flex items-center justify-between rounded-md border p-2 dark:border-zinc-800">
                      <div className="flex items-center gap-2"><Play className="w-4 h-4" /> {l.title}</div>
                      <div className="text-xs text-zinc-500">{l.duration}</div>
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
              <Button onClick={() => onEnroll(course)}>Buy Course</Button>
              <Button variant="outline" onClick={() => onSave(course)}>{saved ? "Saved" : "Save"}</Button>
            </div>
          </Card>

          <Card className="p-4">
            <div className="mb-2 text-sm font-semibold">Instructor</div>
            <div className="flex items-center gap-3">
              <img src="https://i.pravatar.cc/48?img=32" className="h-12 w-12 rounded-full" alt="inst" />
              <div>
                <div className="font-semibold">{course.instructor}</div>
                <div className="text-xs text-zinc-500">Top rated instructor • {Math.round(course.rating)}★</div>
                <div className="mt-2 text-xs text-zinc-500">Bio: Experienced mentor and product designer.</div>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </main>
  );
}

/* ---------------------------
   CHAT PAGE
   --------------------------- */

function ChatPage() {
  const [messages, setMessages] = useState([
    { id: uid("m"), from: "mentor", text: "Hii Palak... how may I help you?", time: Date.now() - 60000 },
    { id: uid("m"), from: "me", text: "I just finished the Python basics course. What's next?", time: Date.now() - 50000 },
  ]);
  const [text, setText] = useState("");
  const ref = useRef();

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages]);

  function send() {
    if (!text.trim()) return;
    const id = uid("m");
    setMessages((m) => [...m, { id, from: "me", text, time: Date.now() }]);
    setText("");
    // mock reply
    setTimeout(() => {
      setMessages((m) => [...m, { id: uid("m"), from: "mentor", text: "Great! Try the intermediate Python project course.", time: Date.now() }]);
    }, 800);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 md:px-6 flex flex-col h-[70vh]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="font-semibold">Mentor Support</div>
          <div className="text-xs text-emerald-600">Connected</div>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <img src="https://i.pravatar.cc/40?img=65" className="h-8 w-8 rounded-full" alt="mentor" />
        </div>
      </div>

      <div ref={ref} className="flex-1 overflow-y-auto space-y-3 p-3 rounded-xl border dark:border-zinc-800">
        {messages.map((m) => (
          <div key={m.id} className={`max-w-[80%] p-3 rounded-2xl ${m.from === "me" ? "ml-auto bg-violet-600 text-white" : "bg-zinc-100 dark:bg-zinc-800"}`}>
            {m.text}
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" />
        <Button onClick={send}>Send</Button>
      </div>
    </main>
  );
}

/* ---------------------------
   AUTH PAGES (Login / Signup / OTP mock)
   --------------------------- */

function AuthPage({ mode = "login", onDone }) {
  const [stage, setStage] = useState(mode); // 'login' or 'signup' or 'otp'
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [showPassword, setShowPassword] = useState(false);

  function sendOtp() {
    setStage("otp");
  }
  function verifyOtp() {
    // simple mock
    onDone && onDone();
    setStage("login");
  }

  if (stage === "otp") {
    return (
      <main className="mx-auto max-w-md px-4 py-8">
        <div className="rounded-2xl border p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-2xl font-bold">Verify OTP</h2>
          <p className="text-sm text-zinc-500 mt-2">Enter the 4-digit code sent to {phone || "your phone"}</p>
          <div className="grid grid-cols-4 gap-3 mt-4">
            {otp.map((v, i) => (
              <input key={i} value={v} onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 1);
                setOtp((o) => { const n = [...o]; n[i] = val; return n; });
              }} className="h-12 text-center rounded-xl bg-white dark:bg-zinc-800" />
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={verifyOtp}>Verify & Continue</Button>
            <button className="text-sm text-zinc-500 self-center">Resend</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <div className="rounded-2xl border p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-2xl font-bold">{stage === "login" ? "Welcome Back" : "Create an Account"}</h2>
        <p className="text-sm text-zinc-500 mt-2">{stage === "login" ? "Login to continue learning" : "Sign up to unlock personalized learning"}</p>

        <div className="mt-4 grid gap-3">
          {stage === "signup" && <Input placeholder="Full name" />}
          <Input placeholder="Email or phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <div className="relative">
            <Input type={showPassword ? "text" : "password"} placeholder="Password" />
            <button onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          <Button onClick={() => (stage === "login" ? onDone && onDone() : sendOtp())}>{stage === "login" ? "Login" : "Send OTP"}</Button>

          <div className="text-center text-sm text-zinc-500">Or continue with</div>
          <div className="grid grid-cols-2 gap-3">
            <button className="rounded-xl border p-2">Continue with Google</button>
            <button className="rounded-xl border p-2">Continue with Apple</button>
          </div>

          <div className="text-center text-sm text-zinc-500">
            {stage === "login" ? (
              <span>New here? <button className="underline" onClick={() => setStage("signup")}>Create account</button></span>
            ) : (
              <span>Already have an account? <button className="underline" onClick={() => setStage("login")}>Login</button></span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ---------------------------
   MY COURSES / DOWNLOADS / SETTINGS
   --------------------------- */

function MyCoursesPage({ enrolled }) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <h2 className="text-2xl font-extrabold mb-4">My Courses</h2>
      {enrolled.length === 0 ? (
        <div className="rounded-2xl border p-6 text-center">
          <div className="text-lg font-semibold">No courses yet</div>
          <p className="text-sm text-zinc-500">Enroll in a course to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {enrolled.map((c) => (
            <Card key={c.id} className="p-4 flex items-center gap-4">
              <img src={c.thumbnail} className="h-20 w-36 rounded-md object-cover" alt={c.title} />
              <div className="flex-1">
                <div className="font-semibold">{c.title}</div>
                <div className="text-xs text-zinc-500">by {c.instructor}</div>
              </div>
              <Button>Continue</Button>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}

function DownloadsPage() {
  const downloads = [
    { id: 1, name: "Lesson 1 - Slides.pdf", size: "2.3MB" },
    { id: 2, name: "Project Starter.zip", size: "12.5MB" },
  ];
  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <h2 className="text-2xl font-extrabold mb-4">Downloads</h2>
      <div className="space-y-3">
        {downloads.map((d) => (
          <div key={d.id} className="flex items-center justify-between border rounded-lg p-3">
            <div>
              <div className="font-medium">{d.name}</div>
              <div className="text-xs text-zinc-500">{d.size}</div>
            </div>
            <button className="rounded-md border px-3 py-1">Download</button>
          </div>
        ))}
      </div>
    </main>
  );
}

function SettingsPage({ dark, setDark }) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <h2 className="text-2xl font-extrabold mb-4">Settings</h2>
      <div className="grid gap-4">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <div className="font-medium">Theme</div>
            <div className="text-xs text-zinc-500">Switch between light and dark mode</div>
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} />
              <span className="text-sm">{dark ? "Dark" : "Light"}</span>
            </label>
          </div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="font-medium">Account</div>
          <div className="text-xs text-zinc-500">Manage your personal info</div>
        </div>
      </div>
    </main>
  );
}

/* ---------------------------
   APP ROOT / ROUTES / STATE
   --------------------------- */

export default function App() {
  const [dark, setDark] = useDarkMode();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [courses, setCourses] = useLocalState("courses", initialCourses);
  const [saved, setSaved] = useLocalState("saved", []);
  const [enrolled, setEnrolled] = useLocalState("enrolled", []);
  const navigate = useNavigateWrapper();

  // small helper to simulate navigate in non-router parts
  function go(name, payload) {
    // we'll use history navigation by building paths
    switch (name) {
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
      case "my-courses":
        navigate("/my-courses");
        break;
      case "downloads":
        navigate("/downloads");
        break;
      case "settings":
        navigate("/settings");
        break;
      default:
        if (name === "course" && payload) navigate(`/course/${payload.id}`);
        break;
    }
    setDrawerOpen(false);
  }

  function toggleSave(course) {
    setSaved((s) => {
      if (s.includes(course.id)) return s.filter((id) => id !== course.id);
      return [...s, course.id];
    });
  }

  function enroll(course) {
    setEnrolled((e) => {
      if (e.find((c) => c.id === course.id)) return e;
      return [...e, course];
    });
    // navigate to my courses
    navigate("/my-courses");
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <TopBar onMenuToggle={() => setDrawerOpen((s) => !s)} onToggleTheme={() => setDark((d) => !d)} dark={dark} go={go} />
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} go={go} />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage courses={courses} onOpenCourse={(c) => navigate(`/course/${c.id}`, { state: { course: c } })} saved={saved} onToggleSave={toggleSave} />} />
          <Route path="/courses" element={<HomePage courses={courses} onOpenCourse={(c) => navigate(`/course/${c.id}`, { state: { course: c } })} saved={saved} onToggleSave={toggleSave} />} />
          <Route path="/course/:id" element={<CourseDetailRoute courses={courses} onBack={() => navigate(-1)} onEnroll={enroll} onSave={toggleSave} saved={saved} />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/auth" element={<AuthPage onDone={() => navigate("/")} />} />
          <Route path="/my-courses" element={<MyCoursesPage enrolled={enrolled} />} />
          <Route path="/downloads" element={<DownloadsPage />} />
          <Route path="/settings" element={<SettingsPage dark={dark} setDark={setDark} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}

/* ---------------------------
   ROUTE HELPERS + SMALL PAGES
   --------------------------- */

function CourseDetailRoute({ courses, onBack, onEnroll, onSave, saved }) {
  const params = useParams();
  const id = parseInt(params.id, 10);
  const course = useMemo(() => courses.find((c) => c.id === id), [courses, id]);
  return <CourseDetailPage course={course} onBack={onBack} onEnroll={onEnroll} onSave={onSave} saved={saved.includes(id)} />;
}

function NotFound() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 text-center">
      <h2 className="text-3xl font-bold">Page Not Found</h2>
      <p className="mt-2 text-sm text-zinc-500">The page you're looking for doesn't exist.</p>
      <Link to="/" className="mt-4 inline-block"><Button>Go home</Button></Link>
    </main>
  );
}


/* ---------------------------
   Mobile Bottom Nav
   --------------------------- */

function MobileBottomNav() {
  return (
    <nav className="fixed bottom-4 left-1/2 z-40 w-full max-w-md -translate-x-1/2 rounded-3xl bg-white dark:bg-zinc-900/95 border p-2 md:hidden">
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

/* ---------------------------
   NAVIGATE WRAPPER
   --------------------------- */

/**
 * In a top-level component we usually have access to react-router's navigate.
 * This small hook wraps useNavigate but also exposes a simple function for
 * non-hook contexts in this single-file setup.
 */
function useNavigateWrapper() {
  // create navigate via hook and return a function that can be called
  const navigate = useNavigate();
  return (to, options) => {
    // if to is number -> go back
    if (typeof to === "number") {
      navigate(to);
      return;
    }
    // if to is a path string
    if (typeof to === "string") {
      navigate(to, options);
      return;
    }
    // otherwise do nothing
  };
}

/* ---------------------------
   END FILE
   --------------------------- */

