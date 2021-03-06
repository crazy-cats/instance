/* 
 * Copyright © 2018 CrazyCat, Inc. All rights reserved.
 * See COPYRIGHT.txt for license details.
 */
define(['jquery', 'translator', 'utility'], function ($, __, utility) {

    return function (options) {

        let opts = $.extend(true, {
            el: null,
            paramsEl: null,
            sourceBoxEl: null,
            noSelectionValue: '_NO_SELECTION_',
            paramsSeparator: ',',
            pageSizes: [20, 50, 100],
            itemTypes: {}
        }, options);

        let selector = $(opts.el);
        let paramsElm = $(opts.paramsEl);
        let sourceBox = $(opts.sourceBoxEl);
        let currentType = selector.val();

        let updateItemType = function (selected) {
            if (opts.itemTypes[selector.val()]['params_generating_url']) {
                utility.loading(true);

                if (currentType !== selector.val()) {
                    paramsElm.val(null);
                    currentType = selector.val();
                }
                let url = opts.itemTypes[currentType]['params_generating_url'];

                let data = 'ids=' + paramsElm.val();
                sourceBox.find('input, select').each(function () {
                    let el = $(this);
                    data += '&' + el.attr('name') + '=' + el.val();
                });
                if (selected === true) {
                    data += '&' + 'filter[ids]=1';
                }

                $.ajax({
                    url: url + (url.indexOf('?') === -1 ? '?' : '&') + 'ajax=1',
                    type: 'post',
                    dataType: 'json',
                    data: data,
                    complete: function () {
                        utility.loading(false);
                    },
                    success: function (response) {
                        if (response.error) {
                            alert(response.message);
                            return;
                        }

                        let selectedIds = paramsElm.val().split(opts.paramsSeparator);

                        let html = '<div class="box-wrapper"><table><thead>';

                        /**
                         * Captions
                         */
                        html += '<tr class="captions">' +
                            '<th class="ids">&nbsp;</th>';
                        for (let i in response.fields) {
                            let field = response.fields[i];
                            html += '<th>' +
                                (field.sort ? ('<a href="javascript:;"><span>' + field.label + '</span></a>') : ('<span>' + field.label + '</span>')) +
                                '</th>';
                        }
                        html += '</tr>';

                        /**
                         * Filters
                         */
                        html += '<tr class="filters">' +
                            '<th class="ids"><select name="filter[ids]"><option value="' + opts.noSelectionValue + '"></option>' +
                            '<option value="1"' + (response.filters['ids'] === '1' ? ' selected="selected"' : '') + '>' + __('Yes') + '</option>' +
                            '<option value="0"' + (response.filters['ids'] === '0' ? ' selected="selected"' : '') + '>' + __('No') + '</option>' +
                            '</select></th>';
                        for (let i in response.fields) {
                            let field = response.fields[i];
                            html += '<th>';
                            if (field.filter) {
                                switch (field.filter.type) {
                                    case 'text' :
                                        html += '<input type="text" class="input-text" name="filter[' + field.name + ']" value="' + ((response.filters && response.filters[field.name]) ? utility.encodeAttr(response.filters[field.name]) : '') + '" />';
                                        break;
                                    case 'select' :
                                        html += '<select name="filter[' + field.name + ']"><option value="' + opts.noSelectionValue + '"></option>';
                                        for (let o = 0; o < field.filter.options.length; o++) {
                                            html += '<option value="' + field.filter.options[o].value + '"';
                                            if (response.filters && response.filters[field.name] && response.filters[field.name] === field.filter.options[o].value) {
                                                html += ' selected="selected"';
                                            }
                                            html += '>' + field.filter.options[o].label + '</option>';
                                        }
                                        html += '</select>';
                                        break;
                                }
                            } else {
                                html += '&nbsp;';
                            }
                            html += '</th>';
                        }
                        html += '<tr></thead>';

                        /**
                         * Content
                         */
                        html += '<tbody>';
                        if (response.data.items.length !== 0) {
                            for (let k = 0; k < response.data.items.length; k++) {
                                let item = response.data.items[k];
                                html += '<tr><td class="ids">' +
                                    '<input type="checkbox" name="id" value="' + item.id + '"' + ((selectedIds.indexOf(item.id) !== -1) ? ' checked="checked"' : '') + ' />' +
                                    '</td>';
                                for (let f in response.fields) {
                                    let field = response.fields[f];
                                    html += '<td>' + (item[field.name] || '-') + '</td>';
                                }
                                html += '</tr>';
                            }
                        } else {
                            html += '<tr><td class="no-record" colspan="' + (response.fields.length + 1) + '">' + __('No matched record found.') + '</td></tr>';
                        }
                        html += '</tbody>';

                        /**
                         * Toolbar
                         */
                        html += '<tfoot><tr><td colspan="' + (response.fields.length + 1) + '">' +
                            '<div class="page-limit">' +
                            '<select name="limit">';
                        for (let i = 0; i < opts.pageSizes.length; i++) {
                            html += '<option value="' + opts.pageSizes[i] + '"';
                            if (response.data.pageSize === opts.pageSizes[i]) {
                                html += ' selected="selected"';
                            }
                            html += '>' + opts.pageSizes[i] + '</option>';
                        }
                        let totalPages = Math.max(Math.ceil(response.data.total / response.data.pageSize), 1);
                        let htmlCurrentPage = '<select name="p">';
                        for (let p = 1; p <= totalPages; p++) {
                            htmlCurrentPage += '<option value="' + p + '"';
                            if (response.data.currentPage === p) {
                                htmlCurrentPage += ' selected="selected"';
                            }
                            htmlCurrentPage += '>' + p + '</option>';
                        }
                        htmlCurrentPage += '</select>';
                        html += '</select>' +
                            __('items per page') + '</div>' +
                            '<div class="pagination">' + __('Total %1 items, page %2 of %3', [response.data.total, htmlCurrentPage, totalPages]) + '</div>' +
                            '</td></tr></tfoot>';

                        html += '</table></div>';

                        sourceBox.html(html);
                    }
                });
            } else {
                paramsElm.val(null);
                sourceBox.html('');
            }
        };

        sourceBox.on('change', 'td.ids input', function () {
            let params = paramsElm.val().split(opts.paramsSeparator);
            let value = $(this).val();
            let pos = params.indexOf(value);
            if (pos === -1) {
                params.push(value);
            } else {
                params.splice(pos, 1);
            }
            paramsElm.val(params.join(opts.paramsSeparator));
        });

        sourceBox.on('click', 'tbody tr', function (evt) {
            let el = $(this).find('.ids input').get(0);
            if (el && evt.target !== el) {
                el.checked = !el.checked;
                $(el).trigger('change');
            }
        });

        selector.on('change', updateItemType);
        sourceBox.on('change', 'select', updateItemType);
        sourceBox.on('keyup', 'input[type="text"]', function (evt) {
            if (evt.key === 'Enter') {
                updateItemType();
            }
        });
        updateItemType(true);

    };

});