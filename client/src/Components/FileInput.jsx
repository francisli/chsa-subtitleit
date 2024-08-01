import classNames from 'classnames';
import PropTypes from 'prop-types';

import DropzoneUploader from './DropzoneUploader';
import './FileInput.scss';

function FileInput({ className, children, id, name, onChange, value, valueName, valueUrl }) {
  function onRemoved() {
    if (onChange) {
      onChange({ target: { name, value: '', valueName: '' } });
    }
  }

  function onUploaded(status) {
    if (onChange) {
      onChange({ target: { name, value: status.signedId, valueName: status.file.path } });
    }
  }

  return (
    <DropzoneUploader
      id={id}
      className={classNames('file-input', className)}
      multiple={false}
      disabled={!!value && value !== ''}
      onRemoved={onRemoved}
      onUploaded={onUploaded}>
      {({ statuses, onRemove }) => {
        if (statuses.length > 0) {
          return statuses.map((s) => (
            <div
              key={s.id}
              className={classNames('file-input__preview', {
                'file-input__preview--uploading': s.status === 'pending' || s.status === 'uploading',
              })}>
              <button onClick={() => onRemove(s)} className="btn btn-danger file-input__remove" type="button">
                &times;
              </button>
              {s.file.path}
              <div className="spinner-border file-input__spinner" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ));
        } else if (statuses.length === 0 && value) {
          return (
            <div className={classNames('file-input__preview')}>
              <button onClick={onRemoved} className="btn btn-danger file-input__remove" type="button">
                &times;
              </button>
              {valueName}
            </div>
          );
        } else if (statuses.length === 0 && !value && children) {
          return children;
        }
      }}
    </DropzoneUploader>
  );
}

FileInput.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
  valueUrl: PropTypes.string,
};

export default FileInput;
