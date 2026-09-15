import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from '../lib/supabase';
import { fetchPatientCase, fetchPatientIndex } from '../features/genomics/genomicsSlice';
import type { RootState, AppDispatch } from '../app/store';
import { motion, AnimatePresence } from 'framer-motion';
import CaseUploadModal from './CaseUploadModal';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 1024);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // FIX: Added search state back
  const dispatch = useDispatch<AppDispatch>();
  const { patientIndex, activeCaseId } = useSelector((state: RootState) => state.genomics);

  useEffect(() => {
    dispatch(fetchPatientIndex());
  }, [dispatch]);

  const handleLogout = () => supabase.auth.signOut();

  // FIX: Filter logic applied to the index
  const filteredPatients = patientIndex?.filter(p => 
    p.internal_id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <>
      <motion.aside 
        animate={{ width: isOpen ? 320 : 88 }}
        transition={{ type: "spring", damping: 22, stiffness: 110 }}
        className="h-screen bg-pin-charcoal flex flex-col z-50 shadow-2xl relative border-r border-white/5"
      >
        {/* Header Section */}
        <div className="p-6 flex items-center justify-between overflow-hidden h-20 shrink-0">
          <AnimatePresence>
            {isOpen && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em] whitespace-nowrap"
              >
                Genomic Intelligence
              </motion.span>
            )}
          </AnimatePresence>
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500 hover:text-white transition-colors p-2 cursor-pointer shrink-0">
            {isOpen ? '«' : '»'}
          </button>
        </div>

        {/* Action Button & Search */}
        <div className="px-5 mb-4 shrink-0">
          <button 
            onClick={() => setIsModalOpen(true)}
            className={`w-full flex items-center bg-white/5 border border-white/10 rounded-2xl transition-colors hover:bg-pin-red hover:border-transparent group h-14 mb-4 ${isOpen ? 'px-4 gap-4' : 'justify-center'}`}
          >
            <span className="text-white text-xl font-light">+</span>
            {isOpen && <span className="text-[10px] font-bold text-white uppercase tracking-widest">New Case</span>}
          </button>

          {/* FIX: Search Input */}
          <AnimatePresence>
            {isOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <input 
                  type="text" 
                  placeholder="Search patient ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-transparent rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:border-white/20 focus:outline-none transition-colors"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Patient List with Staggered Animations */}
        <div className="flex-1 px-5 overflow-y-auto custom-scrollbar pb-6">
          <AnimatePresence>
            {isOpen && (
              <motion.div initial="hidden" animate="show" exit="hidden" className="space-y-2 mt-2">
                <p className="px-2 text-[9px] font-black text-gray-500 uppercase tracking-widest mb-4">Patient Archive</p>
                
                <AnimatePresence>
                  {filteredPatients.map((p, i) => (
                    <motion.button
                      key={p.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }} // Stagger effect
                      onClick={() => dispatch(fetchPatientCase(p.id))}
                      className={`w-full flex flex-col gap-1 p-4 rounded-2xl transition-colors text-left border group ${activeCaseId === p.id ? 'bg-pin-red border-transparent shadow-lg shadow-pin-red/20' : 'bg-transparent border-white/5 hover:bg-white/5'}`}
                    >
                      <span className={`text-sm font-black tracking-tight ${activeCaseId === p.id ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                        {p.internal_id}
                      </span>
                      {/* FIX: Improved Date Contrast and Size */}
                      <span className={`text-[10px] font-medium ${activeCaseId === p.id ? 'text-white/70' : 'text-gray-400'}`}>
                        {p.last_date}
                      </span>
                    </motion.button>
                  ))}
                </AnimatePresence>

                {filteredPatients.length === 0 && (
                  <p className="text-center text-xs text-gray-500 italic mt-6">No patients found.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Socials & Auth */}
        <div className="p-6 border-t border-white/5 space-y-6 shrink-0">
          <div className={`flex items-center gap-6 ${!isOpen && 'flex-col'}`}>
            <a href="https://www.linkedin.com/in/saoshyant-mansouri/" rel="me noopener noreferrer" target="_blank" className="text-gray-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">LinkedIn</a>
            <a href="https://www.mhdmansouri.com/" rel="author" className="text-gray-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">WEB</a>
          </div>
          <button onClick={handleLogout} className={`flex items-center gap-3 text-gray-500 hover:text-pin-red transition-colors cursor-pointer ${!isOpen && 'justify-center'}`}>
            <span className="text-lg">⏻</span>
            {isOpen && <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      <CaseUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}