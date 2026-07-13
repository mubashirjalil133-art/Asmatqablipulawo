/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, UserCheck, UserX, Plus, Search, Filter, Edit, Trash2, 
  Phone, Key, Calendar, Clock, CheckCircle, X, Shield, MapPin,
  ClipboardList, CheckCircle2, ChevronRight, UserMinus, AlertCircle, Sparkles
} from 'lucide-react';
import { StaffMember, AttendanceRecord, StaffRole, Table, Language } from '../types';

interface RmsStaffManagerProps {
  language: Language;
  tables: Table[];
}

export default function RmsStaffManager({ language, tables }: RmsStaffManagerProps) {
  const isUrdu = language === 'ur';

  // --- Core States ---
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [activeView, setActiveView] = useState<'directory' | 'attendance' | 'history'>('directory');
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  
  // Form States
  const [formNameEn, setFormNameEn] = useState('');
  const [formNameUr, setFormNameUr] = useState('');
  const [formRole, setFormRole] = useState<StaffRole>('waiter');
  const [formPhone, setFormPhone] = useState('');
  const [formPin, setFormPin] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formAssignedTables, setFormAssignedTables] = useState<number[]>([]);
  const [formAssignedSection, setFormAssignedSection] = useState('');
  const [formError, setFormError] = useState('');

  // Attendance Sheet date
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toLocaleDateString('en-CA') // YYYY-MM-DD local
  );

  // Load and seed staff and attendance data
  useEffect(() => {
    const savedStaff = localStorage.getItem('asmat_rms_staff');
    const savedAttendance = localStorage.getItem('asmat_rms_attendance');

    // Default Seed Staff
    const defaultStaff: StaffMember[] = [
      {
        id: 'st-1',
        nameEn: 'Mubashir Jalil',
        nameUr: 'مبشر جلیل',
        role: 'admin',
        phone: '0302-1112223',
        pin: '1234',
        status: 'active',
        joinedDate: '2025-01-10'
      },
      {
        id: 'st-2',
        nameEn: 'Azlan Shah',
        nameUr: 'ازلان شاہ',
        role: 'waiter',
        phone: '0303-4445556',
        pin: '5678',
        status: 'active',
        assignedTables: [1, 2, 3, 4],
        assignedSection: 'Main Hall A',
        joinedDate: '2025-02-15'
      },
      {
        id: 'st-3',
        nameEn: 'Zeeshan',
        nameUr: 'ذیشان',
        role: 'cashier',
        phone: '0304-7778889',
        pin: '0000',
        status: 'active',
        joinedDate: '2025-03-01'
      },
      {
        id: 'st-4',
        nameEn: 'Azmatullah',
        nameUr: 'عصمت اللہ',
        role: 'kitchen',
        phone: '0305-9990001',
        pin: '9876',
        status: 'active',
        assignedSection: 'Pulao Station',
        joinedDate: '2025-01-05'
      },
      {
        id: 'st-5',
        nameEn: 'Habib-ur-Rehman',
        nameUr: 'حبیب الرحمن',
        role: 'manager',
        phone: '0333-5556667',
        pin: '4321',
        status: 'active',
        joinedDate: '2025-04-12'
      },
      {
        id: 'st-6',
        nameEn: 'Suleman Khan',
        nameUr: 'سلیمان خان',
        role: 'kitchen',
        phone: '0312-8889990',
        pin: '1111',
        status: 'inactive',
        assignedSection: 'Tandoor BBQ',
        joinedDate: '2025-05-18'
      }
    ];

    if (savedStaff) {
      setStaffList(JSON.parse(savedStaff));
    } else {
      setStaffList(defaultStaff);
      localStorage.setItem('asmat_rms_staff', JSON.stringify(defaultStaff));
    }

    // Default Seed Attendance
    const todayStr = new Date().toLocaleDateString('en-CA');
    const yesterdayStr = new Date(Date.now() - 86400000).toLocaleDateString('en-CA');

    const defaultAttendance: AttendanceRecord[] = [
      {
        id: 'att-1',
        staffId: 'st-1',
        staffNameEn: 'Mubashir Jalil',
        staffNameUr: 'مبشر جلیل',
        role: 'admin',
        date: yesterdayStr,
        status: 'present',
        checkIn: '09:15 AM',
        checkOut: '09:30 PM',
        notes: 'Monthly management meeting'
      },
      {
        id: 'att-2',
        staffId: 'st-2',
        staffNameEn: 'Azlan Shah',
        staffNameUr: 'ازلان شاہ',
        role: 'waiter',
        date: yesterdayStr,
        status: 'present',
        checkIn: '11:45 AM',
        checkOut: '11:00 PM'
      },
      {
        id: 'att-3',
        staffId: 'st-3',
        staffNameEn: 'Zeeshan',
        staffNameUr: 'ذیشان',
        role: 'cashier',
        date: yesterdayStr,
        status: 'late',
        checkIn: '12:15 PM',
        checkOut: '11:30 PM',
        notes: 'Traffic delay'
      },
      {
        id: 'att-4',
        staffId: 'st-4',
        staffNameEn: 'Azmatullah',
        staffNameUr: 'عصمت اللہ',
        role: 'kitchen',
        date: yesterdayStr,
        status: 'present',
        checkIn: '10:30 AM',
        checkOut: '10:00 PM'
      }
    ];

    if (savedAttendance) {
      setAttendance(JSON.parse(savedAttendance));
    } else {
      setAttendance(defaultAttendance);
      localStorage.setItem('asmat_rms_attendance', JSON.stringify(defaultAttendance));
    }
  }, []);

  // Save changes helper
  const saveStaffToStorage = (updatedStaff: StaffMember[]) => {
    setStaffList(updatedStaff);
    localStorage.setItem('asmat_rms_staff', JSON.stringify(updatedStaff));
    // Dispatch event to keep other tabs/views updated (like defaultWaiters references in POS)
    window.dispatchEvent(new Event('storage'));
  };

  const saveAttendanceToStorage = (updatedAttendance: AttendanceRecord[]) => {
    setAttendance(updatedAttendance);
    localStorage.setItem('asmat_rms_attendance', JSON.stringify(updatedAttendance));
  };

  // --- Modal Form Actions ---
  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setFormNameEn('');
    setFormNameUr('');
    setFormRole('waiter');
    setFormPhone('');
    // Generate a random unique 4-digit PIN
    let randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    while (staffList.some(s => s.pin === randomPin)) {
      randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    }
    setFormPin(randomPin);
    setFormStatus('active');
    setFormAssignedTables([]);
    setFormAssignedSection('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (staff: StaffMember) => {
    setEditingStaff(staff);
    setFormNameEn(staff.nameEn);
    setFormNameUr(staff.nameUr);
    setFormRole(staff.role);
    setFormPhone(staff.phone);
    setFormPin(staff.pin);
    setFormStatus(staff.status);
    setFormAssignedTables(staff.assignedTables || []);
    setFormAssignedSection(staff.assignedSection || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDeleteStaff = (staffId: string) => {
    const confirmDelete = window.confirm(
      isUrdu 
        ? "کیا آپ واقعی اس اسٹاف ممبر کو خارج کرنا چاہتے ہیں؟" 
        : "Are you sure you want to remove this staff member?"
    );
    if (confirmDelete) {
      const updated = staffList.filter(s => s.id !== staffId);
      saveStaffToStorage(updated);
    }
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formNameEn || !formNameUr || !formPin || !formPhone) {
      setFormError(isUrdu ? "براہ کرم تمام لازمی فیلڈز پُر کریں!" : "Please fill in all required fields!");
      return;
    }

    if (formPin.length !== 4 || isNaN(Number(formPin))) {
      setFormError(isUrdu ? "پن کوڈ لازمی طور پر ۴ ہندسوں کا ہونا چاہیے!" : "PIN must be exactly 4 numeric digits!");
      return;
    }

    // Check if PIN is already taken by another staff member
    const pinConflict = staffList.find(s => s.pin === formPin && s.id !== (editingStaff?.id || ''));
    if (pinConflict) {
      setFormError(
        isUrdu 
          ? `یہ پن کوڈ پہلے ہی ${pinConflict.nameUr} کے زیر استعمال ہے!` 
          : `This PIN is already being used by ${pinConflict.nameEn}!`
      );
      return;
    }

    if (editingStaff) {
      // Edit mode
      const updated = staffList.map(s => {
        if (s.id === editingStaff.id) {
          return {
            ...s,
            nameEn: formNameEn,
            nameUr: formNameUr,
            role: formRole,
            phone: formPhone,
            pin: formPin,
            status: formStatus,
            assignedTables: formRole === 'waiter' ? formAssignedTables : undefined,
            assignedSection: (formRole === 'waiter' || formRole === 'kitchen') ? formAssignedSection : undefined
          };
        }
        return s;
      });
      saveStaffToStorage(updated);
    } else {
      // Add mode
      const newMember: StaffMember = {
        id: `st-${Date.now()}`,
        nameEn: formNameEn,
        nameUr: formNameUr,
        role: formRole,
        phone: formPhone,
        pin: formPin,
        status: formStatus,
        assignedTables: formRole === 'waiter' ? formAssignedTables : undefined,
        assignedSection: (formRole === 'waiter' || formRole === 'kitchen') ? formAssignedSection : undefined,
        joinedDate: new Date().toLocaleDateString('en-CA')
      };
      saveStaffToStorage([...staffList, newMember]);
    }

    setIsModalOpen(false);
  };

  // Checkbox table assignment toggle
  const toggleTableAssignment = (tableNum: number) => {
    setFormAssignedTables(prev => 
      prev.includes(tableNum) 
        ? prev.filter(t => t !== tableNum) 
        : [...prev, tableNum].sort((a,b)=>a-b)
    );
  };

  // --- Attendance Grid Saving ---
  const handleMarkAttendance = (staffId: string, status: AttendanceRecord['status'], fields: Partial<AttendanceRecord> = {}) => {
    const staff = staffList.find(s => s.id === staffId);
    if (!staff) return;

    const existingIndex = attendance.findIndex(a => a.staffId === staffId && a.date === attendanceDate);

    let updatedAttendance = [...attendance];

    if (existingIndex !== -1) {
      // Update existing record for the day
      updatedAttendance[existingIndex] = {
        ...updatedAttendance[existingIndex],
        status,
        ...fields
      };
    } else {
      // Create new record
      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}-${staffId}`,
        staffId,
        staffNameEn: staff.nameEn,
        staffNameUr: staff.nameUr,
        role: staff.role,
        date: attendanceDate,
        status,
        checkIn: status === 'present' || status === 'late' ? '12:00 PM' : undefined,
        ...fields
      };
      updatedAttendance.unshift(newRecord);
    }

    saveAttendanceToStorage(updatedAttendance);
  };

  // Multi status helper
  const getAttendanceForStaff = (staffId: string, date: string) => {
    return attendance.find(a => a.staffId === staffId && a.date === date);
  };

  // --- Filtering Staff Directory ---
  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = 
      staff.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.nameUr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.phone.includes(searchTerm) ||
      staff.pin.includes(searchTerm);

    const matchesRole = roleFilter === 'all' || staff.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || staff.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Role labeling helpers
  const getRoleBadgeColor = (role: StaffRole) => {
    switch (role) {
      case 'admin': return 'bg-red-500/10 text-red-500 border border-red-500/20';
      case 'manager': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'cashier': return 'bg-sky-500/10 text-sky-500 border border-sky-500/20';
      case 'waiter': return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'kitchen': return 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
    }
  };

  const getRoleName = (role: StaffRole) => {
    if (isUrdu) {
      switch (role) {
        case 'admin': return 'ایڈمن مینیجر';
        case 'manager': return 'مینیجر کنٹرولر';
        case 'cashier': return 'کیشیئر POS';
        case 'waiter': return 'سروس ویٹر';
        case 'kitchen': return 'کچن شیف';
      }
    } else {
      switch (role) {
        case 'admin': return 'Administrator';
        case 'manager': return 'Manager';
        case 'cashier': return 'POS Cashier';
        case 'waiter': return 'Waiter';
        case 'kitchen': return 'Kitchen Chef';
      }
    }
  };

  // Stats calculation
  const totalStaffCount = staffList.length;
  const activeStaffCount = staffList.filter(s => s.status === 'active').length;
  const inactiveStaffCount = totalStaffCount - activeStaffCount;

  // Present today
  const attendanceToday = attendance.filter(a => a.date === attendanceDate);
  const presentTodayCount = attendanceToday.filter(a => a.status === 'present' || a.status === 'late' || a.status === 'half-day').length;
  const attendanceRate = activeStaffCount > 0 
    ? Math.round((presentTodayCount / activeStaffCount) * 100) 
    : 0;

  return (
    <div id="staff-management-container" className="space-y-6">
      
      {/* 1. Quick Info Analytics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Staff */}
        <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black text-stone-400 block tracking-wider">
              {isUrdu ? "کل عملہ" : "Total Roster"}
            </span>
            <span className="text-2xl font-black text-stone-900 dark:text-white font-mono block">
              {totalStaffCount}
            </span>
            <span className="text-[10px] text-stone-500 block">
              {isUrdu ? `${activeStaffCount} فعال | ${inactiveStaffCount} غیر فعال` : `${activeStaffCount} Active | ${inactiveStaffCount} Suspended`}
            </span>
          </div>
          <div className="bg-amber-500/10 p-3 rounded-xl text-amber-500">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Present Today */}
        <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black text-stone-400 block tracking-wider">
              {isUrdu ? "آج حاضر ملازمین" : "Present Today"}
            </span>
            <span className="text-2xl font-black text-stone-900 dark:text-white font-mono block">
              {presentTodayCount}
            </span>
            <span className="text-[10px] text-stone-500 block">
              {isUrdu ? `توجہ تاریخ: ${attendanceDate}` : `Target Date: ${attendanceDate}`}
            </span>
          </div>
          <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-500">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>

        {/* Attendance Percentage */}
        <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black text-stone-400 block tracking-wider">
              {isUrdu ? "حاضری کا تناسب" : "Attendance Rate"}
            </span>
            <span className="text-2xl font-black text-stone-900 dark:text-white font-mono block">
              {attendanceRate}%
            </span>
            <span className="text-[10px] text-stone-500 block">
              {isUrdu ? "فعال عملے کی حاضری فیصد" : "Percentage of active staff"}
            </span>
          </div>
          <div className="bg-red-500/10 p-3 rounded-xl text-red-500">
            <ClipboardList className="h-6 w-6" />
          </div>
        </div>

        {/* Quick Help Card */}
        <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black text-stone-400 block tracking-wider">
              {isUrdu ? "حفاظتی ڈیوٹی" : "Security Access"}
            </span>
            <span className="text-xs font-black text-red-800 dark:text-amber-500 block uppercase mt-1">
              🛡️ {isUrdu ? "ایڈمنسٹریٹر لاگ ان" : "Administrator"}
            </span>
            <p className="text-[9px] text-stone-500 leading-tight">
              {isUrdu ? "صرف ایڈمن عملے کا ڈیٹا شامل، ترمیم یا حذف کر سکتا ہے۔" : "Only Admin can manage rosters & assignments."}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Views Toggles */}
      <div className="flex bg-stone-200/40 dark:bg-stone-950/35 p-1 rounded-xl border border-stone-150 dark:border-stone-800/80 max-w-md">
        <button
          onClick={() => setActiveView('directory')}
          className={`flex-1 text-center py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${activeView === 'directory' ? 'bg-red-800 text-white dark:bg-amber-500 dark:text-stone-950' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-400'}`}
        >
          🗂️ {isUrdu ? "عملہ ڈائریکٹری" : "Staff Directory"}
        </button>
        <button
          onClick={() => setActiveView('attendance')}
          className={`flex-1 text-center py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${activeView === 'attendance' ? 'bg-red-800 text-white dark:bg-amber-500 dark:text-stone-950' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-400'}`}
        >
          📝 {isUrdu ? "روزانہ حاضری شیٹ" : "Mark Attendance"}
        </button>
        <button
          onClick={() => setActiveView('history')}
          className={`flex-1 text-center py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${activeView === 'history' ? 'bg-red-800 text-white dark:bg-amber-500 dark:text-stone-950' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-400'}`}
        >
          📅 {isUrdu ? "سابقہ ریکارڈ" : "History Logs"}
        </button>
      </div>

      {/* 3. STAFF DIRECTORY VIEW */}
      {activeView === 'directory' && (
        <div className="space-y-4">
          
          {/* Filters & Actions Block */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-stone-950 p-4 border border-stone-200 dark:border-stone-850 rounded-2xl shadow-sm">
            
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder={isUrdu ? "نام، فون یا پن سے تلاش کریں..." : "Search name, phone, PIN..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:ring-1 focus:ring-amber-500 ${isUrdu ? 'text-right' : 'text-left'}`}
              />
            </div>

            {/* Quick Filter Selects */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {/* Role filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2 text-xs font-bold text-stone-600 dark:text-stone-300 outline-none"
              >
                <option value="all">{isUrdu ? "تمام عہدے" : "All Roles"}</option>
                <option value="admin">{isUrdu ? "ایڈمن" : "Admin"}</option>
                <option value="manager">{isUrdu ? "مینیجر" : "Manager"}</option>
                <option value="cashier">{isUrdu ? "کیشیئر" : "Cashier"}</option>
                <option value="waiter">{isUrdu ? "ویٹر" : "Waiter"}</option>
                <option value="kitchen">{isUrdu ? "کچن شیف" : "Kitchen Chef"}</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2 text-xs font-bold text-stone-600 dark:text-stone-300 outline-none"
              >
                <option value="all">{isUrdu ? "تمام حیثیت" : "All Status"}</option>
                <option value="active">{isUrdu ? "صرف فعال" : "Active Only"}</option>
                <option value="inactive">{isUrdu ? "غیر فعال" : "Inactive Only"}</option>
              </select>

              {/* Add New Staff Button */}
              <button
                onClick={handleOpenAddModal}
                className="rounded-xl bg-red-800 hover:bg-red-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-950 text-xs px-4 py-2 font-black shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span>{isUrdu ? "نیا اسٹاف شامل کریں" : "Add New Staff"}</span>
              </button>
            </div>
          </div>

          {/* Grid / List of Staff Members */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.length === 0 ? (
              <div className="col-span-full py-16 text-center border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-3xl bg-white dark:bg-stone-950/20">
                <AlertCircle className="h-10 w-10 text-stone-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-stone-500">
                  {isUrdu ? "کوئی ممبر ریکارڈ میں نہیں ملا!" : "No staff members matched your search criteria."}
                </p>
              </div>
            ) : (
              filteredStaff.map((staff) => (
                <motion.div
                  key={staff.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl bg-white dark:bg-stone-950 border ${staff.status === 'active' ? 'border-stone-200 dark:border-stone-800/80 hover:border-amber-500/40' : 'border-stone-150 dark:border-stone-900 bg-stone-50/50 dark:bg-stone-950/40 opacity-75'} p-5 shadow-sm space-y-4 relative overflow-hidden flex flex-col justify-between`}
                >
                  
                  {/* Status Indicator */}
                  <div className="absolute top-4 right-4 flex items-center gap-1">
                    <span className={`h-2.5 w-2.5 rounded-full ${staff.status === 'active' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-stone-400'}`} />
                    <span className="text-[9px] font-black uppercase text-stone-400">
                      {staff.status === 'active' ? (isUrdu ? 'فعال' : 'Active') : (isUrdu ? 'غیر فعال' : 'Inactive')}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {/* Header info */}
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-full flex items-center justify-center text-stone-950 dark:text-stone-100 font-extrabold text-sm uppercase ${staff.status === 'active' ? 'bg-gradient-to-tr from-stone-100 to-stone-200 dark:from-stone-900 dark:to-stone-850' : 'bg-stone-200 dark:bg-stone-900'}`}>
                        {staff.nameEn.split(' ').map(w=>w[0]).join('')}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-1.5">
                          <span>{isUrdu ? staff.nameUr : staff.nameEn}</span>
                          {isUrdu && <span className="text-[10px] text-stone-400 font-normal">({staff.nameEn})</span>}
                        </h4>
                        <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-md mt-1 ${getRoleBadgeColor(staff.role)}`}>
                          {getRoleName(staff.role)}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-stone-100 dark:border-stone-900 pt-3.5 space-y-2 text-xs text-stone-500">
                      
                      {/* Phone */}
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-stone-400" />
                        <span className="font-mono">{staff.phone}</span>
                      </div>

                      {/* Login PIN (Only displayed to authorized manager/admin interface, here shown clearly) */}
                      <div className="flex items-center gap-2">
                        <Key className="h-3.5 w-3.5 text-stone-400" />
                        <span>
                          {isUrdu ? "سسٹم لاگ ان پن کوڈ: " : "Secure POS PIN: "}
                          <span className="font-mono font-extrabold text-red-800 dark:text-amber-500 bg-stone-100 dark:bg-stone-900 py-0.5 px-2 rounded">
                            {staff.pin}
                          </span>
                        </span>
                      </div>

                      {/* Assignments based on roles */}
                      {staff.role === 'waiter' && (
                        <div className="bg-stone-50 dark:bg-stone-900/60 p-2.5 rounded-lg border border-stone-100 dark:border-stone-850 space-y-1 mt-2">
                          <span className="text-[9px] font-black uppercase text-amber-500 tracking-wider block">
                            🍽️ {isUrdu ? "تفویض کردہ ٹیبلز" : "Assigned Tables"}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {staff.assignedTables && staff.assignedTables.length > 0 ? (
                              staff.assignedTables.map(t => (
                                <span key={t} className="text-[10px] font-mono font-bold bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 px-1.5 py-0.5 rounded">
                                  T{t}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-stone-400 italic">
                                {isUrdu ? "کوئی ٹیبل مقرر نہیں" : "No tables assigned"}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {staff.role === 'kitchen' && (
                        <div className="bg-stone-50 dark:bg-stone-900/60 p-2.5 rounded-lg border border-stone-100 dark:border-stone-850 space-y-1 mt-2">
                          <span className="text-[9px] font-black uppercase text-purple-500 tracking-wider block">
                            👨‍🍳 {isUrdu ? "کچن تفویض سیکشن" : "Kitchen Duty Post"}
                          </span>
                          <span className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block">
                            {staff.assignedSection || (isUrdu ? "عام کچن ڈیوٹی" : "General Kitchen Duty")}
                          </span>
                        </div>
                      )}

                      {staff.assignedSection && staff.role !== 'kitchen' && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-stone-400" />
                          <span>{isUrdu ? "ڈیوٹی ہال/سیکشن: " : "Duty Post/Area: "} <strong>{staff.assignedSection}</strong></span>
                        </div>
                      )}

                      <div className="text-[10px] text-stone-400 pt-1">
                        {isUrdu ? `شمولیت کی تاریخ: ${staff.joinedDate}` : `Joined: ${staff.joinedDate}`}
                      </div>

                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="border-t border-stone-100 dark:border-stone-900 pt-3 flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => handleOpenEditModal(staff)}
                      className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
                      title={isUrdu ? "ترمیم کریں" : "Edit Staff Info"}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStaff(staff.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-stone-400 hover:text-red-500 transition-colors cursor-pointer"
                      title={isUrdu ? "حذف کریں" : "Remove Staff"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. DAILY ATTENDANCE MARKING SHEET */}
      {activeView === 'attendance' && (
        <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-2xl shadow-sm p-6 space-y-6">
          
          {/* Header & Date Configuration */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-stone-150 dark:border-stone-900 pb-5">
            <div>
              <h3 className="text-base font-black text-stone-900 dark:text-white font-serif">
                {isUrdu ? "ملازمین کی روزانہ حاضری رجسٹر" : "Daily Staff Attendance Ledger"}
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                {isUrdu ? "پکوان اسٹاف، ویٹرز اور کیشیئرز کی روزانہ حاضری، آمد اور رخصتی درج کریں۔" : "Log physical roster check-ins, tardiness, and departures daily."}
              </p>
            </div>

            <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-900/60 p-2 rounded-xl border border-stone-200/50 dark:border-stone-800">
              <Calendar className="h-4 w-4 text-amber-500 shrink-0" />
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="bg-transparent border-none text-xs font-black outline-none font-mono text-stone-800 dark:text-stone-200 cursor-pointer"
              />
            </div>
          </div>

          {/* Active staff roster checklist */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" style={{ direction: isUrdu ? 'rtl' : 'ltr' }}>
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 text-[10px] font-black uppercase text-stone-400 tracking-wider">
                  <th className="py-3 px-4">{isUrdu ? "ملازم کا نام" : "Staff Name"}</th>
                  <th className="py-3 px-4">{isUrdu ? "عہدہ" : "Role"}</th>
                  <th className="py-3 px-4 text-center">{isUrdu ? "حاضری صورتحال" : "Attendance Status"}</th>
                  <th className="py-3 px-4">{isUrdu ? "لاگ ان / لاگ آؤٹ وقت" : "In / Out Timings"}</th>
                  <th className="py-3 px-4">{isUrdu ? "تفصیل / ریمارکس" : "Duty Remarks"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-900 text-xs">
                {staffList.filter(s => s.status === 'active').length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-stone-400">
                      {isUrdu ? "کوئی فعال ملازم نہیں ملا!" : "No active staff members found."}
                    </td>
                  </tr>
                ) : (
                  staffList.filter(s => s.status === 'active').map((staff) => {
                    const record = getAttendanceForStaff(staff.id, attendanceDate);
                    const currentStatus = record?.status;

                    return (
                      <tr key={staff.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-950/20 transition-colors">
                        
                        {/* Name and Phone */}
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-stone-900 dark:text-white block">
                            {isUrdu ? staff.nameUr : staff.nameEn}
                          </span>
                          <span className="text-[10px] text-stone-400 block mt-0.5">{staff.phone}</span>
                        </td>

                        {/* Role Badge */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${getRoleBadgeColor(staff.role)}`}>
                            {getRoleName(staff.role)}
                          </span>
                        </td>

                        {/* Status marking selector */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex gap-1.5 p-1 bg-stone-100 dark:bg-stone-900/80 rounded-xl border border-stone-200/40 dark:border-stone-800">
                            {[
                              { code: 'present' as const, label: isUrdu ? 'حاضر' : 'Present', colorClass: 'bg-emerald-600 text-white' },
                              { code: 'late' as const, label: isUrdu ? 'تاخیر' : 'Late', colorClass: 'bg-amber-500 text-stone-950 font-black' },
                              { code: 'half-day' as const, label: isUrdu ? 'ہاف ڈے' : 'Half Day', colorClass: 'bg-indigo-600 text-white' },
                              { code: 'absent' as const, label: isUrdu ? 'غیر حاضر' : 'Absent', colorClass: 'bg-red-600 text-white' }
                            ].map((statusBtn) => {
                              const isActive = currentStatus === statusBtn.code;
                              return (
                                <button
                                  key={statusBtn.code}
                                  onClick={() => handleMarkAttendance(staff.id, statusBtn.code)}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer transition-all ${isActive ? statusBtn.colorClass : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'}`}
                                >
                                  {statusBtn.label}
                                </button>
                              );
                            })}
                          </div>
                        </td>

                        {/* Clock In / Out fields */}
                        <td className="py-3.5 px-4 space-y-1.5">
                          {(currentStatus === 'present' || currentStatus === 'late' || currentStatus === 'half-day') ? (
                            <div className="flex gap-2 font-mono">
                              <div className="flex items-center gap-1 bg-stone-50 dark:bg-stone-900 px-2 py-1 rounded border border-stone-200 dark:border-stone-850">
                                <Clock className="h-3 w-3 text-emerald-500" />
                                <input
                                  type="text"
                                  value={record.checkIn || '09:00 AM'}
                                  onChange={(e) => handleMarkAttendance(staff.id, currentStatus, { checkIn: e.target.value })}
                                  className="bg-transparent w-16 text-center text-[10px] outline-none font-bold"
                                />
                              </div>
                              <div className="flex items-center gap-1 bg-stone-50 dark:bg-stone-900 px-2 py-1 rounded border border-stone-200 dark:border-stone-850">
                                <Clock className="h-3 w-3 text-red-500" />
                                <input
                                  type="text"
                                  placeholder="09:00 PM"
                                  value={record.checkOut || ''}
                                  onChange={(e) => handleMarkAttendance(staff.id, currentStatus, { checkOut: e.target.value })}
                                  className="bg-transparent w-16 text-center text-[10px] outline-none font-bold"
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-stone-400 italic text-[10px]">
                              {isUrdu ? "ڈیوٹی آف" : "Off Duty"}
                            </span>
                          )}
                        </td>

                        {/* Notes / Remarks */}
                        <td className="py-3.5 px-4">
                          <input
                            type="text"
                            placeholder={isUrdu ? "ڈیوٹی ریمارکس..." : "Notes (e.g. sick, on leave)..."}
                            value={record?.notes || ''}
                            onChange={(e) => handleMarkAttendance(staff.id, currentStatus || 'present', { notes: e.target.value })}
                            className="bg-stone-50 dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850 rounded px-2 py-1 w-full text-[10px] outline-none focus:border-amber-500"
                          />
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Confirmation message */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
              ✓ {isUrdu ? "تبدیلیاں خودکار طور پر لوکل اسٹوریج میں محفوظ کر دی گئی ہیں۔" : "Roster markings are saved in real-time. System attendance audit report ready."}
            </p>
          </div>

        </div>
      )}

      {/* 5. HISTORIC ATTENDANCE RECORD VIEW */}
      {activeView === 'history' && (
        <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-2xl shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-base font-black text-stone-900 dark:text-white font-serif">
              {isUrdu ? "حاضری لاگ بک تاریخ" : "Historical Attendance Logs"}
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              {isUrdu ? "ملازمین کے حاضری ریکارڈ کی تفصیلی لسٹ اور سابقہ ریمارکس کا جائزہ لیں۔" : "Audit complete log history of attendance, check-ins, and late occurrences."}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" style={{ direction: isUrdu ? 'rtl' : 'ltr' }}>
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 text-[10px] font-black uppercase text-stone-400 tracking-wider">
                  <th className="py-3 px-4">{isUrdu ? "تاریخ" : "Date"}</th>
                  <th className="py-3 px-4">{isUrdu ? "عملے کا نام" : "Staff Name"}</th>
                  <th className="py-3 px-4">{isUrdu ? "عہدہ" : "Role"}</th>
                  <th className="py-3 px-4 text-center">{isUrdu ? "حیثیت" : "Status"}</th>
                  <th className="py-3 px-4">{isUrdu ? "لاگ ان / لاگ آؤٹ" : "In / Out"}</th>
                  <th className="py-3 px-4">{isUrdu ? "ریمارکس" : "Remarks"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-900 text-xs">
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-stone-400">
                      {isUrdu ? "کوئی حاضری ریکارڈ دستیاب نہیں!" : "No historical records found."}
                    </td>
                  </tr>
                ) : (
                  attendance.map((log) => (
                    <tr key={log.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-950/20 transition-colors font-mono">
                      
                      {/* Date */}
                      <td className="py-3 px-4 text-stone-900 dark:text-stone-300 font-bold">
                        {log.date}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4 font-sans font-black text-stone-900 dark:text-stone-100">
                        {isUrdu ? log.staffNameUr : log.staffNameEn}
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4 font-sans">
                        <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${getRoleBadgeColor(log.role)}`}>
                          {getRoleName(log.role)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center font-sans">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                          log.status === 'present' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/45 dark:text-emerald-400' 
                            : log.status === 'late'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/45 dark:text-amber-400'
                            : log.status === 'half-day'
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/45 dark:text-indigo-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-950/45 dark:text-red-400'
                        }`}>
                          {log.status === 'present' && (isUrdu ? 'حاضر' : 'Present')}
                          {log.status === 'late' && (isUrdu ? 'تاخیر' : 'Late')}
                          {log.status === 'half-day' && (isUrdu ? 'ہاف ڈے' : 'Half Day')}
                          {log.status === 'absent' && (isUrdu ? 'غیر حاضر' : 'Absent')}
                        </span>
                      </td>

                      {/* Timings */}
                      <td className="py-3 px-4 font-bold text-stone-600 dark:text-stone-300">
                        {log.checkIn ? `${log.checkIn} - ${log.checkOut || 'Active'}` : '-'}
                      </td>

                      {/* Notes */}
                      <td className="py-3 px-4 font-sans text-stone-500 italic max-w-xs truncate">
                        {log.notes || '-'}
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT STAFF MEMBER DIALOG MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-stone-950/85 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 text-white overflow-hidden max-h-[90vh] overflow-y-auto"
              style={{ direction: isUrdu ? 'rtl' : 'ltr' }}
            >
              {/* Background glow elements */}
              <div className="absolute -top-12 -left-12 h-36 w-36 rounded-full bg-red-800/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 h-36 w-36 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

              {/* Title Header */}
              <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-6">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 font-serif">
                  <Shield className="h-5 w-5 text-amber-500" />
                  <span>
                    {editingStaff 
                      ? (isUrdu ? "سٹاف ملازم کی تفصیلات میں ترمیم" : "Edit Staff Member Details")
                      : (isUrdu ? "نیا اسٹاف ملازم شامل کریں" : "Roster New Staff Member")}
                  </span>
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full bg-stone-800 hover:bg-stone-750 text-stone-400 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Feedback Error */}
              {formError && (
                <div className="bg-red-950/40 border border-red-500/30 text-red-400 rounded-xl p-3.5 text-xs font-bold text-center mb-5 flex items-center justify-center gap-1.5">
                  <AlertCircle className="h-4 w-4" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Form body */}
              <form onSubmit={handleSaveStaff} className="space-y-4 text-stone-300 text-xs">
                
                {/* 2 languages naming */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-stone-400 tracking-wider">
                      {isUrdu ? "ملازم کا انگریزی نام *" : "Staff Name (English) *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Azlan Shah"
                      value={formNameEn}
                      onChange={(e) => setFormNameEn(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-amber-500 text-white font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-stone-400 tracking-wider">
                      {isUrdu ? "ملازم کا اردو نام *" : "Staff Name (Urdu) *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: ازلان شاہ"
                      value={formNameUr}
                      onChange={(e) => setFormNameUr(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-amber-500 text-white font-bold text-right"
                    />
                  </div>
                </div>

                {/* Role Selector and Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-stone-400 tracking-wider">
                      {isUrdu ? "ملازم کا عہدہ (Role) *" : "Staff Duty Role *"}
                    </label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value as StaffRole)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-amber-500 text-white font-bold"
                    >
                      <option value="admin">{isUrdu ? "ایڈمن مینیجر (Admin)" : "Administrator (Admin)"}</option>
                      <option value="manager">{isUrdu ? "مینیجر کنٹرولر (Manager)" : "Controller (Manager)"}</option>
                      <option value="cashier">{isUrdu ? "کیشیئر POS کاؤنٹر (Cashier)" : "POS Billing Counter (Cashier)"}</option>
                      <option value="waiter">{isUrdu ? "سروس فلور ویٹر (Waiter)" : "Service Floor Staff (Waiter)"}</option>
                      <option value="kitchen">{isUrdu ? "کچن شیف کوک (Kitchen Chef)" : "Kitchen Culinary (Kitchen)"}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-stone-400 tracking-wider">
                      {isUrdu ? "موبائل فون نمبر *" : "Mobile Phone No *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 0303-1234567"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-amber-500 text-white font-mono"
                    />
                  </div>
                </div>

                {/* Secure Pin & status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-stone-400 tracking-wider">
                      {isUrdu ? "۴ ہندسوں کا سیکیور لاگ ان پن کوڈ *" : "Secure 4-Digit POS PIN *"}
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      placeholder="e.g. 5678"
                      value={formPin}
                      onChange={(e) => setFormPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-amber-500 text-white font-mono font-extrabold tracking-widest text-center"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-stone-400 tracking-wider">
                      {isUrdu ? "ملازم کی حیثیت" : "Roster Status"}
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-stone-950 p-1 border border-stone-800 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setFormStatus('active')}
                        className={`py-2 rounded-lg text-[10px] font-extrabold cursor-pointer transition-all ${formStatus === 'active' ? 'bg-emerald-600 text-white font-black' : 'text-stone-500 hover:text-stone-300'}`}
                      >
                        {isUrdu ? "فعال (Active)" : "Active"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormStatus('inactive')}
                        className={`py-2 rounded-lg text-[10px] font-extrabold cursor-pointer transition-all ${formStatus === 'inactive' ? 'bg-stone-800 text-stone-400' : 'text-stone-500 hover:text-stone-300'}`}
                      >
                        {isUrdu ? "غیر فعال (Inactive)" : "Inactive"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Waiter Assign tables section */}
                {formRole === 'waiter' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2 border-t border-stone-800/60 pt-3"
                  >
                    <label className="block text-[10px] font-black uppercase text-stone-400 tracking-wider">
                      🍽️ {isUrdu ? "ٹیبلز تفویض کریں (Assign tables)" : "Assign Duty Tables"}
                    </label>
                    <p className="text-[10px] text-stone-500 leading-tight">
                      {isUrdu ? "منتخب کریں کہ یہ ویٹر کن کن ٹیبلز کا ذمہ دار ہو گا۔" : "Choose the table numbers this floor waiter is assigned to serve."}
                    </p>
                    <div className="grid grid-cols-5 gap-2 bg-stone-950 p-3 rounded-xl border border-stone-800">
                      {tables.map(table => {
                        const isAssigned = formAssignedTables.includes(table.number);
                        return (
                          <button
                            key={table.id}
                            type="button"
                            onClick={() => toggleTableAssignment(table.number)}
                            className={`py-2 rounded-lg text-[10px] font-bold cursor-pointer transition-all border ${
                              isAssigned 
                                ? 'bg-emerald-600 border-emerald-500 text-white font-black' 
                                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                            }`}
                          >
                            T{table.number}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Kitchen / general sections */}
                {(formRole === 'waiter' || formRole === 'kitchen') && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-1.5 border-t border-stone-800/60 pt-3"
                  >
                    <label className="block text-[10px] font-black uppercase text-stone-400 tracking-wider">
                      📍 {isUrdu ? "تفویض کردہ ڈیوٹی سٹیشن / کچن سیکشن" : "Assign Duty Post / Station Section"}
                    </label>
                    <input
                      type="text"
                      placeholder={isUrdu ? "مثال: کباب کاؤنٹر، فیملی ہال، تندور پوزیشن..." : "e.g. BBQ Counter, Family Hall, Tandoor Station..."}
                      value={formAssignedSection}
                      onChange={(e) => setFormAssignedSection(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-amber-500 text-white font-bold"
                    />
                  </motion.div>
                )}

                {/* Submit action buttons */}
                <div className="flex gap-3 pt-4 border-t border-stone-800">
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-gradient-to-r from-red-800 to-red-950 hover:from-red-700 hover:to-red-800 text-white text-xs py-3 font-black shadow-lg transition-all cursor-pointer text-center active:scale-95"
                  >
                    💾 {isUrdu ? "تفصیلات محفوظ کریں" : "Save Staff Member"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-400 text-xs px-6 py-3 font-bold transition-all cursor-pointer text-center"
                  >
                    {isUrdu ? "منسوخ کریں" : "Cancel"}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
