import React from 'react';
import { Tab } from '../types';
import { Phone, Mail, MapPin, Linkedin, Facebook, Twitter } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: Tab) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-white text-lg font-bold">PaiWise Accounting & Tax LLC</h3>
            <p className="text-sm leading-relaxed">
              Providing expert tax strategies, accounting solutions, and financial peace of mind for individuals and businesses.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-accent-500"><Linkedin className="h-5 w-5" /></a>
              <a href="#" className="hover:text-accent-500"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="hover:text-accent-500"><Twitter className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate(Tab.HOME)} className="hover:text-white transition text-left">Home</button></li>
              <li><button onClick={() => onNavigate(Tab.ABOUT)} className="hover:text-white transition text-left">About Us</button></li>
              <li><button onClick={() => onNavigate(Tab.CALCULATOR)} className="hover:text-white transition text-left">Tax Estimator</button></li>
              <li><button onClick={() => onNavigate(Tab.CONTACT)} className="hover:text-white transition text-left">Contact Us</button></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>Tax Preparation</li>
              <li>IRS Representation</li>
              <li>Bookkeeping & Payroll</li>
              <li>Business Consulting</li>
              <li>Estate Planning</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-accent-500 shrink-0" />
                <span>21913 Sweet Bay Terrace<br/>Broadlands, VA 20148<br/><span className="text-xs font-bold text-accent-500">(By appointment only)</span></span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-accent-500 shrink-0" />
                <span>(571) 604-8919</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-accent-500 shrink-0" />
                <span>contact@sumitwise.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-12 pt-8 text-center">
          <p className="text-xs text-slate-500 mb-6">&copy; {new Date().getFullYear()} PaiWise Accounting & Tax LLC. All rights reserved.</p>
          
          {/* Legal & Billing Disclosure Section */}
          <div className="max-w-4xl mx-auto text-[10px] md:text-xs text-slate-500 leading-relaxed space-y-3 px-4 py-6 bg-slate-800/30 rounded-lg">
            <h4 className="text-slate-400 font-bold uppercase tracking-wider">Legal & Billing Disclosure</h4>
            <p>
              PaiWise Accounting & Tax LLC is a Virginia-licensed CPA firm providing professional accounting, tax, and advisory services.
            </p>
            <p>
              Certain administrative, billing, bookkeeping, and tax preparation services are provided through SumitWise Accounting & Consulting LLC, an affiliated entity. Client payments may be processed through SumitWise Accounting & Consulting LLC.
            </p>
            <p>
              All professional CPA services requiring licensure are performed under PaiWise Accounting & Tax LLC by a Virginia-licensed CPA.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;