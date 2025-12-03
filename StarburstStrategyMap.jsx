import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithCustomToken, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  serverTimestamp,
  query, 
  orderBy 
} from 'firebase/firestore';
import { 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  MessageCircle, 
  MapPin, 
  AlertTriangle, 
  Lightbulb, 
  Target, 
  Rocket, 
  Edit3, 
  Trash2, 
  Plus, 
  Save, 
  X,
  RefreshCw,
  Check
} from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'starburst-partners';

// --- Initial Data (Seed) ---
const initialPartnersData = [
    { category: "ביטחון (Tier-1)", subCategory: "חדשנות עמוקה", company: "אלביט מערכות", entryMechanism: "Incubit Ventures", valueProp: "טכנולוגיות Deep Tech אזרחיות.", acceleratorStrategy: "Deal Flow Source: צייד מיזמי Pre-seed.", insight: "מתאים ל-Early Stage. מימון ממשלתי.", phone: "077-2940000", email: "corp.int.market@elbitsystems.com", location: "חיפה", domain: "elbitsystems.com" },
    { category: "ביטחון (Tier-1)", subCategory: "פיתוח משותף", company: "רפאל", entryMechanism: "Co-Development", valueProp: "יכולות תוכנה/AI משלימות.", acceleratorStrategy: "Challenge Management: ניהול אתגר חדשנות.", insight: "מחפשים Battle Proven.", phone: "073-3354714", email: "intl-mkt@rafael.co.il", location: "חיפה", domain: "rafael.co.il" },
    { category: "ביטחון וחלל", subCategory: "חלל ולוויינות", company: "תעשייה אווירית (IAI)", entryMechanism: "IAI Catalyst", valueProp: "חדשנות משבשת בחלל ולוויינים.", acceleratorStrategy: "Innovation Lab Partner: מעבדות ו-POC.", insight: "לבדוק סוגיות בעלות על ה-IP.", phone: "03-9353111", email: "catalyst@iai.co.il", location: "לוד", domain: "iai.co.il" },
    { category: "תעשייה וייצור", subCategory: "מיגון וחומרים", company: "פלסן סאסא", entryMechanism: "Open Innovation", valueProp: "חומרים מרוכבים קלים וחזקים.", acceleratorStrategy: "Design Partner: שותף תעשייתי.", insight: "מחפשים בשלות לייצור סדרתי.", phone: "04-6809000", email: "info@plasan.com", location: "סאסא", domain: "plasan.com" },
    { category: "רכב ותחבורה", subCategory: "אוטונומיה", company: "GM ישראל", entryMechanism: "מרכז מו\"פ", valueProp: "הטמעת חיישנים צבאיים (LiDAR).", acceleratorStrategy: "Tech Scouting: הסבה לרכב.", insight: "דגש על הפרדת IP.", phone: "09-9720600", email: "", location: "הרצליה", domain: "gm.com" },
    { category: "תשתיות ומים", subCategory: "ניהול מים", company: "מקורות", entryMechanism: "WaTech", valueProp: "ניטור עילי של תשתיות מים.", acceleratorStrategy: "Validation Partner: אתרי Beta Site.", insight: "קריטי לתיקוף גלובלי.", phone: "03-6230555", email: "waTech@mekorot.co.il", location: "תל אביב", domain: "mekorot.co.il" },
];

// --- Styles & Theme ---
// Innovet Theme Colors
const THEME = {
    black: '#191B1D',
    dark: '#17191A',
    yellow: '#FFC700',
    blue: '#1F63C7',
    bg: '#F1F1F1',
    gray: '#E3E3E3',
    white: '#FFFFFF'
};

