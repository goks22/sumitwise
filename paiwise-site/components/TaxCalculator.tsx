import React, { useState, useEffect, useCallback } from 'react';
import { Calculator, Info, Calendar, TrendingUp, Home, Briefcase, Landmark, Users, Receipt, ShieldCheck, DollarSign } from 'lucide-react';

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
  ordinaryTax: number;
  ltcgTax: number;
  totalTax: number;
  effectiveRate: number;
  marginalRate: number;
  saltCap: number;
}

// InputField moved outside of TaxCalculator to prevent focus loss issues
const InputField = React.memo(({ 
  label, 
  field, 
  value, 
  onChange, 
  icon: Icon 
}: { 
  label: string; 
  field: keyof FormState; 
  value: string; 
  onChange: (field: keyof FormState, value: string) => void;
  icon?: any;
}) => (
  <div className="relative">
    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center">
      {Icon && <Icon className="w-3.5 h-3.5 mr-1.5 text-brand-500" />}
      {label}
    </label>
    <div className="relative group">
      <span className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-brand-600 transition-colors font-semibold">$</span>
      <input 
        type="text" 
        inputMode="decimal"
        value={value} 
        onChange={(e) => onChange(field, e.target.value)} 
        className="w-full border-2 border-gray-100 rounded-xl py-2.5 pl-7 pr-3 focus:ring-0 focus:border-brand-500 outline-none transition-all text-sm font-semibold text-gray-800" 
        placeholder="0.00" 
      />
    </div>
  </div>
));

interface TaxCalculatorProps {
  onSchedule?: () => void;
}

