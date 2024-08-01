import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';

import { useStaticContext } from './StaticContext';
import { useAuthContext } from './AuthContext';

import Api from './Api';
import FileInput from './Components/FileInput';
import JobStatus from './Components/JobStatus';
import Spinner from './Components/Spinner';

function Home() {
  const staticContext = useStaticContext();
  const authContext = useAuthContext();

  const [data, setData] = useState({
    file: '',
    fileName: '',
    fileUrl: '',
  });
  const [error, setError] = useState();
  const [isUploading, setUploading] = useState(false);

  const [jobs, setJobs] = useState();

  useEffect(() => {
    Api.jobs.index().then((response) => setJobs(response.data));
  }, []);

  function onChange(event) {
    const newData = { ...data };
    newData[event.target.name] = event.target.value;
    if (event.target.valueName) {
      newData[`${event.target.name}Name`] = event.target.valueName;
    }
    setData(newData);
  }

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const response = await Api.jobs.create(data);
      setJobs([response.data, ...jobs]);
      setData({
        file: '',
        fileName: '',
        fileUrl: '',
      });
    } catch (err) {
      setError(err);
    }
  }

  function onChangeJob(job) {
    const newJobs = [...jobs];
    const index = newJobs.findIndex((j) => j.id === job.id);
    newJobs[index] = job;
    setJobs(newJobs);
  }

  async function onDelete(job) {
    if (window.confirm(`Are you sure you wish to delete "${job.fileName}"?`)) {
      try {
        await Api.jobs.delete(job.id);
        const newJobs = [...jobs];
        const index = newJobs.findIndex((j) => j.id === job.id);
        newJobs.splice(index, 1);
        setJobs(newJobs);
      } catch (err) {
        window.alert(err.message);
      }
    }
  }

  return (
    <>
      <Helmet>
        <title>Home - {staticContext?.env?.VITE_SITE_TITLE ?? ''}</title>
      </Helmet>
      <main className="container">
        <h1 className="mb-5">Home</h1>
        {!authContext.user && (
          <p>
            Please <Link to="/login">log in</Link> to continue.
          </p>
        )}
        {authContext.user && (
          <div>
            <h2 className="mb-3">Transcription Jobs</h2>
            <form className="mb-3" onSubmit={onSubmit}>
              <div className="mb-2">
                <FileInput
                  className="card"
                  id="file"
                  name="file"
                  value={data.file}
                  valueName={data.fileName}
                  valueUrl={data.fileUrl}
                  onChange={onChange}
                  onUploading={setUploading}>
                  <div className="card-body">
                    <div className="card-text">
                      Drag-and-drop an audio file here, or click here to browse and select a file to start a new job.
                    </div>
                  </div>
                </FileInput>
                {error?.errorMessagesHTMLFor?.('file')}
              </div>
              <button disabled={isUploading || !data.file} type="submit" name="submit" className="btn btn-primary">
                Start new Job
              </button>
            </form>
            <table className="table table-striped">
              <tbody>
                {jobs?.map((j) => (
                  <tr key={j.id}>
                    <td className="align-middle w-300px">{DateTime.fromISO(j.createdAt).toLocaleString(DateTime.DATETIME_FULL)}</td>
                    <td className="align-middle">{j.fileName}</td>
                    <td className="align-middle">
                      <JobStatus job={j} onChange={onChangeJob} />
                    </td>
                    <td className="align-middle text-end">
                      <button onClick={() => onDelete(j)} className="btn btn-sm btn-danger">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}

export default Home;
