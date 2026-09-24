import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  Box,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  CloudSun,
  FileCheck2,
  Filter,
  Leaf,
  MapPinned,
  Menu,
  PackageCheck,
  Plus,
  Route,
  Search,
  ShieldCheck,
  ShoppingBasket,
  Sprout,
  Store,
  Tractor,
  TrendingUp,
  Truck,
  Users,
  WalletCards,
  X,
} from "lucide-react";

type Role = "farmer" | "fpo" | "buyer" | "consumer" | "admin";
type View = "overview" | "catalogue" | "orders" | "payouts" | "operations" | "forecast" | "trace";
type LotStatus = "Available" | "Reserved" | "Dispatched" | "Delivered";

type Lot = {
  id: string;
  commodity: string;
  variety: string;
  grade: string;
  quantity: number;
  available: number;
  unit: string;
  price: number;
  farmerShare: number;
  logistics: number;
  platform: number;
  origin: string;
  fpo: string;
  harvest: string;
  status: LotStatus;
  contributors: number;
  freshness: string;
  accent: string;
};

type Order = {
  id: string;
  buyer: string;
  buyerType: "consumer" | "bulk";
  lotId: string;
  commodity: string;
  quantity: number;
  amount: number;
  status: string;
  payment: string;
  date: string;
};

type NavItem = { id: View; label: string; icon: typeof Store };

const roleMeta: Record<Role, { label: string; short: string; icon: typeof Store; color: string; description: string }> = {
  farmer: { label: "Farmer", short: "Farmer view", icon: Sprout, color: "emerald", description: "See your produce, lot status, and net realization." },
  fpo: { label: "FPO Operator", short: "FPO operations", icon: Store, color: "blue", description: "Aggregate supply, verify lots, and coordinate fulfilment." },
  buyer: { label: "Bulk Buyer", short: "Buyer view", icon: ShoppingBasket, color: "violet", description: "Source verified lots with predictable delivery windows." },
  consumer: { label: "Consumer", short: "Consumer view", icon: Leaf, color: "amber", description: "Buy traceable produce with a price you can understand." },
  admin: { label: "DoCA Monitor", short: "Admin oversight", icon: ShieldCheck, color: "rose", description: "Monitor price outcomes, service levels, and trust signals." },
};

const roleOrder: Role[] = ["farmer", "fpo", "buyer", "consumer", "admin"];

const seedLots: Lot[] = [
  {
    id: "LOT-2026-0091", commodity: "Tomato", variety: "Desi Lal", grade: "Grade A", quantity: 1400, available: 920, unit: "kg", price: 28,
    farmerShare: 24.64, logistics: 2.24, platform: 1.12, origin: "Dindori, Nashik", fpo: "Sahyadri Kisan Producer Co-op", harvest: "Today", status: "Available", contributors: 2, freshness: "Picked today", accent: "from-emerald-50 to-lime-50",
  },
  {
    id: "LOT-2026-0092", commodity: "Onion", variety: "Nashik Red", grade: "Grade A", quantity: 1500, available: 1500, unit: "kg", price: 32,
    farmerShare: 28.16, logistics: 2.56, platform: 1.28, origin: "Niphad, Nashik", fpo: "Sahyadri Kisan Producer Co-op", harvest: "Tomorrow", status: "Available", contributors: 3, freshness: "Harvested yesterday", accent: "from-amber-50 to-orange-50",
  },
  {
    id: "LOT-2026-0093", commodity: "Pomegranate", variety: "Bhagwa Export", grade: "Grade A", quantity: 500, available: 180, unit: "kg", price: 96,
    farmerShare: 84.48, logistics: 7.68, platform: 3.84, origin: "Chandwad, Nashik", fpo: "Sahyadri Kisan Producer Co-op", harvest: "2 days ago", status: "Reserved", contributors: 2, freshness: "Cold-stored", accent: "from-rose-50 to-pink-50",
  },
  {
    id: "LOT-2026-0094", commodity: "Green Chilli", variety: "Teja", grade: "Grade B", quantity: 320, available: 320, unit: "kg", price: 42,
    farmerShare: 36.96, logistics: 3.36, platform: 1.68, origin: "Sinnar, Nashik", fpo: "Sahyadri Kisan Producer Co-op", harvest: "Today", status: "Available", contributors: 1, freshness: "Picked today", accent: "from-sky-50 to-cyan-50",
  },
];

