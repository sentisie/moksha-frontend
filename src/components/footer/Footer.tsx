import { FC } from "react";
import classes from "./Footer.module.scss";
import qrCode from "../../assets/images/footer/qr.png";

const Footer: FC = () => {
	return (
		<footer className={classes.footer}>
			<div className="container">
				<div className={classes.content}>
					<div className={classes.column}>
						<h3>Покупателям</h3>
						<ul>
							<li>Вопросы и ответы</li>
							<li>Юридическая информация</li>
						</ul>
					</div>

					<div className={classes.column}>
						<h3>Продавцам и партнёрам</h3>
						<ul>
							<li>Продавать товары</li>
							<li>Открыть пункт выдачи</li>
							<li>Предложить помещение</li>
							<li>Развозить грузы</li>
							<li>Доставлять заказы</li>
						</ul>
					</div>

					<div className={classes.column}>
						<h3>Наши проекты</h3>
						<ul>
							<li>Moksha Delivery</li>
							<li>Moksha School</li>
							<li>Moksha Guru</li>
						</ul>
					</div>

					<div className={classes.column}>
						<h3>Компания</h3>
						<ul>
							<li>О нас</li>
							<li>Пресс-служба</li>
							<li>Контакты</li>
							<li>Вакансии</li>
							<li>Сообщить о мошенничестве</li>
						</ul>
					</div>

					<img
						style={{ width: "200px", height: "200px", borderRadius: "36px" }}
						src={qrCode}
						alt="QR Code"
					/>
				</div>

				<div className={classes.bottom}>
					<div className={classes.copyright}>
						© Moksha 2004-2024. Все права защищены.
						<span>Применяются рекомендательные технологии</span>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
