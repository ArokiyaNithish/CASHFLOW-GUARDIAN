export interface User {
  user_id: string;
  name: string;
  email: string;
  role: 'owner' | 'finance_manager' | 'viewer';
  company_id: string;
}

export interface Company {
  company_id: string;
  name: string;
  industry: string;
  safety_reserve: number;
}

export interface DayForecast {
  day: number;
  expected: number;
  best: number;
  worst: number;
}

export interface Forecast {
  forecast_id: string;
  company_id: string;
  generated_at: string;
  daily_projection: DayForecast[];
  current_cash: number;
  deficit_day: number | null;
  deficit_amount: number | null;
  risk_score: number;
}

export interface RiskEvent {
  event_id: string;
  cause_type: 'customer_delay' | 'supplier_obligation' | 'payroll' | 'emi' | 'tax';
  entity_name: string;
  impact_amount: number;
  due_day: number;
  expected_day: number;
  severity: 'high' | 'medium' | 'low';
  confidence: number;
}

export interface PlanOption {
  label: string;
  title: string;
  description: string;
  impact: number;
  cost_level: 'low' | 'medium' | 'high';
  risk_level: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface AgentPlan {
  plan_id: string;
  reasoning_text: string;
  options: PlanOption[];
  recommended_option: string;
  justification: string;
  status: 'proposed' | 'approved' | 'rejected' | 'modified';
}

export interface AgentAction {
  action_id: string;
  action_type: string;
  target_entity_name: string;
  permission_level: 'L1_auto' | 'L2_approval' | 'L3_strict';
  status: 'pending_approval' | 'approved' | 'executed' | 'rejected';
  payload: { subject?: string; body?: string; [key: string]: any };
  expected_impact: number;
  executed_at: string | null;
}

export interface Snapshot {
  current_cash: number;
  total_receivables: number;
  total_payables: number;
  receivables_at_risk: number;
  upcoming_obligations_30d: number;
  risk_score: number;
  health_score: number;
  latest_forecast_id: string | null;
  health_label: string;
  weather: string;
}

export interface Invoice {
  invoice_id: string;
  customer_name: string;
  amount: number;
  due_date: string;
  predicted_pay_date: string;
  predicted_pay_prob: number;
  status: string;
}

export interface AuditLog {
  log_id: string;
  actor: string;
  action: string;
  details: any;
  created_at: string;
}

export interface SimulateResult {
  before: Forecast;
  after: Forecast;
  change_amount: number;
  change_day: number;
}
