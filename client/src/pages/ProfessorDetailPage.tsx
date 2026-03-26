import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnalysisCard from '../components/AnalysisCard';
import RatingForm from '../components/RatingForm';
import { professorService } from '../services/professorService';
import { ratingService } from '../services/ratingService';
import { Professor, ExamAnalysis, ProfessorRating, Course } from '../types';

const ProfessorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [analyses, setAnalyses] = useState<ExamAnalysis[]>([]);
  const [ratings, setRatings] = useState<ProfessorRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prof, anal, rats] = await Promise.allSettled([
          professorService.getById(id),
          professorService.getAnalysis(id),
          ratingService.getByProfessor(id),
        ]);

        if (prof.status === 'fulfilled') setProfessor(prof.value);
        else setError('Professor not found.');

        if (anal.status === 'fulfilled') setAnalyses(anal.value);
        if (rats.status === 'fulfilled') setRatings(rats.value);
      } catch {
        setError('Failed to load professor data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleRatingSubmit = async (data: { difficulty: number; fairness: number; comment: string }) => {
    if (!id) return;
    await ratingService.create({
      professorId: id,
      difficultyScore: data.difficulty,
      fairnessScore: data.fairness,
      comment: data.comment,
    });
    const updated = await ratingService.getByProfessor(id);
    setRatings(updated);
  };

  const avgDifficulty =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.difficultyScore, 0) / ratings.length
      : 0;
  const avgFairness =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.fairnessScore, 0) / ratings.length
      : 0;

  const courses: Course[] = professor?.courses || [];

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-accent/20 rounded w-1/3" />
          <div className="h-5 bg-accent/20 rounded w-1/4" />
          <div className="h-64 bg-accent/20 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !professor) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-red-400 text-lg">{error || 'Professor not found.'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-navy-light border border-accent/20 rounded-xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-cyan rounded-full flex items-center justify-center text-white font-bold text-2xl shrink-0">
            {professor.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{professor.name}</h1>
            <p className="text-gray-400 mt-1">{professor.department}</p>
            <p className="text-gray-500 text-sm">{professor.university}</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">{avgDifficulty.toFixed(1)}</p>
              <p className="text-xs text-gray-500">Difficulty</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{avgFairness.toFixed(1)}</p>
              <p className="text-xs text-gray-500">Fairness</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-cyan">{ratings.length}</p>
              <p className="text-xs text-gray-500">Ratings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis */}
      {analyses.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Exam Analysis</h2>
          <div className="space-y-6">
            {analyses.map((a) => (
              <AnalysisCard key={a.id} analysis={a} />
            ))}
          </div>
        </section>
      )}

      {/* Courses */}
      {courses.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Courses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-navy-light border border-accent/20 rounded-xl p-4 hover:border-accent-blue/30 transition-colors"
              >
                <h3 className="text-white font-medium">{course.name}</h3>
                <p className="text-gray-500 text-sm">{course.code}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Rating Form */}
      {isAuthenticated && (
        <section>
          <RatingForm onSubmit={handleRatingSubmit} />
        </section>
      )}

      {/* Existing Ratings */}
      {ratings.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Reviews ({ratings.length})</h2>
          <div className="space-y-4">
            {ratings.map((rating) => (
              <div
                key={rating.id}
                className="bg-navy-light border border-accent/20 rounded-xl p-5"
              >
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="text-white font-medium text-sm">
                    {rating.user?.name || 'Anonymous'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    Difficulty: {rating.difficultyScore}/5
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                    Fairness: {rating.fairnessScore}/5
                  </span>
                  <span className="text-gray-600 text-xs ml-auto">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {rating.comment && (
                  <p className="text-gray-400 text-sm">{rating.comment}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProfessorDetailPage;
