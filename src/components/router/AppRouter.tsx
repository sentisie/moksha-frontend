import { FC } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { routes } from "../../routes/routes";

const AppRouter: FC = () => {
	return (
		<Routes>
			{routes.map((route) => (
				<Route key={route.path} path={route.path} element={<route.element />} />
			))}
			<Route path="*" element={<Navigate to="/home" replace />} />
		</Routes>
	);
};

export default AppRouter;
