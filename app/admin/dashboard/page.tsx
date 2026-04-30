'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, CalendarDays, ClipboardList, LogOut,
  Plus, X, Check, Loader2, Phone, Mail, Car, Wrench,
  User, RefreshCw, HardHat, Clock, CheckCircle2, Pencil,
  UserPlus, ShieldCheck, BarChart3,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Booking {
  id: number; name: string; phone: string; email: string;
  vehicle_make: string; vehicle_model: string; service_type: string;
  preferred_date: string; description: string; created_at: string;
}
interface WorkOrder {
  id: number; booking_id: number | null; client_name: string; phone: string;
  vehicle_make: string; vehicle_model: string; service_type: string;
  description: string; status: string; notes: string;
  assigned_to: string | null; estimated_hours: number | null;
  actual_hours: number | null; due_date: string | null;
  created_by: string; created_at: string; updated_at: string;
  started_at: string | null; completed_at: string | null;
}
interface Technician {
  id: number; username: string; name: string; phone: string;
  specialization: string; max_hours_per_day: number; active: boolean;
  created_at: string; active_wo_count: number; assigned_hours: number;
}

type Tab      = 'bookings' | 'work-orders' | 'technicians';
type WOStatus = 'all' | 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected';

// ── Constants ─────────────────────────────────────────────────────────────────

const SERVICE_LABELS: Record<string, string> = {
  servicing: 'General Servicing', alignment: 'Wheel Alignment',
  diagnostics: 'Engine Diagnostics', parts: 'Parts & Installation',
  bodywork: 'Body Work', spray: 'Spray & Paint',
};
const STATUS_STYLE: Record<string, string> = {
  pending:     'bg-amber-100 text-amber-700',
  approved:    'bg-blue-100 text-blue-700',
  in_progress: 'bg-orange-100 text-orange-700',
  completed:   'bg-green-100 text-green-700',
  rejected:    'bg-red-100 text-red-700',
};
const VEHICLE_MAKES = ['Toyota','Honda','Nissan','Mitsubishi','Hyundai','Kia','Mazda','Suzuki','Isuzu','Other'];
const VEHICLE_MODELS: Record<string, string[]> = {
  Toyota:     ['Axio','Fielder','Corolla','Allion','Premio','Camry','Mark X','Crown','Yaris / Vitz','IST','Wish','Noah','Voxy','Hilux','Land Cruiser Prado','Fortuner','RAV4','HiAce'],
  Honda:      ['Fit / Jazz','Civic','City','Accord','Freed','Stream','Stepwgn','CR-V','HR-V / Vezel'],
  Nissan:     ['Tiida','Almera','Sylphy','March / Micra','Note','AD Van','Wingroad','Cube','X-Trail','Navara / Frontier'],
  Mitsubishi: ['Lancer','Galant','Colt','ASX','Outlander','Pajero','Pajero Sport','L200 / Triton'],
  Hyundai:    ['Accent','Elantra','Sonata','Tucson','Santa Fe','Creta','i10','i20'],
  Kia:        ['Picanto','Rio','Cerato / Forte','Stonic','Sportage','Sorento','Seltos'],
  Mazda:      ['Demio / Mazda 2','Axela / Mazda 3','Atenza / Mazda 6','CX-3','CX-5','BT-50'],
  Suzuki:     ['Alto','Swift','Cultus','Wagon R','SX4','Vitara','Grand Vitara','Jimny','APV'],
  Isuzu:      ['D-Max','MU-X','Rodeo','Trooper'], Other: [],
};
const SERVICE_OPTIONS = [
  { value: 'servicing',   label: 'General Servicing' },
  { value: 'alignment',   label: 'Wheel Alignment' },
  { value: 'diagnostics', label: 'Engine Diagnostics' },
  { value: 'parts',       label: 'Parts & Installation' },
  { value: 'bodywork',    label: 'Body Work' },
  { value: 'spray',       label: 'Spray & Paint' },
];

function fmtDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-JM', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtDateTime(s: string) {
  return new Date(s).toLocaleDateString('en-JM', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

function Badge({ status }: { status: string }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${STATUS_STYLE[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status.replace('_',' ')}
    </span>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"><X size={16} /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Work Order Form ───────────────────────────────────────────────────────────

function WorkOrderForm({
  initial, technicians, onSave, onClose, saving,
}: {
  initial?: Partial<WorkOrder>;
  technicians: Technician[];
  onSave: (d: Partial<WorkOrder>) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    client_name:     initial?.client_name     ?? '',
    phone:           initial?.phone           ?? '',
    vehicle_make:    initial?.vehicle_make    ?? '',
    vehicle_model:   initial?.vehicle_model   ?? '',
    service_type:    initial?.service_type    ?? '',
    description:     initial?.description     ?? '',
    notes:           initial?.notes           ?? '',
    status:          initial?.status          ?? 'pending',
    assigned_to:     initial?.assigned_to     ?? '',
    estimated_hours: initial?.estimated_hours?.toString() ?? '',
    due_date:        initial?.due_date        ?? '',
  });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <form onSubmit={e => {
      e.preventDefault();
      onSave({
        ...form,
        assigned_to:     form.assigned_to     || null,
        estimated_hours: form.estimated_hours ? parseFloat(form.estimated_hours) : null,
        due_date:        form.due_date        || null,
      } as any);
    }} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className="form-label">Client Name *</label>
          <input value={form.client_name} onChange={e => set('client_name', e.target.value)} required className="form-input" placeholder="John Smith" /></div>
        <div><label className="form-label">Phone</label>
          <input value={form.phone} onChange={e => set('phone', e.target.value)} className="form-input" placeholder="8761234567" /></div>
        <div><label className="form-label">Vehicle Make</label>
          <select value={form.vehicle_make} onChange={e => { set('vehicle_make', e.target.value); set('vehicle_model', ''); }} className="form-input">
            <option value="">Select make</option>
            {VEHICLE_MAKES.map(m => <option key={m} value={m}>{m}</option>)}
          </select></div>
        <div><label className="form-label">Vehicle Model</label>
          {form.vehicle_make && form.vehicle_make !== 'Other' ? (
            <select value={form.vehicle_model} onChange={e => set('vehicle_model', e.target.value)} className="form-input">
              <option value="">Select model</option>
              {VEHICLE_MODELS[form.vehicle_make]?.map(m => <option key={m} value={m}>{m}</option>)}
              <option value="Other">Other</option>
            </select>
          ) : (
            <input value={form.vehicle_model} onChange={e => set('vehicle_model', e.target.value)} className="form-input" placeholder="Enter model" />
          )}</div>
        <div><label className="form-label">Service Type *</label>
          <select value={form.service_type} onChange={e => set('service_type', e.target.value)} required className="form-input">
            <option value="">Select service</option>
            {SERVICE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select></div>
        <div><label className="form-label">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)} className="form-input">
            {['pending','approved','in_progress','completed','rejected'].map(s => (
              <option key={s} value={s}>{s.replace('_',' ')}</option>
            ))}
          </select></div>

        {/* Assignment */}
        <div><label className="form-label">Assign to Technician</label>
          <select value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)} className="form-input">
            <option value="">Unassigned</option>
            {technicians.filter(t => t.active).map(t => (
              <option key={t.username} value={t.username}>{t.name} ({t.specialization})</option>
            ))}
          </select></div>
        <div><label className="form-label">Estimated Hours</label>
          <input type="number" min="0.25" max="24" step="0.25" value={form.estimated_hours}
            onChange={e => set('estimated_hours', e.target.value)} className="form-input" placeholder="e.g. 2.5" /></div>
        <div><label className="form-label">Due Date</label>
          <input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} className="form-input" /></div>
      </div>

      <div><label className="form-label">Description / Issue</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} className="form-input resize-none" rows={3} placeholder="Describe the work to be done…" /></div>
      <div><label className="form-label">Internal Notes</label>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} className="form-input resize-none" rows={2} placeholder="Notes for the team…" /></div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="flex-1 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
          {saving ? <><Loader2 size={15} className="animate-spin" />Saving…</> : <><Check size={15} />Save Work Order</>}
        </button>
        <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
      </div>
    </form>
  );
}

// ── Work Order Detail ─────────────────────────────────────────────────────────

