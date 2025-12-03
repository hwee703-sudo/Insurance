export interface BasicInfo {
  fullName: string;
  contactNumber: string;
  dob: string;
  gender: 'Male' | 'Female';
  annualIncome: number;
}

export interface Liabilities {
  housingLoan: number;
  carLoan: number;
  personalLoan: number;
  creditCard: number;
  businessLoan: number;
  studyLoan: number;
  otherLiabilities: number;
}

export interface Expenses {
  housingInstallment: number;
  carInstallment: number;
  creditCardPayment: number;
  foodGroceries: number;
  utilities: number;
  phoneInternet: number;
  childrenEducation: number;
  insurancePremium: number;
  transport: number;
  parentsAllowance: number;
  childcare: number;
  entertainment: number;
  savings: number;
  others: number;
}

export interface ExistingCoverage {
  lifeTpd: number;
  criticalIllness: number;
  ciIncomeReplacementYears: 3 | 4 | 5;
}

export interface FormData {
  basic: BasicInfo;
  liabilities: Liabilities;
  expenses: Expenses;
  coverage: ExistingCoverage;
}

export interface CalculationResult {
  totalLiabilities: number;
  monthlyCommitment: number;
  debtShortfall: number;
  totalCINeed: number;
  ciShortfall: number;
  monthlyIncome: number;
  affordability: number;
}