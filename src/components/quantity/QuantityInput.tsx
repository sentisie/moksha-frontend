import { FC, useState, useEffect } from "react";
import classes from "./QuantityInput.module.scss";
import Loader from "../../UI/loaders/main-loader/Loader";
import MyButton from "../../UI/button/MyButton";
import { toast } from "react-toastify";
import { useAppDispatch } from "../../hooks/redux";
import { removeItemFromCart } from "../../store/reducers/user/userSlice";
import { removeItemSelection } from "../../store/reducers/delivery/deliverySlice";

interface QuantityInputProps {
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max: number;
	disabled?: boolean;
	isLoading?: boolean;
	onIncrease: () => void;
	onDecrease: () => void;
	onRemove?: () => void;
	availableQuantity?: number;
	productTitle?: string;
	disableMinusAtMin?: boolean;
	productId: number;
}

const QuantityInput: FC<QuantityInputProps> = ({
	value,
	onChange,
	min = 1,
	max,
	disabled = false,
	isLoading = false,
	onIncrease,
	onDecrease,
	onRemove,
	availableQuantity,
	productTitle,
	disableMinusAtMin = false,
	productId,
}) => {
	const [inputValue, setInputValue] = useState(String(value));
	const [isFocused, setIsFocused] = useState(false);
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (!isFocused) {
			setInputValue(String(value));
		}
	}, [value, isFocused]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value.replace(/[^\d]/g, "");
		setInputValue(newValue);
	};

	const handleBlur = () => {
		setIsFocused(false);
		let newValue = Number(inputValue);

		if (isNaN(newValue) || newValue < min) {
			if (onRemove) {
				onRemove();
			} else {
				dispatch(removeItemFromCart(productId));
				dispatch(removeItemSelection(productId));
				toast.info(
					<>
						<div>Товар удален из корзины</div>
						<div className="toast-details">{productTitle}</div>
					</>
				);
			}
			return;
		}

		if (newValue > max) {
			if (availableQuantity && newValue > availableQuantity) {
				toast.warning(
					<>
						<div>Недостаточно товаров на складе</div>
						<div className="toast-details">
							Доступно: {availableQuantity} шт.
						</div>
					</>
				);
				newValue = availableQuantity;
			} else {
				toast.warning(
					<>
						<div>Превышен лимит товаров в корзине</div>
						<div className="toast-details">
							Максимальное количество: {max} шт.
						</div>
					</>
				);
				newValue = max;
			}
		}

		onChange(newValue);
	};

	return (
		<div
			className={classes.quantity}
			onClick={(event) => event.preventDefault()}
		>
			<MyButton
				className={classes.minus}
				onClick={onDecrease}
				disabled={disabled || (disableMinusAtMin && value <= min)}
			>
				-
			</MyButton>

			{isLoading ? (
				<Loader />
			) : (
				<input
					type="text"
					value={inputValue}
					onChange={handleChange}
					onFocus={() => setIsFocused(true)}
					onBlur={handleBlur}
					className={classes.input}
					disabled={disabled}
				/>
			)}

			<MyButton
				className={classes.plus}
				onClick={onIncrease}
				disabled={disabled}
			>
				+
			</MyButton>
		</div>
	);
};

export default QuantityInput;
