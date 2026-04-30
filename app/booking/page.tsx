'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight, ArrowLeft, Calendar, Car, User, Wrench, Loader2 } from 'lucide-react';

const SERVICE_OPTIONS = [
  { value: 'oil-change', label: 'Oil Change & Fluids' },
  { value: 'tires', label: 'Tire & Alignment' },
  { value: 'diagnostics', label: 'Engine Diagnostics' },
  { value: 'brakes', label: 'Brake Service' },
  { value: 'ac', label: 'A/C & Heating' },
  { value: 'inspection', label: 'Full Inspection' },
  { value: 'repair', label: 'General Repair' },
];

const VEHICLE_MAKES = [
  'Acura','BMW','Chevrolet','Ford','Honda','Hyundai','Infiniti',
  'Jeep','Kia','Lexus','Mazda','Mercedes-Benz','Mitsubishi',
  'Nissan','Subaru','Suzuki','Toyota','Volkswagen','Other',
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i);

function Field({
  label,
  required,
  optional,
  children,
  span2,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
  span2?: boolean;
}) {
  return (
    <div className={span2 ? 'sm:col-span-2' : ''}>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-primary ml-0.5">*</span>}
        {optional && <span className="text-gray-400 font-normal ml-1 text-xs">(optional)</span>}
      </label>
      {children}
    </div>
  );
}

function BookingForm() {
  const params = useSearchParams();
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    serviceType: params?.get('service') || '',
    preferredDate: params?.get('date') || '',
    description: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          vehicleMake: form.vehicleMake,
          vehicleModel: [form.vehicleYear, form.vehicleModel].filter(Boolean).join(' '),
          serviceType: form.serviceType,
          preferredDate: form.preferredDate,
          description: form.description || null,
        }),
      });
      if (res.ok) {
        setStatus('success');
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.message || 'Something went wrong. Please try again.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-32">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Booking Confirmed!</h2>
          <p className="text-gray-500 mt-3 text-sm leading-relaxed">
            Thank you, <span className="font-semibold text-gray-700">{form.name}</span>. We&apos;ve received your
            service request for{' '}
            <span className="font-semibold text-gray-700">{form.preferredDate}</span>. Our team will contact
            you at <span className="font-semibold text-gray-700">{form.phone}</span> within 1 hour to confirm
            your appointment.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-xl mt-8 transition-colors"
          >
            <ArrowLeft size={15} /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-gray-950 pt-28 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors text-sm mb-5"
          >
            <ArrowLeft size={13} /> Back to Home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black text-white">Book a Service</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Fill in the details below. We&apos;ll confirm your appointment within 1 hour.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>

          {/* Service Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-8 py-5 border-b border-gray-100">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Wrench size={16} className="text-primary" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Service Details</h2>
            </div>
            <div className="px-8 py-6 grid sm:grid-cols-2 gap-5">
              <Field label="Service Type" required>
                <select
                  value={form.serviceType}
                  onChange={(e) => set('serviceType', e.target.value)}
                  required
                  className="form-input"
                >
                  <option value="">Select a service</option>
                  {SERVICE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>

              <Field label="Preferred Date" required>
                <div className="relative">
                  <input
                    type="date"
                    value={form.preferredDate}
                    min={today}
                    onChange={(e) => set('preferredDate', e.target.value)}
                    required
                    className="form-input pr-10"
                  />
                  <Calendar size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </Field>

              <Field label="Describe the Issue" optional span2>
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Any symptoms, noises, or concerns you've noticed about your vehicle..."
                  rows={3}
                  className="form-input resize-none"
                />
              </Field>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-8 py-5 border-b border-gray-100">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Car size={16} className="text-primary" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Vehicle Information</h2>
            </div>
            <div className="px-8 py-6 grid sm:grid-cols-3 gap-5">
              <Field label="Year" required>
                <select
                  value={form.vehicleYear}
                  onChange={(e) => set('vehicleYear', e.target.value)}
                  required
                  className="form-input"
                >
                  <option value="">Select year</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </Field>

              <Field label="Make" required>
                <select
                  value={form.vehicleMake}
                  onChange={(e) => set('vehicleMake', e.target.value)}
                  required
                  className="form-input"
                >
                  <option value="">Select make</option>
                  {VEHICLE_MAKES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </Field>

              <Field label="Model" required>
                <input
                  type="text"
                  value={form.vehicleModel}
                  onChange={(e) => set('vehicleModel', e.target.value)}
                  placeholder="e.g. Corolla, Civic"
                  required
                  className="form-input"
                />
              </Field>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-8 py-5 border-b border-gray-100">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <User size={16} className="text-primary" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Your Information</h2>
            </div>
            <div className="px-8 py-6 grid sm:grid-cols-2 gap-5">
              <Field label="Full Name" required span2>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="John Smith"
                  required
                  className="form-input"
                />
              </Field>

              <Field label="Phone Number" required>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="(876) 462-9709"
                  required
                  className="form-input"
                />
              </Field>

              <Field label="Email Address" required>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="john@example.com"
                  required
                  className="form-input"
                />
              </Field>
            </div>
          </div>

          {/* Error banner */}
          {status === 'error' && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4 text-red-600 text-sm">
              {errorMsg}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-bold py-4 rounded-xl text-base transition-colors flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                Confirm Booking <ArrowRight size={17} />
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400">
            By booking, you agree to our terms of service. We&apos;ll contact you within 1 hour to confirm.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 size={28} className="text-primary animate-spin" />
        </div>
      }
    >
      <BookingForm />
    </Suspense>
  );
}
