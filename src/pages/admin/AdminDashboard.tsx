// frontend/src/pages/admin/AdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  getAllUsers,
  updateUserRole,
  adminDeleteUser,
  clearAdminError,
} from '../../store/slices/userSlice';
import {
  getAllEnrollments,
  cancelEnrollment,
  resetEnrollmentState,
} from '../../store/slices/enrollmentSlice';
import {
  getAllPayments,
  getReceipt,
  resetPaymentState,
  clearReceipt,
} from '../../store/slices/paymentSlice';
import {
  getAllCourses,
  createCourse,
  getCourseCurriculum,
  createModule,
  deleteModule,
  createLesson,
  deleteLesson,
  clearCurrentLesson,
} from '../../store/slices/courseSlice';
import type { Course, Lesson, LessonLanguage, Module } from '../../interfaces/course.interface';
import type { IUser } from '../../interfaces/user.interface';
import type { Enrollment } from '../../interfaces/enrollment.interface';
import type { Payment } from '../../interfaces/payment.interface';

type TabType = 'overview' | 'users' | 'enrollments' | 'payments' | 'courses';

// Helper: Loading Skeleton
const SkeletonRow = ({ cols = 5 }: { cols?: number }) => (
  <tr className="animate-pulse">
    {Array(cols).fill(0).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </td>
    ))}
  </tr>
);

const AdminDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // ─── Global Selectors ─────────────────────────────────────────
  const { adminUsers, adminLoading, adminError } = useAppSelector(
    (state) => state.user
  );
  const { enrollments, loading: enrollLoading, error: enrollError } = useAppSelector(
    (state) => state.enrollment
  );
  const { payments, loading: payLoading, error: payError, receipt } = useAppSelector(
    (state) => state.payment
  );
  const {
    courses,
    currentCurriculum,
    loading: courseLoading,
    error: courseError,
  } = useAppSelector((state) => state.course);

  // ─── Local UI state for forms ─────────────────────────────────
  const [showReceipt, setShowReceipt] = useState(false);
  const [dismissError, setDismissError] = useState(false);

  // New course form
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    price: 0,
    duration: '',
    category: '',
  });

  // Module / Lesson creation
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [newModule, setNewModule] = useState({ title: '', description: '', order_index: 0 });
  const [newLesson, setNewLesson] = useState<{
    title: string;
    notes: string;
    language: LessonLanguage;
    starter_code: string;
    solution_code: string;
    order_index: number;
    module_id: string;
  }>({
    title: '',
    notes: '',
    language: 'javascript',
    starter_code: '',
    solution_code: '',
    order_index: 0,
    module_id: '',
  });

  // ─── Fetch all data on mount ──────────────────────────────────
  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(getAllEnrollments());
    dispatch(getAllPayments());
    dispatch(getAllCourses());
  }, [dispatch]);

  // Clear errors when leaving page
  useEffect(() => {
    return () => {
      dispatch(clearAdminError());
      dispatch(resetEnrollmentState());
      dispatch(resetPaymentState());
      dispatch(clearCurrentLesson());
    };
  }, [dispatch]);

  // ─── Handlers (unchanged) ─────────────────────────────────────
  const handleUpdateRole = async (userId: string, role: 'admin' | 'parent') => {
    await dispatch(updateUserRole({ userId, role }));
    dispatch(getAllUsers());
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await dispatch(adminDeleteUser(userId));
    }
  };

  const handleCancelEnrollment = async (enrollmentId: string) => {
    if (window.confirm('Cancel this enrollment?')) {
      await dispatch(cancelEnrollment(enrollmentId));
      dispatch(getAllEnrollments());
    }
  };

  const handleViewReceipt = async (paymentId: string) => {
    await dispatch(getReceipt(paymentId));
    setShowReceipt(true);
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(createCourse(newCourse));
    dispatch(getAllCourses());
    setNewCourse({ title: '', description: '', price: 0, duration: '', category: '' });
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    dispatch(getCourseCurriculum(courseId));
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    await dispatch(
      createModule({ ...newModule, course_id: selectedCourseId })
    );
    dispatch(getCourseCurriculum(selectedCourseId));
    setNewModule({ title: '', description: '', order_index: 0 });
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (window.confirm('Delete this module and all its lessons?')) {
      await dispatch(deleteModule(moduleId));
      if (selectedCourseId) dispatch(getCourseCurriculum(selectedCourseId));
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLesson.module_id) {
      alert('Please select a module');
      return;
    }
    await dispatch(createLesson(newLesson));
    if (selectedCourseId) dispatch(getCourseCurriculum(selectedCourseId));
    setNewLesson({
      title: '',
      notes: '',
      language: 'javascript',
      starter_code: '',
      solution_code: '',
      order_index: 0,
      module_id: '',
    });
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (window.confirm('Delete this lesson?')) {
      await dispatch(deleteLesson(lessonId));
      if (selectedCourseId) dispatch(getCourseCurriculum(selectedCourseId));
    }
  };

  // ─── Loading / Error States ───────────────────────────────────
  const isLoadingOverall =
    adminLoading || enrollLoading || payLoading || courseLoading;
  const globalError = adminError || enrollError || payError || courseError;
  const hasData = adminUsers.length > 0 || enrollments.length > 0 || payments.length > 0 || courses.length > 0;

  if (isLoadingOverall && !hasData) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>)}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1 md:mt-0">
            Manage users, enrollments, payments, and courses
          </p>
        </div>

        {/* Dismissible Error Alert */}
        {globalError && !dismissError && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm flex justify-between items-start">
            <p className="text-sm">{globalError}</p>
            <button
              onClick={() => setDismissError(true)}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Modern Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex flex-wrap gap-2" aria-label="Tabs">
            {(['overview', 'users', 'enrollments', 'payments', 'courses'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setDismissError(false);
                }}
                className={`
                  px-5 py-2.5 text-sm font-medium rounded-t-lg transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${activeTab === tab
                    ? 'bg-white text-blue-700 border-t border-l border-r border-gray-200 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'users' && adminUsers.length > 0 && (
                  <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                    {adminUsers.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={adminUsers.length}
                icon="👥"
                color="from-blue-500 to-blue-600"
              />
              <StatCard
                title="Enrollments"
                value={enrollments.length}
                icon="📚"
                color="from-green-500 to-green-600"
              />
              <StatCard
                title="Payments"
                value={payments.length}
                icon="💰"
                color="from-yellow-500 to-amber-600"
              />
              <StatCard
                title="Courses"
                value={courses.length}
                icon="🎓"
                color="from-purple-500 to-purple-600"
              />
            </div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800">Revenue Summary</h3>
              </div>
              <div className="p-6">
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-gray-900">
                    KES {payments
                      .filter((p) => p.status === 'completed')
                      .reduce((sum, p) => sum + p.amount, 0)
                      .toLocaleString()}
                  </p>
                  <span className="text-sm text-gray-500">total revenue</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  From {payments.filter((p) => p.status === 'completed').length} completed payments
                </p>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(payments.filter(p => p.status === 'completed').length / (payments.length || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Verified</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {adminLoading && !adminUsers.length ? (
                    Array(3).fill(0).map((_, i) => <SkeletonRow key={i} cols={5} />)
                  ) : (
                    adminUsers.map((user: IUser) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateRole(user.id, e.target.value as 'admin' | 'parent')}
                            className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="parent">Parent</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.is_verified ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Verified</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Unverified</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 font-medium transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Enrollments Tab */}
        {activeTab === 'enrollments' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kid</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fee</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Billing</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {enrollLoading && !enrollments.length ? (
                    Array(3).fill(0).map((_, i) => <SkeletonRow key={i} cols={6} />)
                  ) : (
                    enrollments.map((enrollment: Enrollment) => (
                      <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">{enrollment.kid_name || enrollment.kid_id}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{enrollment.course_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">KES {enrollment.fee_amount}</td>
                        <td className="px-6 py-4 text-sm capitalize text-gray-600">{enrollment.billing_cycle}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                            ${enrollment.status === 'active' ? 'bg-green-100 text-green-800' :
                              enrollment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {enrollment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleCancelEnrollment(enrollment.id)}
                            disabled={enrollment.status === 'cancelled'}
                            className="text-red-600 hover:text-red-900 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Receipt #</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kid</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payLoading && !payments.length ? (
                    Array(3).fill(0).map((_, i) => <SkeletonRow key={i} cols={8} />)
                  ) : (
                    payments.map((payment: Payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-mono text-gray-900">{payment.receipt_number}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{payment.kid_name || payment.kid_id}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{payment.course_name || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">KES {payment.amount}</td>
                        <td className="px-6 py-4 text-sm capitalize text-gray-600">{payment.method}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                            ${payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(payment.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleViewReceipt(payment.id)}
                            className="text-blue-600 hover:text-blue-800 font-medium transition"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Courses Tab (improved layout) */}
        {activeTab === 'courses' && (
          <div className="space-y-8">
            {/* Create Course Card */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">Create New Course</h3>
              </div>
              <form onSubmit={handleCreateCourse} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <input
                  type="text"
                  placeholder="Course title"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={newCourse.category}
                  onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition md:col-span-2"
                  rows={3}
                  required
                />
                <div className="flex gap-4 md:col-span-2">
                  <input
                    type="number"
                    placeholder="Price (KES)"
                    value={newCourse.price}
                    onChange={(e) => setNewCourse({ ...newCourse, price: Number(e.target.value) })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition w-full"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Duration (e.g., 6 weeks)"
                    value={newCourse.duration}
                    onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition w-full"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition shadow-sm">
                    + Create Course
                  </button>
                </div>
              </form>
            </div>

            {/* Course List & Curriculum Builder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Course List Card */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-700">All Courses</h3>
                </div>
                <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                  {courses.map((course: Course) => (
                    <li
                      key={course.id}
                      onClick={() => handleSelectCourse(course.id)}
                      className={`
                        px-5 py-3 cursor-pointer transition-all duration-150
                        ${selectedCourseId === course.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}
                      `}
                    >
                      <p className="font-medium text-gray-800">{course.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{course.category}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Curriculum Builder Card */}
              {selectedCourseId && currentCurriculum ? (
                <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                  <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <h3 className="text-xl font-bold text-gray-800">{currentCurriculum.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{currentCurriculum.description}</p>
                  </div>
                  <div className="p-5 space-y-5">
                    {/* Add Module Form */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-3">Add New Module</h4>
                      <form onSubmit={handleCreateModule} className="flex flex-wrap gap-3">
                        <input
                          type="text"
                          placeholder="Module title"
                          value={newModule.title}
                          onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Description (optional)"
                          value={newModule.description}
                          onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Order"
                          value={newModule.order_index}
                          onChange={(e) => setNewModule({ ...newModule, order_index: Number(e.target.value) })}
                          className="w-24 border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                        />
                        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm transition">
                          + Module
                        </button>
                      </form>
                    </div>

                    {/* Modules & Lessons */}
                    {currentCurriculum.modules.map((moduleItem: Module & { lessons: Lesson[] }) => (
                      <div key={moduleItem.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="flex justify-between items-center bg-gray-50 px-4 py-2">
                          <h4 className="font-bold text-gray-800">
                            {moduleItem.order_index}. {moduleItem.title}
                          </h4>
                          <button onClick={() => handleDeleteModule(moduleItem.id)} className="text-red-600 text-sm hover:underline">
                            Delete module
                          </button>
                        </div>
                        {moduleItem.description && (
                          <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                            {moduleItem.description}
                          </div>
                        )}

                        {/* Add Lesson Form inside module */}
                        <div className="p-4 border-b border-gray-100 bg-white">
                          <h5 className="text-sm font-semibold text-gray-700 mb-2">➕ Add Lesson to this module</h5>
                          <form onSubmit={handleCreateLesson} className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <input
                                type="text"
                                placeholder="Lesson title"
                                value={newLesson.title}
                                onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                                required
                              />
                              <select
                                value={newLesson.language}
                                onChange={(e) => setNewLesson({ ...newLesson, language: e.target.value as LessonLanguage })}
                                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                              >
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="html">HTML</option>
                                <option value="scratch">Scratch</option>
                              </select>
                            </div>
                            <textarea
                              placeholder="Notes (Markdown)"
                              value={newLesson.notes}
                              onChange={(e) => setNewLesson({ ...newLesson, notes: e.target.value })}
                              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full"
                              rows={2}
                            />
                            <textarea
                              placeholder="Starter code"
                              value={newLesson.starter_code}
                              onChange={(e) => setNewLesson({ ...newLesson, starter_code: e.target.value })}
                              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm font-mono w-full"
                              rows={2}
                            />
                            <div className="flex gap-3 items-center">
                              <input
                                type="number"
                                placeholder="Order"
                                value={newLesson.order_index}
                                onChange={(e) => setNewLesson({ ...newLesson, order_index: Number(e.target.value) })}
                                className="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => setNewLesson({ ...newLesson, module_id: moduleItem.id })}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition"
                              >
                                Use this module
                              </button>
                              <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded-md text-sm transition">
                                Create lesson
                              </button>
                            </div>
                          </form>
                        </div>

                        {/* Lessons list */}
                        {moduleItem.lessons.length > 0 && (
                          <ul className="divide-y divide-gray-100">
                            {moduleItem.lessons.map((lesson: Lesson) => (
                              <li key={lesson.id} className="flex justify-between items-center px-4 py-2 text-sm hover:bg-gray-50">
                                <span>
                                  {lesson.order_index}. {lesson.title} <span className="text-xs text-gray-400">({lesson.language})</span>
                                </span>
                                <button onClick={() => handleDeleteLesson(lesson.id)} className="text-red-500 text-xs hover:underline">
                                  Delete
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : selectedCourseId && !currentCurriculum ? (
                <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
                  Loading curriculum...
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Receipt Modal (improved) */}
        {showReceipt && receipt && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl transform transition-all">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">🧾 Payment Receipt</h3>
                <button
                  onClick={() => {
                    setShowReceipt(false);
                    dispatch(clearReceipt());
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3 text-sm border-t border-b border-gray-100 py-4">
                <div className="flex justify-between"><span className="font-medium">Receipt #</span><span>{receipt.receipt_number}</span></div>
                <div className="flex justify-between"><span className="font-medium">Date</span><span>{new Date(receipt.date).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="font-medium">Parent</span><span>{receipt.parent_name}</span></div>
                <div className="flex justify-between"><span className="font-medium">Kid</span><span>{receipt.kid_name}</span></div>
                <div className="flex justify-between"><span className="font-medium">Course</span><span>{receipt.course_name}</span></div>
                <div className="flex justify-between"><span className="font-medium">Amount</span><span className="font-bold">KES {receipt.amount}</span></div>
                <div className="flex justify-between"><span className="font-medium">Method</span><span className="capitalize">{receipt.method}</span></div>
                <div className="flex justify-between"><span className="font-medium">Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${receipt.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {receipt.status}
                  </span>
                </div>
                {receipt.reference && <div className="flex justify-between"><span className="font-medium">Reference</span><span>{receipt.reference}</span></div>}
                {receipt.description && <div className="flex justify-between"><span className="font-medium">Description</span><span>{receipt.description}</span></div>}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowReceipt(false);
                    dispatch(clearReceipt());
                  }}
                  className="bg-gray-200 hover:bg-gray-300 px-5 py-2 rounded-lg text-gray-800 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Improved StatCard with gradient & animation
const StatCard: React.FC<{ title: string; value: number; icon: string; color: string }> = ({
  title,
  value,
  icon,
  color,
}) => (
  <div className={`bg-gradient-to-br ${color} rounded-xl shadow-md p-6 text-white transform transition-transform hover:scale-105 duration-200`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm uppercase tracking-wide opacity-80">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <div className="text-5xl drop-shadow-lg">{icon}</div>
    </div>
  </div>
);

export default AdminDashboard;