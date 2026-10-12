import React, { useState } from 'react';
import {
  X,
  Mail,
  Send,
  Building2,
  Phone,
  User,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { PlantScheduleItem } from '../../types';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  plantSchedule: PlantScheduleItem[];
  designSnapshot?: string;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  onClose,
  plantSchedule,
  designSnapshot,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [projectType, setProjectType] = useState('Luxury Hotel');
  const [plantRequirements, setPlantRequirements] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    enquiryId: string;
    timestamp: string;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !contactNumber.trim() || !projectLocation.trim()) {
      setSubmitError('Please complete all required fields: Name, Phone, and Project Location.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          contactNumber,
          email,
          projectLocation,
          projectType,
          plantRequirements,
          additionalNotes,
          plantSchedule,
          designSnapshot,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit quotation request.');
      }

      setSubmissionResult({
        enquiryId: data.enquiryId,
        timestamp: data.timestamp,
        message: data.message,
      });
    } catch (err: any) {
      setSubmitError(err.message || 'Submission error. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in text-stone-200">
      <div className="bg-stone-900 border border-stone-800 rounded-lg w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-medium text-stone-100">
                Request a Quotation from ETR Plants
              </h3>
              <p className="text-xs text-stone-400">
                Official commercial proposal with your configured plant schedule attached
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-stone-800 text-stone-400 hover:text-stone-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {submissionResult ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-950 border border-emerald-600 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-950/50">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h4 className="font-serif text-xl font-normal text-stone-100">
                Quotation Request Confirmed
              </h4>

              <div className="bg-stone-950 border border-stone-800 rounded p-4 max-w-md mx-auto text-left text-xs font-mono space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-500">Enquiry Reference:</span>
                  <span className="text-emerald-400 font-bold">{submissionResult.enquiryId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Submission Date:</span>
                  <span className="text-stone-300">
                    {new Date(submissionResult.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Plants Included:</span>
                  <span className="text-stone-300">
                    {plantSchedule.reduce((a, b) => a + (b.plantQuantity || 1), 0)} items
                  </span>
                </div>
              </div>

              <p className="text-xs text-stone-300 max-w-md mx-auto leading-relaxed">
                Thank you, {customerName}. The ETR Plants interior landscaping team has received
                your project specifications and will contact you at {contactNumber} within one
                business day.
              </p>

              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded transition-colors"
                >
                  Return to Studio
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Design Snapshot Preview Banner */}
              {plantSchedule.length > 0 && (
                <div className="bg-stone-950 border border-stone-800 rounded p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>
                      Attached Plan:{' '}
                      <strong className="text-stone-100">
                        {plantSchedule.reduce((a, b) => a + (b.plantQuantity || 1), 0)} Plants &
                        Planters
                      </strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80">
                    Auto-Attached
                  </span>
                </div>
              )}

              {/* Required Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-stone-300 block mb-1">
                    Customer / Business Name <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Marina Bay Sands Hotel"
                      className="w-full bg-stone-950 border border-stone-800 pl-8 pr-3 py-2 text-xs rounded text-stone-100 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-stone-300 block mb-1">
                    Contact Phone Number <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="w-full bg-stone-950 border border-stone-800 pl-8 pr-3 py-2 text-xs rounded text-stone-100 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-stone-300 block mb-1">
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="procurement@hotel.com"
                      className="w-full bg-stone-950 border border-stone-800 pl-8 pr-3 py-2 text-xs rounded text-stone-100 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-stone-300 block mb-1">
                    Project Type
                  </label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 px-3 py-2 text-xs rounded text-stone-100 focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="Luxury Hotel / Resort">Luxury Hotel / Resort</option>
                    <option value="Corporate Headquarters / Office">Corporate Headquarters / Office</option>
                    <option value="Private Luxury Residence">Private Luxury Residence</option>
                    <option value="Restaurant / Lounge Bar">Restaurant / Lounge Bar</option>
                    <option value="Architectural Commercial Retail">Architectural Commercial Retail</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs text-stone-300 block mb-1">
                    Project Location / Site Address <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={projectLocation}
                      onChange={(e) => setProjectLocation(e.target.value)}
                      placeholder="e.g. 10 Bayfront Ave, Singapore / Level 44 Executive Floor"
                      className="w-full bg-stone-950 border border-stone-800 pl-8 pr-3 py-2 text-xs rounded text-stone-100 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs text-stone-300 block mb-1">
                    Plant Installation Timeline & Additional Notes
                  </label>
                  <textarea
                    rows={3}
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Specify target installation date, freight elevator access dimensions, or recurring maintenance service interest..."
                    className="w-full bg-stone-950 border border-stone-800 p-2.5 text-xs rounded text-stone-100 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Request Quotation from ETR Plants'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
