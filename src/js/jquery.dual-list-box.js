

;(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
  let dualListBox = (function() {
    let defaults = {
      leftSelect: undefined,
      rightSelect: undefined
    };
    return {
      init: function (options) {
        options = $.extend({}, defaults, options || {});
        $(this).each(function (i, b) {

          let this_ = $(b), select1, select2;
          if (options.leftSelect !== undefined && options.rightSelect !== undefined) {
            select1 = $(options.leftSelect);
            select2 = $(options.rightSelect);
          } else {
            select1 = $(this_.find('select[multiple]')[0]);
            select2 = $(this_.find('select[multiple]')[1]);
          }
          if (select2.is(select1)) {
            throw new Error('You must select 2 different select lists; lists must be multiple');
          }
          select1.hide();
          select2.hide();
          let list1 = {block: $('<div class="dual-list-box"><div class="dual-list-box__comment-line"><div class="dual-list-box__comment"></div><div class="dual-list-box__show-all-btn">show all</div></div><div class="dual-list-box__filter"><input type="text" placeholder="Filter" class="dual-list-box__filter-input"></div><div class="dual-list-box__list-wrapper"><div class="dual-list-box__move-all"></div><div class="dual-list-box__list-container"></div></div></div>')},
              list2 = {block: list1.block.clone()}, doc = $(document), selection = {first: undefined, last: undefined, selection: undefined};
          let createOption = function(optionNative) {
            let option = $('<div class="dual-list-box__option"></div>');
            option.attr('value', optionNative.value).text(optionNative.innerHTML);
            return option;
          }
          let createNativeOption = function(option) {
            let optionNative = $('<option></option>'), val = option.length !== undefined ? option.attr('value') : $(option).attr('value'),
                text = option.length !== undefined ? option.text() : option.innerHTML;
            optionNative.attr({'selected': '', value: val}).text(text);
            return optionNative;
          }
          let updateForward = function() {
            let payload = [], filterValue = this.filterInput.val(), reg, lengthAll = 0;
            try {
              reg = new RegExp('^' + filterValue, 'i');
            } catch (e) {
              return;
            }
            this.optionsNative = this.selectNative.find('option');
            for (let i = 0; i < this.optionsNative.length; i++) {
              let option = createOption(this.optionsNative[i]);
              if (option.text().match(reg) !== null) {
                payload.push(option);
              }
              lengthAll++;
            }
            payload = payload.sort((optionA, optionB) => {
              let valA = optionA.text(), valB = optionB.text();
              for (let i = 0; i < valA.length && i < valB.length; i++) {
                if (valA[i] > valB[i]) {
                  return 1;
                }
                if (valB[i] > valA[i]) {
                  return -1;
                }
              }
              return valA.length > valB.length ? 1 : valA.length < valB.length ? -1 : 0;
            });
            this.options = payload;
            this.container.empty().append(payload);
            setFilterProps.call(this, lengthAll, payload.length);
          }
          let setFilterProps = function (lengthAll, lengthCurrent) {
            let status = lengthCurrent < lengthAll ? 'Filtered' : 'Showing all',
                comment = $('<span class="dual-list-box__inner-comment' + (status.match(/filtered/i) !== null ? ' dual-list-box__inner-comment_filtered' : '') + '">' + status + '</span><span class="dual-list-box__comment-info">' + lengthCurrent + (lengthCurrent !== lengthAll ? ' of ' + lengthAll : '') + '</span>');
            this.comment.html(comment);
            if (status.match(/filtered/i) !== null) {
              this.showAllBtn.show();
            } else {
              this.showAllBtn.hide();
            }
          }
          let createSelection = function() {
            if (selection.first === undefined) {
              return;
            }
            let sel;
            if (selection.last === undefined || (selection.first.index() < selection.last.index())) {
              sel = selection.first.nextUntil(selection.last).add(selection.first).add(selection.last);
            } else if (selection.first.index() === selection.last.index()) {
              sel = selection.first.nextUntil(selection.first.next()).add(selection.first);
            } else {
              first = selection.last;
              last = selection.first;
              sel = selection.last.nextUntil(selection.first).add(selection.last).add(selection.first);
            }
            list1.container.add(list2.container).children('.dual-list-box__option').removeClass('dual-list-box__option_selected')
            sel.addClass('dual-list-box__option_selected');
            selection.selection = sel;
          }
          let preDrag = function(ev) {
            let elem = $(ev.target);
            if (elem.is('.dual-list-box__option')) {
              selection.first = selection.last = elem;
            }
            createSelection();
          }
          let onDrag = function (ev) {
            let elem = $(ev.target);
            if (elem.is('.dual-list-box__option')) {
              selection.last = elem;
            }
            createSelection();
          }
          let dragEnd = function (ev) {
            selection.last = selection.first = undefined;
            move.call(this);
            selection.selection = undefined;
          }
          let move = function() {
            if (selection.selection === undefined) {
              return;
            }
            let another = [list1, list2].filter(l => l !== this)[0], sel = selection.selection;
            insertOptions.call(another, sel);
            removeOptions.call(this, sel);
            sel.removeClass('dual-list-box__option_selected');
            updateForward.call(this);
            updateForward.call(another);
          }
          let insertOptions = function (options) {
            let payload = [];
            for (let i = 0; i < options.length; i++) {
              payload.push(createNativeOption(options[i]));
            }
            this.selectNative.append(payload);
          }
          let removeOptions = function (options) {
            for (let i = 0; i < options.length; i++) {
              let val = options[i].length !== undefined ? options[i].attr('value') : $(options[i]).attr('value');
              this.selectNative.find('option[value="' + val + '"]').remove();
            }
          }
          for (let i = 0; i < 2; i++) {
            let list = [list1, list2][i];
            list.selectNative = [select1, select2][i];
            list.comment = list.block.find('.dual-list-box__comment');
            list.showAllBtn = list.block.find('.dual-list-box__show-all-btn');
            list.filterInput = list.block.find('.dual-list-box__filter input');
            list.moveAllBtn = list.block.find('.dual-list-box__move-all');
            list.moveAllBtn.append('<i class="fa ' + ['fa-caret-right', 'fa-caret-left'][i] + '"></i><i class="fa ' + ['fa-caret-right', 'fa-caret-left'][i] + '"></i>');
            list.container = list.block.find('.dual-list-box__list-container');
            list.block.insertAfter(list.selectNative);
            updateForward.call(list);
            list.container.on('mousedown', ev => {
              preDrag.call(list, ev);
              doc.on('mousemove.dualListBoxDrag', e => onDrag.call(list, e));
              doc.on('mouseup.dualListBoxDrag', e => {
                doc.off('mousemove.dualListBoxDrag mouseup.dualListBoxDrag');
                dragEnd.call(list, ev);
              });
            });
            let moveAll = function (ev) {
              selection.selection = list.container.find('.dual-list-box__option');
              move.call(list);
              selection.selection = undefined;
            }
            list.moveAllBtn.on('click', moveAll);
            list.filterInput.on('keyup', ev => {
              if (ev.which === 13) {
                moveAll(ev);
              } else {
                updateForward.call(list);
              }
            });
            list.showAllBtn.on('click', ev => {
              list.filterInput.val('');
              updateForward.call(list);
            }).hide();
          }
        });
      }, addOptions: function (options) {

      }
    }
  }());
  window.$.fn.extend({
    dualListBox: dualListBox.init,
    addListOptions: dualListBox.addOptions
  });
}));
