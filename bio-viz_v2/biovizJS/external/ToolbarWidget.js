/**
 * Toolbar to manage representation of structures
 * @namespace bionext.bioviztoolbar
 */
(function($) {
    $.widget('bionext.bioviztoolbar', {
        /**
         * @name bionext.bioviztoolbar#bioviz
         * @description Bioviz API access
         */
        /**
         * @name bionext.bioviztoolbar#pdbCustomUrl
         * @description Set a custom URL for pdb access
         */
        /**
         * @name bionext.bioviztoolbar#pdbxCustomUrl
         * @description Set a custom URL for pdbx/mmcif access
         */
        /**
         * @name bionext.bioviztoolbar#debug
         * @description Show debug features
         */
        options: {
            bioviz: null,
            pdbCustomUrl: null,
            pdbxCustomUrl: null,
            debug: false,
            assetsUrl: null
        },
        pdbUrl: '//pdb.bionext.com/pdb/${id}',
        pdbxUrl: '//pdb.bionext.com/pdbx/${id}',
        // Update url of bioviz when user click on RCSB and PDBX checkbox on toolbarWidget
        isPdbx: false,

        /**
         * @name bionext.bioviztoolbar#_create
         * @function
         * @private
         * @description Create this widget
         */
        _create: function() {
            this.bioviz = this.options.bioviz;
            this.imgsURL = this.options.assetsUrl != null ? this.options.assetsUrl : '/dist/external/img/';
            this.pdbCustomUrl = this.options.pdbCustomUrl;
            this.pdbxCustomUrl = this.options.pdbxCustomUrl;
            this.debug = this.options.debug;

            this.element.addClass('bionext.bioviztoolbar');

            if (this.bioviz == null ||
                this.debug == null) {
                throw new Error('Some toolbar parameters are null');
            }

            if (this.pdbCustomUrl == null ||
                this.pdbxCustomUrl == null) {
                console.warn('You have not specified any custom URL, use the RCSB default database');
            }

            this.url = this.pdbUrl;

            this.init();
            this._updateUrlTemplate();
        },
        /**
         * @name bionext.bioviztoolbar#_destroy
         * @function
         * @private
         * @description Destroy this widget
         */
        _destroy: function() {
            this.element.removeClass('bionext.bioviztoolbar');
        },
        _getSelectionChain: function(structureID, moleculeID, residueID) {
            var chain = structureID + ':' + moleculeID;
            if (residueID != null) {
                chain += ':' + residueID;
            }
            return chain;
        },
        /**
         * @name bionext.bioviztoolbar#_updateUrlTemplate
         * @function
         * @private
         * @description Update the URL used for asking database and load a structure
         */
        _updateUrlTemplate: function() {
            if ($('#RCSB').is(':checked')) {
                if ($('#PDBX').is(':checked')) {
                    this.url = this.pdbxUrl;
                    this.isPdbx = true;
                } else {
                    this.url = this.pdbUrl;
                    this.isPdbx = false;
                }
            } else {
                if ($('#PDBX').is(':checked')) {
                    this.url = this.pdbxCustomUrl;
                    this.isPdbx = true;
                } else {
                    this.url = this.pdbCustomUrl;
                    this.isPdbx = false;
                }
            }

            this.bioviz.bioviz('setOption', 'urlTemplate', this.url);
            this.bioviz.bioviz('setOption', 'loadPDBX', this.isPdbx);
        },
        /**
         * @name bionext.bioviztoolbar#updateSelection
         * @function
         * @description Update selected representation depending on the current selected structure
         */
        updateSelection: function() {
            var structureID = $('#listStructures').val();
            if (structureID == null) { return; }
            var moleculeID = $('#listMolecules').val();
            var residueID = $('#listResidues').val();
            if (residueID === 'All') {
                residueID = undefined;
            }
            var selectionChain = this._getSelectionChain(structureID, moleculeID, residueID);
            var selection = this.bioviz.bioviz('getObjects3DFromSelection', selectionChain);

            var repr = this.bioviz.bioviz('getAvailableRepresentations');
            for (var i = 0; i < repr.length; i++) {
                $('#toolbar' + repr[i].commandName)[0].checked = this.bioviz.bioviz('isRepresentationActive',
                                                                    selection,
                                                                    repr[i].name);
            }

            $('#toolbarShowHide')[0].checked = this.bioviz.bioviz('isShown', selection);
            $('#toolbarLabels')[0].checked = this.bioviz.bioviz('hasLabels', selection);
            $('#toolbarShowHide').button('refresh');
            $('#toolbarLabels').button('refresh');

            var structSelection = this.bioviz.bioviz('getObjects3DFromSelection', selectionChain, 1);
            this.bioviz.bioviz('anchorOnSelection', structSelection);
            for (var i = 0; i < repr.length; i++) {
                $('#toolbar' + repr[i].commandName).button('refresh');
            }
        },
        /**
         * @name bionext.bioviztoolbar#updateToolbarSelection
         * @function
         * @private
         * @description Update list of structures and selection
         * @param  {String} selectedStructureName The structure to update, if no structure is set, select the first available
         */
        updateToolbarSelection: function(selectedStructureName) {
            if (selectedStructureName == null) {
                selectedStructureName = $('#listStructures').val();
            }

            $('#listStructures').html('');
            $('#listMolecules').html('');
            $('#listResidues').html('');

            if (!this.bioviz.bioviz('hasObject3D')) {
                $('#listStructures').html('<option selected disabled>Structure</option>');
                $('#listMolecules').html('<option selected disabled>Molecule</option>');
                $('#listResidues').html('<option selected disabled>Residue</option>');
            }

            var structuresByID = this.bioviz.bioviz('getStructuresByPDBID');
            var nbStructures = structuresByID.length;
            for (var i = 0; i < nbStructures; i++) {
                var structureName = structuresByID[i];
                // If we got a selected structure (new structure loaded) or no structure selection (then we pick the first one)
                if (selectedStructureName === structureName) {
                    // Then we fill the molecule list associated to this structure
                    $('#listStructures').html(
                        $('#listStructures').html() + '<option selected> ' + structureName + ' </option>'
                   );
                } else {
                    $('#listStructures').html(
                        $('#listStructures').html() + '<option> ' + structureName + ' </option>'
                   );
                }
            }
            if (nbStructures > 0) {
                this.updateMoleculeList();
                this.updateResidueList();
                this.updateSelection();
            } else {
                $('#listStructures').html(
                    '<option selected disabled>Structure</option></select>'
                );
                $('#listMolecules').html(
                    '<option selected disabled>Molecule</option></select>'
                );
                $('#listResidues').html(
                    '<option selected disabled>Residue</option></select>'
                );
            }
        },
        /**
         * @name bionext.bioviztoolbar#updateMoleculeList
         * @function
         * @private
         * @description Update list of structures
         */
        updateMoleculeList: function() {
            if ($('#listStructures').val() !== null) {
                $('#listMolecules').html('');
                var text = '';
                var tab = this.bioviz.bioviz('getMoleculesFromStructure', $('#listStructures').val());

                for (var k in tab) {
                    var key = tab[k];
                    var moleculeName = key.toString();
                    text += '<option value="' + moleculeName + '">' + moleculeName + '</option>';
                }
                $('#listMolecules').html(text);
            }
        },
        /**
         * @name bionext.bioviztoolbar#updateResidueList
         * @function
         * @private
         * @description Update list of residues
         */
        updateResidueList: function() {
            if ($('#listStructures').val() !== null && $('#listMolecules').val() !== null) {
                $('#listResidues').html('');
                var text = '<option selected>All</option>';
                var tab = this.bioviz.bioviz('getResiduesFromMolecule', $('#listStructures').val(), $('#listMolecules').val());
                for (var k in tab) {
                    var key = tab[k];
                    var residueName = key.toString();
                    text += '<option value=' + residueName + '> ' + residueName + ' </option>';
                }
                $('#listResidues').html(text);
            }
        },
        changeMouseSelection: function(string) {
            if (string != null) {
                $('#mouseSelection').text(string);
            } else {
                $('#mouseSelection').text('');
            }
        },
        updateDisabledButtons: function() {
            var residueName = $('#listResidues').val();
            if (residueName === 'All') {
                residueName = undefined;
            }
            var selectionChain = this._getSelectionChain($('#listStructures').val(), $('#listMolecules').val(), residueName);
            var selection = this.bioviz.bioviz('getObjects3DFromSelection', selectionChain);

            var repr = this.bioviz.bioviz('getAvailableRepresentations');
            for (var i = 0; i < repr.length; i++) {
                $('#toolbar' + repr[i].commandName).button('option', 'disabled', true);
            }

            repr = this.bioviz.bioviz('getAvailableRepresentations', selection);

            for (var i = 0; i < repr.length; i++) {
                $('#toolbar' + repr[i].commandName).button('option', 'disabled', false);
            }
        },
        /**
         * @name bionext.bioviztoolbar#_getButton
         * @function
         * @private
         * @description Get the structure of an activable button
         * @param  {String} id    Id of the button
         * @param  {String} title Title of the button
         * @param  {String} image Path of the image to show on the button
         * @return {String}       Html description of the button
         */
        _getButton: function(id, title, image, hasMenu) {
            var res = '';
            res += '<input type="checkbox" id="toolbar' + id + '" title="' + title + '">';
            if (hasMenu) {
                res += '<label class="hasMenu" for="toolbar' + id + '" title="' + title + '">';
            } else {
                res += '<label for="toolbar' + id + '" title="' + title + '">';
            }
            res += '<img class="imageLabels" src="' + image + '" alt="" title="' + title + '" \/>';
            res += '<\/label>';
            return res;
        },
        /**
         * @name bionext.bioviztoolbar#init
         * @function
         * @description Initialize UI
         */
        init: function() {
            var that = this;

            var str = '';
            str += '<select id="listStructures"><option selected disabled>Structure</option></select>';
            str += '<select id="listMolecules"><option selected disabled>Molecule</option></select>';
            str += '<select id="listResidues"><option selected disabled>Residue</option></select>';
            str += this._getButton('Center', 'Center', this.imgsURL + 'target16_2.png');
            str += this._getButton('Delete', 'Remove Structure', this.imgsURL + 'delete16.png');
            str += this._getButton('ShowHide', 'Show\/Hide', this.imgsURL + 'target16_2.png');
            str += '<br>';

            var repr = that.bioviz.bioviz('getAvailableRepresentations');

            for (var i = 0; i < repr.length; i++) {
                str += this._getButton(repr[i].commandName, repr[i].name, this.imgsURL + repr[i].commandName + '.png', true);
            }

            str += this._getButton('Labels', 'Labels', this.imgsURL + 'labels.png');
            str += '<br>';
            str += this._getButton('ResetScene', 'Reset scene', this.imgsURL + 'target16_2.png');
            str += this._getButton('ResetRepr', 'Reset Representations', this.imgsURL + 'target16_2.png');
            str += this._getButton('ResetHighlight', 'Reset Highlight', this.imgsURL + 'target16_2.png');
            str += '<input id="strToLoad" placeholder="PDB ID">';
            str += '<input type="checkbox" id="RCSB">';
            str += '<label for="RCSB" title="Load on RCSB"> RCSB </label>';
            str += '<input type="checkbox" id="PDBX" checked="checked">';
            str += '<label for="PDBX" title="Load the PDBX format" > PDBX </label>';
            str += '<button id="loadButton" title="Load a structure">';
            str += '<label for="loadButton"> Load </label>';
            str += '</button>';
            str += '<span id="mouseSelection"></span>';
            /*
             * DEBUG FOR CAPTURE
             */
            if (this.debug) {
                str += '<button id="CAPTURE" title="CAPTURE">';
                str += '<label for="CAPTURE"> CAPTURE';
                str += '</label>';
                str += '</button>';
            }
            /*
             * END DEBUG FOR CAPTURE
             */
        // /*script :*/    str += "<input type=\"text\" id=\"script\" value=\"say (duration=10) &quot;yop&quot;\"></input>"
            var toolbar = $('<div id="biovizJSToolbar" class="ui-widget-header ui-corner-all">' + str + '</div>');

            this.element.empty();
            toolbar.appendTo(this.element);

            $('#loadButton').button();


            for (var i = 0; i < repr.length; i++) {
                $('#toolbar' + repr[i].commandName).button();
                $('#toolbar' + repr[i].commandName).focus(function() {});
            }

            $('#toolbarLabels').button();
            $('#toolbarLabels').focus(function() {});

            $('#toolbarShowHide').button();
            $('#toolbarShowHide').focus(function() {});

            $('#toolbarDelete').button();
            $('#toolbarDelete').focus(function() {});

            $('#toolbarCenter').button();
            $('#toolbarCenter').focus(function() {});

            $('#toolbarResetScene').button();
            $('#toolbarResetScene').focus(function() {});

            $('#toolbarResetRepr').button();
            $('#toolbarResetRepr').focus(function() {});

            $('#toolbarResetHighlight').button();
            $('#toolbarResetHighlight').focus(function() {});


            // TODO : Better fix of overriden color and weight by css framework
            $('#listStructures').css('color', 'black').css('font-weight', 'normal');
            $('#listMolecules').css('color', 'black').css('font-weight', 'normal');
            $('#listResidues').css('color', 'black').css('font-weight', 'normal');
            $('#strToLoad').css('color', 'black').css('font-weight', 'normal');

            // Action with the context menu - change color representation
            $('#biovizJSToolbar').contextmenu({
                delegate: '.hasMenu',
                menu: [
                    {title: 'Color option', cmd: 'color', children: [
                        {title: 'By&nbspMol', cmd: 'color', data: {name: $.bionext.ColorMappingID.Molecule}},
                        {title: 'By&nbspRes', cmd: 'color', data: {name: $.bionext.ColorMappingID.Residue}},
                        {title: 'By&nbspAtom', cmd: 'color', data: {name: $.bionext.ColorMappingID.Atom}},
                        {title: 'By&nbspCarbon&nbspAtom', cmd: 'color', data: {name: $.bionext.ColorMappingID.CarbonAtom}},
                        {title: 'By&nbspSecondary&nbspStructure', cmd: 'color', data: {name: $.bionext.ColorMappingID.SST}},
                        {title: 'By&nbspRes&nbspRainbow', cmd: 'color', data: {name: $.bionext.ColorMappingID.Rainbow}},
                        {title: 'By&nbspRes&nbspHydrophibicity', cmd: 'color', data: {name: $.bionext.ColorMappingID.Hydrophobicity}}
                    ]}, {title: 'Opacity', cmd: 'alpha', children: [
                        {title: '1', cmd: 'alpha', data: {value: 1.0}},
                        {title: '0.75', cmd: 'alpha', data: {value: 0.75}},
                        {title: '0.5', cmd: 'alpha', data: {value: 0.5}},
                        {title: '0.25', cmd: 'alpha', data: {value: 0.25}},
                        {title: '0', cmd: 'alpha', data: {value: 0}}
                    ]}
                ],
                select: function(event, ui) {
                    var data = ui.item.data();
                    var cmd = ui.cmd;

                    var residueName = $('#listResidues').val();
                    if (residueName === 'All') {
                        residueName = undefined;
                    }
                    var selectionChain = that._getSelectionChain($('#listStructures').val(), $('#listMolecules').val(), residueName);
                    var selection = that.bioviz.bioviz('getObjects3DFromSelection', selectionChain);

                    if (cmd === 'color') {
                        data = data.name;
                        that.bioviz.bioviz('colorBy', data, selection, ui.target[0].offsetParent.title);
                    } else if (cmd === 'alpha') {
                        data = data.value;
                        that.bioviz.bioviz('setAlpha', data, selection, ui.target[0].offsetParent.title);
                    }
                }
            });

            /*
             * Actions when clicking on buttons
             */
            $('#listMolecules').change(
                function() {
                    that.updateResidueList();
                    that.updateDisabledButtons();
                    that.updateSelection();
                }
            );
            $('#listStructures').change(
                function() {
                    that.updateMoleculeList();
                    that.updateResidueList();
                    that.updateSelection();
                }
            );
            $('#listResidues').change(
                function() {
                    that.updateDisabledButtons();
                    that.updateSelection();
                }
            );
            $('#listStructures').click(function() {
                that.updateSelection();
            });
            $('#toolbarLabels').click(
                function() {
                    if ($('#listStructures').val() === null) {
                        that.bioviz.bioviz('say', 'ERROR : there is no structure loaded');
                    } else {
                        var residueName = $('#listResidues').val();
                        if (residueName === 'All') {
                            residueName = undefined;
                        }
                        var selectionChain = that._getSelectionChain($('#listStructures').val(), $('#listMolecules').val(), residueName);
                        var selection = that.bioviz.bioviz('getObjects3DFromSelection', selectionChain);
                        if ($('#toolbarLabels').is(':checked')) {
                            that.bioviz.bioviz('showLabel', selection, $.bionext.LabelTypeID.RESIDUE);
                        } else {
                            that.bioviz.bioviz('hideLabel', selection, $.bionext.LabelTypeID.RESIDUE);
                        }

                    }
                }
            );
            var text = '';
            for (var i = 0; i < repr.length; i++) {
                text += '#toolbar' + repr[i].commandName + ', ';
            }
            text = text.substring(0, text.length - 2);
            $(text).click(
                function() {
                    if ($('#listStructures').val() === null) {
                        that.bioviz.bioviz('say', 'ERROR : there is no structure loaded');
                    } else {
                        var residueName = $('#listResidues').val();

                        if (residueName === 'All') {
                            residueName = undefined;
                        }

                        var selectionChain = that._getSelectionChain($('#listStructures').val(), $('#listMolecules').val(), residueName);
                        var selection = that.bioviz.bioviz('getObjects3DFromSelection', selectionChain);

                        if (this.checked) {
                            that.bioviz.bioviz('showRepresentation', selection, this.title);
                        } else {
                            that.bioviz.bioviz('hideRepresentation', selection, this.title);
                        }
                    }
                }
            );
            $('#toolbarDelete').click(
                function() {
                    $('#toolbarDelete')[0].checked = false;
                    if ($('#listStructures').val() === null) {
                        that.bioviz.bioviz('say', 'ERROR : there is no structure loaded');
                    } else {
                        that.bioviz.bioviz('deleteStructure', $('#listStructures').val());
                        that.updateToolbarSelection();
                    }
                }
            );
            $('#toolbarShowHide').click(
                function() {
                    if ($('#listStructures').val() === null) {
                        that.bioviz.bioviz('say', 'ERROR : there is no structure loaded');
                    } else {
                        var residueName = $('#listResidues').val();

                        if (residueName === 'All') {
                            residueName = undefined;
                        }

                        var selectionChain = that._getSelectionChain($('#listStructures').val(), $('#listMolecules').val(), residueName);
                        var selection = that.bioviz.bioviz('getObjects3DFromSelection', selectionChain);
                        if (this.checked) {
                            that.bioviz.bioviz('show', selection);
                        } else {
                            that.bioviz.bioviz('hide', selection);
                        }
                    }
                });
            $('#toolbarCenter').click(
                function() {
                    $('#toolbarCenter')[0].checked = false;
                    if ($('#listStructures').val() === null) {
                        that.bioviz.bioviz('say', 'ERROR : there is no structure loaded');
                    } else {
                        var selection = that.bioviz.bioviz('getObjects3DFromSelection', $('#listStructures').val());
                        that.bioviz.bioviz('centerOnSelection', selection);
                    }
                });
            $('#toolbarResetScene').click(
                function() {
                    $('#toolbarResetScene')[0].checked = false;
                    that.bioviz.bioviz('resetScene');
                    that.updateSelection();
                });
            $('#toolbarResetRepr').click(
                function() {
                    $('#toolbarResetRepr')[0].checked = false;
                    that.bioviz.bioviz('resetRepresentations');
                    that.updateSelection();
                });
            $('#toolbarResetHighlight').click(
                function() {
                    $('#toolbarResetHighlight')[0].checked = false;
                    that.bioviz.bioviz('resetHighlights');
                });
            $('#loadButton').click(
                function() {
                    that.bioviz.bioviz('loadStructure', $('#strToLoad').val()).catch(function(e) {
                        console.warn(e.message);
                    });
                });
            $('#strToLoad').bind('keypress', function(event) {
                if (event.which == 13) { // enter
                    that.bioviz.bioviz('loadStructure', $('#strToLoad').val()).catch(function(e) {
                        console.warn(e.message);
                    });
                }
            });
            $('#RCSB').on('click', function() {
                if ((that.pdbCustomUrl != null && !$('#PDBX').prop('checked')) ||
                    (that.pdbxCustomUrl != null && $('#PDBX').prop('checked'))) {
                    that._updateUrlTemplate();
                }
            });

            $('#PDBX').click(
                function() {
                    if ($('#PDBX').is(':checked')) {
                        $('#RCSB').prop('disabled', that.pdbxCustomUrl == null);
                    } else {
                        $('#RCSB').prop('disabled', that.pdbCustomUrl == null);
                    }
                    that._updateUrlTemplate();
                }
            );

            // Check and enable/disable RCSB checkbox depending on customUrl for PDBX
            var hasCustomUrl = (this.pdbxCustomUrl == null && $('#PDBX').is(':checked')) ||
                                (this.pdbCustomUrl == null && !$('#PDBX').is(':checked'));
            $('#RCSB').prop('checked', hasCustomUrl);
            $('#RCSB').prop('disabled', hasCustomUrl);

            this._updateUrlTemplate();

            // Callback to update external widgets when bioviz notifies something
            this.bioviz.bioviz('addListener', 'structureLoaded', function(event) {
                that.updateToolbarSelection(event.data);
            });
            this.bioviz.bioviz('addListener', 'targetChanged', function(event) {
                that.updateToolbarSelection(event.data);
                that.updateDisabledButtons();
            });
            this.bioviz.bioviz('addListener', 'atomMouseOver', function(event) {
                that.changeMouseSelection(event.data);
            });

            /*
             * DEBUG FOR CAPTURE
             */
            if (that.debug) {
                $('#CAPTURE').click(
                    function() {
                        if ($('#listStructures').val() === null) {
                            that.bioviz.bioviz('say', 'ERROR : there is no structure loaded');
                        } else {
                            that.bioviz.bioviz('capturePosition', $('#listStructures').val());
                        }
                    }
                );
            }
            /*
             * END DEBUG FOR CAPTURE
             */
        }
    });
}(jQuery));