const TaxCalculator: React.FC<TaxCalculatorProps> = ({ onSchedule }) => {
  const [form, setForm] = useState<FormState>(initialState);
  const [inputStrings, setInputStrings] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateTax = useCallback(() => {
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
    const ordinaryTaxable = Math.max(0, taxableIncome - form.longTermCapitalGains);
    const ltcgTaxable = form.longTermCapitalGains;

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
  }, [form]);

  useEffect(() => { calculateTax(); }, [calculateTax]);

  const handleInputChange = (field: keyof FormState, value: string) => {
    // Only allow numbers and one decimal point
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    const parts = sanitizedValue.split('.');
    const cleanValue = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : sanitizedValue;
    
    setInputStrings(prev => ({ ...prev, [field]: cleanValue }));
    setForm(prev => ({ ...prev, [field]: parseFloat(cleanValue) || 0 }));
  };

  const getInputValue = (field: keyof FormState) => {
    if (inputStrings[field] !== undefined) return inputStrings[field];
    return form[field] === 0 ? '' : form[field].toString();
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="bg-brand-900 py-20 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Calculator className="w-96 h-96 -bottom-20 -right-20 absolute rotate-12" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Strategic Tax Estimator</h1>
          <p className="text-brand-200 text-lg max-w-2xl mx-auto">
            Input your 2025 financial profile below for a detailed liability breakdown. 
            All capital gains are processed with preferential stacking logic.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-10">
            {/* Filing Status */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center">
                <Users className="mr-3 text-brand-600" /> 1. Personal Profile & Filing Status
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { id: 'SINGLE', label: 'Single' },
                  { id: 'MFJ', label: 'Married (Joint)' },
                  { id: 'HEAD_OF_HOUSEHOLD', label: 'Head of Household' }
                ].map((status) => (
                  <button
                    key={status.id}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, filingStatus: status.id as FilingStatus }))}
                    className={`py-5 px-6 rounded-2xl text-sm font-black border-2 transition-all duration-200 ${
                      form.filingStatus === status.id 
                        ? 'border-brand-500 bg-brand-50 text-brand-900 shadow-md ring-4 ring-brand-100' 
                        : 'border-gray-50 bg-gray-50/50 text-gray-500 hover:bg-white hover:border-gray-200'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Comprehensive Income Entry */}
            <div className="space-y-8">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center"><Landmark className="mr-3 text-brand-600" /> Income & Basic Earnings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputField label="Gross W-2 Wages" field="w2Income" value={getInputValue('w2Income')} onChange={handleInputChange} icon={DollarSign} />
                  <InputField label="Taxable Interest" field="interestIncome" value={getInputValue('interestIncome')} onChange={handleInputChange} icon={Landmark} />
                  <InputField label="Ordinary Dividends" field="dividendIncome" value={getInputValue('dividendIncome')} onChange={handleInputChange} icon={TrendingUp} />
                  <InputField label="Retirement Distributions" field="iraDistribution" value={getInputValue('iraDistribution')} onChange={handleInputChange} icon={Receipt} />
                </div>
              </div>

              {/* Capital Gains Module */}
              <div className="bg-brand-900 text-white rounded-3xl shadow-2xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4">
                  <span className="text-[10px] bg-accent-500 text-white px-3 py-1.5 rounded-full font-black uppercase tracking-widest shadow-lg">Strategy Focus</span>
                </div>
                <h3 className="text-xl font-bold mb-8 flex items-center text-brand-100"><TrendingUp className="mr-3 text-accent-500" /> Investment Capital Gains</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10 group-hover:border-accent-500/50 transition-colors">
                    <InputField label="Short-Term Gains" field="shortTermCapitalGains" value={getInputValue('shortTermCapitalGains')} onChange={handleInputChange} />
                    <p className="text-[10px] text-brand-300 mt-3 font-medium">Taxed at ordinary rates</p>
                  </div>
                  <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10 group-hover:border-accent-500/50 transition-colors">
                    <InputField label="Long-Term Gains" field="longTermCapitalGains" value={getInputValue('longTermCapitalGains')} onChange={handleInputChange} />
                    <p className="text-[10px] text-accent-400 mt-3 font-bold uppercase tracking-widest">Preferential 0/15/20% rates applied</p>
                  </div>
                </div>
              </div>

              {/* Schedule C / Business */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center"><Briefcase className="mr-3 text-brand-600" /> Business (Schedule C)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <InputField label="Gross Revenue" field="bizRevenue" value={getInputValue('bizRevenue')} onChange={handleInputChange} />
                  <InputField label="Contract Wages" field="bizSalary" value={getInputValue('bizSalary')} onChange={handleInputChange} />
                  <InputField label="Rent & Utilities" field="bizRent" value={getInputValue('bizRent')} onChange={handleInputChange} />
                  <InputField label="Marketing" field="bizAdvertising" value={getInputValue('bizAdvertising')} onChange={handleInputChange} />
                  <InputField label="Depreciation" field="bizDepreciation" value={getInputValue('bizDepreciation')} onChange={handleInputChange} />
                  <InputField label="Other Expense" field="bizOther" value={getInputValue('bizOther')} onChange={handleInputChange} />
                </div>
              </div>

              {/* Schedule E / Rental */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center"><Home className="mr-3 text-brand-600" /> Rental Property (Schedule E)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <InputField label="Total Rents" field="rentReceived" value={getInputValue('rentReceived')} onChange={handleInputChange} />
                  <InputField label="Mortgage Int." field="rentMortgage" value={getInputValue('rentMortgage')} onChange={handleInputChange} />
                  <InputField label="Maintenance" field="rentRepairs" value={getInputValue('rentRepairs')} onChange={handleInputChange} />
                  <InputField label="Property Ins." field="rentInsurance" value={getInputValue('rentInsurance')} onChange={handleInputChange} />
                  <InputField label="Depreciation" field="rentDepreciation" value={getInputValue('rentDepreciation')} onChange={handleInputChange} />
                  <InputField label="Supplies/Other" field="rentOther" value={getInputValue('rentOther')} onChange={handleInputChange} />
                </div>
              </div>

              {/* Deductions & Credits */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center"><Receipt className="mr-3 text-brand-600" /> 2. Deductions & Credits</h3>
                  <div className="bg-gray-100 p-1.5 rounded-2xl flex w-full md:w-auto">
                    <button 
                      type="button"
                      onClick={() => setForm(p => ({...p, deductionType: 'STANDARD'}))} 
                      className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${form.deductionType === 'STANDARD' ? 'bg-white text-brand-900 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Standard
                    </button>
                    <button 
                      type="button"
                      onClick={() => setForm(p => ({...p, deductionType: 'ITEMIZED'}))} 
                      className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${form.deductionType === 'ITEMIZED' ? 'bg-white text-brand-900 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Itemized
                    </button>
                  </div>
                </div>

                {form.deductionType === 'ITEMIZED' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in mb-10">
                    <InputField label="Mortgage Interest" field="itemizedMortgage" value={getInputValue('itemizedMortgage')} onChange={handleInputChange} />
                    <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                      <InputField label="SALT (Taxes Paid)" field="itemizedSALT" value={getInputValue('itemizedSALT')} onChange={handleInputChange} />
                      <div className="mt-3 flex items-center text-[10px] text-blue-700 font-black uppercase tracking-tighter">
                        <Info className="w-3 h-3 mr-1.5 shrink-0" />
                        SALT CAP APPLIED: ${result?.saltCap.toLocaleString()}
                      </div>
                    </div>
                    <InputField label="Donations" field="itemizedDonations" value={getInputValue('itemizedDonations')} onChange={handleInputChange} />
                    <InputField label="Other Items" field="itemizedOther" value={getInputValue('itemizedOther')} onChange={handleInputChange} />
                  </div>
                ) : (
                  <div className="bg-brand-50/50 p-8 rounded-2xl border-2 border-dashed border-brand-200 text-center mb-10">
                    <p className="text-brand-900 font-black text-xs uppercase tracking-widest mb-2 opacity-60">Automatic Deduction Applied</p>
                    <p className="text-3xl font-black text-brand-900">${STANDARD_DEDUCTION_2025[form.filingStatus].toLocaleString()}</p>
                  </div>
                )}

                <div className="pt-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputField label="# Child Tax Credits" field="childCredits" value={getInputValue('childCredits')} onChange={handleInputChange} icon={Users} />
                  <InputField label="Income Adjustments" field="adjustments" value={getInputValue('adjustments')} onChange={handleInputChange} icon={ShieldCheck} />
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Breakdown Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 sticky top-24 overflow-hidden transform transition hover:shadow-brand-100/50">
              <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500"></div>
              
              <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tighter">Tax Summary</h3>
              
              <div className="space-y-5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Gross Income</span>
                  <span className="text-gray-900 font-black">${result?.totalIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Total Deductions</span>
                  <span className="text-green-600 font-black">-${result?.deductionAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm pb-4 border-b border-gray-50">
                  <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Taxable Basis</span>
                  <span className="text-brand-900 font-black">${result?.taxableIncome.toLocaleString()}</span>
                </div>

                <div className="py-6 space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ordinary Layer</div>
                    <div className="text-xl font-bold text-gray-700">${result?.ordinaryTax.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Investment Layer</div>
                    <div className="text-xl font-bold text-brand-600">${result?.ltcgTax.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                  </div>
                  <div className="pt-6 mt-6 border-t border-gray-100">
                    <div className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2">Estimated 2025 Liability</div>
                    <div className="text-6xl font-black text-brand-900 tracking-tighter">${result?.totalTax.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 my-8">
                  <div className="bg-brand-900 text-white rounded-2xl p-4 text-center">
                    <div className="text-[9px] uppercase font-black tracking-widest opacity-60 mb-1">Effective</div>
                    <div className="text-xl font-black">{result?.effectiveRate.toFixed(1)}%</div>
                  </div>
                  <div className="bg-accent-500 text-white rounded-2xl p-4 text-center shadow-lg shadow-accent-500/20">
                    <div className="text-[9px] uppercase font-black tracking-widest opacity-60 mb-1">Marginal</div>
                    <div className="text-xl font-black">{result?.marginalRate.toFixed(0)}%</div>
                  </div>
                </div>
                
                <button 
                  type="button"
                  onClick={onSchedule}
                  className="w-full bg-brand-900 hover:bg-brand-800 text-white font-black py-5 rounded-2xl shadow-xl shadow-brand-900/20 transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center space-x-3"
                >
                  <Calendar className="w-6 h-6 text-accent-500" />
                  <span className="tracking-tight text-lg">SCHEDULE CPA REVIEW</span>
                </button>

                <div className="mt-10 space-y-6">
                  <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 text-[11px] text-amber-800 leading-relaxed font-medium italic flex">
                    <Info className="w-5 h-5 mr-3 shrink-0 mt-0.5 text-amber-500" />
                    <p>Includes dynamic SALT phase-outs and 2025 IRS stacking rules. This model utilizes preferential rates for LTCG based on your specific income layer.</p>
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Notice & Disclaimer</h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed italic">
                      This calculation is a projection for planning purposes. It does not replace formal tax advice or the actual filing process. Laws vary by state and individual characterization.
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
