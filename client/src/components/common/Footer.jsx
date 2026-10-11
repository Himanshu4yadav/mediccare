import React from 'react';
import { HeartPulse, Github, Mail, ShieldAlert, Award, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Disclaimer */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-medic-500 flex items-center justify-center text-white">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white">MedicCare</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Smart Hospital & Emergency Management System. Developed for Computer Science & Engineering capstone project demonstrating scalable full-stack web architecture and real-world Data Structures and Algorithms.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">System Modules</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/patient/dashboard" className="hover:text-medic-400 transition-colors">
                  Patient Portal
                </Link>
              </li>
              <li>
                <Link to="/doctor/dashboard" className="hover:text-medic-400 transition-colors">
                  Doctor Clinic Console
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="hover:text-medic-400 transition-colors">
                  Hospital Admin Command
                </Link>
              </li>
              <li>
                <Link to="/dsa-lab" className="hover:text-teal-400 text-teal-300 font-medium transition-colors">
                  DSA Interactive Algorithm Lab
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Algorithms Implemented */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">DSA Implementations</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• Binary Max-Heap (Emergency Triage)</li>
              <li>• Circular Queue (Bed Waiting Buffer)</li>
              <li>• Singly Linked List (Status History)</li>
              <li>• Adjacency List Graph (BFS/DFS Routing)</li>
              <li>• Linear & Binary Search Comparison</li>
              <li>• Bubble Sort vs Merge Sort Benchmark</li>
            </ul>
          </div>

          {/* Col 4: Safety & Academic Disclaimer */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Project Notice</h4>
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-[11px] text-red-200 leading-relaxed flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Academic Demonstration:</strong> For real life-threatening emergencies, dial 911 or your local emergency services immediately. This application is an educational prototype.
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-medic-400" />
              <span>Emergency Hotline Demo: 1-800-MEDICCARE</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MedicCare – Smart Hospital & Emergency Management System. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <span>React Vite</span>
            <span>•</span>
            <span>Tailwind CSS</span>
            <span>•</span>
            <span>Node / Express</span>
            <span>•</span>
            <span>MongoDB Mongoose</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
