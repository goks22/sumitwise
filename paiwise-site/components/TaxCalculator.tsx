import React, { useState, useEffect } from 'react';
import { Calculator, Info, Calendar, TrendingUp, Home, Briefcase, Landmark, Users, Receipt, ShieldCheck } from 'lucide-react';

type FilingStatus = 'SINGLE' | 'MFJ' | 'HEAD_OF_HOUSEHOLD';

// 2025 Tax Brackets (IRS Rev. Proc. 24-40)
const TAX_BRACKETS_2025 = {
  SINGLE: [
    { limit: 11925, rate: 0.10 },
    { limit: 48475, rate: 0.12 },
    { limit: 103350, rate: 0.22 },
    { limit: 197300, rate: 0.24 },
    { limit: 250525, rate: 0.32 },
    { limit: 626350, rate: 0.35 },
    { limit: Infinity, rate: 0.37 },
  ],
  MFJ: [
    { limit: 23850, rate: 0.10 },
    { limit: 96950, rate: 0.12 },
    { limit: 206700, rate: 0.22 },
    { limit: 394600, rate: 0.24 },
    { limit: 501050, rate: 0.32 },
    { limit: 751600, rate: 0.35 },
    { limit: Infinity, rate: 0.37 },
  ],
  HEAD_OF_HOUSEHOLD: [
    { limit: 17000, rate: 0.10 },
    { limit: 64850, rate: 0.12 },
    { limit: 103350, rate: 0.22 },
    { limit: 197300, rate: 0.24 },
    { limit: 250500, rate: 0.32 },
    { limit: 626350, rate: 0.35 },
    { limit: Infinity, rate: 0.37 },
  ]
};

// 2025 Long Term Capital Gains Brackets (Preferential Treatment)
const LTCG_BRACKETS_2025 = {
  SINGLE: [
    { limit: 53350, rate: 0.0 },
    { limit: 533400, rate: 0.15 },
    { limit: Infinity, rate: 0.20 }
  ],
  MFJ: [
    { limit: 106700, rate: 0.0 },
    { limit: 600050, rate: 0.15 },
    { limit: Infinity, rate: 0.20 }
  ],
  HEAD_OF_HOUSEHOLD: [
    { limit: 71450, rate: 0.0 },
    { limit: 566700, rate: 0.15 },
    { limit: Infinity, rate: 0.20 }
  ]
};

const STANDARD_DEDUCTION_2025 = {
  SINGLE: 15750,
  MFJ: 31500,
  HEAD_OF_HOUSEHOLD: 23625,
};

interface FormState {
  filingStatus: FilingStatus;
  w2Income: number;
  interestIncome: number;
  dividendIncome: number;
  bizRevenue: number;
  bizAdvertising: number;
  bizSalary: number;
  bizTravelMeals: number;
  bizRent: number;
  bizUtilities: number;
  bizOffice: number;
  bizRepairs: number;
  bizDepreciation: number;
  bizOther: number;
  rentReceived: number;
  rentMortgage: number;
  rentInsurance: number;
  rentDepreciation: number;
  rentRepairs: number;
  rentOther: number;
  shortTermCapitalGains: number;
  longTermCapitalGains: number;
  iraDistribution: number;
  deductionType: 'STANDARD' | 'ITEMIZED';
  itemizedMortgage: number;
  itemizedSALT: number;
  itemizedDonations: number;
  itemizedOther: number;
  adjustments: number;
  childCredits: number;
}

const initialState: FormState = {
  filingStatus: 'SINGLE',
  w2Income: 0,
  interestIncome: 0,
  dividendIncome: 0,
  bizRevenue: 0,
  bizAdvertising: 0,
  bizSalary: 0,
  bizTravelMeals: 0,
  bizRent: 0,
  bizUtilities: 0,
  bizOffice: 0,
  bizRepairs: 0,
  bizDepreciation: 0,
  bizOther: 0,
  rentReceived: 0,
  rentMortgage: 0,
  rentInsurance: 0,
  rentDepreciation: 0,
  rentRepairs: 0,
  rentOther: 0,
  shortTermCapitalGains: 0,
  longTermCapitalGains: 0,
  iraDistribution: 0,
  deductionType: 'STANDARD',
  itemizedMortgage: 0,
  itemizedSALT: 0,
  itemizedDonations: 0,
  itemizedOther: 0,
  adjustments: 0,
  childCredits: 0
};

