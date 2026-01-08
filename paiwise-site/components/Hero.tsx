import React from 'react';
import { Tab } from '../types';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface HeroProps {
  onCtaClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onCtaClick }) => {
  return (
    <div className="relative bg-brand-900 overflow-hidden">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 opacity-20">
        <img 
          src="https://picsum.photos/1920/1080?grayscale" 
          alt="Office Background" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-24 md:py-32">
        <div className="lg:w-2/3">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-800 text-accent-500 text-sm font-medium mb-6 border border-brand-700">
            <span className="flex h-2 w-2 rounded-full bg-accent-500 mr-2"></span>
            Accepting New Clients for {new Date().getFullYear()} Tax Season
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
            Strategic Accounting for <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-500 to-yellow-300">
              Your Financial Future
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
            We don't just file your taxes; we plan your success. From individual returns to complex corporate strategies, PaiWise Accounting & Tax LLC delivers precision, integrity, and peace of mind.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onCtaClick}
              className="bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition transform hover:-translate-y-1 flex items-center justify-center"
            >
              Schedule a Consultation
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            
            <button className="bg-transparent border border-gray-400 hover:bg-white hover:text-brand-900 text-white font-semibold py-4 px-8 rounded-lg transition">
              Learn About Our Services
            </button>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 text-sm text-gray-400">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              Certified Public Accountants
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              Secure Client Portal
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;