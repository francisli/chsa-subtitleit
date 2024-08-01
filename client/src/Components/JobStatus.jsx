import { useEffect } from 'react';

import Api from '../Api';
import Spinner from './Spinner';

function JobStatus({ job, onChange }) {
  useEffect(() => {
    if (!job.response || job.response.TranscriptionJob?.TranscriptionJobStatus === 'IN_PROGRESS') {
      setTimeout(() => {
        Api.jobs.get(job.id).then((response) => onChange(response.data));
      }, 500);
    }
  }, [job]);

  function srtPath(job) {
    let assetPath = '/api/assets';
    const subtitleUris = job.response?.TranscriptionJob?.Subtitles?.SubtitleFileUris;
    for (const uri of subtitleUris) {
      if (uri.endsWith('.srt')) {
        assetPath = `${assetPath}/${uri.substring(uri.indexOf('jobs/'))}`;
        break;
      }
    }
    return assetPath;
  }

  const isPolling = !job.response || job.response.TranscriptionJob?.TranscriptionJobStatus === 'IN_PROGRESS';
  return isPolling ? (
    <Spinner small={true} />
  ) : (
    <>
      {job.response?.TranscriptionJob?.TranscriptionJobStatus === 'COMPLETED' && (
        <>
          <a download href={srtPath(job)} target="_blank">
            .srt
          </a>
        </>
      )}
    </>
  );
}

export default JobStatus;
