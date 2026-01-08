import React, { useState, useEffect } from 'react';
import { Calculator, CheckSquare, Info, Home, Building } from 'lucide-react';

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
  
  // Business (Sch C)
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

  // Rental (Sch E)
  rentReceived: number;
  rentMortgage: number;
  rentInsurance: number;
  rentDepreciation: number;
  rentRepairs: number;
  rentOther: number;

  shortTermCapitalGains: number;
  longTermCapitalGains: number;
  iraDistribution: number;
  
  // Deductions
  deductionType: 'STANDARD' | 'ITEMIZED';
  itemizedMortgage: number;
  itemizedSALT: number; // State and Local Taxes
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
  netBusinessIncome: number;
  netRentalIncome: number;
  agi: number;
  deductionAmount: number;
  taxableIncome: number;
  estimatedTax: number;
  effectiveRate: number;
  marginalRate: number;
}

const TaxCalculator: React.FC = () => {
  const [form, setForm] = useState<FormState>(initialState);
  const [activeSections, setActiveSections] = useState<Record<string, boolean>>({
    wages: true,
    interest: false,
    business: false,
    rental: false,
    investments: false,
    retirement: false,
    deductions: true, // Always show to allow switching
    credits: false
  });
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateTax = () => {
    // Calculate Net Business Income
    const netBusinessIncome = form.bizRevenue - (
      form.bizAdvertising + 
      form.bizSalary +
      form.bizTravelMeals +
      form.bizRent +
      form.bizUtilities +
      form.bizOffice + 
      form.bizRepairs + 
      form.bizDepreciation + 
      form.bizOther
    );

    // Calculate Net Rental Income
    const netRentalIncome = form.rentReceived - (
      form.rentMortgage + 
      form.rentInsurance + 
      form.rentDepreciation + 
      form.rentRepairs + 
      form.rentOther
    );

    const totalIncome = 
      form.w2Income + 
      form.interestIncome + 
      form.dividendIncome + 
      netBusinessIncome + 
      netRentalIncome +
      form.shortTermCapitalGains + 
      form.longTermCapitalGains +
      form.iraDistribution;

    const agi = Math.max(0, totalIncome - form.adjustments);

    let deductionAmount = 0;
    if (form.deductionType === 'STANDARD') {
      deductionAmount = STANDARD_DEDUCTION_2025[form.filingStatus];
    } else {
      // SALT Cap logic ($10,000 limit)
      const allowedSALT = Math.min(form.itemizedSALT, 10000);
      deductionAmount = 
        form.itemizedMortgage + 
        allowedSALT + 
        form.itemizedDonations + 
        form.itemizedOther;
    }

    const taxableIncome = Math.max(0, agi - deductionAmount);

    // Determine how much is "Ordinary Taxable Income" vs "LTCG Taxable Income"
    // Deductions reduce Ordinary Income first.
    // If Deductions > Ordinary Income, the overflow reduces LTCG.
    
    // Ordinary Income (everything except Long Term CG)
    const ordinaryIncomePreDeduction = Math.max(0, totalIncome - form.longTermCapitalGains);
    
    let taxableOrdinaryIncome = 0;
    // let taxableLTCG = 0; // Not explicitly stored, handled in logic below, but useful for understanding

    if (deductionAmount >= ordinaryIncomePreDeduction) {
      // Deductions wipe out all ordinary income
      taxableOrdinaryIncome = 0;
      // taxableLTCG = Math.max(0, taxableIncome); // The remaining taxable income is all LTCG
    } else {
      // Deductions only reduce ordinary income
      taxableOrdinaryIncome = taxableIncome - form.longTermCapitalGains;
      // taxableLTCG = form.longTermCapitalGains;
    }

    // 1. Calculate Tax on Ordinary Income
    let tax = 0;
    let previousLimit = 0;
    let marginalRate = 0;
    const brackets = TAX_BRACKETS_2025[form.filingStatus];

    for (const bracket of brackets) {
      if (taxableOrdinaryIncome > previousLimit) {
        const taxableInBracket = Math.min(taxableOrdinaryIncome, bracket.limit) - previousLimit;
        tax += taxableInBracket * bracket.rate;
        marginalRate = bracket.rate;
        previousLimit = bracket.limit;
      } else {
        break;
      }
    }

    // 2. Calculate Tax on Long Term Capital Gains
    // LTCG sits "on top" of ordinary taxable income for bracket purposes.
    // We iterate through LTCG brackets, checking the range [Start, End] where:
    // Start = taxableOrdinaryIncome
    // End = taxableIncome (which is Ordinary + LTCG)
    
    const ltcgBrackets = LTCG_BRACKETS_2025[form.filingStatus];
    const stackStart = taxableOrdinaryIncome;
    const stackEnd = taxableIncome;
    
    if (stackEnd > stackStart) {
        let previousLtcgLimit = 0;
        for (const bracket of ltcgBrackets) {
             // Find overlap between [stackStart, stackEnd] and [previousLtcgLimit, bracket.limit]
             const overlapStart = Math.max(stackStart, previousLtcgLimit);
             const overlapEnd = Math.min(stackEnd, bracket.limit);
             
             if (overlapEnd > overlapStart) {
                 const amountInBracket = overlapEnd - overlapStart;
                 tax += amountInBracket * bracket.rate;
             }
             previousLtcgLimit = bracket.limit;
        }
    }

    // Simplified Child Tax Credit (Assuming $2000/child for 2025 for estimation)
    const creditAmount = form.childCredits * 2000;
    tax = Math.max(0, tax - creditAmount);

    setResult({
      totalIncome,
      netBusinessIncome,
      netRentalIncome,
      agi,
      deductionAmount,
      taxableIncome,
      estimatedTax: tax,
      effectiveRate: totalIncome > 0 ? (tax / totalIncome) * 100 : 0,
      marginalRate: marginalRate * 100
    });
  };

  useEffect(() => {
    calculateTax();
  }, [form]);

  const handleInputChange = (field: keyof FormState, value: string | number) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleSection = (section: string) => {
    setActiveSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="bg-brand-900 py-12 text-center text-white">
        <h1 className="text-3xl font-extrabold flex justify-center items-center">
          <Calculator className="mr-3 h-8 w-8 text-accent-500" />
          2025 Tax Estimator
        </h1>
        <p className="mt-2 text-brand-100">Estimate your federal tax liability for the 2025 tax season.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls & Inputs */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Filing Status */}
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
                    onClick={() => handleInputChange('filingStatus', status.id)}
                    className={`py-3 px-4 rounded-lg text-sm font-medium border-2 transition-all ${
                      form.filingStatus === status.id
                        ? 'border-accent-500 bg-accent-50 text-accent-700'
                        : 'border-gray-200 hover:border-brand-300 text-gray-600'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Select 1040 Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-lg font-bold text-gray-900">2. Select 1040 Items</h2>
                 <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Check all that apply</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                 {[
                   { key: 'wages', label: 'W-2 Wages' },
                   { key: 'interest', label: 'Interest & Dividends' },
                   { key: 'business', label: 'Business Income (Sch C)' },
                   { key: 'rental', label: 'Rental Income (Sch E)' },
                   { key: 'investments', label: 'Capital Gains' },
                   { key: 'retirement', label: 'IRA / Pension' },
                   { key: 'deductions', label: 'Deductions (Std/Itemized)' },
                   { key: 'credits', label: 'Tax Credits' },
                 ].map((item) => (
                   <div 
                      key={item.key}
                      onClick={() => toggleSection(item.key)}
                      className={`cursor-pointer p-3 rounded-lg border flex items-center space-x-2 transition-all ${
                        activeSections[item.key] 
                          ? 'bg-brand-50 border-brand-200' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                   >
                     <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                        activeSections[item.key] ? 'bg-brand-500 border-brand-500' : 'border-gray-300'
                     }`}>
                        {activeSections[item.key] && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                     </div>
                     <span className={`text-sm ${activeSections[item.key] ? 'font-medium text-brand-900' : 'text-gray-600'}`}>
                       {item.label}
                     </span>
                   </div>
                 ))}
              </div>
            </div>

            {/* Dynamic Input Sections */}
            <div className="space-y-4">
              
              {activeSections.wages && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in">
                  <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm font-bold">W2</span>
                    Wages & Salaries
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Wages</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          value={form.w2Income || ''}
                          onChange={(e) => handleInputChange('w2Income', parseFloat(e.target.value) || 0)}
                          className="pl-7 block w-full border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 py-2 border px-3"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSections.interest && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in">
                  <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                     <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 text-sm font-bold">B</span>
                     Interest & Dividends
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Taxable Interest</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          value={form.interestIncome || ''}
                          onChange={(e) => handleInputChange('interestIncome', parseFloat(e.target.value) || 0)}
                          className="pl-7 block w-full border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 py-2 border px-3"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ordinary Dividends</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          value={form.dividendIncome || ''}
                          onChange={(e) => handleInputChange('dividendIncome', parseFloat(e.target.value) || 0)}
                          className="pl-7 block w-full border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 py-2 border px-3"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSections.business && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in">
                  <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                     <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-3 text-sm font-bold">C</span>
                     Business Income (Schedule C)
                  </h3>
                  <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-1">Gross Revenue</label>
                        <input
                          type="number"
                          value={form.bizRevenue || ''}
                          onChange={(e) => handleInputChange('bizRevenue', parseFloat(e.target.value) || 0)}
                          className="block w-full border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 py-2 border px-3 bg-gray-50"
                          placeholder="Total Sales/Receipts"
                        />
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Less: Expenses</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { label: 'Advertising', field: 'bizAdvertising' },
                          { label: 'Salary & Wages', field: 'bizSalary' },
                          { label: 'Travel & Meals', field: 'bizTravelMeals' },
                          { label: 'Rent / Lease', field: 'bizRent' },
                          { label: 'Utilities', field: 'bizUtilities' },
                          { label: 'Office Expense', field: 'bizOffice' },
                          { label: 'Repairs & Maint.', field: 'bizRepairs' },
                          { label: 'Depreciation', field: 'bizDepreciation' },
                          { label: 'Other Expenses', field: 'bizOther' },
                        ].map((item) => (
                          <div key={item.field}>
                            <label className="block text-sm text-gray-600 mb-1">{item.label}</label>
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-gray-400 text-xs">$</span>
                              <input
                                type="number"
                                value={form[item.field as keyof FormState] as number || ''}
                                onChange={(e) => handleInputChange(item.field as keyof FormState, parseFloat(e.target.value) || 0)}
                                className="pl-6 block w-full border-gray-300 rounded-md text-sm py-1.5 border"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSections.rental && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in">
                  <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                     <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mr-3 text-sm font-bold">E</span>
                     Rental Real Estate (Schedule E)
                  </h3>
                  <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-1">Rents Received</label>
                        <input
                          type="number"
                          value={form.rentReceived || ''}
                          onChange={(e) => handleInputChange('rentReceived', parseFloat(e.target.value) || 0)}
                          className="block w-full border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 py-2 border px-3 bg-gray-50"
                          placeholder="Total Rents"
                        />
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Less: Expenses</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { label: 'Mortgage Interest', field: 'rentMortgage' },
                          { label: 'Insurance', field: 'rentInsurance' },
                          { label: 'Repairs', field: 'rentRepairs' },
                          { label: 'Depreciation', field: 'rentDepreciation' },
                          { label: 'Other Expenses', field: 'rentOther' },
                        ].map((item) => (
                          <div key={item.field}>
                            <label className="block text-sm text-gray-600 mb-1">{item.label}</label>
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-gray-400 text-xs">$</span>
                              <input
                                type="number"
                                value={form[item.field as keyof FormState] as number || ''}
                                onChange={(e) => handleInputChange(item.field as keyof FormState, parseFloat(e.target.value) || 0)}
                                className="pl-6 block w-full border-gray-300 rounded-md text-sm py-1.5 border"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSections.investments && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in">
                  <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                     <span className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mr-3 text-sm font-bold">D</span>
                     Capital Gains
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Short Term Capital Gains</label>
                      <p className="text-xs text-gray-500 mb-2">Assets held for 1 year or less (Taxed as Ordinary Income)</p>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          value={form.shortTermCapitalGains || ''}
                          onChange={(e) => handleInputChange('shortTermCapitalGains', parseFloat(e.target.value) || 0)}
                          className="pl-7 block w-full border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 py-2 border px-3"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Long Term Capital Gains</label>
                      <p className="text-xs text-gray-500 mb-2">Assets held for more than 1 year (Taxed at 0%, 15%, or 20%)</p>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          value={form.longTermCapitalGains || ''}
                          onChange={(e) => handleInputChange('longTermCapitalGains', parseFloat(e.target.value) || 0)}
                          className="pl-7 block w-full border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 py-2 border px-3"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSections.retirement && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in">
                  <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                     <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-3 text-sm font-bold">R</span>
                     Retirement Income
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Taxable IRA Distributions</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        value={form.iraDistribution || ''}
                        onChange={(e) => handleInputChange('iraDistribution', parseFloat(e.target.value) || 0)}
                        className="pl-7 block w-full border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 py-2 border px-3"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSections.deductions && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in">
                   <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                     <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3 text-sm font-bold">A</span>
                     Deductions
                   </h3>
                   
                   <div className="flex space-x-4 mb-6">
                      <button 
                        onClick={() => handleInputChange('deductionType', 'STANDARD')}
                        className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition ${
                          form.deductionType === 'STANDARD' 
                            ? 'bg-brand-50 border-brand-500 text-brand-700' 
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        Standard Deduction
                      </button>
                      <button 
                         onClick={() => handleInputChange('deductionType', 'ITEMIZED')}
                         className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition ${
                          form.deductionType === 'ITEMIZED' 
                            ? 'bg-brand-50 border-brand-500 text-brand-700' 
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        Itemized Deductions
                      </button>
                   </div>

                   {form.deductionType === 'STANDARD' && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start">
                        <Info className="w-5 h-5 text-blue-500 mr-2 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-blue-800 font-medium">
                            Based on your filing status, your 2025 Standard Deduction is ${STANDARD_DEDUCTION_2025[form.filingStatus].toLocaleString()}.
                          </p>
                          <p className="text-xs text-blue-600 mt-1">This amount will be deducted from your income automatically.</p>
                        </div>
                      </div>
                   )}

                   {form.deductionType === 'ITEMIZED' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Mortgage Interest</label>
                          <input
                            type="number"
                            value={form.itemizedMortgage || ''}
                            onChange={(e) => handleInputChange('itemizedMortgage', parseFloat(e.target.value) || 0)}
                            className="block w-full border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 py-2 border px-3"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Property & Local Taxes (SALT)</label>
                          <input
                            type="number"
                            value={form.itemizedSALT || ''}
                            onChange={(e) => handleInputChange('itemizedSALT', parseFloat(e.target.value) || 0)}
                            className="block w-full border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 py-2 border px-3"
                          />
                          <p className="text-[10px] text-gray-400 mt-1">Limited to $10,000 max</p>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Charitable Donations</label>
                          <input
                            type="number"
                            value={form.itemizedDonations || ''}
                            onChange={(e) => handleInputChange('itemizedDonations', parseFloat(e.target.value) || 0)}
                            className="block w-full border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 py-2 border px-3"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Other Eligible Deductions</label>
                          <input
                            type="number"
                            value={form.itemizedOther || ''}
                            onChange={(e) => handleInputChange('itemizedOther', parseFloat(e.target.value) || 0)}
                            className="block w-full border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 py-2 border px-3"
                          />
                        </div>
                     </div>
                   )}
                </div>
              )}

              {activeSections.credits && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in">
                   <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                     <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 text-sm font-bold">Cr</span>
                     Credits
                   </h3>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Number of Qualifying Children (Under 17)</label>
                     <input
                        type="number"
                        min="0"
                        max="10"
                        value={form.childCredits || ''}
                        onChange={(e) => handleInputChange('childCredits', parseInt(e.target.value) || 0)}
                        className="block w-full border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500 py-2 border px-3"
                        placeholder="0"
                     />
                     <p className="text-xs text-gray-500 mt-1">Estimating $2,000 credit per child.</p>
                   </div>
                </div>
              )}

            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">Estimated Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Total Gross Income</span>
                  <span className="font-medium text-gray-900">${result?.totalIncome.toLocaleString()}</span>
                </div>
                
                {result?.netBusinessIncome !== 0 && (
                   <div className="flex justify-between items-center text-xs text-gray-500 pl-2 border-l-2 border-purple-200">
                     <span>Net Business Income</span>
                     <span>${result?.netBusinessIncome.toLocaleString()}</span>
                   </div>
                )}

                {result?.netRentalIncome !== 0 && (
                   <div className="flex justify-between items-center text-xs text-gray-500 pl-2 border-l-2 border-teal-200">
                     <span>Net Rental Income</span>
                     <span>${result?.netRentalIncome.toLocaleString()}</span>
                   </div>
                )}
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Deductions</span>
                  <span className="font-medium text-green-600">-${result?.deductionAmount.toLocaleString()}</span>
                </div>
                
                <div className="border-t border-gray-100 my-2 pt-2 flex justify-between items-center text-sm font-medium">
                  <span className="text-gray-900">Taxable Income</span>
                  <span>${result?.taxableIncome.toLocaleString()}</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mt-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Estimated 2025 Tax</div>
                  <div className="text-3xl font-extrabold text-brand-900">
                    ${result?.estimatedTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                     <span>Effective Rate: {result?.effectiveRate.toFixed(1)}%</span>
                     <span>Marginal Rate: {result?.marginalRate.toFixed(0)}%</span>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-lg p-4 mt-6 border border-amber-100 text-xs text-amber-800 leading-relaxed">
                  <p className="flex items-start font-medium">
                    <Info className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                    Disclaimer
                  </p>
                  <p className="mt-2">
                    This calculator is for information purposes only. The 2025 tax projections used here are estimates. Please contact us for correct calculations, specific deductions, and credits to get your accurate taxes or refunds.
                  </p>
                </div>

                <button className="w-full mt-2 bg-accent-500 hover:bg-accent-600 text-white font-bold py-3 px-4 rounded-lg shadow transition transform active:scale-95">
                  Schedule Review with CPA
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TaxCalculator;