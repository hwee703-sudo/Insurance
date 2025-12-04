import React, { useState, useMemo, useEffect } from 'react';
import { User, DollarSign, ShieldAlert, PieChart, ArrowLeft, RefreshCcw, CheckCircle2, AlertCircle, Wallet, ChevronDown, Calculator, Database, Save, Trash2, FolderOpen, Search, FileText, Download, Share, PlusSquare, MoreVertical, X } from 'lucide-react';
import { FormData, BasicInfo, Liabilities, Expenses, ExistingCoverage, CalculationResult, SavedRecord } from './types';
import { MoneyInput } from './components/MoneyInput';
import { DateInput } from './components/DateInput';
import { SectionCard } from './components/SectionCard';
import { formatCurrency } from './utils/format';
import { generatePDF } from './utils/pdf';

// --- Constants & Types ---

const INITIAL_DATA: FormData = {
  basic: {
    fullName: '',
    contactNumber: '',
    dob: '',
    gender: 'Male',
    annualIncome: 0,
  },
  liabilities: {
    housingLoan: 0,
    carLoan: 0,
    personalLoan: 0,
    creditCard: 0,
    businessLoan: 0,
    studyLoan: 0,
    otherLiabilities: 0,
  },
  expenses: {
    housingInstallment: 0,
    carInstallment: 0,
    creditCardPayment: 0,
    foodGroceries: 0,
    utilities: 0,
    phoneInternet: 0,
    childrenEducation: 0,
    insurancePremium: 0,
    transport: 0,
    parentsAllowance: 0,
    childcare: 0,
    entertainment: 0,
    savings: 0,
    others: 0,
  },
  coverage: {
    lifeTpd: 0,
    criticalIllness: 0,
    ciIncomeReplacementYears: 5,
  },
};

const DB_KEY = 'IGC_DB_RECORDS';

// --- Sub-Component Interfaces ---

interface PdfTemplateProps {
  formData: FormData;
  results: CalculationResult;
}

interface CalculatorViewProps {
  formData: FormData;
  results: CalculationResult;
  showResult: boolean;
  setShowResult: (show: boolean) => void;
  isGeneratingPdf: boolean;
  handleExport: () => void;
  saveToDb: () => void;
  updateBasic: (field: keyof BasicInfo, value: any) => void;
  updateLiability: (field: keyof Liabilities, value: number) => void;
  updateExpense: (field: keyof Expenses, value: number) => void;
  updateCoverage: (field: keyof ExistingCoverage, value: any) => void;
  resetForm: () => void;
  setShowInstallModal: (show: boolean) => void;
}

interface DatabaseViewProps {
  savedRecords: SavedRecord[];
  loadFromDb: (record: SavedRecord) => void;
  deleteFromDb: (id: string, e: React.MouseEvent) => void;
}

// --- Sub-Components (Defined OUTSIDE App) ---

