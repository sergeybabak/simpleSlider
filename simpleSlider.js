// Структура верстки должна быть такая:

{/* <div class="wrapper">
        <div class="track">
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
        </div>
</div> */}

// Пример вызова:

{/*import Slider from './simpleSlider';

const data = {
    wrapper: '.slider',
    prev: '.slider__prev',
    next: '.slider__next',
    [interval]: .8,
    // только при фиксированной ширине элемента можно центрировать слайдер по номеру 
    centralItem: 3, 
    // если хотим организовать свайп слайдера
    swipe: true,               
}

const carusel1 = new Slider(data);*/}

class Slider {
    constructor(data) {
        // Проверка обязательных параметров
        if (!data?.wrapper) {
            console.error("Slider Error: параметр 'wrapper', 'left' и 'right' обязателeн для заполнения в передаваемом объекте.");
            return;
        };
        this.swipe = data.swipe || false;                       // настраивать ли слайдер для свайпа
        // если стрелки не указаны, то включаем свайп
        if (!data?.prev && !data?.next) this.swipe = true;

        this.slider = document.querySelector(data.wrapper);     // сам слайдер
        this.prev = document.querySelector(data.prev);          // кнопка влево
        this.next = document.querySelector(data.next);          // кнопка вправо
        this.interval = data.interval || 0.5;                   // интервал для transition
        this.centralItem = data.centralItem - 1 || 0;           // центрировать слайдер по элементу


        this.track = this.slider.firstElementChild;             // трек, который двигается внутри slider
        this.setState();                                        // функция инициализации слайдера
        this.setControl();                                      // описание управления слайдером
        this.isAnimating = false;                               // признак анимации сейчас
    }

    state = {
        sliderWidth: 0,              // ширина slider
        sliderStep: 0,               // на какую величину будем "двигать" track
        sliderStart: 0               // начальное положение track
    }

    setState() {
        this.state.sliderWidth = this.slider.offsetWidth;

        const items = this.track.children;                          // сохраняет элементы слайдера
        const styles = getComputedStyle(this.track);                // сохранем стили элемента
        const gap = parseFloat(styles.columnGap || styles.gap || 0);// вычисляем gap

        this.state.sliderStep = items[0].offsetWidth + gap;         // шаг прокрутки слайдера

        // отменяет выделение содержимого (например текста) в элементах при свайпе
        this.slider.style.userSelect = 'none';
        this.slider.style.webkitUserSelect = 'none';

        // центрируем по указанному номеру элемента если нужно
        this.state.sliderStart = this.centralItem ?
            ((items[0].offsetWidth + gap) * this.centralItem) - (this.state.sliderWidth / 2 - items[0].offsetWidth / 2) : 0;

        this.track.style.transform = `translateX(-${this.state.sliderStart}px)`;
    }

    moveItems(direct) {
        if (this.isAnimating) return;

        this.isAnimating = true;

        if (direct === 'prev') {
            this.track.style.transition = `transform ${this.interval}s ease`;
            this.track.style.transform = `translateX(-${this.state.sliderStep + this.state.sliderStart}px)`;
            setTimeout(() => {
                this.track.style.transition = 'none';
                this.track.append(this.track.firstElementChild);
                this.track.style.transform = `translateX(-${this.state.sliderStart}px)`;
                this.isAnimating = false;
            }, this.interval * 1000);
        } else {
            this.track.style.transition = 'none';
            this.track.prepend(this.track.lastElementChild);
            this.track.style.transform = `translateX(-${this.state.sliderStep + this.state.sliderStart}px)`;
            this.track.offsetHeight;
            this.track.style.transition = `transform ${this.interval}s ease`;
            this.track.style.transform = `translateX(-${this.state.sliderStart}px)`;
            setTimeout(() => {
                this.isAnimating = false;
            }, this.interval * 1000);
        }
    };


    setControl() {
        if (this.prev) {
            this.prevEvent = () => {
                if (this.slider.offsetWidth !== this.state.sliderWidth) this.setState();
                this.moveItems('prev');
            };
            this.prev.addEventListener('click', this.prevEvent);
        }

        if (this.next) {
            this.nextEvent = () => {
                if (this.slider.offsetWidth !== this.state.sliderWidth) this.setState();
                this.moveItems('next');
            };
            this.next.addEventListener('click', this.nextEvent);
        }


        if (this.swipe) {
            this.swipeThreshold = 50;
            this.isDragging = false;

            this.swipeDown = (e) => {
                this.isDragging = true;
                this.startX = e.clientX;
            };
            this.slider.addEventListener('pointerdown', this.swipeDown);

            this.swipeUp = (e) => {
                if (!this.isDragging) return;

                const diff = this.startX - e.clientX;
                this.isDragging = false;

                if (Math.abs(diff) > this.swipeThreshold) {
                    diff > 0 ? this.moveItems('prev') : this.moveItems('next');
                }
            };
            this.slider.addEventListener('pointerup', this.swipeUp);
        }
    };

    destroy() {
        this.track.removeAttribute('style');

        this.next?.removeEventListener('click', this.nextEvent);
        this.prev?.removeEventListener('click', this.prevEvent);

        this.nextEvent = null;
        this.prevEvent = null;

        this.slider?.removeEventListener('pointerup', this.swipeUp);
        this.slider?.removeEventListener('pointerdown', this.swipeDown);

        this.swipeUp = null;
        this.swipeDown = null;
    }
}

export default Slider;