'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  HardHat, LogOut, Clock, CheckCircle2, PlayCircle,
  Wrench, Car, User, AlertCircle, Loader2, RefreshCw,
  CalendarDays, ClipboardCheck, Timer,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TechInfo {
  username: string; name: string;
  specialization: string; max_hours_per_day: number;
}
interface WorkOrder {
  id: number; client_name: string; phone: string;
  vehicle_make: string; vehicle_model: string;
  service_type: string; description: string;
  status: string; notes: string; estimated_hours: number | null;
  actual_hours: number | null; due_date: string | null;
  created_at: string; started_at: string | null; completed_at: string | null;
}

const SERVICE_LABELS: Record<string, string> = {
  servicing: 'General Servicing', alignment: 'Wheel Alignment',
  diagnostics: 'Engine Diagnostics', parts: 'Parts & Installation',
  bodywork: 'Body Work', spray: 'Spray & Paint',
};

const STATUS_COLOR: Record<string, string> = {
  pending:     'bg-amber-100 text-amber-700 border-amber-200',
  approved:    'bg-blue-100 text-blue-700 border-blue-200',
  in_progress: 'bg-orange-100 text-orange-700 border-orange-200',
  completed:   'bg-green-100 text-green-700 border-green-200',
  rejected:    'bg-red-100 text-red-700 border-red-200',
};

function fmtDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-JM', { day: 'numeric', month: 'short' });
}
function fmtTime(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleTimeString('en-JM', { hour: '2-digit', minute: '2-digit' });
}

// ── Complete Job Modal ────────────────────────────────────────────────────────

