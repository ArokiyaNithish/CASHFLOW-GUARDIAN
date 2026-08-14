import React, { useState } from 'react';
import { api } from '../../api/client';
import { useAppStore } from '../../store/useAppStore';
import toast from 'react-hot-toast';
import { PlusCircle, Upload, DollarSign, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface AddDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddDataModal: React.FC<AddDataModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { companyId } = useAppStore();
  const [tab, setTab] = useState<'invoice' | 'payable' | 'transaction' | 'upload'>('invoice');

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState('normal');
  const [txnType, setTxnType] = useState<'inflow' | 'outflow'>('inflow');
  const [category, setCategory] = useState('Sales / Payment');
  const [counterparty, setCounterparty] = useState('');
  const [fileType, setFileType] = useState('invoices');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const targetCompany = companyId || user?.company_id || 'abc-precision-001';

  const handleSubmitInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !amount || !dueDate) return toast.error('Please fill in all fields');
    setSubmitting(true);
    try {
      await api.addInvoice(targetCompany, {
        customer_name: customerName,
        amount: parseFloat(amount),
        due_date: dueDate,
      });
      toast.success('✦ Invoice added! Forecast will recalculate.');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err?.message || 'Failed to add invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitPayable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName || !amount || !dueDate) return toast.error('Please fill in all fields');
    setSubmitting(true);
    try {
      await api.addPayable(targetCompany, {
        supplier_name: supplierName,
        amount: parseFloat(amount),
        due_date: dueDate,
        priority,
      });
      toast.success('✦ Payable obligation added!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err?.message || 'Failed to add payable');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return toast.error('Please enter amount');
    setSubmitting(true);
    try {
      const val = parseFloat(amount);
      const finalAmount = txnType === 'outflow' ? -Math.abs(val) : Math.abs(val);
      await api.addTransaction(targetCompany, {
        amount: finalAmount,
        category,
        counterparty: counterparty || 'Manual Entry',
        description: `User recorded ${txnType}`,
      });
      toast.success(`✦ ${txnType === 'inflow' ? 'Cash inflow recorded!' : 'Expense recorded!'}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err?.message || 'Failed to record transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return toast.error('Please select a CSV file');
    setSubmitting(true);
    try {
      await api.uploadCSV(companyId!, fileType, selectedFile);
      toast.success(`✦ CSV (${fileType}) uploaded successfully!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'CSV upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: 540, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <PlusCircle size={20} color="var(--color-guardian)" />
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Add Financial Data</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--color-text-muted)' }}>×</button>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>
          <button
            className={tab === 'invoice' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: 12, padding: '6px 12px' }}
            onClick={() => setTab('invoice')}
          >
            + Invoice (Receivable)
          </button>
          <button
            className={tab === 'payable' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: 12, padding: '6px 12px' }}
            onClick={() => setTab('payable')}
          >
            + Payable (Obligation)
          </button>
          <button
            className={tab === 'transaction' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: 12, padding: '6px 12px' }}
            onClick={() => setTab('transaction')}
          >
            + Record Cash
          </button>
          <button
            className={tab === 'upload' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: 12, padding: '6px 12px' }}
            onClick={() => setTab('upload')}
          >
            Upload CSV
          </button>
        </div>

        {/* Form 1: Add Invoice */}
        {tab === 'invoice' && (
          <form onSubmit={handleSubmitInvoice} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="section-label">Customer Name</label>
              <input type="text" placeholder="e.g. Apex Industrial Pvt Ltd" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="section-label">Invoice Amount (₹)</label>
                <input type="number" placeholder="e.g. 50000" value={amount} onChange={e => setAmount(e.target.value)} required />
              </div>
              <div>
                <label className="section-label">Due Date</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
              </div>
            </div>
            <button className="btn-primary" type="submit" disabled={submitting} style={{ marginTop: 8, justifyContent: 'center' }}>
              {submitting ? 'Saving…' : '✓ Add Invoice & Update Forecast'}
            </button>
          </form>
        )}

        {/* Form 2: Add Payable */}
        {tab === 'payable' && (
          <form onSubmit={handleSubmitPayable} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="section-label">Supplier / Vendor Name</label>
              <input type="text" placeholder="e.g. Metro Components Co" value={supplierName} onChange={e => setSupplierName(e.target.value)} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="section-label">Payable Amount (₹)</label>
                <input type="number" placeholder="e.g. 50000" value={amount} onChange={e => setAmount(e.target.value)} required />
              </div>
              <div>
                <label className="section-label">Due Date</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="section-label">Negotiability / Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="flexible">Flexible (Can request 15-day extension)</option>
                <option value="normal">Normal Priority</option>
                <option value="critical">Critical (Strict Due Date)</option>
              </select>
            </div>
            <button className="btn-primary" type="submit" disabled={submitting} style={{ marginTop: 8, justifyContent: 'center' }}>
              {submitting ? 'Saving…' : '✓ Add Payable Obligation'}
            </button>
          </form>
        )}

        {/* Form 3: Record Cash Transaction */}
        {tab === 'transaction' && (
          <form onSubmit={handleSubmitTransaction} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="section-label">Transaction Type</label>
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <button
                  type="button"
                  className={txnType === 'inflow' ? 'btn-primary' : 'btn-secondary'}
                  style={{ flex: 1, justifyContent: 'center', background: txnType === 'inflow' ? 'var(--color-healthy)' : undefined }}
                  onClick={() => setTxnType('inflow')}
                >
                  <ArrowDownRight size={14} /> Cash Inflow (+)
                </button>
                <button
                  type="button"
                  className={txnType === 'outflow' ? 'btn-danger' : 'btn-secondary'}
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setTxnType('outflow')}
                >
                  <ArrowUpRight size={14} /> Cash Outflow (-)
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="section-label">Amount (₹)</label>
                <input type="number" placeholder="50000" value={amount} onChange={e => setAmount(e.target.value)} required />
              </div>
              <div>
                <label className="section-label">Category</label>
                <input type="text" placeholder="Sales / Raw Material / Payroll" value={category} onChange={e => setCategory(e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="section-label">Counterparty / Details (Optional)</label>
              <input type="text" placeholder="Bank Transfer / Client payment" value={counterparty} onChange={e => setCounterparty(e.target.value)} />
            </div>
            <button className="btn-primary" type="submit" disabled={submitting} style={{ marginTop: 8, justifyContent: 'center' }}>
              {submitting ? 'Saving…' : `✓ Record ${txnType === 'inflow' ? 'Cash Inflow' : 'Expense'}`}
            </button>
          </form>
        )}

        {/* Form 4: Upload CSV */}
        {tab === 'upload' && (
          <form onSubmit={handleSubmitUpload} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="section-label">Select Dataset Category</label>
              <select value={fileType} onChange={e => setFileType(e.target.value)}>
                <option value="invoices">Invoices (Receivables)</option>
                <option value="payables">Payables (Obligations)</option>
                <option value="transactions">Transactions (Bank Statements)</option>
                <option value="customers">Customers Master List</option>
                <option value="suppliers">Suppliers Master List</option>
              </select>
            </div>
            <div>
              <label className="section-label">Upload CSV File</label>
              <input type="file" accept=".csv" onChange={e => setSelectedFile(e.target.files?.[0] || null)} required />
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
              Supports UTF-8 CSV files. Automatically updates cash runway and risk predictions.
            </p>
            <button className="btn-primary" type="submit" disabled={submitting || !selectedFile} style={{ marginTop: 8, justifyContent: 'center' }}>
              {submitting ? 'Uploading…' : '✦ Upload & Process CSV Data'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