function WorkOrderDetail({ wo, technicians, onClose, onStatusChange, onUpdate }: {
  wo: WorkOrder; technicians: Technician[];
  onClose: () => void;
  onStatusChange: (id: number, status: string) => void;
  onUpdate: (id: number, d: Partial<WorkOrder>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  if (editing) return (
    <Modal title={`Edit WO-${wo.id.toString().padStart(4,'0')}`} onClose={onClose}>
      <WorkOrderForm initial={wo} technicians={technicians}
        onSave={async d => { setSaving(true); await onUpdate(wo.id, d); setSaving(false); setEditing(false); }}
        onClose={() => setEditing(false)} saving={saving} />
    </Modal>
  );
  const tech = technicians.find(t => t.username === wo.assigned_to);
  const statusActions = [
    ...( wo.status==='pending'     ? [{ label:'Approve',       status:'approved',    cls:'bg-blue-600 hover:bg-blue-700 text-white' },
                                      { label:'Reject',        status:'rejected',    cls:'bg-red-600 hover:bg-red-700 text-white' }] : []),
    ...( wo.status==='approved'    ? [{ label:'Start Work',    status:'in_progress', cls:'bg-orange-500 hover:bg-orange-600 text-white' }] : []),
    ...( wo.status==='in_progress' ? [{ label:'Mark Complete', status:'completed',   cls:'bg-green-600 hover:bg-green-700 text-white' }] : []),
  ];
  return (
    <Modal title={`Work Order WO-${wo.id.toString().padStart(4,'0')}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge status={wo.status} />
          {tech && <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full font-semibold">👷 {tech.name}</span>}
          {wo.estimated_hours && <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-semibold">Est: {wo.estimated_hours}h</span>}
          {wo.actual_hours && <span className="text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-semibold">Actual: {wo.actual_hours}h</span>}
          <span className="text-gray-400 text-xs ml-auto">{fmtDateTime(wo.created_at)}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            [<User size={14}/>, 'Client', wo.client_name],
            [<Phone size={14}/>, 'Phone', wo.phone || '—'],
            [<Car size={14}/>, 'Vehicle', [wo.vehicle_make,wo.vehicle_model].filter(Boolean).join(' ')||'—'],
            [<Wrench size={14}/>, 'Service', SERVICE_LABELS[wo.service_type]||wo.service_type],
            ...(wo.due_date ? [[<CalendarDays size={14}/>, 'Due', fmtDate(wo.due_date)]] : []),
          ].map(([icon,label,value],i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-primary mt-0.5 shrink-0">{icon as React.ReactNode}</span>
              <div><p className="text-gray-400 text-xs">{label as string}</p>
                <p className="font-semibold text-gray-800">{value as string}</p></div>
            </div>
          ))}
        </div>
        {wo.description && <div className="bg-gray-50 rounded-xl p-4"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Description</p><p className="text-gray-700 text-sm leading-relaxed">{wo.description}</p></div>}
        {wo.notes && <div className="bg-amber-50 rounded-xl p-4 border border-amber-100"><p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Internal Notes</p><p className="text-gray-700 text-sm leading-relaxed">{wo.notes}</p></div>}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          {statusActions.map(a => (
            <button key={a.status} onClick={() => { onStatusChange(wo.id,a.status); onClose(); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${a.cls}`}>{a.label}</button>
          ))}
          <button onClick={() => setEditing(true)} className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 hover:bg-gray-50 text-gray-700 ml-auto">Edit</button>
        </div>
      </div>
    </Modal>
  );
}

// ── Booking Detail ────────────────────────────────────────────────────────────

