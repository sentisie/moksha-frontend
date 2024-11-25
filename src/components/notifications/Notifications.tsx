import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import classes from "./Notifications.module.scss";

const Notifications = () => {
	return (
		<ToastContainer
			position="top-right"
			autoClose={3000}
			hideProgressBar={false}
			newestOnTop={false}
			closeOnClick
			rtl={false}
			pauseOnFocusLoss
			draggable
			pauseOnHover
			className={classes.customToastContainer}
			bodyClassName={classes.customToastBody}
			progressClassName={classes.customToastProgress}
		/>
	);
};

export default Notifications;
