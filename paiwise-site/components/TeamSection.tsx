import React from 'react';
import { TeamMember } from '../types';

const team: TeamMember[] = [
  {
    name: 'G. Pai, CPA',
    role: 'Founder & Principal CPA',
    bio: 'G. Pai is a Virginia-licensed Certified Public Accountant and the founder of PaiWise Accounting & Tax LLC. With a strong background in individual taxation, small business accounting, and compliance, G. Pai brings a practical, detail-oriented approach to helping clients navigate tax obligations with clarity and confidence. Known for providing affordable, transparent, and reliable services, G. Pai works closely with clients to ensure accuracy, compliance, and peace of mind—whether for annual tax filings or ongoing advisory needs. The firm is built on the principles of integrity, professionalism, and personalized service.',
    imageUrl: 'https://picsum.photos/400/400?random=1'
  },
  {
    name: 'Sumitha Pai, MBA',
    role: 'Senior Tax Manager',
    bio: 'Sumitha Pai, MBA, serves as Senior Tax Manager, specializing in individual and small business tax services. She manages day-to-day bookkeeping and tax preparation operations and is known for her meticulous attention to detail and client-focused approach. She is a participant in the IRS Annual Filing Season Program, ensuring up-to-date knowledge of tax rules and filing requirements.',
    imageUrl: 'https://picsum.photos/400/400?random=4'
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
        <ul className="grid grid-cols-1 gap-12 md:grid-cols-2 max-w-5xl mx-auto sm:gap-8">
          {team.map((member) => (
            <li key={member.name} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <div className="aspect-w-3 aspect-h-2">
                <img className="object-cover w-full h-80" src={member.imageUrl} alt={member.name} />
              </div>
              <div className="p-8 flex-grow">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-gray-900">{member.name}</h3>
                  <p className="text-accent-600 font-semibold text-sm uppercase tracking-wide">{member.role}</p>
                </div>
                <div className="mt-4">
                  <p className="text-gray-500 text-sm leading-relaxed">
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