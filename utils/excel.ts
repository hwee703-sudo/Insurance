import * as XLSX from 'xlsx';
import { FormData, CalculationResult } from '../types';
import { formatCurrency } from './format';

export const generateExcel = (formData: FormData, results: CalculationResult) => {
  const { basic, liabilities, expenses, coverage } = formData;

  // Prepare data rows for a clean report format
  const data = [
    ["Insurance Gap Analysis Report / 保险缺口分析报告"],
    [`Generated on / 生成日期: ${new Date().toLocaleDateString()}`],
    [],
    ["CATEGORY / 类别", "ITEM / 项目", "VALUE / 金额 (RM)", "NOTES / 备注"],
    
    // Basic Info
    ["Basic Information", "Full Name / 姓名", basic.fullName],
    ["基本资料", "Contact / 联络号码", basic.contactNumber],
    ["", "DOB / 出生日期", basic.dob],
    ["", "Gender / 性别", basic.gender],
    ["", "Annual Income / 年收入", basic.annualIncome],
    
    // Liabilities
    [],
    ["Liabilities (Debts)", "Housing Loan / 房屋贷款", liabilities.housingLoan],
    ["债务资料", "Car Loan / 汽车贷款", liabilities.carLoan],
    ["", "Personal Loan / 个人贷款", liabilities.personalLoan],
    ["", "Credit Card / 信用卡欠款", liabilities.creditCard],
    ["", "Business Loan / 生意贷款", liabilities.businessLoan],
    ["", "Study Loan / 学贷", liabilities.studyLoan],
    ["", "Others / 其他", liabilities.otherLiabilities],
    ["", "TOTAL LIABILITIES / 总债务", results.totalLiabilities, "Sum of all debts"],
    
    // Monthly Expenses
    [],
    ["Monthly Expenses", "Housing Installment / 房贷供期", expenses.housingInstallment],
    ["每月开销", "Car Installment / 车贷供期", expenses.carInstallment],
    ["", "Credit Card / 信用卡还款", expenses.creditCardPayment],
    ["", "Food & Groceries / 伙食费", expenses.foodGroceries],
    ["", "Utilities / 水电费", expenses.utilities],
    ["", "Phone & Internet / 电话网络", expenses.phoneInternet],
    ["", "Education / 子女教育", expenses.childrenEducation],
    ["", "Insurance / 保费", expenses.insurancePremium],
    ["", "Transport / 交通费", expenses.transport],
    ["", "Parents / 父母家用", expenses.parentsAllowance],
    ["", "Childcare / 托儿费", expenses.childcare],
    ["", "Entertainment / 娱乐", expenses.entertainment],
    ["", "Savings / 储蓄投资", expenses.savings],
    ["", "Others / 其他", expenses.others],
    ["", "TOTAL COMMITMENT / 总开销", results.monthlyCommitment],

    // Existing Coverage
    [],
    ["Existing Coverage", "Life/TPD Coverage / 人寿保障", coverage.lifeTpd],
    ["现有保障", "Critical Illness Coverage / 重疾保障", coverage.criticalIllness],
    ["", "Income Replacement Years / 重疾替代年数", coverage.ciIncomeReplacementYears],

    // Analysis Results
    [],
    ["ANALYSIS RESULTS / 分析结果"],
    ["Debt Protection", "Debt Shortfall / 债务缺口", results.debtShortfall, results.debtShortfall > 0 ? "Underinsured (不足)" : "Fully Covered (充足)"],
    ["Critical Illness", "Total CI Need / 重疾需求总额", results.totalCINeed],
    ["", "CI Shortfall / 重疾缺口", results.ciShortfall, results.ciShortfall > 0 ? "Underinsured (不足)" : "Fully Covered (充足)"],
    ["Affordability", "Monthly Income / 月收入", results.monthlyIncome],
    ["", "Monthly Surplus / 可支配预算", results.affordability, results.affordability > 0 ? "Positive Cashflow" : "Negative Cashflow"]
  ];

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 20 }, // Category
    { wch: 35 }, // Item
    { wch: 15 }, // Value
    { wch: 25 }, // Notes
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Gap Analysis");

  // Save file
  const fileName = `${basic.fullName.replace(/\s+/g, '_') || 'Client'}_Analysis.xlsx`;
  XLSX.writeFile(wb, fileName);
};