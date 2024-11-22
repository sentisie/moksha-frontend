import { FC, useState, useRef, useEffect } from "react";
import classes from "./CurrencyDropdown.module.scss";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { setCurrency } from "../../store/reducers/currency/currencySlice";
import { currencyRates } from "../../utils/constants";
import { CurrencyRates } from "../../types/types";

const CurrencyDropdown: FC = () => {
	const dispatch = useAppDispatch();
	const { currency, rates } = useAppSelector((state) => state.currencyReducer);

	const [isCurrencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const handleCurrencyChange = (newCurrency: keyof typeof currencyRates) => {
		dispatch(setCurrency(newCurrency));
		setCurrencyDropdownOpen(false);
	};

	const handleClick = () => {
		setCurrencyDropdownOpen(!isCurrencyDropdownOpen);
	};

	const handleMouseEnter = () => {
		setCurrencyDropdownOpen(true);
	};

	const handleMouseLeave = () => {
		setCurrencyDropdownOpen(false);
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setCurrencyDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div
			className={`${classes.currency} ${
				isCurrencyDropdownOpen ? classes.open : ""
			}`}
			ref={dropdownRef}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onClick={handleClick}
		>
			<span className={classes.currentCurrency}>
				{currencyRates[currency as keyof typeof currencyRates].name}
			</span>
			<span
				className={`${classes.arrow} ${
					isCurrencyDropdownOpen ? classes.up : ""
				}`}
			></span>
			<div className={classes.currencyDropdownWrapper}>
				<ul className={classes.currencyDropdown}>
					{Object.entries(currencyRates).map(([code, details]) => (
						<li
							key={code}
							onClick={() =>
								handleCurrencyChange(code as keyof typeof currencyRates)
							}
							className={classes.currencyItem}
						>
							<span className={classes.currencyCode}>{code}</span>
							<span className={classes.currencyName}>{details.name}</span>
							{rates && (
								<span className={classes.rate}>
									{code === "RUB"
										? "1.00"
										: rates[code as keyof CurrencyRates]?.toFixed(2)}
								</span>
							)}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default CurrencyDropdown;
