import BaseClass from './base-class';
import Context from "./context";

export const getKeyboardFocusableElements = (element = document) => {
    return [...(element as any).querySelectorAll(
      'a, button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])'
    )]
      .filter(el => !el.hasAttribute('disabled'))
      .filter(el => !el.classList.contains('-disabled'));
  }

export const getFocusableChildren = (element = document) => {
    const focusableSelectors = getKeyboardFocusableElements(element);
    return focusableSelectors.filter(child => !!(child.offsetWidth || child.offsetHeight || child.getClientRects().length));
  }
const COMPONENT_KEY:string = 'carousel';

export class Carousel extends BaseClass {
    _timelineContainer:any;
    _timelineScroller:any;
    _indicatorsContainer:any;
    _cards:any;
    _lastCard:any;
    _timelineConfig:any;
    _hasIndicators:any;
    _hasFocusableCards:any;
    _indicators:any;
    _prevBtn:any;
    _nextBtn:any;
    _hasArrows:any;
    _haschildren:any;
    _arrowsEvHandler:any;
    _resizeEvHandler:any;
    _initializeEvHandler:any;
    _timeOut:number;

    constructor(element:HTMLElement) {
        super(element);
        this._timelineContainer = this._element.querySelector('.c-carousel__scroller');
        this._timelineScroller = this._element.querySelector('.c-carousel__scroller .c-carousel__scroller-area');
        this._indicatorsContainer = this._element.querySelector('.c-carousel__indicators-container') || null;
        this._cards = Array.from(this._timelineScroller.querySelectorAll(':scope > *')) || []
        this._lastCard = this._timelineScroller.querySelector(':scope > :last-child') || null;

        this._timelineConfig = {
            TimelineContainerWidth: Number.parseInt(this._timelineScroller.clientWidth,10) || 0,
            TimelineDScrollerWidth: ()=>{
                if(Number.parseInt(this._timelineScroller.scrollWidth,10) > Number.parseInt(this._timelineScroller.clientWidth,10)){
                    return Number.parseInt(this._timelineScroller.scrollWidth,10) + ( Number.parseInt(window.getComputedStyle(this._lastCard).marginRight)  || 0 ) || 0
                }
                else{
                    return Number.parseInt(this._timelineScroller.scrollWidth,10)
                }
            }, 
            TimelineScrollerLeft: Number.parseInt(this._timelineScroller.offsetLeft,10) || 0,
            TimelineHidden: function(){
                return (this.TimelineDScrollerWidth() + this.TimelineScrollerLeft) - this.TimelineContainerWidth;
            },
            TimelineIndicators: function(){
                return Math.ceil( (this.TimelineDScrollerWidth() - 20) / this.TimelineContainerWidth);
            }
        };   
        this._hasIndicators = this._element.querySelector('.c-carousel__indicators-container') ? true : false;
        this._hasFocusableCards = this._checkForFocusableCards(); 

        this._indicators = [].slice.call(this._element.querySelectorAll('.c-carousel__indicator')) || [];
        this._prevBtn = Array.from(this._element.querySelectorAll('.c-carousel__scroll-block-prev')) || [];
        this._nextBtn = Array.from(this._element.querySelectorAll('.c-carousel__scroll-block-next')) || [];
        this._hasArrows = ( this._prevBtn.length > 0 || this._nextBtn.length > 0 ) ? true : false;

        this._haschildren = this._element.getAttribute('data-haschildren') == 'true' ? true : false;
        this._arrowsEvHandler = this._arrowHandler.bind(this);
        this._resizeEvHandler = this._resizeHandler.bind(this);
        this._initializeEvHandler = this._initHandler.bind(this);
        this._timeOut = 450;


        if(this._element) { this._init(); }
    }

    // Getter
    static get COMPONENT_KEY() {
        return COMPONENT_KEY;
    }

    // 0.1
    _updateTimeline(){
        this._lastCard = this._timelineScroller.querySelector(':scope > :last-child') || null;

        this._timelineConfig = {
            TimelineContainerWidth: Number.parseInt(this._timelineScroller.clientWidth,10) || 0,
            TimelineDScrollerWidth: ()=>{
                if(Number.parseInt(this._timelineScroller.scrollWidth,10) > Number.parseInt(this._timelineScroller.clientWidth,10)){
                    return Number.parseInt(this._timelineScroller.scrollWidth,10) + ( Number.parseInt(window.getComputedStyle(this._lastCard).marginRight) || 0 ) || 0
                }
                else{
                    return Number.parseInt(this._timelineScroller.scrollWidth,10)
                }
            }, 
            TimelineScrollerLeft: Number.parseInt(this._timelineScroller.offsetLeft,10) || 0,
            TimelineHidden: function(){
                return (this.TimelineDScrollerWidth() + this.TimelineScrollerLeft) - this.TimelineContainerWidth;
            },
            TimelineIndicators: function(){
                return Math.ceil( (this.TimelineDScrollerWidth() - 20) / this.TimelineContainerWidth);
            }
        };   
    }

