import { FC, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	useGetProductQuery,
	useGetRelatedProductsQuery,
} from "../services/ProductServices";
import Product from "../components/product/Product";
import Loader from "../UI/loaders/main-loader/Loader";
import Products from "../components/products/Products";
import ReviewForm from "../components/reviews/ReviewForm/ReviewForm";
import ReviewList from "../components/reviews/ReviewList/ReviewList";

const ProductIdPage: FC = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const {
		data: product,
		isLoading: isProductLoading,
		isFetching,
		isSuccess,
	} = useGetProductQuery(id!);

	const { data: relatedProducts, isLoading: isRelatedLoading } =
		useGetRelatedProductsQuery(Number(id), {
			skip: !product,
		});

	useEffect(() => {
		if (!isFetching && !isProductLoading && !isSuccess) {
			navigate("/home");
		}
	}, [isProductLoading, isFetching, isSuccess, navigate]);

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [product]);

	useEffect(() => {
		if (product) {
			const saved = localStorage.getItem("viewedProducts");
			let viewedProductIds = saved ? JSON.parse(saved) : [];

			viewedProductIds = viewedProductIds.filter(
				(productId: number) => productId !== product.id
			);

			viewedProductIds.unshift(product.id);

			viewedProductIds = viewedProductIds.slice(0, 6);

			localStorage.setItem("viewedProducts", JSON.stringify(viewedProductIds));
		}
	}, [product]);

	if (isProductLoading || isFetching) {
		return (
			<div className="loader-container">
				<Loader />
			</div>
		);
	}

	if (!product || !isSuccess) {
		return <div>Товар не найден!</div>;
	}

	return (
		<>
			<Product {...product} />
			{isRelatedLoading ? (
				<div className="loader-container">
					<Loader />
				</div>
			) : (
				relatedProducts && (
					<Products
						isLoading={isRelatedLoading}
						error={null}
						products={relatedProducts}
						title="Похожие товары"
					/>
				)
			)}
			<ReviewForm productId={product.id} />
			<ReviewList productId={product.id} />
		</>
	);
};

export default ProductIdPage;
