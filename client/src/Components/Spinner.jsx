import classNames from 'classnames';

function Spinner({ small }) {
  return (
    <div className={classNames('spinner-border', { 'spinner-border-sm': small })} role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  );
}
export default Spinner;
