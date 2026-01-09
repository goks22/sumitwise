import React from 'react';
import { TeamMember } from '../types';

const team: TeamMember[] = [
  {
    name: 'G. Pai, CPA',
    role: '', 
    bio: 'G. Pai is a Virginia-licensed Certified Public Accountant and the founder of PaiWise Accounting & Tax LLC. The firm provides individual tax and small business accounting services with a focus on accuracy, compliance, and clarity.',
    imageUrl: '' 
  },
  {
    name: 'Sumitha Pai, MBA',
    role: '',
    bio: 'Sumitha Pai, MBA, supports the firm in tax preparation and bookkeeping functions related to individual and small businesses. She participates in the IRS Annual Filing Season Program, reflecting familiarity with current tax rules and filing requirements.',
    imageUrl: '' 
  }
];

const TeamSection: React.FC = () => {
  return (
    <div className="bg-slate-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Meet Our Team</h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Our certified professionals are dedicated to your financial well-being.
          </p>
        </div>
        <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 max-w-5xl mx-auto">
          {team.map((member) => (
            <li key={member.name} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col border border-gray-100">
              <div className="p-8 flex-grow">
                <div className={`space-y-1 ${member.role ? 'border-b border-gray-100 pb-4 mb-4' : 'mb-4'}`}>
                  <h3 className="text-2xl font-bold text-gray-900">{member.name}</h3>
                  {member.role && (
                    <p className="text-accent-600 font-semibold text-sm uppercase tracking-wide">{member.role}</p>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-gray-600 text-sm leading-relaxed italic">
                    {member.bio}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TeamSection;