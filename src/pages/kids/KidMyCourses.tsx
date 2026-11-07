import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getMyCourses } from "../../store/slices/kidLearningSlice";
import CourseCard from "../../components/kids/CourseCard";

const KidMyCourses = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { courses, loading, error } = useAppSelector((s) => s.kidLearning);

  useEffect(() => {
    dispatch(getMyCourses());
  }, [dispatch]);

  return (
    <div>
      <h1 className="text-3xl font-black text-brand-900">Learn</h1>
      <p className="text-slate-600 font-bold mt-1 mb-6">Pick a course and keep going!</p>

      {error && courses.length === 0 ? (
        <div role="alert" className="kid-card p-8 text-center">
          <p className="font-bold text-slate-600 mb-3">Oops, we couldn’t load your courses.</p>
          <button className="ds-btn ds-btn-primary" onClick={() => dispatch(getMyCourses())}>Try again</button>
        </div>
      ) : loading && courses.length === 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" role="status" aria-label="Loading your courses">
          {[0, 1, 2].map((i) => <div key={i} className="animate-pulse bg-brand-100/70 rounded-3xl h-64" />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="kid-card p-10 text-center">
          <p className="text-6xl mb-3" aria-hidden="true">🔑</p>
          <p className="font-black text-brand-900 text-xl">Your first course is waiting</p>
          <p className="text-slate-600 font-bold mt-1">Ask your grown-up to unlock it for you.</p>
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c, i) => (
            <li key={c.enrollment_id} className="flex">
              <CourseCard className="w-full" course={c} index={i} onOpen={() => navigate(`/kid/course/${c.enrollment_id}`)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default KidMyCourses;
