# imagemap 1.13.3 (released 2025-07-16)
- Update README to remove REDCap version number from Prequisites section. (@pbchase)

# imagemap 1.13.2 (released 2025-07-16)
- Remove eval from imageMapster.js (@saipavan10-git, #70, #85)
- Prevent duplicate images when switch lamnguage with MLM (@saipavan10-git, #80, #85)
- Upgrade framework version to 16 (@saipavan10-git, #84, #85)

# imagemap 1.13.1 (released 2025-06-24)
- Update broken documentation links (@saipavan10-git, #81, #82, #83)

# imagemap 1.13.0 (released 2024-06-11)
- Add Grids Body Map (@schatto1, @saipavan10-git, @pbchase, #76, #77)
- Rename instrument example files (@pbchase, #77)
- Remove Andy Martin from config.json (@ChemiKyle)

## [1.12.0] - 2024-02-20
### Added
- Add NONEOFTHEABOVE tags to example project (@ChemiKyle)
- Add deselection of imagemap regions when using NONEOFTHEABOVE action tag (@ChemiKyle)


## [1.11.0] - 2023-09-01
### Added
- Add Ladder imagemap requested by Yunfeng Dai (Kyle Chesney)

### Changed
- Bump framework version to 14 to accommodate lack of permissions section update UF contact info (Kyle Chesney)
- Refactored name of Choir Body Map from `PAINMAP` to `CHOIRBODYMAP`.  Both names continue to work but new images and documentation support `CHOIRBODYMAP` as tha image tag.


## [1.10.1] - 2023-01-09
### Changed
- bug fix for surveys (Andrew Martin)


## [1.10.0] - 2023-01-05
### Changed
- Updated to framework 9 (which means minimum REDCap version for this release is 12.0.4)
- Substantially refactored to use JSMO for client-side javascript and to be more selective about when actions are performed to help with future debugging
- Addressed bug in radio button selection that would prevent actual redcap radio input from being set correctly (see https://community.projectredcap.org/questions/139920/imagemap-em-single-selection-fails-when-changing-s.html)
- Addressed bug (not documented) where changes to checkbox fields from the UI (e.g. _OPTIONS version of maps) were not updating the imagemap.

### Added
- Introduced project-level setting to output console logs on a per-project basis
- Two maps (photoform and a facemap) - Ryan Valentine
- The EM now hides the input form until all maps have been rendered and inputs hidden to reduce flicker on the client side


## [1.9.1] - 2022-02-18
### Added
- Add example project xml (Michael Bentz)

## Changed
- Fix vertically mirrored element-wise coordinates for right half of TEETH_SURFACE image (Kyle Chensey)
- Add missing keys and enums for TEETH_SURFACE docs (Michael Bentz)
- Update Instrument Example.zip to include all options for TEETH_SURFACE (Kyle Chesney)


## [1.9.0] - 2021-06-21
### Added
- Add Dermatology photo upload body image (Jae Lee)

## Changed
- fix issue causing limit to number of imagemaps per page (Andrew Martin)
- partially fixes issues with checkbox fields (Andrew Martin)
- updated citation for painmap (Andrew Martin)


## [1.8.0] - 2021-03-16
### Added
- add option to use api urls (Andrew Martin)


## [1.7.0] - 2020-10-20
### Added
- Add fibromyalgia map (willsvankumc)
- Add FR_REGION IMAGEMAP (hpotier)

## Changed
- interrupt an infinite loop on radio buttons in later redcap versions (Kyle Chesney)
- Fix 'Deselect Issues #52' in later redcap versions (Kyle Chesney)


## [1.6.0] - 2020-08-17
### Added
- Reduce mbody image size by 50% (willsvankumc)
- Adds Authors File and ReadMe adjustment (James Pence)
- Adds PI-RADS V2.1 (Geoffroey-Allen Franklin)
- Adds DO-Touch.NET OMT bodymap (Geoffroey-Allen Franklin)


## [1.5.0] - 2020-07-06
### Added
- Add 66 Swollen 68 Tender Joint Count Map (tom.lynch)


## [1.4.4] - 2019-12-06
### Added
- Add DOI to README (Philip Chase)


## [1.4.3] - 2019-12-04
### Added
- Improve documentation. (Geoffroey-Allen Franklin)
- Add DO-Touch.NET images, maps, and description. (Geoffroey-Allen Franklin)
- Standardize DO-Touch.NET filenames. (Marly Gotti)

### Changed
- Use noauth but NOT api endpoint to load JS files (Kyle Chesney)


## [1.4.2] - 2019-06-27
### Added
- Add description and copyright information for the mbody and va_char imagemaps. (Marly Cormar)
- Include image info and standarize maps. (Marly Cormar)
- Add new imagemap va_chart and its info to the README.md (Marly Cormar)
- Add pirads to instrument example (Kyle Chesney)
- Add mbody image, update sample instrument, and modify config.json accordinglu. (Marly Cormar)
- Include 5_face_painmap on the sample instrument. (Marly Cormar)
- add description of new face painmap (Kyle Chesney)

## Changed
- Correct path to example instrument in the documentation.php and the README.md. (Marly Cormar)
- Rename rheumatoid_man_map.html file to rheumatoid_man.html. (Marly Cormar)
- Update 5_face_painmap image name on the README.md. (Marly Cormar)
- Rename 5_face_painscale.png to 5_face_painmap.png to maintain module aesthetic standards. (Marly Cormar)
- update README to show painmap from lewisa2, fix markdown formatting (Kyle Chesney)
- create developer notes to describe state of ImageMapster use (Kyle Chesney)
- Create 5_face_painmap.html (lewisa2)
- Fix function call by referencing the object on which it was defined. (Marly Cormar)


## [1.4.1] - 2019-06-06
### Changed
- Remove dangling map tag. (Marly Cormar)


## [1.4.0] - 2019-04-17
### Changed
- Aesthetic changes to the documentation. (Marly Cormar)
- Update text about Rheumatoid Man (Philip Chase)
- Update docs and config.json for Rheumatoid man and example instrument (Philip Chase)
- Update example instrument and remove duplication. (Marly Cormar)
- Include example for RHEUMATOID_MAN. (Marly Cormar)
- Document new imagemap RHEUMATOID_MAN. (Marly Cormar)
- Include rheumatoid_man in the config.json (BlaineVlan)
- Added Rheumatoid Man imagemap and rheumatoid_man_map.html (BlaineVlan)
- Add small formatting changes (Will Beasley)


## [1.3.1] - 2018-09-06
### Changed
- Adding attribution for PIRADS images to Dr. Fan (Andrew Martin)
- Update attribution for ITHS at request of Bas. (Andrew Martin)
- Make the description text smaller so as to be more compaitble with other modules when enabling/disabling EMs. (Andrew Martin)


## [1.3.0] - 2018-08-30
### Added
- Include new PIRADS, PAINMAP_MALE_NO_ALT, and PAINMAP_FEMALE_NO_ALT imagemaps (Andy Martin)


## [1.2.2] - 2018-08-30
### Changed
- Fixed issue #14 'Module does not work in 8.7.X (bootstrap 4 and jquery3)' (Marly Cormar)


## [1.2.1] - 2018-04-11
### Changed
- Reduce config.json description (Marly Cormar)
- minor updates to attributions (Andy Martin)


## [1.2.0] - 2018-02-05
### Added
- Add image maps from Bas de Veer (Andy Martin)
- Add an example data dictionary instrument to illustrate how it works (Andy Martin)
- Add documentation link (Andy Martin)

## Changed
- Fixed mapping issue between area map and data dictionary for painmap_male/female (Andy Martin)
- Fixed issue with mapping of female bodymap and example.zip (Andy Martin)
- Realign coordinates on female front mid-body with the proper labels (Philip Chase)
- Fixed bug for selecting checkbox/radio options by label (Andy Martin)


## [1.1.0] - 2018-01-31
### Added
- Rename to 'imagemap' (Andy Martin)
- Add support for more image maps (Andy Martin)
- Make existing male, female, and smiley image maps default image maps (Andy Martin)

### Changed
- Set the minimum REDCap version required to 8.0.3 due to semantic versioning on this module (Philip Chase)
- conversion into single object for namespacing (Andy Martin)


## [1.0.0] - 2018-01-28
### Summary
 - Created a REDCap module from Andy Martin's Painmap REDCap hook.
 - The module presents one of three images as an imagemap to solicit feedback on pain from a REDCap survey participant.