const App = () => {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("הכל");
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [isAddingNew, setIsAddingNew] = useState(false);

    // --- Auth & Data Loading ---
    useEffect(() => {
        const initAuth = async () => {
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                await signInWithCustomToken(auth, __initial_auth_token);
            } else {
                await signInAnonymously(auth);
            }
        };
        initAuth();
        return onAuthStateChanged(auth, (u) => setUser(u));
    }, []);

    useEffect(() => {
        if (!user) return;
        const collectionName = 'partners';
        const partnersRef = collection(db, 'artifacts', appId, 'public', 'data', collectionName);
        const q = query(partnersRef, orderBy('company'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                seedData(partnersRef);
            } else {
                const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPartners(docs);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [user]);

    const seedData = async (ref) => {
        const promises = initialPartnersData.map(p => setDoc(doc(ref), { ...p, contacted: false, note: "", createdAt: serverTimestamp() }));
        await Promise.all(promises);
        setLoading(false);
    };

    // --- Actions ---
    const toggleContact = async (partner) => {
        if (!user) return;
        const partnerRef = doc(db, 'artifacts', appId, 'public', 'data', 'partners', partner.id);
        await updateDoc(partnerRef, { contacted: !partner.contacted });
    };

    const handleSave = async () => {
        if (!user) return;
        const collectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'partners');
        
        const dataToSave = {
            ...editForm,
            // Clean up empty strings to keep DB clean if needed, or keep them
        };

        if (isAddingNew) {
            await setDoc(doc(collectionRef), { ...dataToSave, contacted: false, note: "", createdAt: serverTimestamp() });
        } else {
            const partnerRef = doc(db, 'artifacts', appId, 'public', 'data', 'partners', editingId);
            await updateDoc(partnerRef, dataToSave);
        }
        setEditingId(null);
        setEditForm({});
        setIsAddingNew(false);
    };

    const handleDelete = async (id) => {
        if(!confirm("האם למחוק שותף זה?")) return;
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'partners', id));
        setEditingId(null);
    };

    const saveNote = async (id, text) => {
        const partnerRef = doc(db, 'artifacts', appId, 'public', 'data', 'partners', id);
        await updateDoc(partnerRef, { note: text });
    };

    // --- Helpers ---
    const getLogoUrl = (domain, company) => {
        if (domain) return `https://logo.clearbit.com/${domain}`;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(company)}&background=random&color=fff`;
    };

    const formatForWhatsapp = (phone) => {
        if (!phone) return "";
        const clean = phone.replace(/\D/g, '');
        return clean.startsWith('0') ? `972${clean.substring(1)}` : `972${clean}`;
    };

    // --- Filtering ---
    const categories = useMemo(() => ["הכל", ...new Set(partners.map(p => p.category).filter(Boolean))], [partners]);
    const filteredPartners = useMemo(() => {
        return partners.filter(p => {
            const term = searchTerm.toLowerCase();
            const matchSearch = (p.company||"").toLowerCase().includes(term) || (p.valueProp||"").toLowerCase().includes(term);
            const matchCat = selectedCategory === "הכל" || p.category === selectedCategory;
            return matchSearch && matchCat;
        });
    }, [partners, searchTerm, selectedCategory]);

    // --- Render Helpers ---
    const ActionButton = ({ href, icon: Icon, label, colorClass }) => {
        if (!href) return null;
        return (
            <a 
                href={href} 
                target={href.startsWith('http') ? "_blank" : undefined}
                className={`flex items-center justify-center gap-2 py-2 px-4 rounded font-bold text-sm transition-all duration-200 flex-1 shadow-sm ${colorClass}`}
            >
                <Icon size={16} />
                <span>{label}</span>
            </a>
        );
    };

    return (
        <div className="min-h-screen font-sans" style={{ backgroundColor: THEME.bg, fontFamily: "'Heebo', sans-serif" }} dir="rtl">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;900&display=swap');
                body { font-family: 'Heebo', sans-serif; }
                /* Custom Scrollbar */
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: #F1F1F1; }
                ::-webkit-scrollbar-thumb { background: #C1C1C1; border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: #A8A8A8; }
            `}</style>

            {/* HERO SECTION */}
            <header className="text-white relative overflow-hidden" style={{ backgroundColor: THEME.dark }}>
                 {/* Background Graphic Effect */}
                <div className="absolute right-[-10%] top-[-50%] w-[50%] h-[200%] opacity-5 pointer-events-none" 
                     style={{ background: `radial-gradient(circle, ${THEME.yellow} 0%, transparent 70%)` }}></div>

                <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-xs font-bold px-3 py-1 rounded uppercase tracking-widest text-black" style={{ backgroundColor: THEME.yellow }}>
                                    STARBURST PARTNERS
                                </span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black uppercase leading-[0.85] tracking-tighter mb-4">
                                מאגר<br/>השותפים
                            </h1>
                            <p className="text-xl text-gray-400 font-light max-w-lg">
                                ניהול קשרים אסטרטגיים, מעקב סטטוס פנייה ומידע עסקי בזמן אמת.
                            </p>
                        </div>
                        
                        <button 
                            onClick={() => {
                                setEditingId('new');
                                setEditForm({ company: "", category: "", subCategory: "", phone: "", email: "", location: "", valueProp: "" });
                                setIsAddingNew(true);
                            }}
                            className="group flex items-center gap-3 px-8 py-4 text-lg font-bold text-black transition-all hover:scale-105 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
                            style={{ backgroundColor: THEME.yellow }}
                        >
                            <Plus size={24} strokeWidth={3} />
                            הוסף שותף חדש
                        </button>
                    </div>
                </div>
            </header>

            {/* FILTERS BAR */}
            <div className="sticky top-0 z-30 shadow-md backdrop-blur-md bg-white/90 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-4 w-full md:w-auto flex-1">
                        <div className="relative flex-1 max-w-md">
                            <input 
                                type="text" 
                                placeholder="חיפוש חברה, טכנולוגיה או אסטרטגיה..." 
                                className="w-full pl-4 pr-10 py-3 bg-gray-100 border border-transparent focus:bg-white focus:border-blue-600 outline-none transition-all rounded-none font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search size={18} className="absolute top-3.5 right-3 text-gray-500" />
                        </div>
                        
                        <div className="relative w-48">
                            <select 
                                className="w-full pl-4 pr-10 py-3 bg-gray-100 border border-transparent focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none rounded-none font-bold text-sm"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <Filter size={16} className="absolute top-4 right-3 text-gray-500 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-bold text-gray-500 bg-gray-100 px-4 py-2 rounded-none">
                        {loading ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} className="text-green-500" />}
                        <span>{filteredPartners.length} שותפים נמצאו</span>
                    </div>
                </div>
            </div>

            {/* GRID CONTENT */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4" style={{ borderColor: THEME.blue }}></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPartners.map((partner) => (
                            <div 
                                key={partner.id} 
                                className="bg-white border-2 border-transparent hover:border-blue-600 transition-all duration-300 group flex flex-col relative shadow-sm hover:shadow-xl"
                                style={{ borderColor: partner.contacted ? '#48BB78' : 'transparent' }} // Green border if contacted
                            >
                                {/* Contact Status Toggle (Top Right Ribbon) */}
                                <button 
                                    onClick={() => toggleContact(partner)}
                                    className={`absolute top-0 right-0 px-3 py-1 text-xs font-black uppercase tracking-wider z-10 transition-colors ${partner.contacted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                                >
                                    {partner.contacted ? 'נוצר קשר ✓' : 'לפני פנייה'}
                                </button>

                                {/* Edit Button (Visible on Hover) */}
                                <button 
                                    onClick={() => { setEditingId(partner.id); setEditForm(partner); setIsAddingNew(false); }}
                                    className="absolute top-0 left-0 p-2 text-gray-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                >
                                    <Edit3 size={18} />
                                </button>

                                <div className="p-6 flex-grow">
                                    {/* Header: Logo + Title */}
                                    <div className="flex items-start gap-4 mb-6 mt-4">
                                        <div className="w-16 h-16 bg-gray-50 border border-gray-100 flex items-center justify-center p-2">
                                            <img 
                                                src={getLogoUrl(partner.domain, partner.company)} 
                                                alt={partner.company}
                                                className="w-full h-full object-contain mix-blend-multiply"
                                                onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${partner.company}&background=random`}
                                            />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-[#191B1D] leading-none mb-1">{partner.company}</h2>
                                            <div className="flex items-center gap-1 text-sm text-gray-500 font-medium">
                                                <MapPin size={12} /> {partner.location || "ישראל"}
                                            </div>
                                            <div className="mt-2 inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wide border border-blue-100">
                                                {partner.category}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info Blocks */}
                                    <div className="space-y-4">
                                        {partner.valueProp && (
                                            <div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-1">
                                                    <Lightbulb size={12} /> ערך אסטרטגי
                                                </div>
                                                <p className="text-sm font-medium text-gray-800 leading-relaxed">
                                                    {partner.valueProp}
                                                </p>
                                            </div>
                                        )}

                                        {partner.acceleratorStrategy && (
                                            <div className="p-3 bg-yellow-50 border-r-4 border-yellow-400">
                                                <div className="flex items-center gap-2 text-xs font-bold text-yellow-700 uppercase mb-1">
                                                    <Rocket size={12} /> אסטרטגיית שת"פ
                                                </div>
                                                <p className="text-sm font-bold text-gray-900 leading-relaxed">
                                                    {partner.acceleratorStrategy}
                                                </p>
                                            </div>
                                        )}

                                        {partner.entryMechanism && (
                                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                                <span className="text-xs text-gray-400 font-bold uppercase">מנגנון כניסה</span>
                                                <span className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-1 rounded">
                                                    {partner.entryMechanism}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Notes Area */}
                                    <div className="mt-6">
                                        <textarea 
                                            className="w-full text-sm bg-[#F9F9F9] border-b-2 border-gray-200 focus:border-yellow-400 outline-none p-2 resize-none min-h-[60px] transition-colors placeholder-gray-400"
                                            placeholder="הוסף הערה אישית..."
                                            defaultValue={partner.note}
                                            onBlur={(e) => saveNote(partner.id, e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Action Footer */}
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 grid grid-cols-3 gap-3">
                                    <ActionButton 
                                        href={partner.phone ? `tel:${partner.phone}` : null} 
                                        icon={Phone} 
                                        label="חיוג" 
                                        colorClass="bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300" 
                                    />
                                    <ActionButton 
                                        href={partner.email ? `mailto:${partner.email}` : null} 
                                        icon={Mail} 
                                        label="מייל" 
                                        colorClass="bg-blue-50 text-blue-700 hover:bg-blue-100" 
                                    />
                                    <ActionButton 
                                        href={partner.phone ? `https://wa.me/${formatForWhatsapp(partner.phone)}` : null} 
                                        icon={MessageCircle} 
                                        label="" 
                                        colorClass="bg-green-50 text-green-600 hover:bg-green-100" 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL */}
            {editingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-2xl font-black text-[#191B1D]">
                                {isAddingNew ? "הוספת שותף חדש" : "עריכת פרטי שותף"}
                            </h2>
                            <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">שם החברה</label>
                                <input className="w-full p-3 bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none font-bold" 
                                    value={editForm.company || ""} onChange={e => setEditForm({...editForm, company: e.target.value})} />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">דומיין (לוגו)</label>
                                <input className="w-full p-3 bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none" 
                                    value={editForm.domain || ""} onChange={e => setEditForm({...editForm, domain: e.target.value})} placeholder="example.com" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">ערך אסטרטגי</label>
                                <textarea className="w-full p-3 bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none" rows="2" 
                                    value={editForm.valueProp || ""} onChange={e => setEditForm({...editForm, valueProp: e.target.value})} />
                            </div>
                             <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">אסטרטגיית שת"פ (מה מציעים?)</label>
                                <textarea className="w-full p-3 bg-yellow-50 border border-yellow-200 focus:border-yellow-400 outline-none font-medium" rows="2" 
                                    value={editForm.acceleratorStrategy || ""} onChange={e => setEditForm({...editForm, acceleratorStrategy: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">טלפון</label>
                                <input className="w-full p-3 bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none" 
                                    value={editForm.phone || ""} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">מייל</label>
                                <input className="w-full p-3 bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none" 
                                    value={editForm.email || ""} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                            </div>
                             <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">קטגוריה</label>
                                <input className="w-full p-3 bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none" 
                                    value={editForm.category || ""} onChange={e => setEditForm({...editForm, category: e.target.value})} />
                            </div>
                             <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">מנגנון כניסה</label>
                                <input className="w-full p-3 bg-gray-50 border border-gray-200 focus:border-blue-500 outline-none" 
                                    value={editForm.entryMechanism || ""} onChange={e => setEditForm({...editForm, entryMechanism: e.target.value})} />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                            {!isAddingNew ? (
                                <button onClick={() => handleDelete(editingId)} className="text-red-500 hover:text-red-700 text-sm font-bold flex items-center gap-2 px-4 py-2">
                                    <Trash2 size={16} /> מחק
                                </button>
                            ) : <div></div>}
                            
                            <div className="flex gap-4">
                                <button onClick={() => setEditingId(null)} className="px-6 py-3 font-bold text-gray-500 hover:bg-gray-200 transition-colors">ביטול</button>
                                <button onClick={handleSave} className="px-8 py-3 font-black text-black bg-[#FFC700] hover:bg-[#E5B300] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] flex items-center gap-2">
                                    <Save size={18} /> שמור שינויים
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
