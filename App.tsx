import React, { useState, useMemo } from 'react';
import { User, DollarSign, ShieldAlert, PieChart, ArrowRight, ArrowLeft, Download, RefreshCcw, CheckCircle2, AlertCircle, Wallet } from 'lucide-react';
import { FormData, BasicInfo, Liabilities, Expenses, ExistingCoverage, CalculationResult } from './types';
import { MoneyInput } from './components/MoneyInput';
import { SectionCard } from './components/SectionCard';
import { formatCurrency } from './utils/format';
import { generateExcel } from './utils/excel';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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

export default function App() {
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [showResult, setShowResult] = useState(false);

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

  const handleExport = () => {
    generateExcel(formData, results);
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

  // --- Render Views ---

  if (showResult) {
    const debtCoveragePercent = Math.min(100, (formData.coverage.lifeTpd / results.totalLiabilities) * 100) || 0;
    const ciCoveragePercent = Math.min(100, (formData.coverage.criticalIllness / results.totalCINeed) * 100) || 0;

    return (
      <div className="min-h-screen pb-20">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm">
            <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <ShieldAlert className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-gray-800 text-lg hidden sm:block">分析报告 Analysis Result</span>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20"
                    >
                        <Download className="w-4 h-4" /> 导出 Excel
                    </button>
                    <button 
                        onClick={() => setShowResult(false)} 
                        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-full text-sm font-semibold border border-gray-200 transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4" /> 返回 Edit
                    </button>
                </div>
            </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
            
            {/* User Header */}
            <div className="text-center space-y-2 mb-8">
                <h2 className="text-3xl font-bold text-slate-800">{formData.basic.fullName || "Valued Client"}</h2>
                <p className="text-slate-500">Gap Analysis for Financial Security</p>
            </div>

            {/* Top Cards: Status Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. DEBT GAP CARD */}
                <div className={`relative overflow-hidden rounded-3xl p-6 border transition-all duration-300 ${results.debtShortfall > 0 ? 'bg-red-50/80 border-red-100 shadow-red-100' : 'bg-green-50/80 border-green-100 shadow-green-100'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-2xl ${results.debtShortfall > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {results.debtShortfall > 0 ? <AlertCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${results.debtShortfall > 0 ? 'bg-red-200/50 text-red-800' : 'bg-green-200/50 text-green-800'}`}>
                            {results.debtShortfall > 0 ? 'Risk (有缺口)' : 'Secure (安全)'}
                        </span>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wide">Debt Gap / 债务缺口</h3>
                    <p className={`text-3xl font-extrabold mt-1 ${results.debtShortfall > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {results.debtShortfall > 0 ? formatCurrency(results.debtShortfall) : 'RM 0'}
                    </p>
                    <p className="text-xs text-slate-400 mt-4">Total Liabilities: {formatCurrency(results.totalLiabilities)}</p>
                </div>

                {/* 2. CI GAP CARD */}
                <div className={`relative overflow-hidden rounded-3xl p-6 border transition-all duration-300 ${results.ciShortfall > 0 ? 'bg-orange-50/80 border-orange-100 shadow-orange-100' : 'bg-green-50/80 border-green-100 shadow-green-100'}`}>
                     <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-2xl ${results.ciShortfall > 0 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                            {results.ciShortfall > 0 ? <AlertCircle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${results.ciShortfall > 0 ? 'bg-orange-200/50 text-orange-800' : 'bg-green-200/50 text-green-800'}`}>
                            {results.ciShortfall > 0 ? 'Attention (需关注)' : 'Secure (安全)'}
                        </span>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wide">CI Gap / 重疾缺口</h3>
                    <p className={`text-3xl font-extrabold mt-1 ${results.ciShortfall > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        {results.ciShortfall > 0 ? formatCurrency(results.ciShortfall) : 'RM 0'}
                    </p>
                    <p className="text-xs text-slate-400 mt-4">Total Need: {formatCurrency(results.totalCINeed)}</p>
                </div>

                {/* 3. AFFORDABILITY CARD */}
                <div className={`relative overflow-hidden rounded-3xl p-6 border bg-white/60 backdrop-blur-md border-white/40 shadow-sm`}>
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600">
                            <Wallet className="w-6 h-6" />
                        </div>
                         <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${results.affordability > 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-200 text-gray-800'}`}>
                            Budget
                        </span>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wide">Surplus / 可负担预算</h3>
                    <p className={`text-3xl font-extrabold mt-1 ${results.affordability > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                        {formatCurrency(results.affordability)}
                    </p>
                    <p className="text-xs text-slate-400 mt-4">Income vs Expenses</p>
                </div>
            </div>

            {/* Detailed Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Debt Analysis Detail */}
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-white/50 p-8">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-red-500 rounded-full"></span> 
                        Debt Coverage Analysis <span className="text-slate-400 font-normal text-sm ml-auto">债务保障分析</span>
                    </h3>
                    
                    <div className="space-y-6">
                         {/* Progress Bar */}
                         <div>
                            <div className="flex justify-between text-sm mb-2 font-medium">
                                <span className="text-slate-600">Covered / 已保障</span>
                                <span className="text-slate-900">{debtCoveragePercent.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${debtCoveragePercent}%` }}></div>
                            </div>
                         </div>

                         {/* List Items */}
                         <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl">
                             <div className="flex justify-between items-center text-sm">
                                 <span className="text-slate-500">Total Liabilities / 总债务</span>
                                 <span className="font-bold text-slate-800">{formatCurrency(results.totalLiabilities)}</span>
                             </div>
                             <div className="flex justify-between items-center text-sm">
                                 <span className="text-slate-500">Existing Coverage / 现有保障</span>
                                 <span className="font-medium text-emerald-600">-{formatCurrency(formData.coverage.lifeTpd)}</span>
                             </div>
                             <div className="border-t border-slate-200 my-2"></div>
                             <div className="flex justify-between items-center">
                                 <span className="font-bold text-slate-700">Shortfall / 缺口</span>
                                 <span className={`font-bold text-lg ${results.debtShortfall > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                    {formatCurrency(results.debtShortfall)}
                                 </span>
                             </div>
                         </div>
                    </div>
                </div>

                {/* CI Analysis Detail */}
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm border border-white/50 p-8">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-orange-500 rounded-full"></span> 
                        Critical Illness Analysis <span className="text-slate-400 font-normal text-sm ml-auto">重疾保障分析</span>
                    </h3>
                    
                    <div className="space-y-6">
                         {/* Progress Bar */}
                         <div>
                            <div className="flex justify-between text-sm mb-2 font-medium">
                                <span className="text-slate-600">Covered / 已保障</span>
                                <span className="text-slate-900">{ciCoveragePercent.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                <div className="bg-purple-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${ciCoveragePercent}%` }}></div>
                            </div>
                         </div>

                         {/* List Items */}
                         <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl">
                             <div className="flex justify-between items-center text-sm">
                                 <span className="text-slate-500">Monthly Expenses / 每月开销</span>
                                 <span className="font-medium text-slate-700">{formatCurrency(results.monthlyCommitment)}</span>
                             </div>
                             <div className="flex justify-between items-center text-sm">
                                 <span className="text-slate-500">Replacement Period / 替代期</span>
                                 <span className="font-medium text-slate-700">{formData.coverage.ciIncomeReplacementYears} Years</span>
                             </div>
                             <div className="flex justify-between items-center text-sm">
                                 <span className="text-slate-500 font-bold">Total CI Needed / 总需求</span>
                                 <span className="font-bold text-slate-800">{formatCurrency(results.totalCINeed)}</span>
                             </div>
                             <div className="flex justify-between items-center text-sm">
                                 <span className="text-slate-500">Existing Coverage / 现有保障</span>
                                 <span className="font-medium text-purple-600">-{formatCurrency(formData.coverage.criticalIllness)}</span>
                             </div>
                             <div className="border-t border-slate-200 my-2"></div>
                             <div className="flex justify-between items-center">
                                 <span className="font-bold text-slate-700">Shortfall / 缺口</span>
                                 <span className={`font-bold text-lg ${results.ciShortfall > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                    {formatCurrency(results.ciShortfall)}
                                 </span>
                             </div>
                         </div>
                    </div>
                </div>

            </div>

            {/* Bottom Action */}
            <div className="flex justify-center mt-12">
                 <button 
                    onClick={() => {
                        setFormData(INITIAL_DATA);
                        setShowResult(false);
                    }}
                    className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors font-medium text-sm"
                >
                    <RefreshCcw className="w-4 h-4" /> Start New Calculation / 开始新计算
                </button>
            </div>

        </main>
      </div>
    );
  }

  // --- Form View ---
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Title Section */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-xl shadow-indigo-500/30 mb-2">
             <PieChart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Insurance Gap Calculator</h1>
          <p className="text-slate-500 font-medium">保险缺口计算器</p>
        </div>

        {/* 1. Basic Info */}
        <SectionCard title="基本资料 Basic Info" icon={User} description="Personal details / 个人及收入信息">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-semibold text-slate-600">姓名 Full Name</label>
            <input 
              type="text" 
              className="block w-full rounded-xl border-slate-200 bg-white/50 p-3 text-slate-900 placeholder-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-sm"
              value={formData.basic.fullName}
              onChange={(e) => updateBasic('fullName', e.target.value)}
              placeholder="e.g. John Doe"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-semibold text-slate-600">联络号码 Contact Number</label>
            <input 
              type="tel" 
              className="block w-full rounded-xl border-slate-200 bg-white/50 p-3 text-slate-900 placeholder-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-sm"
              value={formData.basic.contactNumber}
              onChange={(e) => updateBasic('contactNumber', e.target.value)}
              placeholder="+60..."
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-semibold text-slate-600">出生日期 Date of Birth</label>
            <input 
              type="date" 
              className="block w-full rounded-xl border-slate-200 bg-white/50 p-3 text-slate-900 placeholder-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-sm"
              value={formData.basic.dob}
              onChange={(e) => updateBasic('dob', e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-semibold text-slate-600">性别 Gender</label>
            <select 
              className="block w-full rounded-xl border-slate-200 bg-white/50 p-3 text-slate-900 placeholder-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-sm"
              value={formData.basic.gender}
              onChange={(e) => updateBasic('gender', e.target.value)}
            >
              <option value="Male">Male / 男</option>
              <option value="Female">Female / 女</option>
            </select>
          </div>
           <MoneyInput 
            label="年收入 Annual Income" 
            value={formData.basic.annualIncome} 
            onChange={(v) => updateBasic('annualIncome', v)} 
          />
        </SectionCard>

        {/* 2. Liabilities */}
        <SectionCard title="债务资料 Liabilities" icon={DollarSign} description="Outstanding debts / 现有贷款余额">
          <MoneyInput label="房屋贷款 Housing Loan" value={formData.liabilities.housingLoan} onChange={(v) => updateLiability('housingLoan', v)} />
          <MoneyInput label="汽车贷款 Car Loan" value={formData.liabilities.carLoan} onChange={(v) => updateLiability('carLoan', v)} />
          <MoneyInput label="个人贷款 Personal Loan" value={formData.liabilities.personalLoan} onChange={(v) => updateLiability('personalLoan', v)} />
          <MoneyInput label="信用卡欠款 Credit Card" value={formData.liabilities.creditCard} onChange={(v) => updateLiability('creditCard', v)} />
          <MoneyInput label="生意贷款 Business Loan" value={formData.liabilities.businessLoan} onChange={(v) => updateLiability('businessLoan', v)} />
          <MoneyInput label="学贷 Study Loan" value={formData.liabilities.studyLoan} onChange={(v) => updateLiability('studyLoan', v)} />
          <MoneyInput label="其他 Other Liabilities" value={formData.liabilities.otherLiabilities} onChange={(v) => updateLiability('otherLiabilities', v)} />
          
          <div className="md:col-span-2 bg-indigo-50/50 rounded-xl p-4 flex justify-between items-center mt-2 border border-indigo-100">
            <span className="font-semibold text-indigo-900">总债务 Total Liabilities</span>
            <span className="font-bold text-xl text-indigo-700">
                {formatCurrency((Object.values(formData.liabilities) as number[]).reduce((a, b) => a + b, 0))}
            </span>
          </div>
        </SectionCard>

        {/* 3. Monthly Expenses */}
        <SectionCard title="每月开销 Expenses" icon={PieChart} description="Monthly commitments / 每月固定支出">
          <MoneyInput label="房贷供期 Housing Installment" value={formData.expenses.housingInstallment} onChange={(v) => updateExpense('housingInstallment', v)} />
          <MoneyInput label="车贷供期 Car Installment" value={formData.expenses.carInstallment} onChange={(v) => updateExpense('carInstallment', v)} />
          <MoneyInput label="信用卡还款 Credit Card" value={formData.expenses.creditCardPayment} onChange={(v) => updateExpense('creditCardPayment', v)} />
          <MoneyInput label="伙食费 Food & Groceries" value={formData.expenses.foodGroceries} onChange={(v) => updateExpense('foodGroceries', v)} />
          <MoneyInput label="水电费 Utilities" value={formData.expenses.utilities} onChange={(v) => updateExpense('utilities', v)} />
          <MoneyInput label="电话网络 Phone & Internet" value={formData.expenses.phoneInternet} onChange={(v) => updateExpense('phoneInternet', v)} />
          <MoneyInput label="子女教育 Children Education" value={formData.expenses.childrenEducation} onChange={(v) => updateExpense('childrenEducation', v)} />
          <MoneyInput label="保费 Insurance Premium" value={formData.expenses.insurancePremium} onChange={(v) => updateExpense('insurancePremium', v)} />
          <MoneyInput label="交通费 Transport" value={formData.expenses.transport} onChange={(v) => updateExpense('transport', v)} />
          <MoneyInput label="父母家用 Parents Allowance" value={formData.expenses.parentsAllowance} onChange={(v) => updateExpense('parentsAllowance', v)} />
          <MoneyInput label="托儿费 Childcare" value={formData.expenses.childcare} onChange={(v) => updateExpense('childcare', v)} />
          <MoneyInput label="娱乐 Entertainment" value={formData.expenses.entertainment} onChange={(v) => updateExpense('entertainment', v)} />
          <MoneyInput label="储蓄投资 Savings" value={formData.expenses.savings} onChange={(v) => updateExpense('savings', v)} />
          <MoneyInput label="其他 Others" value={formData.expenses.others} onChange={(v) => updateExpense('others', v)} />

          <div className="md:col-span-2 bg-orange-50/50 rounded-xl p-4 flex justify-between items-center mt-2 border border-orange-100">
            <span className="font-semibold text-orange-900">总开销 Total Commitment</span>
            <span className="font-bold text-xl text-orange-700">
                {formatCurrency((Object.values(formData.expenses) as number[]).reduce((a, b) => a + b, 0))}
            </span>
          </div>
        </SectionCard>

        {/* 4. Existing Coverage */}
        <SectionCard title="现有保障 Coverage" icon={ShieldAlert} description="Current insurance / 现有保单利益">
            <MoneyInput label="人寿/终身残废 Life/TPD" value={formData.coverage.lifeTpd} onChange={(v) => updateCoverage('lifeTpd', v)} />
            <MoneyInput label="严重疾病 Critical Illness" value={formData.coverage.criticalIllness} onChange={(v) => updateCoverage('criticalIllness', v)} />
            <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-slate-600">重疾收入替代年数 Income Replacement</label>
                <div className="flex gap-4 mt-2">
                    {[3, 4, 5].map((year) => (
                        <button
                            key={year}
                            onClick={() => updateCoverage('ciIncomeReplacementYears', year)}
                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all shadow-sm ${
                                formData.coverage.ciIncomeReplacementYears === year
                                ? 'bg-indigo-600 text-white shadow-indigo-200 transform scale-105'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {year} Years / 年
                        </button>
                    ))}
                </div>
                <p className="text-xs text-slate-400 mt-1">Recommended period for full recovery / 建议恢复期</p>
            </div>
        </SectionCard>

        {/* Submit Action */}
        <div className="sticky bottom-6 z-10 pt-4">
            <button 
                onClick={() => setShowResult(true)}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-5 rounded-2xl shadow-xl shadow-indigo-500/20 transform transition-all hover:scale-[1.02] flex items-center justify-center gap-3 text-lg"
            >
                Calculate Gap / 开始计算 <ArrowRight className="w-5 h-5" />
            </button>
        </div>
        
        <div className="h-12"></div> {/* Spacer */}
      </div>
    </div>
  );
}