    // 0.2
    _updateIndicators(){
        this._indicators = [].slice.call(this._element.querySelectorAll('.c-carousel__indicator')) || [];
    }

    // 0.3
    _checkForFocusableCards(){
        return true;
        if([...this._timelineScroller.querySelectorAll( 'a, button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])' )]
            .filter(el => !el.hasAttribute('disabled'))
            .filter(el => !el.classList.contains('-disabled')).length > 0){

            return true;
        }
        return false;
    }

    // 1.1 - Initialize Object and add eventlisteners
    _init(){
        if(this._hasIndicators){
            let staticIndicators = (this._indicatorsContainer.getAttribute('data-indicators') === 'hidden');
            this._createIndicators();
        }
        
        this._hasArrows && [ ...this._prevBtn, ...this._nextBtn ].forEach((item)=>{ item.addEventListener('click', this._arrowsEvHandler); });

        document.body.addEventListener('data.myw.init', this._initializeEvHandler);
        this._element.addEventListener('data.carousel.init', this._initializeEvHandler);
        window.addEventListener('resize', this._resizeEvHandler);

        this._setTimeline(true);
        this._updateCards();
    }

    // 1.2 - Dispose Object and Remove eventlisteners
    _destroy(){
        this._hasArrows && [ ...this._prevBtn, ...this._nextBtn ].forEach((item)=>{ item.removeEventListener('click', this._arrowsEvHandler); });
        document.body.removeEventListener('data.myw.init', this._initializeEvHandler);
        this._element.removeEventListener('data.carousel.init', this._initializeEvHandler);
        window.removeEventListener('resize', this._resizeEvHandler);

        super.dispose();
    }

    // 1.3 - Initialize when required - (for example, when an accordion opens and has a carousel inside)
    _initHandler(event:any){
        if(event.target.contains(this._element) || event.target == this._element){
            this._resizeHandler();
        }
    }

    // 2.1 - Create Indicators whenever required (on initialize or resize)
    _createIndicators(){
        // Remove present Indicators
        if(this._indicatorsContainer.querySelector('.c-carousel__indicators-wrap') !== null){
            this._indicatorsContainer.removeChild(this._indicatorsContainer.querySelector('.c-carousel__indicators-wrap'));
        }

        let staticIndicators = (this._indicatorsContainer.getAttribute('data-indicators') === 'hidden');
        let carouselIndicator__wrap = document.createElement('div');
        carouselIndicator__wrap.classList.add('c-carousel__indicators-wrap');

        for(let i=0; i < this._timelineConfig.TimelineIndicators(); i++){
            let indicator = staticIndicators ? document.createElement('div') : document.createElement('a');
            indicator.classList.add('c-carousel__indicator');
            
            !staticIndicators && indicator.setAttribute('href','javascript:;');
            !staticIndicators && indicator.setAttribute('role','button');
            !staticIndicators && indicator.setAttribute('tabindex','0');
            !staticIndicators && indicator.setAttribute('title', `Go to Page ${i+1}`)

            if(i==0){
                indicator.classList.add('-active');
                !staticIndicators && indicator.setAttribute('tabindex','-1');
            }
            carouselIndicator__wrap.appendChild(indicator);            
        }
        this._indicatorsContainer.appendChild(carouselIndicator__wrap);

        this._updateIndicators();
    }

    // 2.3 - handle arrow click
    _arrowHandler(event:any){
        this._updateTimeline();

        let el = event.currentTarget;
        let TimelineDirection = el.classList.contains('c-carousel__scroll-block-next')? 'right' : 'left';  
        let TimelinePositionLeft = this._timelineConfig.TimelineScrollerLeft;
        let amountToScroll;

        if (TimelineDirection==="right") {
            amountToScroll = -(Math.abs(TimelinePositionLeft) + Math.min(this._timelineConfig.TimelineHidden(), this._timelineConfig.TimelineContainerWidth));
        } 
        else {
            amountToScroll = Math.min(0, (this._timelineConfig.TimelineContainerWidth + TimelinePositionLeft));
        }
        this._timelineScroller.style.left = amountToScroll+'px';
        this._haschildren && this._handlechildren(amountToScroll);
        setTimeout(()=>{ 
            this._setTimeline(); 
            if(this._hasIndicators){this._setIndicators();}
        }, this._timeOut);
    }

    // 2.4 - update indicators on arrow key events
    _setIndicators(){
        let staticIndicators = (this._indicatorsContainer.getAttribute('data-indicators') === 'hidden');
        this._indicators.forEach( (el:any) => { 
            el.classList.remove('-active');  
            !staticIndicators && el.setAttribute('tabindex','0'); 
        });
        let index = Math.ceil(Math.abs(this._timelineConfig.TimelineScrollerLeft) / this._timelineConfig.TimelineContainerWidth);
        if(index < 0) index = 0;
        this._indicators[index].classList.add('-active');
        !staticIndicators && this._indicators[index].setAttribute('tabindex','-1');
    }

    // 2.5 - Function to update Arrows
    _setTimeline(init=false){
        this._updateTimeline();

        //enable/disable prev,next
        if(this._hasArrows){
            this._nextBtn.forEach((item:any)=>{item.classList.toggle('disabled', (this._timelineConfig.TimelineHidden() <= 1));})
            this._prevBtn.forEach((item:any)=>{item.classList.toggle('disabled', (this._timelineConfig.TimelineScrollerLeft >=-1));})
            
            if(this._timelineConfig.TimelineHidden() <= 1) { this._nextBtn.forEach((item:any)=>{item.disabled = true; item.setAttribute('tabindex','-1'); item.setAttribute('aria-hidden','true'); }) } 
            else { this._nextBtn.forEach((item:any)=>{item.disabled = false; item.setAttribute('tabindex','0'); item.setAttribute('aria-hidden','false'); }) }
            
            if(this._timelineConfig.TimelineScrollerLeft >=-1) { this._prevBtn.forEach((item:any)=>{item.disabled = true; item.setAttribute('tabindex','-1'); item.setAttribute('aria-hidden','true'); }) } 
            else { this._prevBtn.forEach((item:any)=>{item.disabled = false; item.setAttribute('tabindex','0'); item.setAttribute('aria-hidden','false'); }) }
        }

        if(init && this._indicators.length > 0){
            // Initialize Indicators
            this._indicators.forEach((el:any)=>{el.classList.remove('-active');}); 
            this._indicators[0].classList.add('-active');
        }

        // Update card attributes
        !init && this._updateCards(true);
    }

    // 2.6
    _updateCards(init = false){
        if(!this._timelineScroller.querySelector('.c-carousel__scroller-card')) return;

        let activePage = Math.ceil(Math.abs(this._timelineConfig.TimelineScrollerLeft) / this._timelineConfig.TimelineContainerWidth);
        let sampleEl = this._timelineScroller.querySelector('.c-carousel__scroller-card') || null; 
        let widthOfCard;
        if(sampleEl) {
            widthOfCard = sampleEl.offsetWidth;
            let sampleStyle = window.getComputedStyle(sampleEl);
            widthOfCard = widthOfCard + parseFloat(sampleStyle.marginLeft) +  parseFloat(sampleStyle.marginRight);
        }
        else {
            return;
        }
        
        let cardsPerPage = Math.floor((this._timelineConfig.TimelineContainerWidth) / widthOfCard);
        if(cardsPerPage < 1) { cardsPerPage = 1; }

        let targetArray = Array.from(this._timelineScroller.querySelectorAll('.c-carousel__scroller-card')) || [];

        let lowerLimit = 0 + (activePage * cardsPerPage);
        let upperLimit = cardsPerPage + (activePage * cardsPerPage);
        let buffer = 0;

        if(upperLimit > (targetArray.length)) {
            buffer = upperLimit - targetArray.length;
        }

        lowerLimit -= buffer; upperLimit -= buffer;

        targetArray.forEach((el:any)=> {
            el.setAttribute('aria-hidden','true');
            el.setAttribute('tabindex', '-1');

            let arr = getFocusableChildren(el);
            arr.forEach((item)=>{
                item.setAttribute('aria-hidden','true');
                item.setAttribute('tabindex', '-1');            
            })
        });
        targetArray.slice(lowerLimit, upperLimit).forEach((el:any)=> {
            el.setAttribute('aria-hidden','false');
            el.setAttribute('tabindex', '0');

            let arr = getFocusableChildren(el);
            arr.forEach((item)=>{
                item.setAttribute('aria-hidden','false');
                item.setAttribute('tabindex', '0');            
            })
        });

        init && (targetArray[lowerLimit] as any).focus({preventScroll:true, focusVisible:true});
    }

    // 4 - Handle window resize
    _resizeHandler(){
        this._timelineScroller.setAttribute('style',`left : 0px`);
        this._haschildren && this._handlechildren(0);

        this._updateTimeline();

        if(this._hasIndicators){
            let staticIndicators = (this._indicatorsContainer.getAttribute('data-indicators') === 'hidden');
            this._createIndicators();
        }

        setTimeout(()=>{ this._setTimeline(true); this._updateCards(); }, this._timeOut);
    }

    _handlechildren(amountToScroll:number) {
        let targetId = this._element.getAttribute('data-targetid') || 'null';
        let dependents = Array.from(document.querySelectorAll(`[data-id="${targetId}"]`) as NodeListOf<HTMLElement> );
        dependents.forEach((item:HTMLElement)=>{
            item.style.left = `${amountToScroll}px`;
        });
    }

    // Static Interface
    static carouselInterface(element:HTMLElement) {
        const context:any = Context.get(element, COMPONENT_KEY);
        if(context) return context;
        return new Carousel(element);
    }
}

export const carouselINIT = () =>{
    if(!document.querySelector('.c-carousel__wrap')){
        return;
    }

    // NOTE: CALL THIS ON ngAfterViewInit()
    let carousels = [].slice.call(document.querySelectorAll('.c-carousel__wrap:not(.-ignore)') as NodeListOf<HTMLElement>) || [];
    let elements = carousels.map((item:any) => Carousel.carouselInterface(item));
}