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

const initFileLoaders = () => {
    const wrappers = document.querySelectorAll('.js-file-wrapper');

    wrappers.forEach(wrapper => {
        const input = wrapper.querySelector('.js-file-input');
        const fileName = wrapper.querySelector('.js-file-name');
        const btn = wrapper.querySelector('.js-file-btn');
        const deleteBtn = wrapper.querySelector('.js-file-delete');
        
        const originalText = fileName.textContent;

        // Клик по кнопке вызывает клик по скрытому инпуту
        btn.addEventListener('click', () => input.click());

        // При выборе файла
        input.addEventListener('change', function() {
            if (this.files.length > 0) {
                fileName.textContent = this.files[0].name;
                deleteBtn.style.display = 'block';
                btn.style.display = 'none';
				wrapper.classList.add('active');
            }
        });

        // Удаление
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            input.value = '';
            fileName.textContent = originalText;
            deleteBtn.style.display = 'none';
            btn.style.display = 'block';
			wrapper.classList.remove('active');
        });
    });
}


// Запуск функций
document.addEventListener('DOMContentLoaded', () => {
	setScrollbarWidth();
	setHeader();
	initFileLoaders();
})