import { FC } from "react";

import classes from "./UserLoader.module.scss";

const UserLoader: FC = () => {
	return <div className={classes.loader}></div>;
};

export default UserLoader;
