import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';
import { PlantScheduleItem } from '../types';
import { submitEnquiryToCloud } from '../lib/firestoreService';

interface ContactViewProps {
  currentPlantSchedule?: PlantScheduleItem[];
  onStartDesigning: () => void;
}

export const ContactView: React.FC<ContactViewProps> = ({
  currentPlantSchedule = [],
  onStartDesigning,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [projectType, setProjectType] = useState('Luxury Hotel / Resort');
  const [plantRequirements, setPlantRequirements] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmationData, setConfirmationData] = useState<{
    id: string;
    timestamp: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !contactNumber || !projectLocation) {
      setSubmitError('Please complete required fields: Name, Phone, and Project Location.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Persist to Cloud Firestore database
      submitEnquiryToCloud({
        customerName,
        contactNumber,
        email,
        projectLocation,
        projectType,
        plantRequirements,
        additionalNotes,
        plantSchedule: currentPlantSchedule,
      }).catch((cloudErr) => {
        console.warn('Cloud Firestore enquiry note:', cloudErr);
      });

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
          plantSchedule: currentPlantSchedule,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit enquiry.');
      }

      setConfirmationData({
        id: data.enquiryId,
        timestamp: data.timestamp,
      });
    } catch (err: any) {
      setSubmitError(err.message || 'Submission error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-stone-800 pb-20">
      {/* Header */}
      <div className="bg-stone-900 border-b border-stone-800 text-stone-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-emerald-400 text-xs font-mono tracking-wider uppercase mb-2">
            Commercial Landscaping Consultations
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-white">
            Contact ETR Plants & Request Quotation
          </h1>
          <p className="text-stone-400 text-sm mt-2 max-w-2xl font-light">
            Our interior landscaping team collaborates directly with general managers, architects,
            and procurement specialists to supply healthy, acclimated plants and custom planters.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Business Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-200 shadow-sm space-y-6">
              <div>
                <h3 className="font-serif text-xl font-medium text-stone-900">
                  ETR Plants Business Office
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Bespoke interior botanical installations and commercial maintenance
                </p>
              </div>

              <div className="space-y-4 text-xs text-stone-600">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] uppercase text-stone-400 block">
                      Direct Email
                    </span>
                    <a
                      href="mailto:etrplants@gmail.com"
                      className="font-medium text-emerald-800 hover:underline text-sm"
                    >
                      etrplants@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] uppercase text-stone-400 block">
                      Services
                    </span>
                    <span className="text-stone-800">
                      Indoor Specimen Sourcing · Custom Fiberglass Fabrication · Sub-irrigation Liners
                      · Biophilic Space Audits
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] uppercase text-stone-400 block">
                      Consultation Hours
                    </span>
                    <span className="text-stone-800">
                      Monday – Saturday: 8:00 AM – 6:00 PM
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Studio Schedule Preview if available */}
              {currentPlantSchedule.length > 0 && (
                <div className="bg-stone-50 border border-stone-200 rounded p-4 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-medium">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Active Studio Design Attached</span>
                  </div>
                  <p className="text-stone-500 text-[11px]">
                    Your current design contains{' '}
                    <strong>
                      {currentPlantSchedule.reduce((a, b) => a + (b.plantQuantity || 1), 0)} plants
                    </strong>
                    . Submitting this form will automatically include the itemized schedule in your
                    quotation request!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Enquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-200 shadow-sm">
              {confirmationData ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-2xl font-light text-stone-900">
                    Quotation Request Received
                  </h3>
                  <div className="bg-stone-50 border border-stone-200 rounded p-4 max-w-sm mx-auto text-xs font-mono text-stone-700 space-y-1">
                    <div>Reference: {confirmationData.id}</div>
                    <div className="text-stone-400 text-[10px]">
                      {new Date(confirmationData.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                    Thank you, {customerName}. An ETR Plants project manager will prepare your
                    itemized proposal including delivery and installation timelines.
                  </p>
                  <button
                    onClick={() => {
                      setConfirmationData(null);
                      onStartDesigning();
                    }}
                    className="mt-4 px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-medium rounded transition-colors"
                  >
                    Open Design Studio
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="font-serif text-xl font-medium text-stone-900">
                    Request an Official Project Quotation
                  </h3>

                  {submitError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-stone-700 block mb-1">
                        Customer / Firm Name <span className="text-emerald-700">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Grand Hyatt Hotels"
                        className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs rounded text-stone-900 focus:border-emerald-700 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-stone-700 block mb-1">
                        Contact Phone Number <span className="text-emerald-700">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        placeholder="+1 (555) 234-5678"
                        className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs rounded text-stone-900 focus:border-emerald-700 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-stone-700 block mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="projects@architecture.com"
                        className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs rounded text-stone-900 focus:border-emerald-700 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-stone-700 block mb-1">
                        Project Sector
                      </label>
                      <select
                        value={projectType}
                        onChange={(e) => setProjectType(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs rounded text-stone-900 focus:border-emerald-700 focus:bg-white focus:outline-none"
                      >
                        <option value="Luxury Hotel / Resort">Luxury Hotel / Resort</option>
                        <option value="Corporate Headquarters">Corporate Headquarters</option>
                        <option value="Luxury Residential Villa">Luxury Residential Villa</option>
                        <option value="Restaurant & Hospitality Lounge">
                          Restaurant & Hospitality Lounge
                        </option>
                        <option value="Commercial Mall / Atrium">Commercial Mall / Atrium</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-stone-700 block mb-1">
                        Project Site Location / City <span className="text-emerald-700">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={projectLocation}
                        onChange={(e) => setProjectLocation(e.target.value)}
                        placeholder="e.g. Marina Bay Sands, Singapore / Level 52 Executive Lounge"
                        className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs rounded text-stone-900 focus:border-emerald-700 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-stone-700 block mb-1">
                        Scope & Timeline Notes
                      </label>
                      <textarea
                        rows={4}
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        placeholder="Specify target installation date, freight elevator access, lighting lux requirements, or plant maintenance needs..."
                        className="w-full bg-stone-50 border border-stone-300 p-3 text-xs rounded text-stone-900 focus:border-emerald-700 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-medium rounded flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? 'Submitting...' : 'Request Quotation from ETR Plants'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
