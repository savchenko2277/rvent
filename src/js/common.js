import { throttle } from "./libs/utils";
import "./polyfills.js";
import "./blocks.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import Swiper from "swiper";
import { Controller, EffectFade } from 'swiper/modules';
import { Fancybox } from '@fancyapps/ui';

// Функции

const setSwipers = () => {
    const servicesSwiper = new Swiper('.services__swiper', {
        slidesPerView: 1.1,
        spaceBetween: 10,
        breakpoints: {
            960: {
                slidesPerView: 2.5,
                spaceBetween: 20
            },
        }
    });

    const certificatesSwiper = new Swiper('.certificates__swiper', {
        slidesPerView: 1.15,
        spaceBetween: 10,
        breakpoints: {
            960: {
                slidesPerView: 4.5,
                spaceBetween: 20
            },
            1440: {
                slidesPerView: 5,
            }
        }
    });
}

const scrollController = {
    disable() {
        // 1. Останавливаем движок скролла GSAP
        if (ScrollSmoother.get()) {
            ScrollSmoother.get().paused(true);
        }
        // 2. Дополнительно скрываем скроллбар, если нужно
        document.body.style.overflow = 'hidden';
    },

    enable() {
        // 1. Включаем движок обратно
        if (ScrollSmoother.get()) {
            ScrollSmoother.get().paused(false);
        }
        // 2. Возвращаем скроллбар
        document.body.style.removeProperty('overflow');
    }
};

// Функция открытия модалки
const openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add('active');

    scrollController.disable()
};

// Функция закрытия конкретной модалки
const closeModal = (modal) => {
    if (!modal) return;

    modal.classList.remove('active');

    scrollController.enable();
};

// Функция инициализации всех событий
const initModals = () => {
    const openButtons = document.querySelectorAll('[data-modal-open]');
    const closeButtons = document.querySelectorAll('.modal__close');
    const modals = document.querySelectorAll('.modal');

    // 1. Открытие по клику на кнопку
    openButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); // На случай, если кнопка — это ссылка <a>
            const modalId = btn.getAttribute('data-modal-open');
            openModal(modalId);
        });
    });

    // 2. Закрытие по клику на крестик
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal'); // Находим родительскую модалку
            closeModal(modal);
        });
    });

    // 3. Закрытие по клику на оверлей (вне области modal__container)
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            // Если клик пришелся ровно на сам фон (.modal), а не на его детей
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // 4. Закрытие по клавише Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                closeModal(activeModal);
            }
        }
    });
};

// Ширина скроллбара
const setScrollbarWidth = () => {
    document.documentElement.style.setProperty('--sw', `${window.innerWidth - document.documentElement.clientWidth}px`);
}