const PdfTemplate: React.FC<PdfTemplateProps> = ({ formData, results }) => (
  <div 
      id="pdf-report-template" 
      className="fixed top-0 bg-white overflow-hidden"
      style={{ left: '-10000px', width: '210mm', minHeight: '297mm', padding: '15mm' }} 
  >
      {/* Header Bar */}
      <div className="bg-indigo-600 text-white p-6 -mx-[15mm] -mt-[15mm] mb-6 flex justify-between items-center">
           <div>
               <h1 className="text-2xl font-bold">Financial Gap Analysis</h1>
               <p className="opacity-80 text-sm">Professional Insurance Planning / 专业保险规划报告</p>
           </div>
           <div className="text-right">
               <div className="text-xl font-bold">{formData.basic.fullName || "Valued Client"}</div>
               <div className="text-xs opacity-80">{new Date().toLocaleDateString()}</div>
           </div>
      </div>

      {/* 3 Key Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-xl border-2 ${results.debtShortfall > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
              <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Debt Gap 债务缺口</div>
              <div className={`text-xl font-bold mb-1 ${results.debtShortfall > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(results.debtShortfall)}
              </div>
              <div className="text-[10px] text-slate-400">
                  {results.debtShortfall > 0 ? 'Coverage Insufficient (不足)' : 'Fully Covered (充足)'}
              </div>
          </div>
           <div className={`p-4 rounded-xl border-2 ${results.ciShortfall > 0 ? 'bg-orange-50 border-orange-100' : 'bg-green-50 border-green-100'}`}>
              <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">CI Gap 重疾缺口</div>
              <div className={`text-xl font-bold mb-1 ${results.ciShortfall > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {formatCurrency(results.ciShortfall)}
              </div>
              <div className="text-[10px] text-slate-400">
                  {results.ciShortfall > 0 ? 'Coverage Insufficient (不足)' : 'Fully Covered (充足)'}
              </div>
          </div>
           <div className={`p-4 rounded-xl border-2 ${results.affordability < 0 ? 'bg-red-50 border-red-100' : 'bg-indigo-50 border-indigo-100'}`}>
              <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Monthly Surplus 盈余</div>
              <div className={`text-xl font-bold mb-1 ${results.affordability < 0 ? 'text-red-600' : 'text-indigo-600'}`}>
                  {formatCurrency(results.affordability)}
              </div>
              <div className="text-[10px] text-slate-400">
                  Income - Commitment
              </div>
          </div>
      </div>

      {/* 2-Column Layout for Details */}
      <div className="grid grid-cols-2 gap-6">
          <div className="space-y-6">
              <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-2 border-b pb-1">1. Liabilities (Debts) / 债务明细</h3>
                  <table className="w-full text-xs">
                      <tbody className="divide-y divide-slate-100">
                          {(Object.entries(formData.liabilities) as [string, number][]).map(([k, v]) => v > 0 && (
                              <tr key={k}>
                                  <td className="py-1 text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</td>
                                  <td className="py-1 text-right font-medium">{formatCurrency(v)}</td>
                              </tr>
                          ))}
                          <tr className="bg-slate-50">
                              <td className="py-2 font-bold text-slate-700">Total Liabilities</td>
                              <td className="py-2 text-right font-bold text-slate-700">{formatCurrency(results.totalLiabilities)}</td>
                          </tr>
                      </tbody>
                  </table>
              </div>

              <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-2 border-b pb-1">2. Monthly Expenses / 开销明细</h3>
                  <table className="w-full text-xs">
                      <tbody className="divide-y divide-slate-100">
                          {(Object.entries(formData.expenses) as [string, number][]).map(([k, v]) => v > 0 && (
                              <tr key={k}>
                                  <td className="py-1 text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</td>
                                  <td className="py-1 text-right font-medium">{formatCurrency(v)}</td>
                              </tr>
                          ))}
                          <tr className="bg-slate-50">
                              <td className="py-2 font-bold text-slate-700">Total Commitment</td>
                              <td className="py-2 text-right font-bold text-slate-700">{formatCurrency(results.monthlyCommitment)}</td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </div>

          <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="text-sm font-bold text-indigo-800 mb-3">Debt Protection Analysis</h3>
                  <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                          <span>Total Debt (总债务)</span>
                          <span className="font-semibold">{formatCurrency(results.totalLiabilities)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600">
                          <span>Existing Coverage (现有)</span>
                          <span>- {formatCurrency(formData.coverage.lifeTpd)}</span>
                      </div>
                      <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm">
                          <span>Shortfall (缺口)</span>
                          <span className={results.debtShortfall > 0 ? 'text-red-600' : 'text-slate-400'}>
                              {formatCurrency(results.debtShortfall)}
                          </span>
                      </div>
                  </div>
              </div>

               <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="text-sm font-bold text-indigo-800 mb-3">Critical Illness Analysis</h3>
                  <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                          <span>Monthly Expenses</span>
                          <span>{formatCurrency(results.monthlyCommitment)}</span>
                      </div>
                      <div className="flex justify-between">
                          <span>Years Required (替代年数)</span>
                          <span>x {formData.coverage.ciIncomeReplacementYears} Years</span>
                      </div>
                      <div className="border-t border-slate-200 my-1"></div>
                      <div className="flex justify-between font-semibold">
                          <span>Total Need (总需求)</span>
                          <span>{formatCurrency(results.totalCINeed)}</span>
                      </div>
                       <div className="flex justify-between text-emerald-600">
                          <span>Existing Coverage (现有)</span>
                          <span>- {formatCurrency(formData.coverage.criticalIllness)}</span>
                      </div>
                      <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm">
                          <span>Shortfall (缺口)</span>
                          <span className={results.ciShortfall > 0 ? 'text-red-600' : 'text-slate-400'}>
                              {formatCurrency(results.ciShortfall)}
                          </span>
                      </div>
                  </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="text-sm font-bold text-indigo-800 mb-3">Affordability Analysis</h3>
                  <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                          <span>Est. Monthly Income (月入)</span>
                          <span>{formatCurrency(results.monthlyIncome)}</span>
                      </div>
                       <div className="flex justify-between">
                          <span>Total Commitment (月销)</span>
                          <span>- {formatCurrency(results.monthlyCommitment)}</span>
                      </div>
                       <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm">
                          <span>Net Surplus (净盈余)</span>
                          <span className={results.affordability < 0 ? 'text-red-600' : 'text-emerald-600'}>
                              {formatCurrency(results.affordability)}
                          </span>
                      </div>
                  </div>
              </div>

          </div>
      </div>

      <div className="absolute bottom-[15mm] left-[15mm] right-[15mm] text-center text-[10px] text-slate-400 border-t pt-2">
          This report is generated for reference purposes only. Please consult a professional financial advisor for detailed planning.
      </div>
  </div>
);

const CalculatorView: React.FC<CalculatorViewProps> = ({ 
  formData, results, showResult, setShowResult, 
  isGeneratingPdf, handleExport, saveToDb,
  updateBasic, updateLiability, updateExpense, updateCoverage, resetForm,
  setShowInstallModal
}) => {
  if (showResult) {
      const debtCoveragePercent = Math.min(100, (formData.coverage.lifeTpd / results.totalLiabilities) * 100) || 0;
      const ciCoveragePercent = Math.min(100, (formData.coverage.criticalIllness / results.totalCINeed) * 100) || 0;

      return (
        <div className="pb-32">
          {/* Header */}
          <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
              <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                       <button 
                          onClick={() => setShowResult(false)} 
                          className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
                      >
                          <ArrowLeft className="w-5 h-5 text-slate-600" />
                      </button>
                      <span className="font-bold text-slate-800">Report</span>
                  </div>
                  <div className="flex gap-2">
                      <button 
                          onClick={saveToDb}
                          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-full text-xs font-bold transition-colors"
                      >
                          <Save className="w-3.5 h-3.5" /> Save
                      </button>
                      <button 
                          onClick={handleExport}
                          disabled={isGeneratingPdf}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-full text-xs font-bold transition-colors disabled:opacity-50"
                      >
                          {isGeneratingPdf ? '...' : <><FileText className="w-3.5 h-3.5" /> PDF</>}
                      </button>
                  </div>
              </div>
          </header>

          <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
              {/* User Header */}
              <div className="text-center space-y-1 mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">{formData.basic.fullName || "Valued Client"}</h2>
                  <p className="text-sm text-slate-500">Financial Gap Analysis Report</p>
              </div>

              {/* Top Cards: Status Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 1. DEBT GAP CARD */}
                  <div className={`relative overflow-hidden rounded-3xl p-5 border transition-all duration-300 ${results.debtShortfall > 0 ? 'bg-red-50/80 border-red-100' : 'bg-green-50/80 border-green-100'}`}>
                      <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Debt Gap 债务缺口</span>
                          {results.debtShortfall > 0 ? <AlertCircle className="w-5 h-5 text-red-500" /> : <CheckCircle2 className="w-5 h-5 text-green-500" />}
                      </div>
                      <p className={`text-2xl font-extrabold ${results.debtShortfall > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {results.debtShortfall > 0 ? formatCurrency(results.debtShortfall) : 'RM 0'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Total Debt: {formatCurrency(results.totalLiabilities)}</p>
                  </div>

                  {/* 2. CI GAP CARD */}
                  <div className={`relative overflow-hidden rounded-3xl p-5 border transition-all duration-300 ${results.ciShortfall > 0 ? 'bg-orange-50/80 border-orange-100' : 'bg-green-50/80 border-green-100'}`}>
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">CI Gap 重疾缺口</span>
                          {results.ciShortfall > 0 ? <AlertCircle className="w-5 h-5 text-orange-500" /> : <CheckCircle2 className="w-5 h-5 text-green-500" />}
                      </div>
                      <p className={`text-2xl font-extrabold ${results.ciShortfall > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                          {results.ciShortfall > 0 ? formatCurrency(results.ciShortfall) : 'RM 0'}
                      </p>
                       <p className="text-xs text-slate-400 mt-1">Need: {formatCurrency(results.totalCINeed)}</p>
                  </div>

                  {/* 3. AFFORDABILITY CARD */}
                  <div className={`relative overflow-hidden rounded-3xl p-5 border bg-white/60 backdrop-blur-md border-white/40 shadow-sm`}>
                       <div className="flex justify-between items-start mb-2">
                           <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Surplus 预算盈余</span>
                           <Wallet className="w-5 h-5 text-indigo-500" />
                      </div>
                      <p className={`text-2xl font-extrabold ${results.affordability > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                          {formatCurrency(results.affordability)}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Income - Expenses</p>
                  </div>
              </div>

              {/* Detailed Analysis Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Debt Analysis Detail */}
                  <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-white/50 p-6">
                      <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <div className="w-1 h-5 bg-red-500 rounded-full"></div> 
                          Debt Analysis <span className="text-slate-400 font-normal text-xs">债务分析</span>
                      </h3>
                      
                      <div className="space-y-4">
                           {/* Progress Bar */}
                           <div>
                              <div className="flex justify-between text-xs mb-1.5 font-medium">
                                  <span className="text-slate-500">Covered {debtCoveragePercent.toFixed(0)}%</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${debtCoveragePercent}%` }}></div>
                              </div>
                           </div>

                           {/* List Items */}
                           <div className="space-y-2 text-sm">
                               <div className="flex justify-between">
                                   <span className="text-slate-500">Total / 总债务</span>
                                   <span className="font-semibold">{formatCurrency(results.totalLiabilities)}</span>
                               </div>
                               <div className="flex justify-between">
                                   <span className="text-slate-500">Existing / 现有</span>
                                   <span className="font-medium text-emerald-600">-{formatCurrency(formData.coverage.lifeTpd)}</span>
                               </div>
                               <div className="border-t border-slate-100 my-1"></div>
                               <div className="flex justify-between">
                                   <span className="font-bold text-slate-700">Shortfall / 缺口</span>
                                   <span className={`font-bold ${results.debtShortfall > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                      {formatCurrency(results.debtShortfall)}
                                   </span>
                               </div>
                           </div>
                      </div>
                  </div>

                  {/* CI Analysis Detail */}
                  <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-white/50 p-6">
                      <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <div className="w-1 h-5 bg-orange-500 rounded-full"></div> 
                          CI Analysis <span className="text-slate-400 font-normal text-xs">重疾分析</span>
                      </h3>
                      
                      <div className="space-y-4">
                           {/* Progress Bar */}
                           <div>
                              <div className="flex justify-between text-xs mb-1.5 font-medium">
                                  <span className="text-slate-500">Covered {ciCoveragePercent.toFixed(0)}%</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${ciCoveragePercent}%` }}></div>
                              </div>
                           </div>

                           {/* List Items */}
                           <div className="space-y-2 text-sm">
                               <div className="flex justify-between">
                                   <span className="text-slate-500">Total Need / 总需求</span>
                                   <span className="font-semibold">{formatCurrency(results.totalCINeed)}</span>
                               </div>
                               <div className="flex justify-between">
                                   <span className="text-slate-500">Existing / 现有</span>
                                   <span className="font-medium text-purple-600">-{formatCurrency(formData.coverage.criticalIllness)}</span>
                               </div>
                               <div className="border-t border-slate-100 my-1"></div>
                               <div className="flex justify-between">
                                   <span className="font-bold text-slate-700">Shortfall / 缺口</span>
                                   <span className={`font-bold ${results.ciShortfall > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                      {formatCurrency(results.ciShortfall)}
                                   </span>
                               </div>
                           </div>
                      </div>
                  </div>
              </div>
              
              <div className="flex justify-center pt-4">
                  <button 
                      onClick={() => {
                          resetForm();
                          window.scrollTo(0,0);
                      }}
                      className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors font-medium text-sm"
                  >
                      <RefreshCcw className="w-4 h-4" /> Start New Calculation
                  </button>
              </div>
          </main>
        </div>
      );
  }

  // Form View
  return (
      <div className="pb-32 pt-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          
          {/* Action Header for Install */}
          <div className="absolute top-6 right-6">
             <button
                onClick={() => setShowInstallModal(true)}
                className="p-2 bg-white/50 backdrop-blur hover:bg-white rounded-full text-slate-500 hover:text-indigo-600 transition-all shadow-sm"
                title="Install App"
             >
                <Download className="w-5 h-5" />
             </button>
          </div>

          {/* Title Section */}
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30 mb-2">
               <PieChart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Gap Calculator</h1>
            <p className="text-slate-500 text-sm font-medium">专业保险缺口计算器</p>
          </div>

          {/* 1. Basic Info */}
          <SectionCard title="Basic Info 基本资料" icon={User}>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-semibold text-slate-600">Name 姓名</label>
              <input 
                type="text" 
                className="block w-full rounded-xl border-slate-200 bg-white/50 p-3 text-slate-900 placeholder-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-sm"
                value={formData.basic.fullName}
                onChange={(e) => updateBasic('fullName', e.target.value)}
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-semibold text-slate-600">Contact 联络号码</label>
              <input 
                type="tel" 
                className="block w-full rounded-xl border-slate-200 bg-white/50 p-3 text-slate-900 placeholder-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-sm"
                value={formData.basic.contactNumber}
                onChange={(e) => updateBasic('contactNumber', e.target.value)}
                placeholder="+60..."
              />
            </div>
            <DateInput 
               label="DOB 出生日期" 
               value={formData.basic.dob} 
               onChange={(v) => updateBasic('dob', v)} 
            />
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-semibold text-slate-600">Gender 性别</label>
              <div
                  onClick={() => updateBasic('gender', formData.basic.gender === 'Male' ? 'Female' : 'Male')}
                  className="relative block w-full rounded-xl border border-slate-200 bg-white/50 p-3 text-slate-900 cursor-pointer shadow-sm hover:bg-white active:scale-[0.99] transition-all group select-none"
              >
                  <div className="flex justify-between items-center">
                      <span className="font-medium">
                          {formData.basic.gender === 'Male' ? 'Male / 男' : 'Female / 女'}
                      </span>
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                  </div>
              </div>
            </div>
             <MoneyInput label="Annual Income 年收入" value={formData.basic.annualIncome} onChange={(v) => updateBasic('annualIncome', v)} />
          </SectionCard>

          {/* 2. Liabilities */}
          <SectionCard title="Liabilities 债务" icon={DollarSign}>
            <MoneyInput label="Housing Loan 房贷" value={formData.liabilities.housingLoan} onChange={(v) => updateLiability('housingLoan', v)} />
            <MoneyInput label="Car Loan 车贷" value={formData.liabilities.carLoan} onChange={(v) => updateLiability('carLoan', v)} />
            <MoneyInput label="Personal Loan 个人贷款" value={formData.liabilities.personalLoan} onChange={(v) => updateLiability('personalLoan', v)} />
            <MoneyInput label="Credit Card 信用卡" value={formData.liabilities.creditCard} onChange={(v) => updateLiability('creditCard', v)} />
            <MoneyInput label="Business Loan 生意贷款" value={formData.liabilities.businessLoan} onChange={(v) => updateLiability('businessLoan', v)} />
            <MoneyInput label="Study Loan 学贷" value={formData.liabilities.studyLoan} onChange={(v) => updateLiability('studyLoan', v)} />
            <MoneyInput label="Others 其他" value={formData.liabilities.otherLiabilities} onChange={(v) => updateLiability('otherLiabilities', v)} />
            
            <div className="md:col-span-2 bg-indigo-50/50 rounded-xl p-3 flex justify-between items-center mt-2 border border-indigo-100">
              <span className="font-semibold text-indigo-700 text-sm">Total Debt 总债务</span>
              <span className="font-bold text-indigo-800">
                {formatCurrency((Object.values(formData.liabilities) as number[]).reduce((a, b) => a + b, 0))}
              </span>
            </div>
          </SectionCard>

          {/* 3. Expenses */}
          <SectionCard title="Expenses 开销" icon={PieChart}>
            <MoneyInput label="Housing Pay 房贷供期" value={formData.expenses.housingInstallment} onChange={(v) => updateExpense('housingInstallment', v)} />
            <MoneyInput label="Car Pay 车贷供期" value={formData.expenses.carInstallment} onChange={(v) => updateExpense('carInstallment', v)} />
            <MoneyInput label="Credit Card Pay 信用卡" value={formData.expenses.creditCardPayment} onChange={(v) => updateExpense('creditCardPayment', v)} />
            <MoneyInput label="Groceries 伙食费" value={formData.expenses.foodGroceries} onChange={(v) => updateExpense('foodGroceries', v)} />
            <MoneyInput label="Utilities 水电费" value={formData.expenses.utilities} onChange={(v) => updateExpense('utilities', v)} />
            <MoneyInput label="Telco 电话网络" value={formData.expenses.phoneInternet} onChange={(v) => updateExpense('phoneInternet', v)} />
            <MoneyInput label="Education 教育" value={formData.expenses.childrenEducation} onChange={(v) => updateExpense('childrenEducation', v)} />
            <MoneyInput label="Insurance 保费" value={formData.expenses.insurancePremium} onChange={(v) => updateExpense('insurancePremium', v)} />
            <MoneyInput label="Transport 交通" value={formData.expenses.transport} onChange={(v) => updateExpense('transport', v)} />
            <MoneyInput label="Parents 父母" value={formData.expenses.parentsAllowance} onChange={(v) => updateExpense('parentsAllowance', v)} />
            <MoneyInput label="Childcare 托儿" value={formData.expenses.childcare} onChange={(v) => updateExpense('childcare', v)} />
            <MoneyInput label="Fun 娱乐" value={formData.expenses.entertainment} onChange={(v) => updateExpense('entertainment', v)} />
            <MoneyInput label="Savings 储蓄" value={formData.expenses.savings} onChange={(v) => updateExpense('savings', v)} />
            <MoneyInput label="Others 其他" value={formData.expenses.others} onChange={(v) => updateExpense('others', v)} />

            <div className="md:col-span-2 bg-indigo-50/50 rounded-xl p-3 flex justify-between items-center mt-2 border border-indigo-100">
              <span className="font-semibold text-indigo-700 text-sm">Total Exp 总开销</span>
              <span className="font-bold text-indigo-800">
                {formatCurrency((Object.values(formData.expenses) as number[]).reduce((a, b) => a + b, 0))}
              </span>
            </div>
          </SectionCard>

          {/* 4. Coverage */}
          <SectionCard title="Coverage 现有保障" icon={ShieldAlert}>
            <MoneyInput label="Life/TPD 人寿" value={formData.coverage.lifeTpd} onChange={(v) => updateCoverage('lifeTpd', v)} />
            <MoneyInput label="Critical Illness 重疾" value={formData.coverage.criticalIllness} onChange={(v) => updateCoverage('criticalIllness', v)} />
            
            <div className="flex flex-col space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-600">CI Replacement Years 重疾替代年数</label>
              <div className="grid grid-cols-3 gap-3">
                {[3, 4, 5].map((year) => (
                  <button
                    key={year}
                    onClick={() => updateCoverage('ciIncomeReplacementYears', year)}
                    className={`py-3 rounded-xl border font-semibold transition-all shadow-sm ${
                      formData.coverage.ciIncomeReplacementYears === year
                        ? 'bg-indigo-600 border-indigo-600 text-white ring-2 ring-indigo-200'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'
                    }`}
                  >
                    {year} Yrs
                  </button>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Action Button */}
          <div className="mt-8 mb-4">
              <button
              onClick={() => setShowResult(true)}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
              <Calculator className="w-5 h-5" />
              Calculate / 计算
              </button>
          </div>
        </div>
      </div>
  );
};

const DatabaseView: React.FC<DatabaseViewProps> = ({ savedRecords, loadFromDb, deleteFromDb }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredRecords = savedRecords.filter(r => 
        r.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.data.basic.contactNumber.includes(searchTerm)
    );

    return (
        <div className="min-h-screen pb-32 bg-transparent">
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Database className="w-6 h-6 text-indigo-600" />
                        Client Database
                    </h2>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-6">
                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                        type="text"
                        placeholder="Search name or phone... / 搜索姓名或电话"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* List */}
                {savedRecords.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <FolderOpen className="w-16 h-16 mb-4 opacity-50" />
                        <p>No records found. / 暂无记录。</p>
                        <p className="text-sm mt-2">Calculated results will appear here after saving.</p>
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                        <p>No matches found.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredRecords.map((record) => (
                            <div key={record.id} className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group active:scale-[0.99] transition-all">
                                <div className="flex-1 min-w-0" onClick={() => loadFromDb(record)}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-slate-800 truncate">{record.clientName}</h3>
                                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                                            {new Date(record.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm text-slate-500 gap-3">
                                        <span className="flex items-center gap-1">
                                            <FileText className="w-3.5 h-3.5" />
                                            Inc: {formatCurrency(record.data.basic.annualIncome)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 pl-4 border-l border-slate-100 ml-4">
                                    <button 
                                        onClick={() => loadFromDb(record)}
                                        className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors"
                                    >
                                        <FolderOpen className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={(e) => deleteFromDb(record.id, e)}
                                        className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
};

const InstallModal = ({ show, onClose }: { show: boolean; onClose: () => void }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <X className="w-6 h-6" />
                </button>
                
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Download className="w-6 h-6 text-indigo-600" />
                    Install App
                </h3>
                
                <div className="space-y-6">
                    {/* iOS Instructions */}
                    <div className="bg-slate-50 p-4 rounded-xl">
                        <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <span>iPhone / iPad</span>
                        </h4>
                        <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
                            <li>Tap the <Share className="w-4 h-4 inline mx-1" /> <strong>Share</strong> button below.</li>
                            <li>Scroll down and tap <PlusSquare className="w-4 h-4 inline mx-1" /> <strong>Add to Home Screen</strong>.</li>
                            <li>Tap <strong>Add</strong>.</li>
                        </ol>
                    </div>

                    {/* Android Instructions */}
                    <div className="bg-slate-50 p-4 rounded-xl">
                        <h4 className="font-bold text-slate-700 mb-2">Android (Chrome)</h4>
                        <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
                            <li>Tap the <MoreVertical className="w-4 h-4 inline mx-1" /> <strong>Menu</strong> icon.</li>
                            <li>Tap <strong>Install App</strong> or <strong>Add to Home screen</strong>.</li>
                        </ol>
                    </div>
                </div>

                <button onClick={onClose} className="w-full mt-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                    Got it / 明白了
                </button>
            </div>
        </div>
    );
};

// --- Main App Component ---

export default function App() {
  // --- Global State ---
  const [activeTab, setActiveTab] = useState<'calculator' | 'database'>('calculator');
  const [savedRecords, setSavedRecords] = useState<SavedRecord[]>([]);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // --- Calculator State ---
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [showResult, setShowResult] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // --- Database Effects ---
  useEffect(() => {
    const loaded = localStorage.getItem(DB_KEY);
    if (loaded) {
      try {
        setSavedRecords(JSON.parse(loaded));
      } catch (e) {
        console.error("Failed to parse DB", e);
      }
    }
  }, []);

  const saveToDb = () => {
    if (!formData.basic.fullName) {
        alert("Please enter a name before saving. / 请先输入客户姓名。");
        return;
    }
    const newRecord: SavedRecord = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        clientName: formData.basic.fullName,
        data: formData
    };
    
    // Check if name exists to update or add new? For now, we just add new to keep history.
    const updatedRecords = [newRecord, ...savedRecords];
    setSavedRecords(updatedRecords);
    localStorage.setItem(DB_KEY, JSON.stringify(updatedRecords));
    alert("Saved successfully! / 保存成功！");
  };

  const deleteFromDb = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this record? / 确定要删除此记录吗？")) {
        const updated = savedRecords.filter(r => r.id !== id);
        setSavedRecords(updated);
        localStorage.setItem(DB_KEY, JSON.stringify(updated));
    }
  };

  const loadFromDb = (record: SavedRecord) => {
      setFormData(record.data);
      setShowResult(true);
      setActiveTab('calculator');
  };

  // --- Handlers ---
  const updateBasic = (field: keyof BasicInfo, value: any) => {
    setFormData(prev => ({ ...prev, basic: { ...prev.basic, [field]: value } }));
  };

  const updateLiability = (field: keyof Liabilities, value: number) => {
    setFormData(prev => ({ ...prev, liabilities: { ...prev.liabilities, [field]: value } }));
  };

  const updateExpense = (field: keyof Expenses, value: number) => {
    setFormData(prev => ({ ...prev, expenses: { ...prev.expenses, [field]: value } }));
  };

  const updateCoverage = (field: keyof ExistingCoverage, value: any) => {
    setFormData(prev => ({ ...prev, coverage: { ...prev.coverage, [field]: value } }));
  };
  
  const resetForm = () => {
    setFormData(INITIAL_DATA);
    setShowResult(false);
  };

  const handleExport = async () => {
    setIsGeneratingPdf(true);
    // Slight delay to allow state to render the hidden view if needed (though it's always rendered now)
    setTimeout(async () => {
        const safeName = formData.basic.fullName.replace(/[^a-z0-9]/gi, '_').substring(0, 20) || "Report";
        await generatePDF('pdf-report-template', `Gap_Analysis_${safeName}`);
        setIsGeneratingPdf(false);
    }, 100);
  };

  // --- Calculations ---
  const results: CalculationResult = useMemo(() => {
    const totalLiabilities = (Object.values(formData.liabilities) as number[]).reduce((a, b) => a + b, 0);
    const monthlyCommitment = (Object.values(formData.expenses) as number[]).reduce((a, b) => a + b, 0);
    
    // 1. Debt Shortfall
    const debtShortfall = Math.max(0, totalLiabilities - formData.coverage.lifeTpd);

    // 2. CI Shortfall
    const totalCINeed = monthlyCommitment * (formData.coverage.ciIncomeReplacementYears * 12);
    const ciShortfall = Math.max(0, totalCINeed - formData.coverage.criticalIllness);

    // 3. Affordability
    const monthlyIncome = formData.basic.annualIncome / 12;
    const affordability = monthlyIncome - monthlyCommitment;

    return {
      totalLiabilities,
      monthlyCommitment,
      debtShortfall,
      totalCINeed,
      ciShortfall,
      monthlyIncome,
      affordability
    };
  }, [formData]);

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-900">
        
        {/* Install Modal */}
        <InstallModal show={showInstallModal} onClose={() => setShowInstallModal(false)} />

        {/* Render PDF Template Hidden */}
        <PdfTemplate formData={formData} results={results} />

        {/* Content Area */}
        {activeTab === 'calculator' ? (
          <CalculatorView 
            formData={formData}
            results={results}
            showResult={showResult}
            setShowResult={setShowResult}
            isGeneratingPdf={isGeneratingPdf}
            handleExport={handleExport}
            saveToDb={saveToDb}
            updateBasic={updateBasic}
            updateLiability={updateLiability}
            updateExpense={updateExpense}
            updateCoverage={updateCoverage}
            resetForm={resetForm}
            setShowInstallModal={setShowInstallModal}
          />
        ) : (
          <DatabaseView 
            savedRecords={savedRecords} 
            loadFromDb={loadFromDb} 
            deleteFromDb={deleteFromDb} 
          />
        )}

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 safe-area-bottom">
            <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
                <button 
                    onClick={() => setActiveTab('calculator')}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${activeTab === 'calculator' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Calculator className={`w-6 h-6 ${activeTab === 'calculator' ? 'fill-current opacity-20 stroke-[2.5px]' : ''}`} />
                    <span className="text-[10px] font-bold tracking-wide">CALCULATOR</span>
                </button>
                
                <div className="w-px h-8 bg-slate-100"></div>

                <button 
                    onClick={() => setActiveTab('database')}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${activeTab === 'database' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Database className={`w-6 h-6 ${activeTab === 'database' ? 'fill-current opacity-20 stroke-[2.5px]' : ''}`} />
                    <span className="text-[10px] font-bold tracking-wide">DATABASE</span>
                </button>
            </div>
        </div>
    </div>
  );
}