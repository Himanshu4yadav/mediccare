import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import EmergencyModal from '../components/forms/EmergencyModal';
import AppointmentModal from '../components/forms/AppointmentModal';
import AlertBanner from '../components/common/AlertBanner';
import api from '../services/api';
import {
  HeartPulse,
  Activity,
  BedDouble,
  CalendarCheck,
  ShieldAlert,
  Clock,
  ArrowRight,
  Stethoscope,
  ChevronRight,
  Award,
  Users,
  CheckCircle2,
  Code2,
  PhoneCall
} from 'lucide-react';

const LandingPage = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    bedStats: { available: 0, total: 0 }
  });
  const [doctors, setDoctors] = useState([]);
  const [beds, setBeds] = useState([]);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [doctorsRes, bedsRes] = await Promise.all([
        api.get('/doctors').catch(() => ({ data: { data: [] } })),
        api.get('/beds').catch(() => ({ data: { data: [], statistics: { total: 0, available: 0 } } }))
      ]);

      if (doctorsRes.data?.data) {
        setDoctors(doctorsRes.data.data.slice(0, 4));
      }

      if (bedsRes.data?.data) {
        setBeds(bedsRes.data.data.slice(0, 6));
        setStats((prev) => ({
          ...prev,
          totalDoctors: doctorsRes.data.count || 0,
          bedStats: {
            total: bedsRes.data.statistics?.total || bedsRes.data.data.length,
            available: bedsRes.data.statistics?.available || 0
          }
        }));
      }
    } catch (err) {
      console.warn('Backend offline or initializing:', err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Prominent Safety Notification Banner */}
      <div className="bg-red-600 text-white px-4 py-2 text-xs font-medium text-center flex items-center justify-center space-x-2 shadow-inner">
        <ShieldAlert className="w-4 h-4 flex-shrink-0 animate-pulse" />
        <span>
          <strong>Emergency Safety Notice:</strong> For life-threatening emergencies, contact your local emergency services (e.g. 911 / 112) immediately. MedicCare is a college engineering project.
        </span>
      </div>

      {notice && (
        <div className="max-w-7xl mx-auto px-4 mt-4 w-full">
          <AlertBanner
            type="success"
            title="Action Received"
            message={notice}
            onClose={() => setNotice(null)}
          />
        </div>
      )}

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-medic-50/80 via-white to-slate-50 py-16 md:py-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-medic-100/80 border border-medic-200 text-medic-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
                <span>Smart Hospital & Emergency Operations Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Smarter Healthcare.{' '}
                <span className="bg-gradient-to-r from-medic-600 via-tealbrand-500 to-medic-700 bg-clip-text text-transparent">
                  Faster Emergency Response.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
                MedicCare bridges patient appointments, real-time hospital bed allocations, and priority-queued emergency triage using deterministic computer science data structures.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => setIsAppointmentOpen(true)}
                  className="w-full sm:w-auto px-7 py-3.5 bg-medic-600 hover:bg-medic-700 text-white font-semibold rounded-xl shadow-lg shadow-medic-600/30 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2"
                >
                  <CalendarCheck className="w-5 h-5" />
                  <span>Book Appointment</span>
                </button>

                <button
                  onClick={() => setIsEmergencyOpen(true)}
                  className="w-full sm:w-auto px-7 py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2 glow-emergency"
                >
                  <ShieldAlert className="w-5 h-5" />
                  <span>Emergency Help</span>
                </button>

                <Link
                  to="/dsa-lab"
                  className="w-full sm:w-auto px-5 py-3.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2 text-sm"
                >
                  <Code2 className="w-4 h-4 text-teal-600" />
                  <span>Explore DSA Lab</span>
                </Link>
              </div>

              {/* Live Status Counters */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{doctors.length || 3}+</p>
                  <p className="text-xs text-slate-500 font-medium">Specialist Doctors</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.bedStats.available || 6} / {stats.bedStats.total || 8}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">Beds Available</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-teal-600">O(log N)</p>
                  <p className="text-xs text-slate-500 font-medium">Heap Triage Complexity</p>
                </div>
              </div>
            </div>

            {/* Hero Right Visual: Emergency Triage Flow Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200/80 relative">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-ping"></div>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Live Triage Engine (Binary Max-Heap)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                    Heap Root = Max Priority
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-red-700 uppercase px-1.5 py-0.5 bg-red-100 rounded">
                        Critical • Score 110
                      </span>
                      <p className="text-xs font-bold text-slate-900 mt-1">Cardiac Arrest Emergency</p>
                      <p className="text-[11px] text-slate-500">Bay 4 • Immediate Resuscitation</p>
                    </div>
                    <span className="text-xs font-bold text-red-600 px-2 py-1 bg-white rounded-md shadow-sm border border-red-200">
                      Rank #1
                    </span>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-700 uppercase px-1.5 py-0.5 bg-amber-100 rounded">
                        High • Score 85
                      </span>
                      <p className="text-xs font-bold text-slate-900 mt-1">Compound Trauma Collision</p>
                      <p className="text-[11px] text-slate-500">Highway 102 • Assigned Dr. Alan</p>
                    </div>
                    <span className="text-xs font-bold text-amber-600 px-2 py-1 bg-white rounded-md shadow-sm border border-amber-200">
                      Rank #2
                    </span>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-blue-700 uppercase px-1.5 py-0.5 bg-blue-100 rounded">
                        Medium • Score 50
                      </span>
                      <p className="text-xs font-bold text-slate-900 mt-1">Orthopedic Fracture Evaluation</p>
                      <p className="text-[11px] text-slate-500">OPD Waiting Room • In Queue</p>
                    </div>
                    <span className="text-xs font-bold text-blue-600 px-2 py-1 bg-white rounded-md shadow-sm border border-blue-200">
                      Rank #3
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Real-Time Heap Rebalancing</span>
                  </span>
                  <Link to="/dsa-lab" className="text-medic-600 hover:underline font-semibold">
                    Test in DSA Lab →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE FEATURES SECTION */}
      <section id="services" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-medic-600 mb-2">Hospital Modules</h2>
            <h3 className="text-3xl font-extrabold text-slate-900">
              End-to-End Hospital Management Architecture
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              Designed with role-based segregation and robust algorithmic workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-medic-300 transition-all hover:shadow-md group">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Emergency Triage</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Prioritizes emergencies using a Binary Max-Heap algorithm ensuring critical cases are addressed before lower severities.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-semibold text-medic-600 flex items-center space-x-1">
                <span>Binary Max-Heap Triage</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-medic-300 transition-all hover:shadow-md group">
              <div className="w-12 h-12 rounded-xl bg-medic-100 text-medic-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Doctor Appointments</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Book consultations with specialized doctors with automated duplicate slot prevention and cancellation policies.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-semibold text-medic-600 flex items-center space-x-1">
                <span>Conflict-Free Slot Engine</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-medic-300 transition-all hover:shadow-md group">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <BedDouble className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Bed Availability</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tracks occupied, available, and reserved beds across ICU, Emergency, and General wards with Circular Queue waiting lists.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-semibold text-medic-600 flex items-center space-x-1">
                <span>Circular Queue Waiting List</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-medic-300 transition-all hover:shadow-md group">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Patient Records</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Secure digital health records and status audit trails with strict role-based access control and Singly Linked List history.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-semibold text-medic-600 flex items-center space-x-1">
                <span>Linked List Audit Trails</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BED TRACKER PREVIEW SECTION */}
      <section id="beds" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-medic-600 mb-2">Ward Inventory</h2>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Hospital Bed Availability</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Real-time bed occupancy records directly retrieved from the database.
              </p>
            </div>
            <Link
              to="/login"
              className="mt-4 md:mt-0 text-xs font-semibold text-medic-600 hover:text-medic-700 flex items-center space-x-1"
            >
              <span>Manage beds in admin dashboard</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {beds.length > 0 ? (
              beds.map((bed) => (
                <div key={bed._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <BedDouble className="w-4 h-4 text-slate-500" />
                      <span className="font-bold text-sm text-slate-900">{bed.bedNumber}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{bed.ward}</p>
                    <p className="text-[11px] text-slate-400">{bed.bedType}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      bed.status === 'Available'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : bed.status === 'Occupied'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {bed.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 col-span-3 text-center py-6">
                Connect backend and run database seeder to inspect live hospital beds.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 4. DOCTORS DIRECTORY */}
      <section id="doctors" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-medic-600 mb-2">Clinical Team</h2>
            <h3 className="text-3xl font-extrabold text-slate-900">Qualified Medical Specialists</h3>
            <p className="text-sm text-slate-500 mt-2">
              Book consultations directly with certified physicians across major specialties.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.length > 0 ? (
              doctors.map((doc) => (
                <div key={doc._id} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-center hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 rounded-full bg-medic-100 text-medic-700 font-bold text-lg flex items-center justify-center mx-auto mb-3 border-2 border-white shadow-sm">
                    {doc.name.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{doc.name}</h4>
                  <p className="text-xs font-medium text-medic-600 mt-0.5">{doc.specialization}</p>
                  <p className="text-[11px] text-slate-400">{doc.department}</p>
                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Fee: ₹{doc.consultationFee || 500}</span>
                    <button
                      onClick={() => setIsAppointmentOpen(true)}
                      className="px-2.5 py-1 bg-medic-600 hover:bg-medic-700 text-white rounded text-[11px] font-semibold transition-colors"
                    >
                      Book
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center py-6 text-xs text-slate-500">
                Doctor registry initialized upon backend database connection.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-2">System Workflow</h2>
            <h3 className="text-3xl font-extrabold text-white">How MedicCare Works</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 text-center">
              <span className="w-8 h-8 rounded-full bg-medic-500 text-white font-bold text-xs flex items-center justify-center mx-auto mb-3">
                1
              </span>
              <h4 className="text-sm font-bold mb-1">Registration & Role Login</h4>
              <p className="text-xs text-slate-400">
                Patients, doctors, and admins access role-scoped portals protected by JWT and bcrypt password hashing.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 text-center">
              <span className="w-8 h-8 rounded-full bg-red-500 text-white font-bold text-xs flex items-center justify-center mx-auto mb-3">
                2
              </span>
              <h4 className="text-sm font-bold mb-1">Emergency Triage</h4>
              <p className="text-xs text-slate-400">
                Patient triggers emergency request. Binary Max-Heap prioritizes critical severity in O(log N) triage order.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 text-center">
              <span className="w-8 h-8 rounded-full bg-teal-500 text-white font-bold text-xs flex items-center justify-center mx-auto mb-3">
                3
              </span>
              <h4 className="text-sm font-bold mb-1">Bed Waiting Buffer</h4>
              <p className="text-xs text-slate-400">
                When wards reach maximum capacity, patients enter a Circular Queue guaranteeing fair FIFO allocation.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 text-center">
              <span className="w-8 h-8 rounded-full bg-purple-500 text-white font-bold text-xs flex items-center justify-center mx-auto mb-3">
                4
              </span>
              <h4 className="text-sm font-bold mb-1">Audit Trail & Records</h4>
              <p className="text-xs text-slate-400">
                Status transitions are logged through Singly Linked Lists while doctors issue diagnoses and prescriptions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        onSuccess={(caseItem) => {
          setNotice(`Emergency request registered successfully (Severity: ${caseItem.severity}). Prioritized in triage heap.`);
        }}
      />

      <AppointmentModal
        isOpen={isAppointmentOpen}
        onClose={() => setIsAppointmentOpen(false)}
        onSuccess={(appt) => {
          setNotice(`Appointment booked successfully for ${appt.appointmentDate} (${appt.timeSlot}).`);
        }}
      />

      <Footer />
    </div>
  );
};

export default LandingPage;
