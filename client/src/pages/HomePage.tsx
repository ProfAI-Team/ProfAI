import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import ProfessorCard from '../components/ProfessorCard';
import { professorService } from '../services/professorService';
import { Professor } from '../types';

const HomePage: React.FC = () => {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await professorService.getAll();
        setProfessors(data.slice(0, 6));
      } catch {
        // API not available yet - that's ok for MVP
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      if (query.trim()) {
        navigate(`/professors?search=${encodeURIComponent(query)}`);
      }
    },
    [navigate]
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-accent to-navy-light opacity-80" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent-blue/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            How does your professor
            <br />
            <span className="bg-gradient-to-r from-accent-blue to-accent-cyan bg-clip-text text-transparent">
              ask questions?
            </span>
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
            Analyze exam patterns, understand question styles, and prepare smarter
            with AI-powered insights.
          </p>
          <div className="flex justify-center">
            <SearchBar
              placeholder="Search for a professor..."
              onSearch={handleSearch}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Professors', value: '150+', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
            { label: 'Exams Analyzed', value: '1,200+', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            { label: 'AI Analyses', value: '800+', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-navy-light border border-accent/20 rounded-xl p-6 text-center hover:border-accent-blue/30 transition-colors"
            >
              <svg className="w-8 h-8 mx-auto text-accent-blue mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
              </svg>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Professors */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Popular Professors</h2>
          <button
            onClick={() => navigate('/professors')}
            className="text-accent-blue hover:text-accent-cyan text-sm font-medium transition-colors"
          >
            View All &rarr;
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-navy-light border border-accent/20 rounded-xl p-6 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-full" />
                  <div className="flex gap-2">
                    <div className="w-16 h-6 bg-accent/20 rounded-full" />
                    <div className="w-16 h-6 bg-accent/20 rounded-full" />
                  </div>
                </div>
                <div className="h-5 bg-accent/20 rounded w-3/4 mb-2" />
                <div className="h-4 bg-accent/20 rounded w-1/2 mb-1" />
                <div className="h-3 bg-accent/20 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : professors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {professors.map((prof) => (
              <ProfessorCard key={prof.id} professor={prof} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No professors found yet. Be the first to add one!</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
