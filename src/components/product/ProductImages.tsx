import { FC, useRef } from "react";
import classes from "./Product.module.scss";

interface ProductImagesProps {
	images: string[];
	curImage: string | undefined;
	setCurImage: (image: string) => void;
}

const ProductImages: FC<ProductImagesProps> = ({
	images,
	curImage,
	setCurImage,
}) => {
	const imageRef = useRef<HTMLDivElement>(null);

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!imageRef.current) return;

		const { left, top, width, height } =
			imageRef.current.getBoundingClientRect();
		const x = ((e.clientX - left) / width) * 100;
		const y = ((e.clientY - top) / height) * 100;

		const img = imageRef.current.querySelector("img");
		if (img) {
			img.style.transformOrigin = `${x}% ${y}%`;
		}
	};

	return (
		<div className={classes.images}>
			<div className={classes.imagesList}>
				{images.map((image, index) => (
					<div
						key={index}
						className={`${classes.image} ${
							curImage === image ? classes.active : ""
						}`}
						onClick={() => setCurImage(image)}
					>
						<img src={image} alt="" />
					</div>
				))}
			</div>
			<div
				className={classes.current}
				ref={imageRef}
				onMouseMove={handleMouseMove}
			>
				<img src={curImage} alt="" />
			</div>
		</div>
	);
};

export default ProductImages;
