import $ from "jquery";

$(document)
    .on('focus.textarea', '.auto-expand', function() {
        const savedValue = this.value;
        this.value = '';
        this.baseScrollHeight = this.scrollHeight;
        this.value = savedValue;
        this._scrollbarInit = false;
    })
    .on('input.textarea', '.auto-expand', function() {
        const lineHeight = parseInt(window.getComputedStyle(this).getPropertyValue('line-height'), 10),
            minRows = this.getAttribute('data-min-rows')|0,
            maxRows = this.getAttribute('data-max-rows');

        this.rows = minRows;
        let rows = Math.ceil((this.scrollHeight - this.baseScrollHeight) / lineHeight);

        if (maxRows && maxRows < minRows + rows) {
            this.rows = maxRows;
            const textarea = $(this),
                scroller = textarea.next().hasClass('scroller') ? textarea.next() : $('<div/>').addClass('scroller').insertAfter(textarea),
                scroll = scroller.find('.scroll').length > 0 ? scroller.find('.scroll') : $('<div/>').addClass('scroll').appendTo(scroller);

            const placeScroller = () => {
                const height = Math.max(Math.floor(scroller.height()/textarea[0].scrollHeight * textarea.outerHeight()), 30);
                const top = Math.floor((scroller.height() - height) / (textarea[0].scrollHeight - textarea.outerHeight()) * textarea.scrollTop());
                scroll.css({
                    top: `${top}px`,
                    height: `${height}px`
                });
            };

            placeScroller();

            if (!this._scrollbarInit) {
                textarea.on('scroll', placeScroller);

                // make mousewheel scrollable
                textarea.on('wheel', function(e) {
                    const maxScrollTop = textarea[0].scrollHeight - textarea.outerHeight(),
                        scrollTop = textarea.scrollTop(),
                        deltaY = e.originalEvent.deltaY;

                    if ((deltaY < 0 && scrollTop > 0) || (deltaY > 0 && scrollTop < maxScrollTop)) {
                        e.preventDefault();
                        textarea.scrollTop(scrollTop + deltaY);
                        placeScroller();
                    }
                });
                this._scrollbarInit = true;
            }
        } else {
            if (this._scrollbarInit) {
                $(this).off('scroll wheel');
                if ($(this).next().hasClass('scroller')) {
                    $(this).next().remove();
                }
                this._scrollbarInit = false;
            }
            this.rows = minRows + rows;
        }
    });