interface CalculationResult {
  totalIncome: number;
  agi: number;
  deductionAmount: number;
  taxableIncome: number;
  ordinaryTax: number;
  ltcgTax: number;
  totalTax: number;
  effectiveRate: number;
  marginalRate: number;
  saltCap: number;
}

interface TaxCalculatorProps {
  onSchedule?: () => void;
}

const TaxCalculator: React.FC<TaxCalculatorProps> = ({ onSchedule }) => {
  const [form, setForm] = useState<FormState>(initialState);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateTax = () => {
    const netBusinessIncome = form.bizRevenue - (form.bizAdvertising + form.bizSalary + form.bizTravelMeals + form.bizRent + form.bizUtilities + form.bizOffice + form.bizRepairs + form.bizDepreciation + form.bizOther);
    const netRentalIncome = form.rentReceived - (form.rentMortgage + form.rentInsurance + form.rentDepreciation + form.rentRepairs + form.rentOther);
    
    const totalIncome = form.w2Income + form.interestIncome + form.dividendIncome + netBusinessIncome + netRentalIncome + form.shortTermCapitalGains + form.longTermCapitalGains + form.iraDistribution;
    const agi = Math.max(0, totalIncome - form.adjustments);

    const initialSaltCap = (form.filingStatus === 'MFJ' || form.filingStatus === 'HEAD_OF_HOUSEHOLD') ? 40000 : 20000;
    const phaseOutStart = (form.filingStatus === 'MFJ' || form.filingStatus === 'HEAD_OF_HOUSEHOLD') ? 500000 : 250000;
    
    let currentSaltCap = initialSaltCap;
    if (totalIncome > phaseOutStart) {
      const excess = totalIncome - phaseOutStart;
      const reduction = excess * 0.30;
      currentSaltCap = Math.max(10000, initialSaltCap - reduction);
    }

    let deductionAmount = 0;
    if (form.deductionType === 'STANDARD') {
      deductionAmount = STANDARD_DEDUCTION_2025[form.filingStatus];
    } else {
      const allowedSALT = Math.min(form.itemizedSALT, currentSaltCap);
      deductionAmount = form.itemizedMortgage + allowedSALT + form.itemizedDonations + form.itemizedOther;
    }

    const taxableIncome = Math.max(0, agi - deductionAmount);
    // Preferential Treatment: Separate ordinary vs capital gains
    const ordinaryTaxable = Math.max(0, taxableIncome - form.longTermCapitalGains);
    const ltcgTaxable = form.longTermCapitalGains;

    // 1. Calculate Ordinary Tax
    let ordinaryTax = 0;
    let previousLimit = 0;
    let marginalRate = 0;
    const brackets = TAX_BRACKETS_2025[form.filingStatus];
    for (const bracket of brackets) {
      if (ordinaryTaxable > previousLimit) {
        const taxableInBracket = Math.min(ordinaryTaxable, bracket.limit) - previousLimit;
        ordinaryTax += taxableInBracket * bracket.rate;
        marginalRate = bracket.rate;
        previousLimit = bracket.limit;
      }
    }

    // 2. Calculate Capital Gains Tax (Preferential Stacking)
    let ltcgTax = 0;
    const ltcgBrackets = LTCG_BRACKETS_2025[form.filingStatus];
    const stackStart = ordinaryTaxable;
    const stackEnd = taxableIncome;
    
    if (ltcgTaxable > 0 && stackEnd > stackStart) {
      let prevLtcgLimit = 0;
      for (const bracket of ltcgBrackets) {
        const start = Math.max(stackStart, prevLtcgLimit);
        const end = Math.min(stackEnd, bracket.limit);
        if (end > start) ltcgTax += (end - start) * bracket.rate;
        prevLtcgLimit = bracket.limit;
      }
    }

    const totalTaxBeforeCredits = ordinaryTax + ltcgTax;
    const finalTax = Math.max(0, totalTaxBeforeCredits - (form.childCredits * 2000));

    setResult({
      totalIncome,
      agi,
      deductionAmount,
      taxableIncome,
      ordinaryTax,
      ltcgTax,
      totalTax: finalTax,
      effectiveRate: totalIncome > 0 ? (finalTax / totalIncome) * 100 : 0,
      marginalRate: marginalRate * 100,
      saltCap: currentSaltCap
    });
  };

  useEffect(() => { calculateTax(); }, [form]);

  const handleInputChange = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const InputField = ({ label, field, icon: Icon }: { label: string, field: keyof FormState, icon?: any }) => (
    <div className="relative">
      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center">
        {Icon && <Icon className="w-3 h-3 mr-1" />}
        {label}
      </label>
      <div className="relative group">
        <span className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-brand-600 transition-colors">$</span>
        <input 
          type="number" 
          value={form[field] || ''} 
          onChange={(e) => handleInputChange(field, e.target.value)} 
          className="w-full border-gray-200 rounded-lg py-2 pl-7 pr-3 border focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all text-sm font-medium" 
          placeholder="0.00" 
        />
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="bg-brand-900 py-16 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Calculator className="w-96 h-96 -bottom-20 -right-20 absolute" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-black tracking-tight mb-2">2025 Tax Estimator</h1>
          <p className="text-brand-200 text-lg">Detailed Federal liability modeling with full Capital Gains preferential treatment.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Input Form */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Filing Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="mr-3 text-brand-600" /> 1. Filing Status
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'SINGLE', label: 'Single' },
                  { id: 'MFJ', label: 'Married Filing Joint' },
                  { id: 'HEAD_OF_HOUSEHOLD', label: 'Head of Household' }
                ].map((status) => (
                  <button
                    key={status.id}
                    onClick={() => setForm(prev => ({ ...prev, filingStatus: status.id as FilingStatus }))}
                    className={`py-4 px-6 rounded-xl text-sm font-bold border-2 transition-all ${
                      form.filingStatus === status.id ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Income Sections */}
            <div className="space-y-6">
              
              {/* Basic Income */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center"><Landmark className="mr-2 text-brand-600" /> Basic Income & Interest</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Gross W-2 Wages" field="w2Income" />
                  <InputField label="Taxable Interest" field="interestIncome" />
                  <InputField label="Ordinary Dividends" field="dividendIncome" />
                  <InputField label="Retirement Distributions" field="iraDistribution" />
                </div>
              </div>

              {/* Capital Gains (Explicit Preferential) */}
              <div className="bg-white rounded-2xl shadow-sm border border-brand-100 p-8 bg-brand-50/20">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-brand-900 flex items-center"><TrendingUp className="mr-2 text-brand-600" /> Investment Gains</h3>
                  <span className="text-[10px] bg-brand-600 text-white px-2 py-1 rounded font-bold uppercase tracking-widest">Preferential Rates Apply</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Short-Term Capital Gains" field="shortTermCapitalGains" />
                  <div>
                    <InputField label="Long-Term Capital Gains" field="longTermCapitalGains" />
                    <p className="text-[10px] text-brand-600 mt-2 italic">LTCG are stacked above ordinary income and taxed at 0%, 15%, or 20%.</p>
                  </div>
                </div>
              </div>

              {/* Business Schedule C */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center"><Briefcase className="mr-2 text-brand-600" /> Business (Schedule C)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField label="Gross Revenue" field="bizRevenue" />
                  <InputField label="Contract Wages" field="bizSalary" />
                  <InputField label="Rent & Utilities" field="bizRent" />
                  <InputField label="Advertising" field="bizAdvertising" />
                  <InputField label="Depreciation" field="bizDepreciation" />
                  <InputField label="Other Expenses" field="bizOther" />
                </div>
              </div>

              {/* Rental Schedule E */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center"><Home className="mr-2 text-brand-600" /> Rental Property (Schedule E)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField label="Rents Received" field="rentReceived" />
                  <InputField label="Mortgage Interest" field="rentMortgage" />
                  <InputField label="Insurance" field="rentInsurance" />
                  <InputField label="Repairs" field="rentRepairs" />
                  <InputField label="Depreciation" field="rentDepreciation" />
                  <InputField label="Other Expenses" field="rentOther" />
                </div>
              </div>

              {/* Deductions & Credits */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center"><Receipt className="mr-2 text-brand-600" /> Deductions & Credits</h3>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                      <button onClick={() => setForm(p => ({...p, deductionType: 'STANDARD'}))} className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${form.deductionType === 'STANDARD' ? 'bg-white shadow-sm text-brand-900' : 'text-gray-500'}`}>Standard</button>
                      <button onClick={() => setForm(p => ({...p, deductionType: 'ITEMIZED'}))} className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${form.deductionType === 'ITEMIZED' ? 'bg-white shadow-sm text-brand-900' : 'text-gray-500'}`}>Itemized</button>
                    </div>
                 </div>
                 
                 {form.deductionType === 'ITEMIZED' ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                      <InputField label="Mortgage Interest" field="itemizedMortgage" />
                      <div>
                        <InputField label="SALT (State & Local)" field="itemizedSALT" />
                        <p className="text-[10px] text-blue-600 mt-2 font-bold uppercase tracking-tighter">Cap applied: ${result?.saltCap.toLocaleString()}</p>
                      </div>
                      <InputField label="Charitable Donations" field="itemizedDonations" />
                      <InputField label="Other Itemized" field="itemizedOther" />
                   </div>
                 ) : (
                   <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300 text-center">
                     <p className="text-gray-600 font-medium">Using the 2025 Standard Deduction for your status:</p>
                     <p className="text-2xl font-black text-brand-900 mt-1">${STANDARD_DEDUCTION_2025[form.filingStatus].toLocaleString()}</p>
                   </div>
                 )}

                 <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="# Child Tax Credits" field="childCredits" icon={Users} />
                    <InputField label="Adjustments to Income" field="adjustments" icon={ShieldCheck} />
                 </div>
              </div>
            </div>
          </div>

          {/* Sticky Results Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sticky top-24 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-500 to-accent-500"></div>
              
              <h3 className="text-xl font-black text-gray-900 mb-6">Result Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-500 font-medium">
                  <span>Gross Income</span>
                  <span className="text-gray-900">${result?.totalIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 font-medium">
                  <span>Taxable Income</span>
                  <span className="text-gray-900">${result?.taxableIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600 font-bold">
                  <span>Total Deductions</span>
                  <span>-${result?.deductionAmount.toLocaleString()}</span>
                </div>

                <div className="my-8 space-y-3 py-6 border-y border-gray-50">
                  <div className="flex justify-between items-end">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ordinary Income Tax</div>
                    <div className="text-lg font-bold text-gray-700">${result?.ordinaryTax.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Capital Gains Tax</div>
                    <div className="text-lg font-bold text-brand-600">${result?.ltcgTax.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                  </div>
                  <div className="pt-4">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Estimated 2025 Federal Tax</div>
                    <div className="text-5xl font-black text-brand-900 tracking-tighter">${result?.totalTax.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="bg-brand-50 rounded-xl p-3 text-center border border-brand-100">
                    <div className="text-[10px] uppercase font-bold text-brand-600">Effective Rate</div>
                    <div className="text-lg font-black text-brand-900">{result?.effectiveRate.toFixed(1)}%</div>
                  </div>
                  <div className="bg-accent-50 rounded-xl p-3 text-center border border-accent-100">
                    <div className="text-[10px] uppercase font-bold text-accent-600">Marginal Bracket</div>
                    <div className="text-lg font-black text-accent-600">{result?.marginalRate.toFixed(0)}%</div>
                  </div>
                </div>
                
                <button 
                  onClick={onSchedule}
                  className="w-full bg-brand-900 hover:bg-brand-800 text-white font-black py-4 rounded-xl shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-5 h-5" />
                  <span>SCHEDULE CPA REVIEW</span>
                </button>

                <div className="mt-8 space-y-4">
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-[10px] text-amber-800 leading-relaxed italic flex">
                    <Info className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                    <p>Includes SALT phase-out calculations for high earners and 2025 revenue procedures. Preferential 0/15/20% rates applied to Long-Term Capital Gains based on stacking logic.</p>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Notice</h4>
                    <p className="text-[10px] text-gray-400 leading-relaxed italic">
                      This model is for strategic planning only. Final liabilities depend on IRS forms and unique taxpayer characteristics. Consultation is required for filing accuracy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxCalculator;