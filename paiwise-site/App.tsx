import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import ServicesSection from './components/ServicesSection';
import ContactForm from './components/ContactForm';
import AIChat from './components/AIChat';
import TaxCalculator from './components/TaxCalculator';
import { Tab } from './types';
import { Check, Clock, Phone, MapPin, Mail } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case Tab.HOME:
        return (
          <main className="flex-grow">
            <Hero onCtaClick={() => setActiveTab(Tab.CONTACT)} />
            
            <ServicesSection />
            
            {/* Why Choose Us */}
            <section className="bg-slate-900 text-white py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center lg:text-left lg:grid lg:grid-cols-1 items-center">
                  <div>
                    <h2 className="text-3xl font-extrabold mb-6 text-center lg:text-left">Why Choose PaiWise?</h2>
                    <p className="text-gray-400 mb-8 text-lg">
                      We combine the expertise of a large firm with the personal attention of a boutique practice. Our proactive approach saves you money.
                    </p>
                    <ul className="space-y-4 max-w-xl mx-auto lg:mx-0 text-left">
                      {[
                        'Over 20 years of combined experience',
                        'Proactive tax planning, not just reactive filing',
                        'Cloud-based secure document handling',
                        'Transparent, flat-fee pricing structure'
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-start">
                          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-accent-500 flex items-center justify-center">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                          <span className="ml-3 text-lg text-gray-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          </main>
        );

      case Tab.ABOUT:
        return (
          <main className="flex-grow">
            <div className="bg-brand-900 py-16 text-center">
              <h1 className="text-4xl font-extrabold text-white">About Our Firm</h1>
              <p className="mt-4 text-xl text-gray-300 max-w-2xl mx-auto px-4">
                Dedicated to integrity, accuracy, and client success.
              </p>
            </div>
            
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="prose prose-lg text-gray-500 mx-auto">
                <p className="mb-6">
                  PaiWise Accounting & Tax LLC began with a simple mission: to provide high-quality accounting services that empower business owners and individuals to make smarter financial decisions.
                </p>
                <p className="mb-6">
                  We believe that a CPA should be more than just a tax filer—we are your strategic partners. In an ever-changing regulatory environment, we stay ahead of the curve so you don't have to.
                </p>
              </div>
            </section>

            
          </main>
        );

      case Tab.CALCULATOR:
        return <TaxCalculator onSchedule={() => setActiveTab(Tab.CONTACT)} />;

      case Tab.CONTACT:
        return (
          <main className="flex-grow bg-slate-50">
            <div className="bg-brand-900 py-16 text-center">
              <h1 className="text-4xl font-extrabold text-white">Contact Us</h1>
              <p className="mt-4 text-xl text-gray-300">
                Ready to get started? We're here to help.
              </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Contact Info Sidebar */}
                <div className="lg:col-span-1 space-y-8">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Office Information</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <MapPin className="h-6 w-6 text-accent-500 mr-3 shrink-0" />
                        <span className="text-gray-600">
                          Ashburn, Virginia<br/>
                          <span className="text-xs font-bold text-accent-600">(By appointment only)</span>
                        </span>
                      </li>
                      <li className="flex items-center">
                        <Phone className="h-6 w-6 text-accent-500 mr-3 shrink-0" />
                        <span className="text-gray-600">(571) 604-8919</span>
                      </li>
                      <li className="flex items-center">
                        <Mail className="h-6 w-6 text-accent-500 mr-3 shrink-0" />
                        <span className="text-gray-600">contact@sumitwise.com</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Business Hours</h3>
                    <ul className="space-y-3">
                      <li className="flex justify-between text-sm">
                        <span className="text-gray-600 flex items-center"><Clock className="h-4 w-4 mr-2"/> Monday - Friday</span>
                        <span className="font-medium text-gray-900">9:00 AM - 6:00 PM</span>
                      </li>
                      <li className="flex justify-between text-sm">
                        <span className="text-gray-600 flex items-center"><Clock className="h-4 w-4 mr-2"/> Saturday (Tax Season)</span>
                        <span className="font-medium text-gray-900">10:00 AM - 4:00 PM</span>
                      </li>
                      <li className="flex justify-between text-sm">
                        <span className="text-gray-600 flex items-center"><Clock className="h-4 w-4 mr-2"/> Sunday</span>
                        <span className="font-medium text-gray-900">Closed</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2">
                  <ContactForm />
                </div>
              </div>
            </div>
          </main>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      {renderContent()}
      <Footer onNavigate={setActiveTab} />
      <AIChat />
    </div>
  );
};

export default App;
