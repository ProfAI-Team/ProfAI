import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import ProfessorCard from '../components/ProfessorCard';
import { professorService } from '../services/professorService';
import { Professor } from '../types';

const ProfessorListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [department, setDepartment] = useState('');
  const [university, setUniversity] = useState('');

  const fetchProfessors = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (department) params.department = department;
      if (university) params.university = university;
      const data = await professorService.getAll(params);
      setProfessors(data);
    } catch {
      // API not available
    } finally {
      setLoading(false);
    }
  }, [search, department, university]);

  useEffect(() => {
    fetchProfessors();
  }, [fetchProfessors]);

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
  }, []);

  const departments = [...new Set(professors.map((p) => p.department).filter(Boolean))];
  const universities = [...new Set(professors.map((p) => p.university).filter(Boolean))];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Professors</h1>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <SearchBar
          placeholder="Search professors by name..."
          onSearch={handleSearch}
        />
        <div className="flex gap-3">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="bg-navy-light border border-accent/30 rounded-xl px-4 py-3 text-gray-300 text-sm focus:outline-none focus:border-accent-blue/50 min-w-[160px]"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            className="bg-navy-light border border-accent/30 rounded-xl px-4 py-3 text-gray-300 text-sm focus:outline-none focus:border-accent-blue/50 min-w-[160px]"
          >
            <option value="">All Universities</option>
            {universities.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
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
              <div className="h-4 bg-accent/20 rounded w-1/2" />
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
        <div className="text-center py-16">
          <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-500 text-lg">No professors found</p>
          <p className="text-gray-600 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default ProfessorListPage;
