import { FC } from 'react';

import styles from './LoadingIndicator.module.scss';

export const LoadingIndicator: FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-200/20 backdrop-blur-sm">
      <div className={styles.loader}></div>
    </div>
  );
};
