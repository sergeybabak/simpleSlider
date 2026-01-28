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
        if (!data?.wrapper || !data?.prev || !data?.next) {
            console.error("Slider Error: параметры 'wrapper', 'left' и 'right' обязательны для заполнения в передаваемом объекте.");
            return;
        };
        this.slider = document.querySelector(data.wrapper);     // сам слайдер
        this.prev = document.querySelector(data.prev);          // кнопка влево
        this.next = document.querySelector(data.next);          // кнопка вправо
        this.interval = data.interval || 0.5;                   // интервал для transition
        this.centralItem = data.centralItem - 1 || 0;           // центрировать слайдер по элементу
        this.swipe = data.swipe || false;                       // настраивать ли слайдер для свайпа

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
        this.prevEvent = () => {
            if (this.slider.offsetWidth !== this.state.sliderWidth) this.setState();
            this.moveItems('prev');
        };
        this.nextEvent = () => {
            if (this.slider.offsetWidth !== this.state.sliderWidth) this.setState();
            this.moveItems('next');
        };
        this.prev.addEventListener('click', this.prevEvent);
        this.next.addEventListener('click', this.nextEvent);

        if (this.swipe) {
            this.swipeThreshold = 50;
            this.isDragging = false;

            this.slider.addEventListener('pointerdown', (e) => {
                this.isDragging = true;
                this.startX = e.clientX;
            });

            this.slider.addEventListener('pointerup', (e) => {
                if (!this.isDragging) return;

                const diff = this.startX - e.clientX;
                this.isDragging = false;
                console.log(diff, this.swipeThreshold);
                if (Math.abs(diff) > this.swipeThreshold) {
                    console.log(diff);
                    diff > 0 ? this.moveItems('prev') : this.moveItems('next');
                }
            });
        }
    };

    destroy() {
        this.track.removeAttribute('style');

        this.next.removeEventListener('click', this.nextEvent);
        this.prev.removeEventListener('click', this.prevEvent);

        this.nextEvent = null;
        this.prevEvent = null;
    }
}

export default Slider;