function BookingDetail({ booking, onClose, onCreateWO }: { booking: Booking; onClose: () => void; onCreateWO: (b: Booking) => void }) {
  return (
    <Modal title={`Booking #${booking.id}`} onClose={onClose}>
      <div className="space-y-5">
        <p className="text-gray-400 text-xs">{fmtDateTime(booking.created_at)}</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            [<User size={14}/>, 'Customer', booking.name],
            [<Phone size={14}/>, 'Phone', booking.phone],
            [<Mail size={14}/>, 'Email', booking.email],
            [<Car size={14}/>, 'Vehicle', `${booking.vehicle_make} ${booking.vehicle_model}`],
            [<Wrench size={14}/>, 'Service', SERVICE_LABELS[booking.service_type]||booking.service_type],
            [<CalendarDays size={14}/>, 'Preferred Date', fmtDate(booking.preferred_date)],
          ].map(([icon,label,value],i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-primary mt-0.5 shrink-0">{icon as React.ReactNode}</span>
              <div><p className="text-gray-400 text-xs">{label as string}</p>
                <p className="font-semibold text-gray-800 break-all">{value as string}</p></div>
            </div>
          ))}
        </div>
        {booking.description && <div className="bg-gray-50 rounded-xl p-4"><p className="text-xs font-semibold text-gray-400 uppercase mb-1">Customer Notes</p><p className="text-sm text-gray-700 leading-relaxed">{booking.description}</p></div>}
        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button onClick={() => { onCreateWO(booking); onClose(); }}
            className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
            <ClipboardList size={15} /> Convert to Work Order
          </button>
          <button onClick={onClose} className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium text-sm">Close</button>
        </div>
      </div>
    </Modal>
  );
}

// ── Technician Form ───────────────────────────────────────────────────────────

function TechForm({ initial, onSave, onClose, saving }: {
  initial?: Partial<Technician & { password: string }>;
  onSave: (d: any) => void; onClose: () => void; saving: boolean;
}) {
  const [form, setForm] = useState({
    username: initial?.username ?? '', password: '',
    name: initial?.name ?? '', phone: initial?.phone ?? '',
    specialization: initial?.specialization ?? '',
    max_hours_per_day: initial?.max_hours_per_day?.toString() ?? '6',
  });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const isEdit = !!initial?.id;
  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ ...form, max_hours_per_day: parseFloat(form.max_hours_per_day) }); }} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className="form-label">Full Name *</label>
          <input value={form.name} onChange={e => set('name',e.target.value)} required className="form-input" placeholder="Marcus Campbell" /></div>
        <div><label className="form-label">Username {!isEdit && '*'}</label>
          <input value={form.username} onChange={e => set('username',e.target.value)} required={!isEdit} disabled={isEdit} className={`form-input ${isEdit ? 'opacity-50 cursor-not-allowed' : ''}`} placeholder="tech1" /></div>
        <div><label className="form-label">{isEdit ? 'New Password' : 'Password *'} <span className="text-gray-400 font-normal text-xs">{isEdit ? '(leave blank to keep)' : ''}</span></label>
          <input type="password" value={form.password} onChange={e => set('password',e.target.value)} required={!isEdit} className="form-input" placeholder={isEdit ? 'Leave blank to keep' : 'tech123'} /></div>
        <div><label className="form-label">Phone</label>
          <input value={form.phone} onChange={e => set('phone',e.target.value)} className="form-input" placeholder="8761234567" /></div>
        <div><label className="form-label">Specialization</label>
          <select value={form.specialization} onChange={e => set('specialization',e.target.value)} className="form-input">
            <option value="">General</option>
            {['General Servicing','Alignment & Tyres','Diagnostics','Parts & Installation','Body Work & Spray'].map(s => <option key={s} value={s}>{s}</option>)}
          </select></div>
        <div><label className="form-label">Max Hours / Day</label>
          <input type="number" min="1" max="12" step="0.5" value={form.max_hours_per_day} onChange={e => set('max_hours_per_day',e.target.value)} className="form-input" /></div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="flex-1 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
          {saving ? <><Loader2 size={15} className="animate-spin" />Saving…</> : <><Check size={15} />{isEdit ? 'Update' : 'Add'} Technician</>}
        </button>
        <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
      </div>
    </form>
  );
}

// ── Workload Bar ──────────────────────────────────────────────────────────────

