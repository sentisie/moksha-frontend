import React, { FC } from "react";
import { IProduct } from "../../types/types";
import Loader from "../../UI/loaders/main-loader/Loader";
import classes from "./Products.module.scss";
import ProductCard from "../card/ProductCard";

interface ProductsProps {
	title?: string;
	products: IProduct[];
	style?: {
		[key: string]: string;
	};
	isLoading: boolean;
	error?: string | null;
}

const Products: FC<ProductsProps> = React.memo(
	({ title, products = [], isLoading, error }) => {
		if (!products || !products.length) return null;

		return (
			products.length !== 0 && (
				<section className={classes.products}>
					<div className="container">
						{title && <h2 className="h2-title">{title}</h2>}
						<div className={classes.list}>
							{isLoading ? (
								<Loader />
							) : error ? (
								<p>{error}</p>
							) : (
								products.map((product) => (
									<ProductCard key={product.id} item={product} />
								))
							)}
						</div>
					</div>
				</section>
			)
		);
	}
);

export default Products;
