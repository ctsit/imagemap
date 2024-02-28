// This file extends the default JSMO object with methods for this EM
;{
    // Define the jsmo in IIFE so we can reference object in our new function methods
    const module = ExternalModules.ImageMap.ExternalModule;

    // Extend the official JSMO with new methods
    Object.assign(module, {

        // Startup function for data entry pages with imagemaps
        start: function() {
            // Render each imagemap and create a pointer to it by field_name
            if (! module.data) module.data = {};
            module.data.fields = {};

            // Loop through settings and deliver payload for instrument
            $.each(module.data.settings, function(index, setting) {
                module.data.fields[setting['field']] = setting; //setting;
                module.render(setting);
            });

            // Check if mobile for resizing
            if (isMobileDevice) {
                module.resize();	// Call it once to set the initial size
                $(window).resize(module.resize); // Bind to window resizing in case the device is rotated
            }

            // Turn the form back on as the EM turns it off on page load
            $('#form').animate({opacity: 1}, 250);
        },

        // Startup function for online designer helper
        onlineDesignerStart: function() {
            module.log("Online Designer ImageMap Start");
            // Checking if field annotation is present on this page.
            if ($('#div_field_annotation').length === 0) {
                return false;
            }

            $('body').on('dialogopen', function(event, ui) {
                const $popup = $(event.target);
                if ($popup.prop('id') !== 'action_tag_explain_popup') {
                    // That's not the popup we are looking for...
                    module.log($popup, "Not what we are looking for");
                    return false;
                }

                // Aux function that checks if text matches the "@HIDECHOICE" string.
                const isDefaultLabelColumn = function() {
                    return $(this).text() === '@HIDECHOICE';
                }

                // Getting @HIDECHOICE row from action tags help table.
                const $default_action_tag = $popup.find('td').filter(isDefaultLabelColumn).parent();
                if ($default_action_tag.length !== 1) {
                    return false;
                }

                const tag_name = '@IMAGEMAP';

                // Create the help text
                let descr = $('<div></div>')
                    .addClass('imagemap-container')
                    .html('Converts a radio, checkbox, or text field into a clickable image. For example, to display a male body '
                        + 'with clickable body parts, you may use <nobr>@IMAGEMAP=PAINMAP_MALE</nobr>.  For a full list of available '
                        + 'image maps and details about options, please reference the:<br>');
                const btn = $('<a></a>')
                    .attr('href', module.data.helpUrl)
                    .attr('target', '_BLANK')
                    .append(
                        $('<div></div>')
                            .addClass('btn btn-xs btn-primary')
                            .text('Full Documentation')
                    )
                    .appendTo(descr);

                // Creating a new action tag row.
                const $new_action_tag = $default_action_tag.clone();
                const $cols = $new_action_tag.children('td');
                const $button = $cols.find('button');

                // Column 1: updating button behavior.
                $button.attr('onclick', $button.attr('onclick').replace('@HIDECHOICE', tag_name));

                // Columns 2: updating action tag label.
                $cols.filter(isDefaultLabelColumn).text(tag_name);

                // Column 3: updating action tag description.
                $cols.last().html(descr);

                // Placing new action tag.
                $new_action_tag.insertAfter($default_action_tag);
            });
        },

        // Render the initial javascript imagemaps for the instrument
        render: function(setting) {
            // Get TR Element
            const tr = setting.tr = $('tr[sq_id='+setting.field+']');
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
                        $('.frmrdh',tr).hide();
                        $('.frmrd',tr).hide();
                        $('.choicevert',tr).hide();
                        $('.choicehoriz',tr).hide();
                    }

                    // Hide input
                    if (type === 'text') {
                        $('input[type=text][name="'+setting.field+'"]').hide();
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
            $('area:not([data-key=""])[title=""]',mapTag).each(
                function() {
                    $(this).attr('title', $(this).attr('data-key'));
                }
            );

            //module.log('mapTag');module.log($(mapTag));
            const imageMap = $('<div style="margin-right:auto;margin-left:auto;width:'+setting.width+'px"/>')
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

            // Determine if multiselect (default) or single-select
            const singleSelect = 'singleSelect' in setting ? (setting.singleSelect == true) : false;

            // Allow customizable fillColor
            const fillColor = 'fillColor' in setting ? setting.fillColor : 'ff0000';

            // Apply Mapster to image tag
            const img = $('#'+id, label).mapster({
                fillColor: fillColor,
                mapKey:'data-key',
                fillOpacity: 0.4,
                isSelectable: selectable,
                singleSelect: singleSelect,
                render_highlight: {
                    fillColor: '333333',
                    fillOpacity: 0.2
                },
                onStateChange: function (data) {
                    // Update input when changed
                    const image=this;
                    module.log("State Change", data, image);
                    module.updateAreaList(image, data);
                }
            });

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
                $('input[type=checkbox]', tr).bind('click', function(event) {
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
                $('input[type=radio]', tr).bind('click', function() {
                    const tr = $(this).closest('tr');
                    //module.log(tr + ' clicked');
                    const field_name = $(tr).attr('sq_id');
                    //module.log(field_name);
                    module.loadAreaList(field_name);
                });

                // Bind to reset button
                $('a:contains("reset")', tr).bind('click',function() {
                    const tr = $(this).closest('tr');
                    //module.log(tr);
                    const field_name = $(tr).attr('sq_id');
                    //module.log(field_name);
                    const img = $('img[field="'+field_name+'"]', tr).not(".mapster_el");

                    // Get selected option/s and deselect them
                    const sel = $(img).mapster('get');
                    $(img).mapster('set',false,sel);
                    //module.log(sel);
                });
            } else if (setting.type === 'text') {
                // TODO:
            }

        },

        // Update the image map to match the field
        loadAreaList: function(setting, noneAboveOption = false) {
            const field_name = setting.field;
            const tr = setting.tr;
            const img = $('img[field="'+field_name+'"]', tr).not(".mapster_el");

            // If checkboxes are used, then update imagemap from values
            if (setting.type === 'checkbox') {
                $('input[type=checkbox]:checked', tr).each(function() {
                    // (this) is redcap checkbox field.
                    const code = $(this).attr('code');
                    //module.log('Code: ' + code);
                    $(img).mapster('set',true,code);
                });
                // Deselect checkboxes when activating a @NONEOFTHEABOVE tagged option
                if (noneAboveOption) {
                    let deselectBoxes = [];
                    $('input[type=checkbox]:not(:checked)', tr).each(function() {
                        deselectBoxes.push($(this).attr('code'));
                    });
                    $(img).mapster('set',false,deselectBoxes);
                }
            } else if (setting.type === 'radio') {
                // For radio button questions, the main input is here - use it to set value
                // module.log("RADIO");
                $('input[name="'+field_name+'"]', tr).each(function() {
                    let val = $(this).val();

                    // This was causing an error for text storage in newer redcap versions -- so I'm wrapping it.
                    let mapVal = null;
                    try {
                        mapVal = $(img).mapster('get');
                    } catch (errror) {
                        module.log("caught get val exception for " + field_name);
                    }
                    if ( mapVal !== val ) { // avoid infinite loop
                        $(img).mapster('set',true,val);
                    }
                });
            } else if (setting.type === 'text') {
                // If text - then process from list
                // module.log("TEXT");
                $('input[type=text][name="'+field_name+'"]', tr).each(function() {
                    $(img).mapster('set',true,$(this).val());
                });
            }
        },

        // Takes the values from the image map and saves them to the redcap form
        updateAreaList: function(image, data) {

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

        // Resize window to fit mobile or orientation changes
        resize: function() {
            // find all resize-check images and set width based on viewport width
            const window_width = $( window ).width();	// Get viewport width
            $('img[resize_check="true"]').each( function() {
                const image_width = this.getAttribute('width'); // Get original image width
                const max_width = Math.min(image_width,window_width); // Determine max
                $(this).mapster('resize',max_width,null);
            });
        },

        // Add module.log() commands as needed to help debug issues and turn on project-level js logging
        log: function() {
            if (! module.data.enableConsoleLogs) return;

            // Make console logging more resilient to Redmond
            try {
                console.log.apply(this,arguments);
            } catch(err) {
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

    $( document ).ready(function() {
        // trigger automated deselection of map regions when a @NONEOFTHEABOVE option is chosen
        // see RC core function in Resources/js/DataEntrySurveyCommon.js
        var _nota = window.noneOfTheAboveAlert;
        window.noneOfTheAboveAlert = function(field, choicesCsv, regchoicesCsv, langOkay, langCancel) {
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
