import { useAppDispatch, useAppSelector } from "../hooks/redux";
import OrderTracking from "../components/orders/OrderTracking";
import Loader from "../UI/loaders/main-loader/Loader";
import { OrderStatus } from "../types/types";
import {
	useGetUserOrdersQuery,
	useUpdateOrderStatusMutation,
} from "../services/OrderService";
import MyButton from "../UI/button/MyButton";
import { toggleForm } from "../store/reducers/user/userSlice";
import { FC } from "react";

const OrdersPage: FC = () => {
	const { curUser, isAuthChecked } = useAppSelector(
		(state) => state.userReducer
	);

	const dispatch = useAppDispatch();

	const { data: orders, isLoading } = useGetUserOrdersQuery(undefined, {
		skip: !curUser || !isAuthChecked,
	});
	const [updateStatus] = useUpdateOrderStatusMutation();

	const handleStatusUpdate = async (orderId: number, status: OrderStatus) => {
		await updateStatus({ orderId, status }).unwrap();
	};

	if (!isAuthChecked || isLoading) {
		return <Loader />;
	}

	return (
		<>
			{!curUser ? (
				<>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							paddingBlock: "120px",
						}}
					>
						<h2
							className="h2-title"
							style={{
								maxWidth: "700px",
								textAlign: "center",
								lineHeight: "1.6",
							}}
						>
							Пожалуйста, войдите в аккаунт, чтобы просмотреть доставки товаров
						</h2>
						<MyButton onClick={() => dispatch(toggleForm(true))}>
							Войти
						</MyButton>
					</div>
				</>
			) : (
				<>
					<div className="container">
						<h2 className="h2-title">Активные доставки</h2>
						<OrderTracking
							orders={orders || []}
							onStatusUpdate={handleStatusUpdate}
						/>
					</div>
				</>
			)}
		</>
	);
};

export default OrdersPage;