function CompleteModal({
  wo, onConfirm, onClose,
}: {
  wo: WorkOrder;
  onConfirm: (hours: number, notes: string) => void;
  onClose: () => void;
}) {
  const [hours, setHours] = useState(wo.estimated_hours?.toString() ?? '');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="font-black text-gray-900 text-lg mb-1">Complete Job</h3>
        <p className="text-gray-500 text-sm mb-5">
          WO-{wo.id.toString().padStart(4,'0')} · {wo.client_name} · {wo.vehicle_make} {wo.vehicle_model}
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Actual Hours Worked <span className="text-primary">*</span>
            </label>
            <input
              type="number" min="0.25" max="24" step="0.25"
              value={hours} onChange={e => setHours(e.target.value)}
              placeholder={wo.estimated_hours ? `Est. ${wo.estimated_hours}h` : 'e.g. 1.5'}
              className="form-input"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Completion Notes <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Any notes about the work done, parts used, issues found…"
              rows={3} className="form-input resize-none" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={async () => {
              const h = parseFloat(hours);
              if (!h || h <= 0) { alert('Enter valid hours.'); return; }
              setSaving(true);
              await onConfirm(h, notes);
              setSaving(false);
            }}
            disabled={saving}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
            Mark Complete
          </button>
          <button onClick={onClose} className="px-5 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Work Order Card ───────────────────────────────────────────────────────────

function WOCard({
  wo, onStart, onComplete,
}: {
  wo: WorkOrder;
  onStart: (id: number) => void;
  onComplete: (wo: WorkOrder) => void;
}) {
  const isActive    = wo.status === 'in_progress';
  const isQueued    = wo.status === 'approved';
  const isCompleted = wo.status === 'completed';

  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-all ${
      isActive ? 'border-orange-300 shadow-lg shadow-orange-100' :
      isQueued ? 'border-gray-200 bg-white' :
      'border-gray-100 bg-gray-50/50 opacity-75'
    }`}>
      {/* Card header */}
      <div className={`px-5 py-3 flex items-center justify-between ${
        isActive ? 'bg-orange-50' : isCompleted ? 'bg-green-50' : 'bg-gray-50'
      }`}>
        <div className="flex items-center gap-2">
          <span className="font-black text-gray-500 text-xs">
            WO-{wo.id.toString().padStart(4,'0')}
          </span>
          {wo.due_date && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <CalendarDays size={11} /> Due {fmtDate(wo.due_date)}
            </span>
          )}
        </div>
        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border capitalize ${STATUS_COLOR[wo.status]}`}>
          {wo.status.replace('_',' ')}
        </span>
      </div>

      <div className="px-5 py-4 space-y-3">
        {/* Client + vehicle */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-bold text-gray-900">{wo.client_name}</p>
            <p className="text-gray-500 text-sm">{[wo.vehicle_make, wo.vehicle_model].filter(Boolean).join(' ') || '—'}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-semibold text-primary">
              {wo.estimated_hours ? `Est. ${wo.estimated_hours}h` : 'No est.'}
            </p>
            {isActive && wo.started_at && (
              <p className="text-xs text-gray-400 mt-0.5">Started {fmtTime(wo.started_at)}</p>
            )}
            {isCompleted && wo.actual_hours && (
              <p className="text-xs text-green-600 font-semibold mt-0.5">Actual: {wo.actual_hours}h</p>
            )}
          </div>
        </div>

        {/* Service badge */}
        <div className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
            {SERVICE_LABELS[wo.service_type] || wo.service_type}
          </span>
        </div>

        {/* Description */}
        {wo.description && (
          <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
            {wo.description}
          </p>
        )}

        {/* Notes (admin) */}
        {wo.notes && (
          <p className="text-amber-700 text-xs bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
            <span className="font-bold">Admin note: </span>{wo.notes}
          </p>
        )}

        {/* Actions */}
        {isQueued && (
          <button onClick={() => onStart(wo.id)}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-1 transition-colors">
            <PlayCircle size={16} /> Start Job
          </button>
        )}
        {isActive && (
          <button onClick={() => onComplete(wo)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-1 transition-colors">
            <CheckCircle2 size={16} /> Complete Job & Log Hours
          </button>
        )}
        {isCompleted && (
          <div className="flex items-center gap-2 text-green-600 text-sm font-semibold pt-1">
            <ClipboardCheck size={15} />
            Completed {fmtDate(wo.completed_at)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Hours Bar ─────────────────────────────────────────────────────────────────

function HoursBar({ assigned, max }: { assigned: number; max: number }) {
  const pct = Math.min((assigned / max) * 100, 100);
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-300 whitespace-nowrap">
        {assigned.toFixed(1)} / {max}h
      </span>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function TechDashboard() {
  const router = useRouter();
  const [tech, setTech]           = useState<TechInfo | null>(null);
  const [orders, setOrders]       = useState<WorkOrder[]>([]);
  const [loading, setLoading]     = useState(true);
  const [completing, setCompleting] = useState<WorkOrder | null>(null);

  const fetchOrders = useCallback(async () => {
    const res = await fetch('/api/technician/work-orders');
    if (res.status === 401) { router.push('/technician'); return; }
    setOrders(await res.json());
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetch('/api/technician/me').then(r => {
      if (r.status === 401) { router.push('/technician'); return; }
      r.json().then(d => setTech(d));
    });
    fetchOrders();
  }, [router, fetchOrders]);

  async function startJob(id: number) {
    const res = await fetch('/api/technician/work-orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'in_progress' }),
    });
    if (res.ok) setOrders(p => p.map(w => w.id === id ? { ...w, status: 'in_progress', started_at: new Date().toISOString() } : w));
  }

  async function completeJob(wo: WorkOrder, actual_hours: number, notes: string) {
    const res = await fetch('/api/technician/work-orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: wo.id, status: 'completed', actual_hours, notes }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders(p => p.map(w => w.id === wo.id ? updated : w));
      setCompleting(null);
    }
  }

  async function logout() {
    await fetch('/api/technician/logout', { method: 'POST' });
    router.push('/technician');
  }

  const active    = orders.filter(w => w.status === 'in_progress');
  const queued    = orders.filter(w => w.status === 'approved');
  const completed = orders.filter(w => w.status === 'completed');

  const assignedHours = orders
    .filter(w => ['approved','in_progress'].includes(w.status))
    .reduce((sum, w) => sum + (w.estimated_hours ?? 0), 0);

  const completedHoursToday = orders
    .filter(w => w.status === 'completed' && w.completed_at?.startsWith(new Date().toISOString().split('T')[0]))
    .reduce((sum, w) => sum + (w.actual_hours ?? 0), 0);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white font-black text-xs">WC</span>
            <div>
              <p className="text-white font-bold text-sm leading-tight">{tech?.name ?? '…'}</p>
              <p className="text-gray-500 text-xs">{tech?.specialization ?? 'Technician'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block w-40">
              <p className="text-gray-500 text-xs mb-1">Today&apos;s load</p>
              <HoursBar assigned={assignedHours} max={tech?.max_hours_per_day ?? 6} />
            </div>
            <button onClick={() => fetchOrders()} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={logout} className="flex items-center gap-1.5 text-gray-500 hover:text-white text-sm transition-colors">
              <LogOut size={15} /> Out
            </button>
          </div>
        </div>
      </header>

      {/* Stats strip */}
      <div className="bg-gray-900/60 border-b border-gray-800 px-6 py-3">
        <div className="max-w-3xl mx-auto flex gap-6 text-sm">
          {[
            { icon: <PlayCircle size={14} className="text-orange-400" />, label: 'Active',    value: active.length,    color: 'text-orange-400' },
            { icon: <Clock size={14} className="text-blue-400" />,        label: 'Queued',    value: queued.length,    color: 'text-blue-400' },
            { icon: <CheckCircle2 size={14} className="text-green-400" />,label: 'Done today',value: completed.filter(w => w.completed_at?.startsWith(new Date().toISOString().split('T')[0])).length, color: 'text-green-400' },
            { icon: <Timer size={14} className="text-primary" />,          label: 'Hours done',value: `${completedHoursToday.toFixed(1)}h`, color: 'text-primary' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              {s.icon}
              <span className={`font-black ${s.color}`}>{s.value}</span>
              <span className="text-gray-500">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-8">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-500">
              <Loader2 size={24} className="animate-spin mr-2" /> Loading your queue…
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
              <ClipboardCheck size={48} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 font-semibold">No work orders assigned yet</p>
              <p className="text-gray-600 text-sm mt-1">Check back soon or ask your supervisor</p>
            </div>
          ) : (
            <>
              {/* Active job */}
              {active.length > 0 && (
                <section>
                  <h2 className="text-xs font-black text-orange-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <PlayCircle size={14} /> Active Job{active.length > 1 ? 's' : ''} ({active.length})
                  </h2>
                  <div className="space-y-3">
                    {active.map(wo => (
                      <WOCard key={wo.id} wo={wo} onStart={startJob} onComplete={setCompleting} />
                    ))}
                  </div>
                </section>
              )}

              {/* Queue */}
              {queued.length > 0 && (
                <section>
                  <h2 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Clock size={14} /> Up Next — Queue ({queued.length})
                  </h2>
                  <div className="space-y-3">
                    {queued.map(wo => (
                      <WOCard key={wo.id} wo={wo} onStart={startJob} onComplete={setCompleting} />
                    ))}
                  </div>
                </section>
              )}

              {/* Completed */}
              {completed.length > 0 && (
                <section>
                  <h2 className="text-xs font-black text-green-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <CheckCircle2 size={14} /> Completed ({completed.length})
                  </h2>
                  <div className="space-y-3">
                    {completed.map(wo => (
                      <WOCard key={wo.id} wo={wo} onStart={startJob} onComplete={setCompleting} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      {/* Complete modal */}
      {completing && (
        <CompleteModal
          wo={completing}
          onConfirm={(hrs, notes) => completeJob(completing, hrs, notes)}
          onClose={() => setCompleting(null)}
        />
      )}
    </div>
  );
}
