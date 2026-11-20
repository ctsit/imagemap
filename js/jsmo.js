// This file extends the default JSMO object with methods for this EM
; {
    // Define the jsmo in IIFE so we can reference object in our new function methods
    const module = ExternalModules.ImageMap.ExternalModule;

    // Extend the official JSMO with new methods
    Object.assign(module, {

        // Startup function for data entry pages with imagemaps
        start: function () {
            /*
             * Ensure idempotency: if this function has already run once (e.g., the
             * form was re‑rendered after a language switch), first clean up any
             * existing ImageMapster bindings and DOM elements before redrawing.
             */
            if (module._initialized) {
                module.cleanup();
            }
            module._initialized = true;
            // Render each imagemap and create a pointer to it by field_name
            if (!module.data) module.data = {};
            module.data.fields = {};

            // Loop through settings and deliver payload for instrument
            $.each(module.data.settings, function (index, setting) {
                module.data.fields[setting['field']] = setting; //setting;
                module.render(setting);
            });

            // Check if mobile for resizing
            if (isMobileDevice) {
                module.resize();	// Call it once to set the initial size
                $(window).resize(module.resize); // Bind to window resizing in case the device is rotated
            }

            // Turn the form back on as the EM turns it off on page load
            $('#form').animate({ opacity: 1 }, 250);
        },

        // Cleanup function to remove imagemaps and bindings
        cleanup: function () {
            $('.imagemap').each(function () {
                const $img = $('img', this);
                try { $img.mapster('unbind'); } catch (e) { /* already unbound */ }
                $(this).remove();
            });
            // Remove document-level drag handlers added by setupDragging
            $(document).off('.imagemapDrag');
            if (module.data) { module.data.fields = {}; }
        },

        // Startup function for online designer helper
        onlineDesignerStart: function () {
            module.log("Online Designer ImageMap Start");
            // Checking if field annotation is present on this page.
            if ($('#div_field_annotation').length === 0) {
                return false;
            }

            $('body').on('dialogopen', function (event, ui) {
                const $popup = $(event.target);
                if ($popup.prop('id') !== 'action_tag_explain_popup') {
                    // That's not the popup we are looking for...
                    module.log($popup, "Not what we are looking for");
                    return false;
                }

                const tag_name = '@IMAGEMAP';

                // Link to this module's documentation page, which lists every image map
                const btn = $('<a></a>')
                    .addClass('imagemap-doc-link')
                    .attr('href', module.data.helpUrl)
                    .attr('target', '_BLANK')
                    .append(
                        $('<div></div>')
                            .addClass('btn btn-xs btn-primary')
                            .text('Full Documentation')
                    );

                // REDCap lists @IMAGEMAP from the "action-tags" entry in
                // config.json. Add the documentation link to that row.
                const $tag_row = $popup.find('td').filter(function () {
                    return $(this).text().trim() === tag_name;
                }).parent().first();

                const $descr_cell = $tag_row.children('td').last();

                if ($descr_cell.length && $descr_cell.find('.imagemap-doc-link').length === 0) {
                    $descr_cell.append('<br>').append(btn);
                }
            });
        },

        // Render the initial javascript imagemaps for the instrument
        render: function (setting) {
            // Get TR Element
            const tr = setting.tr = $('tr[sq_id=' + setting.field + ']');
            //module.log('tr');module.log($(tr));

            // Get Label
            const label = $('td.labelrc:last', tr);
            //module.log('label');module.log($(label));

            // // Get Data (not always present - depends on rendering options)
            // const data = $('td.data', tr);
            // //module.log('data');module.log($(data));
            //
            // // Get result tag
            // const result = $('input[name="' + setting.field + '"]', tr);
            // //module.log("Result Field");module.log(result);

            // Field Type of setting
            const type = setting.type;

            // Hide the checkbox input on surveys and data entry forms
            if (page === "DataEntry/index.php" || page === "surveys/index.php") {
                const hideInput = 'hideInput' in setting ? (setting.hideInput == true) : false;
                if (hideInput) {
                    // Hide radio and checkboxes
                    if (type === 'radio' || type === 'checkbox') {
                        $('.frmrdh', tr).hide();
                        $('.frmrd', tr).hide();
                        $('.choicevert', tr).hide();
                        $('.choicehoriz', tr).hide();
                    }

                    // Hide input
                    if (type === 'text') {
                        $('input[type=text][name="' + setting.field + '"]').hide();
                    }
                }
            }

            // Get the image map (with IDs based on the question so you can have multiple of the same image maps on a single page)
            const id = setting.field + '_' + setting.name;
            const imgTag = $('<img/>', {
                name: setting.name,
                field: setting.field,
                src: setting.src,
                width: setting.width,
                id: setting.field + '_' + setting.name,
                usemap: '#map_' + id,
                alt: setting.alt,
                border: 0
            });
            //module.log('imgTag');module.log($(imgTag));
            const mapTag = $('<map/>', {
                order: 1,
                name: 'map_' + id
            }).html(setting.areas);

            // Set the mouse-over title - in this case, the data-set attribute in the image map
            $('area:not([data-key=""])[title=""]', mapTag).each(
                function () {
                    $(this).attr('title', $(this).attr('data-key'));
                }
            );

            //module.log('mapTag');module.log($(mapTag));
            const imageMap = $('<div style="margin-right:auto;margin-left:auto;width:' + setting.width + 'px"/>')
                .addClass('imagemap')
                .append(imgTag)
                .append(mapTag);
            //module.log('imageMap');module.log($(imageMap));

            // Insert image map after label
            $(label).append(imageMap);

            // Determine if imagemap is selectable
            let selectable = true;
            // Need to handle case of survey responses in non-edit mode
            if (page == "DataEntry/index.php" && $('#form_response_header').length) {
                const regex = new RegExp('editresp\=1$');
                if (!regex.test(document.baseURI)) {
                    selectable = false;
                }
            }

            setting.selectable = selectable;

            // Determine if multiselect (default) or single-select
            const singleSelect = 'singleSelect' in setting ? (setting.singleSelect == true) : false;

            // Allow customizable fillColor
            const fillColor = 'fillColor' in setting ? setting.fillColor : 'ff0000';

            // Apply Mapster to image tag
            const img = $('#' + id, label).mapster({
                fillColor: fillColor,
                mapKey: 'data-key',
                fillOpacity: 0.4,
                isSelectable: selectable,
                singleSelect: singleSelect,
                render_highlight: {
                    fillColor: '333333',
                    fillOpacity: 0.2
                },
                onStateChange: function (data) {
                    // Update input when changed
                    const image = this;
                    module.log("State Change", data, image);
                    module.updateAreaList(image, data);
                },
                onClick: function (data) {
                    // Returning false cancels ImageMapster's default toggle
                    return module.handleMapClick(imgTag.get(0), setting, data);
                }
            });

            // Enable click-and-drag selection when requested (not on read-only views)
            if (setting.draggable && selectable) {
                module.setupDragging(img, setting);
            }

            // Enable color painting when requested (not on read-only views).
            // Saved colors are still restored by loadAreaList below.
            if (setting.paintable && selectable) {
                module.setupPainting(img, setting);
            }

            // On mobile devices where the viewport is fixed in redcap it may be necessary to resize width
            if (isMobileDevice) {
                $(img).attr('resize_check', 'true');
            }

            // Load saved values
            module.loadAreaList(setting);

            // Add event handlers to capture changes to the REDCap inputs and reflect them into the image map
            if (setting.type === 'checkbox') {
                // // If bound to a checkbox, handle checking the checkbox inputs directly to update the map
                // $('input[type=checkbox]', tr).parent().bind('click', function(event) {
                //     module.log("Parent Event");
                //     // Prevent this code from happening twice when the event is fired from a click
                //     // on the imageMap
                //     if (event.isTrusted) {
                //         // module.log(this, event);
                //         const tr = $(this).closest('tr');
                //         //module.log(tr);
                //         const div = $(this).closest('div');
                //         const field_name = $(tr).attr('sq_id');
                //         const img = $('img[field="'+field_name+'"]', tr).not(".mapster_el");
                //         //module.log(img);
                //         const checkbox = $('input[type=checkbox]', div);
                //         // module.log(checkbox);
                //         const code = checkbox.attr('code');
                //         //module.log(code);
                //         const checked = checkbox.is(":checked");
                //         //module.log(checked);
                //         $(img).mapster('set',checked,code);
                //     }
                // });

                // Handle change in checkboxes with later redcap versions
                $('input[type=checkbox]', tr).bind('click', function (event) {
                    // Not sure, but updated from event.isTrusted to event.originalEvent.isTrusted
                    if ((event.originalEvent && event.originalEvent.isTrusted) || event.isTrusted) {
                        // module.log("Clicked Box!", this);
                        const checkbox = $(this);
                        const code = checkbox.attr('code');
                        //module.log(code);
                        const checked = checkbox.is(":checked");
                        //module.log(checked);
                        $(img).mapster('set', checked, code);
                    }
                });
            } else if (setting.type === 'radio') {
                // If bound to radio, capture radio changes and update imageMap
                $('input[type=radio]', tr).bind('click', function () {
                    const tr = $(this).closest('tr');
                    //module.log(tr + ' clicked');
                    const field_name = $(tr).attr('sq_id');
                    //module.log(field_name);
                    module.loadAreaList(field_name);
                });

                // Bind to reset button
                $('a:contains("reset")', tr).bind('click', function () {
                    const tr = $(this).closest('tr');
                    //module.log(tr);
                    const field_name = $(tr).attr('sq_id');
                    //module.log(field_name);
                    const img = $('img[field="' + field_name + '"]', tr).not(".mapster_el");

                    // Get selected option/s and deselect them
                    const sel = $(img).mapster('get');
                    $(img).mapster('set', false, sel);
                    //module.log(sel);
                });
            } else if (setting.type === 'text') {
                // TODO:
            }

        },

        // Restore selected paint regions and their intensity values
        loadPaintAreaList: function (setting) {
            const fieldName = setting.field;
            const tr = setting.tr;

            const img = $('img[field="' + fieldName + '"]', tr)
                .not('.mapster_el');

            const paintValues = {};

            $('input[type=text][name="' + fieldName + '"]', tr)
                .each(function () {
                    const value = $(this).val();

                    if (!value) {
                        return;
                    }

                    value.split(',').forEach(function (item) {
                        const parts = item.split(':');

                        const key = parts[0];
                        const savedIntensity = parts[1];

                        const intensity = Number(savedIntensity);

                        if (!key || !module.isValidIntensity(intensity)) {
                            return;
                        }

                        paintValues[key] = intensity;

                        // Restore the saved color
                        $(img).mapster('set_options', {
                            areas: [{
                                key: key,
                                fillColor: module.getPaintColor(intensity),
                                fillOpacity: 0.4
                            }]
                        });

                        // Restore the selected region. Paintable maps are
                        // never saved from onStateChange, so this cannot
                        // overwrite the field while loading.
                        $(img).mapster(
                            'set',
                            true,
                            key
                        );
                    });
                });

            $(img).data(
                'paintValues',
                paintValues
            );
        },

        // True for a whole number from 1 to 10
        isValidIntensity: function (intensity) {
            return Number.isInteger(intensity) &&
                intensity >= 1 &&
                intensity <= 10;
        },

        // True if a scale value is chosen; otherwise show the inline prompt
        requireIntensity: function (image) {
            if (module.isValidIntensity($(image).data('paintIntensity'))) {
                return true;
            }

            const prompt = $(image).data('paintPrompt');

            if (prompt) {
                prompt.show();
            }

            return false;
        },

        // Update the image map to match the field
        loadAreaList: function (setting, noneAboveOption = false) {
            const field_name = setting.field;
            const tr = setting.tr;
            const img = $('img[field="' + field_name + '"]', tr).not(".mapster_el");

            // If checkboxes are used, then update imagemap from values
            if (setting.type === 'checkbox') {
                $('input[type=checkbox]:checked', tr).each(function () {
                    // (this) is redcap checkbox field.
                    const code = $(this).attr('code');
                    //module.log('Code: ' + code);
                    $(img).mapster('set', true, code);
                });
                // Deselect checkboxes when activating a @NONEOFTHEABOVE tagged option
                if (noneAboveOption) {
                    let deselectBoxes = [];
                    $('input[type=checkbox]:not(:checked)', tr).each(function () {
                        deselectBoxes.push($(this).attr('code'));
                    });
                    $(img).mapster('set', false, deselectBoxes);
                }
            } else if (setting.type === 'radio') {
                // For radio button questions, the main input is here - use it to set value
                // module.log("RADIO");
                $('input[name="' + field_name + '"]', tr).each(function () {
                    let val = $(this).val();

                    // This was causing an error for text storage in newer redcap versions -- so I'm wrapping it.
                    let mapVal = null;
                    try {
                        mapVal = $(img).mapster('get');
                    } catch (errror) {
                        module.log("caught get val exception for " + field_name);
                    }
                    if (mapVal !== val) { // avoid infinite loop
                        $(img).mapster('set', true, val);
                    }
                });
            } else if (
                setting.type === 'text' &&
                setting.paintable
            ) {
                // Paintable maps restore both regions and intensity
                module.loadPaintAreaList(setting);
            } else if (setting.type === 'text') {
                // If text - then process from list
                // module.log("TEXT");
                $('input[type=text][name="' + field_name + '"]', tr).each(function () {
                    $(img).mapster('set', true, $(this).val());
                });
            }
        },

        // Save selected paint regions and their intensity values
        // Called explicitly after each user action (click or drag stroke),
        // never from onStateChange.
        updatePaintAreaList: function (image, setting) {
            const paintValues = $(image).data('paintValues') || {};
            const selected = $(image).mapster('get');
            const tr = setting.tr;

            const keys = selected ? selected.split(',').sort() : [];
            const selectedKeys = new Set(keys);

            // Remove stored paint values for deselected regions
            Object.keys(paintValues).forEach(function (key) {
                if (!selectedKeys.has(key)) {
                    delete paintValues[key];
                }
            });

            // Build key:intensity values for selected regions. Every paint
            // path stores an intensity, so keys without one are skipped.
            const values = keys
                .filter(function (key) {
                    return module.isValidIntensity(paintValues[key]);
                })
                .map(function (key) {
                    return key + ':' + paintValues[key];
                });

            $(image).data('paintValues', paintValues);

            $('input[type=text][name="' + setting.field + '"]', tr)
                .val(values.join(','))
                .blur()
                .change();
        },

        // Takes the values from the image map and saves them to the redcap form
        updateAreaList: function (image, data) {

            // Only update on a 'select'
            if (data.state === 'select') {

                // Get field from image
                const field_name = $(image).attr('field');

                // Get setting for this field
                const setting = module.data.fields[field_name];

                // Get the container tr
                const tr = setting.tr; //$('tr[sq_id='+field_name+']');

                module.log(field_name, data);

                // Handle Radio
                if (setting.type === 'radio') {
                    // We only handle selections here as the browser automatically deselects other options
                    if (data.selected === true) {
                        // REDCap radios now support unique element IDs - yea!
                        const id = 'opt-' + field_name + '_' + data.key.toString();
                        // In order to call all of the existing events bound to the radio, we are using the native
                        // html event handler instead of javascript
                        const elem = document.getElementById(id);
                        elem.checked = true;
                        elem.dispatchEvent(new Event('click'));
                    }
                } else if (setting.type === "checkbox") {
                    // If checkbox exists - make sure they are in-sync
                    $('input[type=checkbox][code="' + data.key.toString() + '"]', tr).each(function () {
                        //module.log ('Found checkbox ' + data.key);
                        //module.log (cb);
                        const checked = $(this).is(":checked");
                        //module.log ('is checked: ' + checked);
                        const selected = data.selected;
                        //module.log ('is selected: ' + selected);
                        if (checked !== selected) {
                            $(this).click();
                            //$(this).blur();
                        }
                    });
                    
                } else if (setting.type === 'text' && setting.paintable) {
                    // Paintable maps save explicitly after each click or
                    // drag stroke (see handleMapClick and setupDragging).
                    // Saving here would also fire on load and would miss
                    // recolors of regions that are already selected.
                } else if (setting.type === 'text') {
                    // If input field is used to hold list, then update list
                    $('input[type=text][name="' + field_name + '"]', tr).each(function () {
                        // Update input with value from mapster image
                        const sel = $(image).mapster('get');
                        if (sel) {
                            const selSort = sel.split(',').sort().join(',');
                            $(this).val(selSort);
                        } else {
                            $(this).val('');
                        }
                        $(this).blur();
                        $(this).change();
                    });
                }
            }
        },

        // ImageMapster onClick handler. Return false to cancel the default toggle.
        handleMapClick: function (image, setting, data) {
            // The pointer was dragged; the drag already handled selection
            if ($(image).data('suppressClick')) {
                $(image).data('suppressClick', false);
                return false;
            }

            if (!setting.paintable) {
                return true;
            }

            if (!setting.selectable) {
                return false;
            }

            // A scale value must be chosen before painting or erasing
            if (!module.requireIntensity(image)) {
                return false;
            }

            const snapshot = module.beginPaintOp(image);
            const key = data.key;
            const intensity = $(image).data('paintIntensity');
            const paintValues = $(image).data('paintValues');
            const isSelected = $(image).mapster('get', key);

            if (isSelected && paintValues[key] === intensity) {
                // Clicking a region with its own value erases it
                $(image).mapster('set', false, key);
                delete paintValues[key];
            } else {
                // Paint or recolor the region; never toggle it off
                module.paintArea(image, key, intensity);
            }

            module.updatePaintAreaList(image, setting);
            module.commitPaintOp(image, snapshot);

            return false;
        },

        // Undo history for paintable maps.
        // Each entry is a copy of paintValues taken before one click or one
        // drag stroke. The history starts from the values loaded with the
        // page and lives only until the page is reloaded or submitted.
        // Choosing a scale value is not an undoable step.
        beginPaintOp: function (image) {
            return Object.assign({}, $(image).data('paintValues'));
        },

        // Record the snapshot if the operation changed anything
        commitPaintOp: function (image, snapshot) {
            const current = $(image).data('paintValues');
            const before = Object.keys(snapshot);
            const changed = before.length !== Object.keys(current).length ||
                before.some(function (key) {
                    return current[key] !== snapshot[key];
                });

            if (!changed) {
                return;
            }

            const history = $(image).data('paintUndo');

            history.push(snapshot);

            // Keep memory bounded on very long sessions
            if (history.length > 100) {
                history.shift();
            }

            module.updateUndoButton(image);
        },

        // Restore the state from before the most recent operation
        undoPaint: function (image, setting) {
            const history = $(image).data('paintUndo');
            const snapshot = history.pop();

            if (!snapshot) {
                return;
            }

            const current = $(image).data('paintValues');

            // Regions added since the snapshot
            const remove = Object.keys(current).filter(function (key) {
                return !(key in snapshot);
            });

            // Regions that were removed or recolored since the snapshot
            const restore = {};

            Object.keys(snapshot).forEach(function (key) {
                if (current[key] !== snapshot[key]) {
                    restore[key] = snapshot[key];
                }
            });

            // One batched update instead of one redraw per region
            module.paintAreas(image, restore, remove);

            module.updatePaintAreaList(image, setting);
            module.updateUndoButton(image);
        },

        updateUndoButton: function (image) {
            const button = $(image).data('paintUndoButton');

            if (button) {
                button.prop('disabled', $(image).data('paintUndo').length === 0);
            }
        },

        // Select one region and give it the color for an intensity value
        paintArea: function (image, key, intensity) {
            const values = {};

            values[key] = intensity;
            module.paintAreas(image, values);
        },

        // Paint several regions ({key: intensity}) and deselect the regions in
        // `remove`, with as few ImageMapster redraws as possible.
        //
        // In ImageMapster, each mapster('set', false, key) call rebuilds the
        // canvas and redraws every selected region. One call with a
        // comma-separated key list deselects them all and redraws once.
        // Selecting a region that isn't selected only draws that region.
        paintAreas: function (image, values, remove) {
            const paintValues = $(image).data('paintValues');
            const keys = Object.keys(values);
            const deselect = (remove || []).slice();

            keys.forEach(function (key) {
                paintValues[key] = values[key];

                // Re-select an already selected region so the new color is drawn
                if ($(image).mapster('get', key)) {
                    deselect.push(key);
                }
            });

            (remove || []).forEach(function (key) {
                delete paintValues[key];
            });

            if (keys.length) {
                $(image).mapster('set_options', {
                    areas: keys.map(function (key) {
                        return {
                            key: key,
                            fillColor: module.getPaintColor(values[key]),
                            fillOpacity: 0.4
                        };
                    })
                });
            }

            if (deselect.length) {
                $(image).mapster('set', false, deselect.join(','));
            }

            if (keys.length) {
                $(image).mapster('set', true, keys.join(','));
            }
        },

        // Build a fast lookup from a pointer position to a map region key.
        // Rect coords are parsed once, in natural image pixels, and the pointer
        // is scaled to match. This avoids re-reading every <area> on each
        // pointermove and does not depend on Mapster rescaling the coords.
        // Only shape="rect" areas are hit-tested.
        buildHitTester: function (image) {
            const mapName = $(image).attr('usemap').replace('#', '');
            const rects = [];
            const keys = new Set();

            $('map[name="' + mapName + '"] area').each(function () {
                const key = $(this).attr('data-key');

                if (!key) {
                    return;
                }

                keys.add(key);

                const shape = ($(this).attr('shape') || 'rect').toLowerCase();

                if (shape !== 'rect') {
                    return;
                }

                const c = ($(this).attr('coords') || '').split(',').map(Number);

                if (c.length === 4 && c.every(Number.isFinite)) {
                    rects.push({ key: key, x1: c[0], y1: c[1], x2: c[2], y2: c[3] });
                }
            });

            return {
                has: function (key) {
                    return keys.has(key);
                },
                keyAt: function (event) {
                    const rect = image.getBoundingClientRect();

                    if (!rect.width) {
                        return null;
                    }

                    const scale = image.naturalWidth
                        ? image.naturalWidth / rect.width
                        : 1;
                    const x = (event.clientX - rect.left) * scale;
                    const y = (event.clientY - rect.top) * scale;

                    for (let i = 0; i < rects.length; i++) {
                        const r = rects[i];

                        if (x >= r.x1 && x < r.x2 && y >= r.y1 && y < r.y2) {
                            return r.key;
                        }
                    }

                    return null;
                }
            };
        },

        // Allow selecting map regions by clicking and dragging
        setupDragging: function (img, setting) {
            const image = $(img).get(0);
            const hitTester = module.buildHitTester(image);

            let armed = false;      // pointer is down on the map
            let active = false;     // pointer has left the starting region
            let startKey = null;
            let lastKey = null;
            let painted = false;
            let strokeSnapshot = null;  // paint state before this stroke, for undo

            // Paint the 2x2 brush whose top-left cell is anchorKey
            function paintBrush(anchorKey) {
                const intensity = $(image).data('paintIntensity');

                const values = {};

                module.getPaintKeys(anchorKey, hitTester).forEach(function (paintKey) {
                    values[paintKey] = intensity;
                });

                module.paintAreas(image, values);

                painted = true;
            }

            // Select (or paint) one region through ImageMapster
            function selectArea(key) {
                if (!key || key === lastKey) {
                    return;
                }

                lastKey = key;

                if (setting.paintable) {
                    paintBrush(key);
                    return;
                }

                $(image).mapster('set', true, key);
            }

            function endStroke() {
                armed = false;
                active = false;
                startKey = null;
                lastKey = null;

                // Save the whole paint stroke once; it is one undo step
                if (painted) {
                    painted = false;
                    module.updatePaintAreaList(image, setting);
                    module.commitPaintOp(image, strokeSnapshot);
                }

                strokeSnapshot = null;
            }

            // Listen on the container because Mapster sits over the image
            const dragTarget = $(image).closest('.imagemap');

            // Without this, touch browsers turn a drag into a scroll and
            // send pointercancel. The page cannot be scrolled by swiping on
            // the map itself.
            dragTarget.css('touch-action', 'none');

            // Arm the drag but leave plain clicks to ImageMapster
            dragTarget.on(
                'pointerdown.imagemapDrag',
                function (event) {
                    $(image).data('suppressClick', false);

                    startKey = hitTester.keyAt(event.originalEvent);
                    armed = startKey !== null;
                    active = false;
                    lastKey = null;

                    // A paint drag needs a chosen scale value. The click that
                    // follows is handled (and refused) by handleMapClick.
                    if (armed && setting.paintable && !module.requireIntensity(image)) {
                        armed = false;
                    }

                    strokeSnapshot = armed && setting.paintable
                        ? module.beginPaintOp(image)
                        : null;
                }
            );

            // Start selecting only once the pointer reaches a different
            // region, so a slightly shaky click is still just a click
            dragTarget.on(
                'pointermove.imagemapDrag',
                function (event) {
                    if (!armed) {
                        return;
                    }

                    // The button was released somewhere we did not see
                    if (event.originalEvent.buttons === 0) {
                        endStroke();
                        return;
                    }

                    const key = hitTester.keyAt(event.originalEvent);

                    if (!active) {
                        if (!key || key === startKey) {
                            return;
                        }

                        active = true;

                        // This gesture is a drag; ignore the click that follows
                        $(image).data('suppressClick', true);

                        // Moving into a neighboring cell paints one 2x2 brush
                        // covering both cells, so the smallest drag is 2x2
                        const anchor = setting.paintable
                            ? module.getBrushAnchor(startKey, key)
                            : null;

                        if (anchor) {
                            paintBrush(anchor);
                            lastKey = key;
                            return;
                        }

                        selectArea(startKey);
                    }

                    selectArea(key);
                }
            );

            // Stop drag selection. These handlers are removed in cleanup().
            $(document).on(
                'pointerup.imagemapDrag pointercancel.imagemapDrag',
                function () {
                    if (armed) {
                        endStroke();
                    }
                }
            );
        },

        // Return the color used for each pain intensity
        getPaintColor: function (intensity) {
            const colors = {
                1: 'ffe066',
                2: 'ffd43b',
                3: 'fcc419',
                4: 'fab005',
                5: 'f59f00',
                6: 'f76707',
                7: 'e8590c',
                8: 'e03131',
                9: 'c92a2a',
                10: 'a51111'
            };

            return colors[intensity];
        },

        // For two adjacent grid cells (including diagonal neighbors), return
        // the top-left cell of the 2x2 block that covers both; otherwise null
        getBrushAnchor: function (keyA, keyB) {
            const a = /^c(\d+)r(\d+)$/.exec(keyA || '');
            const b = /^c(\d+)r(\d+)$/.exec(keyB || '');

            if (!a || !b) {
                return null;
            }

            const ca = Number(a[1]), ra = Number(a[2]);
            const cb = Number(b[1]), rb = Number(b[2]);

            if (Math.abs(ca - cb) > 1 || Math.abs(ra - rb) > 1) {
                return null;
            }

            return 'c' + Math.min(ca, cb) + 'r' + Math.min(ra, rb);
        },

        // Return the cells of a 2x2 paint brush that exist on this map
        getPaintKeys: function (key, hitTester) {
            const match = key.match(/^c(\d+)r(\d+)$/);

            if (!match) {
                return [key];
            }

            const column = Number(match[1]);
            const row = Number(match[2]);

            const keys = [
                `c${column}r${row}`,
                `c${column + 1}r${row}`,
                `c${column}r${row + 1}`,
                `c${column + 1}r${row + 1}`
            ];

            return keys.filter(function (key) {
                return hitTester.has(key);
            });
        },

        // Allow map regions to be painted with pain intensity values
        setupPainting: function (img, setting) {
            const image = $(img).get(0);

            // Store paint state on this image. No value is chosen at load.
            $(image).data('paintIntensity', null);
            $(image).data('paintValues', {});
            $(image).data('paintUndo', []);

            // Add the 1-10 color scale above the map
            const controls = $('<div/>')
                .css({
                    'margin-bottom': '10px',
                    'text-align': 'center'
                });

            // Outline the button for the active value
            function markActive(button) {
                controls.children('button.imagemap-scale')
                    .attr('aria-pressed', 'false')
                    .css('outline', 'none');

                $(button)
                    .attr('aria-pressed', 'true')
                    .css({
                        'outline': '3px solid #000',
                        'outline-offset': '1px'
                    });
            }

            // Shown when the user tries to paint before choosing a value
            const prompt = $('<div/>', {
                role: 'alert',
                text: 'Choose a value on the scale before painting.'
            })
                .css({
                    'color': '#c00',
                    'font-weight': 'bold',
                    'text-align': 'center',
                    'margin-bottom': '10px'
                })
                .hide();

            $(image).data('paintPrompt', prompt);

            for (let intensity = 1; intensity <= 10; intensity++) {
                $('<button/>', {
                    type: 'button',
                    text: intensity,
                    'class': 'imagemap-scale',
                    'aria-pressed': 'false'
                })
                    .css({
                        'margin-right': '4px',
                        'background-color': '#' + module.getPaintColor(intensity)
                    })
                    .on('click', function () {
                        $(image).data('paintIntensity', intensity);
                        markActive(this);
                        prompt.hide();
                    })
                    .appendTo(controls);
            }

            // Undo the most recent click or drag stroke, repeatedly
            const undoButton = $('<button/>', {
                type: 'button',
                text: 'Undo'
            })
                .css('margin-left', '12px')
                .prop('disabled', true)
                .on('click', function () {
                    module.undoPaint(image, setting);
                })
                .appendTo(controls);

            $(image).data('paintUndoButton', undoButton);

            const paintTarget = $(image).closest('.imagemap');

            paintTarget.prepend(controls, prompt);

            // Single clicks are handled by handleMapClick via Mapster's onClick
        },

        // Resize window to fit mobile or orientation changes
        resize: function () {
            // find all resize-check images and set width based on viewport width
            const window_width = $(window).width();	// Get viewport width
            $('img[resize_check="true"]').each(function () {
                const image_width = this.getAttribute('width'); // Get original image width
                const max_width = Math.min(image_width, window_width); // Determine max
                $(this).mapster('resize', max_width, null);
            });
        },

        // Add module.log() commands as needed to help debug issues and turn on project-level js logging
        log: function () {
            if (!module.data.enableConsoleLogs) return;

            // Make console logging more resilient to Redmond
            try {
                console.log.apply(this, arguments);
            } catch (err) {
                // Error trying to apply logs to console (problem with IE11)
                try {
                    console.log(arguments);
                } catch (err2) {
                    // Can't even do that!  Argh - no logging
                    // var d = $('<div></div>').html(JSON.stringify(err)).appendTo($('body'));
                }
            }
        }

    });

    $(document).ready(function () {
        // trigger automated deselection of map regions when a @NONEOFTHEABOVE option is chosen
        // see RC core function in Resources/js/DataEntrySurveyCommon.js
        var _nota = window.noneOfTheAboveAlert;
        window.noneOfTheAboveAlert = function (field, choicesCsv, regchoicesCsv, langOkay, langCancel) {
            _nota.apply(this, arguments);

            $(`#noneOfTheAboveDialog`)
                .on(
                    "dialogfocus",
                    () => {
                        // NOTE: noneOfTheAboveAlert creates independent dialogs for each @NONEOFTHEABOVE tagged field
                        // loadAreaList will run for _every_ @NONEOFTHEABOVE tagged field.
                        // attempt to select only current dialog box
                        const clearOthersButton = $(`#noneOfTheAboveDialog.ui-dialog-content`)
                            .siblings('div.ui-dialog-buttonpane')
                            .find(`button:contains('${window.lang.data_entry_417}')`)
                        clearOthersButton
                            .on("click", () => {
                                let fieldData = module.data.fields[field]
                                module.loadAreaList(fieldData, noneAboveOption = true);
                            });
                    });
            // NOTE: a user clicking "cancel" will break this adjustment due to the use of dialog('destroy')
        }
    });

}
