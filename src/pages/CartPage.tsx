import { FC, useEffect, useState } from "react";
import Cart from "../components/cart/Cart";
import Products from "../components/products/Products";
import { useGetProductsByIdsQuery } from "../services/ProductServices";

const CartPage: FC = () => {
	const [viewedProductIds, setViewedProductIds] = useState<number[]>([]);

	const { data: viewedProducts, isLoading: isViewedProductsLoading } =
		useGetProductsByIdsQuery(viewedProductIds, {
			skip: viewedProductIds.length === 0,
		});

	useEffect(() => {
		const saved = localStorage.getItem("viewedProducts");
		if (saved) {
			setViewedProductIds(JSON.parse(saved));
		}
	}, []);

	return (
		<>
			<Cart />
			{viewedProducts && viewedProducts.length > 0 && (
				<Products
					title="Вы недавно смотрели"
					products={viewedProducts}
					isLoading={isViewedProductsLoading}
					error={null}
				/>
			)}
		</>
	);
};

export default CartPage;
