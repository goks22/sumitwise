import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'General Inquiry',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    
    // Construct mailto link
    const subject = encodeURIComponent(`Tax Inquiry from ${formData.name}: ${formData.service}`);
    const body = encodeURIComponent(
      `PaiWise Contact Form Submission\n` +
      `--------------------------------\n` +
      `Name: ${formData.name}\n` +
      `Email: ${formData.email}\n` +
      `Phone: ${formData.phone}\n` +
      `Service: ${formData.service}\n\n` +
      `Message:\n${formData.message}`
    );
    
    // Trigger mail client to contact@sumitwise.com
    window.location.href = `mailto:contact@sumitwise.com?subject=${subject}&body=${body}`;

    // Show success state on UI
    setTimeout(() => {
      setStatus('success');
    }, 1000);
  };

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-fade-in">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Prepared!</h3>
        <p className="text-gray-600 mb-6">
          Your default email client should have opened to send your message to <strong>contact@sumitwise.com</strong>. If it didn't open, please email us directly.
        </p>
        <button 
          onClick={() => setStatus('idle')}
          className="text-brand-600 hover:text-brand-800 font-medium underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 sm:p-10 border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
            <input
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
              placeholder="(571) 000-0000"
            />
          </div>
          <div>
            <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">Service Needed</label>
            <select
              name="service"
              id="service"
              value={formData.service}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition bg-white"
            >
              <option value="General Inquiry">General Inquiry</option>
              <option value="Personal Tax Prep">Personal Tax Preparation</option>
              <option value="Business Tax Prep">Business Tax Preparation</option>
              <option value="Bookkeeping">Bookkeeping & Payroll</option>
              <option value="IRS Resolution">IRS Audit Resolution</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            name="message"
            id="message"
            rows={4}
            required
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
            placeholder="How can we help you today?"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={status === 'submitting'}
          className={`w-full flex items-center justify-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition ${status === 'submitting' ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {status === 'submitting' ? 'Preparing Email...' : 'Send Message'}
          {!status.includes('submitting') && <Send className="ml-2 h-5 w-5" />}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;