const seedOrders: Order[] = [
  { id: "ORD-24091", buyer: "Ananya Sharma", buyerType: "consumer", lotId: "LOT-2026-0091", commodity: "Tomato", quantity: 4, amount: 112, status: "Delivered", payment: "Settled", date: "24 Sep 2026" },
  { id: "ORD-24087", buyer: "FreshBasket Retail", buyerType: "bulk", lotId: "LOT-2026-0092", commodity: "Onion", quantity: 300, amount: 9600, status: "Out for delivery", payment: "Held", date: "24 Sep 2026" },
  { id: "ORD-24080", buyer: "GreenMart Kitchens", buyerType: "bulk", lotId: "LOT-2026-0093", commodity: "Pomegranate", quantity: 120, amount: 11520, status: "Disputed", payment: "Captured", date: "23 Sep 2026" },
];

const initialListings = [
  { crop: "Tomato", variety: "Desi Lal", quantity: 800, grade: "Grade A", status: "In a Lot", farmer: "Ramesh Patil" },
  { crop: "Onion", variety: "Nashik Red", quantity: 600, grade: "Grade A", status: "Submitted", farmer: "Sunita Deshmukh" },
  { crop: "Pomegranate", variety: "Bhagwa Export", quantity: 500, grade: "Grade A", status: "In a Lot", farmer: "Tukaram Shinde" },
];

const navByRole: Record<Role, NavItem[]> = {
  farmer: [
    { id: "overview", label: "Home", icon: BarChart3 },
    { id: "payouts", label: "My payouts", icon: WalletCards },
    { id: "trace", label: "Lot trace", icon: MapPinned },
  ],
  fpo: [
    { id: "overview", label: "Operations", icon: BarChart3 },
    { id: "operations", label: "Lots & dispatch", icon: Truck },
    { id: "orders", label: "Orders", icon: PackageCheck },
    { id: "forecast", label: "Forecast", icon: TrendingUp },
  ],
  buyer: [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "catalogue", label: "Lot catalogue", icon: Store },
    { id: "orders", label: "My orders", icon: PackageCheck },
    { id: "trace", label: "Traceability", icon: MapPinned },
  ],
  consumer: [
    { id: "overview", label: "Browse", icon: Store },
    { id: "catalogue", label: "Fresh produce", icon: ShoppingBasket },
    { id: "orders", label: "My orders", icon: PackageCheck },
    { id: "trace", label: "Track & trace", icon: MapPinned },
  ],
  admin: [
    { id: "overview", label: "KPI dashboard", icon: BarChart3 },
    { id: "operations", label: "Lots & listings", icon: Box },
    { id: "orders", label: "Orders & payments", icon: CircleDollarSign },
    { id: "forecast", label: "Forecast", icon: TrendingUp },
  ],
};

function money(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);
}

function compactMoney(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function StatusChip({ value }: { value: string }) {
  const lower = value.toLowerCase();
  const tone = lower.includes("delivered") || lower.includes("settled") || lower.includes("available") || lower.includes("paid") || lower.includes("resolved")
    ? "bg-emerald-100 text-emerald-800"
    : lower.includes("dispute") || lower.includes("delayed") || lower.includes("held") || lower.includes("reserved")
      ? "bg-amber-100 text-amber-800"
      : lower.includes("out") || lower.includes("dispatch") || lower.includes("verified")
        ? "bg-blue-100 text-blue-800"
        : "bg-slate-100 text-slate-700";
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}><span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />{value}</span>;
}

function MetricCard({ icon: Icon, label, value, detail, tone = "emerald" }: { icon: typeof BarChart3; label: string; value: string; detail: string; tone?: string }) {
  const tones: Record<string, string> = { emerald: "bg-emerald-50 text-emerald-700", blue: "bg-blue-50 text-blue-700", amber: "bg-amber-50 text-amber-700", violet: "bg-violet-50 text-violet-700", rose: "bg-rose-50 text-rose-700" };
  return <div className="metric-card">
    <div className={`metric-icon ${tones[tone] || tones.emerald}`}><Icon size={18} /></div>
    <div><p className="metric-label">{label}</p><p className="metric-value">{value}</p><p className="metric-detail">{detail}</p></div>
  </div>;
}

function SectionHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="section-header"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>;
}

function PriceBreakup({ lot, quantity = 1 }: { lot: Lot; quantity?: number }) {
  return <div className="price-breakup">
    <div className="breakup-row"><span>Farmer share</span><strong>{money(lot.farmerShare * quantity)}</strong></div>
    <div className="breakup-row"><span>Aggregation + logistics</span><strong>{money(lot.logistics * quantity)}</strong></div>
    <div className="breakup-row"><span>Platform fee</span><strong>{money(lot.platform * quantity)}</strong></div>
    <div className="breakup-total"><span>Consumer price</span><strong>{money(lot.price * quantity)}</strong></div>
    <div className="breakup-bar"><span style={{ width: `${(lot.farmerShare / lot.price) * 100}%` }} /><span style={{ width: `${(lot.logistics / lot.price) * 100}%` }} /><span style={{ width: `${(lot.platform / lot.price) * 100}%` }} /></div>
    <p className="breakup-caption">{Math.round((lot.farmerShare / lot.price) * 100)}% reaches the farm before fulfilment.</p>
  </div>;
}

