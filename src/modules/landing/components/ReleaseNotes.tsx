import React from 'react';
import { Calendar, CheckCircle2, GitCommit } from 'lucide-react';

export interface Release {
  version: string;
  date: string;
  description: string;
  changes: {
    type: 'feature' | 'improvement' | 'fix';
    description: string;
  }[];
}

interface Props {
  releases: Release[];
}

const ReleaseNotes: React.FC<Props> = ({ releases }) => (
  <div className="space-y-8">
    {releases.map((release) => (
      <div key={release.version} className="bg-white rounded-xl border p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <GitCommit className="w-5 h-5 text-blue-600" />
              v{release.version}
            </h3>
            <p className="text-gray-600 text-sm flex items-center gap-1 mt-1">
              <Calendar className="w-4 h-4" />
              {release.date}
            </p>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">Latest</span>
        </div>
        <p className="text-gray-700">{release.description}</p>
        <div className="space-y-3">
          {release.changes.map((change, idx) => (
            <div key={idx} className="flex gap-2 text-sm">
              <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${
                change.type === 'feature' ? 'text-green-500' :
                change.type === 'improvement' ? 'text-blue-500' : 'text-amber-500'
              }`} />
              <span className="text-gray-700">{change.description}</span>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default ReleaseNotes;