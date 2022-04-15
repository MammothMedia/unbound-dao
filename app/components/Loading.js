import React from 'react';
import PropTypes from 'prop-types';

const Loading = ({ dimmed }) => {
  return (
    <div id='loading-overlay' className={dimmed ? 'loading-dimmed' : ''}>
      <Loading.Spinner white={dimmed} />
    </div>
  );
};

const Spinner = ({ white }) => {
  return (
    <div className='spinner-button'>
      <div className={white ? 'dot1' : 'black-dot1'} />
      <div className={white ? 'dot2' : 'black-dot2'} />
    </div>
  );
};

export default Loading;

/**
 * Subcomponent
 */
Loading.Spinner = Spinner;

Loading.propTypes = {
  dimmed: PropTypes.bool,
};
Spinner.propTypes = {
  white: PropTypes.bool,
};
