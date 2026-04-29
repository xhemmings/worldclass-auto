"use client";

import React, { useState } from 'react';

export default function BookingPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    vehicleMake: '',
    vehicleModel: '',
    serviceType: '',
    preferredDate: '',
    description: '',
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      alert('Booking submitted!');
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.message || 'Failed to submit');
    }
  }

  return (
    <main className="min-h-screen py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Book a Service</h1>
      <form className="max-w-md mx-auto space-y-4" onSubmit={handleSubmit}>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full Name"
          className="border p-2 w-full"
        />
        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="border p-2 w-full"
        />
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="border p-2 w-full"
        />
        <input
          name="vehicleMake"
          value={formData.vehicleMake}
          onChange={handleChange}
          placeholder="Vehicle Make"
          className="border p-2 w-full"
        />
        <input
          name="vehicleModel"
          value={formData.vehicleModel}
          onChange={handleChange}
          placeholder="Vehicle Model"
          className="border p-2 w-full"
        />
        <select
          name="serviceType"
          value={formData.serviceType}
          onChange={handleChange}
          className="border p-2 w-full"
        >
          <option value="">Select Service Type</option>
          <option value="general">General Servicing</option>
          <option value="alignment">Alignment</option>
          <option value="diagnostic">Diagnostic</option>
          <option value="repair">Repair</option>
        </select>
        <input
          name="preferredDate"
          value={formData.preferredDate}
          onChange={handleChange}
          placeholder="Preferred Date (YYYY-MM-DD)"
          className="border p-2 w-full"
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your problem"
          className="border p-2 w-full"
        />
        <button
          type="submit"
          className="bg-primary text-white py-2 px-4 rounded"
        >
          Submit Booking
        </button>
      </form>
    </main>
  );
}