function WorkloadBar({ assigned, max }: { assigned: number; max: number }) {
  const pct = max > 0 ? Math.min((assigned / max) * 100, 100) : 0;
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500';
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 whitespace-nowrap font-medium">{Number(assigned).toFixed(1)}/{max}h</span>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const router = useRouter();
  const [adminUser, setAdminUser]             = useState('');
  const [tab, setTab]                         = useState<Tab>('bookings');
  const [bookings, setBookings]               = useState<Booking[]>([]);
  const [workOrders, setWorkOrders]           = useState<WorkOrder[]>([]);
  const [technicians, setTechnicians]         = useState<Technician[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [woFilter, setWoFilter]               = useState<WOStatus>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedWO, setSelectedWO]           = useState<WorkOrder | null>(null);
  const [showCreateWO, setShowCreateWO]       = useState(false);
  const [woTemplate, setWoTemplate]           = useState<Partial<WorkOrder> | null>(null);
  const [savingWO, setSavingWO]               = useState(false);
  const [editingTech, setEditingTech]         = useState<Technician | null>(null);
  const [showCreateTech, setShowCreateTech]   = useState(false);
  const [savingTech, setSavingTech]           = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [bRes, wRes, tRes] = await Promise.all([
      fetch('/api/bookings'), fetch('/api/work-orders'), fetch('/api/technicians'),
    ]);
    if (bRes.status === 401) { router.push('/admin'); return; }
    setBookings(await bRes.json());
    setWorkOrders(await wRes.json());
    if (tRes.ok) setTechnicians(await tRes.json());
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetch('/api/admin/me').then(r => { if (r.status===401) router.push('/admin'); else r.json().then(d => setAdminUser(d.username)); });
    fetchAll();
  }, [router, fetchAll]);

  async function logout() { await fetch('/api/admin/logout',{method:'POST'}); router.push('/admin'); }

  async function createWO(d: Partial<WorkOrder>) {
    setSavingWO(true);
    const res = await fetch('/api/work-orders',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(d) });
    if (res.ok) { const wo=await res.json(); setWorkOrders(p=>[wo,...p]); setShowCreateWO(false); setWoTemplate(null); setTab('work-orders'); }
    setSavingWO(false);
  }
  async function updateWO(id: number, d: Partial<WorkOrder>) {
    const res = await fetch(`/api/work-orders/${id}`,{ method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(d) });
    if (res.ok) { const updated=await res.json(); setWorkOrders(p=>p.map(w=>w.id===id?updated:w)); }
  }
  async function deleteWO(id: number) {
    if (!confirm('Delete this work order?')) return;
    await fetch(`/api/work-orders/${id}`,{method:'DELETE'});
    setWorkOrders(p=>p.filter(w=>w.id!==id));
  }

  async function createTech(d: any) {
    setSavingTech(true);
    const res = await fetch('/api/technicians',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(d) });
    if (res.ok) { const t=await res.json(); setTechnicians(p=>[...p,{...t,active_wo_count:0,assigned_hours:0}]); setShowCreateTech(false); }
    else { const e=await res.json(); alert(e.error||'Failed'); }
    setSavingTech(false);
  }
  async function updateTech(id: number, d: any) {
    setSavingTech(true);
    const res = await fetch(`/api/technicians/${id}`,{ method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(d) });
    if (res.ok) { const updated=await res.json(); setTechnicians(p=>p.map(t=>t.id===id?{...t,...updated}:t)); setEditingTech(null); }
    setSavingTech(false);
  }
  async function deactivateTech(id: number) {
    if (!confirm('Deactivate this technician?')) return;
    await fetch(`/api/technicians/${id}`,{method:'DELETE'});
    setTechnicians(p=>p.map(t=>t.id===id?{...t,active:false}:t));
  }

  function openCreateFromBooking(b: Booking) {
    setWoTemplate({ booking_id:b.id, client_name:b.name, phone:b.phone, vehicle_make:b.vehicle_make, vehicle_model:b.vehicle_model, service_type:b.service_type, description:b.description });
    setShowCreateWO(true); setTab('work-orders');
  }

  const filteredWOs = woFilter==='all' ? workOrders : workOrders.filter(w=>w.status===woFilter);
  const stats = {
    totalBookings: bookings.length,
    todayBookings: bookings.filter(b=>b.created_at?.startsWith(new Date().toISOString().split('T')[0])).length,
    pendingWOs: workOrders.filter(w=>w.status==='pending').length,
    activeWOs: workOrders.filter(w=>w.status==='in_progress').length,
    totalWOs: workOrders.length,
  };

  const NAV: { key: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key:'bookings',     label:'Bookings',     icon:<CalendarDays size={18}/>, badge: bookings.length },
    { key:'work-orders',  label:'Work Orders',  icon:<ClipboardList size={18}/>, badge: stats.pendingWOs },
    { key:'technicians',  label:'Technicians',  icon:<HardHat size={18}/>, badge: technicians.filter(t=>t.active).length },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="w-60 bg-gray-950 flex flex-col shrink-0">
        <div className="px-5 py-6 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white font-black text-xs shrink-0">WC</span>
            <div><p className="text-white font-bold text-sm leading-tight">WorldClass Auto</p><p className="text-gray-500 text-xs">Admin Panel</p></div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="px-4 py-1 text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1">Management</p>
          {NAV.map(n => (
            <button key={n.key} onClick={() => setTab(n.key)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab===n.key ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              {n.icon} {n.label}
              {n.badge !== undefined && n.badge > 0 && (
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${tab===n.key ? 'bg-white/20 text-white' : n.key==='work-orders' ? 'bg-amber-900/60 text-amber-400' : 'bg-gray-800 text-gray-400'}`}>{n.badge}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-gray-800">
          <div className="flex items-center gap-2.5 px-4 mb-3">
            <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xs">{adminUser[0]?.toUpperCase()}</div>
            <span className="text-gray-400 text-sm font-medium">{adminUser}</span>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-gray-800 transition-colors font-medium">
            <LogOut size={16}/> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-lg font-black text-gray-900">
              {tab==='bookings' ? 'Bookings' : tab==='work-orders' ? 'Work Orders' : 'Technicians'}
            </h1>
            <p className="text-gray-400 text-xs mt-0.5">
              {tab==='bookings' ? `${bookings.length} total` : tab==='work-orders' ? `${workOrders.length} total · ${stats.pendingWOs} pending · ${stats.activeWOs} in progress` : `${technicians.filter(t=>t.active).length} active`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchAll} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            {tab==='work-orders' && (
              <button onClick={()=>{ setWoTemplate(null); setShowCreateWO(true); }} className="bg-primary hover:bg-primary-dark text-white text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2">
                <Plus size={15}/> New Work Order
              </button>
            )}
            {tab==='technicians' && (
              <button onClick={()=>setShowCreateTech(true)} className="bg-primary hover:bg-primary-dark text-white text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2">
                <UserPlus size={15}/> Add Technician
              </button>
            )}
          </div>
        </header>

        {/* Stats strip */}
        <div className="bg-white border-b border-gray-200 px-8 py-3 flex gap-5 shrink-0 overflow-x-auto">
          {[
            { label:'Bookings',    value:stats.totalBookings,  color:'text-gray-900' },
            { label:'Today',       value:stats.todayBookings,  color:'text-blue-600' },
            { label:'Total WOs',   value:stats.totalWOs,       color:'text-gray-900' },
            { label:'Pending',     value:stats.pendingWOs,     color: stats.pendingWOs>0 ? 'text-amber-600' : 'text-gray-900' },
            { label:'In Progress', value:stats.activeWOs,      color: stats.activeWOs>0 ? 'text-orange-600' : 'text-gray-900' },
            { label:'Completed',   value:workOrders.filter(w=>w.status==='completed').length, color:'text-green-600' },
            { label:'Technicians', value:technicians.filter(t=>t.active).length, color:'text-gray-900' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5 shrink-0">
              <span className={`text-xl font-black ${s.color}`}>{s.value}</span>
              <span className="text-gray-400 text-xs">{s.label}</span>
              <span className="text-gray-200 text-sm ml-1">|</span>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-400"><Loader2 size={28} className="animate-spin mr-3"/>Loading…</div>
          ) : tab==='bookings' ? (

            /* ── Bookings Table ──────────────────────────────────────────── */
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {bookings.length===0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400"><CalendarDays size={40} className="mb-3 opacity-30"/><p className="font-semibold">No bookings yet</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-gray-100 bg-gray-50">
                      {['#','Submitted','Customer','Phone','Vehicle','Service','Pref. Date',''].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {bookings.map((b,i) => (
                        <tr key={b.id} className={`border-b border-gray-50 hover:bg-gray-50 ${i%2===1?'bg-gray-50/40':''}`}>
                          <td className="px-4 py-3 font-bold text-gray-400 text-xs">#{b.id}</td>
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{fmtDate(b.created_at)}</td>
                          <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">{b.name}</td>
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{b.phone}</td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">{b.vehicle_make} {b.vehicle_model}</td>
                          <td className="px-4 py-3 whitespace-nowrap"><span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">{SERVICE_LABELS[b.service_type]||b.service_type}</span></td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">{fmtDate(b.preferred_date)}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={()=>setSelectedBooking(b)} className="text-xs font-semibold text-primary hover:underline">View</button>
                              <span className="text-gray-300">|</span>
                              <button onClick={()=>openCreateFromBooking(b)} className="text-xs font-semibold text-gray-500 hover:text-primary hover:underline whitespace-nowrap">→ WO</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          ) : tab==='work-orders' ? (

            /* ── Work Orders ─────────────────────────────────────────────── */
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {(['all','pending','approved','in_progress','completed','rejected'] as WOStatus[]).map(s => (
                  <button key={s} onClick={()=>setWoFilter(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${woFilter===s?'bg-gray-900 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {s==='all'?`All (${workOrders.length})`:`${s.replace('_',' ')} (${workOrders.filter(w=>w.status===s).length})`}
                  </button>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {filteredWOs.length===0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400"><ClipboardList size={40} className="mb-3 opacity-30"/><p className="font-semibold">No work orders</p></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-gray-100 bg-gray-50">
                        {['WO#','Created','Client','Vehicle','Service','Assigned To','Est.','Status',''].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {filteredWOs.map((w,i) => {
                          const tech = technicians.find(t=>t.username===w.assigned_to);
                          return (
                            <tr key={w.id} className={`border-b border-gray-50 hover:bg-gray-50 ${i%2===1?'bg-gray-50/40':''}`}>
                              <td className="px-4 py-3 font-black text-gray-500 text-xs">WO-{w.id.toString().padStart(4,'0')}</td>
                              <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{fmtDate(w.created_at)}</td>
                              <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">{w.client_name}</td>
                              <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{[w.vehicle_make,w.vehicle_model].filter(Boolean).join(' ')||'—'}</td>
                              <td className="px-4 py-3 whitespace-nowrap"><span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">{SERVICE_LABELS[w.service_type]||w.service_type}</span></td>
                              <td className="px-4 py-3 whitespace-nowrap text-xs">
                                {tech ? (
                                  <span className="flex items-center gap-1 text-gray-700 font-medium">
                                    <HardHat size={11} className="text-primary shrink-0"/>{tech.name}
                                  </span>
                                ) : <span className="text-gray-400 italic">Unassigned</span>}
                              </td>
                              <td className="px-4 py-3 text-xs whitespace-nowrap text-gray-500">{w.estimated_hours ? `${w.estimated_hours}h` : '—'}</td>
                              <td className="px-4 py-3"><Badge status={w.status}/></td>
                              <td className="px-4 py-3">
                                <div className="flex gap-1.5 items-center">
                                  <button onClick={()=>setSelectedWO(w)} className="text-xs font-semibold text-primary hover:underline">View</button>
                                  {w.status==='pending' && (<>
                                    <span className="text-gray-300">|</span>
                                    <button onClick={()=>updateWO(w.id,{status:'approved'})} className="text-xs font-semibold text-blue-600 hover:underline">Approve</button>
                                    <span className="text-gray-300">|</span>
                                    <button onClick={()=>updateWO(w.id,{status:'rejected'})} className="text-xs font-semibold text-red-500 hover:underline">Reject</button>
                                  </>)}
                                  <span className="text-gray-300">|</span>
                                  <button onClick={()=>deleteWO(w.id)} className="text-xs font-semibold text-gray-400 hover:text-red-500">Del</button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

          ) : (

            /* ── Technicians ─────────────────────────────────────────────── */
            <div className="space-y-4">
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label:'Active Technicians', value:technicians.filter(t=>t.active).length, icon:<HardHat size={20} className="text-primary"/>, color:'border-primary/20' },
                  { label:'Total Capacity Today', value:`${technicians.filter(t=>t.active).reduce((s,t)=>s+Number(t.max_hours_per_day),0)}h`, icon:<Clock size={20} className="text-blue-600"/>, color:'border-blue-200' },
                  { label:'Hours Assigned', value:`${technicians.reduce((s,t)=>s+Number(t.assigned_hours),0).toFixed(1)}h`, icon:<BarChart3 size={20} className="text-orange-500"/>, color:'border-orange-200' },
                ].map(c => (
                  <div key={c.label} className={`bg-white rounded-2xl border-2 ${c.color} p-5`}>
                    <div className="flex items-center justify-between mb-2">{c.icon}<span className="text-2xl font-black text-gray-900">{c.value}</span></div>
                    <p className="text-gray-500 text-sm">{c.label}</p>
                  </div>
                ))}
              </div>

              {/* Technician table */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {technicians.length===0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400"><HardHat size={40} className="mb-3 opacity-30"/><p className="font-semibold">No technicians yet</p></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-gray-100 bg-gray-50">
                        {['Name','Username','Specialization','Max Hrs/Day','Active WOs','Workload','Status',''].map(h=>(
                          <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {technicians.map((t,i) => (
                          <tr key={t.id} className={`border-b border-gray-50 hover:bg-gray-50 ${i%2===1?'bg-gray-50/40':''} ${!t.active?'opacity-50':''}`}>
                            <td className="px-4 py-3 font-semibold text-gray-800">{t.name}</td>
                            <td className="px-4 py-3 text-gray-500 text-xs font-mono">{t.username}</td>
                            <td className="px-4 py-3 text-gray-600 text-xs">{t.specialization||'General'}</td>
                            <td className="px-4 py-3 text-center font-bold text-gray-700">{t.max_hours_per_day}h</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-block w-7 h-7 rounded-full text-xs font-black flex items-center justify-center ${Number(t.active_wo_count)>0?'bg-orange-100 text-orange-700':'bg-gray-100 text-gray-500'}`}>
                                {t.active_wo_count}
                              </span>
                            </td>
                            <td className="px-4 py-3 w-36"><WorkloadBar assigned={Number(t.assigned_hours)} max={Number(t.max_hours_per_day)}/></td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t.active?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>
                                {t.active?'Active':'Inactive'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button onClick={()=>setEditingTech(t)} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"><Pencil size={11}/>Edit</button>
                                {t.active && (<><span className="text-gray-300">|</span>
                                  <button onClick={()=>deactivateTech(t.id)} className="text-xs font-semibold text-gray-400 hover:text-red-500">Deactivate</button></>)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {selectedBooking && <BookingDetail booking={selectedBooking} onClose={()=>setSelectedBooking(null)} onCreateWO={openCreateFromBooking}/>}
      {selectedWO && <WorkOrderDetail wo={selectedWO} technicians={technicians} onClose={()=>setSelectedWO(null)} onStatusChange={(id,status)=>updateWO(id,{status})} onUpdate={async(id,d)=>{await updateWO(id,d);setSelectedWO(null);}}/>}
      {showCreateWO && (
        <Modal title="New Work Order" onClose={()=>{setShowCreateWO(false);setWoTemplate(null);}}>
          <WorkOrderForm initial={woTemplate??undefined} technicians={technicians} onSave={createWO} onClose={()=>{setShowCreateWO(false);setWoTemplate(null);}} saving={savingWO}/>
        </Modal>
      )}
      {showCreateTech && (
        <Modal title="Add Technician" onClose={()=>setShowCreateTech(false)}>
          <TechForm onSave={createTech} onClose={()=>setShowCreateTech(false)} saving={savingTech}/>
        </Modal>
      )}
      {editingTech && (
        <Modal title={`Edit — ${editingTech.name}`} onClose={()=>setEditingTech(null)}>
          <TechForm initial={editingTech} onSave={d=>updateTech(editingTech.id,d)} onClose={()=>setEditingTech(null)} saving={savingTech}/>
        </Modal>
      )}
    </div>
  );
}
