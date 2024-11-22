import { FC } from 'react';
import Loader from '../main-loader/Loader';
import classes from './PageLoader.module.scss';

const PageLoader: FC = () => {
  return (
    <div className={classes.pageLoader}>
      <Loader />
    </div>
  );
};

export default PageLoader;