// frontend/src/pages/admin/AdminDashboard.tsx (fixed)
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

  // ─── Handlers ─────────────────────────────────────────────────
  const handleUpdateRole = async (userId: string, role: 'admin' | 'parent') => {
    await dispatch(updateUserRole({ userId, role }));
    dispatch(getAllUsers()); // refresh list
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
  const isLoading =
    adminLoading || enrollLoading || payLoading || courseLoading;
  const globalError = adminError || enrollError || payError || courseError;

  if (isLoading && !adminUsers.length && !enrollments.length && !payments.length && !courses.length) {
    return <div className="p-8 text-center">Loading admin dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {globalError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {globalError}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b">
        {(['overview', 'users', 'enrollments', 'payments', 'courses'] as TabType[]).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium rounded-t-lg ${
                activeTab === tab
                  ? 'bg-white text-blue-600 border-t border-l border-r'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={adminUsers.length}
            icon="👥"
            color="bg-blue-500"
          />
          <StatCard
            title="Enrollments"
            value={enrollments.length}
            icon="📚"
            color="bg-green-500"
          />
          <StatCard
            title="Payments"
            value={payments.length}
            icon="💰"
            color="bg-yellow-500"
          />
          <StatCard
            title="Courses"
            value={courses.length}
            icon="🎓"
            color="bg-purple-500"
          />
          <div className="col-span-full bg-white p-6 rounded shadow">
            <h3 className="text-xl font-semibold mb-2">Revenue Summary</h3>
            <p className="text-3xl font-bold">
              KES{' '}
              {payments
                .filter((p) => p.status === 'completed')
                .reduce((sum, p) => sum + p.amount, 0)
                .toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              From {payments.filter((p) => p.status === 'completed').length} completed
              payments
            </p>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {adminUsers.map((user: IUser) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleUpdateRole(user.id, e.target.value as 'admin' | 'parent')
                      }
                      className="border rounded px-2 py-1"
                    >
                      <option value="parent">Parent</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.is_verified ? '✅' : '❌'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Enrollments Tab */}
      {activeTab === 'enrollments' && (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Billing</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enrollment: Enrollment) => (
                <tr key={enrollment.id}>
                  <td className="px-6 py-4">{enrollment.kid_name || enrollment.kid_id}</td>
                  <td className="px-6 py-4">{enrollment.course_name}</td>
                  <td className="px-6 py-4">KES {enrollment.fee_amount}</td>
                  <td className="px-6 py-4 capitalize">{enrollment.billing_cycle}</td>
                  <td className="px-6 py-4 capitalize">{enrollment.status}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleCancelEnrollment(enrollment.id)}
                      disabled={enrollment.status === 'cancelled'}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment: Payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4">{payment.receipt_number}</td>
                  <td className="px-6 py-4">{payment.kid_name || payment.kid_id}</td>
                  <td className="px-6 py-4">{payment.course_name || '-'}</td>
                  <td className="px-6 py-4">KES {payment.amount}</td>
                  <td className="px-6 py-4">{payment.method}</td>
                  <td className="px-6 py-4 capitalize">{payment.status}</td>
                  <td className="px-6 py-4">{new Date(payment.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewReceipt(payment.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="space-y-8">
          {/* Create Course Form */}
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-xl font-semibold mb-4">Create New Course</h3>
            <form onSubmit={handleCreateCourse} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Title"
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                className="border p-2 rounded"
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={newCourse.category}
                onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                className="border p-2 rounded"
                required
              />
              <textarea
                placeholder="Description"
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                className="border p-2 rounded"
                rows={2}
                required
              />
              <div className="flex gap-4">
                <input
                  type="number"
                  placeholder="Price"
                  value={newCourse.price}
                  onChange={(e) => setNewCourse({ ...newCourse, price: Number(e.target.value) })}
                  className="border p-2 rounded w-full"
                  required
                />
                <input
                  type="text"
                  placeholder="Duration (e.g., 6 weeks)"
                  value={newCourse.duration}
                  onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Create Course
              </button>
            </form>
          </div>

          {/* Course List & Curriculum Builder */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Course List */}
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-2">All Courses</h3>
              <ul className="space-y-2">
                {courses.map((course: Course) => (
                  <li
                    key={course.id}
                    className={`p-2 rounded cursor-pointer ${
                      selectedCourseId === course.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleSelectCourse(course.id)}
                  >
                    {course.title}
                  </li>
                ))}
              </ul>
            </div>

            {/* Curriculum Builder */}
            {selectedCourseId && currentCurriculum && (
              <div className="lg:col-span-2 bg-white p-4 rounded shadow">
                <h3 className="text-xl font-bold mb-2">{currentCurriculum.title}</h3>
                <p className="text-gray-600 mb-4">{currentCurriculum.description}</p>

                {/* Add Module */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold mb-2">Add Module</h4>
                  <form onSubmit={handleCreateModule} className="flex gap-2 flex-wrap">
                    <input
                      type="text"
                      placeholder="Module Title"
                      value={newModule.title}
                      onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                      className="border p-1 rounded"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={newModule.description}
                      onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                      className="border p-1 rounded"
                    />
                    <input
                      type="number"
                      placeholder="Order"
                      value={newModule.order_index}
                      onChange={(e) =>
                        setNewModule({ ...newModule, order_index: Number(e.target.value) })
                      }
                      className="border p-1 rounded w-20"
                    />
                    <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">
                      Add Module
                    </button>
                  </form>
                </div>

                {/* Modules and Lessons */}
                {currentCurriculum.modules.map((moduleItem: Module & { lessons: Lesson[] }) => (
                  <div key={moduleItem.id} className="border rounded p-3 mt-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold">
                        {moduleItem.order_index}. {moduleItem.title}
                      </h4>
                      <button
                        onClick={() => handleDeleteModule(moduleItem.id)}
                        className="text-red-600 text-sm"
                      >
                        Delete Module
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">{moduleItem.description}</p>

                    {/* Add Lesson Form */}
                    <div className="mt-3 pl-4 border-l-2">
                      <h5 className="text-sm font-semibold">Add Lesson</h5>
                      <form
                        onSubmit={handleCreateLesson}
                        className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1"
                      >
                        <input
                          type="text"
                          placeholder="Lesson Title"
                          value={newLesson.title}
                          onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                          className="border p-1 rounded text-sm"
                          required
                        />
                        <select
                          value={newLesson.language}
                          onChange={(e) =>
                            setNewLesson({
                              ...newLesson,
                              language: e.target.value as LessonLanguage,
                            })
                          }
                          className="border p-1 rounded text-sm"
                        >
                          <option value="javascript">JavaScript</option>
                          <option value="python">Python</option>
                          <option value="html">HTML</option>
                          <option value="scratch">Scratch</option>
                        </select>
                        <textarea
                          placeholder="Notes (Markdown)"
                          value={newLesson.notes}
                          onChange={(e) => setNewLesson({ ...newLesson, notes: e.target.value })}
                          className="border p-1 rounded text-sm col-span-2"
                          rows={2}
                        />
                        <textarea
                          placeholder="Starter Code"
                          value={newLesson.starter_code}
                          onChange={(e) =>
                            setNewLesson({ ...newLesson, starter_code: e.target.value })
                          }
                          className="border p-1 rounded text-sm font-mono col-span-2"
                          rows={3}
                        />
                        <input
                          type="number"
                          placeholder="Order"
                          value={newLesson.order_index}
                          onChange={(e) =>
                            setNewLesson({ ...newLesson, order_index: Number(e.target.value) })
                          }
                          className="border p-1 rounded text-sm w-24"
                        />
                        <button
                          type="button"
                          onClick={() => setNewLesson({ ...newLesson, module_id: moduleItem.id })}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                        >
                          Use this Module
                        </button>
                        <button type="submit" className="bg-purple-600 text-white px-3 py-1 rounded text-sm">
                          Create Lesson
                        </button>
                      </form>
                    </div>

                    {/* Lesson List */}
                    <ul className="mt-3 space-y-2">
                      {moduleItem.lessons.map((lesson: Lesson) => (
                        <li key={lesson.id} className="flex justify-between items-center pl-6 text-sm">
                          <span>
                            {lesson.order_index}. {lesson.title} ({lesson.language})
                          </span>
                          <button
                            onClick={() => handleDeleteLesson(lesson.id)}
                            className="text-red-600 text-xs"
                          >
                            Delete
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && receipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Payment Receipt</h3>
            <div className="space-y-2">
              <p>
                <strong>Receipt #:</strong> {receipt.receipt_number}
              </p>
              <p>
                <strong>Date:</strong> {new Date(receipt.date).toLocaleString()}
              </p>
              <p>
                <strong>Parent:</strong> {receipt.parent_name}
              </p>
              <p>
                <strong>Kid:</strong> {receipt.kid_name}
              </p>
              <p>
                <strong>Course:</strong> {receipt.course_name}
              </p>
              <p>
                <strong>Amount:</strong> KES {receipt.amount}
              </p>
              <p>
                <strong>Method:</strong> {receipt.method}
              </p>
              <p>
                <strong>Status:</strong> {receipt.status}
              </p>
              {receipt.reference && (
                <p>
                  <strong>Reference:</strong> {receipt.reference}
                </p>
              )}
              {receipt.description && (
                <p>
                  <strong>Description:</strong> {receipt.description}
                </p>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowReceipt(false);
                  dispatch(clearReceipt());
                }}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for stats cards
const StatCard: React.FC<{ title: string; value: number; icon: string; color: string }> = ({
  title,
  value,
  icon,
  color,
}) => (
  <div className={`${color} rounded-lg shadow p-6 text-white`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm uppercase tracking-wide">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <div className="text-4xl">{icon}</div>
    </div>
  </div>
);

export default AdminDashboard;