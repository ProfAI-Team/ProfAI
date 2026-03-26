import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Professor } from '../types';

interface Props {
  professor: Professor;
}

const ProfessorCard: React.FC<Props> = ({ professor }) => {
  const navigate = useNavigate();

  const courseCount = professor._count?.courses || 0;
  const ratingCount = professor._count?.ratings || 0;

  return (
    <div
      onClick={() => navigate(`/professors/${professor.id}`)}
      className="bg-navy-light border border-accent/20 rounded-xl p-6 cursor-pointer hover:border-accent-blue/50 hover:shadow-lg hover:shadow-accent-blue/10 transition-all duration-300 hover:-translate-y-1 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-cyan rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
          {professor.name.charAt(0)}
        </div>
        <div className="flex gap-2">
          <span className="text-xs px-2 py-1 rounded-full border bg-blue-500/20 text-blue-400 border-blue-500/30">
            {courseCount} course{courseCount !== 1 ? 's' : ''}
          </span>
          <span className="text-xs px-2 py-1 rounded-full border bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            {ratingCount} rating{ratingCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white group-hover:text-accent-cyan transition-colors">
        {professor.name}
      </h3>
      <p className="text-gray-400 text-sm mt-1">{professor.department}</p>
      <p className="text-gray-500 text-xs mt-1">{professor.university}</p>
    </div>
  );
};

export default ProfessorCard;