export default function Home() {
  const [activeRole, setActiveRole] = useState<Role>("consumer");
  const [activeView, setActiveView] = useState<View>("overview");
  const [lots, setLots] = useState<Lot[]>(seedLots);
  const [orders, setOrders] = useState<Order[]>(seedOrders);
  const [listings, setListings] = useState(initialListings);
  const [cart, setCart] = useState<{ lot: Lot; quantity: number }[]>([]);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [routeReady, setRouteReady] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const role = roleMeta[activeRole];
  const RoleIcon = role.icon;
  const navItems = navByRole[activeRole];
  const filteredLots = useMemo(() => lots.filter((lot) => `${lot.commodity} ${lot.variety} ${lot.grade} ${lot.origin}`.toLowerCase().includes(search.toLowerCase())), [lots, search]);
  const consumerOrders = orders.filter((item) => item.buyerType === "consumer");
  const bulkOrders = orders.filter((item) => item.buyerType === "bulk");
  const totalSales = orders.reduce((sum, item) => sum + item.amount, 0);

  const notify = (message: string) => setToast(message);
  const switchRole = (nextRole: Role) => {
    setActiveRole(nextRole);
    setActiveView("overview");
    setMobileNav(false);
    setShowRoleMenu(false);
    notify(`Switched to ${roleMeta[nextRole].label} demo`);
  };

  const addToCart = (lot: Lot) => {
    setCart((current) => {
      const existing = current.find((item) => item.lot.id === lot.id);
      if (existing) return current.map((item) => item.lot.id === lot.id ? { ...item, quantity: Math.min(item.quantity + 1, lot.available) } : item);
      return [...current, { lot, quantity: 1 }];
    });
    notify(`${lot.commodity} added to cart`);
  };

  const placeConsumerOrder = () => {
    if (!cart.length) return notify("Add produce to the cart first");
    const amount = cart.reduce((sum, item) => sum + item.quantity * item.lot.price, 0);
    const first = cart[0].lot;
    const order: Order = { id: `ORD-${24100 + orders.length}`, buyer: "Ananya Sharma", buyerType: "consumer", lotId: first.id, commodity: first.commodity, quantity: cart.reduce((sum, item) => sum + item.quantity, 0), amount, status: "Created", payment: "Authorized", date: "24 Sep 2026" };
    setOrders((current) => [order, ...current]);
    setLots((current) => current.map((lot) => {
      const item = cart.find((entry) => entry.lot.id === lot.id);
      return item ? { ...lot, available: lot.available - item.quantity, status: lot.available - item.quantity <= 0 ? "Reserved" : lot.status } : lot;
    }));
    setCart([]);
    setActiveView("orders");
    notify("Order created — simulated payment authorized");
  };

  const placeBulkOrder = (lot: Lot) => {
    const quantity = Math.min(100, lot.available);
    if (!quantity) return notify("This lot has no remaining inventory");
    const order: Order = { id: `PO-${24100 + orders.length}`, buyer: "FreshBasket Retail", buyerType: "bulk", lotId: lot.id, commodity: lot.commodity, quantity, amount: quantity * lot.price, status: "Created", payment: "Authorized", date: "24 Sep 2026" };
    setOrders((current) => [order, ...current]);
    setLots((current) => current.map((item) => item.id === lot.id ? { ...item, available: item.available - quantity, status: "Reserved" } : item));
    notify(`Purchase order submitted for ${quantity} kg of ${lot.commodity}`);
  };

  const verifyLot = (id: string) => {
    setLots((current) => current.map((lot) => lot.id === id ? { ...lot, status: "Available" } : lot));
    notify("Lot verified and published to both catalogues");
  };

  const runRoute = () => {
    setRouteReady(true);
    notify("Route optimized: 4 stops consolidated into one run");
  };

  const renderRoleSwitcher = () => <div className="role-switcher-wrap">
    <button className="role-switcher" onClick={() => setShowRoleMenu((value) => !value)}><RoleIcon size={16} /><span>{role.label}</span><ChevronDown size={15} /></button>
    {showRoleMenu && <div className="role-menu">{roleOrder.map((item) => { const Icon = roleMeta[item].icon; return <button key={item} onClick={() => switchRole(item)} className={item === activeRole ? "active" : ""}><Icon size={16} /><span>{roleMeta[item].label}</span>{item === activeRole && <Check size={15} />}</button>; })}</div>}
  </div>;

  const renderTopMetrics = () => <div className="metrics-grid">
    {activeRole === "farmer" && <><MetricCard icon={WalletCards} label="Net realization" value={money(24.64)} detail="per kg on your latest lot" /><MetricCard icon={Box} label="Supply listed" value="1,900 kg" detail="across 3 active listings" tone="blue" /><MetricCard icon={Clock3} label="Next settlement" value="Today" detail="after delivery confirmation" tone="amber" /></>}
    {activeRole === "fpo" && <><MetricCard icon={Box} label="Active lots" value="4" detail="3 verified · 1 awaiting review" tone="blue" /><MetricCard icon={Truck} label="Today’s fulfilment" value="92%" detail="on-time target 90%" /><MetricCard icon={CircleDollarSign} label="Farmer payouts" value={compactMoney(68400)} detail="ready for settlement" tone="amber" /></>}
    {activeRole === "buyer" && <><MetricCard icon={Store} label="Available supply" value="4.2 t" detail="across 4 verified lots" tone="blue" /><MetricCard icon={PackageCheck} label="Open orders" value="2" detail="one arriving today" /><MetricCard icon={TrendingUp} label="Price visibility" value="100%" detail="every fee itemized" tone="violet" /></>}
    {activeRole === "consumer" && <><MetricCard icon={Leaf} label="Farm share" value="88%" detail="of each listed price" /><MetricCard icon={Truck} label="Fresh arrivals" value="4 lots" detail="from Nashik today" tone="blue" /><MetricCard icon={ShieldCheck} label="Traceable" value="100%" detail="lot history attached" tone="amber" /></>}
    {activeRole === "admin" && <><MetricCard icon={CircleDollarSign} label="Farmer realization" value="₹24.64/kg" detail="+8.2% vs local baseline" /><MetricCard icon={Truck} label="On-time fulfilment" value="92%" detail="pilot target 90%" tone="blue" /><MetricCard icon={ShieldCheck} label="Dispute rate" value="3.1%" detail="down 1.4 pts this week" tone="rose" /></>}
  </div>;

  const renderCatalogue = (isConsumer = false) => <div className="space-y-5">
    <SectionHeader eyebrow={isConsumer ? "Fresh from Nashik" : "Verified inventory"} title={isConsumer ? "Produce you can trace" : "Source a verified lot"} description={isConsumer ? "Every item shows the farm share, fulfilment cost, and source lot before you buy." : "Filter by grade, quantity, and location. Each Lot is weighed, photographed, and linked to its origin."} action={<div className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search commodity or village" /><Filter size={15} /></div>} />
    <div className="catalogue-grid">{filteredLots.map((lot) => <article key={lot.id} className="lot-card">
      <div className={`lot-art bg-gradient-to-br ${lot.accent}`}><span className="lot-art-icon">{lot.commodity === "Pomegranate" ? "◉" : lot.commodity === "Onion" ? "◌" : lot.commodity === "Green Chilli" ? "⌁" : "●"}</span><span className="lot-art-tag">{lot.freshness}</span></div>
      <div className="lot-card-body"><div className="lot-card-title"><div><p className="card-kicker">{lot.id}</p><h3>{lot.commodity} <span>{lot.variety}</span></h3></div><StatusChip value={lot.status} /></div><div className="lot-facts"><span><BadgeCheck size={14} />{lot.grade}</span><span><Box size={14} />{lot.available.toLocaleString("en-IN")} / {lot.quantity.toLocaleString("en-IN")} kg</span><span><MapPinned size={14} />{lot.origin}</span></div><div className="lot-price"><div><span>From</span><strong>{money(lot.price)}<small>/kg</small></strong></div><button className="text-button" onClick={() => setSelectedLot(lot)}>See breakup <ArrowRight size={14} /></button></div><div className="lot-card-actions">{isConsumer ? <button className="button primary small" onClick={() => addToCart(lot)}><Plus size={15} /> Add to cart</button> : <button className="button primary small" onClick={() => placeBulkOrder(lot)}><FileCheck2 size={15} /> Request lot</button>}<button className="button ghost small" onClick={() => setActiveView("trace")}>Trace lot</button></div></div>
    </article>)}</div>
    {!filteredLots.length && <div className="empty-card"><Search size={24} /><h3>No matching lots</h3><p>Try clearing the search or choosing a broader commodity.</p></div>}
    {isConsumer && cart.length > 0 && <div className="cart-dock"><div><p className="card-kicker">Your cart</p><strong>{cart.reduce((sum, item) => sum + item.quantity, 0)} items · {money(cart.reduce((sum, item) => sum + item.quantity * item.lot.price, 0))}</strong></div><button className="button primary" onClick={placeConsumerOrder}>Checkout simulated order <ArrowRight size={16} /></button></div>}
  </div>;

  const renderOrders = () => <div className="space-y-5"><SectionHeader eyebrow="Transaction timeline" title={activeRole === "admin" ? "Orders & payments" : "Your orders"} description="Every order keeps its fulfilment and payment state visible." action={<button className="button ghost small"><Filter size={14} /> Filter</button>} /><div className="table-card"><div className="table-head"><span>Order</span><span>Buyer / item</span><span>Amount</span><span>Payment</span><span>Status</span></div>{orders.filter((item) => activeRole === "consumer" ? item.buyerType === "consumer" : activeRole === "buyer" ? item.buyerType === "bulk" : true).map((order) => <div className="table-row" key={order.id}><div><strong>{order.id}</strong><small>{order.date}</small></div><div><strong>{order.buyer}</strong><small>{order.quantity} kg {order.commodity}</small></div><div><strong>{money(order.amount)}</strong><small>{order.lotId}</small></div><div><StatusChip value={order.payment} /></div><div><StatusChip value={order.status} /></div></div>)}</div><div className="info-banner"><ShieldCheck size={18} /><div><strong>Settlement is simulated for the pilot.</strong><p>No live funds move. A payment can settle only after delivery or partial delivery is recorded.</p></div></div></div>;

  const renderFarmer = () => <div className="space-y-5"><SectionHeader eyebrow="My produce" title="What is moving through the FPO" description="Your FPO operator helps turn small harvests into buyer-ready lots." action={<button className="button primary small" onClick={() => notify("Listing form is ready for the next harvest") }><Plus size={15} /> New listing</button>} /><div className="split-grid"><div className="table-card"><div className="table-head"><span>Produce</span><span>Quantity</span><span>Grade</span><span>Status</span></div>{listings.map((item) => <div className="table-row" key={item.crop}><div><strong>{item.crop}</strong><small>{item.variety}</small></div><div><strong>{item.quantity} kg</strong><small>{item.farmer}</small></div><div><StatusChip value={item.grade} /></div><div><StatusChip value={item.status} /></div></div>)}</div><div className="payout-card"><div className="payout-card-head"><div><p className="card-kicker">Latest payout statement</p><h3>LOT-2026-0091</h3></div><WalletCards size={22} /></div><p className="muted">Tomato · 800 kg contribution · Grade A</p><div className="payout-big">{money(19712)}<span>net realization</span></div><div className="payout-lines"><div><span>Gross share</span><strong>{money(22176)}</strong></div><div><span>Aggregation + transport</span><strong>-{money(2016)}</strong></div><div><span>Platform fee</span><strong>-{money(448)}</strong></div></div><button className="button dark full" onClick={() => setActiveView("payouts")}>Open full ledger <ArrowRight size={15} /></button></div></div></div>;

  const renderPayouts = () => <div className="space-y-5"><SectionHeader eyebrow="Transparent settlement" title="Farmer payout ledger" description="The same lot economics are visible from gross sale to net farm realization." /><div className="ledger-hero"><div><p className="eyebrow light">Total settled to farmers · pilot</p><h2>{money(68400)}</h2><p>Across 6 completed lot allocations</p></div><div className="ledger-mark"><WalletCards size={30} /></div></div><div className="table-card"><div className="table-head"><span>Lot</span><span>Gross</span><span>Deductions</span><span>Net realization</span><span>Status</span></div>{seedLots.slice(0, 3).map((lot, index) => <div className="table-row" key={lot.id}><div><strong>{lot.id}</strong><small>{lot.commodity} · {index + 1} farmers</small></div><div><strong>{money(lot.price * lot.quantity)}</strong><small>at {money(lot.price)}/kg</small></div><div><strong>-{money((lot.logistics + lot.platform) * lot.quantity)}</strong><small>itemized costs</small></div><div><strong className="green-text">{money(lot.farmerShare * lot.quantity)}</strong><small>{Math.round(lot.farmerShare / lot.price * 100)}% of sale</small></div><div><StatusChip value={index === 2 ? "Pending" : "Settled"} /></div></div>)}</div></div>;

  const renderOperations = () => <div className="space-y-5"><SectionHeader eyebrow="FPO control room" title="Lots, grading & dispatch" description="One place to move supply from farmer listing to a buyer-ready, traceable dispatch." action={<button className="button primary small" onClick={() => notify("New lot flow opened") }><Plus size={15} /> Create lot</button>} /><div className="split-grid"><div className="operation-panel"><div className="panel-title"><div><p className="card-kicker">Verification queue</p><h3>Lot readiness</h3></div><StatusChip value="1 awaiting review" /></div><div className="queue-item"><div className="queue-icon amber"><Box size={17} /></div><div className="queue-copy"><strong>LOT-2026-0094 · Green Chilli</strong><span>320 kg · declared Grade B · 1 farmer</span></div><button className="button primary small" onClick={() => verifyLot("LOT-2026-0094")}><Check size={15} /> Verify</button></div><div className="queue-item"><div className="queue-icon green"><BadgeCheck size={17} /></div><div className="queue-copy"><strong>LOT-2026-0091 · Tomato</strong><span>1,400 kg · Grade A · 2 contributors</span></div><StatusChip value="Verified" /></div><div className="queue-item"><div className="queue-icon blue"><Truck size={17} /></div><div className="queue-copy"><strong>LOT-2026-0092 · Onion</strong><span>1,500 kg · pickup window 14:00</span></div><StatusChip value="Dispatched" /></div></div><div className="route-panel"><div className="panel-title"><div><p className="card-kicker">Today’s collection run</p><h3>Route recommendation</h3></div><Route size={21} /></div><div className="route-visual"><div className="route-line" /><span className="route-stop one">1</span><span className="route-stop two">2</span><span className="route-stop three">3</span><span className="route-stop four">4</span><div className="route-origin"><MapPinned size={14} /> Nashik packhouse</div></div><div className="route-stats"><div><strong>{routeReady ? "38.4 km" : "—"}</strong><span>total distance</span></div><div><strong>{routeReady ? "74 min" : "—"}</strong><span>estimated time</span></div><div><strong>4</strong><span>consolidated stops</span></div></div><button className="button dark full" onClick={runRoute}>{routeReady ? "Route optimized ✓" : "Run route optimization"} <ArrowRight size={15} /></button></div></div><div className="info-banner amber"><CloudSun size={18} /><div><strong>One difficult path is visible.</strong><p>Green Chilli is held for manual grade verification before it becomes available. Nothing is silently rejected.</p></div></div></div>;

  const renderForecast = () => <div className="space-y-5"><SectionHeader eyebrow="Decision support" title="Demand forecast" description="A transparent proof-of-concept model to help the FPO plan harvest and collection capacity." action={<span className="model-badge"><TrendingUp size={14} /> Proof of concept</span>} /><div className="forecast-grid"><div className="forecast-chart"><div className="chart-head"><div><p className="card-kicker">Tomato demand · next 7 days</p><h3>Demand is trending up</h3></div><span className="chart-value">+12.4%</span></div><div className="chart-wrap"><div className="chart-grid-lines"><span /><span /><span /><span /></div><svg viewBox="0 0 640 220" preserveAspectRatio="none" role="img" aria-label="Tomato demand forecast chart"><path d="M0 172 C55 160 90 174 135 146 S220 140 260 126 S340 142 382 106 S470 108 510 88 S585 80 640 48" fill="none" stroke="#0f8a5f" strokeWidth="4" strokeLinecap="round" /><path d="M0 182 C55 170 90 184 135 156 S220 150 260 136 S340 152 382 116 S470 118 510 98 S585 90 640 58 L640 220 L0 220Z" fill="url(#forecastFill)" opacity=".75" /><defs><linearGradient id="forecastFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#73d2a7" stopOpacity=".55" /><stop offset="1" stopColor="#73d2a7" stopOpacity="0" /></linearGradient></defs></svg><div className="chart-axis"><span>Today</span><span>+2 days</span><span>+4 days</span><span>+7 days</span></div></div><div className="confidence-note"><ShieldCheck size={15} /> Confidence range: 420–560 kg · based on 30 days of synthetic pilot data</div></div><div className="forecast-side"><div className="mini-stat"><span>Expected volume</span><strong>490 kg</strong><small>per collection day</small></div><div className="mini-stat"><span>Model version</span><strong>v0.1</strong><small>linear regression baseline</small></div><div className="mini-stat"><span>Operator action</span><strong>Plan 2 runs</strong><small>route capacity available</small></div></div></div><div className="info-banner"><ShieldCheck size={18} /><div><strong>Interpret responsibly.</strong><p>This forecast is a hackathon proof of concept, not a production prediction. The FPO operator remains the decision-maker.</p></div></div></div>;

  const renderTrace = () => { const lot = selectedLot || lots[0]; return <div className="space-y-5"><SectionHeader eyebrow="Source to shelf" title="Lot traceability" description="A complete history helps buyers trust the quality and helps farmers see where value was created." action={<button className="button ghost small" onClick={() => setSelectedLot(null)}><Search size={14} /> Choose another lot</button>} /><div className="trace-card"><div className={`trace-banner bg-gradient-to-r ${lot.accent}`}><div><p className="card-kicker">Traceable origin</p><h2>{lot.commodity} · {lot.variety}</h2><p>{lot.id} · {lot.grade} · {lot.quantity.toLocaleString("en-IN")} kg</p></div><div className="trace-seal"><BadgeCheck size={26} /><span>Verified lot</span></div></div><div className="trace-body"><div className="trace-origin"><div className="origin-icon"><Tractor size={20} /></div><div><p className="card-kicker">Origin FPO</p><strong>{lot.fpo}</strong><span>{lot.origin} · Collection point verified</span></div></div><div className="timeline"><div className="timeline-item done"><span className="timeline-dot"><Check size={13} /></span><div><strong>Farmer listings pooled</strong><span>2 farmer contributions recorded</span></div><time>23 Sep · 09:20</time></div><div className="timeline-item done"><span className="timeline-dot"><Check size={13} /></span><div><strong>Grade & weight verified</strong><span>{lot.grade} · photo evidence attached</span></div><time>23 Sep · 12:45</time></div><div className="timeline-item done"><span className="timeline-dot"><Check size={13} /></span><div><strong>Buyer order confirmed</strong><span>Price and deductions locked</span></div><time>24 Sep · 08:10</time></div><div className="timeline-item current"><span className="timeline-dot"><Truck size={13} /></span><div><strong>Collection run scheduled</strong><span>Route recommendation generated</span></div><time>Today · 14:00</time></div></div><div className="trace-footer"><div><span>Farmer share</span><strong>{Math.round(lot.farmerShare / lot.price * 100)}% of price</strong></div><div><span>Source district</span><strong>Nashik</strong></div><div><span>Quality record</span><strong>Photo + weight</strong></div></div></div></div></div>; };

  const renderOverview = () => <div className="space-y-6"><div className="welcome-card"><div className="welcome-copy"><p className="eyebrow light">KisanSetu Direct · Nashik pilot</p><h1>{activeRole === "consumer" ? "Good produce should come with a clear story." : activeRole === "fpo" ? "Turn fragmented supply into trusted lots." : activeRole === "admin" ? "See whether the market is working for everyone." : activeRole === "buyer" ? "Source with confidence, not phone calls." : "Your harvest, your share, clearly recorded."}</h1><p>{role.description}</p><div className="welcome-actions">{activeRole === "consumer" ? <button className="button light" onClick={() => setActiveView("catalogue")}>Browse fresh lots <ArrowRight size={16} /></button> : <button className="button light" onClick={() => setActiveView(navItems[1]?.id || "overview")}>Open workspace <ArrowRight size={16} /></button>}<button className="button translucent" onClick={() => setActiveView("trace")}>See how traceability works</button></div></div><div className="welcome-orbit"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="orbit-center"><Leaf size={34} /></div><span className="orbit-pill pill-one">88% farm share</span><span className="orbit-pill pill-two">Lot verified</span><span className="orbit-pill pill-three">Route ready</span></div></div>{renderTopMetrics()}<div className="progress-strip"><div className="progress-copy"><div className="progress-badge"><CheckCircle2 size={17} /></div><div><strong>Demo walkthrough ready</strong><p>9 of 9 acceptance criteria mapped to live pilot data</p></div></div><div className="progress-steps"><span className="complete">Supply</span><i /><span className="complete">Lot</span><i /><span className="complete">Order</span><i /><span className="complete">Dispatch</span><i /><span className="complete">Settle</span></div></div>{(activeRole === "consumer" || activeRole === "buyer") && <div className="section-block"><SectionHeader eyebrow="Marketplace" title="Fresh lots from the pilot" description="Select a lot to see the economics before you commit." action={<button className="text-button" onClick={() => setActiveView("catalogue")}>View all <ArrowRight size={14} /></button>} /><div className="featured-grid">{lots.slice(0, 3).map((lot) => <button key={lot.id} className="featured-lot" onClick={() => setSelectedLot(lot)}><div className={`featured-art bg-gradient-to-br ${lot.accent}`}><span>{lot.commodity === "Pomegranate" ? "◉" : "●"}</span></div><div><div className="featured-title"><strong>{lot.commodity}</strong><StatusChip value={lot.status} /></div><p>{lot.grade} · {lot.origin}</p><div className="featured-price"><strong>{money(lot.price)}<small>/kg</small></strong><span>{lot.available} kg available</span></div></div></button>)}</div></div>}{(activeRole === "fpo" || activeRole === "admin") && <div className="section-block"><SectionHeader eyebrow="Operational pulse" title="Where attention is needed" description="Resolve the next exception before it becomes a trust problem." /><div className="attention-grid"><div className="attention-card amber"><div className="attention-icon"><Clock3 size={18} /></div><div><strong>1 lot needs verification</strong><p>Green Chilli · Grade B · photo pending</p></div><button className="text-button" onClick={() => setActiveView("operations")}>Review <ArrowRight size={14} /></button></div><div className="attention-card blue"><div className="attention-icon"><Route size={18} /></div><div><strong>4 pickups can be consolidated</strong><p>Estimated saving: 11.6 km on today’s run</p></div><button className="text-button" onClick={() => setActiveView("operations")}>Open route <ArrowRight size={14} /></button></div><div className="attention-card rose"><div className="attention-icon"><ShieldCheck size={18} /></div><div><strong>1 dispute is open</strong><p>Weight discrepancy · assigned to FPO</p></div><button className="text-button" onClick={() => notify("Dispute workspace opened")}>Resolve <ArrowRight size={14} /></button></div></div></div>}</div>;

  const view = activeView === "catalogue" ? renderCatalogue(activeRole === "consumer") : activeView === "orders" ? renderOrders() : activeView === "payouts" ? renderPayouts() : activeView === "operations" ? renderOperations() : activeView === "forecast" ? renderForecast() : activeView === "trace" ? renderTrace() : activeRole === "farmer" ? renderFarmer() : renderOverview();

  return <div className="app-shell">
    <header className="topbar"><div className="brand-lockup"><div className="brand-mark"><Leaf size={20} /></div><div><strong>KisanSetu</strong><span>Direct</span></div></div><div className="pilot-pill"><span className="pulse-dot" /> Nashik pilot · Live demo</div><div className="topbar-actions"><button className="icon-button" aria-label="Notifications"><Bell size={18} /><span className="notification-dot" /></button>{renderRoleSwitcher()}<button className="avatar-button">{role.label.charAt(0)}</button></div><button className="mobile-menu" onClick={() => setMobileNav((value) => !value)}><Menu size={20} /></button></header>
    <div className="app-body"><aside className={`sidebar ${mobileNav ? "open" : ""}`}><div className="sidebar-context"><div className={`role-avatar ${role.color}`}><RoleIcon size={19} /></div><div><span>Viewing as</span><strong>{role.label}</strong></div></div><nav className="side-nav">{navItems.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => { setActiveView(item.id); setMobileNav(false); }} className={activeView === item.id ? "active" : ""}><Icon size={17} /><span>{item.label}</span>{activeView === item.id && <span className="nav-active-bar" />}</button>; })}</nav><div className="sidebar-bottom"><div className="trust-card"><ShieldCheck size={18} /><div><strong>Trust by design</strong><span>Every fee and lot event stays visible.</span></div></div><button className="language-button">अ / A <span>English · हिंदी</span><ChevronDown size={14} /></button></div></aside><main className="main-content"><div className="breadcrumb"><span>Workspace</span><ArrowRight size={13} /><strong>{role.short}</strong><span className="breadcrumb-dot" /><span>24 September 2026</span></div>{view}</main></div>{selectedLot && <div className="modal-backdrop" onClick={() => setSelectedLot(null)}><div className="lot-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSelectedLot(null)}><X size={18} /></button><div className={`modal-art bg-gradient-to-br ${selectedLot.accent}`}><span>{selectedLot.commodity}</span><BadgeCheck size={21} /></div><div className="modal-copy"><p className="card-kicker">{selectedLot.id} · {selectedLot.origin}</p><h2>{selectedLot.commodity}, {selectedLot.grade}</h2><p>{selectedLot.fpo} · {selectedLot.contributors} farmer contributors · {selectedLot.freshness}</p><PriceBreakup lot={selectedLot} quantity={activeRole === "consumer" ? 1 : 100} /><div className="modal-actions">{activeRole === "consumer" ? <button className="button primary full" onClick={() => { addToCart(selectedLot); setSelectedLot(null); }}>Add to cart <Plus size={16} /></button> : activeRole === "buyer" ? <button className="button primary full" onClick={() => { placeBulkOrder(selectedLot); setSelectedLot(null); }}>Request this lot <FileCheck2 size={16} /></button> : <button className="button dark full" onClick={() => setSelectedLot(null)}>Close details</button>}</div></div></div></div>}{toast && <div className="toast"><CheckCircle2 size={17} /><span>{toast}</span><button onClick={() => setToast(null)}><X size={14} /></button></div>}
  </div>;
}
