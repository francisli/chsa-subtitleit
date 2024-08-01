import { useEffect } from 'react';

import Api from '../Api';
import Spinner from './Spinner';

function JobStatus({ job, onChange }) {
  useEffect(() => {
    if (!job.response || job.response.TranscriptionJob?.TranscriptionJobStatus === 'IN_PROGRESS') {
      setTimeout(() => {
        Api.jobs.get(job.id).then((response) => onChange(response.data));
      }, 1000);
    }
  }, [job]);

  function vttPath(job) {
    let assetPath = '/api/assets';
    const subtitleUris = job.response?.TranscriptionJob?.Subtitles?.SubtitleFileUris;
    for (const uri of subtitleUris) {
      if (uri.endsWith('.vtt')) {
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
          <a download href={vttPath(job)} target="_blank">
            Download captions
          </a>
        </>
      )}
    </>
  );
}

export default JobStatus;
