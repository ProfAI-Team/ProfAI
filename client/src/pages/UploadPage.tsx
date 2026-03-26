import React, { useEffect, useState } from 'react';
import FileUpload from '../components/FileUpload';
import { courseService } from '../services/courseService';
import { examService } from '../services/examService';
import { Course } from '../types';

const UploadPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState('');
  const [examType, setExamType] = useState('MIDTERM');
  const [year, setYear] = useState(new Date().getFullYear());
  const [semester, setSemester] = useState('Fall');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await courseService.getAll();
        setCourses(data);
      } catch {
        // API not available
      }
    };
    fetch();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!courseId) {
      setError('Please select a course.');
      return;
    }
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    try {
      await examService.upload({
        courseId,
        examType,
        year,
        semester,
        file,
      });
      setSuccess('Exam uploaded successfully! Analysis will be available shortly.');
      setFile(null);
      setCourseId('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Upload Exam</h1>
      <p className="text-gray-400 mb-8">Upload a past exam for AI-powered analysis</p>

      {success && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-navy-light border border-accent/20 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full bg-navy border border-accent/30 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/50"
            >
              <option value="">Select a course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Exam Type</label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full bg-navy border border-accent/30 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-accent-blue/50"
              >
                <option value="MIDTERM">Midterm</option>
                <option value="FINAL">Final</option>
                <option value="MAKEUP">Makeup</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={2000}
                max={2030}
                className="w-full bg-navy border border-accent/30 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-accent-blue/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full bg-navy border border-accent/30 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-accent-blue/50"
              >
                <option value="Fall">Fall</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Exam File</label>
            <FileUpload onFileSelect={setFile} selectedFile={file} />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-accent-blue to-accent-cyan text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Uploading...
            </span>
          ) : (
            'Upload Exam'
          )}
        </button>
      </form>
    </div>
  );
};

export default UploadPage;
