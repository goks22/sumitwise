import React from 'react';
import { FileText, PieChart, ShieldAlert, Briefcase, TrendingUp, Users } from 'lucide-react';
import { Service } from '../types';

const services: Service[] = [
  {
    title: 'Individual Tax Prep',
    description: 'Comprehensive tax return preparation ensuring you get the maximum refund legally possible.',
    iconName: 'FileText'
  },
  {
    title: 'Business Accounting',
    description: 'Full-service bookkeeping, payroll, and financial statement preparation for small businesses.',
    iconName: 'Briefcase'
  },
  {
    title: 'IRS Resolution',
    description: 'Expert representation for audits, back taxes, offers in compromise, and penalty abatements.',
    iconName: 'ShieldAlert'
  },
  {
    title: 'Tax Planning',
    description: 'Proactive strategies to minimize liability for future tax years before they end.',
    iconName: 'TrendingUp'
  },
  {
    title: 'Estate & Trust',
    description: 'Navigating complex fiduciary tax requirements to protect your legacy and beneficiaries.',
    iconName: 'Users'
  },
  {
    title: 'CFO Services',
    description: 'High-level financial insights and budgeting without the cost of a full-time executive.',
    iconName: 'PieChart'
  }
];

const IconMap: Record<string, React.FC<any>> = {
  FileText, Briefcase, ShieldAlert, TrendingUp, Users, PieChart
};

const ServicesSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-base text-accent-600 font-semibold tracking-wide uppercase">Our Expertise</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Comprehensive Financial Solutions
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            We offer more than just tax filing. We provide year-round support to help you manage and grow your wealth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = IconMap[service.iconName];
            return (
              <div key={index} className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-brand-500 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-brand-50 text-brand-600 ring-4 ring-white group-hover:bg-brand-100 transition">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900">
                    <a href="#" className="focus:outline-none">
                      {/* Extend touch target to entire card */}
                      <span className="absolute inset-0" aria-hidden="true" />
                      {service.title}
                    </a>
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;