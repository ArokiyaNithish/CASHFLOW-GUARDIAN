import axios from 'axios';
import { useAppStore } from '../store/useAppStore';

const BASE = 'http://localhost:8000';

const client = axios.create({ baseURL: BASE });

// Attach JWT to every request
client.interceptors.request.use((config) => {
  const token = useAppStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const api = {
  // Auth
  register: (name: string, email: string, password: string, company_name: string) =>
    client.post('/auth/register', { name, email, password, company_name }),
  login: (email: string, password: string) =>
    client.post('/auth/login', { email, password }),
  loginWithGoogle: (payload: { credential?: string; email?: string; name?: string; google_id?: string; picture?: string }) =>
    client.post('/auth/google', payload),
  me: () => client.get('/auth/me'),

  // Snapshot
  getSnapshot: (companyId: string) =>
    client.get(`/companies/${companyId}/snapshot`),

  // Invoices
  getInvoices: (companyId: string) =>
    client.get(`/companies/${companyId}/invoices`),

  // Forecast
  runForecast: (companyId: string) =>
    client.post(`/companies/${companyId}/forecast`),
  getLatestForecast: (companyId: string) =>
    client.get(`/companies/${companyId}/forecast/latest`),
  simulate: (companyId: string, payload: object) =>
    client.post(`/companies/${companyId}/simulate`, payload),

  // Risk
  getRisk: (forecastId: string) =>
    client.get(`/forecasts/${forecastId}/risk`),

  // Agent Plan
  generatePlan: (forecastId: string) =>
    client.post(`/forecasts/${forecastId}/plan`),
  approvePlan: (planId: string) =>
    client.post(`/plans/${planId}/approve`),
  rejectPlan: (planId: string) =>
    client.post(`/plans/${planId}/reject`),
  modifyPlan: (planId: string, note: string) =>
    client.post(`/plans/${planId}/modify`, { modification_note: note }),

  // Actions
  getActions: (companyId: string) =>
    client.get(`/companies/${companyId}/actions`),
  approveAction: (actionId: string) =>
    client.post(`/actions/${actionId}/approve`),
  executeAction: (actionId: string) =>
    client.post(`/actions/${actionId}/execute`),

  // Ask Guardian
  ask: (companyId: string, question: string) =>
    client.post(`/companies/${companyId}/ask`, { question }),

  // Audit Log
  getAuditLog: (companyId: string) =>
    client.get(`/companies/${companyId}/audit-log`),

  // Upload CSV & Manual Entry
  uploadCSV: (companyId: string, fileType: string, file: File) => {
    const form = new FormData();
    form.append('file_type', fileType);
    form.append('file', file);
    return client.post(`/companies/${companyId}/data/upload`, form);
  },
  addInvoice: (companyId: string, payload: { customer_name: string; amount: number; due_date: string }) =>
    client.post(`/companies/${companyId}/data/invoice`, payload),
  addPayable: (companyId: string, payload: { supplier_name: string; amount: number; due_date: string; priority?: string }) =>
    client.post(`/companies/${companyId}/data/payable`, payload),
  addTransaction: (companyId: string, payload: { amount: number; category: string; counterparty?: string; description?: string }) =>
    client.post(`/companies/${companyId}/data/transaction`, payload),
};
