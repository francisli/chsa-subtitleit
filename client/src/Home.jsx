import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';

import { useStaticContext } from './StaticContext';
import { useAuthContext } from './AuthContext';

import Api from './Api';
import FileInput from './Components/FileInput';
import JobStatus from './Components/JobStatus';

function Home() {
  const staticContext = useStaticContext();
  const authContext = useAuthContext();

  const [isShowingForm, setShowingForm] = useState(false);
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
    if (!isShowingForm) {
      setShowingForm(true);
      return;
    }
    try {
      const response = await Api.jobs.create(data);
      setJobs([response.data, ...jobs]);
      setData({
        file: '',
        fileName: '',
        fileUrl: '',
      });
      setShowingForm(false);
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
          <>
            <h2 className="mb-3">How to update a ModelViewer website with Audio and Captions</h2>
            <ol className="mb-5">
              <li>
                <a download href="/modelviewer/script.js">
                  Download the updated <b>script.js</b>
                </a>{' '}
                and replace the existing file.
              </li>
              <li>
                <a download href="/modelviewer/styles.scss">
                  Download the updated <b>styles.scss</b>
                </a>{' '}
                and replace the existing file.
              </li>
              <li>
                Rename your audio file to <b>recording.m4a</b> and put it in the same folder as the other files.
              </li>
              <li>
                <b>Start a new Job</b> below to upload your audio file and generate a captions file.
              </li>
              <li>
                When completed, download the captions file, rename it to <b>recording.vtt</b> and put it in the same folder as the other
                files.
              </li>
            </ol>
            <h2 className="mb-3">Transcription Jobs</h2>
            <form className="mb-3" onSubmit={onSubmit}>
              {isShowingForm && (
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
                      <div className="card-text pointer">
                        <b>Drag-and-drop</b> an audio file here, or <b>click here</b> to browse and select a file. Then press{' '}
                        <b>Start new Job</b> again to confirm.
                      </div>
                    </div>
                  </FileInput>
                  {error?.errorMessagesHTMLFor?.('file')}
                </div>
              )}
              <button disabled={isShowingForm && (isUploading || !data.file)} type="submit" name="submit" className="btn btn-primary">
                Start new Job
              </button>
            </form>
            <table className="table table-striped">
              <tbody>
                {jobs?.map((j) => (
                  <tr key={j.id}>
                    <td className="align-middle w-300px">{DateTime.fromISO(j.createdAt).toLocaleString(DateTime.DATETIME_FULL)}</td>
                    <td className="align-middle text-center w-300px">
                      <JobStatus job={j} onChange={onChangeJob} />
                    </td>
                    <td className="align-middle">{j.fileName}</td>
                    <td className="align-middle text-end">
                      <button onClick={() => onDelete(j)} className="btn btn-sm btn-danger">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </main>
    </>
  );
}

export default Home;
