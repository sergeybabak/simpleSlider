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

// Структура блока с точками
{/*    <div class="gallery-dot">
        <span></span>
        <span></span>
        <span class="dot-active"></span>
        <span></span>
        <span></span>
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
    // если есть сверстанные точки 
    dots: {
            panelClass: 'gallery-dot',  // обертка точек
            activClass: 'dot-active'    // активный класс точки
        }
          
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
        if (data?.dots) this.dots = data.dots || null;          // если предусмотрены точки в слайдере


        this.track = this.slider.firstElementChild;             // трек, который двигается внутри slider
        this.setState();                                        // функция инициализации слайдера
        this.setControl();                                      // описание управления слайдером
        this.isAnimating = false;                               // признак анимации сейчас
    }

    state = {
        sliderWidth: 0,              // ширина slider
        sliderCount: 0,              // количество элементов карусели (для точек)
        sliderStep: 0,               // на какую величину будем "двигать" track
        sliderStart: 0,              // начальное положение track
        sliderPoint: 0               // текущий активный слайд (для точек)
    }

    setState() {
        this.state.sliderCount = this.track.children.length;

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

        // когда есть точки
        if (this.dots) {
            this.dotItems = document.querySelector(`.${this.dots.panelClass}`).children;
            this.state.sliderPoint = this.centralItem;
            this.setDot(this.state.sliderPoint);
        }
    }

    setDot(num) {
        [...this.dotItems].forEach((item, i) => {
            if (i === num) {
                item.classList.add(this.dots.activeClass);
            } else {
                item.classList.remove(this.dots.activeClass);
            }
        });
    }

    moveItems(direct) {
        if (this.isAnimating) return;

        this.isAnimating = true;

        if (direct === 'prev') {
            // 1. Создаем клон первого элемента
            const clone = this.track.firstElementChild.cloneNode(true);
            // 2. Добавляем его в конец, чтобы при сдвиге там не было пустоты
            this.track.append(clone);

            this.track.style.transition = `transform ${this.interval}s ease`;
            this.track.style.transform = `translateX(-${this.state.sliderStep + this.state.sliderStart}px)`;
            setTimeout(() => {
                this.track.style.transition = 'none';
                // 4. Удаляем клон
                clone.remove();
                this.track.append(this.track.firstElementChild);
                this.track.style.transform = `translateX(-${this.state.sliderStart}px)`;
                this.isAnimating = false;
            }, this.interval * 1000);

            this.state.sliderPoint++;   // для точек
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

            this.state.sliderPoint--;   // для точек
        }

        if (this.state.sliderPoint < 0) {
            this.state.sliderPoint = this.state.sliderCount - 1;
        } else
            if (this.state.sliderPoint >= this.state.sliderCount) {
                this.state.sliderPoint = 0;
            }
        if (this.dots) this.setDot(this.state.sliderPoint);
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