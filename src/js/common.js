import { throttle } from "./libs/utils";
import "./polyfills.js";
import "./blocks.js";

// Функции

// Ширина скроллбара
const setScrollbarWidth = () => {
	document.documentElement.style.setProperty('--sw', `${window.innerWidth - document.documentElement.clientWidth}px`);
}

const setHeader = () => {
	const header = document.querySelector('header');
	if (!header) return;

	const burger = header.querySelector('.header__burger');
	const items = header.querySelectorAll('.header__item');

	// Логика бургера
	burger.addEventListener('click', () => {
		header.classList.toggle('header_open');
		document.body.classList.toggle("scroll-lock", header.classList.contains('header_open'));
	});

	// Логика аккордеона по клику
	items.forEach(item => {
		item.addEventListener('click', (e) => {
			// Работает только на экранах <= 1100px
			if (window.innerWidth <= 1100) {
				// Закрываем другие открытые элементы (опционально)
				items.forEach(otherItem => {
					if (otherItem !== item) otherItem.classList.remove('_active');
				});

				item.classList.toggle('_active');
			}
		});
	});
}

// Запуск функций
document.addEventListener('DOMContentLoaded', () => {
	setScrollbarWidth();
	setHeader();
})