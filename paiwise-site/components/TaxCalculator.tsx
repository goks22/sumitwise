import React, { useState, useEffect } from 'react';
import { Calculator, CheckSquare, Info, Calendar } from 'lucide-react';

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

// 2025 Long Term Capital Gains Brackets
const LTCG_BRACKETS_2025 = {
  SINGLE: [
    { limit: 48350, rate: 0.0 },
    { limit: 533400, rate: 0.15 },
    { limit: Infinity, rate: 0.20 }
  ],
  MFJ: [
    { limit: 96700, rate: 0.0 },
    { limit: 600050, rate: 0.15 },
    { limit: Infinity, rate: 0.20 }
  ],
  HEAD_OF_HOUSEHOLD: [
    { limit: 64750, rate: 0.0 },
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
  estimatedTax: number;
  effectiveRate: number;
  marginalRate: number;
  saltCap: number;
}

interface TaxCalculatorProps {
  onSchedule?: () => void;
}

const TaxCalculator: React.FC<TaxCalculatorProps> = ({ onSchedule }) => {
  const [form, setForm] = useState<FormState>(initialState);
  const [activeSections, setActiveSections] = useState<Record<string, boolean>>({
    wages: true,
    deductions: true
  });
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
    const ordinaryIncome = taxableIncome - form.longTermCapitalGains;

    let tax = 0;
    let previousLimit = 0;
    let marginalRate = 0;
    const brackets = TAX_BRACKETS_2025[form.filingStatus];
    for (const bracket of brackets) {
      if (ordinaryIncome > previousLimit) {
        const taxableInBracket = Math.min(ordinaryIncome, bracket.limit) - previousLimit;
        tax += taxableInBracket * bracket.rate;
        marginalRate = bracket.rate;
        previousLimit = bracket.limit;
      }
    }

    const ltcgBrackets = LTCG_BRACKETS_2025[form.filingStatus];
    const stackStart = Math.max(0, ordinaryIncome);
    const stackEnd = taxableIncome;
    if (stackEnd > stackStart) {
      let prevLtcgLimit = 0;
      for (const bracket of ltcgBrackets) {
        const start = Math.max(stackStart, prevLtcgLimit);
        const end = Math.min(stackEnd, bracket.limit);
        if (end > start) tax += (end - start) * bracket.rate;
        prevLtcgLimit = bracket.limit;
      }
    }

    tax = Math.max(0, tax - (form.childCredits * 2000));

    setResult({
      totalIncome,
      agi,
      deductionAmount,
      taxableIncome,
      estimatedTax: tax,
      effectiveRate: totalIncome > 0 ? (tax / totalIncome) * 100 : 0,
      marginalRate: marginalRate * 100,
      saltCap: currentSaltCap
    });
  };

  useEffect(() => { calculateTax(); }, [form]);

  const handleInputChange = (field: keyof FormState, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleSection = (section: string) => {
    setActiveSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="bg-brand-900 py-12 text-center text-white">
        <h1 className="text-3xl font-extrabold flex justify-center items-center">
          <Calculator className="mr-3 h-8 w-8 text-accent-500" />
          2025 Tax Estimator
        </h1>
        <p className="mt-2 text-brand-100">Plan your liabilities with custom Virginia & Federal rules.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">1. Filing Status</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'SINGLE', label: 'Single' },
                  { id: 'MFJ', label: 'Married Filing Jointly' },
                  { id: 'HEAD_OF_HOUSEHOLD', label: 'Head of Household' }
                ].map((status) => (
                  <button
                    key={status.id}
                    onClick={() => handleInputChange('filingStatus', status.id as FilingStatus)}
                    className={`py-3 px-4 rounded-lg text-sm font-medium border-2 transition-all ${
                      form.filingStatus === status.id ? 'border-accent-500 bg-accent-50 text-accent-700' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">2. Income & Deductions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 {['wages', 'interest', 'business', 'rental', 'investments', 'retirement', 'deductions', 'credits'].map((key) => (
                   <div 
                      key={key}
                      onClick={() => toggleSection(key)}
                      className={`cursor-pointer p-3 rounded-lg border flex items-center space-x-2 transition-all ${activeSections[key] ? 'bg-brand-50 border-brand-200' : 'bg-white border-gray-200'}`}
                   >
                     <div className={`w-4 h-4 rounded border flex items-center justify-center ${activeSections[key] ? 'bg-brand-500 border-brand-500' : 'border-gray-300'}`}>
                        {activeSections[key] && <CheckSquare className="w-3 h-3 text-white" />}
                     </div>
                     <span className="text-xs font-medium capitalize">{key}</span>
                   </div>
                 ))}
              </div>
            </div>

            <div className="space-y-4">
              {activeSections.wages && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">W-2 Wages</label>
                  <input type="number" value={form.w2Income || ''} onChange={(e) => handleInputChange('w2Income', parseFloat(e.target.value) || 0)} className="w-full border-gray-300 rounded-md py-2 px-3 border" placeholder="0.00" />
                </div>
              )}

              {activeSections.deductions && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                   <h3 className="text-md font-bold text-gray-800 mb-4">Deduction Method</h3>
                   <div className="flex space-x-4 mb-4">
                      <button onClick={() => handleInputChange('deductionType', 'STANDARD')} className={`flex-1 py-2 rounded-lg border text-sm ${form.deductionType === 'STANDARD' ? 'bg-brand-50 border-brand-500' : 'bg-white'}`}>Standard</button>
                      <button onClick={() => handleInputChange('deductionType', 'ITEMIZED')} className={`flex-1 py-2 rounded-lg border text-sm ${form.deductionType === 'ITEMIZED' ? 'bg-brand-50 border-brand-500' : 'bg-white'}`}>Itemized</button>
                   </div>
                   {form.deductionType === 'ITEMIZED' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase">Mortgage Interest</label>
                          <input type="number" value={form.itemizedMortgage || ''} onChange={(e) => handleInputChange('itemizedMortgage', parseFloat(e.target.value) || 0)} className="w-full border-gray-300 rounded-md py-2 px-3 border mt-1" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase">Property & Local Taxes (SALT)</label>
                          <input type="number" value={form.itemizedSALT || ''} onChange={(e) => handleInputChange('itemizedSALT', parseFloat(e.target.value) || 0)} className="w-full border-gray-300 rounded-md py-2 px-3 border mt-1" />
                          <p className="text-[10px] text-blue-600 mt-1 font-medium italic">Calculated Cap: ${result?.saltCap.toLocaleString()}</p>
                        </div>
                     </div>
                   )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Result Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm"><span>Total Income</span><span className="font-bold">${result?.totalIncome.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span>Deductions</span><span className="text-green-600">-${result?.deductionAmount.toLocaleString()}</span></div>
                <div className="pt-4 border-t">
                  <div className="text-xs text-gray-500 uppercase mb-1">Est. 2025 Federal Tax</div>
                  <div className="text-3xl font-black text-brand-900">${result?.estimatedTax.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                </div>
                
                {/* Restore the Schedule Button */}
                <button 
                  onClick={onSchedule}
                  className="w-full bg-accent-500 hover:bg-accent-600 text-white font-bold py-3 px-4 rounded-lg shadow transition-colors flex items-center justify-center space-x-2 mt-4"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule Review with CPA</span>
                </button>

                <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 mt-4 text-[10px] text-amber-800 flex items-start">
                  <Info className="w-3 h-3 mr-2 shrink-0 mt-0.5" />
                  <p>SALT Deduction cap dynamically adjusted based on Filing Status and Gross Income (Phase-out applied above ${form.filingStatus === 'SINGLE' ? '250k' : '500k'}).</p>
                </div>

                {/* Restore the Disclaimer */}
                <div className="mt-6 border-t pt-4">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Disclaimer</h4>
                  <p className="text-[10px] text-gray-400 leading-relaxed italic">
                    This estimator is for informational purposes only and does not constitute formal tax or legal advice. Tax laws change frequently and individual circumstances vary. Please consult with a qualified CPA for your specific situation.
                  </p>
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