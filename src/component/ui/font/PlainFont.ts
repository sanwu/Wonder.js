module wd {
    const WORD_REX = /([a-zA-Z0-9]+|\S)/,
        FIRST_ENGLISH_OR_NUM = /^[a-zA-Z0-9]/,
        LAST_ENGLISH_OR_NUM = /[a-zA-Z0-9]+$/,
        LAST_INVALID_CHAR = /\s+$/;

    //todo now only support English, need support more languages like French,German
    export class PlainFont extends Font {
        public static create() {
            var obj = new this();

            return obj;
        }

        private _text:string = "";
        @cloneAttributeAsBasicType()
        get text(){
            return this._text;
        }
        set text(text:string){
            if(this._text !== text){
                this._text = text;

                this.dirty = true;
                this.needFormat = true;
            }
        }

        private _fontSize:number = 10;
        @cloneAttributeAsBasicType()
        get fontSize(){
            return this._fontSize;
        }
        set fontSize(fontSize:number){
            if(this._fontSize !== fontSize){
                this._fontSize = fontSize;

                this.dirty = true;
                this.needFormat = true;
            }
        }

        private _fontFamily:string = "sans-serif";
        @cloneAttributeAsBasicType()
        get fontFamily(){
            return this._fontFamily;
        }
        set fontFamily(fontFamily:string){
            if(this._fontFamily !== fontFamily){
                this._fontFamily = fontFamily;

                this.dirty = true;
                this.needFormat = true;
            }
        }

        private _xAlignment:EFontXAlignment = EFontXAlignment.LEFT;
        @cloneAttributeAsBasicType()
        get xAlignment(){
            return this._xAlignment;
        }
        set xAlignment(xAlignment:EFontXAlignment){
            if(this._xAlignment !== xAlignment){
                this._xAlignment = xAlignment;

                this.dirty = true;
                this.needFormat = true;
            }
        }

        private _yAlignment:EFontYAlignment = EFontYAlignment.TOP;
        @cloneAttributeAsBasicType()
        get yAlignment(){
            return this._yAlignment;
        }
        set yAlignment(yAlignment:EFontYAlignment){
            if(this._yAlignment !== yAlignment){
                this._yAlignment = yAlignment;

                this.dirty = true;
                this.needFormat = true;
            }
        }

        @cloneAttributeAsBasicType()
        private _fillEnabled:boolean = true;
        @cloneAttributeAsBasicType()
        private _fillStyle:string = "rgba(0, 0, 0, 1)";
        @cloneAttributeAsBasicType()
        private _strokeEnabled:boolean = false;
        @cloneAttributeAsBasicType()
        private _strokeStyle:string = null;
        @cloneAttributeAsBasicType()
        private _strokeSize:number = null;
        private _fontClientHeightCache:wdCb.Hash<number> = wdCb.Hash.create<number>();
        @cloneAttributeAsBasicType()
        private _lineHeight:number = null;
        private _strArr:Array<string> = [];

        public init() {
            super.init();

            this._formatText();

            if(!this._lineHeight){
                this._lineHeight = this._getDefaultLineHeight();
            }
        }

        public setFillStyle(fillStyle:string) {
            this._fillStyle = fillStyle;
        }

        public enableStroke(strokeStyle:string, strokeSize:number) {
            this._strokeEnabled = true;
            this._fillEnabled = false;

            this._strokeStyle = strokeStyle;
            this._strokeSize = strokeSize;
        }

        public enableFill(fillStyle:string) {
            this._fillEnabled = true;
            this._strokeEnabled = false;

            this._fillStyle = fillStyle;
        }

        public setLineHeight(lineHeight:number) {
            this._lineHeight = lineHeight;
        }

        protected reFormat(){
            this._formatText();
            this._lineHeight = this._getDefaultLineHeight();
        }

        protected draw(){
            var context = this.context;

            context.font = `${this.fontSize}px '${this.fontFamily}'`;

            context.textBaseline = "top";
            context.textAlign = "start";

            if (this._strArr.length > 1) {
                this._drawMultiLine();
            }
            else {
                this._drawSingleLine();
            }
        }

        private _formatText() {
            var maxWidth = this.width;

            this._trimStr();

            if (maxWidth !== 0) {
                this._strArr = this._text.split('\n');

                for (let i = 0; i < this._strArr.length; i++) {
                    let text = this._strArr[i],
                        allWidth = this._measure(text);

                    if (allWidth > maxWidth && text.length > 1) {
                        this._formatMultiLine(i, text, allWidth, maxWidth);
                    }
                }
            }
        }

        private _trimStr() {
            this._text = this._text.replace(LAST_INVALID_CHAR, "");
        }

        private _formatMultiLine(i:number, text:string, allWidth:number, maxWidth:number) {
            const LOOP_MAX_NUM = 100;
            var self = this,
                preText = null,
                truncationPointIndex = text.length * ( maxWidth / allWidth ) | 0,
                nextText = text.substr(truncationPointIndex),
                loopIndex = 0,
                width = allWidth - this._measure(nextText),
                pushNum = 0;


            var truncate = () => {
                /*! truncate string by the maxWidth / width ratio
                if string still exceed maxWidth, truncate with the same ratio recursive

                after loop, truncationPointIndex will <= the true one
                 */
                while (width > maxWidth && loopIndex < LOOP_MAX_NUM) {
                    truncationPointIndex *= maxWidth / width;
                    truncationPointIndex = Math.floor(truncationPointIndex);
                    nextText = text.substr(truncationPointIndex);
                    width = allWidth - this._measure(nextText);
                    loopIndex = loopIndex + 1;
                }

                loopIndex = 0;
            }

            var findTruncationPoint = () => {
                /*! find the truncation point to get the true truncationPointIndex
                step by word(if it's chinese, the step will be 1)
                after loop, truncationPointIndex will be the index of last char of the word which exceed maxWidth
                 */

                while (width < maxWidth && loopIndex < LOOP_MAX_NUM) {
                    if (nextText) {
                        let exec = WORD_REX.exec(nextText);
                        pushNum = exec ? exec[0].length : 1;
                    }

                    truncationPointIndex = truncationPointIndex + pushNum;
                    nextText = text.substr(truncationPointIndex);
                    width = allWidth - this._measure(nextText);
                    loopIndex = loopIndex + 1;
                }
            }

            var handleTruncationPointIndex = () => {
                /*!
                shouldn't truncate the word
                 */
                if (FIRST_ENGLISH_OR_NUM.test(nextText)) {
                    let preText = text.substr(0, truncationPointIndex),
                        pExec = LAST_ENGLISH_OR_NUM.exec(preText);

                    if (pExec) {
                        truncationPointIndex = truncationPointIndex - pExec[0].length;
                    }
                }
                else {
                    truncationPointIndex = truncationPointIndex - pushNum;
                }

                if (truncationPointIndex === 0) {
                    truncationPointIndex = 1;
                }
            }

            var setString = () => {
                nextText = text.substr(truncationPointIndex);
                preText = text.substr(0, truncationPointIndex);


                self._strArr[i] = nextText;
                self._strArr.splice(i, 0, preText);
            }


            truncate();
            findTruncationPoint();
            handleTruncationPointIndex();
            setString();
        }

        private _measure(text) {
            var context = this.context;

            context.font = `${this.fontSize}px '${this.fontFamily}'`;

            return context.measureText(text).width;
        }

        private _getDefaultLineHeight() {
            return this._computeLineHeight("normal");
        }

        private _computeLineHeight(lineHeight) {
            var div = wdCb.DomQuery.create("<div></div>"),
                dom = div.get(0),
                resultLineHeight = null;

            dom.style.cssText = `
             font-family: ${this.fontFamily};
             font-size: ${this.fontSize}px;
             position: absolute;
             left: -100px;
             top: -100px;
             line-height: ${lineHeight};
             `;

            div.prependTo("body");

            dom.innerHTML = "abc!";

            resultLineHeight = dom.clientHeight;

            div.remove();

            return resultLineHeight;
        }

        private _getFontClientHeight() {
            var fontSize = this.fontSize,
                fontName = this.fontFamily,
                key = `${fontSize}.${fontName}`,
                cacheHeight = this._fontClientHeightCache.getChild(key),
                height = null;

            if (cacheHeight) {
                return cacheHeight;
            }

            height = this._computeLineHeight(1);
            this._fontClientHeightCache.addChild(key, height);

            return height;
        }

        private _drawMultiLine(){
            var context = this.context,
                //position = this.getCanvasPosition(),
                position = this.getLeftCornerPosition(),
                x = position.x,
                y = position.y,
                lineHeight = this._lineHeight,
                fontClientHeight = this._getFontClientHeight(),
                self = this,
                lineCount = this._strArr.length,
            /*! the lineHeight of last line is the height of font */
                lineTotalHeight = (lineCount - 1) * lineHeight + fontClientHeight;

            if (self.yAlignment === EFontYAlignment.BOTTOM) {
                y = y + self.height - lineTotalHeight;
            }
            else if (self.yAlignment === EFontYAlignment.MIDDLE) {
                y = y + (self.height - lineTotalHeight) / 2;
            }

            for (let str of this._strArr) {
                if (self.xAlignment === EFontXAlignment.RIGHT) {
                    x = x + self.width - self._measure(str);
                }
                else if (self.xAlignment == EFontXAlignment.CENTER) {
                    x = x + (self.width - self._measure(str)) / 2;
                }


                if (self._fillEnabled) {
                    context.fillStyle = self._fillStyle;
                    context.fillText(str, x, y);
                }
                else if (self._strokeEnabled) {
                    context.strokeStyle = self._strokeStyle;
                    context.lineWidth = self._strokeSize;
                    context.strokeText(str, x, y);
                }

                x = position.x;
                y = y + lineHeight;
            }
        }

        private _drawSingleLine() {
            var context = this.context,
                position = this.getLeftCornerPosition(),
                x = position.x,
                y = position.y,
                fontClientHeight = this._getFontClientHeight(),
                self = this,
                lineCount = 1,
            /*! the lineHeight is the height of font */
                lineTotalHeight = fontClientHeight,
                str = this._strArr[0];

            if (self.yAlignment === EFontYAlignment.BOTTOM) {
                y = y + self.height - lineTotalHeight;
            }
            else if (self.yAlignment === EFontYAlignment.MIDDLE) {
                y = y + (self.height - lineTotalHeight) / 2;
            }

            if (self.xAlignment === EFontXAlignment.RIGHT) {
                x = x + self.width - self._measure(str);
            }
            else if (self.xAlignment == EFontXAlignment.CENTER) {
                x = x + (self.width - self._measure(str)) / 2;
            }


            if (self._fillEnabled) {
                context.fillStyle = self._fillStyle;
                context.fillText(str, x, y);
            }
            else if (self._strokeEnabled) {
                context.strokeStyle = self._strokeStyle;
                context.lineWidth = self._strokeSize;
                context.strokeText(str, x, y);
            }
        }
    }
}