const setHeader = () => {
    const header = document.querySelector('header');
    if (!header) return;

    const handleScroll = () => {
        if (window.scrollY > 5) {
            header.classList.add('header_light');
        } else {
            header.classList.remove('header_light');
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    const burger = header.querySelector('.header__burger');
    const items = header.querySelectorAll('.header__item');

    if (burger) {
        burger.addEventListener('click', () => {
            header.classList.toggle('header_open');

            if (header.classList.contains('header_open')) {
                scrollController.disable();
            } else {
                scrollController.enable();
            }
        });
    }

    // Кусок из твоего setHeader
    items.forEach(item => {
        item.addEventListener('click', (e) => {
            const link = e.target.closest('a');

            if (link) {
                // Если ссылка якорная, отменяем стандартный прыжок
                if (link.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                }

                header.classList.remove('header_open');
                items.forEach(i => i.classList.remove('_active'));
                scrollController.enable();
            }
        });
    });
};

const initFileLoaders = () => {
    const wrappers = document.querySelectorAll('.js-file-wrapper');

    wrappers.forEach(wrapper => {
        const input = wrapper.querySelector('.js-file-input');
        const fileName = wrapper.querySelector('.js-file-name');
        const btn = wrapper.querySelector('.js-file-btn');
        const deleteBtn = wrapper.querySelector('.js-file-delete');

        const originalText = fileName.textContent;

        // Настройки ограничений
        const allowedExtensions = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
        const maxSizeInMB = 5;
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

        // Клик по кнопке вызывает клик по скрытому инпуту
        btn.addEventListener('click', () => input.click());

        // При выборе файла
        input.addEventListener('change', function () {
            if (this.files.length > 0) {
                const file = this.files[0];
                const fileExtension = file.name.split('.').pop().toLowerCase();

                // 1. Проверка формата
                if (!allowedExtensions.includes(fileExtension)) {
                    alert(`Неверный формат файла. Разрешены: ${allowedExtensions.join(', ').toUpperCase()}`);
                    this.value = ''; // Сбрасываем выбранный файл
                    return;
                }

                // 2. Проверка размера файла
                if (file.size > maxSizeInBytes) {
                    alert(`Размер файла слишком большой. Максимум: ${maxSizeInMB} МБ`);
                    this.value = ''; // Сбрасываем выбранный файл
                    return;
                }

                // Если проверки пройдены, обновляем интерфейс
                fileName.textContent = file.name;
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

const setGsap = () => {
    gsap.registerPlugin(ScrollTrigger);

    const header = document.querySelector('.header');
    const counters = document.querySelectorAll(".counter-animated");

    ScrollTrigger.create({
        trigger: ".cases__items",
        start: "top top",
        end: "bottom top",
        onEnter: () => header.classList.add('header_hidden'),
        onLeave: () => header.classList.remove('header_hidden'),
        onEnterBack: () => header.classList.add('header_hidden'),
        onLeaveBack: () => header.classList.remove('header_hidden')
    });

    // Оставил оптимизацию: ищем карточки только один раз
    const cards = gsap.utils.toArray(".cases__item");
    if (cards.length > 0) {
        document.documentElement.style.setProperty('--cards-count', cards.length);
    }

    cards.forEach((card, i) => {
        ScrollTrigger.create({
            trigger: card,
            start: `top top+=${0 + (i * 50)}px`,
            endTrigger: ".cases__items",
            end: "bottom bottom",
            pin: true,
            pinSpacing: false,
            onEnter: () => card.classList.add("cases__item_active"),
            onLeaveBack: () => card.classList.remove("cases__item_active")
        });
    });

    counters.forEach((counter) => {
        const target = parseInt(counter.getAttribute("data-target")) || parseInt(counter.textContent);
        const val = { score: 0 };

        gsap.to(val, {
            score: target,
            duration: 3,
            ease: "power2.out",
            scrollTrigger: {
                trigger: counter,
                start: "top 90%",
                toggleActions: "play none none none"
            },
            onUpdate: () => {
                counter.textContent = Math.floor(val.score);
            }
        });
    });

    gsap.to(".promo__bg img", {
        scrollTrigger: {
            trigger: ".promo",
            start: "bottom 100%",
            end: "bottom 10%",
            scrub: 1 // Вернул вашу единицу
        },
        scale: 1.5,
        force3D: true, // Аппаратное ускорение для GPU
        willChange: "transform"
    });

    gsap.to(".company__photo_animated img", {
        scrollTrigger: {
            trigger: ".company__columns",
            start: "top 65%",
            end: "top 20%",
            scrub: 1 // Вернул вашу единицу
        },
        aspectRatio: 10 / 16, // Оставил ваш изначальный вариант
        force3D: true // Аппаратное ускорение
    });
}

const setSmoothScroll = () => {
    // Не забудь зарегистрировать ScrollToPlugin, если решишь использовать его вне Smoother'а, 
    // но для ScrollSmoother достаточно его самого и ScrollTrigger
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    const isTouchDevice = window.matchMedia("(max-width: 1024px)").matches || ScrollTrigger.isTouch;

    // Создаем переменную для хранения инстанса смузера
    let smoother;

    if (!isTouchDevice) {
        smoother = ScrollSmoother.create({
            wrapper: '.wrapper',
            content: '.content',
            smooth: 2,
            effects: true,
            normalizeScroll: false,
            smoothTouch: false
        });
    }

    // --- ЛОГИКА ДЛЯ ЯКОРНЫХ ССЫЛОК ---

    // Находим все ссылки, которые начинаются с #, но исключаем пустые href="#" и модалки
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"]):not([data-modal-open])');

    anchorLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault(); // Обязательно отменяем стандартный резкий прыжок

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Даем браузеру 50 миллисекунд, чтобы scrollController.enable() 
                // из твоего setHeader успел полностью отработать и разблокировать страницу
                setTimeout(() => {
                    if (!isTouchDevice && smoother) {
                        smoother.scrollTo(targetElement, true, "top top");
                    } else {
                        // Находим блок шапки (если он на странице один, можно искать так)
                        const headerTop = document.querySelector('.header__top');
                        // Получаем его высоту в пикселях. Если блока нет, отступ будет 0
                        const headerOffset = headerTop ? headerTop.offsetHeight : 0;

                        // Высчитываем точную позицию для скролла
                        const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                        const offsetPosition = elementPosition - headerOffset;

                        // Скроллим с помощью window.scrollTo
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                }, 50);
            }
        });
    });
}
const setAdvantagesSection = () => {
    const advantages = document.querySelector('.advantages');
    const titlesEl = document.querySelector('.advantages__titles');
    if (!advantages || !titlesEl) return;

    // 1. Инициализация инстансов
    const swiperTitles = new Swiper('.advantages__titles', {
        modules: [Controller],
        direction: 'vertical',
        slidesPerView: 'auto',
        spaceBetween: 20,
        centeredSlides: true,
        initialSlide: 2,
        grabCursor: true,
        slideToClickedSlide: true // РЕШЕНИЕ 1: Делает слайды кликабельными
    });

    const swiperInfo = new Swiper('.advantages__info', {
        modules: [Controller, EffectFade],
        initialSlide: 2,
        allowTouchMove: true,
        fadeEffect: { crossFade: true },
        // РЕШЕНИЕ 2: Оставляем смену эффектов на откуп встроенным breakpoints. 
        // Swiper (если версия >= 9.3) сам корректно перестроит эффекты и стили.
        breakpoints: {
            0: { slidesPerView: 1.25, effect: 'slide', spaceBetween: 40 },
            641: { slidesPerView: 1, effect: 'fade', spaceBetween: 0 }
        }
    });

    const swiperImages = new Swiper('.advantages__images', {
        modules: [EffectFade],
        slidesPerView: 1,
        initialSlide: 2,
        spaceBetween: 20,
        allowTouchMove: false,
        effect: 'fade',
        fadeEffect: { crossFade: true }
    });

    // 2. Обработчик синхронизации
    const updateLogic = () => {
        const isMobile = window.innerWidth <= 640;

        if (isMobile) {
            titlesEl.style.display = 'none';

            // РАЗВЯЗЫВАЕМ СВАЙПЕРЫ: отключаем скрытый swiperTitles, чтобы он не "душил" остальные
            if (swiperTitles.controller) {
                swiperTitles.controller.control = [];
            }

            // Прямая синхронизация Info -> Images для мобилки
            swiperInfo.on('slideChange', function () {
                swiperImages.slideTo(this.activeIndex);
            });

        } else {
            titlesEl.style.display = 'block';

            // Убираем ручной лисенер, чтобы не плодить дубликаты событий при ресайзе
            swiperInfo.off('slideChange');

            // ВОЗВРАЩАЕМ СВЯЗКУ: снова отдаем управление видимому swiperTitles
            if (swiperTitles.controller) {
                swiperTitles.controller.control = [swiperInfo, swiperImages];
            }
        }
    };

    // Слушаем ресайз
    window.addEventListener('resize', updateLogic);
    updateLogic();
};

const setStagesSection = () => {
    const stages = document.querySelector('.stages');
    if (!stages) return;

    const items = stages.querySelectorAll('.stages__accordeon');

    items.forEach(item => {
        item.addEventListener('click', (e) => {
            items.forEach(item => {
                item.classList.remove('active');
            });
            item.classList.add('active');
        });
    });
}

const setFancybox = () => {
    Fancybox.bind('[data-fancybox]', {

        loop: true,
        Images: {
            zoom: true,
        },
    });
}

// Запуск функций
document.addEventListener('DOMContentLoaded', () => {
    setScrollbarWidth();
    setHeader();
    initFileLoaders();
    setGsap();
    setSmoothScroll();
    setSwipers();
    setAdvantagesSection();
    setStagesSection();
    setFancybox();
    initModals();
})